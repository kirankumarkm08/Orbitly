import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function inspectTable() {
  const tableName = process.argv[2] || 'users';
  console.log(`Inspecting public.${tableName} table...`);
  
  const { data, error } = await supabaseAdmin
    .from(tableName)
    .select('*')
    .limit(1);

  if (error) {
    console.error(`Error fetching from ${tableName} table:`, error);
  } else if (data && data.length > 0) {
    console.log(`Columns found in ${tableName} table:`, Object.keys(data[0]));
    console.log('Sample data:', data[0]);
  } else {
    console.log(`${tableName} table is empty.`);
  }
}

inspectTable();
