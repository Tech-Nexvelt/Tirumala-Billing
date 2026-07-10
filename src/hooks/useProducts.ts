'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types/database'
import { toast } from 'sonner'

const PRODUCTS_KEY = ['products']

export function useProducts(filters?: {
  search?: string
  category_id?: string
  status?: string
}) {
  const supabase = createClient()

  return useQuery({
    queryKey: [...PRODUCTS_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, categories(name)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`
        )
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Product[]
    },
    staleTime: 30_000,
  })
}

export function useProduct(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', id)
        .is('deleted_at', null)
        .single()
      if (error) throw error
      return data as Product
    },
    enabled: !!id,
  })
}

export function useProductByBarcode(barcode: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: [...PRODUCTS_KEY, 'barcode', barcode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode.toUpperCase())
        .eq('status', 'active')
        .is('deleted_at', null)
        .single()
      if (error) return null
      return data as Product
    },
    enabled: barcode.length >= 4,
    staleTime: 60_000,
  })
}

export function useCreateProduct() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
      toast.success('Product created successfully')
    },
    onError: (err: Error) => {
      if (err.message.includes('barcode')) {
        toast.error('Barcode already exists. Please use a unique barcode.')
      } else if (err.message.includes('sku')) {
        toast.error('SKU already exists. Please use a unique SKU.')
      } else {
        toast.error('Failed to create product')
      }
    },
  })
}

export function useUpdateProduct() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
      toast.success('Product updated successfully')
    },
    onError: () => toast.error('Failed to update product'),
  })
}

export function useDeleteProduct() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
      toast.success('Product deleted')
    },
    onError: () => toast.error('Failed to delete product'),
  })
}

export function useCategories() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('deleted_at', null)
        .eq('is_active', true)
        .order('sort_order')
      if (error) throw error
      return (data ?? []) as Array<{ id: string; name: string; description?: string | null; sort_order: number }>
    },
    staleTime: 60_000,
  })
}

