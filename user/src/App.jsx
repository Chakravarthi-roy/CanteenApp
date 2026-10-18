import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Menu from './pages/Menu'
import MyOrders from './pages/MyOrders'
import CartPanel from './components/CartPanel'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [cart, setCart] = useState({})
  const [cartOpen, setCartOpen] = useState(false)

  const addToCart = (product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: {
        ...product,
        quantity: (prev[product.id]?.quantity || 0) + 1
      }
    }))
  }

  const removeFromCart = (productId) => {
    setCart(prev => {
      const updated = { ...prev }
      if (updated[productId].quantity === 1) {
        delete updated[productId]
      } else {
        updated[productId] = {
          ...updated[productId],
          quantity: updated[productId].quantity - 1
        }
      }
      return updated
    })
  }

  const clearCart = () => setCart({})

  const cartCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = Object.values(cart).reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={
          <ProtectedRoute>
            <Menu
              cart={cart}
              cartCount={cartCount}
              cartTotal={cartTotal}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              onCartOpen={() => setCartOpen(true)}
            />
          </ProtectedRoute>
        } />
        <Route path="/my-orders" element={
          <ProtectedRoute><MyOrders /></ProtectedRoute>
        } />
      </Routes>

      {/* Cart Panel — lives outside routes so it's always available */}
      {cartOpen && (
        <CartPanel
          cart={cart}
          cartTotal={cartTotal}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          onClose={() => setCartOpen(false)}
          clearCart={clearCart}
        />
      )}
    </BrowserRouter>
  )
}

export default App