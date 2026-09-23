import { useCallback, useEffect, useMemo, useState } from 'react'
import Alert from '../../components/Alert'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { dayKey, formatDate, formatMoney } from '../../lib/format'
import { supabase } from '../../lib/supabaseClient'
import { useCatalog } from '../../lib/useCatalog'

const PAYMENT_METHODS = ['cash', 'transfer', 'pos', 'other']

export default function Sales() {
  const { business, settings, hasRole } = useAuth()
  const { products } = useCatalog()
  const currency = settings?.currency
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState('')
  const [payment, setPayment] = useState('cash')
  const [note, setNote] = useState('')
  const [day, setDay] = useState(dayKey(new Date()))
  const [sales, setSales] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  const product = products.find((p) => p.id === productId)

  const load = useCallback(async () => {
    const start = new Date(`${day}T00:00:00`)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('business_id', business.id)
      .gte('sold_at', start.toISOString())
      .lt('sold_at', end.toISOString())
      .order('sold_at', { ascending: false })
    if (error) setError(error.message)
    setSales(data ?? [])
  }, [business, day])

  useEffect(() => {
    if (business) load()
  }, [business, load])

  function pickProduct(id) {
    setProductId(id)
    const p = products.find((x) => x.id === id)
    setUnitPrice(p && Number(p.price) > 0 ? String(p.price) : '')
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!product) return
    setBusy(true)
    setError('')
    setSuccess('')
    const { error } = await supabase.from('sales').insert({
      business_id: business.id,
      product_id: product.id,
      product_name: product.name,
      quantity: Number(quantity),
      unit_price: Number(unitPrice) || 0,
      payment_method: payment,
      note: note || null,
    })
    setBusy(false)
    if (error) return setError(error.message)
    setSuccess(`Recorded ${quantity} × ${product.name}.`)
    setQuantity(1)
    setNote('')
    if (day === dayKey(new Date())) load()
    else setDay(dayKey(new Date()))
  }

  async function remove(s) {
    if (!confirm(`Delete this sale of ${s.quantity} × ${s.product_name}? Stock is not restored automatically.`)) return
    const { error } = await supabase.from('sales').delete().eq('id', s.id)
    if (error) setError(error.message)
    load()
  }

  const total = useMemo(() => sales.reduce((sum, s) => sum + Number(s.total), 0), [sales])

  return (
    <>
      <PageHeader title="Sales" subtitle="Record walk-in and WhatsApp orders. Stock updates automatically." />
      <Alert tone="error">{error}</Alert>
      <Alert tone="success">{success}</Alert>

      <form onSubmit={onSubmit} className="card mb-8 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="label">Product</label>
          <select required className="input" value={productId} onChange={(e) => pickProduct(e.target.value)}>
            <option value="">Select…</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Qty</label>
          <input required type="number" min="1" className="input" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div>
          <label className="label">Unit price</label>
          <input required type="number" min="0" step="0.01" className="input" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
        </div>
        <div>
          <label className="label">Payment</label>
          <select className="input capitalize" value={payment} onChange={(e) => setPayment(e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m === 'pos' ? 'POS' : m}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button disabled={busy || !product} className="btn-accent w-full">{busy ? 'Saving…' : 'Record sale'}</button>
        </div>
        <div className="sm:col-span-2 lg:col-span-6">
          <label className="label">Note (optional)</label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. WhatsApp order, customer name" />
        </div>
        {product && unitPrice && (
          <p className="text-sm text-gray-600 sm:col-span-2 lg:col-span-6">
            Total: <strong className="text-maroon">{formatMoney(Number(quantity) * Number(unitPrice), currency)}</strong>
          </p>
        )}
      </form>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Sales on</h2>
        <input type="date" className="input w-auto" value={day} onChange={(e) => setDay(e.target.value)} />
        <p className="ml-auto text-sm">Day total: <strong className="text-maroon">{formatMoney(total, currency)}</strong></p>
      </div>
      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Time</th><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th><th>Payment</th><th>Note</th>{hasRole('manager') && <th></th>}</tr></thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}>
                <td className="whitespace-nowrap">{formatDate(s.sold_at)}</td>
                <td>{s.product_name}</td>
                <td>{s.quantity}</td>
                <td>{formatMoney(s.unit_price, currency)}</td>
                <td className="font-semibold">{formatMoney(s.total, currency)}</td>
                <td className="capitalize">{s.payment_method}</td>
                <td className="text-gray-500">{s.note}</td>
                {hasRole('manager') && (
                  <td className="text-right"><button className="btn btn-sm text-red hover:bg-red-light" onClick={() => remove(s)}>Delete</button></td>
                )}
              </tr>
            ))}
            {!sales.length && <tr><td colSpan={8} className="py-8 text-center text-gray-500">No sales on this day.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
