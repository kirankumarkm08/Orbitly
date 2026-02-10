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

async function checkUser() {
  console.log('Checking user admin@example.com...');
  
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', 'admin@example.com');

  if (error) {
    console.error('Error fetching user:', error);
  } else {
    console.log('User found in public.users:', users);
  }
}

checkUser();
