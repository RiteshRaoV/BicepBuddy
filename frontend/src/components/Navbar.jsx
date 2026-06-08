import { useState, useEffect } from 'react';
import { Button } from './Button';

export const Navbar = ({ appState, userData, onNavigate, onLogout }) => {
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'plans', label: 'Calendar' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'library', label: 'Library' },
    { id: 'manual_planner', label: '+ Build Plan' },
    { id: 'onboarding', label: 'Train with AI' }
  ];

  return (
    <nav style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      padding: '16px 32px',
      marginBottom: '0',
      position: 'relative',
      zIndex: 100
    }}>
      {/* Left: Logo & Brand */}
      <div 
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', justifySelf: 'start' }}
        onClick={() => onNavigate(userData ? 'dashboard' : 'landing')}
      >
        <img src="/logo.png" alt="Logo" className="logo-img" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
        <div className="nav-divider"></div>
        <h1 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 800, display: 'flex', alignItems: 'center' }}>
          BicepBuddy
        </h1>
      </div>

      {/* Center: Segmented Navigation */}
      {userData ? (
        <div className="nav-pill-container" style={{ justifySelf: 'center' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-pill-item ${appState === item.id || (item.id === 'dashboard' && (appState === 'journal' || appState === 'edit_today')) ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : <div />}

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifySelf: 'end' }}>
        <label className="theme-switch" title="Toggle Dark Mode" style={{ transform: 'scale(0.8)', margin: '0' }}>
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
              backgroundColor: 'var(--surface-color)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem'
            }} title="Your Gamification Points">
              ⭐ {userData.points || 0}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {userData.username}
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>
                {userData.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <Button onClick={onLogout} variant="danger" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
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
