import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import { UserRole } from './types';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Validation = lazy(() => import('./pages/Validation'));
const Apprenants = lazy(() => import('./pages/Apprenants'));
const Formations = lazy(() => import('./pages/Formations'));
const Notes = lazy(() => import('./pages/Notes'));
const Resultats = lazy(() => import('./pages/Resultats'));
const Classements = lazy(() => import('./pages/Classements'));
const Sites = lazy(() => import('./pages/Sites'));
const Utilisateurs = lazy(() => import('./pages/Utilisateurs'));
const Rapports = lazy(() => import('./pages/Rapports'));
const StatistiquesGlobales = lazy(() => import('./pages/StatistiquesGlobales'));
const StatistiquesSites = lazy(() => import('./pages/StatistiquesSites'));
const Logs = lazy(() => import('./pages/Logs'));

function PageLoader() {
  return (
    <div className="space-y-6 animate-pulse p-4 sm:p-6 lg:p-8">
      <div className="h-7 w-48 bg-gray-200 rounded" />
      <div className="h-4 w-64 bg-gray-100 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-50 rounded-xl border border-gray-100" />
    </div>
  );
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { isAuthenticated, hasAccess } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !hasAccess(roles)) return <Navigate to="/dashboard" replace />;
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="/apprenants" element={<Suspense fallback={<PageLoader />}><Apprenants /></Suspense>} />
        <Route path="/formations" element={<Suspense fallback={<PageLoader />}><Formations /></Suspense>} />
        <Route path="/validation" element={<Suspense fallback={<PageLoader />}><Validation /></Suspense>} />
        <Route path="/notes" element={<ProtectedRoute roles={['admin', 'formateur']}><Notes /></ProtectedRoute>} />
        <Route path="/resultats" element={<ProtectedRoute roles={['admin', 'direction', 'responsable']}><Resultats /></ProtectedRoute>} />
        <Route path="/classements" element={<ProtectedRoute roles={['admin', 'direction', 'responsable']}><Classements /></ProtectedRoute>} />
        <Route path="/sites" element={<ProtectedRoute roles={['admin']}><Sites /></ProtectedRoute>} />
        <Route path="/utilisateurs" element={<ProtectedRoute roles={['admin']}><Utilisateurs /></ProtectedRoute>} />
        <Route path="/rapports" element={<ProtectedRoute roles={['admin', 'direction', 'responsable']}><Rapports /></ProtectedRoute>} />
        <Route path="/statistiques/globales" element={<Suspense fallback={<PageLoader />}><StatistiquesGlobales /></Suspense>} />
        <Route path="/statistiques/sites" element={<Suspense fallback={<PageLoader />}><StatistiquesSites /></Suspense>} />
        <Route path="/logs" element={<ProtectedRoute roles={['admin', 'direction']}><Logs /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
