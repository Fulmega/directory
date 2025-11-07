import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { FulmegaLogoFooter } from './FulmegaLogo';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2 lg:grid-cols-4 text-sm leading-6 text-slate-300">
          {/* Marca */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <img src="/public/logos/fulmega_favicon.png" alt="Fulmega" className="h-6 w-6 rounded" />
              <span className="font-semibold text-slate-100">Fulmega.eu</span>
            </div>
            <p className="text-slate-400">
              Directorio personal de herramientas de IA y productividad.
            </p>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Fulmega.eu. Todos los derechos reservados.
            </p>
          </div>

          {/* Páginas legales */}
          <div>
            <h3 className="text-slate-100 font-semibold text-sm mb-2">Páginas Legales</h3>
            <ul className="space-y-1">
              <li><a className="hover:text-slate-100" href="/legal/aviso-legal">Aviso Legal</a></li>
              <li><a className="hover:text-slate-100" href="/legal/condiciones">Condiciones de uso</a></li>
              <li><a className="hover:text-slate-100" href="/legal/privacidad">Política de Privacidad</a></li>
              <li><a className="hover:text-slate-100" href="/legal/cookies">Política de Cookies</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-slate-100 font-semibold text-sm mb-2">Contacto</h3>
            <ul className="space-y-1">
              <li>Información General: <a className="hover:text-slate-100" href="mailto:contacto@fulmega.eu">contacto@fulmega.eu</a></li>
              <li>Privacidad y Datos: <a className="hover:text-slate-100" href="mailto:privacidad@fulmega.eu">privacidad@fulmega.eu</a></li>
              <li>Cookies: <a className="hover:text-slate-100" href="mailto:cookies@fulmega.eu">cookies@fulmega.eu</a></li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h3 className="text-slate-100 font-semibold text-sm mb-2">Información</h3>
            <ul className="space-y-1">
              <li><span className="text-slate-400">Plataforma:</span> Directorio de herramientas de IA</li>
              <li><span className="text-slate-400">Tecnología:</span> React, TypeScript, Supabase</li>
              <li><span className="text-slate-400">Región:</span> Cumplimiento RGPD</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Banda inferior compacta */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
            <a className="hover:text-slate-100" href="/legal/aviso-legal">Aviso Legal</a>
            <a className="hover:text-slate-100" href="/legal/privacidad">Privacidad</a>
            <a className="hover:text-slate-100" href="/legal/cookies">Cookies</a>
            <a className="hover:text-slate-100" href="/contacto">Contacto</a>
          </nav>
          <div className="text-xs text-slate-500">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </div>
        </div>
      </div>
    </footer>
  );
}