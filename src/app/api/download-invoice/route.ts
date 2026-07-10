import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const invoiceNumber = searchParams.get('invoice')

    if (!invoiceNumber) {
      return new Response('Invoice number is required', { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response('Configuration missing', { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Check if the file exists in the storage bucket 'invoices'
    const filePath = `${invoiceNumber}.pdf`
    
    // Construct the public URL
    const { data } = supabase.storage.from('invoices').getPublicUrl(filePath)

    if (!data || !data.publicUrl) {
      return new Response('Invoice PDF not found', { status: 404 })
    }

    // Redirect directly to the PDF file
    return NextResponse.redirect(data.publicUrl, 302)
  } catch (err: any) {
    console.error('[download-invoice] Redirect failed:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
