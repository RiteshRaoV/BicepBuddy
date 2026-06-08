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
        <img src="/logo.png" alt="Logo" className="logo-img" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 800 }}>
          BicepBuddy
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <label className="theme-switch" title="Toggle Dark Mode">
          <input 
            type="checkbox" 
            className="theme-switch__checkbox" 
            checked={isDark} 
            onChange={() => setIsDark(!isDark)} 
          />
          <div className="theme-switch__container">
            <div className="theme-switch__clouds"></div>
            <div className="theme-switch__stars-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
                <path fill="currentColor" d="M38.5 0C38.5 2.1287 36.6287 4 34.5 4C36.6287 4 38.5 5.8713 38.5 8C38.5 5.8713 40.3713 4 42.5 4C40.3713 4 38.5 2.1287 38.5 0Z"/>
                <path fill="currentColor" d="M102 31C102 33.1287 100.129 35 98 35C100.129 35 102 36.8713 102 39C102 36.8713 103.871 35 106 35C103.871 35 102 33.1287 102 31Z"/>
                <path fill="currentColor" d="M8 44C8 45.1046 7.10457 46 6 46C7.10457 46 8 46.8954 8 48C8 46.8954 8.89543 46 10 46C8.89543 46 8 45.1046 8 44Z"/>
                <path fill="currentColor" d="M129 20C129 21.1046 128.105 22 127 22C128.105 22 129 22.8954 129 24C129 22.8954 129.895 22 131 22C129.895 22 129 21.1046 129 20Z"/>
                <path fill="currentColor" d="M69 11C69 12.1046 68.1046 13 67 13C68.1046 13 69 13.8954 69 15C69 13.8954 69.8954 13 71 13C69.8954 13 69 12.1046 69 11Z"/>
              </svg>
            </div>
            <div className="theme-switch__circle-container">
              <div className="theme-switch__sun-moon-container">
                <div className="theme-switch__moon">
                  <div className="theme-switch__spot"></div>
                  <div className="theme-switch__spot"></div>
                  <div className="theme-switch__spot"></div>
                </div>
              </div>
            </div>
          </div>
        </label>

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
            <Button onClick={() => onNavigate('analytics')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Analytics
            </Button>
            <Button onClick={() => onNavigate('library')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Library
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
