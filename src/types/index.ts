import type { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Section = Database['public']['Tables']['sections']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type Entry = Database['public']['Tables']['entries']['Row'];
export type EntryTag = Database['public']['Tables']['entry_tags']['Row'];
export type Attachment = Database['public']['Tables']['attachments']['Row'];

export type EntryWithRelations = Entry & {
  category: Category;
  section: Section | null;
  tags: Tag[];
  attachments: Attachment[];
};

export type CategoryWithSections = Category & {
  sections: Section[];
  entriesCount?: number;
};

export type UserRole = 'superadmin' | 'admin' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profile: Profile | null;
}
