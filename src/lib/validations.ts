import { z } from 'zod';

// Esquema para entrada (entry)
export const entrySchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200, 'El título es demasiado largo'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(500, 'La descripción es demasiado larga'),
  category_id: z.string().uuid('Debes seleccionar una categoría válida'),
  section_id: z.string().uuid('Debes seleccionar una sección válida').optional().or(z.literal('')),
  content_type: z.enum(['prompt', 'tool', 'workflow', 'resource'], {
    errorMap: () => ({ message: 'Tipo de contenido inválido' }),
  }),
  content: z.string().min(1, 'El contenido no puede estar vacío'),
  content_format: z.enum(['plaintext', 'markdown', 'html', 'json', 'code', 'richtext']),
  status: z.enum(['draft', 'published', 'archived']),
  rating: z.number().min(1).max(5).nullable(),
  notes: z.string().optional(),
});

// Esquema para categoría
export const categorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es demasiado largo'),
  slug: z.string().min(2, 'El slug debe tener al menos 2 caracteres').max(100, 'El slug es demasiado largo'),
  description: z.string().max(500, 'La descripción es demasiado larga').optional(),
  icon: z.string().max(50, 'El icono es demasiado largo').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'El color debe ser un código hexadecimal válido (#RRGGBB)'),
});

// Esquema para sección
export const sectionSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es demasiado largo'),
  slug: z.string().min(2, 'El slug debe tener al menos 2 caracteres').max(100, 'El slug es demasiado largo'),
  category_id: z.string().uuid('Debes seleccionar una categoría válida'),
  description: z.string().max(500, 'La descripción es demasiado larga').optional(),
});

// Esquema para tag
export const tagSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'El nombre es demasiado largo'),
  slug: z.string().min(2, 'El slug debe tener al menos 2 caracteres').max(50, 'El slug es demasiado largo'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'El color debe ser un código hexadecimal válido (#RRGGBB)'),
});

// Esquema para configuración del sistema
export const systemConfigSchema = z.object({
  site_name: z.string().min(2, 'El nombre del sitio debe tener al menos 2 caracteres').max(100, 'El nombre es demasiado largo'),
  site_description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(500, 'La descripción es demasiado larga'),
  allow_registration: z.boolean(),
  require_email_verification: z.boolean(),
  email_notifications: z.boolean(),
  system_alerts: z.boolean(),
  theme: z.enum(['light', 'dark']),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'El color debe ser un código hexadecimal válido (#RRGGBB)'),
});

export type EntryFormData = z.infer<typeof entrySchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type SectionFormData = z.infer<typeof sectionSchema>;
export type TagFormData = z.infer<typeof tagSchema>;
export type SystemConfigData = z.infer<typeof systemConfigSchema>;
