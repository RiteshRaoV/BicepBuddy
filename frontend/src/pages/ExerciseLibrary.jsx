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

export const ExerciseLibrary = () => {
  const [selectedMuscle, setSelectedMuscle] = useState('all');

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
    <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', paddingBottom: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>Exercise Library</h2>
      
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div className="app-card" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ marginBottom: '24px' }}>Interactive Muscle Map</h3>
          
          <ThreeDMannequin selectedMuscle={selectedMuscle} onMuscleClick={handleMuscleClick} />

          <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
            Click a muscle group to filter exercises.
          </p>
        </div>

        <div className="app-card" style={{ flex: '2 1 400px' }}>
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
              <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                <span style={{ fontWeight: 'bold' }}>{ex.name}</span>
                <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>{ex.muscle}</span>
              </div>
            ))}
            {filteredExercises.length === 0 && (
              <p style={{ color: 'var(--text-secondary)' }}>No exercises found for this muscle group.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
