import { supabaseAdmin } from './config/supabase.js';

const TEST_USERS = [
  {
    email: 'admin@orbitly.com',
    password: 'OrbitlyAdmin2024!',
    full_name: 'Super Admin',
    role: 'super_admin',
    tenant_id: null,
    tenant_name: null,
    niche: null,
  },
  {
    email: 'static-admin@orbitly.test',
    password: 'StaticPass2024!',
    full_name: 'Static Admin',
    role: 'tenant_admin',
    tenant_name: 'Static Portfolio Co',
    niche: 'static',
  },
  {
    email: 'static-user@orbitly.test',
    password: 'StaticUser2024!',
    full_name: 'Static User',
    role: 'user',
    tenant_name: 'Static Portfolio Co',
    niche: 'static',
  },
  {
    email: 'ecom-admin@orbitly.test',
    password: 'EcomPass2024!',
    full_name: 'E-commerce Admin',
    role: 'tenant_admin',
    tenant_name: 'E-com Store',
    niche: 'ecommerce',
  },
  {
    email: 'ecom-user@orbitly.test',
    password: 'EcomUser2024!',
    full_name: 'E-commerce Customer',
    role: 'user',
    tenant_name: 'E-com Store',
    niche: 'ecommerce',
  },
  {
    email: 'events-admin@orbitly.test',
    password: 'EventsPass2024!',
    full_name: 'Events Admin',
    role: 'tenant_admin',
    tenant_name: 'Events Corp',
    niche: 'events',
  },
  {
    email: 'events-user@orbitly.test',
    password: 'EventsUser2024!',
    full_name: 'Events User',
    role: 'user',
    tenant_name: 'Events Corp',
    niche: 'events',
  },
  {
    email: 'launchpad-admin@orbitly.test',
    password: 'LaunchPad2024!',
    full_name: 'LaunchPad Admin',
    role: 'tenant_admin',
    tenant_name: 'LaunchPad Inc',
    niche: 'launchpad',
  },
  {
    email: 'launchpad-user@orbitly.test',
    password: 'LaunchUser2024!',
    full_name: 'LaunchPad User',
    role: 'user',
    tenant_name: 'LaunchPad Inc',
    niche: 'launchpad',
  },
];

async function seedTestData() {
  console.log('🌱 Starting test data seeding...\n');

  const tenantMap = new Map();

  for (const userData of TEST_USERS) {
    console.log(`\n👤 Creating user: ${userData.email}`);

    let tenantId = null;

    if (userData.tenant_name) {
      if (!tenantMap.has(userData.tenant_name)) {
        console.log(`  📦 Creating tenant: ${userData.tenant_name}`);
        const { data: tenant, error: tenantError } = await supabaseAdmin
          .from('tenants')
          .insert({
            name: userData.tenant_name,
            slug: userData.tenant_name.toLowerCase().replace(/\s+/g, '-'),
            niche: userData.niche,
            settings: {},
          })
          .select()
          .single();

        if (tenantError) {
          console.error(`  ❌ Failed to create tenant:`, tenantError.message);
          continue;
        }

        tenantMap.set(userData.tenant_name, tenant.id);
        console.log(`  ✅ Tenant created: ${tenant.id}`);
      }
      tenantId = tenantMap.get(userData.tenant_name);
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`  ⚠️ User already exists, skipping...`);
        continue;
      }
      console.error(`  ❌ Failed to create auth user:`, authError.message);
      continue;
    }

    console.log(`  ✅ Auth user created: ${authUser.user.id}`);

    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: authUser.user.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        tenant_id: tenantId,
      });

    if (profileError) {
      console.error(`  ❌ Failed to create user profile:`, profileError.message);
      continue;
    }

    console.log(`  ✅ User profile created with role: ${userData.role}`);
  }

  console.log('\n🎉 Test data seeding complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test Credentials Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Super Admin: admin@orbitly.com / OrbitlyAdmin2024!');
  console.log('Static Admin: static-admin@orbitly.test / StaticPass2024!');
  console.log('Ecom Admin: ecom-admin@orbitly.test / EcomPass2024!');
  console.log('Events Admin: events-admin@orbitly.test / EventsPass2024!');
  console.log('LaunchPad Admin: launchpad-admin@orbitly.test / LaunchPad2024!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
}

seedTestData().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
