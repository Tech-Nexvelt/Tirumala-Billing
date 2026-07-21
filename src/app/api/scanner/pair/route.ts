import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Server-side Supabase client with service_role — bypasses RLS for pairing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

async function hashToken(token: string): Promise<string> {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function detectCapabilities(ua: string) {
  const platform = ua.includes('Android') ? 'Android' : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : 'Mobile'
  const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : ua.includes('Firefox') ? 'Firefox' : 'Mobile Browser'
  const os = ua.includes('Android') ? 'Android' : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : 'Mobile OS'
  return { platform, browser, os, hasTorch: true, hasCameraSwitch: true, hasNativeDetector: false, hasVibration: true, cameraCount: 2, hardwareConcurrency: 4, deviceMemoryGbs: 4, screenWidth: 390, screenHeight: 844, isPWA: false, facingMode: 'environment' }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pairingCode, deviceName = 'Mobile Scanner' } = body

    if (!pairingCode || typeof pairingCode !== 'string') {
      return NextResponse.json({ error: 'Missing pairing code' }, { status: 400 })
    }

    const cleanCode = pairingCode.trim()

    console.log(`[API /scanner/pair] Pairing attempt with code: "${cleanCode}"`)

    // 1. Fetch pairing session (service_role bypasses RLS)
    const { data: session, error: sessErr } = await supabaseAdmin
      .from('scanner_pairing_sessions')
      .select('*')
      .eq('pairing_code', cleanCode)
      .single()

    if (sessErr || !session) {
      console.warn(`[API /scanner/pair] Session not found for code: "${cleanCode}"`, sessErr)
      return NextResponse.json({ error: 'Invalid or expired pairing QR code' }, { status: 404 })
    }

    if (session.is_used) {
      return NextResponse.json({ error: 'This pairing QR code has already been used. Generate a new QR on Desktop.' }, { status: 409 })
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Pairing QR code expired. Please generate a new QR on Desktop.' }, { status: 410 })
    }

    if (session.attempts >= 5) {
      return NextResponse.json({ error: 'Too many pairing attempts. Generate a new QR on Desktop.' }, { status: 429 })
    }

    // 2. Generate secure token (server-side)
    const rawToken = generateSecureToken()
    const tokenHash = await hashToken(rawToken)

    const ua = request.headers.get('user-agent') || ''
    const capabilities = detectCapabilities(ua)

    // 3. Register device in scanner_devices
    const { data: device, error: devErr } = await supabaseAdmin
      .from('scanner_devices')
      .insert({
        store_id: session.store_id,
        counter_id: session.counter_id,
        device_name: deviceName,
        pairing_token_hash: tokenHash,
        platform: capabilities.platform,
        browser: capabilities.browser,
        os: capabilities.os,
        app_version: '2.2.0',
        status: 'active',
        capabilities,
        last_seen_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (devErr || !device) {
      console.error('[API /scanner/pair] Failed to register device:', devErr)
      return NextResponse.json({ error: 'Failed to register scanner device' }, { status: 500 })
    }

    // 4. Log immutable pairing history
    await supabaseAdmin.from('scanner_pairing_history').insert({
      store_id: session.store_id,
      device_id: device.id,
      counter_id: session.counter_id,
      paired_by: session.created_by,
      paired_at: new Date().toISOString(),
    })

    // 5. Mark session as used (single-use security)
    await supabaseAdmin
      .from('scanner_pairing_sessions')
      .update({ is_used: true })
      .eq('id', session.id)

    console.log(`[API /scanner/pair] Device paired successfully: ${device.id} for store: ${session.store_id}`)

    return NextResponse.json({
      success: true,
      token: rawToken,
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
    console.error('[API /scanner/pair] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error during pairing' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Scanner pairing endpoint ready', version: '2.2.0' })
}
