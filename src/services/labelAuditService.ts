// ============================================================
// Tirumala Furniture — Label Printing Audit Log Service
// ============================================================

import type { PrintAuditLogItem, LabelSize, TemplateId } from '@/types/label'

const AUDIT_STORAGE_KEY = 'tirumala_label_audit_logs_v1'

export function getLabelAuditHistory(): PrintAuditLogItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function logLabelPrintJob(job: {
  productId: string
  productName: string
  sku: string
  printedBy?: string
  templateId: TemplateId
  size: LabelSize
  copiesCount: number
}): PrintAuditLogItem {
  const newItem: PrintAuditLogItem = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    productId: job.productId,
    productName: job.productName,
    sku: job.sku,
    printedBy: job.printedBy || 'Admin / Cashier',
    printedAt: new Date().toISOString(),
    templateId: job.templateId,
    size: job.size,
    copiesCount: job.copiesCount,
  }

  try {
    const existing = getLabelAuditHistory()
    const updated = [newItem, ...existing].slice(0, 100) // Keep last 100 print jobs
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Failed to log label print audit:', err)
  }

  return newItem
}

export function clearLabelAuditHistory(): void {
  try {
    localStorage.removeItem(AUDIT_STORAGE_KEY)
  } catch {
    // ignore
  }
}
