import { useState } from 'react';
import { X } from 'lucide-react';

const defaultReasons = ['Note incohérente', 'Pièce justificative manquante', 'Erreur de saisie', 'Note manquante', 'Absence non justifiée'];

interface RejectModalProps {
  open: boolean;
  onConfirm: (motif: string) => void;
  onCancel: () => void;
}

export default function RejectModal({ open, onConfirm, onCancel }: RejectModalProps) {
  const [motif, setMotif] = useState('');
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Motif du rejet</h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {defaultReasons.map(r => (
              <button key={r} onClick={() => setMotif(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${motif === r ? 'bg-red-100 border-red-300 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>{r}</button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ou saisissez un motif personnalisé</label>
            <textarea value={motif} onChange={e => setMotif(e.target.value)} rows={3} placeholder="Décrivez la raison du rejet..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-red-500 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Annuler</button>
          <button onClick={() => { if (motif.trim().length >= 3) onConfirm(motif.trim()); }}
            disabled={motif.trim().length < 3}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">Rejeter la note</button>
        </div>
      </div>
    </div>
  );
}
