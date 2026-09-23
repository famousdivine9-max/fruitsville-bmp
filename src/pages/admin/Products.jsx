import { useState } from 'react'
import Alert from '../../components/Alert'
import PageHeader from '../../components/PageHeader'
import ProductImage from '../../components/ProductImage'
import Spinner from '../../components/Spinner'
import { useAuth } from '../../context/AuthContext'
import { formatMoney } from '../../lib/format'
import { PRODUCT_IMAGES_BUCKET, supabase } from '../../lib/supabaseClient'
import { useCatalog } from '../../lib/useCatalog'

const EMPTY = {
  name: '',
  description: '',
  price: '',
  category_id: '',
  image_url: '',
  is_available: true,
  is_featured: false,
  sort_order: 0,
}

async function uploadImage(businessId, file) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${businessId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
  })
  if (error) throw error
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl
}

function ProductForm({ initial, categories, onCancel, onSaved }) {
  const { business } = useAuth()
  const [form, setForm] = useState({ ...EMPTY, ...initial, category_id: initial?.category_id ?? '' })
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const preview = file ? URL.createObjectURL(file) : form.image_url

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      let image_url = form.image_url || null
      if (file) image_url = await uploadImage(business.id, file)
      const row = {
        business_id: business.id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price) || 0,
        category_id: form.category_id || null,
        image_url,
        is_available: form.is_available,
        is_featured: form.is_featured,
        sort_order: Number(form.sort_order) || 0,
      }
      const q = initial?.id
        ? supabase.from('products').update(row).eq('id', initial.id)
        : supabase.from('products').insert(row)
      const { error } = await q
      if (error) throw error
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mb-6 grid gap-4 p-5 md:grid-cols-[180px_1fr]">
      <div>
        <ProductImage product={{ name: form.name || '?', image_url: preview }} className="aspect-square w-full rounded-xl" />
        <label className="btn-outline btn-sm mt-3 w-full cursor-pointer">
          {preview ? 'Change photo' : 'Upload photo'}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        {preview && (
          <button type="button" className="mt-2 w-full text-xs text-red hover:underline" onClick={() => { setFile(null); setForm((f) => ({ ...f, image_url: '' })) }}>
            Remove photo
          </button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><Alert tone="error">{error}</Alert></div>
        <div>
          <label className="label">Name</label>
          <input required className="input" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category_id} onChange={set('category_id')}>
            <option value="">— None —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Price</label>
          <input type="number" min="0" step="0.01" className="input" value={form.price} onChange={set('price')} placeholder="0.00" />
        </div>
        <div>
          <label className="label">Sort order</label>
          <input type="number" className="input" value={form.sort_order} onChange={set('sort_order')} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea rows={2} className="input" value={form.description ?? ''} onChange={set('description')} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_available} onChange={set('is_available')} /> Available (shown on the website)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_featured} onChange={set('is_featured')} /> Featured on home page
        </label>
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save product'}</button>
          <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
        </div>
      </div>
    </form>
  )
}

export default function Products() {
  const { settings } = useAuth()
  const { categories, products, loading, error, reload } = useCatalog()
  const [editing, setEditing] = useState(null) // null | {} (new) | product
  const [message, setMessage] = useState('')

  async function remove(p) {
    if (!confirm(`Delete "${p.name}"? Its sales history is kept.`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    setMessage(error ? error.message : `Deleted ${p.name}.`)
    reload()
  }

  async function toggle(p, field) {
    await supabase.from('products').update({ [field]: !p[field] }).eq('id', p.id)
    reload()
  }

  const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? '—'

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Add items, set prices and upload photos."
        actions={!editing && <button className="btn-accent" onClick={() => setEditing({})}>+ Add product</button>}
      />
      <Alert tone="error">{error}</Alert>
      <Alert tone="info">{message}</Alert>
      {editing && (
        <ProductForm
          key={editing.id ?? 'new'}
          initial={editing}
          categories={categories}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); setMessage('Product saved.'); reload() }}
        />
      )}
      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="w-14"><ProductImage product={p} className="h-10 w-10 rounded-lg text-xs [&_span]:text-lg" /></td>
                  <td className="font-medium">
                    {p.name}
                    {p.is_featured && <span className="badge ml-2 bg-yellow text-charcoal">Featured</span>}
                  </td>
                  <td>{categoryName(p.category_id)}</td>
                  <td>{Number(p.price) > 0 ? formatMoney(p.price, settings?.currency) : <span className="text-xs text-red">Price not set</span>}</td>
                  <td>
                    <button onClick={() => toggle(p, 'is_available')} className={`badge ${p.is_available ? 'bg-green-light text-green-dark' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_available ? 'Available' : 'Hidden'}
                    </button>
                  </td>
                  <td className="whitespace-nowrap text-right">
                    <button className="btn-outline btn-sm" onClick={() => setEditing(p)}>Edit</button>
                    <button className="btn btn-sm text-red hover:bg-red-light" onClick={() => remove(p)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!products.length && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No products yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
