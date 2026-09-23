import { useState } from 'react'
import Alert from '../components/Alert'
import PageHero from '../components/PageHero'
import Stars from '../components/Stars'
import { useAuth } from '../context/AuthContext'
import { accent } from '../lib/accents'
import { supabase } from '../lib/supabaseClient'
import { useReviews } from '../lib/useReviews'

function ReviewForm() {
  const { business } = useAuth()
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    // No .select(): visitors can't read a review back until it's approved.
    const { error } = await supabase.from('reviews').insert({
      business_id: business.id,
      name: name.trim(),
      rating,
      comment: comment.trim(),
    })
    setBusy(false)
    if (error) return setError('Sorry, your review could not be sent. Please try again.')
    setDone(true)
  }

  if (done) {
    return (
      <div className="card p-6 text-center">
        <p className="text-3xl">🙏</p>
        <h3 className="mt-2 font-bold">Thank you!</h3>
        <p className="mt-1 text-sm">Your review has been received and will appear here once it&apos;s approved.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <h2 className="text-xl font-extrabold">Leave a review</h2>
      <Alert tone="error">{error}</Alert>
      <div>
        <span className="label">Your rating</span>
        <Stars value={rating} onChange={setRating} size="h-7 w-7" />
      </div>
      <div>
        <label className="label" htmlFor="review-name">Your name</label>
        <input id="review-name" required maxLength={80} className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="review-comment">Your review</label>
        <textarea id="review-comment" required minLength={3} maxLength={1000} rows={4} className="input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you order? How was it?" />
      </div>
      <button disabled={busy || !business} className="btn-primary w-full">{busy ? 'Sending…' : 'Submit review'}</button>
    </form>
  )
}

export default function Reviews() {
  const { reviews, average } = useReviews()

  return (
    <>
      <PageHero eyebrow="Reviews" eyebrowClass="text-yellow" title="What our customers say" subtitle="Real reviews from people who've eaten with us." photoIndex={5} />
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_380px]">
        <div>
          {reviews.length > 0 ? (
            <>
              <div className="mb-6 flex items-center gap-3">
                <span className="font-display text-4xl font-extrabold text-ink">{average.toFixed(1)}</span>
                <div>
                  <Stars value={average} size="h-5 w-5" />
                  <p className="text-sm">{reviews.length} review{reviews.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <figure key={r.id} className={`card border-l-4 ${accent(i).left} p-5`}>
                    <div className="flex items-center justify-between gap-3">
                      <figcaption className="font-semibold text-ink">{r.name}</figcaption>
                      <Stars value={r.rating} />
                    </div>
                    <blockquote className="mt-2 text-sm leading-relaxed">{r.comment}</blockquote>
                    <p className="mt-2 text-xs text-ink-muted">{new Date(r.created_at).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</p>
                  </figure>
                ))}
              </div>
            </>
          ) : (
            <div className="card p-10 text-center">
              <p className="text-4xl">⭐</p>
              <h2 className="mt-3 text-xl font-extrabold">No reviews yet</h2>
              <p className="mt-1 text-sm">Be the first to tell others about your experience.</p>
            </div>
          )}
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ReviewForm />
        </div>
      </div>
    </>
  )
}
