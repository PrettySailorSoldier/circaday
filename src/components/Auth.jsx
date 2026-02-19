import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { account, ID_GEN } from '../lib/appwrite'

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // New State variables
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [passStrength, setPassStrength] = useState({ score: 0, label: 'Weak', color: '#e57373' })
  const [validationErrors, setValidationErrors] = useState({ email: '', password: '' })

  // Validate Email Regex
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Calculate Password Strength
  useEffect(() => {
    if (!password) {
      setPassStrength({ score: 0, label: 'Weak', color: '#e57373' })
      return
    }

    let score = 0
    if (password.length >= 8) score++
    if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password) && /[A-Z]/.test(password)) score++

    if (score === 0) setPassStrength({ score: 1, label: 'Weak', color: '#e57373' })
    else if (score === 1 || score === 2) setPassStrength({ score: 2, label: 'Medium', color: '#fdd835' })
    else setPassStrength({ score: 3, label: 'Strong', color: '#81c784' })

  }, [password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Reset Validation Errors
    setValidationErrors({ email: '', password: '' })
    
    // Validate Inputs
    let hasError = false
    const newErrors = { email: '', password: '' }

    if (!email || !isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email'
      hasError = true
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      hasError = true
    }

    if (hasError) {
      setValidationErrors(newErrors)
      return
    }

    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await account.create(ID_GEN.unique(), email, password)
      }
      
      // Note: Appwrite Web SDK sessions are persistent by default (localStorage).
      // If "Remember Me" is false, we ideally want a temporary session, but client configuration is global.
      // For now, we proceed with standard login. 
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

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setValidationErrors({ email: '', password: '' })
    setPassword('')
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

        <AnimatePresence mode="wait">
          <motion.div
            key={isSignUp ? 'signup' : 'login'}
            initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    ...styles.input,
                    borderColor: validationErrors.email ? '#e57373' : 'var(--border)'
                  }}
                  autoComplete="email"
                />
                {validationErrors.email && (
                  <span style={styles.inlineError}>{validationErrors.email}</span>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>PASSWORD</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{
                      ...styles.input,
                      borderColor: validationErrors.password ? '#e57373' : 'var(--border)'
                    }}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                       <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                       </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {validationErrors.password && (
                  <span style={styles.inlineError}>{validationErrors.password}</span>
                )}

                {/* Password Strength Indicator (Signup Only) */}
                {isSignUp && password && (
                  <div style={styles.strengthContainer}>
                    <div style={styles.strengthBarBg}>
                      <div 
                        style={{
                          ...styles.strengthBarFill,
                          width: `${(passStrength.score / 3) * 100}%`,
                          backgroundColor: passStrength.color
                        }} 
                      />
                    </div>
                    <span style={{ ...styles.strengthLabel, color: passStrength.color }}>
                      {passStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Remember Me (Login Only) */}
              {!isSignUp && (
                <div style={styles.rememberMeContainer}>
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <label htmlFor="rememberMe" style={styles.rememberLabel}>Remember me</label>
                </div>
              )}

              {error && <p style={styles.error}>{error}</p>}

              <motion.button
                type="submit"
                style={styles.button}
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                animate={loading ? { scale: [1, 0.98, 1], opacity: 0.8 } : {}}
                transition={loading ? { repeat: Infinity, duration: 1.5 } : {}}
              >
                {loading 
                  ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                  : (isSignUp ? 'Create Account' : 'Log In')
                }
              </motion.button>

              <button
                type="button"
                onClick={toggleAuthMode}
                style={styles.backButton}
              >
                {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
              </button>
            </form>
          </motion.div>
        </AnimatePresence>
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
    gap: '8px',
    position: 'relative'
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)'
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%'
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
    transition: 'border-color 0.2s ease',
    outline: 'none'
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px'
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
    transition: 'all 0.2s ease'
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
  inlineError: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: '#e57373',
    marginTop: '2px'
  },
  strengthContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px'
  },
  strengthBarBg: {
    flex: 1,
    height: '4px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  strengthBarFill: {
    height: '100%',
    transition: 'all 0.3s ease'
  },
  strengthLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    fontWeight: '600'
  },
  rememberMeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '-8px'
  },
  checkbox: {
    accentColor: 'var(--accent)',
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  rememberLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
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
