import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types/database'

interface ProductCacheState {
  products: Product[]
  isLoading: boolean
  fetchProducts: (storeId: string) => Promise<void>
  syncProduct: (product: Product) => void
}

export const useProductCacheStore = create<ProductCacheState>((set, get) => ({
  products: [],
  isLoading: false,
  fetchProducts: async (storeId) => {
    set({ isLoading: true })
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('status', 'active')
        .is('deleted_at', null)
      
      if (error) throw error
      set({ products: data || [], isLoading: false })
      console.log(`[ProductCache] Loaded ${data?.length || 0} products into memory cache`)
    } catch (err) {
      console.error('[ProductCache] Load failed:', err)
      set({ isLoading: false })
    }
  },
  syncProduct: (product) => {
    set((state) => {
      const idx = state.products.findIndex(p => p.id === product.id)
      const nextProducts = [...state.products]

      if (product.deleted_at || product.status !== 'active') {
        // Remove if deleted or inactive
        return { products: state.products.filter(p => p.id !== product.id) }
      }

      if (idx > -1) {
        // Update existing cache entry
        nextProducts[idx] = product
        return { products: nextProducts }
      }

      // Add new active product
      return { products: [...state.products, product] }
    })
  }
}))
