import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Component, type ReactNode, type ErrorInfo } from 'react'

/* ── Error boundary — prevents total black screen on render errors ── */
class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(e: Error) { return { error: e } }
  componentDidCatch(e: Error, info: ErrorInfo) { console.error('[App Error]', e, info) }
  render() {
    if (this.state.error) return (
      <div style={{ minHeight:'100vh', background:'#080910', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', textAlign:'center' }}>
        <div>
          <p style={{ color:'#39ff14', fontFamily:'monospace', fontSize:'1.2rem', marginBottom:'1rem' }}>Cryptogamer's</p>
          <p style={{ color:'#e0e0e0', marginBottom:'0.5rem' }}>Algo salió mal al cargar esta sección.</p>
          <button onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
            style={{ background:'#7c3aed', color:'#fff', border:'none', padding:'10px 24px', borderRadius:'10px', cursor:'pointer', fontWeight:'bold' }}>
            Volver al inicio
          </button>
        </div>
      </div>
    )
    return this.props.children
  }
}
import { CartProvider }       from './context/CartContext'
import { AuthProvider }       from './context/AuthContext'
import { CategoriesProvider } from './context/CategoriesContext'
import { ThemeProvider }      from './context/ThemeContext'
import ScrollToTop            from './components/common/ScrollToTop'
import Navbar                 from './components/common/Navbar'
import Footer                 from './components/common/Footer'
import CartDrawer             from './components/common/CartDrawer'
import CheckoutModal          from './components/common/CheckoutModal'
import HomePage               from './pages/HomePage'
import ProductsPage           from './pages/ProductsPage'
import ProductDetailPage      from './pages/ProductDetailPage'
import OffersPage             from './pages/OffersPage'
import ContactPage            from './pages/ContactPage'
import ProfilePage            from './pages/ProfilePage'
import AdminDashboard         from './pages/AdminDashboard'
import AdminProductPage       from './pages/AdminProductPage'
import AdminCategoryPage      from './pages/AdminCategoryPage'
import AdminEditorPage        from './pages/AdminEditorPage'
import AdminSellersPage           from './pages/admin/AdminSellersPage'
import AdminAnalyticsPage         from './pages/admin/AdminAnalyticsPage'
import AdminAnalyticsAdvancedPage from './pages/admin/AdminAnalyticsAdvancedPage'
import AdminOrdersPage            from './pages/admin/AdminOrdersPage'
import ResetPasswordPage      from './pages/ResetPasswordPage'
import OrderTrackingPage      from './pages/OrderTrackingPage'
import NotFoundPage           from './pages/NotFoundPage'
import SuperAdminPage         from './pages/SuperAdminPage'
import WhatsAppButton         from './components/common/WhatsAppButton'
import { Toaster }            from 'react-hot-toast'
function App() {
  return (
    <AppErrorBoundary>
    <ThemeProvider>
    <Router>
      <AuthProvider>
        <CategoriesProvider>
          <CartProvider>
            <ScrollToTop />
            <div className="min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">
              <Navbar />
              <CartDrawer />
              <CheckoutModal />
              <Routes>
                <Route path="/"                     element={<HomePage />} />
                <Route path="/products"             element={<ProductsPage />} />
                <Route path="/products/:id"         element={<ProductDetailPage />} />
                <Route path="/ofertas"              element={<OffersPage />} />
                <Route path="/contacto"             element={<ContactPage />} />
                <Route path="/perfil"               element={<ProfilePage />} />
                <Route path="/admin"                element={<AdminDashboard />} />
                <Route path="/admin/productos"      element={<AdminProductPage />} />
                <Route path="/admin/categorias"     element={<AdminCategoryPage />} />
                <Route path="/admin/editor"         element={<AdminEditorPage />} />
                <Route path="/admin/vendedores"          element={<AdminSellersPage />} />
                <Route path="/admin/analytics"           element={<AdminAnalyticsPage />} />
                <Route path="/admin/analytics-avanzado" element={<AdminAnalyticsAdvancedPage />} />
                <Route path="/admin/pedidos"             element={<AdminOrdersPage />} />
                <Route path="/reset-password"       element={<ResetPasswordPage />} />
                <Route path="/seguimiento/:orderNumber" element={<OrderTrackingPage />} />
                <Route path="/superadmin"           element={<SuperAdminPage />} />
                <Route path="*"                     element={<NotFoundPage />} />
              </Routes>
              <Footer />
              <Toaster position="bottom-right" />
              <WhatsAppButton />
            </div>
          </CartProvider>
        </CategoriesProvider>
      </AuthProvider>
    </Router>
    </ThemeProvider>
    </AppErrorBoundary>
  )
}

export default App
