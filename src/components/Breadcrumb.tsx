import { useLocation } from 'react-router-dom';
import { ChevronRight, LayoutDashboard } from 'lucide-react';

const labels: Record<string, string> = {
  dashboard: 'Tableau de Bord',
  apprenants: 'Apprenants',
  formations: 'Formations',
  notes: 'Saisie des Notes',
  validation: 'Validation Notes',
  resultats: 'Résultats',
  classements: 'Classements',
  sites: 'Sites',
  utilisateurs: 'Utilisateurs',
  rapports: 'Rapports',
  globales: 'Globales',
};

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4" aria-label="Breadcrumb">
      <LayoutDashboard size={12} className="text-gray-300" />
      {segments.map((seg, i) => (
        <span key={seg} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={10} />}
          <span className={i === segments.length - 1 ? 'text-gray-700 font-medium' : ''}>
            {labels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)}
          </span>
        </span>
      ))}
    </nav>
  );
}
