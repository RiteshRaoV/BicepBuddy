import { Button } from '../components/Button';

export const LandingPage = ({ onGetStarted }) => {
  return (
    <div style={{
      flex: 1,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url("/background.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '40px',
      borderRadius: '24px',
      boxShadow: 'var(--neu-shadow)'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '16px', fontWeight: 800, textShadow: '2px 2px 10px rgba(0,0,0,0.5)' }}>
        ELEVATE YOUR TRAINING
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '48px', maxWidth: '600px', opacity: 0.9 }}>
        Your personal AI fitness buddy. Log workouts, track progress, and build the perfect routine with the tap of a button.
      </p>

      <Button
        variant="primary"
        style={{ padding: '20px 48px', fontSize: '1.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}
        onClick={onGetStarted}
      >
        Get Started
      </Button>
    </div>
  );
};
