// ============================================================
// Tirumala Furniture — Enterprise Scanner State Machine Types
// ============================================================

export type ScannerState =
  | 'INITIALIZING'
  | 'AUTHENTICATING'
  | 'CONNECTING'
  | 'READY'
  | 'SCANNING'
  | 'PROCESSING'
  | 'WAITING_FOR_ACK'
  | 'SUCCESS'
  | 'ERROR'
  | 'OFFLINE'
  | 'RECONNECTING'
  | 'DISPOSED'

export interface ScanMessagePayload {
  seqId: string
  sku: string
  barcode?: string
  timestamp: number
  storeId?: string
}

export interface AckMessagePayload {
  seqId: string
  status: 'success' | 'not_found' | 'error'
  productName?: string
  sku?: string
  errorMessage?: string
}

export interface ScannerMetrics {
  totalScans: number
  successfulScans: number
  failedScans: number
  avgLatencyMs: number
  lastScanTimeMs: number
}
