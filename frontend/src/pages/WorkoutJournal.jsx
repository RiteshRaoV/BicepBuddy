import { useState } from 'react';
import { Button } from '../components/Button';
import { API_URLS } from '../api/urls';

export const WorkoutJournal = ({ plan, onBack }) => {
  const [completedSets, setCompletedSets] = useState({});
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!plan) return <div>Loading plan...</div>;

  const toggleSet = (exerciseIndex, setIndex) => {
    const key = `${exerciseIndex}-${setIndex}`;
    setCompletedSets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleComplete = async () => {
    setIsSaving(true);
    // Gather completed exercises
    const completed = [];
    plan.exercises?.forEach((ex, exIdx) => {
      if (ex.type === 'cardio') {
        if (completedSets[`${exIdx}-cardio`]) {
          completed.push({ name: ex.name, sets_completed: 1, total_sets: 1, type: 'cardio' });
        }
      } else {
        let setsDone = 0;
        for (let i = 0; i < (ex.sets || 0); i++) {
          if (completedSets[`${exIdx}-${i}`]) setsDone++;
        }
        if (setsDone > 0) {
          completed.push({ name: ex.name, sets_completed: setsDone, total_sets: ex.sets, type: 'strength' });
        }
      }
    });

    try {
      const res = await fetch(API_URLS.SAVE_JOURNAL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1, // Mock user ID for now
          date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          notes: notes,
          completed_exercises: completed
        })
      });
      if (res.ok) {
        setSaved(true);
      }
    } catch (e) {
      console.error("Failed to save", e);
    }
    setIsSaving(false);
  };

  if (saved) {
    return (
      <div className="clay-card" style={{ maxWidth: '400px', width: '100%', margin: 'auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', margin: '0 0 16px 0' }}>🎉</h2>
        <h2>Workout Complete!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Your session and journal have been saved.</p>
        <Button variant="primary" style={{ marginTop: '24px' }} onClick={onBack}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <Button onClick={onBack} style={{ padding: '8px 16px', marginRight: '16px' }}>&larr; Back</Button>
        <h1 style={{ margin: 0, flex: 1, textAlign: 'center' }}>{plan.workout_name}</h1>
        <div style={{ width: '80px' }}></div>
      </div>
      <p className="text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
        Estimated: {plan.estimated_duration_minutes} mins
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {plan.exercises?.map((exercise, exIndex) => (
          <div key={exIndex} className="clay-card">
            <div style={{ 
              height: '150px', 
              borderRadius: '16px', 
              backgroundColor: 'var(--bg-color)', 
              boxShadow: 'inset 4px 4px 8px rgba(163, 177, 198, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>Animation Placeholder</span>
            </div>

            <h3 style={{ marginBottom: '8px' }}>{exercise.name}</h3>
            
            {exercise.type === 'cardio' ? (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                {exercise.duration ? `${exercise.duration} mins` : `${exercise.distance} miles/km`}
              </p>
            ) : (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                {exercise.sets} sets • {exercise.reps} reps • Rest: {exercise.rest_seconds}s
              </p>
            )}
            
            {exercise.instructions && (
              <div style={{ padding: '12px', marginBottom: '16px', background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color-dark)', borderLeft: '4px solid var(--accent-primary)', fontSize: '0.9rem' }}>
                <strong>Note:</strong> {exercise.instructions}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {exercise.type === 'cardio' ? (
                // For cardio, just one "Mark Done" button for the whole exercise
                (() => {
                  const isDone = completedSets[`${exIndex}-cardio`];
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                        Complete Activity
                      </span>
                      <Button 
                        onClick={() => toggleSet(exIndex, 'cardio')}
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '0.9rem',
                          backgroundColor: isDone ? 'var(--accent-secondary)' : 'var(--surface-color)',
                          color: isDone ? '#fff' : 'var(--text-primary)',
                          boxShadow: isDone ? 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.4)' : 'var(--clay-shadow)'
                        }}
                      >
                        {isDone ? '✓ Done' : 'Mark Done'}
                      </Button>
                    </div>
                  );
                })()
              ) : (
                // For strength, loop through sets
                Array.from({ length: exercise.sets || 0 }).map((_, setIndex) => {
                  const isDone = completedSets[`${exIndex}-${setIndex}`];
                  return (
                    <div key={setIndex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                        Set {setIndex + 1}
                      </span>
                      <Button 
                        onClick={() => toggleSet(exIndex, setIndex)}
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '0.9rem',
                          backgroundColor: isDone ? 'var(--accent-secondary)' : 'var(--surface-color)',
                          color: isDone ? '#fff' : 'var(--text-primary)',
                          boxShadow: isDone ? 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.4)' : 'var(--clay-shadow)'
                        }}
                      >
                        {isDone ? '✓ Done' : 'Mark Done'}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="clay-card" style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Daily Journal Notes</h3>
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did you feel today? Any PRs?"
          style={{
            width: '100%',
            height: '100px',
            padding: '16px',
            borderRadius: '16px',
            border: 'none',
            outline: 'none',
            background: 'var(--surface-color)',
            boxShadow: 'inset 4px 4px 8px rgba(163, 177, 198, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.8)',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ marginTop: '32px' }}>
        <Button variant="primary" style={{ width: '100%', padding: '20px', fontSize: '1.2rem' }} onClick={handleComplete}>
          {isSaving ? "Saving..." : "Complete Workout & Save Journal"}
        </Button>
      </div>
    </div>
  );
};
