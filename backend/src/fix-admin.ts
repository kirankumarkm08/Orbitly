import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminUser() {
  const adminEmail = 'admin@minimal-saas.com';
  console.log(`🔧 Fixing admin user: ${adminEmail}...`);

  // 1. Find the user
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', adminEmail)
    .single();

  if (userError || !user) {
    console.error('❌ Could not find admin user:', userError?.message);
    process.exit(1);
  }

  // 2. Find the default tenant
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('slug', 'demo')
    .single();

  if (tenantError || !tenant) {
    console.error('❌ Could not find default tenant:', tenantError?.message);
    process.exit(1);
  }

  // 3. Update the user
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      role: 'super_admin',
      tenant_id: tenant.id
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('❌ Failed to update admin user:', updateError.message);
    process.exit(1);
  }

  console.log('✅ Admin user updated successfully:');
  console.log(`   Role: super_admin`);
  console.log(`   Tenant ID: ${tenant.id}`);
}

fixAdminUser();
