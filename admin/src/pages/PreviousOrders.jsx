import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import API from '../api/axios'

function PreviousOrders() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [activeTab, setActiveTab] = useState('delivered')
  const [deliveredOrders, setDeliveredOrders] = useState([])
  const [cancelledOrders, setCancelledOrders] = useState([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalCancelled, setTotalCancelled] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load all orders on page open
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async (start = null, end = null) => {
    setLoading(true)
    try {
      let historyUrl = '/orders/history'
      let cancelledUrl = '/orders/cancelled'

      if (start && end) {
        historyUrl += `?start_date=${start}&end_date=${end}`
        cancelledUrl += `?start_date=${start}&end_date=${end}`
      }

      const [deliveredRes, cancelledRes] = await Promise.all([
        API.get(historyUrl),
        API.get(cancelledUrl)
      ])

      setDeliveredOrders(deliveredRes.data.orders)
      setTotalIncome(deliveredRes.data.total_income)
      setCancelledOrders(cancelledRes.data.orders)
      setTotalCancelled(cancelledRes.data.total_cancelled)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end date!')
      return
    }
    if (startDate > endDate) {
      alert('Start date cannot be after end date!')
      return
    }
    fetchOrders(startDate, endDate)
  }

  const handleClear = () => {
    setStartDate('')
    setEndDate('')
    fetchOrders()
  }

  // Group orders by date
  const groupByDate = (orders) => {
    const groups = {}
    orders.forEach(order => {
      const date = new Date(order.order_time).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      if (!groups[date]) groups[date] = []
      groups[date].push(order)
    })
    return groups
  }

  const deliveredGroups = groupByDate(deliveredOrders)
  const cancelledGroups = groupByDate(cancelledOrders)

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>Previous Orders</h2>

        {/* Date Picker */}
        <div style={styles.dateCard}>
          <div style={styles.dateRow}>
            <div style={styles.dateField}>
              <label style={styles.label}>From</label>
              <input
                type="date"
                style={styles.dateInput}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div style={styles.dateField}>
              <label style={styles.label}>To</label>
              <input
                type="date"
                style={styles.dateInput}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div style={styles.btnGroup}>
              <button style={styles.searchBtn} onClick={handleSearch}>
                Search
              </button>
              <button style={styles.clearBtn} onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={activeTab === 'delivered' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('delivered')}
          >
            ✅ Delivered ({deliveredOrders.length})
          </button>
          <button
            style={activeTab === 'cancelled' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('cancelled')}
          >
            ❌ Cancelled ({cancelledOrders.length})
          </button>
        </div>

        {loading ? (
          <p style={styles.message}>Loading orders...</p>
        ) : (
          <>
            {/* Delivered Tab */}
            {activeTab === 'delivered' && (
              <>
                <div style={styles.incomeCard}>
                  <span style={styles.incomeLabel}>Total Income</span>
                  <span style={styles.incomeAmount}>
                    ₹{parseFloat(totalIncome).toFixed(2)}
                  </span>
                  <span style={styles.incomeOrders}>
                    {deliveredOrders.length} orders
                  </span>
                </div>

                {deliveredOrders.length === 0 ? (
                  <p style={styles.message}>No delivered orders found!</p>
                ) : (
                  Object.entries(deliveredGroups).map(([date, orders]) => (
                    <div key={date} style={styles.dateGroup}>
                      <div style={styles.dateHeader}>
                        <span style={styles.dateLabel}>{date}</span>
                        <span style={styles.dateBadge}>
                          {orders.length} orders — ₹{orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0).toFixed(2)}
                        </span>
                      </div>
                      <div style={styles.ordersList}>
                        {orders.map(order => (
                          <OrderCard key={order.id} order={order} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* Cancelled Tab */}
            {activeTab === 'cancelled' && (
              <>
                <div style={styles.cancelledSummary}>
                  <span style={styles.cancelledLabel}>
                    {totalCancelled} orders cancelled
                  </span>
                </div>

                {cancelledOrders.length === 0 ? (
                  <p style={styles.message}>No cancelled orders found!</p>
                ) : (
                  Object.entries(cancelledGroups).map(([date, orders]) => (
                    <div key={date} style={styles.dateGroup}>
                      <div style={styles.dateHeader}>
                        <span style={styles.dateLabel}>{date}</span>
                        <span style={styles.dateBadge}>{orders.length} cancelled</span>
                      </div>
                      <div style={styles.ordersList}>
                        {orders.map(order => (
                          <OrderCard key={order.id} order={order} cancelled />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Reusable order card component
function OrderCard({ order, cancelled }) {
  return (
    <div style={{
      ...cardStyles.card,
      borderTop: cancelled ? '4px solid #c0392b' : '4px solid #1976d2'
    }}>
      <div style={cardStyles.header}>
        <span style={cardStyles.orderId}>Order #{order.id}</span>
        <span style={cardStyles.time}>
          {new Date(order.order_time).toLocaleTimeString()}
        </span>
      </div>
      <p style={cardStyles.user}>👤 {order.user}</p>
      <div style={cardStyles.itemsList}>
        {order.items.map((item, index) => (
          <div key={index} style={cardStyles.item}>
            <span>{item.product}</span>
            <span style={cardStyles.itemRight}>
              x{item.quantity} — ₹{parseFloat(item.price_at_order).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div style={cardStyles.total}>
        Total: <strong>₹{parseFloat(order.total_amount).toFixed(2)}</strong>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
  title: { fontSize: '24px', color: '#0d47a1', marginBottom: '24px' },
  dateCard: {
    backgroundColor: 'white', borderRadius: '12px', padding: '20px',
    marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  dateRow: { display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' },
  dateField: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  label: { fontSize: '13px', color: '#555', fontWeight: 'bold' },
  dateInput: {
    padding: '10px 12px', borderRadius: '8px', border: '1px solid #bbdefb',
    fontSize: '14px', outline: 'none', width: '100%'
  },
  btnGroup: { display: 'flex', gap: '8px', alignItems: 'flex-end' },
  searchBtn: {
    padding: '10px 24px', backgroundColor: '#1565c0', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', height: '42px'
  },
  clearBtn: {
    padding: '10px 16px', backgroundColor: '#eee', color: '#333',
    border: 'none', borderRadius: '8px', fontSize: '14px', height: '42px'
  },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
  tab: {
    padding: '10px 24px', backgroundColor: 'white', color: '#1565c0',
    border: '2px solid #bbdefb', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold'
  },
  activeTab: {
    padding: '10px 24px', backgroundColor: '#1565c0', color: 'white',
    border: '2px solid #1565c0', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold'
  },
  incomeCard: {
    backgroundColor: '#0d47a1', borderRadius: '12px', padding: '20px 24px',
    marginBottom: '20px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
  },
  incomeLabel: { color: '#bbdefb', fontSize: '16px' },
  incomeAmount: { color: 'white', fontSize: '32px', fontWeight: 'bold' },
  incomeOrders: { color: '#90caf9', fontSize: '14px' },
  cancelledSummary: {
    backgroundColor: '#ffebee', borderRadius: '12px',
    padding: '16px 24px', marginBottom: '20px'
  },
  cancelledLabel: { color: '#c62828', fontSize: '15px', fontWeight: 'bold' },
  dateGroup: { marginBottom: '28px' },
  dateHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #bbdefb'
  },
  dateLabel: { fontSize: '16px', fontWeight: 'bold', color: '#0d47a1' },
  dateBadge: {
    backgroundColor: '#e3f2fd', color: '#1565c0', padding: '4px 12px',
    borderRadius: '20px', fontSize: '13px', fontWeight: 'bold'
  },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  message: { textAlign: 'center', color: '#888', marginTop: '60px', fontSize: '18px' }
}

const cardStyles = {
  card: {
    backgroundColor: 'white', borderRadius: '12px', padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex',
    flexDirection: 'column', gap: '8px'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontWeight: 'bold', color: '#1565c0', fontSize: '15px' },
  time: { color: '#888', fontSize: '13px' },
  user: { color: '#333', fontSize: '14px' },
  itemsList: { backgroundColor: '#e3f2fd', borderRadius: '8px', padding: '8px' },
  item: {
    display: 'flex', justifyContent: 'space-between', padding: '3px 0',
    fontSize: '13px', borderBottom: '1px solid #bbdefb'
  },
  itemRight: { color: '#1976d2', fontWeight: 'bold' },
  total: { fontSize: '15px', color: '#333' }
}

export default PreviousOrders