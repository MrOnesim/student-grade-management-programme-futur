import { Apprenant, Site, Formation, Note, Evaluation, ResultatApprenant, MoyenneMatiere, Mention } from '../types';

export function getMention(moyenne: number): Mention {
  if (moyenne >= 18) return 'Excellent';
  if (moyenne >= 16) return 'Très Bien';
  if (moyenne >= 14) return 'Bien';
  if (moyenne >= 12) return 'Assez Bien';
  if (moyenne >= 10) return 'Passable';
  return 'Ajourné';
}

export function getStatutValidation(moyenne: number): 'Valide' | 'En attente' | 'Non valide' {
  if (moyenne >= 10) return 'Valide';
  if (moyenne >= 8) return 'En attente';
  return 'Non valide';
}

export function calculerResultats(
  apprenants: Apprenant[],
  formations: Formation[],
  sites: Site[],
  notes: Note[],
  evaluations: Evaluation[]
): ResultatApprenant[] {
  const results: ResultatApprenant[] = [];

  for (const app of apprenants) {
    const formation = formations.find(f => f.id === app.formationId);
    const site = sites.find(s => s.id === app.siteId);
    if (!formation || !site) continue;

    const moyennesMatieres: MoyenneMatiere[] = [];

    for (const mod of formation.modules) {
      for (const mat of mod.matieres) {
        const matNotes = notes.filter(n =>
          n.apprenantId === app.id &&
          n.matiereId === mat.id &&
          n.statutApprenant === 'present' &&
          n.valeur !== null &&
          n.statut === 'validee'
        );
        if (matNotes.length === 0) continue;

        let sommePonderee = 0;
        let sommeCoefficients = 0;

        for (const n of matNotes) {
          const evalAssociee = evaluations.find(e => e.id === n.evaluationId);
          const coef = evalAssociee?.coefficient || 1;
          sommePonderee += (n.valeur || 0) * coef;
          sommeCoefficients += coef;
        }

        const moyenne = sommeCoefficients > 0 ? sommePonderee / sommeCoefficients : 0;

        const noteMap: Record<string, number | null> = {};
        matNotes.forEach(n => {
          const evalAssociee = evaluations.find(e => e.id === n.evaluationId);
          noteMap[evalAssociee?.type || ''] = n.valeur;
        });

        moyennesMatieres.push({
          matiereId: mat.id,
          matiereNom: mat.nom,
          coefficient: mat.coefficient,
          notes: noteMap,
          moyenne,
          mention: getMention(moyenne)
        });
      }
    }

    const totalCoeff = moyennesMatieres.reduce((s, m) => s + m.coefficient, 0);
    const moyenneGenerale = totalCoeff > 0
      ? moyennesMatieres.reduce((s, m) => s + m.moyenne * m.coefficient, 0) / totalCoeff
      : 0;

    results.push({
      apprenantId: app.id,
      apprenantNom: app.nom,
      apprenantPrenom: app.prenom,
      apprenantMatricule: app.matricule,
      formationId: app.formationId,
      formationNom: formation.nom,
      siteId: app.siteId,
      siteNom: site.nom,
      promotion: app.promotion,
      moyennesMatieres,
      moyenneGenerale,
      mention: getMention(moyenneGenerale),
      statutValidation: getStatutValidation(moyenneGenerale)
    });
  }

  return results;
}
