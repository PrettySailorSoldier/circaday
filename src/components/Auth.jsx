import { useState } from 'react'
import { motion } from 'framer-motion'
import { account, ID_GEN } from '../lib/appwrite'

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await account.create(ID_GEN.unique(), email, password)
      }
      
      await account.createEmailPasswordSession(email, password)
      
      if (onLogin) {
        onLogin()
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo / Title */}
        <h1 style={styles.title}>Circaday</h1>
        <p style={styles.subtitle}>
          Your personalized productivity rhythm
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={styles.input}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <motion.button
            type="submit"
            style={styles.button}
            disabled={loading || !email || !password}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Thinking...' : (isSignUp ? 'Create Account' : 'Log In')}
          </motion.button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            style={styles.backButton}
          >
            {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
          </button>
        </form>
      </motion.div>

      {/* Background glow */}
      <div style={styles.bgGlow} />
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-base)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    position: 'relative',
    overflow: 'hidden'
  },
  content: {
    width: '100%',
    maxWidth: '340px',
    zIndex: 1
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: '32px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    textAlign: 'center',
    marginBottom: '8px'
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginBottom: '48px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    color: 'var(--text-primary)',
    transition: 'border-color 0.2s ease'
  },
  button: {
    width: '100%',
    padding: '16px',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    borderRadius: '10px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.2s ease'
  },
  backButton: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center'
  },
  error: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: '#e57373',
    textAlign: 'center',
    margin: 0
  },
  otpMessage: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    lineHeight: '1.5'
  },
  bgGlow: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(139, 127, 212, 0.08) 0%, transparent 60%)',
    filter: 'blur(80px)',
    pointerEvents: 'none'
  }
}
