import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yypyhwyxufudmcobhaaj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cHlod3l4dWZ1ZG1jb2JoYWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTg4MjUsImV4cCI6MjA3NzkzNDgyNX0.n_3dXTMeUEy0v3L20MIl-G3kGMcI3rMO5SFmEuzl2LE';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
