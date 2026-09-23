import { useEffect, useMemo, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { dayKey, formatMoney } from '../../lib/format'
import { supabase } from '../../lib/supabaseClient'

// Chart colours follow the brand tokens in tailwind.config.js.
const BRAND = { maroon: '#6E1E42', red: '#D62839', green: '#1B6B3C', yellow: '#F4C430', charcoal: '#2A2A28' }
const PIE_COLORS = [BRAND.maroon, BRAND.green, BRAND.red, BRAND.yellow, BRAND.charcoal]

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return dayKey(d)
}

export default function Reports() {
  const { business, settings } = useAuth()
  const currency = settings?.currency
  const [from, setFrom] = useState(daysAgo(29))
  const [to, setTo] = useState(daysAgo(0))
  const [sales, setSales] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!business) return
    const start = new Date(`${from}T00:00:00`)
    const end = new Date(`${to}T00:00:00`)
    end.setDate(end.getDate() + 1)
    supabase
      .from('sales')
      .select('product_name, quantity, total, payment_method, sold_at')
      .eq('business_id', business.id)
      .gte('sold_at', start.toISOString())
      .lt('sold_at', end.toISOString())
      .order('sold_at')
      .limit(10000)
      .then(({ data, error }) => {
        setError(error?.message ?? '')
        setSales(data ?? [])
      })
  }, [business, from, to])

  const report = useMemo(() => {
    const byDay = new Map()
    for (let d = new Date(`${from}T00:00:00`); dayKey(d) <= to; d.setDate(d.getDate() + 1)) {
      byDay.set(dayKey(d), { day: dayKey(d).slice(5), total: 0, count: 0 })
    }
    const byProduct = new Map()
    const byPayment = new Map()
    let revenue = 0
    let items = 0
    for (const s of sales) {
      const t = Number(s.total)
      revenue += t
      items += s.quantity
      const d = byDay.get(dayKey(s.sold_at))
      if (d) { d.total += t; d.count += 1 }
      const p = byProduct.get(s.product_name) ?? { name: s.product_name, total: 0, quantity: 0 }
      p.total += t
      p.quantity += s.quantity
      byProduct.set(s.product_name, p)
      byPayment.set(s.payment_method, (byPayment.get(s.payment_method) ?? 0) + t)
    }
    return {
      revenue,
      items,
      transactions: sales.length,
      avg: sales.length ? revenue / sales.length : 0,
      days: [...byDay.values()],
      products: [...byProduct.values()].sort((a, b) => b.total - a.total),
      payments: [...byPayment.entries()].map(([name, value]) => ({ name: name === 'pos' ? 'POS' : name, value })),
    }
  }, [sales, from, to])

  function exportCsv() {
    const rows = [['sold_at', 'product', 'quantity', 'total', 'payment_method']]
    for (const s of sales) rows.push([s.sold_at, s.product_name, s.quantity, s.total, s.payment_method])
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `sales-${from}-to-${to}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Sales performance over time."
        actions={
          <>
            <input type="date" className="input w-auto" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            <input type="date" className="input w-auto" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
            <button className="btn-outline" onClick={exportCsv} disabled={!sales.length}>Export CSV</button>
          </>
        }
      />
      {error && <p className="mb-4 text-sm text-red">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Revenue', formatMoney(report.revenue, currency)],
          ['Transactions', report.transactions],
          ['Items sold', report.items],
          ['Average sale', formatMoney(report.avg, currency)],
        ].map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-maroon">{value}</p>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-5">
        <h2 className="mb-4 font-semibold">Daily revenue</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report.days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} width={80} tickFormatter={(v) => formatMoney(v, currency)} />
              <Tooltip formatter={(v) => formatMoney(v, currency)} />
              <Line type="monotone" dataKey="total" name="Revenue" stroke={BRAND.maroon} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Top products by revenue</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.products.slice(0, 10)} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" fontSize={12} tickFormatter={(v) => formatMoney(v, currency)} />
                <YAxis type="category" dataKey="name" fontSize={12} width={120} />
                <Tooltip formatter={(v) => formatMoney(v, currency)} />
                <Bar dataKey="total" name="Revenue" fill={BRAND.green} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="mb-4 font-semibold">Payment methods</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={report.payments} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {report.payments.map((p, i) => <Cell key={p.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(v, currency)} />
                <Legend formatter={(v) => <span className="capitalize">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Product</th><th>Qty sold</th><th>Revenue</th></tr></thead>
          <tbody>
            {report.products.map((p) => (
              <tr key={p.name}><td>{p.name}</td><td>{p.quantity}</td><td>{formatMoney(p.total, currency)}</td></tr>
            ))}
            {!report.products.length && <tr><td colSpan={3} className="py-8 text-center text-gray-500">No sales in this period.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
