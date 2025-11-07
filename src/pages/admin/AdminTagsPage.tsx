import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import type { Tag } from '@/types';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { tagSchema } from '@/lib/validations';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#3B82F6',
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const { data } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      
      if (data) setTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar datos del formulario
    const validation = tagSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    try {
      if (editingId) {
        const updateData = {
          name: formData.name,
          slug: formData.slug,
          color: formData.color,
        };
        const { error } = await (supabase.from('tags') as any)
          .update(updateData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Tag actualizado exitosamente');
      } else {
        const insertData = {
          name: formData.name,
          slug: formData.slug,
          color: formData.color,
        };
        const { error } = await (supabase.from('tags') as any).insert(insertData);

        if (error) throw error;
        toast.success('Tag creado exitosamente');
      }

      resetForm();
      loadTags();
    } catch (error: any) {
      console.error('Error saving tag:', error);
      toast.error('Error al guardar el tag: ' + error.message);
    }
  };

  const deleteTag = async (id: string) => {
    if (!confirm('¿Estás seguro? Esto desvinculará el tag de todas las entradas.')) return;

    try {
      const { error } = await supabase.from('tags').delete().eq('id', id);
      if (error) throw error;
      toast.success('Tag eliminado exitosamente');
      loadTags();
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      toast.error('Error al eliminar el tag: ' + error.message);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      color: '#3B82F6',
    });
  };

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
        <h1 className="text-3xl font-bold text-foreground mb-6">Gestión de Tags</h1>

        {/* Form */}
        <div className="bg-card rounded-lg shadow-card p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {editingId ? 'Editar Tag' : 'Nuevo Tag'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500 dark:placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500 dark:placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 px-2 py-1 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                <Save className="h-4 w-4" />
                <span>{editingId ? 'Actualizar' : 'Crear'}</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tags list */}
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-gray-200">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-muted">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-medium text-foreground">{tag.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">{tag.slug}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">{tag.color}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">{tag.usage_count}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => startEdit(tag)}
                      className="text-primary hover:text-primary-dark mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTag(tag.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
