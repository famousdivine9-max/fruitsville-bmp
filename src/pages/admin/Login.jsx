import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Alert from '../../components/Alert'
import Logo from '../../components/Logo'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { user, signIn, settings, loading } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user && !loading) return <Navigate to={location.state?.from?.pathname || '/admin'} replace />

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-maroon to-maroon-dark p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-4 p-8">
        <div className="flex justify-center">
          <Logo settings={settings} className="h-12 w-12" nameClassName="text-maroon" />
        </div>
        <h1 className="text-center text-lg font-bold text-charcoal">Staff sign in</h1>
        <Alert tone="error">{error}</Alert>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
