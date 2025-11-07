import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, LogIn } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import CategoryTreeSidebar from './CategoryTreeSidebar';
import Footer from './Footer';
import LoginModal from './LoginModal';
import FulmegaLogoHeader from './FulmegaLogo';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  selectedCategory?: string | null;
  selectedSection?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;
  onSectionSelect?: (sectionId: string | null, categoryId: string | null) => void;
}

export default function Layout({ 
  children, 
  showSidebar = true,
  selectedCategory,
  selectedSection,
  onCategorySelect,
  onSectionSelect,
}: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-card border-b border-border sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <FulmegaLogoHeader className="flex-shrink-0" />

            {/* Right side buttons */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground hidden sm:inline">{user.profile?.full_name || user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Iniciar sesión</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content wrapper */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {showSidebar && (
          <aside className="hidden lg:block w-64 bg-card border-r border-border h-[calc(100vh-4rem)] sticky top-16 transition-colors duration-300 overflow-y-auto">
            {onCategorySelect && onSectionSelect && (
              <CategoryTreeSidebar
                selectedCategory={selectedCategory || null}
                selectedSection={selectedSection || null}
                onCategorySelect={onCategorySelect}
                onSectionSelect={onSectionSelect}
              />
            )}
          </aside>
        )}

        <div className="flex-1 flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
