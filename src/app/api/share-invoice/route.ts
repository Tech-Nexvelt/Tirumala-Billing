import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import React from 'react'

export async function POST(req: Request) {
  try {
    const { invoiceId } = await req.json()
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    // 1. Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase credentials missing on server' }, { status: 500 })
    }

    // Initialize server admin client
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    })

    // 2. Fetch invoice, items and store details
    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (invErr || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const [itemsRes, storeRes] = await Promise.all([
      supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId).order('sort_order'),
      supabase.from('stores').select('*').eq('id', invoice.store_id).single()
    ])

    const items = itemsRes.data || []
    const store = storeRes.data || null

    // 3. Render PDF document
    const { pdf } = await import('@react-pdf/renderer')
    const { InvoicePDF } = await import('@/components/billing/InvoicePDF')

    const doc = React.createElement(InvoicePDF, { invoice, items, store })
    const blob = await pdf(doc).toBlob()
    const buffer = Buffer.from(await blob.arrayBuffer())

    // 4. Ensure storage bucket exists
    try {
      await supabase.storage.createBucket('invoices', {
        public: true,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 10485760 // 10MB
      })
    } catch (e) {
      // Ignore if bucket exists
    }

    // 5. Upload PDF file using admin client
    const filePath = `${invoice.invoice_number}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(filePath, buffer, {
        upsert: true,
        contentType: 'application/pdf'
      })

    if (uploadError) {
      console.error('[share-invoice-api] Upload failed:', uploadError)
      return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 })
    }

    // 6. Get Public URL
    const { data } = supabase.storage.from('invoices').getPublicUrl(filePath)
    
    return NextResponse.json({ publicUrl: data.publicUrl })
  } catch (err: any) {
    console.error('[share-invoice-api] Error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
