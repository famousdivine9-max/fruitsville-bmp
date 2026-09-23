import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from './supabaseClient'

export function useGallery() {
  const { business } = useAuth()
  const [images, setImages] = useState([])

  useEffect(() => {
    if (!business) return
    supabase
      .from('gallery_images')
      .select('id, image_url, caption')
      .eq('business_id', business.id)
      .order('sort_order')
      .then(({ data }) => setImages(data ?? []))
  }, [business])

  return images
}
