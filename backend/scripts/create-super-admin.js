import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupSuperAdmin() {
  console.log('🚀 Starting Super Admin Setup (Standalone Script)...\n');

  // Step 1: Create default tenant
  console.log('📦 Creating default tenant...');
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .insert({
      name: 'Default Tenant',
      slug: 'default-tenant',
      settings: {},
    })
    .select()
    .single();

  if (tenantError) {
    console.error('❌ Failed to create tenant:', tenantError.message);
    process.exit(1);
  }

  console.log('✅ Tenant created:', tenant.id);

  // Step 2: Create super admin user in Supabase Auth
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

  console.log('\n👤 Creating super admin user...');
  console.log(`Email: ${adminEmail}`);

  let userId;

  // Check if user exists first to avoid error
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers.users.find(u => u.email === adminEmail);

  if (existingUser) {
    console.log('⚠️ User already exists in Auth, using existing ID.');
    userId = existingUser.id;
    // Optional: Update password here if needed
  } else {
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error('❌ Failed to create auth user:', authError.message);
      process.exit(1);
    }
    userId = authUser.user.id;
    console.log('✅ Auth user created:', userId);
  }

  // Step 3: Create/Update user profile with super_admin role
  console.log('\n🔐 Creating/Updating user profile with super_admin role...');
  
  const { data: userProfile, error: profileError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: userId,
      email: adminEmail,
      full_name: 'Super Admin',
      role: 'super_admin',
      tenant_id: tenant.id,
    })
    .select()
    .single();

  if (profileError) {
    console.error('❌ Failed to create user profile:', profileError.message);
    process.exit(1);
  }

  console.log('✅ User profile updated');

  console.log('\n🎉 Setup Complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Super Admin Credentials:');
  console.log(`Email:    ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`Tenant:   ${tenant.name} (${tenant.id})`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

setupSuperAdmin().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
