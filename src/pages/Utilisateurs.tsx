import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { useSort } from '../utils/useSort';
import { hashPassword } from '../utils/crypto';
import { Shield, UserPlus, Key, Trash2, Edit2, Save, X, Lock, AlertCircle, Database, Upload, Download } from 'lucide-react';

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur Général',
  direction: 'Direction FUTUR',
  responsable: 'Responsable de Site',
  formateur: 'Formateur'
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  direction: 'bg-blue-100 text-blue-700',
  responsable: 'bg-green-100 text-green-700',
  formateur: 'bg-orange-100 text-orange-700'
};

function emptyUser(): User {
  return { id: `user-${Date.now()}`, matricule: '', nom: '', prenom: '', email: '', role: 'formateur', password: 'Default@123', premiereConnexion: true, actif: true };
}

export default function Utilisateurs() {
  const { users, sites, formations, addUser, updateUser, deleteUser, apprenants, notes, evaluations, logs, restoreData, addLog } = useData();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState<User>(emptyUser());
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [passwordModal, setPasswordModal] = useState<{ user: User; newPass: string; confirm: string } | null>(null);

  const { sorted: sortedUsers, SortHeader } = useSort(users, 'nom');

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify({ apprenants, sites, users, formations, notes, evaluations, logs }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `futurnotes-sauvegarde-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addLog('Sauvegarde base', 'Exportation réussie de la base de données en JSON');
      showToast('success', 'Base de données exportée avec succès');
    } catch {
      showToast('error', 'Erreur lors de l\'exportation');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.apprenants || !parsed.users || !parsed.notes || !parsed.formations || !parsed.sites) {
          showToast('error', 'Fichier invalide : des tables indispensables sont manquantes');
          addLog('Restauration base', 'Échec de l\'importation : structure incorrecte', 'echec');
          return;
        }
        restoreData(parsed);
        showToast('success', 'Base de données restaurée avec succès');
      } catch {
        showToast('error', 'Erreur de lecture du fichier JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const openAdd = () => { setEditForm(emptyUser()); setEditMode('add'); setErrors({}); setShowModal(true); };
  const openEdit = (u: User) => { setEditForm({ ...u }); setEditMode('edit'); setErrors({}); setShowModal(true); };

  const handleSave = () => {
    const errs: Record<string, boolean> = {};
    if (!editForm.nom) errs.nom = true;
    if (!editForm.prenom) errs.prenom = true;
    if (!editForm.email) errs.email = true;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (editMode === 'add') {
      addUser({ ...editForm, password: hashPassword(editForm.password) });
      showToast('success', 'Utilisateur créé avec succès');
    } else {
      updateUser(editForm);
      showToast('success', 'Utilisateur modifié avec succès');
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (confirmDelete) { deleteUser(confirmDelete); showToast('success', 'Utilisateur supprimé'); setConfirmDelete(null); }
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Minimum 8 caractères';
    if (!/[A-Z]/.test(pwd)) return 'Doit contenir une majuscule';
    if (!/[a-z]/.test(pwd)) return 'Doit contenir une minuscule';
    if (!/[0-9]/.test(pwd)) return 'Doit contenir un chiffre';
    return null;
  };

  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordChange = () => {
    if (!passwordModal) return;
    const err = validatePassword(passwordModal.newPass);
    if (err) { setPasswordError(err); return; }
    setPasswordError(null);
    if (passwordModal.newPass !== passwordModal.confirm) { showToast('error', 'Les mots de passe ne correspondent pas'); return; }
    updateUser({ ...passwordModal.user, password: hashPassword(passwordModal.newPass), premiereConnexion: true });
    showToast('success', 'Mot de passe modifié avec succès');
    setPasswordModal(null);
  };

  const inputCls = (field: string) =>
    `w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1><p className="text-gray-500 mt-1">{users.length} comptes</p></div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"><UserPlus size={16} /> Nouvel Utilisateur</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Utilisateur" sortKey="nom" /></th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Email" sortKey="email" /></th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Rôle" sortKey="role" /></th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Site/Formation</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedUsers.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-opacity" style={{ animation: `fadeIn 0.2s ease-out ${i * 0.02}s both` }}>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center"><span className="text-xs font-bold text-indigo-600">{u.prenom[0]}{u.nom[0]}</span></div>
                      <div><p className="text-sm font-medium text-gray-900">{u.prenom} {u.nom}</p><p className="text-xs text-gray-400 font-mono">{u.matricule}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-3"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{roleLabels[u.role]}</span></td>
                  <td className="px-6 py-3 text-sm text-gray-600">{u.siteId ? sites.find(s => s.id === u.siteId)?.nom : u.formationId ? formations.find(f => f.id === u.formationId)?.nom : '—'}</td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(u)} className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-500 min-w-[36px] min-h-[36px]" title="Modifier"><Edit2 size={15} /></button>
                      <button onClick={() => setPasswordModal({ user: u, newPass: '', confirm: '' })} className="p-2 hover:bg-amber-50 rounded-lg text-amber-500 min-w-[36px] min-h-[36px]" title="Changer mot de passe"><Key size={15} /></button>
                      <button onClick={() => setConfirmDelete(u.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 min-w-[36px] min-h-[36px]" title="Supprimer"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Shield size={16} className="text-indigo-500" />Rôles et permissions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(roleLabels).map(([key, label]) => (
            <div key={key} className={`p-3 rounded-lg ${roleColors[key as UserRole].split(' ')[0]} border border-gray-100`}>
              <p className="text-sm font-medium">{label}</p>
              <ul className="mt-1 space-y-0.5 text-xs text-gray-500">
                {key === 'admin' && <><li>• Gestion complète</li><li>• Création sites/utilisateurs</li><li>• Tous les rapports</li></>}
                {key === 'direction' && <><li>• Consultation résultats</li><li>• Comparaison sites</li><li>• Téléchargement rapports</li></>}
                {key === 'responsable' && <><li>• Consultation site</li><li>• Vérification notes</li><li>• Statistiques site</li></>}
                {key === 'formateur' && <><li>• Saisie notes</li><li>• Modification avant validation</li><li>• Consultation apprenants</li></>}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Database size={16} className="text-indigo-500" />Base de Données & Maintenance</h3>
        <p className="text-xs text-gray-500 mb-4">Exportez l'intégralité des données en format JSON pour effectuer une sauvegarde externe, ou restaurez un fichier de sauvegarde précédemment enregistré.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportJSON} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors">
            <Download size={14} /> Exporter la Base (JSON)
          </button>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-gray-200">
            <Upload size={14} /> Importer une Sauvegarde (JSON)
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editMode === 'add' ? 'Nouvel Utilisateur' : 'Modifier Utilisateur'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Rôle</label><select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value as UserRole, siteId: undefined, formationId: undefined })} className={inputCls('role')}><option value="formateur">Formateur</option><option value="responsable">Responsable</option><option value="direction">Direction</option><option value="admin">Admin</option></select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Matricule</label><input type="text" value={editForm.matricule} onChange={e => setEditForm({ ...editForm, matricule: e.target.value })} className={inputCls('matricule')} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label><input type="text" value={editForm.nom} onChange={e => setEditForm({ ...editForm, nom: e.target.value })} className={inputCls('nom')} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Prénom *</label><input type="text" value={editForm.prenom} onChange={e => setEditForm({ ...editForm, prenom: e.target.value })} className={inputCls('prenom')} /></div>
                <div className="col-span-1 sm:col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Email *</label><input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className={inputCls('email')} /></div>
                {editMode === 'add' && <div className="col-span-1 sm:col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe</label><input type="text" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} className={inputCls('password')} /></div>}
                {editForm.role === 'responsable' && (
                  <div className="col-span-1 sm:col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Site</label><select value={editForm.siteId || ''} onChange={e => setEditForm({ ...editForm, siteId: e.target.value })} className={inputCls('siteId')}><option value="">--</option>{sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}</select></div>
                )}
                {editForm.role === 'formateur' && (
                  <div className="col-span-1 sm:col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Formation</label><select value={editForm.formationId || ''} onChange={e => setEditForm({ ...editForm, formationId: e.target.value })} className={inputCls('formationId')}><option value="">--</option>{formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}</select></div>
                )}
                <div className="col-span-1 sm:col-span-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editForm.actif} onChange={e => setEditForm({ ...editForm, actif: e.target.checked })} className="rounded border-gray-300" /> Actif</label></div>
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

      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setPasswordModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Changer mot de passe</h3>
              <button onClick={() => setPasswordModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Utilisateur : <strong>{passwordModal.user.prenom} {passwordModal.user.nom}</strong></p>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Nouveau mot de passe</label><input type="password" value={passwordModal.newPass} onChange={e => { setPasswordModal({ ...passwordModal, newPass: e.target.value }); setPasswordError(null); }} className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${passwordError ? 'border-red-400' : 'border-gray-300'}`} placeholder="8+ car., minuscule, majuscule, chiffre" />{passwordError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{passwordError}</p>}</div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Confirmer le mot de passe</label><input type="password" value={passwordModal.confirm} onChange={e => setPasswordModal({ ...passwordModal, confirm: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Saisissez à nouveau" /></div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setPasswordModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button onClick={handlePasswordChange} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"><Lock size={16} /> Changer le mot de passe</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!confirmDelete} title="Supprimer l'utilisateur" message="Cette action est irréversible. L'utilisateur ne pourra plus se connecter." confirmLabel="Supprimer" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
