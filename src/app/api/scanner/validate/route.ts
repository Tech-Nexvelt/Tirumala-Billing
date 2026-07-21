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
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const tokenHash = await hashToken(token)

    const { data: devices, error } = await supabaseAdmin
      .from('scanner_devices')
      .select('*')
      .eq('pairing_token_hash', tokenHash)
      .eq('status', 'active')
      .limit(1)

    if (error || !devices || devices.length === 0) {
      return NextResponse.json({ valid: false, reason: 'Device not found or revoked' }, { status: 404 })
    }

    const device = devices[0]

    // Update last seen
    await supabaseAdmin
      .from('scanner_devices')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', device.id)

    return NextResponse.json({
      valid: true,
      device: {
        id: device.id,
        store_id: device.store_id,
        counter_id: device.counter_id,
        device_name: device.device_name,
        status: device.status,
        app_version: device.app_version,
        last_seen_at: device.last_seen_at,
        created_at: device.created_at,
      },
    })
  } catch (err: any) {
    console.error('[API /scanner/validate] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
