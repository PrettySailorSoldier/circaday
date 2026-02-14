import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase, getProfile } from './lib/supabase'
import Auth from './components/Auth'
import QuizFlow from './components/QuizFlow'
import ProfileReveal from './components/ProfileReveal'
import CircadianClock from './components/CircadianClock'
import PhaseCard from './components/PhaseCard'
import PlanTab from './components/PlanTab'
import HabitsTab from './components/HabitsTab'
import SystemsTab from './components/SystemsTab'
import BottomNav from './components/BottomNav'
import { useArchetype } from './hooks/useArchetype'
import { useCurrentPhase } from './hooks/useCurrentPhase'

function Dashboard({ archetype }) {
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
      />
      {currentPhase && <PhaseCard phase={currentPhase} />}
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
  const { archetype, loading } = useArchetype()

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading your rhythm...</div>
      </div>
    )
  }

  return (
    <div style={styles.appContainer}>
      <div style={styles.mainContent}>
        {activeTab === 'dashboard' && <Dashboard archetype={archetype} />}
        {activeTab === 'plan' && <PlanTab />}
        {activeTab === 'habits' && <HabitsTab />}
        {activeTab === 'systems' && <SystemsTab />}
        {activeTab === 'profile' && (
          <div style={styles.profileContainer}>
            <h2 style={styles.profileTitle}>{archetype?.name}</h2>
            <p style={styles.profileTagline}>{archetype?.tagline}</p>
            <p style={styles.profileDescription}>{archetype?.description}</p>
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        checkProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        checkProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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
        session ? <Navigate to="/" /> : <Auth />
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
