import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from './supabaseClient'

// Approved reviews for the public site (RLS hides pending ones from visitors).
export function useReviews() {
  const { business } = useAuth()
  const [reviews, setReviews] = useState([])

  const reload = useCallback(async () => {
    if (!business) return
    const { data } = await supabase
      .from('reviews')
      .select('id, name, rating, comment, created_at')
      .eq('business_id', business.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
    setReviews(data ?? [])
  }, [business])

  useEffect(() => {
    reload()
  }, [reload])

  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  return { reviews, average, reload }
}
