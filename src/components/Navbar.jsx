import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { whatsappLink } from '../lib/whatsapp'
import Logo from './Logo'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Menu' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const linkClass = ({ isActive }) =>
  `rounded-full px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-white text-brand' : 'text-white/90 hover:bg-white/10 hover:text-white'
  }`

export default function Navbar() {
  const { settings } = useAuth()
  const [open, setOpen] = useState(false)
  const orderLink = whatsappLink(settings, 'Hello, I would like to place an order.')

  return (
    <header className="sticky top-0 z-30 bg-brand text-white shadow-md">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Logo settings={settings} nameClassName="text-white" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          {orderLink && (
            <a href={orderLink} target="_blank" rel="noopener noreferrer" className="btn-accent btn-sm ml-2">
              Order now
            </a>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 hover:bg-white/10 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            {orderLink && (
              <a href={orderLink} target="_blank" rel="noopener noreferrer" className="btn-accent mt-2">
                Order now
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
