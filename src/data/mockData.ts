import { Site, Formation, Apprenant, User, Note, Evaluation, LogAction, Mention, StatutNote, StatutApprenantNote } from '../types';

// ============= SITES (9) =============
export const sites: Site[] = [
  { id: 'site-1', nom: 'Natitingou', code: 'NAT', ville: 'Natitingou', responsableId: 'user-3', dateCreation: '2023-01-15', actif: true },
  { id: 'site-2', nom: 'Parakou', code: 'PRK', ville: 'Parakou', responsableId: 'user-4', dateCreation: '2023-02-01', actif: true },
  { id: 'site-3', nom: 'Dassa', code: 'DAS', ville: 'Dassa-Zoumè', responsableId: 'user-5', dateCreation: '2023-03-10', actif: true },
  { id: 'site-4', nom: 'Bohicon', code: 'BOH', ville: 'Bohicon', responsableId: 'user-6', dateCreation: '2023-04-05', actif: true },
  { id: 'site-5', nom: 'Godomey', code: 'GOD', ville: 'Cotonou', responsableId: 'user-7', dateCreation: '2023-05-20', actif: true },
  { id: 'site-6', nom: 'Minontin', code: 'MIN', ville: 'Cotonou', responsableId: 'user-8', dateCreation: '2023-06-10', actif: true },
  { id: 'site-7', nom: 'Haie Vive', code: 'HAV', ville: 'Cotonou', responsableId: 'user-9', dateCreation: '2023-07-01', actif: true },
  { id: 'site-8', nom: 'Akpakpa', code: 'AKP', ville: 'Cotonou', responsableId: 'user-10', dateCreation: '2023-08-15', actif: true },
  { id: 'site-9', nom: 'Porto-Novo', code: 'PTN', ville: 'Porto-Novo', responsableId: 'user-11', dateCreation: '2023-09-01', actif: true },
];

// ============= FORMATIONS / FILIÈRES (6) =============
export const formations: Formation[] = [
  {
    id: 'form-1',
    nom: 'Initiation à l\'Informatique',
    code: 'II',
    description: 'Découverte de l\'outil informatique, manipulation de l\'ordinateur et des logiciels de base',
    duree: 2,
    formateurId: 'user-12',
    modules: [
      {
        id: 'mod-1-1', nom: 'Découverte de l\'ordinateur', code: 'DECOUV',
        matieres: [
          { id: 'mat-1-1-1', nom: 'Composants et périphériques', code: 'COMP', coefficient: 2, bareme: 20 },
          { id: 'mat-1-1-2', nom: 'Système d\'exploitation (Windows)', code: 'WIN', coefficient: 3, bareme: 20 },
          { id: 'mat-1-1-3', nom: 'Gestion des fichiers et dossiers', code: 'FICH', coefficient: 2, bareme: 20 },
        ]
      },
      {
        id: 'mod-1-2', nom: 'Logiciels de bureautique', code: 'BUR',
        matieres: [
          { id: 'mat-1-2-1', nom: 'Traitement de texte (Word)', code: 'WORD', coefficient: 3, bareme: 20 },
          { id: 'mat-1-2-2', nom: 'Tableur (Excel)', code: 'EXCEL', coefficient: 3, bareme: 20 },
          { id: 'mat-1-2-3', nom: 'Internet et messagerie', code: 'NET', coefficient: 2, bareme: 20 },
        ]
      }
    ]
  },
  {
    id: 'form-2',
    nom: 'Intelligence Artificielle',
    code: 'IA',
    description: 'Formation aux fondamentaux de l\'intelligence artificielle et du machine learning',
    duree: 2,
    formateurId: 'user-13',
    modules: [
      {
        id: 'mod-2-1', nom: 'Fondamentaux de l\'IA', code: 'FONDIA',
        matieres: [
          { id: 'mat-2-1-1', nom: 'Introduction à l\'IA', code: 'INTROIA', coefficient: 3, bareme: 20 },
          { id: 'mat-2-1-2', nom: 'Python pour l\'IA', code: 'PYIA', coefficient: 4, bareme: 20 },
          { id: 'mat-2-1-3', nom: 'Mathématiques appliquées', code: 'MATH', coefficient: 3, bareme: 20 },
        ]
      },
      {
        id: 'mod-2-2', nom: 'Machine Learning', code: 'ML',
        matieres: [
          { id: 'mat-2-2-1', nom: 'Algorithmes de ML', code: 'ALGML', coefficient: 4, bareme: 20 },
          { id: 'mat-2-2-2', nom: 'Réseaux de neurones', code: 'NEUR', coefficient: 3, bareme: 20 },
          { id: 'mat-2-2-3', nom: 'Projet IA', code: 'PROJIA', coefficient: 3, bareme: 20 },
        ]
      }
    ]
  },
  {
    id: 'form-3',
    nom: 'Initiation à la Robotique',
    code: 'ROB',
    description: 'Formation à la construction et programmation de robots simples',
    duree: 2,
    formateurId: 'user-14',
    modules: [
      {
        id: 'mod-3-1', nom: 'Bases de l\'électronique', code: 'ELEC',
        matieres: [
          { id: 'mat-3-1-1', nom: 'Circuits électriques', code: 'CIRC', coefficient: 3, bareme: 20 },
          { id: 'mat-3-1-2', nom: 'Composants électroniques', code: 'COMPO', coefficient: 3, bareme: 20 },
          { id: 'mat-3-1-3', nom: 'Soudure et montage', code: 'SOUD', coefficient: 2, bareme: 20 },
        ]
      },
      {
        id: 'mod-3-2', nom: 'Programmation de robots', code: 'PROGROB',
        matieres: [
          { id: 'mat-3-2-1', nom: 'Arduino', code: 'ARD', coefficient: 4, bareme: 20 },
          { id: 'mat-3-2-2', nom: 'Capteurs et actionneurs', code: 'CAPT', coefficient: 3, bareme: 20 },
          { id: 'mat-3-2-3', nom: 'Projet robotique', code: 'PROJROB', coefficient: 3, bareme: 20 },
        ]
      }
    ]
  },
  {
    id: 'form-4',
    nom: 'Initiation à la Cybersécurité',
    code: 'CYB',
    description: 'Formation aux bases de la sécurité informatique et à la protection des données',
    duree: 2,
    formateurId: 'user-15',
    modules: [
      {
        id: 'mod-4-1', nom: 'Fondamentaux de la sécurité', code: 'SECU',
        matieres: [
          { id: 'mat-4-1-1', nom: 'Introduction à la cybersécurité', code: 'INTCYB', coefficient: 3, bareme: 20 },
          { id: 'mat-4-1-2', nom: 'Réseaux et protocoles', code: 'RES', coefficient: 3, bareme: 20 },
          { id: 'mat-4-1-3', nom: 'Cryptographie de base', code: 'CRYPT', coefficient: 3, bareme: 20 },
        ]
      },
      {
        id: 'mod-4-2', nom: 'Pratique de la sécurité', code: 'PRATSEC',
        matieres: [
          { id: 'mat-4-2-1', nom: 'Tests d\'intrusion', code: 'PENTEST', coefficient: 4, bareme: 20 },
          { id: 'mat-4-2-2', nom: 'Sécurisation des systèmes', code: 'SECSYS', coefficient: 3, bareme: 20 },
          { id: 'mat-4-2-3', nom: 'Éthique et légalité', code: 'ETHIK', coefficient: 2, bareme: 20 },
        ]
      }
    ]
  },
  {
    id: 'form-5',
    nom: 'Pilotage de Drone',
    code: 'DRONE',
    description: 'Formation au pilotage, à la maintenance et à la réglementation des drones',
    duree: 2,
    formateurId: 'user-16',
    modules: [
      {
        id: 'mod-5-1', nom: 'Théorie du vol', code: 'THEOVOL',
        matieres: [
          { id: 'mat-5-1-1', nom: 'Aérodynamique et mécanique de vol', code: 'AERO', coefficient: 3, bareme: 20 },
          { id: 'mat-5-1-2', nom: 'Réglementation aérienne', code: 'REGUL', coefficient: 3, bareme: 20 },
          { id: 'mat-5-1-3', nom: 'Sécurité et procédures', code: 'SECUDR', coefficient: 2, bareme: 20 },
        ]
      },
      {
        id: 'mod-5-2', nom: 'Pratique du pilotage', code: 'PILOT',
        matieres: [
          { id: 'mat-5-2-1', nom: 'Prise en main et calibrage', code: 'CALIB', coefficient: 3, bareme: 20 },
          { id: 'mat-5-2-2', nom: 'Vol stationnaire et manœuvres', code: 'MANV', coefficient: 4, bareme: 20 },
          { id: 'mat-5-2-3', nom: 'Maintenance et réparation', code: 'MAINT', coefficient: 2, bareme: 20 },
        ]
      }
    ]
  },
  {
    id: 'form-6',
    nom: 'Photographie',
    code: 'PHOTO',
    description: 'Formation aux techniques de prise de vue, cadrage et retouche photo',
    duree: 2,
    formateurId: 'user-17',
    modules: [
      {
        id: 'mod-6-1', nom: 'Techniques de prise de vue', code: 'PRISE',
        matieres: [
          { id: 'mat-6-1-1', nom: 'Fonctionnement de l\'appareil photo', code: 'APP', coefficient: 3, bareme: 20 },
          { id: 'mat-6-1-2', nom: 'Cadrage et composition', code: 'CADR', coefficient: 4, bareme: 20 },
          { id: 'mat-6-1-3', nom: 'Lumière et exposition', code: 'EXPO', coefficient: 3, bareme: 20 },
        ]
      },
      {
        id: 'mod-6-2', nom: 'Post-traitement', code: 'POST',
        matieres: [
          { id: 'mat-6-2-1', nom: 'Retouche avec Lightroom', code: 'LR', coefficient: 3, bareme: 20 },
          { id: 'mat-6-2-2', nom: 'Photoshop pour photographes', code: 'PS', coefficient: 3, bareme: 20 },
          { id: 'mat-6-2-3', nom: 'Portfolio et projet final', code: 'PORTF', coefficient: 2, bareme: 20 },
        ]
      }
    ]
  }
];

// ============= USERS (17) =============
export const users: User[] = [
  // Admin + Direction
  { id: 'user-1', matricule: 'ADM001', nom: 'ADJOVI', prenom: 'Koffi', email: 'admin@futur.bj', role: 'admin', password: '147faceb', premiereConnexion: false, actif: true },
  { id: 'user-2', matricule: 'DIR001', nom: 'HOUETO', prenom: 'Marcel', email: 'direction@futur.bj', role: 'direction', password: '28e24f87', premiereConnexion: false, actif: true },
  // 9 Responsables de site
  { id: 'user-3', matricule: 'RES001', nom: 'GANHOUN', prenom: 'Aline', email: 'resp-natitingou@futur.bj', role: 'responsable', siteId: 'site-1', password: '052ad8f6', premiereConnexion: false, actif: true },
  { id: 'user-4', matricule: 'RES002', nom: 'TOSSOU', prenom: 'Robert', email: 'resp-parakou@futur.bj', role: 'responsable', siteId: 'site-2', password: '052ad8f6', premiereConnexion: false, actif: true },
  { id: 'user-5', matricule: 'RES003', nom: 'YEHOUENOU', prenom: 'Béatrice', email: 'resp-dassa@futur.bj', role: 'responsable', siteId: 'site-3', password: '052ad8f6', premiereConnexion: false, actif: true },
  { id: 'user-6', matricule: 'RES004', nom: 'AKOHA', prenom: 'Pierre', email: 'resp-bohicon@futur.bj', role: 'responsable', siteId: 'site-4', password: '052ad8f6', premiereConnexion: false, actif: true },
  { id: 'user-7', matricule: 'RES005', nom: 'SOSSOU', prenom: 'Laure', email: 'resp-godomey@futur.bj', role: 'responsable', siteId: 'site-5', password: '052ad8f6', premiereConnexion: false, actif: true },
  { id: 'user-8', matricule: 'RES006', nom: 'ADANDE', prenom: 'Justin', email: 'resp-minontin@futur.bj', role: 'responsable', siteId: 'site-6', password: '052ad8f6', premiereConnexion: false, actif: true },
  { id: 'user-9', matricule: 'RES007', nom: 'GNANHOUI', prenom: 'Céline', email: 'resp-haievive@futur.bj', role: 'responsable', siteId: 'site-7', password: '052ad8f6', premiereConnexion: false, actif: true },
  { id: 'user-10', matricule: 'RES008', nom: 'VIDO', prenom: 'Emmanuel', email: 'resp-akpakpa@futur.bj', role: 'responsable', siteId: 'site-8', password: '052ad8f6', premiereConnexion: false, actif: true },
  { id: 'user-11', matricule: 'RES009', nom: 'HOUNSA', prenom: 'Pascaline', email: 'resp-portonovo@futur.bj', role: 'responsable', siteId: 'site-9', password: '052ad8f6', premiereConnexion: false, actif: true },
  // 6 Formateurs (1 par filière)
  { id: 'user-12', matricule: 'FOR001', nom: 'DEGBEDJI', prenom: 'Sylvain', email: 'formateur-info@futur.bj', role: 'formateur', formationId: 'form-1', password: '1aaf5c6a', premiereConnexion: false, actif: true },
  { id: 'user-13', matricule: 'FOR002', nom: 'GNANCADJA', prenom: 'Clarisse', email: 'formateur-ia@futur.bj', role: 'formateur', formationId: 'form-2', password: '1aaf5c6a', premiereConnexion: false, actif: true },
  { id: 'user-14', matricule: 'FOR003', nom: 'HOUESSOU', prenom: 'Vincent', email: 'formateur-robotique@futur.bj', role: 'formateur', formationId: 'form-3', password: '1aaf5c6a', premiereConnexion: false, actif: true },
  { id: 'user-15', matricule: 'FOR004', nom: 'ZINSOU', prenom: 'Martine', email: 'formateur-cyber@futur.bj', role: 'formateur', formationId: 'form-4', password: '1aaf5c6a', premiereConnexion: false, actif: true },
  { id: 'user-16', matricule: 'FOR005', nom: 'AKPLOGAN', prenom: 'Serge', email: 'formateur-drone@futur.bj', role: 'formateur', formationId: 'form-5', password: '1aaf5c6a', premiereConnexion: false, actif: true },
  { id: 'user-17', matricule: 'FOR006', nom: 'DOSSOU', prenom: 'Yvette', email: 'formateur-photo@futur.bj', role: 'formateur', formationId: 'form-6', password: '1aaf5c6a', premiereConnexion: false, actif: true },
];

// ============= APPRENANTS (24) =============
export const apprenants: Apprenant[] = [
  // Natitingou — IA, Robotique, Informatique
  { id: 'app-1', matricule: 'FUT-NAT-IA-001', nom: 'AGOSSOU', prenom: 'Jean', sexe: 'M', dateNaissance: '2002-05-12', telephone: '+229 97 01 01 01', email: 'jean.agossou@futur.bj', adresse: 'Natitingou Centre', formationId: 'form-2', siteId: 'site-1', promotion: '2026', dateInscription: '2026-01-10', statut: 'actif' },
  { id: 'app-2', matricule: 'FUT-NAT-ROB-001', nom: 'GBAGUIDI', prenom: 'Marie', sexe: 'F', dateNaissance: '2001-08-23', telephone: '+229 97 02 02 02', email: 'marie.gbaguidi@futur.bj', adresse: 'Natitingou, Atacora', formationId: 'form-3', siteId: 'site-1', promotion: '2026', dateInscription: '2026-01-10', statut: 'actif' },
  { id: 'app-3', matricule: 'FUT-NAT-II-001', nom: 'OURO', prenom: 'David', sexe: 'M', dateNaissance: '2003-02-14', telephone: '+229 97 03 03 03', email: 'david.ouro@futur.bj', adresse: 'Tchirimina, Natitingou', formationId: 'form-1', siteId: 'site-1', promotion: '2026', dateInscription: '2026-01-12', statut: 'actif' },
  // Parakou — IA, Cybersécurité, Drone
  { id: 'app-4', matricule: 'FUT-PRK-IA-001', nom: 'BIO', prenom: 'Saliou', sexe: 'M', dateNaissance: '2003-08-02', telephone: '+229 97 04 04 04', email: 'saliou.bio@futur.bj', adresse: 'Kobourou, Parakou', formationId: 'form-2', siteId: 'site-2', promotion: '2026', dateInscription: '2026-01-15', statut: 'actif' },
  { id: 'app-5', matricule: 'FUT-PRK-CYB-001', nom: 'ADAM', prenom: 'Nabil', sexe: 'M', dateNaissance: '2002-02-28', telephone: '+229 97 05 05 05', email: 'nabil.adam@futur.bj', adresse: 'Titirou, Parakou', formationId: 'form-4', siteId: 'site-2', promotion: '2026', dateInscription: '2026-01-20', statut: 'actif' },
  { id: 'app-6', matricule: 'FUT-PRK-DRONE-001', nom: 'DOKO', prenom: 'Mariam', sexe: 'F', dateNaissance: '2001-11-15', telephone: '+229 97 06 06 06', email: 'mariam.doko@futur.bj', adresse: 'Guèma, Parakou', formationId: 'form-5', siteId: 'site-2', promotion: '2026', dateInscription: '2026-02-01', statut: 'actif' },
  // Dassa — Informatique, Photographie
  { id: 'app-7', matricule: 'FUT-DAS-II-001', nom: 'HOUETON', prenom: 'Armel', sexe: 'M', dateNaissance: '2004-01-20', telephone: '+229 97 07 07 07', email: 'armel.houeton@futur.bj', adresse: 'Dassa Centre', formationId: 'form-1', siteId: 'site-3', promotion: '2026', dateInscription: '2026-02-01', statut: 'actif' },
  { id: 'app-8', matricule: 'FUT-DAS-PHOTO-001', nom: 'VIDEGLA', prenom: 'Rosine', sexe: 'F', dateNaissance: '2002-09-16', telephone: '+229 97 08 08 08', email: 'rosine.videgla@futur.bj', adresse: 'Gangan, Dassa', formationId: 'form-6', siteId: 'site-3', promotion: '2026', dateInscription: '2026-02-01', statut: 'actif' },
  // Bohicon — IA, Photographie, Drone
  { id: 'app-9', matricule: 'FUT-BOH-IA-001', nom: 'SOSSOU', prenom: 'Pélagie', sexe: 'F', dateNaissance: '2000-12-05', telephone: '+229 97 09 09 09', email: 'pelagie.sossou@futur.bj', adresse: 'Bohicon Centre', formationId: 'form-2', siteId: 'site-4', promotion: '2026', dateInscription: '2026-02-05', statut: 'actif' },
  { id: 'app-10', matricule: 'FUT-BOH-PHOTO-001', nom: 'AMOUSSOU', prenom: 'Fernand', sexe: 'M', dateNaissance: '2003-06-22', telephone: '+229 97 10 10 10', email: 'fernand.amoussou@futur.bj', adresse: 'Agbangnizoun, Bohicon', formationId: 'form-6', siteId: 'site-4', promotion: '2026', dateInscription: '2026-02-10', statut: 'actif' },
  { id: 'app-11', matricule: 'FUT-BOH-DRONE-001', nom: 'KOUMA', prenom: 'Aïssatou', sexe: 'F', dateNaissance: '2001-07-14', telephone: '+229 97 11 11 11', email: 'aissatou.kouma@futur.bj', adresse: 'Sokponta, Bohicon', formationId: 'form-5', siteId: 'site-4', promotion: '2026', dateInscription: '2026-02-15', statut: 'actif' },
  // Godomey — IA, Robotique, Cybersécurité
  { id: 'app-12', matricule: 'FUT-GOD-IA-001', nom: 'DANSOU', prenom: 'Aminatou', sexe: 'F', dateNaissance: '2002-11-30', telephone: '+229 97 12 12 12', email: 'aminatou.dansou@futur.bj', adresse: 'Godomey, Cotonou', formationId: 'form-2', siteId: 'site-5', promotion: '2026', dateInscription: '2026-01-15', statut: 'actif' },
  { id: 'app-13', matricule: 'FUT-GOD-ROB-001', nom: 'LAWANI', prenom: 'Ibrahim', sexe: 'M', dateNaissance: '2000-07-19', telephone: '+229 97 13 13 13', email: 'ibrahim.lawani@futur.bj', adresse: 'Fidjrossè, Cotonou', formationId: 'form-3', siteId: 'site-5', promotion: '2026', dateInscription: '2026-01-10', statut: 'actif' },
  { id: 'app-14', matricule: 'FUT-GOD-CYB-001', nom: 'HOUNKPE', prenom: 'Luc', sexe: 'M', dateNaissance: '2001-04-03', telephone: '+229 97 14 14 14', email: 'luc.hounkpe@futur.bj', adresse: 'Togbin, Godomey', formationId: 'form-4', siteId: 'site-5', promotion: '2026', dateInscription: '2026-01-20', statut: 'actif' },
  // Minontin — Informatique, Drone
  { id: 'app-15', matricule: 'FUT-MIN-II-001', nom: 'TODJINOU', prenom: 'Pascal', sexe: 'M', dateNaissance: '2001-01-18', telephone: '+229 97 15 15 15', email: 'pascal.todjinou@futur.bj', adresse: 'Minontin, Cotonou', formationId: 'form-1', siteId: 'site-6', promotion: '2026', dateInscription: '2026-03-01', statut: 'actif' },
  { id: 'app-16', matricule: 'FUT-MIN-DRONE-001', nom: 'MENSAH', prenom: 'Florence', sexe: 'F', dateNaissance: '2002-04-27', telephone: '+229 97 16 16 16', email: 'florence.mensah@futur.bj', adresse: 'Akpakpa, Cotonou', formationId: 'form-5', siteId: 'site-6', promotion: '2026', dateInscription: '2026-03-05', statut: 'actif' },
  // Haie Vive — Photographie, IA, Cybersécurité
  { id: 'app-17', matricule: 'FUT-HAV-PHOTO-001', nom: 'AHOUANSOU', prenom: 'Chantal', sexe: 'F', dateNaissance: '2001-03-08', telephone: '+229 97 17 17 17', email: 'chantal.ahouansou@futur.bj', adresse: 'Haie Vive, Cotonou', formationId: 'form-6', siteId: 'site-7', promotion: '2026', dateInscription: '2026-02-01', statut: 'actif' },
  { id: 'app-18', matricule: 'FUT-HAV-IA-001', nom: 'HOUINSOU', prenom: 'Augustin', sexe: 'M', dateNaissance: '2000-10-10', telephone: '+229 97 18 18 18', email: 'augustin.houinsou@futur.bj', adresse: 'Zongo, Cotonou', formationId: 'form-2', siteId: 'site-7', promotion: '2026', dateInscription: '2026-03-10', statut: 'actif' },
  { id: 'app-19', matricule: 'FUT-HAV-CYB-001', nom: 'ZANNOU', prenom: 'Brigitte', sexe: 'F', dateNaissance: '2003-05-19', telephone: '+229 97 19 19 19', email: 'brigitte.zannou@futur.bj', adresse: 'Cocotiers, Cotonou', formationId: 'form-4', siteId: 'site-7', promotion: '2026', dateInscription: '2026-03-15', statut: 'actif' },
  // Akpakpa — Robotique, Drone
  { id: 'app-20', matricule: 'FUT-AKP-ROB-001', nom: 'DEGLA', prenom: 'Komi', sexe: 'M', dateNaissance: '2002-02-14', telephone: '+229 97 20 20 20', email: 'komi.degla@futur.bj', adresse: 'Akpakpa Centre, Cotonou', formationId: 'form-3', siteId: 'site-8', promotion: '2026', dateInscription: '2026-04-01', statut: 'actif' },
  { id: 'app-21', matricule: 'FUT-AKP-DRONE-001', nom: 'HOUEDANOU', prenom: 'Alice', sexe: 'F', dateNaissance: '2000-09-05', telephone: '+229 97 21 21 21', email: 'alice.houedanou@futur.bj', adresse: 'Dédokpo, Cotonou', formationId: 'form-5', siteId: 'site-8', promotion: '2026', dateInscription: '2026-04-05', statut: 'actif' },
  // Porto-Novo — Cybersécurité, IA, Informatique
  { id: 'app-22', matricule: 'FUT-PTN-CYB-001', nom: 'GNONLONFOUN', prenom: 'Idriss', sexe: 'M', dateNaissance: '2001-06-12', telephone: '+229 97 22 22 22', email: 'idriss.gnonlonfoun@futur.bj', adresse: 'Ouando, Porto-Novo', formationId: 'form-4', siteId: 'site-9', promotion: '2026', dateInscription: '2026-05-01', statut: 'actif' },
  { id: 'app-23', matricule: 'FUT-PTN-IA-001', nom: 'AGBODJO', prenom: 'Sophie', sexe: 'F', dateNaissance: '2003-11-08', telephone: '+229 97 23 23 23', email: 'sophie.agbodjo@futur.bj', adresse: 'Kandévié, Porto-Novo', formationId: 'form-2', siteId: 'site-9', promotion: '2026', dateInscription: '2026-05-05', statut: 'actif' },
  { id: 'app-24', matricule: 'FUT-PTN-II-001', nom: 'YEHOUESSI', prenom: 'Léopold', sexe: 'M', dateNaissance: '2002-08-22', telephone: '+229 97 24 24 24', email: 'leopold.yehouessi@futur.bj', adresse: 'Lokossa, Porto-Novo', formationId: 'form-1', siteId: 'site-9', promotion: '2026', dateInscription: '2026-05-10', statut: 'actif' },
];

// ============= CACHED EVALUATIONS & NOTES =============
let _cachedEvaluations: Evaluation[] | null = null;
let _cachedNotes: Note[] | null = null;

// ============= EVALUATIONS =============
export function genererEvaluations(): Evaluation[] {
  if (_cachedEvaluations) return _cachedEvaluations;
  const evals: Evaluation[] = [];
  let id = 1;
  const types: Array<{ type: Evaluation['type']; label: string; coef: number }> = [
    { type: 'DS', label: 'Devoir Surveillé', coef: 2 },
    { type: 'TP', label: 'Travaux Pratiques', coef: 1 },
    { type: 'EXAMEN', label: 'Examen Final', coef: 3 },
    { type: 'PROJET', label: 'Projet', coef: 2 },
  ];

  for (const form of formations) {
    if (!form.formateurId) continue;
    // Find all sites where this formation has students
    const sitesWithStudents = [...new Set(apprenants.filter(a => a.formationId === form.id).map(a => a.siteId))];
    for (const siteId of sitesWithStudents) {
      const promos = [...new Set(apprenants.filter(a => a.formationId === form.id && a.siteId === siteId).map(a => a.promotion))];
      for (const promo of promos) {
        for (const t of types) {
          evals.push({
            id: `eval-${id++}`,
            titre: `${t.label} — ${form.nom} (${sites.find(s => s.id === siteId)?.code})`,
            type: t.type,
            coefficient: t.coef,
            bareme: 20,
            dateEvaluation: `2026-0${3 + Math.floor(Math.random() * 5)}-${String(10 + Math.floor(Math.random() * 18)).padStart(2, '0')}`,
            classeId: `${siteId}-${form.id}-${promo}`,
            siteId,
            formationId: form.id,
            promotion: promo,
            formateurId: form.formateurId,
            dateCreation: '2026-02-15',
            statut: 'publiee',
          });
        }
      }
    }
  }
  _cachedEvaluations = evals;
  return evals;
}

// ============= NOTES (workflow-aware) =============
function genererNoteValeur(base: number, variance: number): number {
  const note = base + (Math.random() * variance * 2 - variance);
  return Math.min(20, Math.max(0, Math.round(note * 100) / 100));
}

export function genererNotes(): Note[] {
  if (_cachedNotes) return _cachedNotes;
  const notes: Note[] = [];
  const evaluations = genererEvaluations();
  let noteId = 1;

  for (const app of apprenants) {
    const formation = formations.find(f => f.id === app.formationId);
    if (!formation) continue;

    // Filter evaluations for this apprenant's class
    const appEvals = evaluations.filter(e =>
      e.formationId === app.formationId &&
      e.siteId === app.siteId &&
      e.promotion === app.promotion
    );

    for (const evaluation of appEvals) {
      for (const mod of formation.modules) {
        for (const mat of mod.matieres) {
          const statutApprenant: StatutApprenantNote = Math.random() > 0.95 ? 'absent' : 'present';
          // Cycle through workflow statuses: mostly validee, some en_attente, few rejetee
          let statut: StatutNote;
          const r = Math.random();
          if (r < 0.65) statut = 'validee';
          else if (r < 0.85) statut = 'en_attente';
          else if (r < 0.92) statut = 'rejetee';
          else statut = 'brouillon';

          const note: Note = {
            id: `note-${noteId++}`,
            apprenantId: app.id,
            evaluationId: evaluation.id,
            matiereId: mat.id,
            formateurId: evaluation.formateurId,
            valeur: statutApprenant === 'absent' ? null : genererNoteValeur(12, 5),
            statutApprenant,
            dateSaisie: '2026-03-15',
            statut,
          };

          // Add validation info for validated/rejected notes
          if (statut === 'validee') {
            const siteResp = users.find(u => u.siteId === app.siteId && u.role === 'responsable');
            note.validateurId = siteResp?.id;
            note.dateValidation = '2026-03-20';
          } else if (statut === 'rejetee') {
            note.motifRejet = 'Veuillez vérifier la note saisie';
          }

          notes.push(note);
        }
      }
    }
  }
  _cachedNotes = notes;
  return notes;
}

// ============= LOGS D'ACTIONS =============
export const logsActions: LogAction[] = [
  { id: 'log-1', userId: 'user-7', userNom: 'SOSSOU Laure', action: 'Validation notes', details: 'Validation des notes IA — Godomey (GOD-IA-2026)', dateHeure: '2026-03-20 14:30:00', resultat: 'succes' },
  { id: 'log-2', userId: 'user-12', userNom: 'DEGBEDJI Sylvain', action: 'Saisie notes', details: 'Saisie DS Informatique — Natitingou, Dassa, Minontin, Porto-Novo', dateHeure: '2026-03-16 09:15:00', resultat: 'succes' },
  { id: 'log-3', userId: 'user-13', userNom: 'GNANCADJA Clarisse', action: 'Saisie notes', details: 'Saisie TP IA — Godomey, Parakou, Bohicon, Haie Vive', dateHeure: '2026-03-17 10:45:00', resultat: 'succes' },
  { id: 'log-4', userId: 'user-1', userNom: 'ADJOVI Koffi', action: 'Création utilisateur', details: 'Création compte formateur Photographie', dateHeure: '2026-02-01 08:00:00', resultat: 'succes' },
  { id: 'log-5', userId: 'user-3', userNom: 'GANHOUN Aline', action: 'Rejet notes', details: 'Rejet notes Robotique — Natitingou: incohérence DS/TP', dateHeure: '2026-03-18 11:20:00', resultat: 'succes' },
  { id: 'log-6', userId: 'user-2', userNom: 'HOUETO Marcel', action: 'Consultation rapports', details: 'Consultation synthèse par site — Tous les sites', dateHeure: '2026-03-21 15:00:00', resultat: 'succes' },
  { id: 'log-7', userId: 'user-16', userNom: 'AKPLOGAN Serge', action: 'Saisie notes', details: 'Saisie Examen Drone — Parakou, Bohicon, Minontin, Akpakpa', dateHeure: '2026-03-19 08:30:00', resultat: 'succes' },
  { id: 'log-8', userId: 'user-9', userNom: 'GNANHOUI Céline', action: 'Validation notes', details: 'Validation notes Photo — Haie Vive (HAV-PHOTO-2026)', dateHeure: '2026-03-20 16:00:00', resultat: 'succes' },
];

// ============= UTILITY FUNCTIONS =============
export function getMentionColor(mention: Mention): string {
  switch (mention) {
    case 'Excellent': return 'text-yellow-500';
    case 'Très Bien': return 'text-green-600';
    case 'Bien': return 'text-emerald-500';
    case 'Assez Bien': return 'text-blue-500';
    case 'Passable': return 'text-orange-500';
    case 'Ajourné': return 'text-red-600';
  }
}

export function getMentionBg(mention: Mention): string {
  switch (mention) {
    case 'Excellent': return 'bg-yellow-100 border-yellow-400';
    case 'Très Bien': return 'bg-green-100 border-green-400';
    case 'Bien': return 'bg-emerald-100 border-emerald-400';
    case 'Assez Bien': return 'bg-blue-100 border-blue-400';
    case 'Passable': return 'bg-orange-100 border-orange-400';
    case 'Ajourné': return 'bg-red-100 border-red-400';
  }
}

export const STATUT_NOTE_LABELS: Record<StatutNote, string> = {
  brouillon: 'Brouillon',
  en_attente: 'En attente de validation',
  validee: 'Validée',
  rejetee: 'Rejetée',
  cloturee: 'Clôturée',
};

export const STATUT_NOTE_COLORS: Record<StatutNote, string> = {
  brouillon: 'bg-gray-100 text-gray-600',
  en_attente: 'bg-yellow-100 text-yellow-700',
  validee: 'bg-green-100 text-green-700',
  rejetee: 'bg-red-100 text-red-700',
  cloturee: 'bg-blue-100 text-blue-700',
};

export const STATUT_APPRENANT_LABELS: Record<StatutApprenantNote, string> = {
  present: 'Présent',
  absent: 'Absent',
  dispense: 'Dispensé',
};
