import { useEffect, useState } from 'react'
import Alert from '../../components/Alert'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { toWhatsAppNumber } from '../../lib/whatsapp'

const FIELDS = [
  { key: 'business_name', label: 'Business name', required: true },
  { key: 'display_name', label: 'Display name / wordmark' },
  { key: 'tagline', label: 'Tagline', wide: true },
  { key: 'about', label: 'About (shown on About page)', wide: true, textarea: true },
  { key: 'address', label: 'Address', wide: true },
  { key: 'phone', label: 'Phone' },
  { key: 'whatsapp', label: 'WhatsApp number', hint: 'Any format — saved as international digits, e.g. 234XXXXXXXXXX' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'opening_hours', label: 'Opening hours', textarea: true },
  { key: 'instagram', label: 'Instagram URL', type: 'url' },
  { key: 'facebook', label: 'Facebook URL', type: 'url' },
  { key: 'tiktok', label: 'TikTok URL', type: 'url' },
  { key: 'currency', label: 'Currency code', required: true },
]

export default function Settings() {
  const { business, settings, refreshSettings } = useAuth()
  const [form, setForm] = useState({})
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setForm(settings ?? {})
  }, [settings])

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved('')
    const row = { business_id: business.id }
    for (const f of FIELDS) row[f.key] = (form[f.key] ?? '').toString().trim() || null
    row.whatsapp = row.whatsapp ? toWhatsAppNumber(row.whatsapp) : null
    row.currency = (row.currency || 'NGN').toUpperCase()
    const { error } = await supabase.from('settings').upsert(row)
    setBusy(false)
    if (error) return setError(error.message)
    await refreshSettings()
    setSaved('Settings saved — the website is updated.')
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Business details shown across the website." />
      <Alert tone="error">{error}</Alert>
      <Alert tone="success">{saved}</Alert>
      <form onSubmit={onSubmit} className="card grid gap-4 p-5 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.wide ? 'sm:col-span-2' : ''}>
            <label className="label" htmlFor={f.key}>{f.label}</label>
            {f.textarea ? (
              <textarea id={f.key} rows={3} className="input" value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
            ) : (
              <input id={f.key} type={f.type ?? 'text'} required={f.required} className="input" value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
            )}
            {f.hint && <p className="mt-1 text-xs text-gray-500">{f.hint}</p>}
          </div>
        ))}
        <div className="sm:col-span-2">
          <button disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save settings'}</button>
        </div>
      </form>
    </>
  )
}
