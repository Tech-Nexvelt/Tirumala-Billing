import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    
    // Extract invoice number from format like "bill-invoice-TF-1099.pdf"
    const match = filename.match(/bill-invoice-(TF-\d+)\.pdf/i)
    if (!match) {
      return new Response('Invalid filename format', { status: 400 })
    }
    const invoiceNumber = match[1]

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response('Configuration missing', { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const filePath = `${invoiceNumber}.pdf`

    // Download file buffer from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('invoices')
      .download(filePath)

    if (downloadError || !fileData) {
      console.error('[download-route] Storage download failed:', downloadError)
      return new Response('Invoice PDF file not found', { status: 404 })
    }

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Return PDF with headers forcing download/attachment
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })
  } catch (err: any) {
    console.error('[download-route] Error processing download:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
