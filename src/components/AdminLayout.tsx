import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Layers,
  Tags,
  Users,
  Settings,
  LogOut,
  Home,
  Scale,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Footer from './Footer';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: FileText, label: 'Entradas', path: '/admin/entries' },
    { icon: FolderOpen, label: 'Categorías', path: '/admin/categories' },
    { icon: Layers, label: 'Secciones', path: '/admin/sections' },
    { icon: Tags, label: 'Tags', path: '/admin/tags' },
  ];

  if (user?.role === 'superadmin') {
    menuItems.push(
      { icon: Scale, label: 'Páginas Legales', path: '/admin/legal' },
      { icon: Users, label: 'Usuarios', path: '/admin/users' },
      { icon: Settings, label: 'Configuración', path: '/admin/settings' }
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Top navbar */}
      <nav className="bg-card border-b border-border fixed top-0 left-0 right-0 z-50 transition-colors duration-300">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">F</span>
                </div>
                <span className="font-bold text-xl text-foreground">Fulmega.eu</span>
              </Link>
              <span className="text-sm text-muted-foreground hidden sm:inline">/ Admin</span>
            </div>

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              
              <Link
                to="/"
                className="flex items-center space-x-2 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Ver sitio</span>
              </Link>
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                <span className="text-sm text-foreground">{user?.profile?.full_name || user?.email}</span>
                <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded">
                  {user?.role}
                </span>
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border overflow-y-auto transition-colors duration-300">
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="pl-64 pt-16 min-h-screen flex flex-col">
        <main className="flex-1">
          <div className="p-8">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
