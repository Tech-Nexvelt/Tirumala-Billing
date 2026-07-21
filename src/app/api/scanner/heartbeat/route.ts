import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function hashToken(token: string): Promise<string> {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, token, storeId, batteryLevel } = body

    if (!deviceId || !token) {
      return NextResponse.json({ error: 'Missing deviceId or token' }, { status: 400 })
    }

    const tokenHash = await hashToken(token)

    // Update device last_seen_at (service_role bypasses RLS)
    const { error: devErr } = await supabaseAdmin
      .from('scanner_devices')
      .update({ last_seen_at: new Date().toISOString(), battery_level: batteryLevel ?? null })
      .eq('id', deviceId)
      .eq('pairing_token_hash', tokenHash)
      .eq('status', 'active')

    if (devErr) {
      return NextResponse.json({ error: 'Device not found or revoked' }, { status: 404 })
    }

    // Update presence
    if (storeId) {
      await supabaseAdmin.from('scanner_presence').upsert({
        device_id: deviceId,
        store_id: storeId,
        status: 'ONLINE',
        latency_ms: 0,
        health_score: 100,
        last_heartbeat_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() })
  } catch (err: any) {
    console.error('[API /scanner/heartbeat] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
