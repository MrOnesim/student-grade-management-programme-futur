import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import RejectModal from '../components/RejectModal';
import { STATUT_NOTE_LABELS, STATUT_NOTE_COLORS } from '../data/mockData';
import { CheckCircle, XCircle, Clock, Search } from 'lucide-react';

export default function Validation() {
  const { user } = useAuth();
  const { notes, evaluations, apprenants, formations, sites, setNotes } = useData();
  const { showToast } = useToast();
  const [filterFormation, setFilterFormation] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (key: string) => {
    setSortKey(prev => prev === key ? key : key);
    setSortDir(prev => sortKey === key ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
  };

  const SortBtn = ({ label, sortKey: sk }: { label: string; sortKey: string }) => (
    <button onClick={() => toggleSort(sk)} className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors">
      {label}
      {sortKey === sk ? <span className="text-indigo-500 text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span> : <span className="text-gray-300 text-xs">⇅</span>}
    </button>
  );

  const pendingNotes = useMemo(() => {
    let list = notes.filter(n => n.statut === 'en_attente');
    if (user?.role === 'responsable' && user.siteId) {
      const siteEvals = evaluations.filter(e => e.siteId === user.siteId).map(e => e.id);
      list = list.filter(n => siteEvals.includes(n.evaluationId));
    }
    if (filterFormation) {
      const formApprenants = apprenants.filter(a => a.formationId === filterFormation).map(a => a.id);
      list = list.filter(n => formApprenants.includes(n.apprenantId));
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(n => {
        const app = apprenants.find(a => a.id === n.apprenantId);
        return app?.nom.toLowerCase().includes(s) || app?.prenom.toLowerCase().includes(s) || app?.matricule.toLowerCase().includes(s);
      });
    }
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const getVal = (n: typeof a) => {
          if (sortKey === 'apprenant') return `${getStudentName(n.apprenantId)} ${getStudentMatricule(n.apprenantId)}`;
          if (sortKey === 'note') return n.valeur || 0;
          if (sortKey === 'evaluation') return getEvaluationTitle(n.evaluationId);
          return '';
        };
        const va = getVal(a), vb = getVal(b);
        if (va == null) return 1; if (vb == null) return -1;
        let cmp: number;
        if (typeof va === 'string' && typeof vb === 'string') cmp = va.localeCompare(vb, 'fr', { sensitivity: 'base' });
        else cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return list;
  }, [notes, evaluations, apprenants, user, filterFormation, search, sortKey, sortDir]);

  const [rejectNoteId, setRejectNoteId] = useState<string | null>(null);

  const handleValidate = (noteId: string) => {
    setNotes(prev => prev.map(n =>
      n.id === noteId ? { ...n, statut: 'validee' as const, validateurId: user?.id, dateValidation: new Date().toISOString().split('T')[0] } : n
    ));
    showToast('success', 'Note validée avec succès');
  };

  const handleReject = (motif: string) => {
    if (!rejectNoteId) return;
    setNotes(prev => prev.map(n =>
      n.id === rejectNoteId ? { ...n, statut: 'rejetee' as const, validateurId: user?.id, dateValidation: new Date().toISOString().split('T')[0], motifRejet: motif } : n
    ));
    showToast('success', 'Note rejetée');
    setRejectNoteId(null);
  };

  const getStudentName = (id: string) => {
    const a = apprenants.find(ap => ap.id === id);
    return a ? `${a.prenom} ${a.nom}` : '—';
  };

  const getStudentMatricule = (id: string) => apprenants.find(a => a.id === id)?.matricule || '—';
  const getEvaluationTitle = (id: string) => evaluations.find(e => e.id === id)?.titre || '—';
  const getMatiereName = (note: typeof notes[0]) => {
    for (const f of formations) {
      for (const m of f.modules) {
        for (const mat of m.matieres) {
          if (mat.id === note.matiereId) return mat.nom;
        }
      }
    }
    return '—';
  };
  const getFormationName = (appId: string) => {
    const a = apprenants.find(ap => ap.id === appId);
    if (!a) return '—';
    return formations.find(f => f.id === a.formationId)?.nom || '—';
  };
  const getSiteName = (appId: string) => {
    const a = apprenants.find(ap => ap.id === appId);
    if (!a) return '—';
    return sites.find(s => s.id === a.siteId)?.nom || '—';
  };

  if (user?.role !== 'responsable' && user?.role !== 'admin' && user?.role !== 'direction') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Vous n'avez pas accès à cette page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Validation des Notes</h1>
        <p className="text-gray-500 mt-1">
          {pendingNotes.length} note(s) en attente de validation
          {user?.role === 'responsable' && ` — ${sites.find(s => s.id === user.siteId)?.nom || ''}`}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher un apprenant..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <select value={filterFormation} onChange={e => setFilterFormation(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">Toutes les formations</option>
            {formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase"><SortBtn label="Apprenant" sortKey="apprenant" /></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Formation</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase"><SortBtn label="Évaluation" sortKey="evaluation" /></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Matière</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase"><SortBtn label="Note" sortKey="note" /></th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingNotes.map((note, i) => (
                <tr key={note.id} className="hover:bg-gray-50 transition-opacity" style={{ animation: `fadeIn 0.2s ease-out ${i * 0.02}s both` }}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{getStudentName(note.apprenantId)}</p>
                    <p className="text-xs text-gray-400 font-mono">{getStudentMatricule(note.apprenantId)}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getFormationName(note.apprenantId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getSiteName(note.apprenantId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{getEvaluationTitle(note.evaluationId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getMatiereName(note)}</td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-indigo-600">
                    {note.statutApprenant === 'present' ? `${note.valeur?.toFixed(2)}/20` : note.statutApprenant}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_NOTE_COLORS[note.statut]}`}>
                      {STATUT_NOTE_LABELS[note.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleValidate(note.id)}
                        className="p-1.5 hover:bg-green-50 rounded-lg text-green-600"
                        title="Valider"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => setRejectNoteId(note.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                        title="Rejeter"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingNotes.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                    <Clock size={24} className="mx-auto mb-2 opacity-50" />
                    Aucune note en attente de validation
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RejectModal open={!!rejectNoteId} onConfirm={handleReject} onCancel={() => setRejectNoteId(null)} />

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
