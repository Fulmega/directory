import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastProvider from './components/ToastProvider';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { AvisoLegalPage, PoliticaPrivacidadPage, PoliticaCookiesPage } from './pages/legal/LegalPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEntriesPage from './pages/admin/AdminEntriesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminSectionsPage from './pages/admin/AdminSectionsPage';
import AdminTagsPage from './pages/admin/AdminTagsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminLegalPage from './pages/admin/AdminLegalPage';
import EntryFormPage from './pages/admin/EntryFormPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Legal pages */}
            <Route path="/aviso-legal" element={<AvisoLegalPage />} />
            <Route path="/politica-privacidad" element={<PoliticaPrivacidadPage />} />
            <Route path="/politica-cookies" element={<PoliticaCookiesPage />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/entries"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminEntriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/entries/new"
              element={
                <ProtectedRoute requireAdmin>
                  <EntryFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/entries/edit/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <EntryFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminCategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sections"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminSectionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tags"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminTagsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/legal"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <AdminLegalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
