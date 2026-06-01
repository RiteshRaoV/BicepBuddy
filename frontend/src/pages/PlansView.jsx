import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { API_URLS } from '../api/urls';

export const PlansView = ({ userData, onStartWorkout }) => {
  const [plans, setPlans] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, journalsRes] = await Promise.all([
          fetch(API_URLS.USER_PLANS(userData.id)),
          fetch(API_URLS.USER_JOURNALS(userData.id))
        ]);
        
        if (plansRes.ok) setPlans(await plansRes.json());
        if (journalsRes.ok) setJournals(await journalsRes.json());
      } catch (e) {
        console.error("Failed fetching calendar data", e);
      }
      setLoading(false);
    };
    fetchData();
  }, [userData.id]);

  if (loading) {
    return <div className="text-center" style={{ marginTop: '100px' }}>Loading...</div>;
  }

  // Generate calendar grid (last 14 days + next 14 days)
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  const todayStr = (new Date(today.getTime() - offset)).toISOString().split('T')[0];
  const calendarDays = [];
  for (let i = -14; i <= 14; i++) {
    const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000 - offset);
    calendarDays.push(d.toISOString().split('T')[0]);
  }

  return (
    <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
      
      {/* Left Column: List of Plans */}
      <div style={{ flex: '1 1 300px' }}>
        <h2 className="mb-4">Scheduled Workouts</h2>
        {plans.length === 0 ? (
          <div className="clay-card">No plans scheduled. Build one in the manual planner!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {plans.map((plan) => {
              const planJournal = journals.find(j => j.date === plan.scheduled_date);
              return (
              <div key={plan.id} className="clay-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{plan.scheduled_date}</span>
                  <h4 style={{ margin: '4px 0' }}>{plan.plan_data.workout_name}</h4>
                </div>
                {plan.scheduled_date > todayStr ? (
                  <div style={{ padding: '8px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                    Upcoming
                  </div>
                ) : (
                  <Button 
                    onClick={() => onStartWorkout({ ...plan.plan_data, scheduled_date: plan.scheduled_date })} 
                    style={{ 
                      padding: '8px',
                      backgroundColor: planJournal ? 'var(--accent-secondary)' : undefined,
                      color: planJournal ? '#fff' : undefined
                    }}
                    variant={planJournal ? 'default' : 'primary'}
                  >
                    {planJournal ? 'View Workout' : 'Start'}
                  </Button>
                )}
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Right Column: Adherence Calendar */}
      <div style={{ flex: '2 1 400px' }}>
        <h2 className="mb-4">Adherence Calendar</h2>
        <div className="clay-card">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {calendarDays.map((dateStr) => {
              const hasJournal = journals.some(j => j.date === dateStr);
              const hasPlan = plans.some(p => p.scheduled_date === dateStr);
              const isPast = new Date(dateStr) < new Date(today.toISOString().split('T')[0]);
              
              let bgColor = 'var(--surface-color)';
              if (hasJournal) {
                bgColor = 'var(--accent-secondary)'; // Greenish/Mint = Done
              } else if (hasPlan && isPast) {
                bgColor = '#fc8181'; // Red = Missed
              } else if (hasPlan && !isPast) {
                bgColor = 'var(--accent-primary)'; // Blue = Upcoming
              }

              return (
                <div 
                  key={dateStr}
                  title={dateStr}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: bgColor,
                    boxShadow: 'var(--clay-shadow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    color: (hasJournal || (hasPlan && isPast) || hasPlan) ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {dateStr.split('-')[2]}
                </div>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--accent-secondary)' }}></div> Done
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#fc8181' }}></div> Missed
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--accent-primary)' }}></div> Scheduled
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};
