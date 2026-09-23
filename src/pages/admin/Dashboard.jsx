import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PageHeader from '../../components/PageHeader'
import Spinner from '../../components/Spinner'
import { useAuth } from '../../context/AuthContext'
import { dayKey, formatDate, formatMoney } from '../../lib/format'
import { supabase } from '../../lib/supabaseClient'

function Stat({ label, value, tone = 'text-charcoal' }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { business, settings } = useAuth()
  const [data, setData] = useState(null)
  const currency = settings?.currency

  useEffect(() => {
    if (!business) return
    const since = new Date()
    since.setHours(0, 0, 0, 0)
    since.setDate(since.getDate() - 6)

    Promise.all([
      supabase.from('sales').select('*').eq('business_id', business.id).gte('sold_at', since.toISOString()).order('sold_at', { ascending: false }),
      supabase.from('inventory').select('quantity, low_stock_threshold, products(name, is_available)').eq('business_id', business.id),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('business_id', business.id),
    ]).then(([sales, inv, prods]) => {
      const rows = sales.data ?? []
      const today = dayKey(new Date())
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(since)
        d.setDate(d.getDate() + i)
        return { day: dayKey(d), label: d.toLocaleDateString('en-NG', { weekday: 'short' }), total: 0 }
      })
      for (const s of rows) {
        const bucket = days.find((d) => d.day === dayKey(s.sold_at))
        if (bucket) bucket.total += Number(s.total)
      }
      const todays = rows.filter((s) => dayKey(s.sold_at) === today)
      setData({
        todayTotal: todays.reduce((sum, s) => sum + Number(s.total), 0),
        todayCount: todays.length,
        weekTotal: rows.reduce((sum, s) => sum + Number(s.total), 0),
        lowStock: (inv.data ?? []).filter((i) => i.products?.is_available && i.quantity <= i.low_stock_threshold),
        productCount: prods.count ?? 0,
        days,
        recent: rows.slice(0, 8),
      })
    })
  }, [business])

  if (!data) return <Spinner />

  return (
    <>
      <PageHeader title="Dashboard" subtitle={settings?.business_name} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Sales today" value={formatMoney(data.todayTotal, currency)} tone="text-ink" />
        <Stat label="Transactions today" value={data.todayCount} />
        <Stat label="Last 7 days" value={formatMoney(data.weekTotal, currency)} />
        <Stat label="Low-stock items" value={data.lowStock.length} tone={data.lowStock.length ? 'text-red' : 'text-green'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Revenue, last 7 days</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} width={70} tickFormatter={(v) => formatMoney(v, currency)} />
                <Tooltip formatter={(v) => formatMoney(v, currency)} />
                <Bar dataKey="total" name="Revenue" fill="#1E8A44" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Low stock</h2>
            <Link to="/admin/inventory" className="text-xs font-semibold text-red hover:underline">Inventory →</Link>
          </div>
          {data.lowStock.length ? (
            <ul className="space-y-2 text-sm">
              {data.lowStock.map((i) => (
                <li key={i.products.name} className="flex justify-between">
                  <span>{i.products.name}</span>
                  <span className="badge bg-red-light text-red-dark">{i.quantity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Everything is well stocked.</p>
          )}
        </div>
      </div>

      <div className="card mt-6 overflow-x-auto p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent sales</h2>
          <Link to="/admin/sales" className="text-xs font-semibold text-red hover:underline">Record a sale →</Link>
        </div>
        {data.recent.length ? (
          <table className="table-base">
            <thead>
              <tr><th>Time</th><th>Item</th><th>Qty</th><th>Total</th><th>Payment</th></tr>
            </thead>
            <tbody>
              {data.recent.map((s) => (
                <tr key={s.id}>
                  <td className="whitespace-nowrap">{formatDate(s.sold_at)}</td>
                  <td>{s.product_name}</td>
                  <td>{s.quantity}</td>
                  <td>{formatMoney(s.total, currency)}</td>
                  <td className="capitalize">{s.payment_method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">No sales recorded in the last 7 days. ({data.productCount} products on the menu.)</p>
        )}
      </div>
    </>
  )
}
