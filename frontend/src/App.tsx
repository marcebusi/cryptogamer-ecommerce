import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import ScrollToTop from './components/common/ScrollToTop'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import CartDrawer from './components/common/CartDrawer'
import CheckoutModal from './components/common/CheckoutModal'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import OffersPage from './pages/OffersPage'
import ContactPage from './pages/ContactPage'

function App() {
  return (
    <Router>
      <CartProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">
          <Navbar />
          <CartDrawer />
          <CheckoutModal />
          <Routes>
            <Route path="/"           element={<HomePage />} />
            <Route path="/products"   element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/ofertas"    element={<OffersPage />} />
            <Route path="/contacto"   element={<ContactPage />} />
          </Routes>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  )
}

export default App
