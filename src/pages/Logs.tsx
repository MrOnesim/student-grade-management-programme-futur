import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Search, Calendar, User, CheckCircle, XCircle, BarChart3, Database } from 'lucide-react';

export default function Logs() {
  const { logs, users } = useData();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterResult, setFilterResult] = useState('');

  // 1. Unique actions for filtering list
  const uniqueActions = useMemo(() => {
    return [...new Set(logs.map(l => l.action))].sort();
  }, [logs]);

  // 2. Filtered logs list
  const filteredLogs = useMemo(() => {
    let list = [...logs];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(l => 
        l.userNom.toLowerCase().includes(s) || 
        l.details.toLowerCase().includes(s) ||
        l.action.toLowerCase().includes(s)
      );
    }
    if (filterAction) {
      list = list.filter(l => l.action === filterAction);
    }
    if (filterResult) {
      list = list.filter(l => l.resultat === filterResult);
    }
    return list;
  }, [logs, search, filterAction, filterResult]);

  // 3. Simple Stats for mini-dashboard
  const stats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter(l => l.resultat === 'succes').length;
    const failures = total - success;
    const successRate = total > 0 ? (success / total) * 100 : 100;

    // Find top active user
    const userCounts: Record<string, number> = {};
    logs.forEach(l => {
      userCounts[l.userNom] = (userCounts[l.userNom] || 0) + 1;
    });
    let topUser = 'Aucun';
    let maxActions = 0;
    Object.entries(userCounts).forEach(([u, count]) => {
      if (count > maxActions) {
        maxActions = count;
        topUser = u;
      }
    });

    return { total, success, failures, successRate, topUser, maxActions };
  }, [logs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Journal d'Audit</h1>
        <p className="text-gray-500 mt-1">Historique complet des actions effectuées sur l'application</p>
      </div>

      {/* Mini-Dashboard Logs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Actions enregistrées</p>
            <p className="text-2xl font-bold text-gray-950 mt-1">{stats.total}</p>
          </div>
          <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <Database size={20} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Taux de succès</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.successRate.toFixed(1)}%</p>
          </div>
          <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Échecs système</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.failures}</p>
          </div>
          <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
            <XCircle size={20} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Opérateur le plus actif</p>
            <p className="text-sm font-bold text-gray-900 mt-2 truncate max-w-[150px]" title={stats.topUser}>
              {stats.topUser}
            </p>
            <p className="text-xs text-gray-400">{stats.maxActions} action(s)</p>
          </div>
          <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
            <BarChart3 size={20} />
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par opérateur, détails, action..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">Toutes les catégories</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>

          <select
            value={filterResult}
            onChange={e => setFilterResult(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">Tous les statuts</option>
            <option value="succes">Succès</option>
            <option value="echec">Échec</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">
                  Horodatage
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-56">
                  Opérateur
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">
                  Catégorie
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Détails de l'action
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                  Résultat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredLogs.map((log, i) => {
                const operatorRole = users.find(u => u.id === log.userId)?.role || (log.userId === 'systeme' ? 'système' : 'inconnu');
                const badgeColor = 
                  log.action.includes('Suppression') ? 'bg-red-50 text-red-700 border-red-100' :
                  log.action.includes('Création') ? 'bg-green-50 text-green-700 border-green-100' :
                  log.action.includes('Saisie') || log.action.includes('Modification') ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  log.action.includes('Restauration') || log.action.includes('Réinitialisation') ? 'bg-purple-50 text-purple-700 border-purple-100' :
                  'bg-gray-50 text-gray-700 border-gray-100';

                return (
                  <tr 
                    key={log.id} 
                    className="hover:bg-gray-50/50 transition-opacity" 
                    style={{ animation: `fadeIn 0.2s ease-out ${Math.min(i, 20) * 0.02}s both` }}
                  >
                    <td className="px-6 py-3.5 text-sm text-gray-600 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="font-mono text-xs">{log.dateHeure}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                          {log.userNom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 leading-tight">{log.userNom}</p>
                          <p className="text-[10px] text-gray-400 font-medium uppercase">{operatorRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${badgeColor}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-600 break-words max-w-md">
                      {log.details}
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        log.resultat === 'succes' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {log.resultat === 'succes' ? (
                          <>
                            <CheckCircle size={12} className="text-green-600" />
                            <span>Succès</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} className="text-red-600" />
                            <span>Échec</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                    <Database size={28} className="mx-auto mb-2 opacity-30 animate-pulse" />
                    Aucun log ne correspond aux critères de recherche
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
