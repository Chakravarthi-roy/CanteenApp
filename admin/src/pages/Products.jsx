import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import API from '../api/axios'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({
    product_name: '',
    price: '',
    category: '',
    description: '',
    time_req: '',
    stock_count: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const formRef = useRef(null)

  const fetchProducts = async () => {
    try {
      const response = await API.get('/products/')
      setProducts(response.data)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAvailability = async (product) => {
    try {
        await API.patch(`/products/${product.id}`, {
            is_available: !product.is_available
        })
        setProducts(prev => {
            const updated = prev.map(p =>
                p.id === product.id ? { ...p, is_available: !p.is_available } : p
            )
            return updated.sort((a, b) => {
                if (a.is_available === b.is_available) return 0
                return a.is_available ? -1 : 1
            })
        })
    } catch (err) {
        console.error('Failed to toggle availability:', err)
        alert('Failed to update availability. Please try again.')
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await API.delete(`/products/${productId}`)
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch (err) {
      console.error('Failed to delete product:', err)
      alert('Failed to delete product. Please try again.')
    }
  }

  const handleEdit = (product) => {
    setEditProduct(product)
    setForm({
      product_name: product.product_name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      time_req: product.time_req || '',
      stock_count: product.stock_count ?? ''
    })
    setShowForm(true)
    setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleAddNew = () => {
    setEditProduct(null)
    setForm({
      product_name: '',
      price: '',
      category: '',
      description: '',
      time_req: '',
      stock_count: ''
    })
    setShowForm(true)
    setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        product_name: form.product_name,
        price: parseFloat(form.price),
        category: form.category,
        description: form.description || null,
        time_req: form.time_req ? parseInt(form.time_req) : null,
        stock_count: form.stock_count ? parseInt(form.stock_count) : null
      }

      if (editProduct) {
        await API.patch(`/products/${editProduct.id}`, payload)
        setProducts(prev => {
          const updated = prev.map(p =>
            p.id === editProduct.id ? { ...p, ...payload } : p
          )
          return updated.sort((a, b) => {
            if (a.is_available === b.is_available) return 0
            return a.is_available ? -1 : 1
          })
        })
      } else {
        const response = await API.post('/products/', payload)
        setProducts(prev => {
          const updated = [response.data, ...prev]
          return updated.sort((a, b) => {
            if (a.is_available === b.is_available) return 0
            return a.is_available ? -1 : 1
          })
        })
      }
      setShowForm(false)
    } catch (err) {
      console.error('Failed to save product:', err)
      alert('Failed to save product! Check all fields.')
    }
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Products</h2>
          <button style={styles.addBtn} onClick={handleAddNew}>
            + Add Product
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div ref={formRef} style={styles.formCard}>
            <h3 style={styles.formTitle}>
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <div style={styles.formGrid}>
              <input
                style={styles.input}
                placeholder="Product Name *"
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Price *"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Category *"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Prep time (minutes)"
                type="number"
                value={form.time_req}
                onChange={(e) => setForm({ ...form, time_req: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Stock count (optional)"
                type="number"
                value={form.stock_count}
                onChange={(e) => setForm({ ...form, stock_count: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div style={styles.formActions}>
              <button
                style={styles.cancelFormBtn}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button style={styles.saveBtn} onClick={handleSubmit}>
                {editProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        )}

        {/* Products List */}
        {loading ? (
          <p style={styles.message}>Loading products...</p>
        ) : products.length === 0 ? (
          <p style={styles.message}>No products found!</p>
        ) : (
          <div style={styles.grid}>
            {products.map(product => (
              <div
                key={product.id}
                style={{
                  ...styles.card,
                  opacity: product.is_available ? 1 : 0.5
                }}
              >
                {/* Availability badge */}
                <div style={styles.cardHeader}>
                  <span style={product.is_available ? styles.available : styles.unavailable}>
                    {product.is_available ? '✅ Available' : '❌ Unavailable'}
                  </span>
                  <span style={styles.category}>{product.category}</span>
                </div>

                <h3 style={styles.productName}>{product.product_name}</h3>
                <p style={styles.price}>₹{parseFloat(product.price).toFixed(2)}</p>

                {product.description && (
                  <p style={styles.description}>{product.description}</p>
                )}

                <div style={styles.meta}>
                  {product.time_req && (
                    <span style={styles.metaItem}>⏱ {product.time_req} mins</span>
                  )}
                  {product.stock_count !== null && product.stock_count !== undefined && (
                    <span style={styles.metaItem}>📦 Stock: {product.stock_count}</span>
                  )}
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                  <button
                    style={product.is_available ? styles.toggleOffBtn : styles.toggleOnBtn}
                    onClick={() => handleToggleAvailability(product)}
                  >
                    {product.is_available ? 'Turn Off' : 'Turn On'}
                  </button>
                  <button
                    style={styles.editBtn}
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    color: '#0d47a1'
  },
  addBtn: {
    backgroundColor: '#1e88e5',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    borderTop: '4px solid #1976d2'
  },
  formTitle: {
    color: '#0d47a1',
    marginBottom: '16px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #bbdefb',
    fontSize: '14px',
    outline: 'none',
    width: '100%'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelFormBtn: {
    padding: '10px 20px',
    backgroundColor: '#eee',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px'
  },
  saveBtn: {
    padding: '10px 24px',
    backgroundColor: '#1565c0',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    borderTop: '4px solid #1976d2',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  available: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  unavailable: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  category: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  productName: {
    fontSize: '18px',
    color: '#0d47a1',
    fontWeight: 'bold'
  },
  price: {
    fontSize: '20px',
    color: '#1976d2',
    fontWeight: 'bold'
  },
  description: {
    fontSize: '13px',
    color: '#777'
  },
  meta: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  metaItem: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  },
  toggleOffBtn: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  toggleOnBtn: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  editBtn: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#1e88e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  deleteBtn: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold'
  }
}

export default Products