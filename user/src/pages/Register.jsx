import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'

function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    full_name: '',
    hostel_no: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) {
      setError('Please fill in all required fields!')
      return
    }
    setLoading(true)
    setError('')
    try {
      await API.post('/user/', {
        username: form.username,
        email: form.email,
        full_name: form.full_name || null,
        hostel_no: form.hostel_no ? parseInt(form.hostel_no) : null,
        password: form.password
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <h1 style={styles.brandName}>Join Us!</h1>
          <p style={styles.tagline}>Order your favourite canteen food from anywhere on campus!</p>
          <div style={styles.decorCircle1} />
          <div style={styles.decorCircle2} />
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formCard}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Fill in your details to get started</p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username *</label>
            <input
              style={styles.input}
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email *</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="Your college email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              name="full_name"
              placeholder="Your full name"
              value={form.full_name}
              onChange={handleChange}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Hostel Number</label>
            <input
              style={styles.input}
              type="number"
              name="hostel_no"
              placeholder="Your hostel number (1-20)"
              value={form.hostel_no}
              onChange={handleChange}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password *</label>
            <div style={styles.passwordWrapper}>
              <input
                style={styles.input}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit"
                value={form.password}
                onChange={handleChange}
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
            style={styles.registerBtn}
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p style={styles.loginText}>
            Already have an account?{' '}
            <Link to="/" style={styles.loginLink}>
              Login here
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
    background: 'linear-gradient(135deg, #ff6b35 0%, #f07167 50%, #00afb9 100%)',
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
    marginBottom: '16px'
  },
  tagline: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: '1.7'
  },
  decorCircle1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.07)',
    top: '-80px',
    right: '-80px'
  },
  decorCircle2: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.07)',
    bottom: '-60px',
    left: '-60px'
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdfcdc',
    padding: '40px 24px',
    overflowY: 'auto'
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
    marginBottom: '28px'
  },
  inputGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '2px solid #fed9b7',
    fontSize: '14px',
    outline: 'none',
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
  registerBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #ff6b35, #f07167)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(255,107,53,0.4)'
  },
  loginText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#888'
  },
  loginLink: {
    color: '#00afb9',
    fontWeight: '600',
    textDecoration: 'none'
  }
}

export default Register