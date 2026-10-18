import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill in all fields!')
      return
    }
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)
      const response = await API.post('/auth/user-login', formData)
      localStorage.setItem('user_token', response.data.access_token)
      navigate('/menu')
    } catch (err) {
      setError('Invalid username or password!')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div style={styles.page}>
      {/* Left side */}
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <h1 style={styles.brandName}>Canteen</h1>
          <p style={styles.tagline}>Fresh food, fast orders,<br />happy you!</p>
          <div style={styles.decorCircle1} />
          <div style={styles.decorCircle2} />
          <div style={styles.decorCircle3} />
        </div>
      </div>

      {/* Right side */}
      <div style={styles.right}>
        <div style={styles.formCard}>
          <h2 style={styles.title}>Welcome back!</h2>
          <p style={styles.subtitle}>Login to order your favourite food</p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                style={styles.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                style={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <button
            style={styles.loginBtn}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p style={styles.registerText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.registerLink}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', sans-serif"
  },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #004e89 0%, #00afb9 60%, #f07167 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  leftContent: {
    textAlign: 'center',
    zIndex: 2,
    position: 'relative',
    padding: '40px'
  },
  brandName: {
    fontSize: '52px',
    fontWeight: '800',
    color: 'white',
    letterSpacing: '2px',
    marginBottom: '16px'
  },
  tagline: {
    fontSize: '20px',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: '1.6'
  },
  decorCircle1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    top: '-80px',
    right: '-80px'
  },
  decorCircle2: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    bottom: '-60px',
    left: '-60px'
  },
  decorCircle3: {
    position: 'absolute',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'rgba(240,113,103,0.3)',
    bottom: '80px',
    right: '40px'
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdfcdc',
    padding: '40px 24px'
  },
  formCard: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#004e89',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '15px',
    color: '#888',
    marginBottom: '32px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '2px solid #fed9b7',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: '#fffef8'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  errorBox: {
    backgroundColor: '#fff0ee',
    border: '1px solid #f07167',
    color: '#c0392b',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '16px'
  },
  loginBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #00afb9, #0081a7)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '20px',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 15px rgba(0,175,185,0.4)'
  },
  registerText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#888'
  },
  registerLink: {
    color: '#ff6b35',
    fontWeight: '600',
    textDecoration: 'none'
  }
}

export default Login