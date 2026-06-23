import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { calculerResultats } from '../utils/calculs';
import { TrendingUp, Users, Building2, BookOpen, Target } from 'lucide-react';
import { DonutChart } from '../components/SvgCharts';

export default function StatistiquesGlobales() {
  const { apprenants, formations, sites, notes, evaluations } = useData();
  const results = useMemo(() => calculerResultats(apprenants, formations, sites, notes, evaluations), [apprenants, formations, sites, notes, evaluations]);
  const totalApprenants = results.length;
  const reussis = results.filter(r => r.moyenneGenerale >= 10).length;
  const tauxReussite = totalApprenants > 0 ? (reussis / totalApprenants) * 100 : 0;
  const moyenneGlobale = totalApprenants > 0 ? results.reduce((s, r) => s + r.moyenneGenerale, 0) / totalApprenants : 0;

  const formationStats = useMemo(() => {
    return formations.map(f => {
      const fr = results.filter(r => r.formationId === f.id);
      return { formation: f, count: fr.length, moyenne: fr.length > 0 ? fr.reduce((s, r) => s + r.moyenneGenerale, 0) / fr.length : 0 };
    });
  }, [results]);

  const mentions = useMemo(() => {
    const m: Record<string, number> = {};
    results.forEach(r => { m[r.mention] = (m[r.mention] || 0) + 1; });
    return m;
  }, [results]);

  const donutData = useMemo(() => {
    const mentionsOrdered = ['Excellent', 'Très Bien', 'Bien', 'Assez Bien', 'Passable', 'Ajourné'];
    const colors = ['#eab308', '#16a34a', '#34d399', '#3b82f6', '#f97316', '#ef4444'];
    return mentionsOrdered.map((m, i) => ({
      name: m,
      value: mentions[m] || 0,
      color: colors[i]
    }));
  }, [mentions]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Statistiques Globales</h1><p className="text-gray-500 mt-1">Vue d'ensemble du Programme FUTUR</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><Users size={24} className="text-blue-500 mx-auto mb-2" /><p className="text-2xl font-bold text-gray-900">{totalApprenants}</p><p className="text-xs text-gray-500">Apprenants</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><Building2 size={24} className="text-green-500 mx-auto mb-2" /><p className="text-2xl font-bold text-gray-900">{sites.length}</p><p className="text-xs text-gray-500">Sites</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><BookOpen size={24} className="text-purple-500 mx-auto mb-2" /><p className="text-2xl font-bold text-gray-900">{formations.length}</p><p className="text-xs text-gray-500">Filières</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><TrendingUp size={24} className="text-green-500 mx-auto mb-2" /><p className="text-2xl font-bold text-green-600">{tauxReussite.toFixed(1)}%</p><p className="text-xs text-gray-500">Réussite</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><Target size={24} className="text-indigo-500 mx-auto mb-2" /><p className="text-2xl font-bold text-indigo-600">{moyenneGlobale.toFixed(2)}</p><p className="text-xs text-gray-500">Moy. Générale</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Moyenne par Filière</h3></div>
          <div className="p-6 space-y-4">
            {formationStats.map(fs => (
              <div key={fs.formation.id}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">{fs.formation.nom}</span><span className="text-gray-500">{fs.count} apprenants — {fs.moyenne.toFixed(2)}/20</span></div>
                <div className="w-full bg-gray-100 rounded-full h-3"><div className="bg-gradient-to-r from-indigo-50 to-purple-500 h-3 rounded-full" style={{ width: `${(fs.moyenne / 20) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Répartition des Mentions</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">Distribution globale des mentions obtenues</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <DonutChart data={donutData} />
          </div>
        </div>
      </div>
    </div>
  );
}
