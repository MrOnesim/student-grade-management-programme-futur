-- ============================================
-- FUTUR NOTES — Schema Supabase
-- Exécuter dans l'éditeur SQL du dashboard Supabase
-- ============================================

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  code TEXT NOT NULL,
  ville TEXT DEFAULT '',
  responsableId TEXT DEFAULT '',
  dateCreation TEXT DEFAULT '',
  actif BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS formations (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT DEFAULT '',
  modules JSONB DEFAULT '[]',
  duree INTEGER DEFAULT 2,
  formateurId TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  matricule TEXT DEFAULT '',
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'formateur',
  siteId TEXT DEFAULT '',
  formationId TEXT DEFAULT '',
  password TEXT NOT NULL,
  premiereConnexion BOOLEAN DEFAULT true,
  actif BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS apprenants (
  id TEXT PRIMARY KEY,
  matricule TEXT DEFAULT '',
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  sexe TEXT DEFAULT 'M',
  dateNaissance TEXT DEFAULT '',
  telephone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  adresse TEXT DEFAULT '',
  formationId TEXT DEFAULT '',
  siteId TEXT DEFAULT '',
  promotion TEXT DEFAULT '',
  dateInscription TEXT DEFAULT '',
  statut TEXT DEFAULT 'actif'
);

CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY,
  titre TEXT NOT NULL,
  type TEXT DEFAULT 'DS',
  coefficient REAL DEFAULT 1,
  bareme REAL DEFAULT 20,
  dateEvaluation TEXT DEFAULT '',
  classeId TEXT DEFAULT '',
  siteId TEXT DEFAULT '',
  formationId TEXT DEFAULT '',
  promotion TEXT DEFAULT '',
  formateurId TEXT DEFAULT '',
  dateCreation TEXT DEFAULT '',
  statut TEXT DEFAULT 'brouillon'
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  apprenantId TEXT NOT NULL,
  evaluationId TEXT NOT NULL,
  matiereId TEXT NOT NULL,
  formateurId TEXT DEFAULT '',
  valeur REAL,
  statutApprenant TEXT DEFAULT 'present',
  dateSaisie TEXT DEFAULT '',
  dateModification TEXT DEFAULT '',
  modifiePar TEXT DEFAULT '',
  statut TEXT DEFAULT 'brouillon',
  commentaire TEXT DEFAULT '',
  validateurId TEXT DEFAULT '',
  dateValidation TEXT DEFAULT '',
  motifRejet TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  userId TEXT DEFAULT '',
  userNom TEXT DEFAULT '',
  action TEXT DEFAULT '',
  details TEXT DEFAULT '',
  dateHeure TEXT DEFAULT '',
  ip TEXT DEFAULT '',
  resultat TEXT DEFAULT 'succes'
);
