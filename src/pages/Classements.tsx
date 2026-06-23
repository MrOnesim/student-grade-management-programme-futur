import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getMentionBg } from '../data/mockData';
import { calculerResultats } from '../utils/calculs';
import { Trophy, Medal, Building2, BookOpen, Globe } from 'lucide-react';

type ViewMode = 'global' | 'site' | 'formation' | 'promotion';

export default function Classements() {
  const { user } = useAuth();
  const { apprenants, formations, sites, notes, evaluations } = useData();
  const allResults = useMemo(() => calculerResultats(apprenants, formations, sites, notes, evaluations), [apprenants, formations, sites, notes, evaluations]);
  const [viewMode, setViewMode] = useState<ViewMode>('global');
  const [selectedGroup, setSelectedGroup] = useState('');

  const userResults = useMemo(() => {
    if (user?.role === 'responsable' && user.siteId) return allResults.filter(r => r.siteId === user.siteId);
    if (user?.role === 'formateur' && user.formationId) return allResults.filter(r => r.formationId === user.formationId);
    return allResults;
  }, [allResults, user]);

  const classements = useMemo(() => {
    let list = [...userResults];
    if (viewMode === 'site' && selectedGroup) list = list.filter(r => r.siteId === selectedGroup);
    if (viewMode === 'formation' && selectedGroup) list = list.filter(r => r.formationId === selectedGroup);
    if (viewMode === 'promotion' && selectedGroup) list = list.filter(r => r.promotion === selectedGroup);
    return list.sort((a, b) => b.moyenneGenerale - a.moyenneGenerale).map((r, i) => ({ ...r, rang: i + 1 }));
  }, [userResults, viewMode, selectedGroup]);

  const groupOptions = useMemo(() => {
    if (viewMode === 'site') return sites.map(s => ({ id: s.id, label: s.nom }));
    if (viewMode === 'formation') return formations.map(f => ({ id: f.id, label: f.nom }));
    if (viewMode === 'promotion') {
      const proms = [...new Set(userResults.map(r => r.promotion))];
      return proms.map(p => ({ id: p, label: `Promotion ${p}` }));
    }
    return [];
  }, [viewMode, userResults]);

  const currentGroupLabel = viewMode === 'global' ? 'Ensemble du Programme FUTUR' : groupOptions.find(g => g.id === selectedGroup)?.label || 'Sélection...';

  const viewOptions: { mode: ViewMode; icon: typeof Globe; label: string }[] = [
    { mode: 'global', icon: Globe, label: 'Global' },
    { mode: 'site', icon: Building2, label: 'Par Site' },
    { mode: 'formation', icon: BookOpen, label: 'Par Filière' },
    { mode: 'promotion', icon: Medal, label: 'Par Promotion' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Classements</h1><p className="text-gray-500 mt-1">Classement des apprenants par mérite</p></div>

      <div className="flex flex-wrap gap-2">
        {viewOptions.map(opt => (
          <button key={opt.mode} onClick={() => { setViewMode(opt.mode); setSelectedGroup(''); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === opt.mode ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            <opt.icon size={16} />{opt.label}
          </button>
        ))}
      </div>

      {viewMode !== 'global' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {viewMode === 'site' ? 'Sélectionner un site' : viewMode === 'formation' ? 'Sélectionner une filière' : 'Sélectionner une promotion'}
          </label>
          <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="w-full sm:w-80 px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">-- Choisir --</option>{groupOptions.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Trophy size={18} className="text-amber-500" />Classement — {currentGroupLabel}</h3>
          <span className="text-sm text-gray-400">{classements.length} apprenants</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-16">Rang</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Apprenant</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Formation</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Site</th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Moyenne</th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Mention</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {classements.map((r, i) => (
                <tr key={r.apprenantId} className={`hover:bg-gray-50 ${i < 3 ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-4 py-3 text-center"><span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-400 text-white shadow-md' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-300 text-orange-800' : 'text-gray-500'}`}>{r.rang}</span></td>
                  <td className="px-6 py-3"><p className="text-sm font-medium text-gray-900">{r.apprenantPrenom} {r.apprenantNom}</p><p className="text-xs text-gray-400 font-mono">{r.apprenantMatricule}</p></td>
                  <td className="px-6 py-3 text-sm text-gray-600">{r.formationNom}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{r.siteNom}</td>
                  <td className="px-6 py-3 text-center"><span className="text-sm font-bold text-indigo-600">{r.moyenneGenerale.toFixed(2)}</span></td>
                  <td className="px-6 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.statutValidation === 'Valide' ? 'bg-green-100 text-green-700' : r.statutValidation === 'En attente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{r.statutValidation}</span></td>
                  <td className="px-6 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${getMentionBg(r.mention)}`}>{r.mention}</span></td>
                </tr>
              ))}
              {classements.length === 0 && <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">{selectedGroup ? 'Aucun résultat pour cette sélection' : 'Sélectionnez un groupe'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
