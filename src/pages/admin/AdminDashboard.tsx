import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import type { Category, Section } from '@/types';
import { FileText, FolderOpen, Tags as TagsIcon, TrendingUp, Layers } from 'lucide-react';

interface Stats {
  totalEntries: number;
  totalCategories: number;
  totalTags: number;
  totalSections: number;
  publishedEntries: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalEntries: 0,
    totalCategories: 0,
    totalTags: 0,
    totalSections: 0,
    publishedEntries: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentSections, setRecentSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [entriesRes, categoriesRes, tagsRes, sectionsRes, publishedRes, categoriesData, sectionsData] = await Promise.all([
        supabase.from('entries').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('tags').select('id', { count: 'exact', head: true }),
        supabase.from('sections').select('id', { count: 'exact', head: true }),
        supabase.from('entries').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('categories').select('*').order('order_index').limit(6),
        supabase.from('sections').select('*, categories(name)').order('created_at', { ascending: false }).limit(8),
      ]);

      setStats({
        totalEntries: entriesRes.count || 0,
        totalCategories: categoriesRes.count || 0,
        totalTags: tagsRes.count || 0,
        totalSections: sectionsRes.count || 0,
        publishedEntries: publishedRes.count || 0,
      });

      if (categoriesData.data) setCategories(categoriesData.data);
      if (sectionsData.data) setRecentSections(sectionsData.data as any);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Entradas',
      value: stats.totalEntries,
      icon: FileText,
      color: 'bg-blue-500 dark:bg-blue-600',
    },
    {
      title: 'Entradas Publicadas',
      value: stats.publishedEntries,
      icon: TrendingUp,
      color: 'bg-green-500 dark:bg-green-600',
    },
    {
      title: 'Categorías',
      value: stats.totalCategories,
      icon: FolderOpen,
      color: 'bg-purple-500 dark:bg-purple-600',
    },
    {
      title: 'Secciones',
      value: stats.totalSections,
      icon: Layers,
      color: 'bg-indigo-500 dark:bg-indigo-600',
    },
    {
      title: 'Tags',
      value: stats.totalTags,
      icon: TagsIcon,
      color: 'bg-orange-500 dark:bg-orange-600',
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-card border border-border rounded-lg shadow-card p-6 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories Overview */}
          <div className="bg-card border border-border rounded-lg shadow-card p-6 transition-colors duration-300">
            <h2 className="text-xl font-bold text-foreground mb-4">Categorías Principales</h2>
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon || category.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.slug}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sections */}
          <div className="bg-card border border-border rounded-lg shadow-card p-6 transition-colors duration-300">
            <h2 className="text-xl font-bold text-foreground mb-4">Secciones Recientes</h2>
            <div className="space-y-3">
              {recentSections.map((section: any) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors duration-200"
                >
                  <div>
                    <p className="font-medium text-foreground">{section.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {section.categories?.name || 'Sin categoría'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(section.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
