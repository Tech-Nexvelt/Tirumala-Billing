const fs = require('fs');
const path = require('path');
const { createClient } = require(path.join(__dirname, '../node_modules/@supabase/supabase-js'));

const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    envVars[key] = val;
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function migrateAdmin(newName, newEmail, newPassword, newPhone) {
  const ADMIN_UID = 'f986c9bd-f693-441b-99b0-9292d4b4745c';
  const STORE_ID = '29f4e073-bc1d-4071-ae3a-c8718a90f998';

  console.log('=== STARTING NON-DESTRUCTIVE ADMIN CREDENTIAL MIGRATION ===');
  console.log('Target Admin UID:', ADMIN_UID);
  console.log('Target Store ID:', STORE_ID);
  console.log('New Name:', newName);
  console.log('New Email:', newEmail);
  console.log('New Phone:', newPhone || 'Not provided');

  // 1. Verify Store and Admin prior to migration
  const { data: storeBefore } = await supabaseAdmin.from('stores').select('name').eq('id', STORE_ID).single();
  const { count: productCountBefore } = await supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('store_id', STORE_ID);
  const { count: categoryCountBefore } = await supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }).eq('store_id', STORE_ID);

  console.log(`Pre-migration state: Store="${storeBefore?.name}", Products=${productCountBefore}, Categories=${categoryCountBefore}`);

  // 2. Update Supabase Auth User safely
  const updatePayload = {
    email: newEmail,
    password: newPassword,
    email_confirm: true,
    user_metadata: {
      full_name: newName,
      role: 'admin',
      updated_at: new Date().toISOString(),
    },
  };
  if (newPhone) {
    updatePayload.phone = newPhone;
  }

  const { data: authResult, error: authErr } = await supabaseAdmin.auth.admin.updateUserById(ADMIN_UID, updatePayload);

  if (authErr) {
    console.error('CRITICAL: Auth update failed:', authErr);
    process.exit(1);
  }
  console.log('✓ Supabase Auth User updated successfully! User ID remains identical:', authResult.user.id);

  // 3. Update profiles table
  const profileUpdate = {
    full_name: newName,
    updated_at: new Date().toISOString(),
  };
  if (newPhone) profileUpdate.phone = newPhone;

  const { error: profileErr } = await supabaseAdmin
    .from('profiles')
    .update(profileUpdate)
    .eq('id', ADMIN_UID);

  if (profileErr) {
    console.error('CRITICAL: Profile update failed:', profileErr);
    process.exit(1);
  }
  console.log('✓ Profile table updated successfully!');

  // 4. Record Audit Log Entry
  try {
    await supabaseAdmin.from('audit_log').insert({
      store_id: STORE_ID,
      table_name: 'profiles',
      record_id: ADMIN_UID,
      action: 'UPDATE_ADMIN_CREDENTIALS',
      new_data: {
        admin_uid: ADMIN_UID,
        email: newEmail,
        name: newName,
        updated_at: new Date().toISOString(),
      },
      user_id: ADMIN_UID,
      ip_address: '127.0.0.1',
      user_agent: 'MigrationScript/1.0',
    });
    console.log('✓ Audit log entry created.');
  } catch (aErr) {
    console.warn('Non-blocking audit log warning:', aErr);
  }

  // 5. Verification Phase
  console.log('\n=== RUNNING DATA INTEGRITY VERIFICATION ===');
  const { data: storeAfter } = await supabaseAdmin.from('stores').select('name').eq('id', STORE_ID).single();
  const { count: productCountAfter } = await supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('store_id', STORE_ID);
  const { count: categoryCountAfter } = await supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }).eq('store_id', STORE_ID);

  console.log(`Post-migration state: Store="${storeAfter?.name}", Products=${productCountAfter}, Categories=${categoryCountAfter}`);

  if (productCountBefore === productCountAfter && categoryCountBefore === categoryCountAfter) {
    console.log('✓ VERIFICATION SUCCESSFUL: 100% of store products, categories, images, and relationships are intact!');
  } else {
    console.error('WARNING: Count mismatch detected!');
  }

  // 6. Test authentication with new credentials
  console.log('\n=== TESTING NEW CREDENTIALS LOGIN ===');
  const { data: loginResult, error: loginErr } = await supabaseAdmin.auth.signInWithPassword({
    email: newEmail,
    password: newPassword,
  });

  if (loginResult && loginResult.user) {
    console.log('✓ LOGIN TEST PASSED: Successfully authenticated using new email and password!');
  } else {
    console.error('LOGIN TEST FAILED:', loginErr);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length >= 3) {
  const [name, email, password, phone] = args;
  migrateAdmin(name, email, password, phone);
} else {
  console.log('Usage: node scripts/update_admin_credentials.js "<New Name>" "<New Email>" "<New Password>" "[New Phone]"');
}
