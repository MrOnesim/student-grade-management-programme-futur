import { Apprenant, Site, User, Formation, Note, Evaluation, LogAction } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ============= LOCAL FALLBACK =============
function loadLocal<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); if (s) return JSON.parse(s); } catch { /* ignore */ }
  return fallback;
}
function saveLocal(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ============= GENERIC CRUD =============
type TableName = 'apprenants' | 'sites' | 'users' | 'formations' | 'notes' | 'evaluations' | 'logs';

async function fetchAll<T>(table: TableName, localKey: string, fallback: T[]): Promise<T[]> {
  if (!isSupabaseConfigured()) return loadLocal(localKey, fallback);
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return (data as T[]) || [];
}

async function insertOne<T extends { id: string }>(table: TableName, localKey: string, item: T, onLocal: (items: T[]) => void): Promise<void> {
  if (!isSupabaseConfigured()) {
    const items = loadLocal<T[]>(localKey, []);
    onLocal([...items, item]);
    saveLocal(localKey, [...items, item]);
    return;
  }
  const { error } = await supabase.from(table).insert(item);
  if (error) throw error;
}

async function updateOne<T extends { id: string }>(table: TableName, localKey: string, item: T, onLocal: (items: T[]) => void): Promise<void> {
  if (!isSupabaseConfigured()) {
    const items = loadLocal<T[]>(localKey, []);
    onLocal(items.map(p => p.id === item.id ? item : p));
    saveLocal(localKey, items.map(p => p.id === item.id ? item : p));
    return;
  }
  const { error } = await supabase.from(table).update(item).eq('id', item.id);
  if (error) throw error;
}

async function deleteOne<T extends { id: string }>(table: TableName, localKey: string, id: string, onLocal: (items: T[]) => void, getItems: () => T[]): Promise<void> {
  if (!isSupabaseConfigured()) {
    const items = getItems();
    onLocal(items.filter(p => p.id !== id));
    saveLocal(localKey, items.filter(p => p.id !== id));
    return;
  }
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

// ============= MIGRATION HELPERS =============
export async function pushLocalToSupabase() {
  if (!isSupabaseConfigured()) return;
  const tables: TableName[] = ['apprenants', 'sites', 'users', 'formations', 'notes', 'evaluations', 'logs'];
  for (const table of tables) {
    const local = loadLocal<any[]>(`futurNotes_${table}`, []);
    if (local.length > 0) {
      const { error } = await supabase.from(table).upsert(local, { onConflict: 'id' });
      if (error) console.error(`Erreur sync ${table}:`, error);
    }
  }
}

export async function pullSupabaseToLocal() {
  if (!isSupabaseConfigured()) return;
  const tables: { table: TableName; localKey: string }[] = [
    { table: 'apprenants', localKey: 'futurNotes_apprenants' },
    { table: 'sites', localKey: 'futurNotes_sites' },
    { table: 'users', localKey: 'futurNotes_users' },
    { table: 'formations', localKey: 'futurNotes_formations' },
    { table: 'notes', localKey: 'futurNotes_notes' },
    { table: 'evaluations', localKey: 'futurNotes_evaluations' },
    { table: 'logs', localKey: 'futurNotes_logs' },
  ];
  for (const { table, localKey } of tables) {
    const { data } = await supabase.from(table).select('*');
    if (data) saveLocal(localKey, data);
  }
}
