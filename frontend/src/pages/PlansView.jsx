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
    <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Section: Adherence Calendar */}
      <div>
        <h2 className="mb-4 text-center">Adherence Calendar</h2>
        <div className="app-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {calendarDays.map((dateStr) => {
              const hasJournal = journals.some(j => j.date === dateStr);
              const hasPlan = plans.some(p => p.scheduled_date === dateStr);
              const isPast = new Date(dateStr) < new Date(today.toISOString().split('T')[0]);
              
              let bgColor = 'var(--surface-color)';
              if (hasJournal) {
                bgColor = 'var(--accent-secondary)'; // Greenish/Mint = Done
              } else if (hasPlan && isPast) {
                bgColor = 'var(--accent-danger)'; // Red = Missed
              } else if (hasPlan && !isPast) {
                bgColor = 'var(--accent-primary)'; // Blue = Upcoming
              }

              return (
                <div 
                  key={dateStr}
                  title={dateStr}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: bgColor,
                    boxShadow: 'var(--neu-shadow)',
                    border: '1px solid var(--border-color)',
                    borderBottom: '1px solid var(--border-color-dark)',
                    borderRight: '1px solid var(--border-color-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: (hasJournal || (hasPlan && isPast) || hasPlan) ? 'white' : 'var(--text-primary)'
                  }}
                >
                  {dateStr.split('-')[2]}
                </div>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--accent-secondary)' }}></div> Done
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--accent-danger)' }}></div> Missed
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--accent-primary)' }}></div> Scheduled
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: List of Plans */}
      <div>
        <h2 className="mb-4 text-center">Scheduled Workouts</h2>
        {plans.length === 0 ? (
          <div className="app-card text-center" style={{ padding: '40px' }}>No plans scheduled. Build one in the manual planner!</div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '24px' 
          }}>
            {plans.map((plan) => {
              const planJournal = journals.find(j => j.date === plan.scheduled_date);
              return (
              <div key={plan.id} className="app-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{plan.scheduled_date}</span>
                  <h3 style={{ margin: '4px 0 8px 0' }}>{plan.plan_data.workout_name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    {plan.plan_data.exercises?.length || 0} exercises • {plan.plan_data.estimated_duration_minutes || 0} mins
                  </p>
                </div>
                {plan.scheduled_date > todayStr ? (
                  <div style={{ marginTop: 'auto', padding: '12px', textAlign: 'center', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                    Upcoming Workout
                  </div>
                ) : plan.scheduled_date < todayStr && !planJournal ? (
                  <div style={{ marginTop: 'auto', padding: '12px', textAlign: 'center', color: 'var(--accent-danger)', fontWeight: 'bold' }}>
                    Missed Workout
                  </div>
                ) : (
                  <Button 
                    onClick={() => onStartWorkout({ ...plan.plan_data, scheduled_date: plan.scheduled_date })} 
                    style={{ 
                      marginTop: 'auto',
                      padding: '12px',
                      backgroundColor: planJournal ? 'var(--accent-secondary)' : undefined,
                      color: planJournal ? '#fff' : undefined
                    }}
                    variant={planJournal ? 'default' : 'primary'}
                  >
                    {planJournal ? 'View Workout' : 'Start Workout'}
                  </Button>
                )}
              </div>
            )})}
          </div>
        )}
      </div>
      
    </div>
  );
};
