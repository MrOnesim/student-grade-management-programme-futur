import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ConfirmDialog from './ConfirmDialog';
import Breadcrumb from './Breadcrumb';
import {
  LayoutDashboard, Users, BookOpen, PenLine, Trophy, FileText,
  Building2, LogOut, GraduationCap, Menu, X, ChevronDown, Settings, BarChart3, CheckCircle, RotateCcw, History
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { resetData } = useData();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isDirection = user?.role === 'direction';
  const isResponsable = user?.role === 'responsable';
  const isFormateur = user?.role === 'formateur';
  const canViewAll = isAdmin || isDirection;
  const canManage = isAdmin;
  const canEnterNotes = isAdmin || isFormateur;

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de Bord', show: true },
    { to: '/apprenants', icon: Users, label: 'Apprenants', show: true },
    { to: '/formations', icon: BookOpen, label: 'Formations', show: true },
    { to: '/notes', icon: PenLine, label: 'Saisie des Notes', show: canEnterNotes },
    { to: '/validation', icon: CheckCircle, label: 'Validation Notes', show: canViewAll || isResponsable },
    { to: '/resultats', icon: Trophy, label: 'Résultats', show: canViewAll || isResponsable },
    { to: '/classements', icon: BarChart3, label: 'Classements', show: canViewAll || isResponsable },
    { to: '/sites', icon: Building2, label: 'Sites', show: canManage },
    { to: '/utilisateurs', icon: GraduationCap, label: 'Utilisateurs', show: canManage },
    { to: '/rapports', icon: FileText, label: 'Rapports', show: canViewAll || isResponsable },
    { to: '/logs', icon: History, label: "Journal d'Audit", show: isAdmin || isDirection },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-600" />
          <span className="font-bold text-gray-800 text-sm">FUTUR NOTES</span>
        </div>
        <div className="w-8" />
      </div>

      {/* Sidebar Overlay Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-20 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img src="/images/logo-futur.png" alt="FUTUR NOTES Logo" className="h-10 w-10 rounded-xl object-contain" />
              <div>
                <h1 className="font-bold text-gray-800 text-lg leading-tight">FUTUR</h1>
                <p className="text-xs font-semibold tracking-widest" style={{ color: '#40A0F0' }}>NOTES</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.filter(i => i.show).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Stats submenu */}
            <div>
              <button
                onClick={() => setStatsOpen(!statsOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Settings size={18} />
                <span>Statistiques</span>
                <ChevronDown size={14} className={`ml-auto transition-transform ${statsOpen ? 'rotate-180' : ''}`} />
              </button>
              {statsOpen && (
                <div className="ml-9 mt-1 space-y-1">
                  <NavLink to="/statistiques/globales" onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? 'text-indigo-700 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>
                    Statistiques Globales
                  </NavLink>
                  <NavLink to="/statistiques/sites" onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? 'text-indigo-700 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>
                    Par Site
                  </NavLink>
                </div>
              )}
            </div>
          </nav>

          {/* Reset Data Button (admin only) */}
          {user?.role === 'admin' && (
            <div className="px-3 py-2 border-t border-gray-100">
              <button onClick={() => setShowReset(true)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg font-medium transition-colors">
                <RotateCcw size={16} />
                Réinitialiser données
              </button>
            </div>
          )}

          {/* User & Logout */}
          <div className="px-3 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-600">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.prenom} {user?.nom}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <ConfirmDialog open={showReset} title="Réinitialiser les données"
        message="Toutes les modifications seront perdues (apprenants, notes, utilisateurs, etc.). Les données par défaut seront restaurées."
        confirmLabel="Réinitialiser" variant="warning"
        onConfirm={() => { resetData(); setShowReset(false); }}
        onCancel={() => setShowReset(false)} />

      {/* Main Content */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Breadcrumb />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
