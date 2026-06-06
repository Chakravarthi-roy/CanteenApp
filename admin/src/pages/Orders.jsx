import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import API from '../api/axios'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const wsRef = useRef(null)

  // Fetch existing pending orders on load
  useEffect(() => {
    fetchOrders()
    connectWebSocket()
    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await API.get('/orders/')
      setOrders(response.data)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const connectWebSocket = () => {
    const token = localStorage.getItem('token')
    const ws = new WebSocket(`ws://localhost:8000/orders/ws`)
    wsRef.current = ws

    ws.onopen = () => console.log('WebSocket connected!')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.event === 'new_order') {
        // Fetch fresh order from API to get full details
        fetchNewOrder(data.order_id)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected! Reconnecting in 3s...')
      setTimeout(connectWebSocket, 3000)
    }
  }

  const fetchNewOrder = async (orderId) => {
    try {
      const response = await API.get(`/orders/${orderId}`)
      setOrders(prev => [response.data, ...prev])
    } catch (err) {
      console.error('Failed to fetch new order:', err)
    }
  }

  const handlePrepared = async (orderId) => {
    try {
      await API.patch(`/orders/${orderId}`, { prep_status: 'ready' })
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, prep_status: 'ready' } : order
      ))
    } catch (err) {
      console.error('Failed to update order:', err)
      alert('Failed to mark as prepared. Please try again.')
    }
  }

  const handleDelivered = async (orderId) => {
    try {
      await API.patch(`/orders/${orderId}`, { prep_status: 'ready', delivery_status: 'delivered' })
      setOrders(prev => prev.filter(order => order.id !== orderId))
    } catch (err) {
      console.error('Failed to update order:', err)
      alert('Failed to mark as delivered. Please try again.')
    }
  }

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    try {
      await API.patch(`/orders/${orderId}/cancel`)
      setOrders(prev => prev.filter(order => order.id !== orderId))
    } catch (err) {
      console.error('Failed to cancel order:', err)
      alert('Failed to cancel order. Please try again.')
    }
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Active Orders</h2>
          <span style={styles.badge}>{orders.length} pending</span>
        </div>

        {loading ? (
          <p style={styles.message}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p style={styles.message}>No active orders right now! 🎉</p>
        ) : (
          <div style={styles.grid}>
            {orders.map(order => (
              <div key={order.id} style={styles.card}>
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <span style={styles.orderId}>Order #{order.id}</span>
                  <span style={styles.orderTime}>
                    {new Date(order.order_time).toLocaleTimeString()}
                  </span>
                </div>

                {/* User */}
                <p style={styles.userName}>
                  👤 {order.user?.full_name || order.user?.username || 'Unknown'}
                </p>

                {/* Items */}
                <div style={styles.itemsList}>
                  {order.order_items.map(item => (
                    <div key={item.id} style={styles.item}>
                      <span>{item.product_name}</span>
                      <span style={styles.quantity}>x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div style={styles.total}>
                  Total: <strong>₹{parseFloat(order.total_amount).toFixed(2)}</strong>
                </div>

                {/* Status */}
                <div style={styles.status}>
                  <span style={order.prep_status === 'ready' ? styles.statusReady : styles.statusPending}>
                    {order.prep_status === 'ready' ? '✅ Prepared' : '⏳ Pending'}
                  </span>
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                  {order.prep_status === 'pending' && (
                    <>
                      <button
                        style={styles.cancelBtn}
                        onClick={() => handleCancel(order.id)}
                      >
                        Cancel
                      </button>
                      <button
                        style={styles.preparedBtn}
                        onClick={() => handlePrepared(order.id)}
                      >
                        Prepared ✓
                      </button>
                    </>
                  )}
                  {order.prep_status === 'ready' && (
                    <button
                      style={styles.deliveredBtn}
                      onClick={() => handleDelivered(order.id)}
                    >
                      Delivered ✓
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    color: '#0d47a1'
  },
  badge: {
    backgroundColor: '#2196f3',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  message: {
    textAlign: 'center',
    color: '#888',
    marginTop: '60px',
    fontSize: '18px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    borderTop: '4px solid #2196f3',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderId: {
    fontWeight: 'bold',
    color: '#1565c0',
    fontSize: '16px'
  },
  orderTime: {
    color: '#888',
    fontSize: '13px'
  },
  userName: {
    color: '#333',
    fontSize: '15px'
  },
  itemsList: {
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    padding: '10px'
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    fontSize: '14px',
    borderBottom: '1px solid #bbdefb'
  },
  quantity: {
    color: '#1976d2',
    fontWeight: 'bold'
  },
  total: {
    fontSize: '16px',
    color: '#333'
  },
  status: {
    display: 'flex',
    alignItems: 'center'
  },
  statusPending: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '13px'
  },
  statusReady: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '13px'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  preparedBtn: {
    flex: 2,
    padding: '10px',
    backgroundColor: '#1e88e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  deliveredBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#0d47a1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold'
  }
}

export default Orders