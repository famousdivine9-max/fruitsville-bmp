import { useState } from 'react'
import Alert from '../../components/Alert'
import PageHeader from '../../components/PageHeader'
import Spinner from '../../components/Spinner'
import { useAuth } from '../../context/AuthContext'
import { slugify } from '../../lib/format'
import { supabase } from '../../lib/supabaseClient'
import { useCatalog } from '../../lib/useCatalog'

const EMPTY = { name: '', description: '', sort_order: 0, is_active: true }

export default function Categories() {
  const { business } = useAuth()
  const { categories, products, loading, reload } = useCatalog()
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const row = {
      business_id: business.id,
      name: form.name.trim(),
      slug: slugify(form.name),
      description: form.description?.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    }
    const { error } = editingId
      ? await supabase.from('categories').update(row).eq('id', editingId)
      : await supabase.from('categories').insert(row)
    if (error) return setError(error.message)
    setForm(EMPTY)
    setEditingId(null)
    reload()
  }

  async function remove(c) {
    const count = products.filter((p) => p.category_id === c.id).length
    if (!confirm(`Delete "${c.name}"?${count ? ` Its ${count} product(s) will become uncategorised.` : ''}`)) return
    const { error } = await supabase.from('categories').delete().eq('id', c.id)
    if (error) setError(error.message)
    reload()
  }

  function edit(c) {
    setEditingId(c.id)
    setForm({ name: c.name, description: c.description ?? '', sort_order: c.sort_order, is_active: c.is_active })
  }

  return (
    <>
      <PageHeader title="Categories" subtitle="Group your menu into sections." />
      <Alert tone="error">{error}</Alert>
      <form onSubmit={onSubmit} className="card mb-6 grid gap-4 p-5 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="label">Name</label>
          <input required className="input" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">Sort order</label>
          <input type="number" className="input" value={form.sort_order} onChange={set('sort_order')} />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" checked={form.is_active} onChange={set('is_active')} /> Visible on website
        </label>
        <div className="sm:col-span-4">
          <label className="label">Description</label>
          <input className="input" value={form.description} onChange={set('description')} />
        </div>
        <div className="flex gap-2 sm:col-span-4">
          <button type="submit" className="btn-primary">{editingId ? 'Update category' : 'Add category'}</button>
          {editingId && <button type="button" className="btn-outline" onClick={() => { setEditingId(null); setForm(EMPTY) }}>Cancel</button>}
        </div>
      </form>

      {loading ? <Spinner /> : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Order</th><th>Name</th><th>Products</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.sort_order}</td>
                  <td>
                    <p className="font-medium">{c.name}</p>
                    {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
                  </td>
                  <td>{products.filter((p) => p.category_id === c.id).length}</td>
                  <td>
                    <span className={`badge ${c.is_active ? 'bg-green-light text-green-dark' : 'bg-gray-100 text-gray-500'}`}>
                      {c.is_active ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-right">
                    <button className="btn-outline btn-sm" onClick={() => edit(c)}>Edit</button>
                    <button className="btn btn-sm text-red hover:bg-red-light" onClick={() => remove(c)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!categories.length && <tr><td colSpan={5} className="py-8 text-center text-gray-500">No categories yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
