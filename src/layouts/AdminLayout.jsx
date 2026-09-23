import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true, minRole: 'staff' },
  { to: '/admin/sales', label: 'Sales', minRole: 'staff' },
  { to: '/admin/inventory', label: 'Inventory', minRole: 'staff' },
  { to: '/admin/products', label: 'Products', minRole: 'manager' },
  { to: '/admin/categories', label: 'Categories', minRole: 'manager' },
  { to: '/admin/reports', label: 'Reports', minRole: 'manager' },
  { to: '/admin/settings', label: 'Settings', minRole: 'administrator' },
]

export default function AdminLayout() {
  const { settings, profile, user, role, hasRole, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.filter((n) => hasRole(n.minRole)).map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-sm font-medium ${
              isActive ? 'bg-white text-maroon' : 'text-white/85 hover:bg-white/10'
            }`
          }
        >
          {n.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <aside
        className={`${open ? 'block' : 'hidden'} bg-maroon p-4 text-white md:sticky md:top-0 md:block md:h-screen md:w-60 md:shrink-0`}
      >
        <Link to="/admin" className="mb-6 hidden md:block">
          <Logo settings={settings} className="h-9 w-9" nameClassName="text-sm text-white" />
        </Link>
        {nav}
        <div className="mt-6 border-t border-white/15 pt-4 text-xs text-white/70">
          <p className="truncate">{profile?.full_name || user?.email}</p>
          <p className="capitalize">{role.replace('_', ' ')}</p>
          <div className="mt-3 flex gap-2">
            <Link to="/" className="btn btn-sm border border-white/30 text-white hover:bg-white/10">View site</Link>
            <button onClick={signOut} className="btn btn-sm bg-white text-maroon hover:bg-maroon-light">Sign out</button>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between bg-maroon px-4 py-3 text-white md:hidden">
          <Logo settings={settings} className="h-8 w-8" nameClassName="text-sm text-white" />
          <button onClick={() => setOpen((o) => !o)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Toggle admin menu">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
