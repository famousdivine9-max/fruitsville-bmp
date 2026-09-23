import { useCallback, useEffect, useState } from 'react'
import Alert from '../../components/Alert'
import PageHeader from '../../components/PageHeader'
import Spinner from '../../components/Spinner'
import Stars from '../../components/Stars'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../lib/format'
import { supabase } from '../../lib/supabaseClient'

export default function ReviewsAdmin() {
  const { business } = useAuth()
  const [reviews, setReviews] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('business_id', business.id)
      .order('is_approved')
      .order('created_at', { ascending: false })
    setError(error?.message ?? '')
    setReviews(data ?? [])
  }, [business])

  useEffect(() => {
    if (business) load()
  }, [business, load])

  async function setApproved(r, is_approved) {
    const { error } = await supabase.from('reviews').update({ is_approved }).eq('id', r.id)
    if (error) setError(error.message)
    load()
  }

  async function remove(r) {
    if (!confirm(`Delete the review from ${r.name}?`)) return
    const { error } = await supabase.from('reviews').delete().eq('id', r.id)
    if (error) setError(error.message)
    load()
  }

  if (!reviews) return <Spinner />
  const pending = reviews.filter((r) => !r.is_approved).length

  return (
    <>
      <PageHeader title="Reviews" subtitle={`${pending} waiting for approval. Only approved reviews appear on the website.`} />
      <Alert tone="error">{error}</Alert>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="card flex flex-wrap items-start justify-between gap-4 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink">{r.name}</span>
                <Stars value={r.rating} />
                <span className={`badge ${r.is_approved ? 'bg-green-light text-green-dark' : 'bg-yellow-light text-ink'}`}>
                  {r.is_approved ? 'Published' : 'Pending'}
                </span>
              </div>
              <p className="mt-2 text-sm">{r.comment}</p>
              <p className="mt-1 text-xs text-ink-muted">{formatDate(r.created_at)}</p>
            </div>
            <div className="flex gap-2">
              {r.is_approved ? (
                <button className="btn-outline btn-sm" onClick={() => setApproved(r, false)}>Hide</button>
              ) : (
                <button className="btn-accent btn-sm" onClick={() => setApproved(r, true)}>Approve</button>
              )}
              <button className="btn btn-sm text-red hover:bg-red-light" onClick={() => remove(r)}>Delete</button>
            </div>
          </div>
        ))}
        {!reviews.length && <p className="card p-8 text-center text-sm">No reviews yet.</p>}
      </div>
    </>
  )
}
