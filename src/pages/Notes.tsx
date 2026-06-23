import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import { STATUT_NOTE_LABELS, STATUT_NOTE_COLORS, STATUT_APPRENANT_LABELS } from '../data/mockData';
import { Note, StatutNote, StatutApprenantNote } from '../types';
import { Save, CheckCircle, AlertCircle, Edit2, Clock, Send, Users as UsersIcon } from 'lucide-react';

export default function Notes() {
  const { user } = useAuth();
  const { apprenants, sites, formations, notes: allNotes, evaluations: allEvaluations, setNotes: setAllNotes } = useData();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'simple' | 'bulk'>('simple');

  // Simple mode state
  const [selectedApprenant, setSelectedApprenant] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [valeur, setValeur] = useState('');
  const [statutApprenant, setStatutApprenant] = useState<StatutApprenantNote>('present');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Bulk mode state
  const [bulkEvaluation, setBulkEvaluation] = useState('');
  const [bulkMatiere, setBulkMatiere] = useState('');
  const [bulkNotes, setBulkNotes] = useState<Record<string, string>>({});

  const visibleApprenants = useMemo(() => {
    let list = [...apprenants];
    if (user?.role === 'responsable' && user.siteId) list = list.filter(a => a.siteId === user.siteId);
    if (user?.role === 'formateur' && user.formationId) list = list.filter(a => a.formationId === user.formationId);
    return list;
  }, [user]);

  const apprenant = visibleApprenants.find(a => a.id === selectedApprenant);
  const formation = apprenant ? formations.find(f => f.id === apprenant.formationId) : null;

  const visibleEvaluations = useMemo(() => {
    if (!apprenant) return [];
    return allEvaluations.filter(e => e.formationId === apprenant.formationId && e.siteId === apprenant.siteId && e.promotion === apprenant.promotion);
  }, [allEvaluations, apprenant]);

  const matieres = formation ? formation.modules.flatMap(m => m.matieres) : [];

  const notesApprenant = useMemo(() => {
    if (!selectedApprenant) return [];
    return allNotes.filter(n => n.apprenantId === selectedApprenant);
  }, [allNotes, selectedApprenant]);

  const userNotes = useMemo(() => {
    if (user?.role === 'formateur') return notesApprenant.filter(n => n.formateurId === user.id);
    return notesApprenant;
  }, [notesApprenant, user]);

  const handleSave = () => {
    const valeurNum = parseFloat(valeur);
    if (!selectedApprenant || !selectedMatiere || !selectedEvaluation) {
      showToast('error', 'Veuillez remplir tous les champs.');
      return;
    }
    if (statutApprenant === 'present' && (isNaN(valeurNum) || valeurNum < 0 || valeurNum > 20)) {
      showToast('error', 'Veuillez saisir une note valide entre 0 et 20.');
      return;
    }

    if (editingNote) {
      setAllNotes(prev => prev.map(n =>
        n.id === editingNote.id
          ? { ...n, valeur: statutApprenant === 'present' ? valeurNum : null, statutApprenant, evaluationId: selectedEvaluation, matiereId: selectedMatiere, dateModification: new Date().toISOString().split('T')[0], modifiePar: user?.id, statut: 'en_attente' as StatutNote }
          : n
      ));
      showToast('success', 'Note modifiée et soumise pour validation.');
      setEditingNote(null);
    } else {
      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        apprenantId: selectedApprenant,
        evaluationId: selectedEvaluation,
        matiereId: selectedMatiere,
        formateurId: user?.id || 'user-12',
        valeur: statutApprenant === 'present' ? valeurNum : null,
        statutApprenant,
        dateSaisie: new Date().toISOString().split('T')[0],
        statut: 'en_attente',
      };
      setAllNotes(prev => [...prev, newNote]);
      showToast('success', 'Note enregistrée et soumise pour validation.');
    }
    setValeur('');
  };

  const handleBulkSave = () => {
    if (!bulkEvaluation || !bulkMatiere) {
      showToast('error', 'Sélectionnez une évaluation et une matière.');
      return;
    }
    const ev = allEvaluations.find(e => e.id === bulkEvaluation);
    if (!ev) return;
    const targetApprenants = visibleApprenants.filter(a =>
      a.formationId === ev.formationId && a.siteId === ev.siteId && a.promotion === ev.promotion
    );
    let count = 0;
    setAllNotes(prev => {
      const updated = [...prev];
      for (const app of targetApprenants) {
        const val = bulkNotes[app.id];
        if (!val || val.trim() === '') continue;
        const numVal = parseFloat(val);
        if (isNaN(numVal) || numVal < 0 || numVal > 20) continue;
        const existingIdx = updated.findIndex(n =>
          n.apprenantId === app.id && n.evaluationId === bulkEvaluation && n.matiereId === bulkMatiere
        );
        const note: Note = {
          id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          apprenantId: app.id,
          evaluationId: bulkEvaluation,
          matiereId: bulkMatiere,
          formateurId: user?.id || ev.formateurId,
          valeur: numVal,
          statutApprenant: 'present',
          dateSaisie: new Date().toISOString().split('T')[0],
          statut: 'en_attente',
        };
        if (existingIdx >= 0) updated[existingIdx] = note;
        else updated.push(note);
        count++;
      }
      return updated;
    });
    showToast('success', `${count} note(s) enregistrée(s) en groupe.`);
    setBulkNotes({});
  };

  const handleEdit = (note: Note) => {
    setMode('simple');
    setEditingNote(note);
    setSelectedEvaluation(note.evaluationId);
    setValeur(note.valeur?.toString() || '');
    setStatutApprenant(note.statutApprenant);
    setSelectedMatiere(note.matiereId);
    setSelectedApprenant(note.apprenantId);
  };

  const handleSubmitForValidation = (noteId: string) => {
    setAllNotes(prev => prev.map(n => n.id === noteId ? { ...n, statut: 'en_attente' as StatutNote } : n));
    showToast('success', 'Note soumise pour validation.');
  };

  const groupedNotes = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    userNotes.forEach(n => {
      if (!groups[n.matiereId]) groups[n.matiereId] = [];
      groups[n.matiereId].push(n);
    });
    return groups;
  }, [userNotes]);

  // Bulk evaluation context
  const bulkEv = allEvaluations.find(e => e.id === bulkEvaluation);
  const bulkFormation = bulkEv ? formations.find(f => f.id === bulkEv.formationId) : null;
  const bulkMatieres = bulkFormation ? bulkFormation.modules.flatMap(m => m.matieres) : [];
  const bulkTargetApprenants = useMemo(() => {
    if (!bulkEv) return [];
    return visibleApprenants.filter(a => a.formationId === bulkEv.formationId && a.siteId === bulkEv.siteId && a.promotion === bulkEv.promotion);
  }, [visibleApprenants, bulkEv]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saisie des Notes</h1>
          <p className="text-gray-500 mt-1">
            {user?.role === 'formateur' ? `Filière: ${formations.find(f => f.id === user.formationId)?.nom || '—'}` : 'Enregistrer les notes des évaluations'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setMode('simple')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'simple' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Saisie simple</button>
          <button onClick={() => { setMode('bulk'); setBulkNotes({}); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'bulk' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}><UsersIcon size={16} className="inline mr-1" />Saisie groupée</button>
        </div>
      </div>

      {mode === 'simple' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{editingNote ? 'Modifier une note' : 'Nouvelle saisie'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apprenant</label>
                <select value={selectedApprenant} onChange={e => { setSelectedApprenant(e.target.value); setSelectedEvaluation(''); setSelectedMatiere(''); }}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" disabled={!!editingNote}>
                  <option value="">Sélectionner un apprenant</option>
                  {visibleApprenants.map(a => {
                    const f = formations.find(fr => fr.id === a.formationId);
                    const s = sites.find(si => si.id === a.siteId);
                    return <option key={a.id} value={a.id}>{a.prenom} {a.nom} — {f?.nom || ''} ({s?.nom || ''})</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Évaluation</label>
                <select value={selectedEvaluation} onChange={e => setSelectedEvaluation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" disabled={!selectedApprenant}>
                  <option value="">Sélectionner une évaluation</option>
                  {visibleEvaluations.map(ev => <option key={ev.id} value={ev.id}>{ev.titre} ({ev.type} — coef {ev.coefficient})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                <select value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" disabled={!selectedApprenant}>
                  <option value="">Sélectionner une matière</option>
                  {matieres.map(m => <option key={m.id} value={m.id}>{m.nom} (coeff. {m.coefficient})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut de l'apprenant <span className="text-gray-400 font-normal cursor-help" title="Absent = note 0, Dispensé = non compté dans la moyenne">ⓘ</span></label>
                <select value={statutApprenant} onChange={e => setStatutApprenant(e.target.value as StatutApprenantNote)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="present">Présent</option><option value="absent">Absent</option><option value="dispense">Dispensé</option>
                </select>
              </div>
              {statutApprenant === 'present' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note (sur 20)</label>
                  <input type="number" min="0" max="20" step="0.25" value={valeur} onChange={e => setValeur(e.target.value)} placeholder="Ex: 14.5" className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              )}
              <button onClick={handleSave} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"><Save size={16} />{editingNote ? 'Modifier' : 'Enregistrer'}</button>
              {editingNote && (
                <button onClick={() => { setEditingNote(null); setValeur(''); setStatutApprenant('present'); }} className="w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
              )}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Workflow de validation</p>
                  <p className="text-xs text-blue-700 mt-1">1. Formateur saisit la note → <strong>En attente</strong><br />2. Responsable site vérifie → <strong>Valide</strong> ou <strong>Rejette</strong><br />3. Si rejetée → le formateur corrige et resoumet</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Notes enregistrées</h3>
            {!selectedApprenant ? (
              <p className="text-sm text-gray-400">Sélectionnez un apprenant</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {Object.entries(groupedNotes).map(([matiereId, matNotes]) => {
                  const mat = matieres.find(m => m.id === matiereId);
                  return (
                    <div key={matiereId} className="border border-gray-100 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800 mb-2">{mat?.nom || 'Matière inconnue'}</p>
                      <div className="space-y-1.5">
                        {matNotes.map(n => {
                          const ev = allEvaluations.find(e => e.id === n.evaluationId);
                          const canModify = n.statut === 'brouillon' || n.statut === 'rejetee' || n.statut === 'en_attente';
                          const isEditing = editingNote?.id === n.id;
                          return (
                            <div key={n.id} className={`flex items-center justify-between text-sm bg-gray-50 rounded p-2 ${isEditing ? 'ring-2 ring-indigo-400 bg-indigo-50' : ''}`}>
                              <div>
                                <span className="text-xs text-gray-400">{ev?.type || '?'} — {ev?.titre?.substring(0, 30) || 'Éval.'}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-medium text-gray-800">{n.statutApprenant === 'present' ? `${n.valeur?.toFixed(2) || '?'}/20` : STATUT_APPRENANT_LABELS[n.statutApprenant]}</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${STATUT_NOTE_COLORS[n.statut]}`}>{STATUT_NOTE_LABELS[n.statut]}</span>
                                </div>
                                {n.statut === 'rejetee' && n.motifRejet && (
                                  <p className="text-xs text-red-500 mt-1">Motif: {n.motifRejet}</p>
                                )}
                                {n.validateurId && n.dateValidation && n.statut === 'validee' && (
                                  <p className="text-xs text-green-500 mt-0.5">Validé le {n.dateValidation}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {n.statut === 'brouillon' && (
                                  <button onClick={() => handleSubmitForValidation(n.id)} title="Soumettre pour validation" className="p-1 hover:bg-blue-100 rounded text-blue-500"><Send size={12} /></button>
                                )}
                                {canModify && (
                                  <button onClick={() => handleEdit(n)} className="p-1 hover:bg-indigo-50 rounded text-indigo-500"><Edit2 size={12} /></button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {Object.keys(groupedNotes).length === 0 && <p className="text-sm text-gray-400">Aucune note enregistrée</p>}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* BULK MODE */
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><UsersIcon size={18} className="text-indigo-500" />Saisie groupée de notes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Évaluation</label>
              <select value={bulkEvaluation} onChange={e => { setBulkEvaluation(e.target.value); setBulkMatiere(''); setBulkNotes({}); }}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">Sélectionner une évaluation</option>
                {allEvaluations.map(ev => <option key={ev.id} value={ev.id}>{ev.titre} ({ev.type})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
              <select value={bulkMatiere} onChange={e => setBulkMatiere(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" disabled={!bulkEvaluation}>
                <option value="">Sélectionner une matière</option>
                {bulkMatieres.map(m => <option key={m.id} value={m.id}>{m.nom} (coeff. {m.coefficient})</option>)}
              </select>
            </div>
          </div>

          {bulkEvaluation && bulkMatiere && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Apprenant</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Site</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Note /20</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bulkTargetApprenants.map(app => {
                      const existingNote = allNotes.find(n =>
                        n.apprenantId === app.id && n.evaluationId === bulkEvaluation && n.matiereId === bulkMatiere
                      );
                      return (
                        <tr key={app.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5">
                            <p className="text-sm font-medium text-gray-900">{app.prenom} {app.nom}</p>
                            <p className="text-xs text-gray-400 font-mono">{app.matricule}</p>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-600">{sites.find(s => s.id === app.siteId)?.nom || '-'}</td>
                          <td className="px-4 py-2.5 text-center">
                            <input
                              type="number" min="0" max="20" step="0.25"
                              value={bulkNotes[app.id] ?? existingNote?.valeur?.toString() ?? ''}
                              onChange={e => setBulkNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                              placeholder="Note"
                              className="w-24 px-3 py-2 rounded-lg border border-gray-300 text-sm text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            {existingNote && (
                              <span className="text-xs text-gray-400 ml-2">({existingNote.valeur?.toFixed(1)})</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={handleBulkSave} className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                  <Save size={16} /> Enregistrer toutes les notes
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
