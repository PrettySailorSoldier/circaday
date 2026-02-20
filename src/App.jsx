import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { account } from './lib/appwrite'
import { getProfile, updateProfile } from './lib/db'
import Auth from './components/Auth'
import QuizFlow from './components/QuizFlow'
import ProfileReveal from './components/ProfileReveal'
import CircadianClock from './components/CircadianClock'
import PhaseCard from './components/PhaseCard'
import PlanTab from './components/PlanTab'
import HabitsTab from './components/HabitsTab'
import SystemsTab from './components/SystemsTab'
import BottomNav from './components/BottomNav'
import DaySchedule from './components/DaySchedule'
import MirrorTab from './components/MirrorTab'
import SleepTracker from './components/SleepTracker'
import MomentumTool from './components/MomentumTool'
import { useArchetype } from './hooks/useArchetype'
import { useCurrentPhase } from './hooks/useCurrentPhase'

function Dashboard({ archetype, profile, isSessionActive, onStartSession, onEndSession, onOpenMomentum }) {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentPhase = useCurrentPhase(archetype?.arcSchedule)

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.greeting}>
        <span style={styles.dateText}>
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
        </span>
        <h1 style={styles.greetingText}>Good {getTimeOfDay()}</h1>
      </div>

      <CircadianClock
        arcSchedule={archetype?.arcSchedule || []}
        currentHour={currentHour}
        currentMinute={currentMinute}
        isSessionActive={isSessionActive}
      />
      
      {isSessionActive ? (
        <DaySchedule 
          arcSchedule={archetype?.arcSchedule} 
          currentPhase={currentPhase} 
          onEndSession={onEndSession} 
        />
      ) : (
        <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          {currentPhase && <PhaseCard phase={currentPhase} />}
          <button 
            style={styles.startSessionBtn}
            onClick={() => onStartSession({ 
              schedule: archetype?.arcSchedule, 
              archetype: archetype?.name 
            })}
          >
            Start Guided Session
          </button>
          
          <button 
            style={styles.momentumBtn}
            onClick={onOpenMomentum}
          >
            🚀 Momentum
          </button>
        </div>
      )}
    </div>
  )
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { archetype, profile, loading } = useArchetype()
  
  // Session State Lifted
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionData, setSessionData] = useState(null)
  
  // Momentum State
  const [showMomentum, setShowMomentum] = useState(false)
  const [workSessionTrigger, setWorkSessionTrigger] = useState(null)

  const handleStartSession = (data) => {
    setSessionData(data)
    setIsSessionActive(true)
  }

  const handleEndSession = () => {
    setIsSessionActive(false)
    setSessionData(null)
  }

  const handleMomentumVictory = (data) => {
    setShowMomentum(false)
    setWorkSessionTrigger({ startTime: new Date(), ...data })
    setActiveTab('mirror')
  }

  async function handleChronotypeUpdate(newChronotype) {
    if (!profile?.$id) return
    try {
      await updateProfile(profile.$id, { archetype_id: newChronotype })
    } catch (e) {
      console.error('Failed to update chronotype:', e)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading your rhythm...</div>
      </div>
    )
  }

  return (
    <div style={styles.appContainer}>
      <AnimatePresence>
        {showMomentum && (
          <MomentumTool 
            onClose={() => setShowMomentum(false)} 
            onStartWorkSession={handleMomentumVictory}
          />
        )}
      </AnimatePresence>

      <div style={styles.mainContent}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            archetype={archetype} 
            profile={profile} 
            isSessionActive={isSessionActive}
            onStartSession={handleStartSession}
            onEndSession={handleEndSession}
            onOpenMomentum={() => setShowMomentum(true)}
          />
        )}
        {activeTab === 'mirror' && (
          <MirrorTab 
            initialActiveSession={workSessionTrigger} 
            onClearTrigger={() => setWorkSessionTrigger(null)} 
          />
        )}
        {activeTab === 'plan' && <PlanTab />}
        {activeTab === 'habits' && <HabitsTab />}
        {activeTab === 'systems' && <SystemsTab />}
        {activeTab === 'profile' && (
          <div style={styles.profileContainer}>
            <h2 style={styles.profileTitle}>{archetype?.name}</h2>
            <p style={styles.profileTagline}>{archetype?.tagline}</p>
            <p style={styles.profileDescription}>{archetype?.description}</p>
            <SleepTracker
              currentArchetypeId={profile?.archetype_id}
              onChronotypeUpdate={handleChronotypeUpdate}
            />
          </div>
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quizArchetype, setQuizArchetype] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    try {
      const user = await account.get()
      // Map Appwrite user to a session-like object compatible with existing code (user.id)
      const sessionData = {
        user: {
          id: user.$id,
          ...user
        }
      }
      setSession(sessionData)
      checkProfile(user.$id)
    } catch (error) {
      setSession(null)
      setProfile(null)
      setLoading(false)
    }
  }

  async function checkProfile(userId) {
    const profileData = await getProfile(userId)
    setProfile(profileData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/auth" element={
        session ? <Navigate to="/" /> : <Auth onLogin={checkSession} />
      } />
      <Route path="/quiz" element={
        !session ? <Navigate to="/auth" /> :
        <QuizFlow onComplete={(archetype) => {
          setQuizArchetype(archetype)
          navigate('/reveal')
        }} />
      } />
      <Route path="/reveal" element={
        !session ? <Navigate to="/auth" /> :
        !quizArchetype ? <Navigate to="/quiz" /> :
        <ProfileReveal
          archetype={quizArchetype}
          onContinue={() => {
            setProfile({ archetype_id: quizArchetype.id })
            navigate('/')
          }}
        />
      } />
      <Route path="/" element={
        !session ? <Navigate to="/auth" /> :
        !profile ? <Navigate to="/quiz" /> :
        <MainApp />
      } />
    </Routes>
  )
}

const styles = {
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: 'var(--bg-base)'
  },
  loadingText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-muted)'
  },
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-base)'
  },
  mainContent: {
    flex: 1,
    paddingBottom: '80px',
    overflowY: 'auto'
  },
  dashboardContainer: {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  greeting: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  dateText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    marginBottom: '4px',
    display: 'block'
  },
  greetingText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '18px',
    fontWeight: '400',
    color: 'var(--text-primary)',
    margin: 0
  },
  startSessionBtn: {
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '280px',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
  },
  momentumBtn: {
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px 32px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '280px',
    transition: 'all 0.2s ease'
  },
  activeSessionCard: {
    marginTop: '24px',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    maxWidth: '280px',
    textAlign: 'center',
    border: '1px solid var(--accent)'
  },
  sessionTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '18px',
    color: 'var(--accent)',
    margin: '0 0 8px 0'
  },
  sessionGoal: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-primary)',
    margin: '0 0 16px 0'
  },
  endSessionBtn: {
    backgroundColor: 'transparent',
    border: '1px solid var(--text-muted)',
    color: 'var(--text-muted)',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  profileContainer: {
    padding: '40px 24px',
    textAlign: 'center'
  },
  profileTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '28px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  },
  profileTagline: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '16px'
  },
  profileDescription: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '320px',
    margin: '0 auto'
  }
}
