'use client'
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { generateId } from '@/lib/utils'
import { roundOff } from '@/lib/utils/currency'
import type { BillItem, BillSummary, CustomerInfo, PaymentMethod, SplitPayment } from '@/types/database'

// ============================================================
// Billing Store — Zustand (persisted for draft recovery)
// ============================================================

interface BillingStore {
  // State
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
  isDirty: boolean
  lastSavedAt: number | null

  // Actions — Items
  addItem: (item: Omit<BillItem, 'id' | 'sort_order' | 'discount_amount' | 'line_total' | 'isNew'>) => void
  incrementItem: (productId: string) => void
  updateItemQty: (id: string, qty: number) => void
  updateItemDiscount: (id: string, discountPercent: number) => void
  removeItem: (id: string) => void
  clearItems: () => void

  // Actions — Customer
  setCustomer: (customer: Partial<CustomerInfo>) => void

  // Actions — Payment
  setPaymentMethod: (method: PaymentMethod) => void
  setSplitPayment: (index: number, payment: SplitPayment) => void
  addSplitPayment: () => void
  removeSplitPayment: (index: number) => void
  setAmountTendered: (amount: number) => void

  // Actions — Charges
  setDeliveryCharge: (amount: number) => void
  setInstallationCharge: (amount: number) => void
  setAdditionalDiscount: (percent: number) => void
  setNotes: (notes: string) => void

  // Actions — Bill lifecycle
  clearBill: () => void
  recalculate: () => void
  markSaved: () => void

  // Computed
  getChange: () => number
  getItemByProductId: (productId: string) => BillItem | undefined
}

const EMPTY_CUSTOMER: CustomerInfo = { name: 'Guest', phone: '', address: '' }
const EMPTY_SUMMARY: BillSummary = {
  subtotal: 0,
  item_discount: 0,
  additional_discount: 0,
  delivery_charge: 0,
  installation_charge: 0,
  round_off: 0,
  grand_total: 0,
}

function computeSummary(
  items: BillItem[],
  additionalDiscountPct: number,
  deliveryCharge: number,
  installationCharge: number
): BillSummary {
  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const item_discount = items.reduce((s, i) => s + i.discount_amount, 0)
  const afterItemDiscount = subtotal - item_discount
  const additional_discount = parseFloat(((afterItemDiscount * additionalDiscountPct) / 100).toFixed(2))
  const raw = afterItemDiscount - additional_discount + deliveryCharge + installationCharge
  const { rounded, roundOff: round_off } = roundOff(raw)

  return {
    subtotal,
    item_discount,
    additional_discount,
    delivery_charge: deliveryCharge,
    installation_charge: installationCharge,
    round_off,
    grand_total: rounded,
  }
}

function computeItem(item: Omit<BillItem, 'id' | 'sort_order' | 'discount_amount' | 'line_total' | 'isNew'>): BillItem & { sort_order: number } {
  const discount_amount = parseFloat(((item.unit_price * item.quantity * item.discount_percent) / 100).toFixed(2))
  const line_total = parseFloat((item.unit_price * item.quantity - discount_amount).toFixed(2))
  return { ...item, id: generateId(), sort_order: 0, discount_amount, line_total, isNew: true }
}

export const useBillingStore = create<BillingStore>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        items: [],
        customer: EMPTY_CUSTOMER,
        payment_method: 'cash',
        split_payments: [],
        amount_tendered: 0,
        delivery_charge: 0,
        installation_charge: 0,
        additional_discount: 0,
        notes: '',
        summary: EMPTY_SUMMARY,
        isDirty: false,
        lastSavedAt: null,

        addItem: (rawItem) => {
          set(state => {
            // Check if product already exists
            const existing = state.items.find(i => i.product_id === rawItem.product_id)
            if (existing) {
              existing.quantity += 1
              const discount_amount = parseFloat(((existing.unit_price * existing.quantity * existing.discount_percent) / 100).toFixed(2))
              existing.discount_amount = discount_amount
              existing.line_total = parseFloat((existing.unit_price * existing.quantity - discount_amount).toFixed(2))
              existing.isNew = true
            } else {
              const newItem = computeItem(rawItem)
              newItem.sort_order = state.items.length
              state.items.push(newItem)
            }
            state.isDirty = true
            const s = get()
            state.summary = computeSummary(state.items, s.additional_discount, s.delivery_charge, s.installation_charge)
          })
        },

        incrementItem: (productId) => {
          set(state => {
            const item = state.items.find(i => i.product_id === productId)
            if (!item) return
            item.quantity += 1
            item.discount_amount = parseFloat(((item.unit_price * item.quantity * item.discount_percent) / 100).toFixed(2))
            item.line_total = parseFloat((item.unit_price * item.quantity - item.discount_amount).toFixed(2))
            item.isNew = true
            state.isDirty = true
            const s = get()
            state.summary = computeSummary(state.items, s.additional_discount, s.delivery_charge, s.installation_charge)
          })
        },

        updateItemQty: (id, qty) => {
          set(state => {
            const item = state.items.find(i => i.id === id)
            if (!item || qty < 1) return
            item.quantity = qty
            item.discount_amount = parseFloat(((item.unit_price * qty * item.discount_percent) / 100).toFixed(2))
            item.line_total = parseFloat((item.unit_price * qty - item.discount_amount).toFixed(2))
            state.isDirty = true
            const s = get()
            state.summary = computeSummary(state.items, s.additional_discount, s.delivery_charge, s.installation_charge)
          })
        },

        updateItemDiscount: (id, discountPercent) => {
          set(state => {
            const item = state.items.find(i => i.id === id)
            if (!item) return
            item.discount_percent = discountPercent
            item.discount_amount = parseFloat(((item.unit_price * item.quantity * discountPercent) / 100).toFixed(2))
            item.line_total = parseFloat((item.unit_price * item.quantity - item.discount_amount).toFixed(2))
            state.isDirty = true
            const s = get()
            state.summary = computeSummary(state.items, s.additional_discount, s.delivery_charge, s.installation_charge)
          })
        },

        removeItem: (id) => {
          set(state => {
            state.items = state.items.filter(i => i.id !== id)
            state.isDirty = true
            const s = get()
            state.summary = computeSummary(state.items, s.additional_discount, s.delivery_charge, s.installation_charge)
          })
        },

        clearItems: () => {
          set(state => {
            state.items = []
            state.summary = EMPTY_SUMMARY
            state.isDirty = false
          })
        },

        setCustomer: (customer) => {
          set(state => {
            state.customer = { ...state.customer, ...customer }
            state.isDirty = true
          })
        },

        setPaymentMethod: (method) => {
          set(state => {
            state.payment_method = method
            if (method !== 'split') state.split_payments = []
          })
        },

        setSplitPayment: (index, payment) => {
          set(state => {
            state.split_payments[index] = payment
          })
        },

        addSplitPayment: () => {
          set(state => {
            state.split_payments.push({ method: 'cash', amount: 0, reference: '' })
          })
        },

        removeSplitPayment: (index) => {
          set(state => {
            state.split_payments.splice(index, 1)
          })
        },

        setAmountTendered: (amount) => {
          set(state => { state.amount_tendered = amount })
        },

        setDeliveryCharge: (amount) => {
          set(state => {
            state.delivery_charge = amount
            state.isDirty = true
            state.summary = computeSummary(state.items, state.additional_discount, amount, state.installation_charge)
          })
        },

        setInstallationCharge: (amount) => {
          set(state => {
            state.installation_charge = amount
            state.isDirty = true
            state.summary = computeSummary(state.items, state.additional_discount, state.delivery_charge, amount)
          })
        },

        setAdditionalDiscount: (percent) => {
          set(state => {
            state.additional_discount = percent
            state.isDirty = true
            state.summary = computeSummary(state.items, percent, state.delivery_charge, state.installation_charge)
          })
        },

        setNotes: (notes) => {
          set(state => { state.notes = notes })
        },

        clearBill: () => {
          set(state => {
            state.items = []
            state.customer = EMPTY_CUSTOMER
            state.payment_method = 'cash'
            state.split_payments = []
            state.amount_tendered = 0
            state.delivery_charge = 0
            state.installation_charge = 0
            state.additional_discount = 0
            state.notes = ''
            state.summary = EMPTY_SUMMARY
            state.isDirty = false
            state.lastSavedAt = null
          })
        },

        recalculate: () => {
          set(state => {
            state.summary = computeSummary(
              state.items,
              state.additional_discount,
              state.delivery_charge,
              state.installation_charge
            )
          })
        },

        markSaved: () => {
          set(state => {
            state.isDirty = false
            state.lastSavedAt = Date.now()
          })
        },

        getChange: () => {
          const { amount_tendered, summary } = get()
          return Math.max(0, amount_tendered - summary.grand_total)
        },

        getItemByProductId: (productId) => {
          return get().items.find(i => i.product_id === productId)
        },
      })),
      {
        name: 'tf-billing-draft',
        partialize: (state) => ({
          items: state.items,
          customer: state.customer,
          payment_method: state.payment_method,
          delivery_charge: state.delivery_charge,
          installation_charge: state.installation_charge,
          additional_discount: state.additional_discount,
          notes: state.notes,
          summary: state.summary,
          isDirty: state.isDirty,
          lastSavedAt: state.lastSavedAt,
        }),
      }
    )
  )
)
