import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import type { Category, Section, Tag } from '@/types';
import { Save, X, Star, Upload } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import { entrySchema } from '@/lib/validations';

export default function EntryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    section_id: '',
    content_type: 'prompt' as 'prompt' | 'tool' | 'workflow' | 'resource',
    content: '',
    content_format: 'plaintext' as 'plaintext' | 'markdown' | 'html' | 'json' | 'code' | 'richtext',
    status: 'draft' as 'draft' | 'published' | 'archived',
    is_favorite: false,
    rating: null as number | null,
    notes: '',
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (id) {
      loadEntry();
    }
  }, [id]);

  useEffect(() => {
    // Filter sections when category changes
    if (formData.category_id) {
      const filtered = sections.filter(s => s.category_id === formData.category_id);
      setFilteredSections(filtered);
      // Reset section if not in filtered list
      if (formData.section_id && !filtered.find(s => s.id === formData.section_id)) {
        setFormData(prev => ({ ...prev, section_id: '' }));
      }
    } else {
      setFilteredSections([]);
    }
  }, [formData.category_id, sections]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, sectionsRes, tagsRes] = await Promise.all([
        supabase.from('categories').select('*').order('order_index'),
        supabase.from('sections').select('*').order('order_index'),
        supabase.from('tags').select('*').order('name'),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (sectionsRes.data) setSections(sectionsRes.data);
      if (tagsRes.data) setAllTags(tagsRes.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadEntry = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data: entry, error } = await supabase
        .from('entries')
        .select('*, entry_tags(tag_id)')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (entry) {
        const entryData = entry as any;
        setFormData({
          title: entryData.title,
          description: entryData.description || '',
          category_id: entryData.category_id,
          section_id: entryData.section_id || '',
          content_type: entryData.content_type,
          content: entryData.content,
          content_format: entryData.content_format,
          status: entryData.status,
          is_favorite: entryData.is_favorite,
          rating: entryData.rating,
          notes: entryData.notes || '',
        });

        const tagIds = (entryData.entry_tags as any[]).map((et: any) => et.tag_id);
        setSelectedTags(tagIds);
      }
    } catch (error: any) {
      console.error('Error loading entry:', error);
      toast.error('Error al cargar la entrada: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar datos del formulario
    const validationData = {
      ...formData,
      description: formData.description || 'Sin descripción',
    };
    const validation = entrySchema.safeParse(validationData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);

    try {
      const entryData = {
        title: formData.title,
        description: formData.description || null,
        category_id: formData.category_id,
        section_id: formData.section_id || null,
        content_type: formData.content_type,
        content: formData.content,
        content_format: formData.content_format,
        status: formData.status,
        is_favorite: formData.is_favorite,
        rating: formData.rating,
        notes: formData.notes || null,
        updated_at: new Date().toISOString(),
      };

      let entryId = id;

      if (isEditMode) {
        // Update existing entry
        const { error } = await (supabase.from('entries') as any)
          .update(entryData)
          .eq('id', id);

        if (error) throw error;

        // Delete old tags
        await supabase.from('entry_tags').delete().eq('entry_id', id);
        toast.success('Entrada actualizada exitosamente');
      } else {
        // Create new entry
        const { data, error } = await (supabase.from('entries') as any)
          .insert(entryData)
          .select()
          .single();

        if (error) throw error;
        entryId = data.id;
        toast.success('Entrada creada exitosamente');
      }

      // Insert tags
      if (selectedTags.length > 0 && entryId) {
        const tagInserts = selectedTags.map(tagId => ({
          entry_id: entryId,
          tag_id: tagId,
        }));
        
        await (supabase.from('entry_tags') as any).insert(tagInserts);
      }

      navigate('/admin/entries');
    } catch (error: any) {
      console.error('Error saving entry:', error);
      toast.error('Error al guardar la entrada: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const slug = newTagName.toLowerCase().replace(/\s+/g, '-');
      const { data, error } = await (supabase.from('tags') as any)
        .insert({
          name: newTagName,
          slug,
          color: '#3B82F6',
        })
        .select()
        .single();

      if (error) throw error;

      setAllTags([...allTags, data]);
      setSelectedTags([...selectedTags, data.id]);
      setNewTagName('');
      toast.success('Tag creado exitosamente');
    } catch (error: any) {
      console.error('Error creating tag:', error);
      toast.error('Error al crear tag: ' + error.message);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  if (loading && isEditMode) {
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
      <div className="max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? 'Editar Entrada' : 'Nueva Entrada'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card rounded-lg shadow-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Información Básica</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500 dark:placeholder:text-slate-400"
                  placeholder="Título de la entrada"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500 dark:placeholder:text-slate-400"
                  placeholder="Descripción breve de la entrada"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">
                    Sección
                  </label>
                  <select
                    value={formData.section_id}
                    onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                    disabled={!formData.category_id}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500"
                  >
                    <option value="">Seleccionar sección</option>
                    {filteredSections.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">
                    Tipo de Contenido *
                  </label>
                  <select
                    value={formData.content_type}
                    onChange={(e) => setFormData({ ...formData, content_type: e.target.value as any })}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500"
                  >
                    <option value="prompt">Prompt</option>
                    <option value="tool">Tool</option>
                    <option value="workflow">Workflow</option>
                    <option value="resource">Resource</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">
                    Formato de Contenido *
                  </label>
                  <select
                    value={formData.content_format}
                    onChange={(e) => setFormData({ ...formData, content_format: e.target.value as any })}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500"
                  >
                    <option value="plaintext">Texto Plano</option>
                    <option value="markdown">Markdown</option>
                    <option value="html">HTML</option>
                    <option value="json">JSON</option>
                    <option value="code">Código</option>
                    <option value="richtext">Rich Text</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-card rounded-lg shadow-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Contenido</h2>
            
            <div className="border border-border rounded-lg overflow-hidden">
              {(formData.content_format === 'json' || formData.content_format === 'code') ? (
                <Editor
                  height="400px"
                  language={formData.content_format === 'json' ? 'json' : 'javascript'}
                  value={formData.content}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, content: value || '' }));
                  }}
                  theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              ) : (
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={15}
                  required
                  className="w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500 dark:placeholder:text-slate-400"
                  placeholder="Contenido de la entrada..."
                />
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-card rounded-lg shadow-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Tags</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Crear nuevo tag"
                  className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500 dark:placeholder:text-slate-400"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-blue-100 transition font-medium"
                >
                  Crear Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      selectedTags.includes(tag.id)
                        ? 'bg-primary text-white'
                        : 'bg-muted text-foreground hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:border dark:border-slate-600 dark:hover:bg-slate-600'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-card rounded-lg shadow-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Metadata</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500"
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">
                    Rating
                  </label>
                  <select
                    value={formData.rating || ''}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500"
                  >
                    <option value="">Sin rating</option>
                    <option value="1">1 estrella</option>
                    <option value="2">2 estrellas</option>
                    <option value="3">3 estrellas</option>
                    <option value="4">4 estrellas</option>
                    <option value="5">5 estrellas</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2 pt-8">
                    <input
                      type="checkbox"
                      checked={formData.is_favorite}
                      onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-ring dark:bg-slate-800 dark:border-slate-500"
                    />
                    <span className="text-sm font-medium text-foreground flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>Favorito</span>
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">
                  Notas Privadas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-slate-800 dark:text-slate-100 dark:border-slate-500 dark:placeholder:text-slate-400"
                  placeholder="Notas adicionales solo visibles para administradores"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/entries')}
              className="flex items-center space-x-2 px-6 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition font-medium dark:bg-slate-700 dark:text-slate-200 dark:border dark:border-slate-600 dark:hover:bg-slate-600"
            >
              <X className="h-4 w-4" />
              <span>Cancelar</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
