import { supabaseAdmin } from './config/supabase.js';

/**
 * Super Admin Setup Script
 * 
 * This script creates:
 * 1. A default tenant
 * 2. A super admin user
 * 3. Assigns the user to the tenant
 * 
 * Run with: npx ts-node src/setup-admin.ts
 */

async function setupSuperAdmin() {
  console.log('🚀 Starting Super Admin Setup...\n');

  // Step 1: Create default tenant
  console.log('📦 Creating default tenant...');
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .insert({
      name: 'Default Tenant',
      domain: 'default',
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
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD env vars are required');
    process.exit(1);
  }

  if (adminPassword.length < 12) {
    console.error('❌ ADMIN_PASSWORD must be at least 12 characters');
    process.exit(1);
  }

  console.log('\n👤 Creating super admin user...');
  console.log(`Email: ${adminEmail}`);

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (authError) {
    console.error('❌ Failed to create auth user:', authError.message);
    process.exit(1);
  }

  console.log('✅ Auth user created:', authUser.user.id);

  // Step 3: Create user profile with super_admin role
  console.log('\n🔐 Creating user profile with super_admin role...');
  const { data: userProfile, error: profileError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: authUser.user.id,
      email: adminEmail,
      full_name: 'Super Admin',
      role: 'super_admin',
      tenant_id: null,
    })
    .select()
    .single();

  if (profileError) {
    console.error('❌ Failed to create user profile:', profileError.message);
    process.exit(1);
  }

  console.log('✅ User profile created');

  console.log('\n🎉 Setup Complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Super Admin Credentials:');
  console.log(`Email:    ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`Tenant:   ${tenant.name} (${tenant.id})`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('You can now login at /login with these credentials.');
  console.log('To create more tenants, use the /api/admin endpoints.\n');

  process.exit(0);
}

setupSuperAdmin().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
