import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Spinner from './components/Spinner'
import PublicLayout from './layouts/PublicLayout'
import About from './pages/About'
import Contact from './pages/Contact'
import Gallery from './pages/Gallery'
import Home from './pages/Home'
import Menu from './pages/Menu'
import NotFound from './pages/NotFound'
import Reviews from './pages/Reviews'

// Admin portal is split out so public visitors don't download it (or Recharts).
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const Categories = lazy(() => import('./pages/admin/Categories'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Inventory = lazy(() => import('./pages/admin/Inventory'))
const Login = lazy(() => import('./pages/admin/Login'))
const Products = lazy(() => import('./pages/admin/Products'))
const Reports = lazy(() => import('./pages/admin/Reports'))
const ReviewsAdmin = lazy(() => import('./pages/admin/ReviewsAdmin'))
const Sales = lazy(() => import('./pages/admin/Sales'))
const Settings = lazy(() => import('./pages/admin/Settings'))

const guard = (minRole, element) => <ProtectedRoute minRole={minRole}>{element}</ProtectedRoute>

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="about" element={<About />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="admin/login" element={<Login />} />
        <Route path="admin" element={guard('staff', <AdminLayout />)}>
          <Route index element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="products" element={guard('manager', <Products />)} />
          <Route path="categories" element={guard('manager', <Categories />)} />
          <Route path="reports" element={guard('manager', <Reports />)} />
          <Route path="reviews" element={guard('manager', <ReviewsAdmin />)} />
          <Route path="settings" element={guard('administrator', <Settings />)} />
        </Route>
      </Routes>
    </Suspense>
  )
}
