import { motion } from 'framer-motion'

export default function ProfileReveal({ archetype, onContinue }) {
  return (
    <div style={styles.container}>
      <motion.div
        style={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Tagline */}
        <motion.p
          style={styles.tagline}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {archetype.tagline}
        </motion.p>

        {/* Archetype name */}
        <motion.h1
          style={styles.name}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {archetype.name}
        </motion.h1>

        {/* Description */}
        <motion.p
          style={styles.description}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {archetype.description}
        </motion.p>

        {/* Decorative element */}
        <motion.div
          style={styles.decorLine}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        />

        {/* CTA Button */}
        <motion.button
          style={styles.ctaButton}
          onClick={onContinue}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Build My Circaday
          <span style={styles.arrow}>→</span>
        </motion.button>
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '360px',
    zIndex: 1
  },
  tagline: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '16px'
  },
  name: {
    fontFamily: "'Fraunces', serif",
    fontSize: '36px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '24px',
    lineHeight: '1.2'
  },
  description: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    lineHeight: '1.7',
    color: 'var(--text-secondary)',
    marginBottom: '40px'
  },
  decorLine: {
    width: '60px',
    height: '1px',
    backgroundColor: 'var(--border)',
    marginBottom: '40px',
    transformOrigin: 'center'
  },
  ctaButton: {
    width: '100%',
    padding: '18px 32px',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    borderRadius: '12px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: 'pointer',
    border: 'none',
    transition: 'transform 0.2s ease'
  },
  arrow: {
    fontSize: '18px'
  },
  bgGlow: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(139, 127, 212, 0.1) 0%, transparent 60%)',
    filter: 'blur(60px)',
    pointerEvents: 'none'
  }
}
