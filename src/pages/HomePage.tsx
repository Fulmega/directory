import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import type { Entry, Category, Section, Tag } from '@/types';
import { Star, Copy, ExternalLink, Calendar, Search, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Función auxiliar para formatear texto con saltos de línea
function formatTextWithLineBreaks(text: string): JSX.Element {
  // Normalizar primero para manejar tanto \n\n como \\n\\n
  const normalizedText = text.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');
  
  // Dividir por dobles saltos de línea para crear párrafos
  const paragraphs = normalizedText.split('\n\n').filter(p => p.trim());
  
  return (
    <>
      {paragraphs.map((paragraph, index) => {
        // Dividir cada párrafo por saltos de línea simples
        const lines = paragraph.split('\n').filter(l => l.trim());
        return (
          <span key={index} className="block">
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {line.trim()}
                {lineIndex < lines.length - 1 && <br />}
              </span>
            ))}
            {index < paragraphs.length - 1 && <span className="block h-3"></span>}
          </span>
        );
      })}
    </>
  );
}

export default function HomePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Load published entries
      const { data: entriesData } = await supabase
        .from('entries')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(50);

      if (entriesData) {
        setEntries(entriesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    // Filtrar por sección si hay una seleccionada
    if (selectedSection) {
      if (entry.section_id !== selectedSection) return false;
    }
    // Filtrar por categoría si hay una seleccionada (y no hay sección)
    else if (selectedCategory) {
      if (entry.category_id !== selectedCategory) return false;
    }
    
    // Filtrar por búsqueda
    const matchesSearch = searchQuery
      ? entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesSearch;
  });

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    // Could add toast notification here
  };

  if (loading) {
    return (
      <Layout 
        selectedCategory={selectedCategory}
        selectedSection={selectedSection}
        onCategorySelect={setSelectedCategory}
        onSectionSelect={(sectionId, categoryId) => {
          setSelectedSection(sectionId);
          if (categoryId) {
            setSelectedCategory(categoryId);
          }
        }}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      selectedCategory={selectedCategory}
      selectedSection={selectedSection}
      onCategorySelect={setSelectedCategory}
      onSectionSelect={(sectionId, categoryId) => {
        setSelectedSection(sectionId);
        if (categoryId) {
          setSelectedCategory(categoryId);
        }
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar herramientas, prompts, workflows..."
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-lg text-foreground placeholder:text-muted-foreground transition-colors duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {searchQuery && (
          <div className="mb-4 text-muted-foreground">
            {filteredEntries.length} resultado{filteredEntries.length !== 1 ? 's' : ''} para "{searchQuery}"
          </div>
        )}

        {/* Entries grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onCopy={copyToClipboard}
              onClick={() => setSelectedEntry(entry)}
            />
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery
                ? `No se encontraron resultados para "${searchQuery}"`
                : 'No hay entradas disponibles en esta categoría.'}
            </p>
          </div>
        )}
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <EntryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onCopy={copyToClipboard}
        />
      )}
    </Layout>
  );
}

interface EntryCardProps {
  entry: Entry;
  onCopy: (content: string) => void;
  onClick: () => void;
}

function EntryCard({ entry, onCopy, onClick }: EntryCardProps) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      prompt: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      tool: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      workflow: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      resource: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-lg border border-border p-6 hover:shadow-card-hover transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg text-foreground line-clamp-2">
          {entry.title}
        </h3>
        {entry.is_favorite && (
          <Star className="h-5 w-5 text-yellow-500 fill-current flex-shrink-0" />
        )}
      </div>

      {entry.description && (
        <div className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {formatTextWithLineBreaks(entry.description)}
        </div>
      )}

      <div className="flex items-center space-x-2 mb-4">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(entry.content_type)}`}>
          {entry.content_type}
        </span>
        {entry.rating && entry.rating > 0 && (
          <div className="flex items-center space-x-1">
            {[...Array(entry.rating)].map((_, i) => (
              <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{new Date(entry.created_at).toLocaleDateString('es-ES')}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(entry.content);
            }}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors duration-200"
            title="Copiar contenido"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


interface EntryDetailModalProps {
  entry: Entry;
  onClose: () => void;
  onCopy: (content: string) => void;
}

function EntryDetailModal({ entry, onClose, onCopy }: EntryDetailModalProps) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      prompt: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      tool: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      workflow: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      resource: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  const renderContent = () => {
    if (entry.content_format === 'markdown') {
      // Normalizar el contenido markdown para manejar \\n\\n antes de pasarlo a ReactMarkdown
      const normalizedContent = entry.content.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');
      return (
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{normalizedContent}</ReactMarkdown>
        </div>
      );
    } else if (entry.content_format === 'html') {
      return (
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      );
    } else if (entry.content_format === 'json' || entry.content_format === 'code') {
      return (
        <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto">
          <code className="text-sm text-slate-800 dark:text-slate-200">{entry.content}</code>
        </pre>
      );
    } else {
      // Usar la función de formateo para texto plano
      return <div className="text-foreground">{formatTextWithLineBreaks(entry.content)}</div>;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground flex-1 pr-4">
              {entry.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {entry.description && (
            <div className="text-muted-foreground mb-4">
              {formatTextWithLineBreaks(entry.description)}
            </div>
          )}

          <div className="flex items-center flex-wrap gap-3">
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getTypeColor(entry.content_type)}`}>
              {entry.content_type}
            </span>
            <span className="px-3 py-1 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              {entry.content_format}
            </span>
            {entry.rating && entry.rating > 0 && (
              <div className="flex items-center space-x-1">
                {[...Array(entry.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                ))}
              </div>
            )}
            {entry.is_favorite && (
              <span className="px-3 py-1 rounded-lg text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 flex items-center space-x-1">
                <Star className="h-4 w-4 fill-current" />
                <span>Favorito</span>
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] bg-slate-50 dark:bg-slate-900/50">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Creado: {new Date(entry.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>

            <button
              onClick={() => {
                onCopy(entry.content);
                alert('Contenido copiado al portapapeles');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
            >
              <Copy className="h-4 w-4" />
              <span>Copiar contenido</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
