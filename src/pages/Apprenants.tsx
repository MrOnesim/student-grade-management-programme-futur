import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { useSort } from '../utils/useSort';
import { Search, Eye, UserPlus, X, Edit2, Trash2, Save, Download } from 'lucide-react';
import { Apprenant } from '../types';

function emptyApprenant(): Apprenant {
  return {
    id: `app-${Date.now()}`,
    matricule: '', nom: '', prenom: '', sexe: 'M',
    dateNaissance: '', telephone: '', email: '', adresse: '',
    formationId: '', siteId: '', promotion: '',
    dateInscription: new Date().toISOString().split('T')[0],
    statut: 'actif',
  };
}

export default function Apprenants() {
  const { user } = useAuth();
  const { apprenants, sites, formations, addApprenant, updateApprenant, deleteApprenant } = useData();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filterSite, setFilterSite] = useState(searchParams.get('site') || '');
  const [filterFormation, setFilterFormation] = useState(searchParams.get('formation') || '');
  const [filterPromotion, setFilterPromotion] = useState(searchParams.get('promotion') || '');
  const [selectedApprenant, setSelectedApprenant] = useState<Apprenant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState<Apprenant>(emptyApprenant());
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (filterSite) params.site = filterSite;
    if (filterFormation) params.formation = filterFormation;
    if (filterPromotion) params.promotion = filterPromotion;
    setSearchParams(params, { replace: true });
  }, [search, filterSite, filterFormation, filterPromotion, setSearchParams]);

  const openAdd = () => { setEditForm(emptyApprenant()); setEditMode('add'); setErrors({}); setShowModal(true); };
  const openEdit = (a: Apprenant) => { setEditForm({ ...a }); setEditMode('edit'); setErrors({}); setShowModal(true); };

  const handleSave = () => {
    const errs: Record<string, boolean> = {};
    if (!editForm.nom) errs.nom = true;
    if (!editForm.prenom) errs.prenom = true;
    if (!editForm.formationId) errs.formationId = true;
    if (!editForm.siteId) errs.siteId = true;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (editMode === 'add') {
      addApprenant({ ...editForm, id: `app-${Date.now()}`, matricule: editForm.matricule || `FUT-${Math.random().toString(36).substring(2, 8).toUpperCase()}` });
      showToast('success', 'Apprenant créé avec succès');
    } else {
      updateApprenant(editForm);
      showToast('success', 'Apprenant modifié avec succès');
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (confirmDelete) { deleteApprenant(confirmDelete); showToast('success', 'Apprenant supprimé'); setConfirmDelete(null); }
  };

  const visibleApprenants = useMemo(() => {
    let list = [...apprenants];
    if (user?.role === 'responsable' && user.siteId) list = list.filter(a => a.siteId === user.siteId);
    if (search) { const s = search.toLowerCase(); list = list.filter(a => a.nom.toLowerCase().includes(s) || a.prenom.toLowerCase().includes(s) || a.matricule.toLowerCase().includes(s)); }
    if (filterSite) list = list.filter(a => a.siteId === filterSite);
    if (filterFormation) list = list.filter(a => a.formationId === filterFormation);
    if (filterPromotion) list = list.filter(a => a.promotion === filterPromotion);
    return list;
  }, [search, filterSite, filterFormation, filterPromotion, user, apprenants]);

  const { sorted, SortHeader } = useSort(visibleApprenants, 'nom');

  const getSiteName = (siteId: string) => sites.find(s => s.id === siteId)?.nom || '-';
  const getFormationName = (formId: string) => formations.find(f => f.id === formId)?.nom || '-';
  const promotions = [...new Set(apprenants.map(a => a.promotion))];

  const exportCSV = () => {
    try {
      const headers = ['Matricule', 'Nom', 'Prénom', 'Sexe', 'Email', 'Téléphone', 'Site', 'Formation', 'Promotion', 'Statut'];
      const rows = visibleApprenants.map(a => [
        a.matricule,
        a.nom,
        a.prenom,
        a.sexe,
        a.email,
        a.telephone,
        getSiteName(a.siteId),
        getFormationName(a.formationId),
        a.promotion,
        a.statut
      ]);
      
      const csvContent = "\uFEFF" + [
        headers.join(','),
        ...rows.map(r => r.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `apprenants-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('success', 'Exportation CSV réussie');
    } catch {
      showToast('error', 'Erreur d\'exportation CSV');
    }
  };

  const inputCls = (field: string) =>
    `w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apprenants</h1>
          <p className="text-gray-500 mt-1">{visibleApprenants.length} apprenant(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
            <Download size={16} /> Exporter CSV
          </button>
          {user?.role === 'admin' && (
            <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm">
              <UserPlus size={16} /> Nouvel Apprenant
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
          </div>
          {user?.role !== 'responsable' && (
            <select value={filterSite} onChange={e => setFilterSite(e.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Tous les sites</option>{sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          )}
          <select value={filterFormation} onChange={e => setFilterFormation(e.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">Toutes formations</option>{formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
          <select value={filterPromotion} onChange={e => setFilterPromotion(e.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">Toutes promotions</option>{promotions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Matricule" sortKey="matricule" /></th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Nom & Prénom" sortKey="nom" /></th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Sexe" sortKey="sexe" /></th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Formation</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Promotion" sortKey="promotion" /></th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Statut" sortKey="statut" /></th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((app, i) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-opacity" style={{ animation: `fadeIn 0.2s ease-out ${i * 0.02}s both` }}>
                  <td className="px-6 py-3 text-sm font-mono text-gray-700">{app.matricule}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{app.prenom} {app.nom}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${app.sexe === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                      {app.sexe === 'M' ? 'Masculin' : 'Féminin'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{getFormationName(app.formationId)}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{getSiteName(app.siteId)}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{app.promotion}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${app.statut === 'actif' ? 'bg-green-100 text-green-700' : app.statut === 'diplome' ? 'bg-blue-100 text-blue-700' : app.statut === 'abandon' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{app.statut}</span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setSelectedApprenant(app)} className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-500 min-w-[36px] min-h-[36px]" title="Détails"><Eye size={15} /></button>
                      <button onClick={() => openEdit(app)} className="p-2 hover:bg-amber-50 rounded-lg text-amber-500 min-w-[36px] min-h-[36px]" title="Modifier"><Edit2 size={15} /></button>
                      {user?.role === 'admin' && <button onClick={() => setConfirmDelete(app.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 min-w-[36px] min-h-[36px]" title="Supprimer"><Trash2 size={15} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {visibleApprenants.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-400">Aucun apprenant trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApprenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedApprenant(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Détails Apprenant</h3>
              <button onClick={() => setSelectedApprenant(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600">{selectedApprenant.prenom[0]}{selectedApprenant.nom[0]}</div>
                <div><h4 className="text-lg font-bold">{selectedApprenant.prenom} {selectedApprenant.nom}</h4><p className="text-sm text-gray-500 font-mono">{selectedApprenant.matricule}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Sexe:</span> <span className="font-medium">{selectedApprenant.sexe === 'M' ? 'Masculin' : 'Féminin'}</span></div>
                <div><span className="text-gray-500">Né(e) le:</span> <span className="font-medium">{selectedApprenant.dateNaissance}</span></div>
                <div><span className="text-gray-500">Téléphone:</span> <span className="font-medium">{selectedApprenant.telephone}</span></div>
                <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedApprenant.email}</span></div>
                <div><span className="text-gray-500">Formation:</span> <span className="font-medium">{getFormationName(selectedApprenant.formationId)}</span></div>
                <div><span className="text-gray-500">Site:</span> <span className="font-medium">{getSiteName(selectedApprenant.siteId)}</span></div>
                <div><span className="text-gray-500">Promotion:</span> <span className="font-medium">{selectedApprenant.promotion}</span></div>
                <div><span className="text-gray-500">Inscription:</span> <span className="font-medium">{selectedApprenant.dateInscription}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editMode === 'add' ? 'Nouvel Apprenant' : 'Modifier Apprenant'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Matricule</label><input type="text" value={editForm.matricule} onChange={e => setEditForm({ ...editForm, matricule: e.target.value })} className={inputCls('matricule')} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Sexe</label><select value={editForm.sexe} onChange={e => setEditForm({ ...editForm, sexe: e.target.value as 'M' | 'F' })} className={inputCls('sexe')}><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label><input type="text" value={editForm.nom} onChange={e => setEditForm({ ...editForm, nom: e.target.value })} className={inputCls('nom')} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Prénom *</label><input type="text" value={editForm.prenom} onChange={e => setEditForm({ ...editForm, prenom: e.target.value })} className={inputCls('prenom')} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Date naissance</label><input type="date" value={editForm.dateNaissance} onChange={e => setEditForm({ ...editForm, dateNaissance: e.target.value })} className={inputCls('dateNaissance')} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Téléphone</label><input type="text" value={editForm.telephone} onChange={e => setEditForm({ ...editForm, telephone: e.target.value })} className={inputCls('telephone')} /></div>
                <div className="col-span-1 sm:col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Email</label><input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className={inputCls('email')} /></div>
                <div className="col-span-1 sm:col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Adresse</label><input type="text" value={editForm.adresse} onChange={e => setEditForm({ ...editForm, adresse: e.target.value })} className={inputCls('adresse')} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Formation *</label><select value={editForm.formationId} onChange={e => setEditForm({ ...editForm, formationId: e.target.value })} className={inputCls('formationId')}><option value="">--</option>{formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Site *</label><select value={editForm.siteId} onChange={e => setEditForm({ ...editForm, siteId: e.target.value })} className={inputCls('siteId')}><option value="">--</option>{sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Promotion</label><input type="text" value={editForm.promotion} onChange={e => setEditForm({ ...editForm, promotion: e.target.value })} className={inputCls('promotion')} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Statut</label><select value={editForm.statut} onChange={e => setEditForm({ ...editForm, statut: e.target.value as Apprenant['statut'] })} className={inputCls('statut')}><option value="actif">Actif</option><option value="inactif">Inactif</option><option value="diplome">Diplômé</option><option value="abandon">Abandon</option></select></div>
              </div>
              {Object.keys(errors).length > 0 && <p className="text-xs text-red-500">Veuillez remplir tous les champs obligatoires (*)</p>}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"><Save size={16} />{editMode === 'add' ? 'Créer' : 'Enregistrer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!confirmDelete} title="Supprimer l'apprenant" message="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
