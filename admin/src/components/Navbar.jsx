import { useNavigate, useLocation } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div style={styles.navbar}>
      <span style={styles.brand}>🍽️ Canteen</span>
      <div style={styles.links}>
        <button
          style={location.pathname === '/orders' ? styles.activeLink : styles.link}
          onClick={() => navigate('/orders')}
        >
          Orders
        </button>
        <button
          style={location.pathname === '/products' ? styles.activeLink : styles.link}
          onClick={() => navigate('/products')}
        >
          Products
        </button>
        <button
          style={location.pathname === '/previous-orders' ? styles.activeLink : styles.link}
          onClick={() => navigate('/previous-orders')}
        >
          Previous Orders
        </button>
      </div>
      <button style={styles.logout} onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}

const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '60px',
    backgroundColor: '#1565c0',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  brand: {
    fontSize: '20px',
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  links: {
    display: 'flex',
    gap: '8px'
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#bbdefb',
    fontSize: '15px',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '6px'
  },
  activeLink: {
    backgroundColor: '#2196f3',
    border: 'none',
    color: 'white',
    fontSize: '15px',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: 'bold'
  },
  logout: {
    backgroundColor: '#c0392b',
    border: 'none',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '6px'
  }
}

export default Navbar