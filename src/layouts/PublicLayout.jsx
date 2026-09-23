import { Outlet } from 'react-router-dom'
import FloatingWhatsApp from '../components/FloatingWhatsApp'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function PublicLayout() {
  const { error } = useAuth()
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {error && (
        <div className="bg-red-light px-4 py-2 text-center text-sm text-red-dark">
          Site data couldn't be loaded: {error}
        </div>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}
