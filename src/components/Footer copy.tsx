import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { FulmegaLogoFooter } from './FulmegaLogo';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border transition-colors duration-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <FulmegaLogoFooter className="hover:scale-105 transition-transform duration-200" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Directorio personal de herramientas de inteligencia artificial y productividad. 
              Descubre, organiza y gestiona las mejores herramientas para tu trabajo diario.
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 Fulmega.eu. Todos los derechos reservados.
            </p>
          </div>

          {/* Enlaces a páginas legales */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Páginas Legales</h3>
            <div className="space-y-3 text-sm">
              <div>
                <Link 
                  to="/aviso-legal"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 block"
                >
                  Aviso Legal
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                  Condiciones de uso y responsabilidad legal
                </p>
              </div>
              
              <div>
                <Link 
                  to="/politica-privacidad"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 block"
                >
                  Política de Privacidad
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                  Protección de datos personales y derechos
                </p>
              </div>

              <div>
                <Link 
                  to="/politica-cookies"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 block"
                >
                  Política de Cookies
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                  Uso de cookies y herramientas de seguimiento
                </p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contacto</h3>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-1">Información General</h4>
                <a 
                  href="mailto:contacto@fulmega.eu" 
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 block"
                >
                  contacto@fulmega.eu
                </a>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-1">Privacidad y Datos</h4>
                <a 
                  href="mailto:privacidad@fulmega.eu" 
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 block"
                >
                  privacidad@fulmega.eu
                </a>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-1">Cookies</h4>
                <a 
                  href="mailto:cookies@fulmega.eu" 
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 block"
                >
                  cookies@fulmega.eu
                </a>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Información</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-1">Plataforma</h4>
                <p>Directorio de herramientas de IA para productividad y organización.</p>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-1">Tecnología</h4>
                <p>Desarrollado con React, TypeScript, Supabase y tecnologías modernas.</p>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-1">Región</h4>
                <p>España - Cumplimiento con RGPD y legislación europea.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Línea separadora y enlaces legales */}
        <div className="border-t border-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-6 text-sm">
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
            </div>
            
            <div className="text-sm text-muted-foreground">
              Última actualización: 6 de noviembre de 2025
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}