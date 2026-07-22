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

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function checkRefs() {
  const adminId = 'f986c9bd-f693-441b-99b0-9292d4b4745c';
  console.log('--- Checking tables for user ID:', adminId, '---');

  const tables = ['bills', 'products', 'audit_log', 'categories'];
  for (const t of tables) {
    const { data, count, error } = await supabaseAdmin.from(t).select('*', { count: 'exact' });
    console.log(`Table '${t}': Total records = ${count}`);
  }
}

checkRefs();
