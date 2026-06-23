// ============= USERS & ROLES =============
export type UserRole = 'admin' | 'direction' | 'responsable' | 'formateur';

export interface User {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  siteId?: string;         // obligatoire pour responsable
  formationId?: string;    // obligatoire pour formateur (1 formateur = 1 filière)
  password: string;
  premiereConnexion: boolean;
  actif: boolean;
}

// ============= SITES =============
export interface Site {
  id: string;
  nom: string;
  code: string;
  ville: string;
  responsableId?: string;
  dateCreation: string;
  actif: boolean;
}

// ============= FORMATIONS / FILIÈRES =============
export interface Formation {
  id: string;
  nom: string;
  code: string;
  description: string;
  modules: Module[];
  duree: number; // en mois
  formateurId?: string; // formateur attitré
}

export interface Module {
  id: string;
  nom: string;
  code: string;
  matieres: Matiere[];
}

export interface Matiere {
  id: string;
  nom: string;
  code: string;
  coefficient: number;
  bareme: number; // sur 20
}

// ============= APPRENANTS =============
export interface Apprenant {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  telephone: string;
  email: string;
  adresse: string;
  formationId: string;
  siteId: string;
  promotion: string;
  photo?: string;
  dateInscription: string;
  statut: 'actif' | 'inactif' | 'diplome' | 'abandon';
}

// ============= EVALUATIONS =============
export type TypeEvaluation = 'DS' | 'TP' | 'EXAMEN' | 'PROJET';

export interface Evaluation {
  id: string;
  titre: string;
  type: TypeEvaluation;
  coefficient: number;
  bareme: number;
  dateEvaluation: string;
  classeId: string; // siteId + formationId + promotion
  siteId: string;
  formationId: string;
  promotion: string;
  formateurId: string;
  dateCreation: string;
  statut: 'brouillon' | 'publiee' | 'cloturee';
}

// ============= NOTES =============
export type StatutNote = 'brouillon' | 'en_attente' | 'validee' | 'rejetee' | 'cloturee';
export type StatutApprenantNote = 'present' | 'absent' | 'dispense';

export interface Note {
  id: string;
  apprenantId: string;
  evaluationId: string;
  matiereId: string;
  formateurId: string;
  valeur: number | null; // null si absent/dispensé
  statutApprenant: StatutApprenantNote;
  dateSaisie: string;
  dateModification?: string;
  modifiePar?: string;
  statut: StatutNote;
  commentaire?: string;
  // Validation
  validateurId?: string;
  dateValidation?: string;
  motifRejet?: string;
}

// ============= WORKFLOW LOGS =============
export interface LogAction {
  id: string;
  userId: string;
  userNom: string;
  action: string;
  details: string;
  dateHeure: string;
  ip?: string;
  resultat: 'succes' | 'echec';
}

// ============= RESULTATS =============
export type Mention = 'Excellent' | 'Très Bien' | 'Bien' | 'Assez Bien' | 'Passable' | 'Ajourné';
export type StatutValidation = 'Valide' | 'En attente' | 'Non valide';

export interface MoyenneMatiere {
  matiereId: string;
  matiereNom: string;
  coefficient: number;
  notes: Record<string, number | null>;
  moyenne: number;
  mention: Mention;
}

export interface ResultatApprenant {
  apprenantId: string;
  apprenantNom: string;
  apprenantPrenom: string;
  apprenantMatricule: string;
  formationId: string;
  formationNom: string;
  siteId: string;
  siteNom: string;
  promotion: string;
  moyennesMatieres: MoyenneMatiere[];
  moyenneGenerale: number;
  mention: Mention;
  statutValidation: StatutValidation;
  rang?: number;
}

export interface Classement {
  type: 'formation' | 'promotion' | 'site' | 'global';
  groupeId?: string;
  groupeNom?: string;
  resultats: ResultatApprenant[];
}

export interface StatistiquesGlobales {
  totalApprenants: number;
  totalSites: number;
  totalFormations: number;
  tauxReussite: number;
  tauxEchec: number;
  moyenneGenerale: number;
}

export interface StatistiquesSite {
  siteId: string;
  siteNom: string;
  totalApprenants: number;
  tauxReussite: number;
  meilleureMoyenne: number;
  moyenneSite: number;
}
