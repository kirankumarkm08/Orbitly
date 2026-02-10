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

async function inspectTenants() {
  console.log('Inspecting public.tenants table...');
  
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching from tenants table:', error);
  } else if (data && data.length > 0) {
    console.log('Columns found in tenants table:', Object.keys(data[0]));
    console.log('Sample data:', data[0]);
  } else {
    console.log('Tenants table is empty.');
  }
}

inspectTenants();
