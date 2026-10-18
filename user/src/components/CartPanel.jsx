import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

function CartPanel({ cart, cartTotal, addToCart, removeFromCart, onClose, clearCart }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const items = Object.values(cart)

  const handlePlaceOrder = async () => {
    if (items.length === 0) return
    setLoading(true)
    setError('')
    try {
      const meRes = await API.get('/auth/me')
      await API.post('/orders/', {
        user_id: meRes.data.id,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      })
      setSuccess(true)
      clearCart()
      setTimeout(() => {
        onClose()
        navigate('/my-orders')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place order!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div style={styles.overlay} onClick={onClose} />

      {/* Panel */}
      <div style={styles.panel}>

        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Your Cart</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {success ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00b894" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 style={styles.successTitle}>Order Placed!</h3>
            <p style={styles.successText}>
              Your order has been placed successfully. Redirecting to My Orders...
            </p>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div style={styles.itemsList}>
              {items.length === 0 ? (
                <div style={styles.emptyCart}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  <p style={styles.emptyText}>Your cart is empty!</p>
                  <button style={styles.browseBtn} onClick={onClose}>
                    Browse Menu
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} style={styles.cartItem}>
                    <div style={{
                      ...styles.itemColorDot,
                      backgroundColor: getCategoryColor(item.category)
                    }} />
                    <div style={styles.itemInfo}>
                      <p style={styles.itemName}>{item.product_name}</p>
                      <p style={styles.itemPrice}>
                        ₹{parseFloat(item.price).toFixed(2)} each
                      </p>
                    </div>
                    <div style={styles.itemQty}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => removeFromCart(item.id)}
                      >
                        −
                      </button>
                      <span style={styles.qtyNum}>{item.quantity}</span>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => addToCart(item)}
                      >
                        +
                      </button>
                    </div>
                    <span style={styles.itemTotal}>
                      ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={styles.footer}>
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Total Amount</span>
                  <span style={styles.totalAmount}>₹{cartTotal.toFixed(2)}</span>
                </div>

                {error && (
                  <div style={styles.errorBox}>{error}</div>
                )}

                <button
                  style={styles.placeOrderBtn}
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>

                <p style={styles.note}>
                  Your order will be prepared fresh for you!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

function getCategoryColor(category) {
  const colors = {
    'Breakfast': '#ff6b35',
    'Meals': '#00afb9',
    'Snacks': '#fdcb6e',
    'Beverages': '#1a659e',
    'Desserts': '#a29bfe',
  }
  return colors[category] || '#00afb9'
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 200,
    backdropFilter: 'blur(2px)'
  },
  panel: {
    position: 'fixed',
    top: 0, right: 0,
    width: '100%',
    maxWidth: '420px',
    height: '100vh',
    backgroundColor: 'white',
    zIndex: 201,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-8px 0 40px rgba(0,0,0,0.15)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #f0f0f0'
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1a1a2e'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center'
  },
  itemsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 24px'
  },
  emptyCart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    height: '300px'
  },
  emptyText: {
    color: '#aaa',
    fontSize: '16px'
  },
  browseBtn: {
    padding: '10px 24px',
    backgroundColor: '#ff6b35',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 0',
    borderBottom: '1px solid #f8f4f0'
  },
  itemColorDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '2px'
  },
  itemPrice: {
    fontSize: '12px',
    color: '#aaa'
  },
  itemQty: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fff0e8',
    borderRadius: '50px',
    padding: '4px 8px'
  },
  qtyBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#ff6b35',
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1
  },
  qtyNum: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ff6b35',
    minWidth: '20px',
    textAlign: 'center'
  },
  itemTotal: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1a1a2e',
    minWidth: '60px',
    textAlign: 'right'
  },
  footer: {
    padding: '20px 24px',
    borderTop: '1px solid #f0f0f0',
    backgroundColor: '#fff8f0'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  totalLabel: {
    fontSize: '15px',
    color: '#555',
    fontWeight: '600'
  },
  totalAmount: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#ff6b35'
  },
  errorBox: {
    backgroundColor: '#fff0ee',
    border: '1px solid #f07167',
    color: '#c0392b',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '12px'
  },
  placeOrderBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #ff6b35, #f07167)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    marginBottom: '10px',
    boxShadow: '0 4px 15px rgba(255,107,53,0.4)'
  },
  note: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#aaa'
  },
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '40px',
    gap: '16px'
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#e8f8f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1a1a2e'
  },
  successText: {
    fontSize: '15px',
    color: '#888',
    textAlign: 'center',
    lineHeight: '1.6'
  }
}

export default CartPanel