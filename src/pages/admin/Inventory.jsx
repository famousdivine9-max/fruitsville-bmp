import { Fragment, useCallback, useEffect, useState } from 'react'
import Alert from '../../components/Alert'
import PageHeader from '../../components/PageHeader'
import Spinner from '../../components/Spinner'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../lib/format'
import { supabase } from '../../lib/supabaseClient'

function StockBadge({ item }) {
  if (item.quantity <= 0) return <span className="badge bg-red text-white">Out of stock</span>
  if (item.quantity <= item.low_stock_threshold) return <span className="badge bg-red-light text-red-dark">Low</span>
  return <span className="badge bg-green-light text-green-dark">In stock</span>
}

function AdjustForm({ item, canAdjust, onDone }) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('restock')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    const n = parseInt(amount, 10)
    if (!n) return
    setBusy(true)
    setError('')
    // Restocks add; waste removes; adjustments take the signed number as entered.
    const change = reason === 'restock' ? Math.abs(n) : reason === 'waste' ? -Math.abs(n) : n
    const { error } = await supabase.rpc('adjust_inventory', {
      p_product_id: item.product_id,
      p_change: change,
      p_reason: reason,
      p_note: note || null,
    })
    setBusy(false)
    if (error) return setError(error.message)
    onDone()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2 bg-cream-dark p-3">
      <div>
        <label className="label text-xs">Type</label>
        <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="restock">Restock (+)</option>
          {canAdjust && <option value="waste">Waste / spoilage (−)</option>}
          {canAdjust && <option value="adjustment">Correction (±)</option>}
        </select>
      </div>
      <div className="w-28">
        <label className="label text-xs">Quantity</label>
        <input required type="number" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div className="min-w-[10rem] flex-1">
        <label className="label text-xs">Note</label>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <button disabled={busy} className="btn-primary btn-sm">Save</button>
      <button type="button" className="btn-outline btn-sm" onClick={onDone}>Cancel</button>
      {error && <p className="w-full text-xs text-red">{error}</p>}
    </form>
  )
}

export default function Inventory() {
  const { business, hasRole } = useAuth()
  const canAdjust = hasRole('manager')
  const [items, setItems] = useState(null)
  const [history, setHistory] = useState([])
  const [open, setOpen] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const [inv, hist] = await Promise.all([
      supabase.from('inventory').select('*, products(name, is_available)').eq('business_id', business.id),
      supabase.from('inventory_history').select('*, products(name)').eq('business_id', business.id).order('created_at', { ascending: false }).limit(25),
    ])
    setError(inv.error?.message || hist.error?.message || '')
    setItems((inv.data ?? []).sort((a, b) => (a.products?.name ?? '').localeCompare(b.products?.name ?? '')))
    setHistory(hist.data ?? [])
  }, [business])

  useEffect(() => {
    if (business) load()
  }, [business, load])

  async function saveThreshold(item, value) {
    const n = parseInt(value, 10)
    if (Number.isNaN(n) || n === item.low_stock_threshold) return
    const { error } = await supabase.from('inventory').update({ low_stock_threshold: n }).eq('id', item.id)
    if (error) setError(error.message)
    load()
  }

  if (!items) return <Spinner />

  return (
    <>
      <PageHeader title="Inventory" subtitle="Stock goes down automatically when a sale is recorded." />
      <Alert tone="error">{error}</Alert>
      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Product</th><th>In stock</th><th>Low-stock alert at</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((item) => (
              <Fragment key={item.id}>
                <tr>
                  <td className="font-medium">
                    {item.products?.name}
                    {!item.products?.is_available && <span className="ml-2 text-xs text-gray-400">(hidden)</span>}
                  </td>
                  <td className="font-semibold">{item.quantity} <span className="text-xs font-normal text-gray-500">{item.unit}</span></td>
                  <td>
                    {canAdjust ? (
                      <input type="number" min="0" defaultValue={item.low_stock_threshold} className="input w-20" onBlur={(e) => saveThreshold(item, e.target.value)} />
                    ) : item.low_stock_threshold}
                  </td>
                  <td><StockBadge item={item} /></td>
                  <td className="text-right">
                    <button className="btn-secondary btn-sm" onClick={() => setOpen(open === item.id ? null : item.id)}>
                      {canAdjust ? 'Adjust' : 'Restock'}
                    </button>
                  </td>
                </tr>
                {open === item.id && (
                  <tr><td colSpan={5} className="p-0"><AdjustForm item={item} canAdjust={canAdjust} onDone={() => { setOpen(null); load() }} /></td></tr>
                )}
              </Fragment>
            ))}
            {!items.length && <tr><td colSpan={5} className="py-8 text-center text-gray-500">Add products to start tracking stock.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-8 font-semibold">Recent stock movements</h2>
      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>When</th><th>Product</th><th>Change</th><th>After</th><th>Reason</th><th>Note</th></tr></thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id}>
                <td className="whitespace-nowrap">{formatDate(h.created_at)}</td>
                <td>{h.products?.name}</td>
                <td className={h.change < 0 ? 'text-red' : 'text-green'}>{h.change > 0 ? `+${h.change}` : h.change}</td>
                <td>{h.quantity_after}</td>
                <td className="capitalize">{h.reason}</td>
                <td className="text-gray-500">{h.note}</td>
              </tr>
            ))}
            {!history.length && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No movements yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
