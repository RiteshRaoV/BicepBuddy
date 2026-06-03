import { useState } from 'react';
import { Button } from '../components/Button';
import { API_URLS } from '../api/urls';

export const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Form URL Encoded for OAuth2PasswordRequestForm
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const res = await fetch(API_URLS.LOGIN, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData
        });
        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("token", data.access_token);
          onAuthSuccess(data.access_token);
        } else {
          setError(data.detail || "Login failed");
        }
      } else {
        const res = await fetch(API_URLS.REGISTER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (res.ok) {
          // Immediately login after register
          const formData = new URLSearchParams();
          formData.append('username', username);
          formData.append('password', password);
          const loginRes = await fetch(API_URLS.LOGIN, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData
          });
          const loginData = await loginRes.json();
          if (loginRes.ok) {
            localStorage.setItem("token", loginData.access_token);
            onAuthSuccess(loginData.access_token);
          }
        } else {
          setError(data.detail || "Registration failed");
        }
      }
    } catch (err) {
      setError("Network error occurred.");
    }
    setLoading(false);
  };

  return (
    <div className="premium-card" style={{ maxWidth: '400px', width: '100%', margin: '0 auto', padding: '40px' }}>
      <h2 className="text-center mb-4">{isLogin ? "Welcome Back" : "Join BicepBuddy"}</h2>
      
      {error && <div style={{ padding: '12px', background: 'var(--accent-secondary)', color: 'white', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ 
              width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', 
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)', 
              background: 'rgba(0,0,0,0.2)', outline: 'none', fontSize: '1.1rem', color: 'var(--text-primary)'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', 
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)', 
              background: 'rgba(0,0,0,0.2)', outline: 'none', fontSize: '1.1rem', color: 'var(--text-primary)'
            }}
          />
        </div>

        <Button type="submit" variant="primary" style={{ padding: '20px', fontSize: '1.2rem', marginTop: '16px' }} disabled={loading}>
          {loading ? "Please wait..." : (isLogin ? "Log In" : "Sign Up")}
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span 
          style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Sign Up" : "Log In"}
        </span>
      </p>
    </div>
  );
};
