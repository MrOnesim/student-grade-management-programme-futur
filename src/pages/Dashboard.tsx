import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getMentionColor } from '../data/mockData';
import { calculerResultats } from '../utils/calculs';
import { Users, Building2, BookOpen, Trophy, TrendingUp, TrendingDown, Target, Award } from 'lucide-react';
import { BarChart } from '../components/SvgCharts';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { apprenants, formations, sites, notes, evaluations } = useData();
  const results = useMemo(() => calculerResultats(apprenants, formations, sites, notes, evaluations), [apprenants, formations, sites, notes, evaluations]);

  const filteredResults = useMemo(() => {
    if (!user) return results;
    if (user.role === 'responsable' && user.siteId) return results.filter(r => r.siteId === user.siteId);
    if (user.role === 'formateur' && user.formationId) return results.filter(r => r.formationId === user.formationId);
    return results;
  }, [results, user]);

  const totalApprenants = filteredResults.length;
  const totalSitesActive = [...new Set(filteredResults.map(r => r.siteId))].length;
  const totalFormationsActive = [...new Set(filteredResults.map(r => r.formationId))].length;
  const reussis = filteredResults.filter(r => r.moyenneGenerale >= 10);
  const tauxReussite = totalApprenants > 0 ? (reussis.length / totalApprenants) * 100 : 0;
  const tauxEchec = totalApprenants > 0 ? ((totalApprenants - reussis.length) / totalApprenants) * 100 : 0;
  const moyenneGlobale = totalApprenants > 0 ? filteredResults.reduce((s, r) => s + r.moyenneGenerale, 0) / totalApprenants : 0;

  // Stats par site pour le graphique
  const siteStats = useMemo(() => {
    const map = new Map<string, { nom: string; count: number; sum: number; best: number; reussis: number }>();
    filteredResults.forEach(r => {
      const e = map.get(r.siteId);
      if (e) { e.count++; e.sum += r.moyenneGenerale; e.best = Math.max(e.best, r.moyenneGenerale); if (r.moyenneGenerale >= 10) e.reussis++; }
      else map.set(r.siteId, { nom: r.siteNom, count: 1, sum: r.moyenneGenerale, best: r.moyenneGenerale, reussis: r.moyenneGenerale >= 10 ? 1 : 0 });
    });
    return Array.from(map.entries()).map(([id, d]) => ({ siteId: id, ...d, tauxReussite: (d.reussis / d.count) * 100, moyenneSite: d.sum / d.count }));
  }, [filteredResults]);

  const topPerformers = [...filteredResults].sort((a, b) => b.moyenneGenerale - a.moyenneGenerale).slice(0, 5);

  const statsCards = [
    { label: 'Total Apprenants', value: totalApprenants, icon: Users, color: 'bg-blue-500', to: '/apprenants' },
    { label: 'Sites Actifs', value: totalSitesActive, icon: Building2, color: 'bg-green-500', to: '/sites' },
    { label: 'Filières Actives', value: totalFormationsActive, icon: BookOpen, color: 'bg-purple-500', to: '/formations' },
    { label: 'Taux de Réussite', value: `${tauxReussite.toFixed(1)}%`, icon: Trophy, color: 'bg-amber-500', to: '/resultats' },
  ];

  const roleLabel = user?.role === 'admin' ? 'Administrateur Général' : user?.role === 'direction' ? 'Direction FUTUR' : user?.role === 'responsable' ? 'Responsable de Site' : 'Formateur';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-500 mt-1">Bienvenue, {user?.prenom} {user?.nom} — {roleLabel}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <button key={i} onClick={() => navigate(card.to)} className="text-left bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className={`h-10 w-10 rounded-lg ${card.color} flex items-center justify-center`}><card.icon className="h-5 w-5 text-white" /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center"><Target className="h-5 w-5 text-indigo-600" /></div>
            <div><p className="text-sm text-gray-500">Moyenne Générale</p><p className="text-2xl font-bold text-gray-900">{moyenneGlobale.toFixed(2)}/20</p></div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full" style={{ width: `${(moyenneGlobale / 20) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Répartition Résultats</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-green-500" /><span className="text-sm text-gray-600">Réussite</span></div>
              <p className="text-xl font-bold text-green-600">{tauxReussite.toFixed(1)}%</p>
              <p className="text-xs text-gray-400">{reussis.length} apprenants</p>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2"><TrendingDown size={16} className="text-red-500" /><span className="text-sm text-gray-600">Échec</span></div>
              <p className="text-xl font-bold text-red-600">{tauxEchec.toFixed(1)}%</p>
              <p className="text-xs text-gray-400">{totalApprenants - reussis.length} apprenants</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4"><Award className="h-5 w-5 text-amber-500" /><h4 className="text-sm font-medium text-gray-500">Meilleur Apprenant</h4></div>
          {topPerformers[0] && (
            <>
              <p className="text-lg font-bold text-gray-900">{topPerformers[0].apprenantPrenom} {topPerformers[0].apprenantNom}</p>
              <p className="text-sm text-gray-500">{topPerformers[0].formationNom}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-bold text-indigo-600">{topPerformers[0].moyenneGenerale.toFixed(2)}</span>
                <span className={`text-sm font-medium ${getMentionColor(topPerformers[0].mention)}`}>{topPerformers[0].mention}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {user?.role !== 'responsable' && user?.role !== 'formateur' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900 flex items-center gap-2"><Building2 size={18} className="text-gray-400" />Statistiques par Site</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Site</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Apprenants</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Taux Réussite</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Meilleure Moy.</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Moy. Site</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {siteStats.map(s => (
                    <tr key={s.siteId} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{s.nom}</td>
                      <td className="px-6 py-3 text-sm text-center text-gray-600">{s.count}</td>
                      <td className="px-6 py-3 text-center"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.tauxReussite >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.tauxReussite.toFixed(1)}%</span></td>
                      <td className="px-6 py-3 text-sm text-center font-medium text-indigo-600">{s.best.toFixed(2)}</td>
                      <td className="px-6 py-3 text-sm text-center text-gray-600">{s.moyenneSite.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Trophy size={18} className="text-indigo-500" />Performances Moyennes</h3>
            <p className="text-xs text-gray-400 mb-4">Moyennes générales comparées de tous les sites actifs</p>
            <div className="flex-1 flex items-end justify-center">
              <BarChart data={siteStats.map(s => ({ name: s.nom, value: s.moyenneSite, displayValue: `${s.moyenneSite.toFixed(2)}/20` }))} max={20} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900 flex items-center gap-2"><Trophy size={18} className="text-amber-500" />Top 5 — Meilleures Moyennes</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rang</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Apprenant</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Formation</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Moyenne</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Mention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topPerformers.map((r, i) => (
                <tr key={r.apprenantId} className="hover:bg-gray-50">
                  <td className="px-6 py-3"><span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>{i + 1}</span></td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{r.apprenantPrenom} {r.apprenantNom}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{r.formationNom}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{r.siteNom}</td>
                  <td className="px-6 py-3 text-sm font-bold text-center text-indigo-600">{r.moyenneGenerale.toFixed(2)}</td>
                  <td className="px-6 py-3 text-center"><span className={`text-xs font-medium ${getMentionColor(r.mention)}`}>{r.mention}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
