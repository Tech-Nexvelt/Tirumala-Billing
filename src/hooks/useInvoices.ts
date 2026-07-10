'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Invoice, InvoiceItem, Payment, BillItem, CustomerInfo, PaymentMethod, SplitPayment } from '@/types/database'
import { toast } from 'sonner'
import { formatDateForDB } from '@/lib/utils/date'

const INVOICES_KEY = ['invoices']

interface CreateInvoicePayload {
  store_id: string
  customer: CustomerInfo
  items: BillItem[]
  payment_method: PaymentMethod
  split_payments: SplitPayment[]
  delivery_charge: number
  installation_charge: number
  additional_discount: number
  amount_tendered: number
  notes: string
  summary: {
    subtotal: number
    item_discount: number
    additional_discount: number
    delivery_charge: number
    installation_charge: number
    round_off: number
    grand_total: number
  }
  created_by: string
}

export function useInvoices(filters?: {
  search?: string
  date_from?: string
  date_to?: string
  payment_method?: string
  status?: string
  page?: number
  per_page?: number
}) {
  const supabase = createClient()
  const page = filters?.page ?? 1
  const perPage = filters?.per_page ?? 25

  return useQuery({
    queryKey: [...INVOICES_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*, invoice_items(count)', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1)

      if (filters?.search) {
        query = query.or(
          `invoice_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`
        )
      }
      if (filters?.date_from) query = query.gte('invoice_date', filters.date_from)
      if (filters?.date_to) query = query.lte('invoice_date', filters.date_to)
      if (filters?.payment_method) query = query.eq('payment_method', filters.payment_method)
      if (filters?.status) query = query.eq('status', filters.status)

      const { data, error, count } = await query
      if (error) throw error
      return { invoices: data as Invoice[], total: count ?? 0 }
    },
    staleTime: 10_000,
  })
}

export function useInvoice(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: [...INVOICES_KEY, id],
    queryFn: async () => {
      const [invoiceRes, itemsRes, paymentsRes] = await Promise.all([
        supabase.from('invoices').select('*').eq('id', id).single(),
        supabase.from('invoice_items').select('*').eq('invoice_id', id).order('sort_order'),
        supabase.from('payments').select('*').eq('invoice_id', id),
      ])
      if (invoiceRes.error) throw invoiceRes.error
      return {
        invoice: invoiceRes.data as Invoice,
        items: itemsRes.data as InvoiceItem[],
        payments: paymentsRes.data as Payment[],
      }
    },
    enabled: !!id,
  })
}

export function useTodayStats() {
  const supabase = createClient()
  return useQuery({
    queryKey: [...INVOICES_KEY, 'today-stats'],
    queryFn: async () => {
      const today = formatDateForDB()
      const { data, error } = await supabase
        .from('invoices')
        .select('grand_total, payment_method, status')
        .eq('invoice_date', today)
        .is('deleted_at', null)
        .eq('status', 'active')

      if (error) throw error

      const bills = data ?? []
      return {
        bill_count: bills.length,
        total_revenue: bills.reduce((s, b) => s + b.grand_total, 0),
        cash: bills.filter(b => b.payment_method === 'cash').reduce((s, b) => s + b.grand_total, 0),
        upi: bills.filter(b => b.payment_method === 'upi').reduce((s, b) => s + b.grand_total, 0),
        card: bills.filter(b => b.payment_method === 'card').reduce((s, b) => s + b.grand_total, 0),
      }
    },
    refetchInterval: 30_000,
  })
}

export function useCreateInvoice() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateInvoicePayload): Promise<{ invoice: Invoice; items: InvoiceItem[] }> => {
      // 1. Create invoice header
      const { data: invoice, error: invoiceErr } = await supabase
        .from('invoices')
        .insert({
          store_id: payload.store_id,
          invoice_date: formatDateForDB(),
          customer_name: payload.customer.name || 'Guest',
          customer_phone: payload.customer.phone || null,
          customer_address: payload.customer.address || null,
          subtotal: payload.summary.subtotal,
          discount_amount: payload.summary.item_discount + payload.summary.additional_discount,
          delivery_charge: payload.delivery_charge,
          installation_charge: payload.installation_charge,
          round_off: payload.summary.round_off,
          grand_total: payload.summary.grand_total,
          payment_method: payload.payment_method,
          payment_status: 'paid',
          amount_tendered: payload.amount_tendered || null,
          change_amount: payload.amount_tendered ? Math.max(0, payload.amount_tendered - payload.summary.grand_total) : null,
          notes: payload.notes || null,
          status: 'active',
          created_by: payload.created_by,
        })
        .select()
        .single()

      if (invoiceErr) throw invoiceErr

      // 2. Create line items
      const itemInserts = payload.items.map((item, idx) => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        product_barcode: item.product_barcode,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        discount_amount: item.discount_amount,
        line_total: item.line_total,
        sort_order: idx,
      }))

      const { data: items, error: itemsErr } = await supabase
        .from('invoice_items')
        .insert(itemInserts)
        .select()

      if (itemsErr) throw itemsErr

      // 3. For split payment, insert payment records
      if (payload.payment_method === 'split' && payload.split_payments.length > 0) {
        await supabase.from('payments').insert(
          payload.split_payments.map(p => ({
            invoice_id: invoice.id,
            method: p.method,
            amount: p.amount,
            reference: p.reference || null,
          }))
        )
      } else {
        await supabase.from('payments').insert({
          invoice_id: invoice.id,
          method: payload.payment_method === 'split' ? 'cash' : payload.payment_method,
          amount: payload.summary.grand_total,
          reference: null,
        })
      }

      return { invoice: invoice as Invoice, items: items as InvoiceItem[] }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY })
    },
    onError: (err) => {
      console.error('[Create invoice error]', err)
      toast.error('Failed to save invoice. Please try again.')
    },
  })
}

export function useCancelInvoice() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'cancelled',
          cancelled_reason: reason,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY })
      toast.success('Invoice cancelled')
    },
    onError: () => toast.error('Failed to cancel invoice'),
  })
}
