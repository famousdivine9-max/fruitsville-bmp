import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-5xl font-extrabold text-brand">404</h1>
      <p className="mt-3 text-gray-600">We couldn&apos;t find that page.</p>
      <Link to="/" className="btn-primary mt-6">Back home</Link>
    </div>
  )
}
