import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import API from '../api/axios'

function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyOrders()
  }, [])

  const fetchMyOrders = async () => {
    try {
      const response = await API.get('/orders/my-orders')
      setOrders(response.data)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (prepStatus, deliveryStatus) => {
    if (prepStatus === 'cancelled') return { bg: '#fff0ee', color: '#c0392b', text: 'Cancelled' }
    if (deliveryStatus === 'delivered') return { bg: '#e8f8f5', color: '#00b894', text: 'Delivered' }
    if (prepStatus === 'ready') return { bg: '#fff8e1', color: '#f39c12', text: 'Ready for Pickup' }
    if (prepStatus === 'preparing') return { bg: '#e8f4fd', color: '#0081a7', text: 'Preparing' }
    return { bg: '#fff8f0', color: '#ff6b35', text: 'Pending' }
  }

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Header */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <h1 style={styles.heroTitle}>My Orders</h1>
          <p style={styles.heroSubtitle}>Track all your orders here</p>
        </div>
        <div style={styles.heroBubble1} />
        <div style={styles.heroBubble2} />
      </div>

      <div style={styles.container}>
        {loading ? (
          <p style={styles.centerMsg}>Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div style={styles.emptyBox}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p style={styles.emptyTitle}>No orders yet!</p>
            <p style={styles.emptySubtitle}>Go to the menu and place your first order</p>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {orders.map(order => {
              const status = getStatusColor(order.prep_status, order.delivery_status)
              return (
                <div key={order.id} style={styles.orderCard}>
                  {/* Card header */}
                  <div style={styles.cardHeader}>
                    <div>
                      <span style={styles.orderId}>Order #{order.id}</span>
                      <p style={styles.orderTime}>
                        {new Date(order.order_time).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: status.bg,
                      color: status.color
                    }}>
                      {status.text}
                    </span>
                  </div>

                  {/* Items */}
                  <div style={styles.itemsList}>
                    {order.order_items.map((item, index) => (
                      <div key={index} style={styles.item}>
                        <div style={styles.itemLeft}>
                          <div style={{
                            ...styles.itemDot,
                            backgroundColor: getCategoryColor(item.product_related?.category || '')
                          }} />
                          <span style={styles.itemName}>
                            {item.product_name || item.product_related?.product_name}
                          </span>
                        </div>
                        <div style={styles.itemRight}>
                          <span style={styles.itemQty}>x{item.quantity}</span>
                          <span style={styles.itemPrice}>
                            ₹{(parseFloat(item.price_at_order) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={styles.cardFooter}>
                    <div style={styles.progressBar}>
                      <div style={{
                        ...styles.progressStep,
                        backgroundColor: '#ff6b35'
                      }}>
                        <div style={styles.progressDot} />
                        <span style={styles.progressLabel}>Placed</span>
                      </div>
                      <div style={{
                        ...styles.progressLine,
                        backgroundColor: order.prep_status !== 'pending' && order.prep_status !== 'cancelled' ? '#ff6b35' : '#eee'
                      }} />
                      <div style={{
                        ...styles.progressStep,
                        opacity: order.prep_status === 'cancelled' ? 0.3 : 1
                      }}>
                        <div style={{
                          ...styles.progressDot,
                          backgroundColor: order.prep_status === 'ready' || order.delivery_status === 'delivered' ? '#ff6b35' : '#eee'
                        }} />
                        <span style={styles.progressLabel}>Ready</span>
                      </div>
                      <div style={{
                        ...styles.progressLine,
                        backgroundColor: order.delivery_status === 'delivered' ? '#ff6b35' : '#eee'
                      }} />
                      <div style={{
                        ...styles.progressStep,
                        opacity: order.prep_status === 'cancelled' ? 0.3 : 1
                      }}>
                        <div style={{
                          ...styles.progressDot,
                          backgroundColor: order.delivery_status === 'delivered' ? '#00b894' : '#eee'
                        }} />
                        <span style={styles.progressLabel}>Delivered</span>
                      </div>
                    </div>
                    <span style={styles.totalAmount}>
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
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
  page: {
    minHeight: '100vh',
    backgroundColor: '#fff8f0',
    fontFamily: "'Segoe UI', sans-serif",
    paddingBottom: '40px'
  },
  hero: {
    background: 'linear-gradient(135deg, #004e89 0%, #1a659e 60%, #00afb9 100%)',
    padding: '36px 24px 48px',
    position: 'relative',
    overflow: 'hidden'
  },
  heroInner: {
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2
  },
  heroTitle: {
    color: 'white',
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '8px'
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '15px'
  },
  heroBubble1: {
    position: 'absolute', width: '250px', height: '250px',
    borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
    top: '-80px', right: '-60px'
  },
  heroBubble2: {
    position: 'absolute', width: '150px', height: '150px',
    borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
    bottom: '-50px', left: '10%'
  },
  container: {
    maxWidth: '700px',
    margin: '-20px auto 0',
    padding: '0 20px',
    position: 'relative',
    zIndex: 3
  },
  centerMsg: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: '18px',
    padding: '60px'
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '80px 20px',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#333'
  },
  emptySubtitle: {
    fontSize: '14px',
    color: '#aaa'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  orderId: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1a1a2e'
  },
  orderTime: {
    fontSize: '12px',
    color: '#aaa',
    marginTop: '4px'
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '50px',
    fontSize: '12px',
    fontWeight: '700'
  },
  itemsList: {
    backgroundColor: '#fff8f0',
    borderRadius: '12px',
    padding: '12px'
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #ffe0cc'
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  itemDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  itemQty: {
    fontSize: '13px',
    color: '#aaa'
  },
  itemPrice: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ff6b35'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0'
  },
  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  progressDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#eee'
  },
  progressLine: {
    width: '40px',
    height: '2px',
    backgroundColor: '#eee',
    marginBottom: '16px'
  },
  progressLabel: {
    fontSize: '10px',
    color: '#aaa',
    fontWeight: '600'
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#ff6b35'
  }
}

export default MyOrders