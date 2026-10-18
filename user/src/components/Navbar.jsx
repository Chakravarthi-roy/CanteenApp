import { useNavigate, useLocation } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('user_token')
    navigate('/')
  }

  return (
    <div style={styles.navbar}>
      <span style={styles.brand} onClick={() => navigate('/menu')}>
        Canteen
      </span>
      <div style={styles.links}>
        <button
          style={location.pathname === '/menu' ? styles.activeLink : styles.link}
          onClick={() => navigate('/menu')}
        >
          Menu
        </button>
        <button
          style={location.pathname === '/my-orders' ? styles.activeLink : styles.link}
          onClick={() => navigate('/my-orders')}
        >
          My Orders
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
    backgroundColor: 'white',
    borderBottom: '1px solid #ffe0cc',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(255,107,53,0.1)'
  },
  brand: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#ff6b35',
    cursor: 'pointer',
    letterSpacing: '1px'
  },
  links: {
    display: 'flex',
    gap: '4px'
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '15px',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '500'
  },
  activeLink: {
    backgroundColor: '#fff0e8',
    border: 'none',
    color: '#ff6b35',
    fontSize: '15px',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '700'
  },
  logout: {
    backgroundColor: 'transparent',
    border: '1.5px solid #ffe0cc',
    color: '#888',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '7px 16px',
    borderRadius: '8px',
    fontWeight: '500'
  }
}

export default Navbar