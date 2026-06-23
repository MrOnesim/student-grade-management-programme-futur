import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getMentionColor, getMentionBg } from '../data/mockData';
import { calculerResultats } from '../utils/calculs';
import { useSort } from '../utils/useSort';
import { ResultatApprenant, MoyenneMatiere } from '../types';
import { Search, Eye, X, Award, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '../components/Toast';

export default function Resultats() {
  const { user } = useAuth();
  const { apprenants, formations, sites, notes, evaluations } = useData();
  const { showToast } = useToast();
  const releveRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const allResults = useMemo(() => calculerResultats(apprenants, formations, sites, notes, evaluations), [apprenants, formations, sites, notes, evaluations]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filterSite, setFilterSite] = useState(searchParams.get('site') || '');
  const [filterFormation, setFilterFormation] = useState(searchParams.get('formation') || '');
  const [selectedResult, setSelectedResult] = useState<ResultatApprenant | null>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (filterSite) params.site = filterSite;
    if (filterFormation) params.formation = filterFormation;
    setSearchParams(params, { replace: true });
  }, [search, filterSite, filterFormation, setSearchParams]);

  const results = useMemo(() => {
    let list = allResults;
    if (user?.role === 'responsable' && user.siteId) list = list.filter(r => r.siteId === user.siteId);
    if (user?.role === 'formateur' && user.formationId) list = list.filter(r => r.formationId === user.formationId);
    if (search) { const s = search.toLowerCase(); list = list.filter(r => r.apprenantNom.toLowerCase().includes(s) || r.apprenantPrenom.toLowerCase().includes(s) || r.apprenantMatricule.toLowerCase().includes(s)); }
    if (filterSite) list = list.filter(r => r.siteId === filterSite);
    if (filterFormation) list = list.filter(r => r.formationId === filterFormation);
    return list;
  }, [allResults, search, filterSite, filterFormation, user]);

  const { sorted, SortHeader } = useSort(results, 'moyenneGenerale');
  const sortedWithSort = useMemo(() => sorted, [sorted]);
  const resultsWithRanks = useMemo(() => sortedWithSort.map((r: ResultatApprenant, i: number) => ({ ...r, rang: i + 1 })), [sortedWithSort]);

  const downloadPDF = async () => {
    if (!releveRef.current) return;
    try {
      showToast('info', 'Génération du PDF en cours...');
      const canvas = await html2canvas(releveRef.current, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`releve-notes-${selectedResult?.apprenantMatricule || 'apprenant'}.pdf`);
      showToast('success', 'PDF téléchargé avec succès');
    } catch {
      showToast('error', 'Erreur lors du téléchargement du PDF');
    }
  };

  const exportCSV = () => {
    try {
      const headers = ['Matricule', 'Apprenant', 'Formation', 'Site', 'Moyenne Générale', 'Statut Validation', 'Mention', 'Rang'];
      const rows = resultsWithRanks.map(r => [
        r.apprenantMatricule,
        `${r.apprenantPrenom} ${r.apprenantNom}`,
        r.formationNom,
        r.siteNom,
        r.moyenneGenerale.toFixed(2),
        r.statutValidation,
        r.mention,
        r.rang
      ]);
      
      const csvContent = "\uFEFF" + [
        headers.join(','),
        ...rows.map(r => r.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resultats-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('success', 'Exportation CSV réussie');
    } catch {
      showToast('error', 'Erreur d\'exportation CSV');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Résultats</h1>
          <p className="text-gray-500 mt-1">{results.length} résultat(s)</p>
        </div>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
          <Download size={16} /> Exporter CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Rechercher un apprenant..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          {user?.role !== 'responsable' && user?.role !== 'formateur' && (
            <select value={filterSite} onChange={e => setFilterSite(e.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Tous les sites</option>{sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          )}
          {user?.role !== 'formateur' && (
            <select value={filterFormation} onChange={e => setFilterFormation(e.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Toutes les filières</option>{formations.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-16">Rang</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Apprenant" sortKey="apprenantNom" /></th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Formation" sortKey="formationNom" /></th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Site" sortKey="siteNom" /></th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Moyenne" sortKey="moyenneGenerale" /></th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Statut" sortKey="statutValidation" /></th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase"><SortHeader label="Mention" sortKey="mention" /></th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Relevé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resultsWithRanks.map((r, i) => (
                <tr key={r.apprenantId} className="hover:bg-gray-50 transition-opacity" style={{ animation: `fadeIn 0.2s ease-out ${i * 0.02}s both` }}>
                  <td className="px-4 py-3 text-center"><span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${r.rang === 1 ? 'bg-amber-100 text-amber-700' : r.rang === 2 ? 'bg-gray-100 text-gray-600' : r.rang === 3 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}>{r.rang}</span></td>
                  <td className="px-6 py-3"><p className="text-sm font-medium text-gray-900">{r.apprenantPrenom} {r.apprenantNom}</p><p className="text-xs text-gray-400 font-mono">{r.apprenantMatricule}</p></td>
                  <td className="px-6 py-3 text-sm text-gray-600">{r.formationNom}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{r.siteNom}</td>
                  <td className="px-6 py-3 text-center"><span className="text-sm font-bold text-indigo-600">{r.moyenneGenerale.toFixed(2)}/20</span></td>
                  <td className="px-6 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.statutValidation === 'Valide' ? 'bg-green-100 text-green-700' : r.statutValidation === 'En attente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{r.statutValidation}</span>
                  </td>
                  <td className="px-6 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${getMentionBg(r.mention)}`}>{r.mention}</span></td>
                  <td className="px-6 py-3 text-center"><button onClick={() => setSelectedResult(r)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Eye size={14} /> Relevé</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto" onClick={() => setSelectedResult(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl">
              <span className="text-sm font-bold text-gray-700">Aperçu du Bulletin de Notes</span>
              <div className="flex items-center gap-2">
                <button onClick={downloadPDF} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors" title="Télécharger PDF">
                  <Download size={14} /> Télécharger le Relevé (PDF)
                </button>
                <button onClick={() => setSelectedResult(null)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"><X size={18} className="text-gray-500" /></button>
              </div>
            </div>
            
            {/* The PDF printable area */}
            <div className="p-1 bg-white">
              <div ref={releveRef} className="p-8 border-[12px] border-double border-gray-200 bg-white text-gray-950 font-serif max-w-[800px] mx-auto relative">
                
                {/* Official Tricolor Benin Accent on Top Border */}
                <div className="absolute top-0 left-0 right-0 h-2 flex">
                  <div className="flex-1 bg-emerald-600" />
                  <div className="flex-1 bg-yellow-400" />
                  <div className="flex-1 bg-red-600" />
                </div>
                
                {/* Official En-tête */}
                <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-6 mt-4">
                  <div className="text-left max-w-[280px]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-800">RÉPUBLIQUE DU BÉNIN</p>
                    <p className="text-[9px] uppercase text-gray-600 leading-tight">Ministère du Numérique et de la Digitalisation</p>
                    <p className="text-[9px] uppercase text-gray-600 leading-tight">Fonds d'Appui à l'Entrepreneuriat Numérique</p>
                    <div className="w-16 h-0.5 bg-indigo-600 mt-1" />
                    <p className="text-[10px] font-bold text-indigo-700 mt-1 uppercase tracking-wide">PROGRAMME DE FORMATION FUTUR</p>
                  </div>
                  
                  {/* SVG Coat of Arms/Seal of Benin */}
                  <div className="text-center">
                    <svg width="55" height="55" viewBox="0 0 100 100" className="mx-auto text-indigo-800 mb-1">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"/>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="1"/>
                      <text x="50" y="32" font-size="7" font-weight="bold" fill="currentColor" text-anchor="middle">PROGRAMME FUTUR</text>
                      {/* Stylized Star */}
                      <polygon points="50,38 52,43 57,43 53,46 55,51 50,48 45,51 47,46 43,43 48,43" fill="currentColor" />
                      <text x="50" y="60" font-size="8" font-weight="extrabold" fill="currentColor" text-anchor="middle">RELEVÉ DE NOTES</text>
                      <text x="50" y="70" font-size="5" font-weight="bold" fill="currentColor" text-anchor="middle">★ BENIN ★</text>
                      <path d="M 30 78 Q 50 85 70 78" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                    <p className="text-[9px] font-bold italic text-gray-700">"Fraternité - Justice - Travail"</p>
                  </div>

                  <div className="text-right max-w-[280px]">
                    <p className="text-[10px] font-bold uppercase text-gray-800">BULLETIN OFFICIEL</p>
                    <p className="text-[9px] text-gray-600">Site académique : <strong className="text-gray-900">{selectedResult.siteNom}</strong></p>
                    <p className="text-[9px] text-gray-600">Promotion : <strong className="text-gray-900">{selectedResult.promotion}</strong></p>
                    <p className="text-[9px] text-gray-600">Date d'édition : <strong className="text-gray-900">{new Date().toLocaleDateString('fr-FR')}</strong></p>
                  </div>
                </div>

                <div className="text-center my-6">
                  <h2 className="text-xl font-extrabold tracking-widest text-indigo-900 border-2 border-indigo-900 py-1.5 px-4 inline-block bg-indigo-50/50 rounded">
                    BULLETIN GLOBAL DE NOTES
                  </h2>
                </div>

                {/* Info Apprenant */}
                <div className="grid grid-cols-2 gap-4 border border-gray-400 p-4 rounded bg-gray-50/50 mb-6 text-sm font-sans">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Identité de l'Apprenant(e)</p>
                    <p className="text-base font-bold text-gray-950 mt-1">{selectedResult.apprenantPrenom} {selectedResult.apprenantNom}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">Matricule: {selectedResult.apprenantMatricule}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Parcours Académique</p>
                    <p className="text-base font-bold text-indigo-900 mt-1">{selectedResult.formationNom}</p>
                    <p className="text-xs text-gray-600">Statut d'inscription : <span className="font-semibold">{selectedResult.statutValidation === 'Valide' ? 'Validé' : 'En attente'}</span></p>
                  </div>
                </div>

                {/* Tableau des notes */}
                <table className="w-full border-collapse border-2 border-gray-900 mb-8 font-sans">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-900 text-left text-xs font-bold text-gray-800 uppercase">
                      <th className="border-r border-gray-400 px-4 py-2">Matières Enseignées</th>
                      <th className="border-r border-gray-400 px-3 py-2 text-center w-24">Coefficient</th>
                      <th className="border-r border-gray-400 px-3 py-2 text-center w-28">Moyenne / 20</th>
                      <th className="px-4 py-2 text-center w-36">Mention Obtenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-400">
                    {selectedResult.moyennesMatieres.map((m: MoyenneMatiere) => (
                      <tr key={m.matiereId} className="text-sm hover:bg-gray-50/30">
                        <td className="border-r border-gray-400 px-4 py-2 text-gray-900 font-medium">{m.matiereNom}</td>
                        <td className="border-r border-gray-400 px-3 py-2 text-center text-gray-600 font-mono">{m.coefficient}</td>
                        <td className="border-r border-gray-400 px-3 py-2 text-center font-bold text-indigo-700 font-mono">{m.moyenne.toFixed(2)}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${getMentionColor(m.mention)}`}>
                            {m.mention}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Synthèse de fin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-sans">
                  {/* Décision du jury */}
                  <div className="border-2 border-indigo-900 rounded p-4 bg-indigo-50/30">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2 border-b border-indigo-200 pb-1">Résultats Globaux</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-600">Moyenne Générale:</span>
                      <strong className="text-indigo-900 font-mono text-base">{selectedResult.moyenneGenerale.toFixed(2)}/20</strong>
                      
                      <span className="text-gray-600">Rang:</span>
                      <strong className="text-gray-800 font-mono">{resultsWithRanks.find((r: ResultatApprenant) => r.apprenantId === selectedResult.apprenantId)?.rang || '-'}<span className="text-xs text-gray-400 font-normal"> / {results.length} apprenants</span></strong>
                      
                      <span className="text-gray-600">Mention :</span>
                      <strong className={`font-semibold ${getMentionColor(selectedResult.mention)}`}>{selectedResult.mention}</strong>

                      <span className="text-gray-600">Décision du jury :</span>
                      <strong className={selectedResult.moyenneGenerale >= 10 ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                        {selectedResult.moyenneGenerale >= 10 ? 'ADMIS(E)' : 'AJOURNÉ(E)'}
                      </strong>
                    </div>
                  </div>

                  {/* Signatures / Stamp Box */}
                  <div className="border border-gray-300 rounded p-4 flex flex-col justify-between min-h-[140px] bg-white relative">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Cadre de Signature Officielle</p>
                    <p className="text-xs text-gray-800 font-bold text-center mt-1">Le Directeur Académique du Site</p>
                    
                    {/* SVG Signature */}
                    <div className="my-2 h-10 flex items-center justify-center select-none pointer-events-none opacity-85 text-blue-900">
                      <svg width="85" height="35" viewBox="0 0 100 40">
                        <path d="M 10 30 Q 25 5 35 25 T 50 15 T 70 30 T 90 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M 22 24 Q 40 8 60 22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    </div>

                    {/* Circular Stamp Badge */}
                    <div className="absolute right-4 bottom-2 text-indigo-700 opacity-20 pointer-events-none select-none">
                      <svg width="50" height="50" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="3"/>
                        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1"/>
                        <text x="50" y="44" font-size="8" font-weight="bold" fill="currentColor" text-anchor="middle">FUTUR NOTES</text>
                        <text x="50" y="60" font-size="6" font-weight="bold" fill="currentColor" text-anchor="middle">★ DIRECTION ★</text>
                      </svg>
                    </div>

                    <p className="text-[9px] text-gray-400 text-center font-mono mt-1">Signature électronique certifiée</p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-300 text-center text-[10px] text-gray-400 font-sans">
                  Ce relevé de notes est un document officiel généré par le système FUTUR NOTES sous le contrôle académique du Programme FUTUR du Bénin. Toute modification frauduleuse de ce document annule sa validité légale.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
