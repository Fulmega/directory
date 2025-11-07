import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { FulmegaLogoFooter } from './FulmegaLogo';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border transition-colors duration-300 mt-8">
      {/* contenedor más compacto */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* grid compacta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Logo y descripción */}
          <div className="col-span-1">
            <div className="mb-3">
              <FulmegaLogoFooter className="hover:scale-105 transition-transform duration-200" />
            </div>
            <p className="text-muted-foreground text-xs leading-6 mb-3">
              Directorio personal de herramientas de inteligencia artificial y productividad.
              Descubre, organiza y gestiona las mejores herramientas para tu trabajo diario.
            </p>
            <p className="text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} Fulmega.eu. Todos los derechos reservados.
            </p>
          </div>

          {/* Páginas legales */}
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-2">Páginas Legales</h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link
                  to="/aviso-legal"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 block"
                >
                  Aviso Legal
                </Link>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Condiciones de uso y responsabilidad legal
                </p>
              </li>
              <li>
                <Link
                  to="/politica-privacidad"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 block"
                >
                  Política de Privacidad
                </Link>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Protección de datos personales y derechos
                </p>
              </li>
              <li>
                <Link
                  to="/politica-cookies"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 block"
                >
                  Política de Cookies
                </Link>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Uso de cookies y herramientas de seguimiento
                </p>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-2">Contacto</h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <h4 className="font-medium text-foreground mb-0.5">Información General</h4>
                <a
                  href="mailto:contacto@fulmega.eu"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 block"
                >
                  contacto@fulmega.eu
                </a>
              </li>
              <li>
                <h4 className="font-medium text-foreground mb-0.5">Privacidad y Datos</h4>
                <a
                  href="mailto:privacidad@fulmega.eu"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 block"
                >
                  privacidad@fulmega.eu
                </a>
              </li>
              <li>
                <h4 className="font-medium text-foreground mb-0.5">Cookies</h4>
                <a
                  href="mailto:cookies@fulmega.eu"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 block"
                >
                  cookies@fulmega.eu
                </a>
              </li>
            </ul>
          </div>

          {/* Información adicional */}
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-2">Información</h3>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-0.5">Plataforma</h4>
                <p className="text-xs">Directorio de herramientas de IA para productividad y organización.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-0.5">Tecnología</h4>
                <p className="text-xs">Desarrollado con React, TypeScript, Supabase y tecnologías modernas.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-0.5">Región</h4>
                <p className="text-xs">España - Cumplimiento con RGPD y legislación europea.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Línea separadora y banda inferior compacta */}
        <div className="border-t border-border pt-4 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <Link
                to="/aviso-legal"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Aviso Legal
              </Link>
              <Link
                to="/politica-privacidad"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Política de Privacidad
              </Link>
              <Link
                to="/politica-cookies"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Política de Cookies
              </Link>
              <a
                href="mailto:contacto@fulmega.eu"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1"
              >
                Contacto
                <ExternalLink className="h-3 w-3" />
              </a>
            </nav>

            <div className="text-xs text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
