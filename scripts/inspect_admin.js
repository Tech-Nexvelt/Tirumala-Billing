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

async function inspect() {
  console.log('--- STORES ---');
  const { data: stores, error: storeErr } = await supabaseAdmin.from('stores').select('*');
  console.log(stores || storeErr);

  console.log('--- PROFILES ---');
  const { data: profiles, error: profileErr } = await supabaseAdmin.from('profiles').select('*');
  console.log(profiles || profileErr);

  console.log('--- AUTH USERS ---');
  const { data: authUsers, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
  if (authUsers) {
    console.log(authUsers.users.map(u => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      user_metadata: u.user_metadata,
      created_at: u.created_at
    })));
  } else {
    console.log(authErr);
  }
}

inspect();
