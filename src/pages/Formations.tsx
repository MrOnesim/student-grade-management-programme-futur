import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { Formation, Module, Matiere } from '../types';
import { BookOpen, ChevronDown, ChevronRight, Clock, Layers, GraduationCap, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

function emptyFormation(): Formation {
  return { id: `form-${Date.now()}`, nom: '', code: '', description: '', duree: 2, modules: [] };
}

function emptyModule(): Module {
  return { id: `mod-${Date.now()}`, nom: '', code: '', matieres: [] };
}

function emptyMatiere(): Matiere {
  return { id: `mat-${Date.now()}`, nom: '', code: '', coefficient: 1, bareme: 20 };
}

export default function Formations() {
  const { formations, addFormation, updateFormation, deleteFormation } = useData();
  const { showToast } = useToast();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['form-1', 'form-2']));
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState<Formation>(emptyFormation());
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const toggleFormation = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedIds(next);
  };

  const toggleModule = (id: string) => {
    const next = new Set(expandedModules);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedModules(next);
  };

  const openAdd = () => { setEditForm(emptyFormation()); setEditMode('add'); setShowModal(true); };
  const openEdit = (f: Formation) => { setEditForm({ ...f, modules: f.modules.map(m => ({ ...m, matieres: m.matieres.map(mt => ({ ...mt })) })) }); setEditMode('edit'); setShowModal(true); };

  const handleSave = () => {
    if (!editForm.nom || !editForm.code) return;
    if (editMode === 'add') addFormation(editForm);
    else updateFormation(editForm);
    setShowModal(false);
  };

  const handleDelete = () => {
    if (confirmDelete) { deleteFormation(confirmDelete); showToast('success', 'Formation supprimée'); setConfirmDelete(null); }
  };

  const addModule = () => setEditForm({ ...editForm, modules: [...editForm.modules, emptyModule()] });

  const updateModule = (idx: number, mod: Module) => {
    const mods = [...editForm.modules];
    mods[idx] = mod;
    setEditForm({ ...editForm, modules: mods });
  };

  const removeModule = (idx: number) => setEditForm({ ...editForm, modules: editForm.modules.filter((_, i) => i !== idx) });

  const addMatiere = (modIdx: number) => {
    const mods = [...editForm.modules];
    mods[modIdx] = { ...mods[modIdx], matieres: [...mods[modIdx].matieres, emptyMatiere()] };
    setEditForm({ ...editForm, modules: mods });
  };

  const updateMatiere = (modIdx: number, matIdx: number, mat: Matiere) => {
    const mods = [...editForm.modules];
    const matieres = [...mods[modIdx].matieres];
    matieres[matIdx] = mat;
    mods[modIdx] = { ...mods[modIdx], matieres };
    setEditForm({ ...editForm, modules: mods });
  };

  const removeMatiere = (modIdx: number, matIdx: number) => {
    const mods = [...editForm.modules];
    mods[modIdx] = { ...mods[modIdx], matieres: mods[modIdx].matieres.filter((_, i) => i !== matIdx) };
    setEditForm({ ...editForm, modules: mods });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formations</h1>
          <p className="text-gray-500 mt-1">{formations.length} formations disponibles</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">
          <Plus size={16} /> Nouvelle Formation
        </button>
      </div>

      <div className="space-y-4">
        {formations.map(formation => (
          <div key={formation.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleFormation(formation.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{formation.nom}</h3>
                  <p className="text-sm text-gray-500">{formation.code} — {formation.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); openEdit(formation); }} className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500 min-w-[36px] min-h-[36px]" title="Modifier"><Edit2 size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(formation.id); }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 min-w-[36px] min-h-[36px]" title="Supprimer"><Trash2 size={14} /></button>
                <span className="flex items-center gap-1 text-sm text-gray-400 ml-2"><Clock size={14} /> {formation.duree} mois</span>
                <span className="flex items-center gap-1 text-sm text-gray-400 mr-2"><Layers size={14} /> {formation.modules.length} modules</span>
                {expandedIds.has(formation.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
            </button>

            {expandedIds.has(formation.id) && (
              <div className="border-t border-gray-100">
                {formation.modules.map(mod => {
                  const totalCoeff = mod.matieres.reduce((s, m) => s + m.coefficient, 0);
                  const isModOpen = expandedModules.has(mod.id);
                  return (
                    <div key={mod.id} className="border-b border-gray-50 last:border-b-0">
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <GraduationCap size={16} className="text-purple-500" />
                          <span className="text-sm font-medium text-gray-700">{mod.nom}</span>
                          <span className="text-xs text-gray-400">({mod.code})</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{mod.matieres.length} matières</span>
                          {isModOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                      </button>
                      {isModOpen && (
                        <div className="px-6 pb-4">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                                <th className="py-2">Code</th>
                                <th className="py-2">Matière</th>
                                <th className="py-2 text-center">Coefficient</th>
                                <th className="py-2 text-center">Barème</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mod.matieres.map(mat => (
                                <tr key={mat.id} className="border-b border-gray-50 last:border-b-0">
                                  <td className="py-2 text-sm font-mono text-gray-500">{mat.code}</td>
                                  <td className="py-2 text-sm text-gray-800">{mat.nom}</td>
                                  <td className="py-2 text-sm text-center font-medium text-indigo-600">{mat.coefficient}</td>
                                  <td className="py-2 text-sm text-center text-gray-600">/ {mat.bareme}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p className="text-xs text-gray-400 mt-2">
                            Somme des coefficients du module: <span className="font-medium text-gray-600">{totalCoeff}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">{editMode === 'add' ? 'Nouvelle Formation' : 'Modifier Formation'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label><input type="text" value={editForm.nom} onChange={e => setEditForm({ ...editForm, nom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Code *</label><input type="text" value={editForm.code} onChange={e => setEditForm({ ...editForm, code: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Durée (mois)</label><input type="number" min="1" value={editForm.duree} onChange={e => setEditForm({ ...editForm, duree: parseInt(e.target.value) || 2 })} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Description</label><textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Modules ({editForm.modules.length})</h4>
                  <button onClick={addModule} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg"><Plus size={14} /> Ajouter un module</button>
                </div>
                {editForm.modules.map((mod, mi) => (
                  <div key={mi} className="border border-gray-200 rounded-lg p-4 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Module {mi + 1}</span>
                      <button onClick={() => removeModule(mi)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div><label className="block text-xs text-gray-500 mb-1">Nom</label><input type="text" value={mod.nom} onChange={e => updateModule(mi, { ...mod, nom: e.target.value })} className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                      <div><label className="block text-xs text-gray-500 mb-1">Code</label><input type="text" value={mod.code} onChange={e => updateModule(mi, { ...mod, code: e.target.value })} className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Matières ({mod.matieres.length})</span>
                        <button onClick={() => addMatiere(mi)} className="text-xs text-indigo-600 hover:text-indigo-800">+ Ajouter matière</button>
                      </div>
                      {mod.matieres.map((mat, ti) => (
                        <div key={ti} className="flex items-center gap-2 mb-2">
                          <input type="text" placeholder="Nom" value={mat.nom} onChange={e => updateMatiere(mi, ti, { ...mat, nom: e.target.value })} className="flex-1 px-2 py-1.5 rounded border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
                          <input type="text" placeholder="Code" value={mat.code} onChange={e => updateMatiere(mi, ti, { ...mat, code: e.target.value })} className="w-16 px-2 py-1.5 rounded border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
                          <input type="number" placeholder="Coef" value={mat.coefficient} onChange={e => updateMatiere(mi, ti, { ...mat, coefficient: parseInt(e.target.value) || 1 })} className="w-16 px-2 py-1.5 rounded border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
                          <input type="number" placeholder="Barème" value={mat.bareme} onChange={e => updateMatiere(mi, ti, { ...mat, bareme: parseInt(e.target.value) || 20 })} className="w-16 px-2 py-1.5 rounded border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
                          <button onClick={() => removeMatiere(mi, ti)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"><Save size={16} />{editMode === 'add' ? 'Créer' : 'Enregistrer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!confirmDelete} title="Supprimer la formation" message="Cette action est irréversible. Les notes et résultats associés seront conservés." confirmLabel="Supprimer" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
