import { useMemo, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import { calculerResultats } from '../utils/calculs';
import { ResultatApprenant } from '../types';
import { FileText, Download, BarChart3, TrendingUp, Users } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Rapports() {
  const { apprenants, formations, sites, notes, evaluations } = useData();
  const { showToast } = useToast();
  const results = useMemo(() => calculerResultats(apprenants, formations, sites, notes, evaluations), [apprenants, formations, sites, notes, evaluations]);

  const totalApprenants = results.length;
  const reussis = results.filter(r => r.moyenneGenerale >= 10).length;
  const tauxReussite = totalApprenants > 0 ? (reussis / totalApprenants) * 100 : 0;
  const moyenneGlobale = totalApprenants > 0 ? results.reduce((s, r) => s + r.moyenneGenerale, 0) / totalApprenants : 0;

  const mentions = useMemo(() => {
    const m: Record<string, number> = {};
    results.forEach(r => { m[r.mention] = (m[r.mention] || 0) + 1; });
    return m;
  }, [results]);

  const siteReports = useMemo(() => {
    return sites.map(site => {
      const sr = results.filter(r => r.siteId === site.id);
      const siteReussis = sr.filter(r => r.moyenneGenerale >= 10).length;
      return { site, count: sr.length, taux: sr.length > 0 ? (siteReussis / sr.length) * 100 : 0, moyenne: sr.length > 0 ? sr.reduce((s, r) => s + r.moyenneGenerale, 0) / sr.length : 0, results: sr };
    });
  }, [results]);

  const downloadSiteRapport = async (siteName: string, siteRapport: typeof siteReports[0]) => {
    const container = document.createElement('div');
    container.style.padding = '30px';
    container.style.fontFamily = 'sans-serif';
    container.style.background = 'white';
    container.style.width = '800px';
    container.innerHTML = `
      <h1 style="font-size:24px;color:#4338ca;border-bottom:2px solid #4338ca;padding-bottom:10px;">Rapport — ${siteName}</h1>
      <p style="color:#666;margin-top:4px;">Programme FUTUR — République du Bénin</p>
      <div style="display:flex;gap:20px;margin:20px 0;">
        <div style="flex:1;padding:15px;background:#eff6ff;border-radius:8px;"><p style="font-size:12px;color:#666;">Apprenants</p><p style="font-size:28px;font-weight:bold;">${siteRapport.count}</p></div>
        <div style="flex:1;padding:15px;background:#f0fdf4;border-radius:8px;"><p style="font-size:12px;color:#666;">Réussite</p><p style="font-size:28px;font-weight:bold;color:#16a34a;">${siteRapport.taux.toFixed(1)}%</p></div>
        <div style="flex:1;padding:15px;background:#faf5ff;border-radius:8px;"><p style="font-size:12px;color:#666;">Moyenne</p><p style="font-size:28px;font-weight:bold;color:#9333ea;">${siteRapport.moyenne.toFixed(2)}</p></div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-top:15px;">
        <thead><tr style="background:#f9fafb;text-align:left;"><th style="padding:8px;font-size:12px;color:#666;">Apprenant</th><th style="padding:8px;font-size:12px;color:#666;">Formation</th><th style="padding:8px;font-size:12px;color:#666;text-align:center;">Moyenne</th></tr></thead>
        <tbody>${[...siteRapport.results].sort((a: ResultatApprenant, b: ResultatApprenant) => b.moyenneGenerale - a.moyenneGenerale).map((r: ResultatApprenant) => `<tr style="border-top:1px solid #e5e7eb;"><td style="padding:8px;font-size:14px;">${r.apprenantPrenom} ${r.apprenantNom}</td><td style="padding:8px;font-size:14px;color:#666;">${r.formationNom}</td><td style="padding:8px;font-size:14px;text-align:center;font-weight:bold;color:#4338ca;">${r.moyenneGenerale.toFixed(2)}</td></tr>`).join('')}</tbody>
      </table>
      <p style="text-align:center;font-size:11px;color:#999;margin-top:30px;">Document généré par FUTUR NOTES — ${new Date().toLocaleDateString('fr-FR')}</p>
    `;
    document.body.appendChild(container);
    try {
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, 270));
      pdf.save(`rapport-${siteName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      showToast('success', `Rapport "${siteName}" téléchargé`);
    } catch {
      showToast('error', 'Erreur lors de la génération du PDF');
    }
    document.body.removeChild(container);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Rapports</h1><p className="text-gray-500 mt-1">Génération des rapports statistiques</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5"><Users size={20} className="text-blue-500 mb-2" /><p className="text-2xl font-bold">{totalApprenants}</p><p className="text-sm text-gray-500">Apprenants évalués</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><TrendingUp size={20} className="text-green-500 mb-2" /><p className="text-2xl font-bold text-green-600">{tauxReussite.toFixed(1)}%</p><p className="text-sm text-gray-500">Taux de réussite global</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><BarChart3 size={20} className="text-purple-500 mb-2" /><p className="text-2xl font-bold text-purple-600">{moyenneGlobale.toFixed(2)}/20</p><p className="text-sm text-gray-500">Moyenne générale</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-indigo-500" />Distribution des mentions</h3>
        <div className="space-y-3">
          {['Excellent', 'Très Bien', 'Bien', 'Assez Bien', 'Passable', 'Ajourné'].map(mention => {
            const count = mentions[mention] || 0;
            const pct = totalApprenants > 0 ? (count / totalApprenants) * 100 : 0;
            return (
              <div key={mention} className="flex items-center gap-3">
                <span className={`text-sm font-medium w-24 ${mention === 'Ajourné' ? 'text-red-600' : 'text-gray-700'}`}>{mention}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5">
                  <div className={`h-5 rounded-full ${mention === 'Excellent' ? 'bg-yellow-400' : mention === 'Très Bien' ? 'bg-green-500' : mention === 'Bien' ? 'bg-emerald-400' : mention === 'Assez Bien' ? 'bg-blue-400' : mention === 'Passable' ? 'bg-orange-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                <span className="text-xs text-gray-400 w-12 text-right">{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900 flex items-center gap-2"><FileText size={18} className="text-indigo-500" />Rapports par site</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr><th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Site</th><th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Apprenants</th><th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Taux Réussite</th><th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Moyenne</th><th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {siteReports.map(sr => (
                <tr key={sr.site.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{sr.site.nom}</td>
                  <td className="px-6 py-3 text-sm text-center text-gray-600">{sr.count}</td>
                  <td className="px-6 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sr.taux >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{sr.taux.toFixed(1)}%</span></td>
                  <td className="px-6 py-3 text-sm text-center font-medium text-indigo-600">{sr.moyenne.toFixed(2)}</td>
                  <td className="px-6 py-3 text-center"><button onClick={() => downloadSiteRapport(sr.site.nom, sr)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"><Download size={14} /> Rapport</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
