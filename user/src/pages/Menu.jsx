import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import API from '../api/axios'

function Menu({ cart, cartCount, cartTotal, addToCart, removeFromCart, onCartOpen }) {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProducts() }, [])
  useEffect(() => { filterProducts() }, [products, selectedCategory, search])

  const fetchProducts = async () => {
    try {
      const response = await API.get('/products/')
      const available = response.data.filter(p => p.is_available)
      setProducts(available)
      const cats = ['All', ...new Set(available.map(p => p.category))]
      setCategories(cats)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let result = products
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory)
    }
    if (search) {
      result = result.filter(p =>
        p.product_name.toLowerCase().includes(search.toLowerCase())
      )
    }
    setFiltered(result)
  }

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.heroGreeting}>Good day!</p>
          <h1 style={styles.heroTitle}>What would you like<br />to eat today?</h1>
          <div style={styles.searchBox}>
            <svg style={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Search dosa, samosa, tea..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div style={styles.heroBubble1} />
        <div style={styles.heroBubble2} />
        <div style={styles.heroBubble3} />
      </div>

      <div style={styles.body}>
        {/* Categories */}
        <div style={styles.categoriesScroll}>
          {categories.map(cat => (
            <button
              key={cat}
              style={selectedCategory === cat ? styles.catActive : styles.catPill}
              onClick={() => setSelectedCategory(cat)}
            >
              {getCategoryIcon(cat)} {cat}
            </button>
          ))}
        </div>

        {/* Section title */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'All Items' : selectedCategory}
          </h2>
          <span style={styles.sectionCount}>{filtered.length} items</span>
        </div>

        {/* Grid */}
        {loading ? (
          <p style={styles.centerMsg}>Loading menu...</p>
        ) : filtered.length === 0 ? (
          <p style={styles.centerMsg}>No items found!</p>
        ) : (
          <div style={styles.grid}>
            {filtered.map(product => (
              <div key={product.id} style={styles.card}>
                <div style={{
                  ...styles.colorStrip,
                  background: getCategoryGradient(product.category)
                }}>
                  <span style={styles.categoryBadge}>{product.category}</span>
                  {product.time_req && (
                    <span style={styles.timeBadge}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {product.time_req}m
                    </span>
                  )}
                </div>

                <div style={styles.cardContent}>
                  <h3 style={styles.productName}>{product.product_name}</h3>
                  {product.description && (
                    <p style={styles.productDesc}>{product.description}</p>
                  )}

                  <div style={styles.cardBottom}>
                    <span style={styles.price}>₹{parseFloat(product.price).toFixed(2)}</span>

                    {cart[product.id] ? (
                      <div style={styles.qtyControl}>
                        <button style={styles.qtyMinus} onClick={() => removeFromCart(product.id)}>−</button>
                        <span style={styles.qtyNum}>{cart[product.id].quantity}</span>
                        <button style={styles.qtyPlus} onClick={() => addToCart(product)}>+</button>
                      </div>
                    ) : (
                      <button style={styles.addBtn} onClick={() => addToCart(product)}>
                        + ADD
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart bar */}
      {cartCount > 0 && (
        <div style={styles.cartBar} onClick={onCartOpen}>
          <div style={styles.cartLeft}>
            <div style={styles.cartBadge}>{cartCount}</div>
            <span style={styles.cartLabel}>View Cart</span>
          </div>
          <div style={styles.cartRight}>
            <span style={styles.cartTotal}>₹{cartTotal.toFixed(2)}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

function getCategoryIcon(cat) {
  const icons = {
    'All': '🍽', 'Breakfast': '🌅', 'Meals': '🍱',
    'Snacks': '🍟', 'Beverages': '☕', 'Desserts': '🍮'
  }
  return icons[cat] || '🍴'
}

function getCategoryGradient(cat) {
  const gradients = {
    'Breakfast': 'linear-gradient(135deg, #ff6b35, #f7c59f)',
    'Meals': 'linear-gradient(135deg, #00afb9, #0081a7)',
    'Snacks': 'linear-gradient(135deg, #fdcb6e, #e17055)',
    'Beverages': 'linear-gradient(135deg, #1a659e, #004e89)',
    'Desserts': 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
  }
  return gradients[cat] || 'linear-gradient(135deg, #00afb9, #004e89)'
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#fff8f0',
    fontFamily: "'Segoe UI', sans-serif",
    paddingBottom: '100px'
  },
  hero: {
    background: 'linear-gradient(135deg, #ff6b35 0%, #f07167 50%, #fed9b7 100%)',
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
  heroGreeting: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '6px',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  heroTitle: {
    color: 'white',
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '24px',
    lineHeight: '1.25',
    letterSpacing: '-0.5px'
  },
  searchBox: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: '14px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px'
  },
  searchInput: {
    width: '100%',
    padding: '16px 16px 16px 46px',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    outline: 'none',
    backgroundColor: 'transparent',
    color: '#333',
    boxSizing: 'border-box'
  },
  heroBubble1: {
    position: 'absolute', width: '300px', height: '300px',
    borderRadius: '50%', background: 'rgba(255,255,255,0.07)',
    top: '-120px', right: '-80px'
  },
  heroBubble2: {
    position: 'absolute', width: '180px', height: '180px',
    borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
    bottom: '-60px', left: '10%'
  },
  heroBubble3: {
    position: 'absolute', width: '100px', height: '100px',
    borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
    top: '20px', left: '5%'
  },
  body: {
    maxWidth: '1100px',
    margin: '-20px auto 0',
    padding: '0 20px',
    position: 'relative',
    zIndex: 3
  },
  categoriesScroll: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '4px',
    marginBottom: '24px',
    scrollbarWidth: 'none',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '14px 16px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)'
  },
  catPill: {
    padding: '8px 18px',
    borderRadius: '50px',
    border: '1.5px solid #ffe0cc',
    backgroundColor: 'white',
    color: '#666',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    cursor: 'pointer'
  },
  catActive: {
    padding: '8px 18px',
    borderRadius: '50px',
    border: '1.5px solid #ff6b35',
    backgroundColor: '#ff6b35',
    color: 'white',
    fontSize: '13px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(255,107,53,0.35)'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1a1a2e'
  },
  sectionCount: {
    fontSize: '13px',
    color: '#aaa',
    fontWeight: '600'
  },
  centerMsg: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: '18px',
    padding: '60px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '18px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)'
  },
  colorStrip: {
    height: '80px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: '10px 14px'
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: '700'
  },
  timeBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  cardContent: {
    padding: '14px 16px 16px'
  },
  productName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '4px'
  },
  productDesc: {
    fontSize: '12px',
    color: '#aaa',
    marginBottom: '12px',
    lineHeight: '1.5'
  },
  cardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#ff6b35'
  },
  addBtn: {
    padding: '7px 18px',
    backgroundColor: 'white',
    color: '#ff6b35',
    border: '2px solid #ff6b35',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer'
  },
  qtyControl: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ff6b35',
    borderRadius: '50px',
    overflow: 'hidden'
  },
  qtyMinus: {
    width: '32px', height: '32px', border: 'none',
    backgroundColor: 'transparent', color: 'white',
    fontSize: '20px', fontWeight: '700', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  qtyNum: {
    minWidth: '28px', textAlign: 'center',
    fontSize: '14px', fontWeight: '800', color: 'white'
  },
  qtyPlus: {
    width: '32px', height: '32px', border: 'none',
    backgroundColor: 'transparent', color: 'white',
    fontSize: '20px', fontWeight: '700', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  cartBar: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #ff6b35, #f07167)',
    color: 'white',
    padding: '14px 20px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 'calc(100% - 40px)',
    maxWidth: '480px',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(255,107,53,0.5)',
    zIndex: 100
  },
  cartLeft: {
    display: 'flex', alignItems: 'center', gap: '12px'
  },
  cartBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    color: 'white', width: '28px', height: '28px',
    borderRadius: '8px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '800'
  },
  cartLabel: { fontSize: '15px', fontWeight: '700' },
  cartRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  cartTotal: { fontSize: '16px', fontWeight: '800' }
}

export default Menu