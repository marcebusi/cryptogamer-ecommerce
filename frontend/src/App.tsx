import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import CartDrawer from './components/common/CartDrawer'
import CheckoutModal from './components/common/CheckoutModal'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">
          <Navbar />
          <CartDrawer />
          <CheckoutModal />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
          </Routes>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  )
}

export default App
