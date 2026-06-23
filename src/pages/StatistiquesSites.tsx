import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { calculerResultats } from '../utils/calculs';
import { Building2, Users, TrendingUp, Target, Award } from 'lucide-react';

export default function StatistiquesSites() {
  const { apprenants, formations, sites, notes, evaluations } = useData();
  const results = useMemo(() => calculerResultats(apprenants, formations, sites, notes, evaluations), [apprenants, formations, sites, notes, evaluations]);

  const siteStats = useMemo(() => {
    return sites.map(site => {
      const sr = results.filter(r => r.siteId === site.id);
      const reussis = sr.filter(r => r.moyenneGenerale >= 10).length;
      const best = sr.length > 0 ? Math.max(...sr.map(r => r.moyenneGenerale)) : 0;
      const bestStudent = sr.find(r => r.moyenneGenerale === best);
      return { site, count: sr.length, taux: sr.length > 0 ? (reussis / sr.length) * 100 : 0, moyenne: sr.length > 0 ? sr.reduce((s, r) => s + r.moyenneGenerale, 0) / sr.length : 0, best, bestStudent };
    });
  }, [results]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Statistiques par Site</h1><p className="text-gray-500 mt-1">Comparaison des performances des sites</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {siteStats.map(ss => (
          <div key={ss.site.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center"><Building2 className="h-6 w-6 text-indigo-600" /></div>
              <div><h3 className="font-bold text-gray-900 text-lg">{ss.site.nom}</h3><p className="text-sm text-gray-500">{ss.site.ville}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg"><Users size={16} className="text-blue-500 mb-1" /><p className="text-xl font-bold">{ss.count}</p><p className="text-xs text-gray-500">Apprenants</p></div>
              <div className="p-3 bg-green-50 rounded-lg"><TrendingUp size={16} className="text-green-500 mb-1" /><p className={`text-xl font-bold ${ss.taux >= 60 ? 'text-green-600' : 'text-red-500'}`}>{ss.taux.toFixed(1)}%</p><p className="text-xs text-gray-500">Réussite</p></div>
              <div className="p-3 bg-purple-50 rounded-lg"><Target size={16} className="text-purple-500 mb-1" /><p className="text-xl font-bold text-purple-600">{ss.moyenne.toFixed(2)}</p><p className="text-xs text-gray-500">Moyenne site</p></div>
              <div className="p-3 bg-amber-50 rounded-lg"><Award size={16} className="text-amber-500 mb-1" /><p className="text-xl font-bold text-amber-600">{ss.best.toFixed(2)}</p><p className="text-xs text-gray-500">Meilleure moy.</p></div>
            </div>
            {ss.bestStudent && (
              <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                <p className="text-xs text-gray-500">Meilleur(e) apprenant(e)</p>
                <p className="text-sm font-medium text-gray-800">{ss.bestStudent.apprenantPrenom} {ss.bestStudent.apprenantNom} — {ss.best.toFixed(2)}/20</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
