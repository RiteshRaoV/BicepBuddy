import React, { useState } from 'react';
import { ThreeDMannequin } from '../components/ThreeDMannequin';

const EXERCISE_DB = [
  { id: 1, name: 'Barbell Bench Press', muscle: 'chest' },
  { id: 2, name: 'Incline Dumbbell Press', muscle: 'chest' },
  { id: 3, name: 'Cable Crossover', muscle: 'chest' },
  { id: 4, name: 'Pull-up', muscle: 'back' },
  { id: 5, name: 'Barbell Row', muscle: 'back' },
  { id: 6, name: 'Lat Pulldown', muscle: 'back' },
  { id: 7, name: 'Barbell Squat', muscle: 'legs' },
  { id: 8, name: 'Leg Press', muscle: 'legs' },
  { id: 9, name: 'Romanian Deadlift', muscle: 'legs' },
  { id: 10, name: 'Overhead Press', muscle: 'shoulders' },
  { id: 11, name: 'Lateral Raise', muscle: 'shoulders' },
  { id: 12, name: 'Barbell Curl', muscle: 'arms' },
  { id: 13, name: 'Tricep Pushdown', muscle: 'arms' },
  { id: 14, name: 'Crunch', muscle: 'core' },
  { id: 15, name: 'Plank', muscle: 'core' }
];

const ExerciseModal = ({ exercise, onClose }) => {
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    setWorkoutData(null);
    setError(false);
    setLoading(true);
    
    if (exercise?.name) {
      const apiKey = import.meta.env.VITE_WORKOUTX_API_KEY;
      
      fetch(`https://api.workoutxapp.com/v1/exercises/name/${encodeURIComponent(exercise.name.toLowerCase())}`, {
        headers: apiKey ? { 'X-WorkoutX-Key': apiKey } : {}
      })
        .then(res => {
          if (!res.ok) throw new Error("API error");
          return res.json();
        })
        .then(data => {
          // Normalize the response in case it's wrapped in an object like { data: [...] }
          const results = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
          
          if (results.length === 0) {
            console.warn("API returned no results or unexpected format:", data);
            setError(true);
            setLoading(false);
            return;
          }

          const match = results.find(e => e.name.toLowerCase() === exercise.name.toLowerCase()) || results[0];
          setWorkoutData(match);
          setLoading(false);
        })
        .catch(err => {
          console.warn("Could not load exercise from WorkoutX:", err);
          setError(true);
          setLoading(false);
        });
    } else {
      setError(true);
      setLoading(false);
    }
  }, [exercise]);

  if (!exercise) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div className="app-card" style={{ maxWidth: '500px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
        >
          ✕
        </button>
        
        <h2 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>{exercise.name}</h2>
        <span style={{ 
          display: 'inline-block', padding: '4px 12px', borderRadius: '12px', 
          backgroundColor: 'var(--surface-color)', border: '1px solid var(--accent-primary)',
          color: 'var(--accent-primary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '24px', fontWeight: 'bold' 
        }}>
          {exercise.muscle}
        </span>

        {/* GIF Animation Display */}
        <div style={{ width: '100%', height: '250px', backgroundColor: 'var(--surface-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', overflow: 'hidden' }}>
          {loading ? (
             <div style={{ color: 'var(--text-secondary)' }}>Loading visual...</div>
          ) : workoutData?.gifUrl ? (
            <img 
              src={`${workoutData.gifUrl}?api-key=${import.meta.env.VITE_WORKOUTX_API_KEY || ''}`} 
              alt={exercise.name} 
              style={{ height: '100%', width: '100%', objectFit: 'contain' }} 
            />
          ) : error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '2rem', marginBottom: '8px' }}>⚠️</span>
              <span style={{ fontSize: '0.9rem', textAlign: 'center' }}>Visual unavailable<br/>(Check your API Key)</span>
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)' }}>No visual found.</div>
          )}
        </div>

        <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>How to perform:</h4>
        {loading ? (
           <p style={{ color: 'var(--text-secondary)' }}>Loading instructions...</p>
        ) : workoutData?.instructions && workoutData.instructions.length > 0 ? (
          <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
            {workoutData.instructions.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>{step}</li>
            ))}
          </ol>
        ) : (
           <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Instructions not available.</p>
        )}
      </div>
    </div>
  );
};

export const ExerciseLibrary = () => {
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [activeExerciseModal, setActiveExerciseModal] = useState(null);

  const filteredExercises = selectedMuscle === 'all' 
    ? EXERCISE_DB 
    : EXERCISE_DB.filter(e => e.muscle === selectedMuscle);

  const handleMuscleClick = (muscle) => {
    setSelectedMuscle(selectedMuscle === muscle ? 'all' : muscle);
  };

  const getMuscleFill = (muscle) => {
    return selectedMuscle === muscle ? 'var(--accent-primary, #0a84ff)' : 'rgba(128,128,128,0.2)';
  };

  return (
    <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', paddingBottom: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>Exercise Library</h2>
      
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div className="app-card" style={{ flex: '1.5 1 500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ marginBottom: '24px' }}>Interactive Muscle Map</h3>
          
          <ThreeDMannequin selectedMuscle={selectedMuscle} onMuscleClick={handleMuscleClick} />

          <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
            Click a muscle group to filter exercises.
          </p>
        </div>

        <div className="app-card" style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3>{selectedMuscle === 'all' ? 'All Exercises' : `${selectedMuscle.charAt(0).toUpperCase() + selectedMuscle.slice(1)} Exercises`}</h3>
            {selectedMuscle !== 'all' && (
              <button onClick={() => setSelectedMuscle('all')} className="app-button" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                Clear Filter
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {filteredExercises.map(ex => (
              <div 
                key={ex.id} 
                onClick={() => setActiveExerciseModal(ex)}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', padding: '16px', 
                  background: 'rgba(0,0,0,0.1)', borderRadius: '12px', cursor: 'pointer',
                  transition: 'background 0.2s ease', border: '1px solid transparent'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-color)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{ex.name}</span>
                <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>{ex.muscle}</span>
              </div>
            ))}
            {filteredExercises.length === 0 && (
              <p style={{ color: 'var(--text-secondary)' }}>No exercises found for this muscle group.</p>
            )}
          </div>
        </div>
      </div>

      {activeExerciseModal && (
        <ExerciseModal exercise={activeExerciseModal} onClose={() => setActiveExerciseModal(null)} />
      )}
    </div>
  );
};
