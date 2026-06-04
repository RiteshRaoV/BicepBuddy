import { useState, useEffect } from 'react'
import { ACTIVE_DESIGN, ACTIVE_COLOR_SCHEME } from './themeConfig'
import './index.css'
import { LandingPage } from './pages/LandingPage'
import { Auth } from './pages/Auth'
import { Onboarding } from './pages/Onboarding'
import { WorkoutJournal } from './pages/WorkoutJournal'
import { ManualPlanner } from './pages/ManualPlanner'
import { Dashboard } from './pages/Dashboard'
import { PlansView } from './pages/PlansView'
import { DayPlanEditor } from './pages/DayPlanEditor'
import { Analytics } from './pages/Analytics'
import { ExerciseLibrary } from './pages/ExerciseLibrary'
import { Navbar } from './components/Navbar'
import { API_URLS } from './api/urls'

function App() {
  const [appState, setAppState] = useState('loading') // loading, landing, auth, onboarding, dashboard, manual_planner, journal, plans
  const [userData, setUserData] = useState(null)
  const [activePlan, setActivePlan] = useState(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-design', ACTIVE_DESIGN);
    if (ACTIVE_COLOR_SCHEME !== 'default') {
      document.documentElement.setAttribute('data-color-scheme', ACTIVE_COLOR_SCHEME);
    } else {
      document.documentElement.removeAttribute('data-color-scheme');
    }
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setAppState('landing');
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const res = await fetch(API_URLS.ME, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        setAppState('dashboard');
      } else {
        localStorage.removeItem('token');
        setAppState('landing');
      }
    } catch (e) {
      console.error(e);
      setAppState('landing');
    }
  };

  const handleAuthSuccess = (token) => {
    fetchUser(token);
  };

  const handleOnboardingComplete = async (data, mode) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(API_URLS.ONBOARDING, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lifestyle: data.lifestyle || 'active',
          preferred_environment: data.preferred_environment,
          goals: data.goals,
          equipment_names: data.equipment
        })
      });
      
      setUserData({ ...userData, ...data });
      
      if (mode === 'manual') {
        setAppState('manual_planner')
      } else {
        setTimeout(() => {
          setAppState('dashboard')
        }, 1500)
      }
    } catch (e) {
      console.error("Failed onboarding", e);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserData(null);
    setAppState('landing');
  };

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <div className="text-center" style={{ marginTop: '100px' }}>Loading...</div>;
      case 'landing':
        return <LandingPage onGetStarted={() => setAppState('auth')} />;
      case 'auth':
        return <Auth onAuthSuccess={handleAuthSuccess} />;
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case 'manual_planner':
        return <ManualPlanner userData={userData} onPlansCreated={() => setAppState('dashboard')} />;
      case 'dashboard':
        return <Dashboard userData={userData} onSelectPlan={(plan) => { setActivePlan(plan); setAppState('journal'); }} onEditPlan={(plan) => { setActivePlan(plan); setAppState('edit_today'); }} />;
      case 'edit_today':
        return <DayPlanEditor plan={activePlan} onBack={() => setAppState('dashboard')} onSaved={() => setAppState('dashboard')} />;
      case 'journal':
        return <WorkoutJournal plan={activePlan} userData={userData} onBack={() => setAppState('dashboard')} />;
      case 'plans':
        return <PlansView userData={userData} onStartWorkout={(plan) => { setActivePlan(plan); setAppState('journal'); }} />;
      case 'analytics':
        return <Analytics userData={userData} />;
      case 'library':
        return <ExerciseLibrary />;
      default:
        return <div>Not Found</div>;
    }
  }

  return (
    <div className="app-layout">
      {appState !== 'landing' && appState !== 'auth' && appState !== 'loading' && (
        <Navbar userData={userData} onNavigate={setAppState} onLogout={handleLogout} />
      )}
      
      {/* If it's landing or auth, we want to hide the navbar to make it clean */}
      {(appState === 'landing' || appState === 'auth') && (
        <div 
          onClick={() => setAppState('landing')}
          style={{ padding: '24px 40px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '1.8rem' }}>💪</div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 800 }}>
            BicepBuddy
          </h1>
        </div>
      )}

      <main className="app-content">
        {renderContent()}
      </main>

      <footer className="app-footer">
        BicepBuddy © 2026. Built with React & FastAPI.
      </footer>
    </div>
  )
}

export default App
