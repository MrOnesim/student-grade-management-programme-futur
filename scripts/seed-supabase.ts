import { createClient } from '@supabase/supabase-js';
import { sites, formations, users, apprenants, logsActions } from '../src/data/mockData';
import { genererEvaluations, genererNotes } from '../src/data/mockData';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rocmhxfnhomdylndrrgd.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!serviceRoleKey) { console.error('❌ Définissez SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  const tables: { name: string; data: any[] }[] = [
    { name: 'sites', data: sites },
    { name: 'formations', data: formations },
    { name: 'users', data: users },
    { name: 'apprenants', data: apprenants },
    { name: 'evaluations', data: genererEvaluations() },
    { name: 'notes', data: genererNotes() },
    { name: 'logs', data: logsActions },
  ];

  for (const { name, data } of tables) {
    const { error } = await supabase.from(name).upsert(data, { onConflict: 'id' });
    if (error) {
      console.error(`✖ Erreur ${name}:`, error.message);
    } else {
      console.log(`✔ ${name}: ${data.length} enregistrements`);
    }
  }

  console.log('\n✅ Données importées avec succès !');
}

seed().catch(console.error);
