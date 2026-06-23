import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  Apprenant, Site, User, Formation, Note, Evaluation, LogAction,
} from '../types';
import {
  sites as defaultSites, formations as defaultFormations, users as defaultUsers,
  apprenants as defaultApprenants, genererEvaluations, genererNotes, logsActions as defaultLogs,
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { pushLocalToSupabase } from '../services/dataService';

interface DataContextType {
  apprenants: Apprenant[];
  sites: Site[];
  users: User[];
  formations: Formation[];
  notes: Note[];
  evaluations: Evaluation[];
  logs: LogAction[];
  addApprenant: (a: Apprenant) => void;
  updateApprenant: (a: Apprenant) => void;
  deleteApprenant: (id: string) => void;
  addSite: (s: Site) => void;
  updateSite: (s: Site) => void;
  deleteSite: (id: string) => void;
  addUser: (u: User) => void;
  updateUser: (u: User) => void;
  deleteUser: (id: string) => void;
  addFormation: (f: Formation) => void;
  updateFormation: (f: Formation) => void;
  deleteFormation: (id: string) => void;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  setEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;
  addLog: (action: string, details: string, resultat?: 'succes' | 'echec') => void;
  restoreData: (newData: any) => void;
  resetData: () => void;
  isSupabaseConnected: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_PREFIX = 'futurNotes_';

function loadFromLocal<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return fallback;
}

function saveToLocal(key: string, data: any) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

const defaultNotes = genererNotes();
const defaultEvals = genererEvaluations();

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabaseConnected = isSupabaseConfigured();
  
  const [apprenants, setApprenants] = useState<Apprenant[]>(() => loadFromLocal('apprenants', defaultApprenants));
  const [sites, setSites] = useState<Site[]>(() => loadFromLocal('sites', defaultSites));
  const [users, setUsers] = useState<User[]>(() => loadFromLocal('users', defaultUsers));
  const [formations, setFormations] = useState<Formation[]>(() => loadFromLocal('formations', defaultFormations));
  const [notes, setNotes] = useState<Note[]>(() => loadFromLocal('notes', defaultNotes));
  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => loadFromLocal('evaluations', defaultEvals));
  const [logs, setLogs] = useState<LogAction[]>(() => loadFromLocal('logs', defaultLogs));

  // Sync to localStorage (fallback) on every state change
  useEffect(() => { saveToLocal('apprenants', apprenants); }, [apprenants]);
  useEffect(() => { saveToLocal('sites', sites); }, [sites]);
  useEffect(() => { saveToLocal('users', users); }, [users]);
  useEffect(() => { saveToLocal('formations', formations); }, [formations]);
  useEffect(() => { saveToLocal('notes', notes); }, [notes]);
  useEffect(() => { saveToLocal('evaluations', evaluations); }, [evaluations]);
  useEffect(() => { saveToLocal('logs', logs); }, [logs]);

  // Push local data to Supabase on first load if configured
  useEffect(() => {
    if (supabaseConnected) {
      pushLocalToSupabase();
    }
  }, [supabaseConnected]);

  // Helper to add log entries
  const addLog = useCallback((action: string, details: string, resultat: 'succes' | 'echec' = 'succes') => {
    const newLog: LogAction = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user?.id || 'systeme',
      userNom: user ? `${user.prenom} ${user.nom}` : 'Système',
      action,
      details,
      dateHeure: new Date().toISOString().replace('T', ' ').substring(0, 19),
      resultat,
    };
    setLogs(prev => [newLog, ...prev]);
  }, [user]);

  const addApprenant = useCallback((a: Apprenant) => {
    setApprenants(prev => [...prev, a]);
    addLog('Création apprenant', `Ajout de l'apprenant ${a.prenom} ${a.nom} (Matricule: ${a.matricule})`);
  }, [addLog]);

  const updateApprenant = useCallback((a: Apprenant) => {
    setApprenants(prev => prev.map(p => p.id === a.id ? a : p));
    addLog('Modification apprenant', `Mise à jour des informations de l'apprenant ${a.prenom} ${a.nom} (Matricule: ${a.matricule})`);
  }, [addLog]);

  const deleteApprenant = useCallback((id: string) => {
    setApprenants(prev => {
      const found = prev.find(p => p.id === id);
      if (found) {
        addLog('Suppression apprenant', `Suppression de l'apprenant ${found.prenom} ${found.nom} (Matricule: ${found.matricule})`);
      }
      return prev.filter(p => p.id !== id);
    });
  }, [addLog]);

  const addSite = useCallback((s: Site) => {
    setSites(prev => [...prev, s]);
    addLog('Création site', `Ajout du site ${s.nom} (Code: ${s.code})`);
  }, [addLog]);

  const updateSite = useCallback((s: Site) => {
    setSites(prev => prev.map(p => p.id === s.id ? s : p));
    addLog('Modification site', `Mise à jour du site ${s.nom} (Code: ${s.code})`);
  }, [addLog]);

  const deleteSite = useCallback((id: string) => {
    setSites(prev => {
      const found = prev.find(p => p.id === id);
      if (found) {
        addLog('Suppression site', `Suppression du site ${found.nom} (Code: ${found.code})`);
      }
      return prev.filter(p => p.id !== id);
    });
  }, [addLog]);

  const addUser = useCallback((u: User) => {
    setUsers(prev => [...prev, u]);
    addLog('Création utilisateur', `Création du compte ${u.prenom} ${u.nom} (Rôle: ${u.role})`);
  }, [addLog]);

  const updateUser = useCallback((u: User) => {
    setUsers(prev => prev.map(p => p.id === u.id ? u : p));
    addLog('Modification utilisateur', `Mise à jour du compte ${u.prenom} ${u.nom} (Rôle: ${u.role})`);
  }, [addLog]);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => {
      const found = prev.find(p => p.id === id);
      if (found) {
        addLog('Suppression utilisateur', `Suppression de l'utilisateur ${found.prenom} ${found.nom} (Rôle: ${found.role})`);
      }
      return prev.filter(p => p.id !== id);
    });
  }, [addLog]);

  const addFormation = useCallback((f: Formation) => {
    setFormations(prev => [...prev, f]);
    addLog('Création formation', `Ajout de la filière ${f.nom} (Code: ${f.code})`);
  }, [addLog]);

  const updateFormation = useCallback((f: Formation) => {
    setFormations(prev => prev.map(p => p.id === f.id ? f : p));
    addLog('Modification formation', `Mise à jour de la filière ${f.nom} (Code: ${f.code})`);
  }, [addLog]);

  const deleteFormation = useCallback((id: string) => {
    setFormations(prev => {
      const found = prev.find(p => p.id === id);
      if (found) {
        addLog('Suppression formation', `Suppression de la filière ${found.nom} (Code: ${found.code})`);
      }
      return prev.filter(p => p.id !== id);
    });
  }, [addLog]);

  const restoreData = useCallback((newData: any) => {
    if (newData.apprenants) setApprenants(newData.apprenants);
    if (newData.sites) setSites(newData.sites);
    if (newData.users) setUsers(newData.users);
    if (newData.formations) setFormations(newData.formations);
    if (newData.notes) setNotes(newData.notes);
    if (newData.evaluations) setEvaluations(newData.evaluations);
    
    const restoreLog: LogAction = {
      id: `log-${Date.now()}-restore`,
      userId: user?.id || 'systeme',
      userNom: user ? `${user.prenom} ${user.nom}` : 'Système',
      action: 'Restauration base',
      details: 'Restauration complète de la base de données depuis un fichier JSON',
      dateHeure: new Date().toISOString().replace('T', ' ').substring(0, 19),
      resultat: 'succes',
    };
    
    if (newData.logs) {
      setLogs([restoreLog, ...newData.logs]);
    } else {
      setLogs(prev => [restoreLog, ...prev]);
    }
  }, [user]);

  const resetData = useCallback(() => {
    setApprenants(defaultApprenants);
    setSites(defaultSites);
    setUsers(defaultUsers);
    setFormations(defaultFormations);
    setNotes(defaultNotes);
    setEvaluations(defaultEvals);
    setLogs(defaultLogs);
    ['apprenants', 'sites', 'users', 'formations', 'notes', 'evaluations', 'logs'].forEach(k => localStorage.removeItem(`${STORAGE_PREFIX}${k}`));
    addLog('Réinitialisation base', 'Réinitialisation complète de toutes les données aux valeurs par défaut');
  }, [addLog]);

  return (
    <DataContext.Provider value={{
      apprenants, sites, users, formations, notes, evaluations, logs,
      addApprenant, updateApprenant, deleteApprenant,
      addSite, updateSite, deleteSite,
      addUser, updateUser, deleteUser,
      addFormation, updateFormation, deleteFormation,
      setNotes, setEvaluations, addLog, restoreData, resetData,
      isSupabaseConnected: supabaseConnected,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

