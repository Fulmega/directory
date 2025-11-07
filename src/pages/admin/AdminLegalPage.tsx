import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { 
  Save, 
  FileText, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  Eye,
  Edit3
} from 'lucide-react';

interface LegalPageData {
  id: string;
  page_type: string;
  title: string;
  content: string;
  updated_at: string;
  created_at: string;
}

const pageTypes = {
  'aviso_legal': {
    title: 'Aviso Legal',
    description: 'Información legal, condiciones de uso y responsabilidad',
    email: 'contacto@fulmega.eu'
  },
  'politica_privacidad': {
    title: 'Política de Privacidad',
    description: 'Protección de datos personales y derechos del usuario',
    email: 'privacidad@fulmega.eu'
  },
  'politica_cookies': {
    title: 'Política de Cookies',
    description: 'Uso de cookies y herramientas de seguimiento',
    email: 'cookies@fulmega.eu'
  }
};

export default function AdminLegalPage() {
  const [pages, setPages] = useState<Record<string, LegalPageData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string>('aviso_legal');
  const [editData, setEditData] = useState<Record<string, { title: string; content: string }>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchLegalPages();
  }, []);

  useEffect(() => {
    // Initialize edit data when pages are loaded
    if (Object.keys(pages).length > 0) {
      const initialEditData: Record<string, { title: string; content: string }> = {};
      Object.entries(pages).forEach(([key, page]) => {
        initialEditData[key] = {
          title: page.title,
          content: page.content
        };
      });
      setEditData(initialEditData);
    }
  }, [pages]);

  const fetchLegalPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_pages')
        .select('*')
        .order('page_type');

      if (error) {
        console.error('Error fetching legal pages:', error);
        setMessage({ type: 'error', text: 'Error al cargar las páginas legales' });
      } else {
        const pagesMap: Record<string, LegalPageData> = {};
        data?.forEach((page) => {
          pagesMap[page.page_type] = page;
        });
        setPages(pagesMap);
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage({ type: 'error', text: 'Error inesperado al cargar las páginas' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pageType: string) => {
    if (!editData[pageType]) return;

    try {
      setSaving(pageType);
      
      const { data, error } = await supabase
        .from('legal_pages')
        .update({
          title: editData[pageType].title,
          content: editData[pageType].content,
          updated_at: new Date().toISOString()
        })
        .eq('page_type', pageType)
        .select()
        .single();

      if (error) {
        console.error('Error saving legal page:', error);
        setMessage({ type: 'error', text: 'Error al guardar los cambios' });
      } else {
        // Update local state
        setPages(prev => ({
          ...prev,
          [pageType]: data
        }));
        setMessage({ type: 'success', text: 'Cambios guardados correctamente' });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage({ type: 'error', text: 'Error inesperado al guardar' });
    } finally {
      setSaving(null);
    }
  };

  const handleInputChange = (pageType: string, field: 'title' | 'content', value: string) => {
    setEditData(prev => ({
      ...prev,
      [pageType]: {
        ...prev[pageType],
        [field]: value
      }
    }));
  };

  const hasChanges = (pageType: string) => {
    if (!pages[pageType] || !editData[pageType]) return false;
    return (
      pages[pageType].title !== editData[pageType].title ||
      pages[pageType].content !== editData[pageType].content
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="flex items-center space-x-3 text-muted-foreground">
            <FileText className="h-6 w-6 animate-pulse" />
            <span>Cargando páginas legales...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Páginas Legales</h1>
          </div>
          <p className="text-muted-foreground">
            Gestiona el contenido de las páginas legales del sitio web. Estas páginas son visibles públicamente.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4 sticky top-4">
              <h3 className="font-semibold text-foreground mb-4">Páginas Legales</h3>
              <nav className="space-y-2">
                {Object.entries(pageTypes).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setActivePage(key)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                      activePage === key
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">{info.title}</div>
                    <div className="text-xs opacity-80 mt-1">{info.description}</div>
                    {hasChanges(key) && (
                      <div className="text-xs mt-1 flex items-center space-x-1">
                        <Edit3 className="h-3 w-3" />
                        <span>Sin guardar</span>
                      </div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {activePage && pages[activePage] && (
              <div className="bg-card border border-border rounded-lg p-6">
                {/* Page header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-foreground">
                      {pageTypes[activePage as keyof typeof pageTypes].title}
                    </h2>
                    <div className="flex items-center space-x-2">
                      {hasChanges(activePage) && (
                        <button
                          onClick={() => handleSave(activePage)}
                          disabled={saving === activePage}
                          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <Save className="h-4 w-4" />
                          <span>{saving === activePage ? 'Guardando...' : 'Guardar Cambios'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-2">
                    {pageTypes[activePage as keyof typeof pageTypes].description}
                  </p>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Última actualización: {new Date(pages[activePage].updated_at).toLocaleString('es-ES')}
                    </span>
                  </div>
                </div>

                {/* Edit form */}
                <div className="space-y-6">
                  {/* Title field */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={editData[activePage]?.title || ''}
                      onChange={(e) => handleInputChange(activePage, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                      placeholder="Título de la página"
                    />
                  </div>

                  {/* Content field */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Contenido
                    </label>
                    <textarea
                      value={editData[activePage]?.content || ''}
                      onChange={(e) => handleInputChange(activePage, 'content', e.target.value)}
                      rows={20}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 font-mono text-sm"
                      placeholder="Contenido HTML de la página..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      El contenido se muestra en HTML. Puedes usar clases de Tailwind CSS para el estilo.
                    </p>
                  </div>
                </div>

                {/* Preview section */}
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Vista Previa</span>
                  </h3>
                  <div className="bg-muted rounded-lg p-6 max-h-96 overflow-y-auto">
                    <div 
                      className="prose prose-slate dark:prose-invert max-w-none
                               prose-headings:text-foreground 
                               prose-p:text-muted-foreground
                               prose-strong:text-foreground
                               prose-a:text-primary hover:prose-a:text-primary/80
                               prose-ul:text-muted-foreground
                               prose-li:text-muted-foreground
                               prose-li:marker:text-muted-foreground
                               prose-h2:text-xl prose-h2:font-semibold prose-h2:text-foreground
                               prose-h3:text-lg prose-h3:font-semibold prose-h3:text-foreground
                               transition-colors duration-300"
                      dangerouslySetInnerHTML={{ 
                        __html: editData[activePage]?.content || pages[activePage].content 
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8 bg-muted rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/aviso-legal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-200"
            >
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium text-foreground">Ver Aviso Legal</h4>
                <p className="text-sm text-muted-foreground">Página pública</p>
              </div>
            </a>
            <a
              href="/politica-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-200"
            >
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium text-foreground">Ver Política de Privacidad</h4>
                <p className="text-sm text-muted-foreground">Página pública</p>
              </div>
            </a>
            <a
              href="/politica-cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-200"
            >
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium text-foreground">Ver Política de Cookies</h4>
                <p className="text-sm text-muted-foreground">Página pública</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}