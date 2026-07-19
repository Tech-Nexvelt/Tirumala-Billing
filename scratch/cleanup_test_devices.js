const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Read .env.local
const envPath = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const getEnvVal = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'))
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null
}

const supabaseUrl = getEnvVal('NEXT_PUBLIC_SUPABASE_URL')
const serviceRoleKey = getEnvVal('SUPABASE_SERVICE_ROLE_KEY') || getEnvVal('NEXT_PUBLIC_SUPABASE_ANON_KEY')

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
})

async function cleanupDummyScanners() {
  console.log('----------------------------------------------------')
  console.log('🧹 CLEANING UP DUMMY SCANNER DEVICES & TEST SESSIONS...')
  console.log('----------------------------------------------------')

  // Delete all test scanner devices
  const { data: devDeleted, error: devErr } = await supabase
    .from('scanner_devices')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select('id, device_name')

  if (devErr) {
    console.error('❌ Error deleting scanner devices:', devErr.message)
  } else {
    console.log(`✓ Deleted ${devDeleted ? devDeleted.length : 0} scanner device(s)`)
  }

  // Delete all test pairing sessions
  const { data: sessDeleted, error: sessErr } = await supabase
    .from('scanner_pairing_sessions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select('id')

  if (sessErr) {
    console.error('❌ Error deleting pairing sessions:', sessErr.message)
  } else {
    console.log(`✓ Deleted ${sessDeleted ? sessDeleted.length : 0} pairing session(s)`)
  }

  console.log('----------------------------------------------------')
  console.log('✨ CLEANUP COMPLETE! SCANNER FLEET RESET TO CLEAN SLATE.')
  console.log('----------------------------------------------------')
  process.exit(0)
}

cleanupDummyScanners()
