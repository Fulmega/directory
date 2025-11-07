/**
 * Supabase Storage Migrator (Cloud → Self‑Hosted)
 * ------------------------------------------------
 * Uso (Windows / macOS / Linux):
 *   1) En tu proyecto, crea carpeta: fulmega/tools/migrate/
 *   2) Guarda este archivo como: fulmega/tools/migrate/storage_migrate.js
 *   3) Crea fulmega/tools/migrate/.env con:
 *        SRC_URL=https://<cloud-project-ref>.supabase.co
 *        SRC_SERVICE_ROLE=eyJhbGciOi... (cloud)
 *        TGT_URL=https://<tu-dominio-selfhosted>
 *        TGT_SERVICE_ROLE=eyJhbGciOi... (self-hosted)
 *        # Opcionales:
 *        # BUCKETS=public,avatars   (si quieres filtrar)
 *        # DRY_RUN=true             (no sube nada, solo simula)
 *        # CONCURRENCY=4            (subidas simultáneas)
 *   4) En fulmega/tools/migrate/ ejecuta:
 *        npm init -y
 *        npm i @supabase/supabase-js dotenv
 *        node storage_migrate.js
 *
 * Notas:
 *  - Usa SERVICE_ROLE (no ANON) porque se requieren permisos de admin.
 *  - El script crea los buckets que falten en destino y sube con upsert.
 *  - Soporta carpetas anidadas recorriendo recursivamente (list por prefijo).
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ===== Config =====
const SRC_URL = process.env.SRC_URL;
const SRC_SERVICE_ROLE = process.env.SRC_SERVICE_ROLE;
const TGT_URL = process.env.TGT_URL;
const TGT_SERVICE_ROLE = process.env.TGT_SERVICE_ROLE;
const BUCKETS = (process.env.BUCKETS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const DRY_RUN = /^true$/i.test(process.env.DRY_RUN || '');
const CONCURRENCY = Math.max(1, parseInt(process.env.CONCURRENCY || '4', 10));

function requireEnv(name, value) {
  if (!value) {
    console.error(`Falta variable ${name} en .env`);
    process.exit(1);
  }
}
requireEnv('SRC_URL', SRC_URL);
requireEnv('SRC_SERVICE_ROLE', SRC_SERVICE_ROLE);
requireEnv('TGT_URL', TGT_URL);
requireEnv('TGT_SERVICE_ROLE', TGT_SERVICE_ROLE);

const src = createClient(SRC_URL, SRC_SERVICE_ROLE, { auth: { persistSession: false } });
const tgt = createClient(TGT_URL, TGT_SERVICE_ROLE, { auth: { persistSession: false } });

const TMP = path.resolve('.tmp_storage');
fs.mkdirSync(TMP, { recursive: true });

// Helpers
const posixJoin = (...parts) => parts.filter(Boolean).join('/').replace(/\\/g, '/');

async function listBuckets(client) {
  const { data, error } = await client.storage.listBuckets();
  if (error) throw error;
  return data || [];
}

async function ensureBucket(client, bucket) {
  const { data: existing, error: listErr } = await client.storage.listBuckets();
  if (listErr) throw listErr;
  if (!existing?.find((b) => b.name === bucket.name)) {
    const { error } = await client.storage.createBucket(bucket.name, {
      public: !!bucket.public,
      fileSizeLimit: bucket.file_size_limit || null,
      allowedMimeTypes: bucket.allowed_mime_types || null,
    });
    if (error) throw error;
    console.log(`[+] Creado bucket destino: ${bucket.name}`);
  }
}

async function listFolder(client, bucket, prefix = '', limit = 1000, offset = 0) {
  // Lista una "carpeta" (prefijo). Supabase devuelve objetos y subcarpetas en ese nivel.
  const { data, error } = await client.storage
    .from(bucket)
    .list(prefix, { limit, offset, sortBy: { column: 'name', order: 'asc' } });
  if (error) throw error;
  return data || [];
}

async function* walkAllObjects(client, bucket) {
  // Recorrido DFS por carpetas usando list(prefix)
  const stack = ['']; // cadena vacía = raíz del bucket
  while (stack.length) {
    const prefix = stack.pop();
    let offset = 0;
    const page = 1000;
    while (true) {
      const entries = await listFolder(client, bucket, prefix, page, offset);
      if (!entries.length) break;
      for (const e of entries) {
        if (e.id && e.name === '') continue; // defensivo
        if (e.metadata?.isDirectory || e.name?.endsWith('/')) {
          // Algunas versiones marcan carpetas así; si no, usamos e as folder si no tiene size
        }
        if (e.name && e.created_at === undefined && e.updated_at === undefined && e.last_accessed_at === undefined && e.id === undefined) {
          // Nada especial
        }
        if (e.name && e.id === undefined && e.size === undefined) {
          // Heurística, pero mejor comprobamos con un truco: si tiene propiedad 'id' normalmente es file.
        }
        // Supabase list() devuelve objetos tipo { name, id?, updated_at?, created_at?, last_accessed_at?, metadata?, ... }
        // No hay bandera explícita de carpeta; las carpetas se simulan por prefijo y aparecen como entries sin id.
        const isFolder = !e.id && !e.size; // aproximación suficiente
        if (isFolder) {
          // Empuja subcarpeta
          const sub = posixJoin(prefix, e.name);
          stack.push(sub);
        } else {
          const full = posixJoin(prefix, e.name);
          yield full; // ruta relativa dentro del bucket
        }
      }
      if (entries.length < page) break;
      offset += page;
    }
  }
}

async function downloadObject(client, bucket, name) {
  const { data, error } = await client.storage.from(bucket).download(name);
  if (error) throw error;
  const outPath = path.join(TMP, bucket, name);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const buf = Buffer.from(await data.arrayBuffer());
  fs.writeFileSync(outPath, buf);
  return outPath;
}

async function uploadObject(client, bucket, name, filePath) {
  const file = fs.readFileSync(filePath);
  const { error } = await client.storage.from(bucket).upload(name, file, { upsert: true });
  if (error) throw error;
}

async function withConcurrency(items, limit, worker) {
  let i = 0, active = 0, done = 0, failed = 0;
  return new Promise((resolve) => {
    const next = () => {
      while (active < limit && i < items.length) {
        const idx = i++;
        active++;
        worker(items[idx])
          .then(() => { done++; })
          .catch((e) => { failed++; console.warn(`  ✗ ${items[idx]} — ${e.message}`); })
          .finally(() => {
            active--;
            if (done + failed === items.length) resolve({ done, failed });
            else next();
          });
      }
    };
    if (items.length === 0) resolve({ done: 0, failed: 0 });
    else next();
  });
}

(async function main() {
  console.log('== Verificando acceso a origen y destino ==');
  const [srcBuckets, tgtBuckets] = await Promise.all([listBuckets(src), listBuckets(tgt)]);
  console.log(`Origen: ${srcBuckets.length} buckets`);
  console.log(`Destino: ${tgtBuckets.length} buckets`);

  const candidates = BUCKETS.length ? srcBuckets.filter((b) => BUCKETS.includes(b.name)) : srcBuckets;
  if (BUCKETS.length && candidates.length === 0) {
    console.log('No se encontraron buckets que coincidan con BUCKETS.');
    return;
  }

  for (const b of candidates) {
    console.log(`\n== Bucket: ${b.name} ==`);
    await ensureBucket(tgt, b);

    // Recolectar objetos (rutas) de forma recursiva
    const all = [];
    for await (const key of walkAllObjects(src, b.name)) all.push(key);

    if (!all.length) {
      console.log('  (Vacío)');
      continue;
    }

    console.log(`  Objetos a copiar: ${all.length}`);

    if (DRY_RUN) {
      for (const k of all.slice(0, 20)) console.log(`  • ${k}`);
      if (all.length > 20) console.log(`  • ... (${all.length - 20} más)`);
      console.log('DRY_RUN=true — no se subió nada.');
      continue;
    }

    // Descarga + subida con concurrencia
    const results = await withConcurrency(all, CONCURRENCY, async (key) => {
      const tmpFile = await downloadObject(src, b.name, key);
      await uploadObject(tgt, b.name, key, tmpFile);
    });

    console.log(`  ✓ Copiados: ${results.done} — ✗ Fallidos: ${results.failed}`);
  }

  console.log('\nHecho.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
