import { useState, useEffect } from 'react';
import { Button } from './Button';

export const Navbar = ({ userData, onNavigate, onLogout }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <nav className="app-card" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 40px',
      borderRadius: '0 0 24px 24px',
      marginBottom: '24px',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      zIndex: 100
    }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        onClick={() => onNavigate(userData ? 'dashboard' : 'landing')}
      >
        <div style={{ fontSize: '1.8rem' }}>💪</div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 800 }}>
          BicepBuddy
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={() => setIsDark(!isDark)}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '50%',
            color: 'var(--text-primary)'
          }}
          title="Toggle Dark Mode"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {userData ? (
          <>
            <span style={{ 
              fontWeight: 800, 
              color: 'var(--accent-secondary)', 
              backgroundColor: 'var(--bg-color)',
              padding: '6px 12px',
              borderRadius: '20px',
              boxShadow: 'var(--neu-shadow-active)'
            }} title="Your Gamification Points">
              ⭐ {userData.points || 0}
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
              Hi, {userData.username}
            </span>
            <Button onClick={() => onNavigate('dashboard')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Dashboard
            </Button>
            <Button onClick={() => onNavigate('plans')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Calendar
            </Button>
            <Button onClick={() => onNavigate('manual_planner')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              + Build Plan
            </Button>
            <Button onClick={() => onNavigate('onboarding')} style={{ padding: '8px 16px', fontSize: '0.9rem', backgroundColor: 'var(--accent-primary)', color: 'white' }}>
              Train with AI
            </Button>
            <Button onClick={onLogout} style={{ padding: '8px 16px', fontSize: '0.9rem', backgroundColor: 'var(--accent-secondary)', color: 'white' }}>
              Logout
            </Button>
          </>
        ) : (
          <Button onClick={() => onNavigate('auth')} style={{ padding: '8px 24px', fontSize: '1rem' }}>
            Log In
          </Button>
        )}
      </div>
    </nav>
  );
};
