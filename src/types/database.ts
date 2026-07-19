// ============================================================
// Thirumala Furniture — Database Types
// Generated TypeScript types matching the PostgreSQL schema
// ============================================================

export type Role = 'admin' | 'cashier'
export type ProductStatus = 'active' | 'inactive'
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank' | 'split'
export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'cancelled'
export type InvoiceStatus = 'active' | 'cancelled' | 'duplicate'
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE' | 'RESTORE'
export type ReceiptWidth = '58mm' | '80mm' | 'A4'
export type LabelTemplate = 'small' | 'medium' | 'large'
export type BarcodeFormat = 'CODE128' | 'EAN13' | 'EAN8' | 'UPC'

export interface Store {
  id: string
  name: string
  legal_name: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo_url: string | null
  invoice_prefix: string
  invoice_footer: string | null
  currency_symbol: string
  receipt_width: ReceiptWidth
  auto_print: boolean
  barcode_format: BarcodeFormat
  label_template: LabelTemplate
  fiscal_year_start: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  store_id: string | null
  full_name: string
  role: Role
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  store_id: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  store_id: string
  category_id: string | null
  name: string
  description: string | null
  sku: string
  barcode: string
  purchase_price: number
  selling_price: number
  stock_qty: number
  status: ProductStatus
  image_url: string | null
  deleted_at: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  // Optional Label & Spec Extensions
  mrp?: number | null
  brand?: string | null
  color?: string | null
  material?: string | null
  dimensions?: string | null
  warranty?: string | null
  mfg_date?: string | null
  // Joined
  category_name?: string
}

export interface Invoice {
  id: string
  store_id: string
  invoice_number: string
  invoice_date: string
  customer_name: string
  customer_phone: string | null
  customer_address: string | null
  subtotal: number
  discount_amount: number
  delivery_charge: number
  installation_charge: number
  round_off: number
  grand_total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  amount_tendered: number | null
  change_amount: number | null
  notes: string | null
  status: InvoiceStatus
  cancelled_reason: string | null
  original_invoice_id: string | null
  created_by: string | null
  deleted_at: string | null
  deleted_by: string | null
  created_at: string
  updated_at: string
  // Joined
  item_count?: number
  created_by_name?: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string | null
  product_name: string
  product_sku: string
  product_barcode: string | null
  quantity: number
  unit_price: number
  discount_percent: number
  discount_amount: number
  line_total: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  invoice_id: string
  method: Exclude<PaymentMethod, 'split'>
  amount: number
  reference: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  store_id: string | null
  table_name: string
  record_id: string
  action: AuditAction
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  user_id: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface StoreSetting {
  id: string
  store_id: string
  key: string
  value: unknown
  created_at: string
  updated_at: string
}

// ============================================================
// Application-level types (not direct DB rows)
// ============================================================

export interface BillItem {
  id: string                // local UUID for react key
  product_id: string | null
  product_name: string
  product_sku: string
  product_barcode: string | null
  quantity: number
  unit_price: number
  discount_percent: number
  discount_amount: number
  line_total: number
  sort_order: number
  isNew?: boolean           // for animation
}

export interface BillSummary {
  subtotal: number
  item_discount: number
  additional_discount: number
  delivery_charge: number
  installation_charge: number
  round_off: number
  grand_total: number
}

export interface CustomerInfo {
  name: string
  phone: string
  address: string
}

export interface SplitPayment {
  method: Exclude<PaymentMethod, 'split'>
  amount: number
  reference: string
}

export interface BillingState {
  items: BillItem[]
  customer: CustomerInfo
  payment_method: PaymentMethod
  split_payments: SplitPayment[]
  amount_tendered: number
  delivery_charge: number
  installation_charge: number
  additional_discount: number
  notes: string
  summary: BillSummary
}

export interface DailyRevenue {
  invoice_date: string
  bill_count: number
  total_revenue: number
  total_discount: number
  avg_bill_value: number
}

export interface PaymentSummary {
  payment_method: PaymentMethod
  bill_count: number
  total_amount: number
}

// Supabase Database type (for createClient generics)
// Using any for Insert/Update to avoid strict type conflicts
export interface Database {
  public: {
    Tables: {
      stores: {
        Row: Store
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Insert: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: any
      }
      profiles: {
        Row: Profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Insert: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: any
      }
      categories: {
        Row: Category
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Insert: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: any
      }
      products: {
        Row: Product
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Insert: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: any
      }
      invoices: {
        Row: Invoice
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Insert: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: any
      }
      invoice_items: {
        Row: InvoiceItem
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Insert: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: any
      }
      payments: {
        Row: Payment
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Insert: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: any
      }
      audit_log: {
        Row: AuditLog
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Insert: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: any
      }
      store_settings: {
        Row: StoreSetting
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Insert: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: any
      }
      invoice_sequences: {
        Row: { store_id: string; last_number: number; updated_at: string }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Insert: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: any
      }
    }
    Views: {
      v_daily_revenue:    { Row: DailyRevenue }
      v_payment_summary:  { Row: PaymentSummary }
      v_invoice_list:     { Row: Invoice }
      v_products:         { Row: Product }
    }
    Functions: {
      generate_invoice_number:    { Args: { p_store_id: string }; Returns: string }
      recalculate_invoice_totals: { Args: { p_invoice_id: string }; Returns: void }
      seed_store_defaults:        { Args: { p_store_id: string }; Returns: void }
      get_my_store_id:            { Args: Record<never, never>; Returns: string }
      get_my_role:                { Args: Record<never, never>; Returns: string }
      is_admin:                   { Args: Record<never, never>; Returns: boolean }
    }
  }
}

