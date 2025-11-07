import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, FileText } from 'lucide-react';
import Layout from '@/components/Layout';

interface LegalPageData {
  id: string;
  page_type: string;
  title: string;
  content: string;
  updated_at: string;
}

const pageTypes = {
  'aviso_legal': {
    title: 'Aviso Legal',
    path: '/aviso-legal',
    description: 'Información legal y condiciones de uso'
  },
  'politica_privacidad': {
    title: 'Política de Privacidad',
    path: '/politica-privacidad',
    description: 'Cómo protegemos y gestionamos tus datos'
  },
  'politica_cookies': {
    title: 'Política de Cookies',
    path: '/politica-cookies',
    description: 'Información sobre el uso de cookies'
  }
};

interface LegalPageProps {
  pageType: 'aviso_legal' | 'politica_privacidad' | 'politica_cookies';
}

function LegalPageComponent({ pageType }: LegalPageProps) {
  const [pageData, setPageData] = useState<LegalPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPageInfo = pageTypes[pageType];

  console.log('LegalPageComponent rendering with pageType:', pageType, 'currentPageInfo:', currentPageInfo);

  useEffect(() => {
    const fetchLegalPage = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching legal page for type:', pageType);
        
        const { data, error } = await supabase
          .from('legal_pages')
          .select('id, page_type, title, content, updated_at')
          .eq('page_type', pageType)
          .single();

        if (error) {
          console.error('Error fetching legal page:', error);
          console.error('Error details:', error.message);
          setError(`Error al cargar el contenido: ${error.message}`);
        } else {
          console.log('Legal page data loaded:', data);
          if (!data) {
            setError('No se encontró el contenido de la página');
          } else {
            setPageData(data);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Error inesperado al cargar la página');
      } finally {
        setLoading(false);
      }
    };

    fetchLegalPage();
  }, [pageType]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="flex items-center space-x-3 text-muted-foreground">
            <FileText className="h-6 w-6 animate-pulse" />
            <span>Cargando contenido legal...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !pageData || !currentPageInfo) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-xl">⚠️</div>
            <h2 className="text-2xl font-semibold text-foreground">Página no encontrada</h2>
            <p className="text-muted-foreground max-w-md">
              {error || 'La página legal que buscas no existe o no está disponible.'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al inicio</span>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Inicio</Link></li>
            <li>/</li>
            <li className="text-foreground">{currentPageInfo.title}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">{pageData.title}</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-4">
            {currentPageInfo.description}
          </p>
          <div className="text-sm text-muted-foreground">
            Última actualización: {new Date(pageData.updated_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <div 
            className="prose prose-slate dark:prose-invert max-w-none
                     prose-headings:text-foreground 
                     prose-p:text-muted-foreground
                     prose-strong:text-foreground
                     prose-a:text-primary hover:prose-a:text-primary/80
                     prose-ul:text-muted-foreground
                     prose-li:text-muted-foreground
                     prose-li:marker:text-muted-foreground
                     prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-foreground
                     prose-h3:text-xl prose-h3:font-semibold prose-h3:text-foreground
                     transition-colors duration-300"
            dangerouslySetInnerHTML={{ __html: pageData.content }}
          />
        </div>

        {/* Navigation to other legal pages */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Otras páginas legales</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(pageTypes)
              .filter(([key]) => key !== pageType)
              .map(([key, info]) => (
                <Link
                  key={key}
                  to={info.path}
                  className="p-4 border border-border rounded-lg hover:bg-muted transition-colors duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-primary group-hover:text-primary/80" />
                    <div>
                      <h4 className="font-medium text-foreground group-hover:text-primary">
                        {info.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-3">¿Necesitas más información?</h3>
          <p className="text-muted-foreground mb-3">
            Si tienes preguntas sobre estas páginas legales, no dudes en contactarnos.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href="mailto:contacto@fulmega.eu"
              className="text-primary hover:text-primary/80 underline"
            >
              contacto@fulmega.eu
            </a>
            {pageType === 'politica_privacidad' && (
              <a
                href="mailto:privacidad@fulmega.eu"
                className="text-primary hover:text-primary/80 underline"
              >
                privacidad@fulmega.eu
              </a>
            )}
            {pageType === 'politica_cookies' && (
              <a
                href="mailto:cookies@fulmega.eu"
                className="text-primary hover:text-primary/80 underline"
              >
                cookies@fulmega.eu
              </a>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Create specific page components
export function AvisoLegalPage() {
  console.log('AvisoLegalPage component rendering');
  return <LegalPageComponent pageType="aviso_legal" />;
}

export function PoliticaPrivacidadPage() {
  console.log('PoliticaPrivacidadPage component rendering');
  return <LegalPageComponent pageType="politica_privacidad" />;
}

export function PoliticaCookiesPage() {
  console.log('PoliticaCookiesPage component rendering');
  return <LegalPageComponent pageType="politica_cookies" />;
}

// Default export for backward compatibility
export default function LegalPage() {
  console.log('Default LegalPage component rendering');
  return <LegalPageComponent pageType="aviso_legal" />;
}