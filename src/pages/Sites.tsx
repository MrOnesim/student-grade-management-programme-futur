import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { calculerResultats } from '../utils/calculs';
import { Building2, MapPin, Users, BookOpen, TrendingUp, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Site } from '../types';

function emptySite(): Site {
  return { id: `site-${Date.now()}`, nom: '', code: '', ville: '', dateCreation: new Date().toISOString().split('T')[0], actif: true };
}

export default function Sites() {
  const { sites, apprenants, formations, notes, evaluations, addSite, updateSite, deleteSite } = useData();
  const { showToast } = useToast();
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState<Site>(emptySite());
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const results = useMemo(() => calculerResultats(apprenants, formations, sites, notes, evaluations), [apprenants, formations, sites, notes, evaluations]);

  const openAdd = () => { setEditForm(emptySite()); setEditMode('add'); setErrors({}); setShowModal(true); };
  const openEdit = (s: Site) => { setEditForm({ ...s }); setEditMode('edit'); setErrors({}); setShowModal(true); };

  const handleSave = () => {
    const errs: Record<string, boolean> = {};
    if (!editForm.nom) errs.nom = true;
    if (!editForm.code) errs.code = true;
    if (sites.some(s => s.code === editForm.code && s.id !== editForm.id)) errs.code = true;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (editMode === 'add') {
      addSite(editForm);
      showToast('success', 'Site créé avec succès');
    } else {
      updateSite(editForm);
      showToast('success', 'Site modifié avec succès');
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (confirmDelete) { deleteSite(confirmDelete); showToast('success', 'Site supprimé'); setConfirmDelete(null); }
  };

  const inputCls = (field: string) =>
    `w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  const siteStats = useMemo(() => {
    return sites.map(site => {
      const siteApprenants = apprenants.filter(a => a.siteId === site.id);
      const siteResults = results.filter(r => r.siteId === site.id);
      const siteFormations = [...new Set(siteApprenants.map(a => a.formationId))];
      const bestMoy = siteResults.length > 0 ? Math.max(...siteResults.map(r => r.moyenneGenerale)) : 0;
      const reussis = siteResults.filter(r => r.moyenneGenerale >= 10).length;
      const countWithNotes = siteResults.length;
      return { ...site, totalApprenants: siteApprenants.length, totalFormations: siteFormations.length, tauxReussite: countWithNotes > 0 ? (reussis / countWithNotes) * 100 : 0, meilleureMoyenne: bestMoy, moyenneSite: countWithNotes > 0 ? siteResults.reduce((s, r) => s + r.moyenneGenerale, 0) / countWithNotes : 0, apprenants: siteApprenants, formationIds: siteFormations };
    });
  }, [sites, apprenants, results]);

  const selectedStats = selectedSite ? siteStats.find(s => s.id === selectedSite) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Sites de Formation</h1><p className="text-gray-500 mt-1">{sites.length} sites</p></div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"><Plus size={16} /> Nouveau Site</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {siteStats.map(site => (
          <div key={site.id} className={`relative p-5 rounded-xl border-2 transition-all ${selectedSite === site.id ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}>
            <div className="absolute top-3 right-3 flex gap-1">
              <button onClick={() => openEdit(site)} className="p-2 hover:bg-white rounded-lg text-amber-500 min-w-[36px] min-h-[36px]" title="Modifier"><Edit2 size={15} /></button>
              <button onClick={() => setConfirmDelete(site.id)} className="p-2 hover:bg-white rounded-lg text-red-500 min-w-[36px] min-h-[36px]" title="Supprimer"><Trash2 size={15} /></button>
            </div>
            <button onClick={() => setSelectedSite(selectedSite === site.id ? null : site.id)} className="w-full text-left">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center"><Building2 className="h-5 w-5 text-indigo-600" /></div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${site.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{site.actif ? 'Actif' : 'Inactif'}</span>
              </div>
              <h3 className="font-bold text-gray-900">{site.nom}</h3>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500"><MapPin size={12} /> {site.ville}</div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                <div><p className="text-xs text-gray-400">Apprenants</p><p className="font-bold text-gray-800">{site.totalApprenants}</p></div>
                <div><p className="text-xs text-gray-400">Réussite</p><p className={`font-bold ${site.tauxReussite >= 60 ? 'text-green-600' : 'text-red-500'}`}>{site.tauxReussite.toFixed(0)}%</p></div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {selectedStats && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Building2 size={18} className="text-indigo-500" />Détails — {selectedStats.nom} ({selectedStats.ville})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-xl"><Users size={20} className="text-blue-500 mb-1" /><p className="text-2xl font-bold text-gray-800">{selectedStats.totalApprenants}</p><p className="text-xs text-gray-500">Apprenants</p></div>
            <div className="p-4 bg-purple-50 rounded-xl"><BookOpen size={20} className="text-purple-500 mb-1" /><p className="text-2xl font-bold text-gray-800">{selectedStats.totalFormations}</p><p className="text-xs text-gray-500">Filières</p></div>
            <div className="p-4 bg-green-50 rounded-xl"><TrendingUp size={20} className="text-green-500 mb-1" /><p className="text-2xl font-bold text-green-600">{selectedStats.tauxReussite.toFixed(1)}%</p><p className="text-xs text-gray-500">Réussite</p></div>
            <div className="p-4 bg-amber-50 rounded-xl"><TrendingUp size={20} className="text-amber-500 mb-1" /><p className="text-2xl font-bold text-amber-600">{selectedStats.meilleureMoyenne.toFixed(2)}</p><p className="text-xs text-gray-500">Meilleure moy.</p></div>
          </div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Apprenants du site</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Matricule</th><th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Nom</th><th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Formation</th><th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Promotion</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {selectedStats.apprenants.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs font-mono text-gray-600">{app.matricule}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{app.prenom} {app.nom}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{formations.find(f => f.id === app.formationId)?.nom || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{app.promotion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editMode === 'add' ? 'Nouveau Site' : 'Modifier Site'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label><input type="text" value={editForm.nom} onChange={e => setEditForm({ ...editForm, nom: e.target.value })} className={inputCls('nom')} /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Code *</label><input type="text" value={editForm.code} onChange={e => setEditForm({ ...editForm, code: e.target.value })} className={inputCls('code')} />{errors.code && <p className="text-xs text-red-500 mt-1">Ce code existe déjà ou est invalide</p>}</div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Ville</label><input type="text" value={editForm.ville} onChange={e => setEditForm({ ...editForm, ville: e.target.value })} className={inputCls('ville')} /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Actif</label><select value={editForm.actif ? 'true' : 'false'} onChange={e => setEditForm({ ...editForm, actif: e.target.value === 'true' })} className={inputCls('actif')}><option value="true">Oui</option><option value="false">Non</option></select></div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"><Save size={16} />{editMode === 'add' ? 'Créer' : 'Enregistrer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!confirmDelete} title="Supprimer le site" message="Cette action est irréversible. Les apprenants rattachés à ce site ne seront pas supprimés." confirmLabel="Supprimer" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
