/**
 * Migrador simple de Supabase Storage (Cloud → Self‑Hosted)
 * Requiere: @supabase/supabase-js y dotenv
 *
 * ⚠️ Usa SERVICE_ROLE keys en ambas instancias.
 *    No expongas estas claves en frontend.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SRC_URL = process.env.SRC_URL;
const SRC_SERVICE_ROLE = process.env.SRC_SERVICE_ROLE;
const TGT_URL = process.env.TGT_URL;
const TGT_SERVICE_ROLE = process.env.TGT_SERVICE_ROLE;
const BUCKETS = (process.env.BUCKETS || '').split(',').map(s => s.trim()).filter(Boolean);

if (!SRC_URL || !SRC_SERVICE_ROLE || !TGT_URL || !TGT_SERVICE_ROLE) {
  console.error('Faltan variables: SRC_URL, SRC_SERVICE_ROLE, TGT_URL, TGT_SERVICE_ROLE');
  process.exit(1);
}

const src = createClient(SRC_URL, SRC_SERVICE_ROLE, { auth: { persistSession: false } });
const tgt = createClient(TGT_URL, TGT_SERVICE_ROLE, { auth: { persistSession: false } });

const TMP = path.resolve('.tmp_storage');
fs.mkdirSync(TMP, { recursive: true });

async function listBuckets(client) {
  const { data, error } = await client.storage.listBuckets();
  if (error) throw error;
  return data;
}

async function ensureBucket(client, bucket) {
  const { data: existing, error: listErr } = await client.storage.listBuckets();
  if (listErr) throw listErr;
  if (!existing.find(b => b.name === bucket.name)) {
    const { error } = await client.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.file_size_limit || null,
      allowedMimeTypes: bucket.allowed_mime_types || null
    });
    if (error) throw error;
    console.log(`[+] Creado bucket en destino: ${bucket.name}`);
  }
}

async function listAllObjects(client, bucket) {
  // Paginación simple
  const PAGE = 1000;
  let from = 0, all = [];
  while (true) {
    const { data, error } = await client.storage.from(bucket).list('', { limit: PAGE, offset: from, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw error;
    if (!data.length) break;
    all = all.concat(data);
    from += PAGE;
    if (data.length < PAGE) break;
  }
  return all;
}

async function downloadObject(client, bucket, name) {
  const { data, error } = await client.storage.from(bucket).download(name);
  if (error) throw error;
  const outPath = path.join(TMP, bucket, name);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, Buffer.from(await data.arrayBuffer()));
  return outPath;
}

async function uploadObject(client, bucket, name, filePath) {
  const file = fs.readFileSync(filePath);
  const { error } = await client.storage.from(bucket).upload(name, file, { upsert: true });
  if (error) throw error;
}

async function main() {
  const buckets = await listBuckets(src);
  const toProcess = BUCKETS.length ? buckets.filter(b => BUCKETS.includes(b.name)) : buckets;

  for (const b of toProcess) {
    console.log(`
== Bucket: ${b.name} ==`);
    await ensureBucket(tgt, b);
    const objects = await listAllObjects(src, b.name);

    for (const obj of objects) {
      if (obj.id || obj.name) {
        const name = obj.name;
        try {
          const downloaded = await downloadObject(src, b.name, name);
          await uploadObject(tgt, b.name, name, downloaded);
          console.log(`  ✓ ${name}`);
        } catch (e) {
          console.warn(`  ✗ ${name}:`, e.message);
        }
      }
    }
  }

  console.log('\nHecho. Archivos temporales en', TMP);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
