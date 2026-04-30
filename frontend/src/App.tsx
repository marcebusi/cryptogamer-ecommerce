import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider }       from './context/CartContext'
import { AuthProvider }       from './context/AuthContext'
import { CategoriesProvider } from './context/CategoriesContext'
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
import AdminSellersPage       from './pages/admin/AdminSellersPage'
import ResetPasswordPage      from './pages/ResetPasswordPage'
import NotFoundPage           from './pages/NotFoundPage'
import WhatsAppButton         from './components/common/WhatsAppButton'
import { Toaster }            from 'react-hot-toast'
function App() {
  return (
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
                <Route path="/admin/vendedores"     element={<AdminSellersPage />} />
                <Route path="/reset-password"       element={<ResetPasswordPage />} />
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
  )
}

export default App
