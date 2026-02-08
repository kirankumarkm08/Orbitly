import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const createAdmin = async () => {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: npx ts-node scripts/create-admin.ts <email> <password>');
    process.exit(1);
  }

  console.log(`Creating admin user: ${email}...`);

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    console.error('Error creating auth user:', authError.message);
    process.exit(1);
  }

  if (!authData || !authData.user) {
    console.error('Auth user creation returned no user object');
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log(`Auth user created. ID: ${userId}`);

  // 2. Create tenant
  const tenantName = email.split('@')[0] + "'s Organization";
  
  // Check if tenant exists
  const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // Insert tenant
  const { data: tenantData, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .insert({
      name: tenantName,
      slug: slug,
    })
    .select()
    .single();

  if (tenantError) {
    console.error('Error creating tenant:', tenantError.message);
    // Cleanup auth user if tenant creation fails
    await supabaseAdmin.auth.admin.deleteUser(userId);
    process.exit(1);
  }

  if (!tenantData) {
    console.error('Tenant creation returned no data');
    await supabaseAdmin.auth.admin.deleteUser(userId);
    process.exit(1);
  }

  console.log(`Tenant created. ID: ${tenantData.id}`);

  // 3. Create user profile in public.users
  const { error: profileError } = await supabaseAdmin
    .from('users')
    .insert({
      id: userId,
      email: email,
      full_name: 'Super Admin',
      role: 'admin',
      tenant_id: tenantData.id,
    });

  if (profileError) {
    console.error('Error creating user profile:', profileError.message);
    process.exit(1);
  }

  console.log(`✅ Admin user setup complete!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  process.exit(0);
};

createAdmin();
