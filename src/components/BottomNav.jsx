import { motion } from 'framer-motion'

const TABS = [
  { id: 'dashboard', label: 'Dash',    icon: '◉' },
  // TODO: Nav architecture debt — spec describes Today/Mirror/Plan/Profile but existing nav
  // has Dash/Plan/Habits/Systems/Profile. Reconcile when building Insights Mode (Prompt 2).
  { id: 'mirror',    label: 'Mirror',  icon: '◈' },
  { id: 'plan',      label: 'Plan',    icon: '◫' },
  { id: 'habits',    label: 'Habits',  icon: '◇' },
  { id: 'systems',   label: 'Systems', icon: '⚙' },
  { id: 'profile',   label: 'Profile', icon: '◯' }
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav style={styles.nav}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.id

        return (
          <motion.button
            key={tab.id}
            style={{
              ...styles.tab,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)'
            }}
            onClick={() => onTabChange(tab.id)}
            whileTap={{ scale: 0.95 }}
          >
            <span style={styles.icon}>{tab.icon}</span>
            <span style={{
              ...styles.label,
              fontWeight: isActive ? '600' : '400'
            }}>
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                style={styles.activeIndicator}
                layoutId="activeTab"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        )
      })}
    </nav>
  )
}

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '72px',
    backgroundColor: 'var(--bg-surface)',
    borderTop: '1px solid var(--border)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)'
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '8px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    minWidth: '60px'
  },
  icon: {
    fontSize: '20px'
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    letterSpacing: '0.02em',
    textTransform: 'uppercase'
  },
  activeIndicator: {
    position: 'absolute',
    top: '-1px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '24px',
    height: '2px',
    backgroundColor: 'var(--accent)',
    borderRadius: '1px'
  }
}
