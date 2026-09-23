import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

export default function ProtectedRoute({ minRole = 'staff', children }) {
  const { user, loading, hasRole } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location }} />
  if (!hasRole(minRole)) {
    return (
      <div className="card mx-auto my-16 max-w-md p-8 text-center">
        <h2 className="text-lg font-bold text-ink">Access restricted</h2>
        <p className="mt-2 text-sm text-gray-600">
          Your account doesn't have permission to view this page. Ask an administrator to update your role.
        </p>
      </div>
    )
  }
  return children
}
