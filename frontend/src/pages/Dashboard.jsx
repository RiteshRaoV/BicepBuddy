import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { API_URLS } from '../api/urls';

export const Dashboard = ({ userData, onSelectPlan }) => {
  const [plans, setPlans] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const [plansRes, journalsRes] = await Promise.all([
          fetch(API_URLS.USER_PLANS(userData.id)),
          fetch(API_URLS.USER_JOURNALS(userData.id))
        ]);
        if (plansRes.ok) setPlans(await plansRes.json());
        if (journalsRes.ok) setJournals(await journalsRes.json());
      } catch (e) {
        console.error("Failed fetching plans", e);
      }
      setLoading(false);
    };
    fetchPlans();
  }, [userData.id]);

  if (loading) {
    return <div className="text-center" style={{ marginTop: '100px' }}>Loading Dashboard...</div>;
  }

  // Get current date string in local timezone (YYYY-MM-DD)
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(today - offset)).toISOString().split('T')[0];
  
  const todayPlan = plans.find(p => p.scheduled_date === localISOTime);
  const upcomingPlan = plans.find(p => p.scheduled_date > localISOTime);
  
  const todayJournal = journals.find(j => j.date === localISOTime);

  const renderPlanCard = (plan, emptyMessage) => {
    if (!plan) {
      return (
        <div className="clay-card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
          {emptyMessage}
        </div>
      );
    }

    const planJournal = journals.find(j => j.date === plan.scheduled_date);

    return (
      <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{plan.scheduled_date || 'Anytime'}</span>
          <h3 style={{ marginTop: '4px', marginBottom: '8px' }}>{plan.plan_data.workout_name}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {plan.plan_data.exercises?.length || 0} exercises • {plan.plan_data.estimated_duration_minutes || 0} mins
          </p>
        </div>
        {plan.scheduled_date > localISOTime ? (
          <div style={{ marginTop: 'auto', padding: '12px', textAlign: 'center', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            Upcoming Workout
          </div>
        ) : (
          <Button 
            variant={planJournal ? "default" : "primary"} 
            style={{ 
              marginTop: 'auto', 
              padding: '12px',
              backgroundColor: planJournal ? 'var(--accent-secondary)' : undefined,
              color: planJournal ? '#fff' : undefined
            }} 
            onClick={() => onSelectPlan({ ...plan.plan_data, scheduled_date: plan.scheduled_date })}
          >
            {planJournal ? "View Workout" : "Start Workout"}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', paddingBottom: '40px' }}>
      <h2 className="text-center mb-4">Your Dashboard</h2>
      <p className="text-center mb-4" style={{ color: 'var(--text-secondary)' }}>Welcome back, {userData.username}</p>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'stretch', flexWrap: 'wrap' }}>
        
        {/* Left: Today's Plan */}
        <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-4" style={{ textAlign: 'center', borderBottom: '2px solid var(--border-color-dark)', paddingBottom: '8px' }}>Today</h3>
          {renderPlanCard(todayPlan, "No workout scheduled for today. Rest up or start a manual session!", true)}
        </div>

        {/* Center: All Plans */}
        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-4" style={{ textAlign: 'center', borderBottom: '2px solid var(--border-color-dark)', paddingBottom: '8px' }}>All Plans</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '16px',
            maxHeight: '600px',
            overflowY: 'auto',
            padding: '8px'
          }}>
            {plans.length === 0 ? (
              <div className="clay-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <p>You don't have any upcoming workouts.</p>
              </div>
            ) : (
              plans.map((plan) => (
                <div key={plan.id}>
                  {renderPlanCard(plan)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Upcoming Plan */}
        <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-4" style={{ textAlign: 'center', borderBottom: '2px solid var(--border-color-dark)', paddingBottom: '8px' }}>Up Next</h3>
          {renderPlanCard(upcomingPlan, "No future workouts scheduled.")}
        </div>
        
      </div>
    </div>
  );
};
