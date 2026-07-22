import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      full_name,
      store_name,
      phone,
      city,
      state,
      address,
      accepted_terms,
      accepted_privacy,
      terms_version = 'v2.4.0',
      privacy_version = 'v2.4.0',
    } = body

    if (!email || !password || !full_name || !store_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!accepted_terms || !accepted_privacy) {
      return NextResponse.json({ error: 'You must agree to the Terms & Conditions and Privacy Policy to register.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes('placeholder')) {
      return NextResponse.json({ error: 'Database service role key is not configured on the server.' }, { status: 500 })
    }

    // Initialize admin client to bypass client RLS policies during store setup
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const user_agent = request.headers.get('user-agent') || 'Unknown'
    const accepted_at = new Date().toISOString()

    console.log('API Register: Signing up auth user with legal consent...', email)
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email so they can log in immediately
      user_metadata: {
        full_name,
        role: 'admin',
        accepted_terms: true,
        accepted_privacy: true,
        terms_version,
        privacy_version,
        accepted_at,
        ip_address,
        user_agent,
      },
    })

    if (authErr) {
      console.error('API Register: Auth error:', authErr)
      return NextResponse.json({ error: authErr.message }, { status: 400 })
    }

    const userId = authData.user.id

    console.log('API Register: Creating store...', store_name)
    const { data: storeData, error: storeErr } = await supabaseAdmin
      .from('stores')
      .insert({
        name: store_name,
        address: address || null,
        phone: phone || null,
        city: city || null,
        state: state || null,
      })
      .select()
      .single()

    if (storeErr) {
      console.error('API Register: Store insert error:', storeErr)
      // Attempt clean up of auth user to prevent orphaned users
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: storeErr.message }, { status: 500 })
    }

    console.log('API Register: Linking profile to store...', userId, storeData.id)
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update({
        store_id: storeData.id,
        full_name,
        role: 'admin',
      })
      .eq('id', userId)

    if (profileErr) {
      console.error('API Register: Profile link error:', profileErr)
      // Attempt clean up
      await supabaseAdmin.from('stores').delete().eq('id', storeData.id)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }

    // Insert legal consent audit log for legal compliance & auditing
    try {
      await supabaseAdmin.from('audit_log').insert({
        store_id: storeData.id,
        table_name: 'legal_consent',
        record_id: userId,
        action: 'INSERT',
        new_data: {
          user_id: userId,
          accepted_terms: true,
          accepted_privacy: true,
          terms_version,
          privacy_version,
          accepted_at,
          ip_address,
          user_agent,
        },
        user_id: userId,
        ip_address,
        user_agent,
      })
    } catch (auditErr) {
      console.warn('API Register: Non-blocking audit log warning:', auditErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Store and admin account successfully created!',
    })
  } catch (err: unknown) {
    console.error('API Register: Server error:', err)
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
