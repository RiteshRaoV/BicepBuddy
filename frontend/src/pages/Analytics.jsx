import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URLS } from '../api/urls';

export const Analytics = ({ userData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_URLS.USER_JOURNALS(userData.id), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const journals = await res.json();
          // Process data for charts
          const processedData = journals.map(journal => {
            let totalVolume = 0;
            const exercises = journal.completed_exercises || [];
            exercises.forEach(ex => {
              if (ex.sets_completed !== undefined) {
                totalVolume += ex.sets_completed;
              } else if (ex.sets) {
                ex.sets.forEach(set => {
                  if (set.done) totalVolume += 1;
                });
              }
            });
            return {
              date: journal.date, // ISO string
              displayDate: new Date(journal.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              volume: totalVolume,
              workout: "Workout"
            };
          });
          // Sort by date
          processedData.sort((a, b) => new Date(a.date) - new Date(b.date));
          setData(processedData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchJournals();
    }
  }, [userData]);
  
  const accentColor = '#0a84ff'; // Safe default, could dynamically fetch from CSS vars
  const textColor = '#86868b';

  if (loading) return <div className="text-center" style={{ marginTop: '40px' }}>Loading Analytics...</div>;

  return (
    <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', paddingBottom: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>Your Progress Analytics</h2>
      
      <div className="app-card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>Total Sets Completed</h3>
        {data.length > 0 ? (
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" vertical={false} />
                <XAxis dataKey="displayDate" stroke={textColor} tick={{fill: textColor}} axisLine={false} tickLine={false} />
                <YAxis stroke={textColor} tick={{fill: textColor}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-color)', border: 'var(--neu-border)', borderRadius: '12px', color: 'var(--text-primary)' }} 
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="volume" stroke="var(--accent-primary, #0a84ff)" strokeWidth={4} dot={{ fill: 'var(--accent-primary, #0a84ff)', r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center" style={{ color: 'var(--text-secondary)' }}>No workout data found. Complete some workouts to see your progress!</p>
        )}
      </div>

      <div className="app-card">
        <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>Recent Workouts</h3>
        {data.length > 0 ? (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...data].reverse().slice(0, 5).map((log, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.1)' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{log.workout}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{log.displayDate}</div>
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  {log.volume} sets
                </div>
              </div>
            ))}
           </div>
        ) : (
           <p className="text-center" style={{ color: 'var(--text-secondary)' }}>No history available.</p>
        )}
      </div>
    </div>
  );
};
