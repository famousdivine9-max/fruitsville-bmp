import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from './supabaseClient'

// Categories + products for the current business. RLS decides visibility:
// the public sees active/available rows, staff see everything.
export function useCatalog() {
  const { business, businessLoading } = useAuth()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    if (!business) return
    setLoading(true)
    const [cats, prods] = await Promise.all([
      supabase.from('categories').select('*').eq('business_id', business.id).order('sort_order').order('name'),
      supabase.from('products').select('*').eq('business_id', business.id).order('sort_order').order('name'),
    ])
    setError(cats.error?.message || prods.error?.message || null)
    setCategories(cats.data ?? [])
    setProducts(prods.data ?? [])
    setLoading(false)
  }, [business])

  useEffect(() => {
    if (business) reload()
    else if (!businessLoading) setLoading(false)
  }, [business, businessLoading, reload])

  return { categories, products, loading, error, reload }
}
