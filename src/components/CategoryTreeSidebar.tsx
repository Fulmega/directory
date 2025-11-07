import { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, Home, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Category, Section } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface CategoryWithSections extends Category {
  sections: Section[];
}

interface CategoryTreeSidebarProps {
  selectedCategory: string | null;
  selectedSection: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  onSectionSelect: (sectionId: string | null, categoryId: string | null) => void;
}

export default function CategoryTreeSidebar({
  selectedCategory,
  selectedSection,
  onCategorySelect,
  onSectionSelect,
}: CategoryTreeSidebarProps) {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<CategoryWithSections[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoriesWithSections();
  }, []);

  const loadCategoriesWithSections = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (categoriesData) {
        // Load sections for each category
        const categoriesWithSections: CategoryWithSections[] = await Promise.all(
          categoriesData.map(async (category: Category) => {
            const { data: sectionsData } = await supabase
              .from('sections')
              .select('*')
              .eq('category_id', category.id)
              .eq('is_active', true)
              .order('order_index');

            return {
              ...category,
              sections: (sectionsData || []) as Section[],
            } as CategoryWithSections;
          })
        );

        setCategories(categoriesWithSections);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      // Si ya está seleccionada, deseleccionar
      onCategorySelect(null);
      onSectionSelect(null, null);
    } else {
      // Seleccionar categoría y expandir
      onCategorySelect(categoryId);
      onSectionSelect(null, categoryId);
      // Auto-expandir la categoría al seleccionarla
      const newExpanded = new Set(expandedCategories);
      newExpanded.add(categoryId);
      setExpandedCategories(newExpanded);
    }
  };

  const handleSectionClick = (sectionId: string, categoryId: string) => {
    if (selectedSection === sectionId) {
      // Si ya está seleccionada, deseleccionar
      onSectionSelect(null, null);
      onCategorySelect(null);
    } else {
      // Seleccionar sección específica
      onSectionSelect(sectionId, categoryId);
      onCategorySelect(null); // Limpiar selección de categoría
    }
  };

  const handleShowAll = () => {
    onCategorySelect(null);
    onSectionSelect(null, null);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold text-foreground mb-4 text-lg">Categorías y Secciones</h3>
      
      {/* Botón para mostrar todas */}
      <button
        onClick={handleShowAll}
        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg mb-2 transition-colors duration-200 ${
          selectedCategory === null && selectedSection === null
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-foreground hover:bg-muted'
        }`}
      >
        <Home className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm">Todas las categorías</span>
      </button>

      {/* Árbol de categorías */}
      <div className="space-y-1">
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const isCategorySelected = selectedCategory === category.id;
          const hasSections = category.sections.length > 0;

          return (
            <div key={category.id} className="space-y-1">
              {/* Categoría */}
              <div className="flex items-center">
                {/* Botón de expansión */}
                {hasSections && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category.id);
                    }}
                    className="p-1 hover:bg-muted rounded transition-colors duration-200"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                )}
                {!hasSections && <div className="w-6"></div>}

                {/* Botón de categoría */}
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex-1 flex items-center space-x-2 px-2 py-2 rounded-lg transition-all duration-200 ${
                    isCategorySelected
                      ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Folder 
                    className="h-4 w-4 flex-shrink-0" 
                    style={{ color: category.color }}
                  />
                  <span className="text-sm truncate">{category.name}</span>
                  {hasSections && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {category.sections.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Secciones (expandibles) */}
              {hasSections && isExpanded && (
                <div className="ml-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {category.sections.map((section) => {
                    const isSectionSelected = selectedSection === section.id;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(section.id, category.id)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isSectionSelected
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-sm truncate">{section.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Enlace al Panel de Administración */}
      {isAdmin && (
        <Link
          to="/admin"
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg mt-2 transition-colors duration-200 text-foreground hover:bg-muted border border-border hover:border-primary/30"
        >
          <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">Panel de Administración</span>
        </Link>
      )}

      {/* Contador de categorías */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {categories.length} categorías
        </p>
      </div>
    </div>
  );
}
