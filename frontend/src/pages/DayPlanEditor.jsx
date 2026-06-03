import { useState } from 'react';
import { Button } from '../components/Button';
import { API_URLS } from '../api/urls';

export const DayPlanEditor = ({ plan, onBack, onSaved }) => {
  const [currentDayPlan, setCurrentDayPlan] = useState(JSON.parse(JSON.stringify(plan)));
  const [isSaving, setIsSaving] = useState(false);

  // New Exercise Form State
  const [exType, setExType] = useState("strength"); // strength, cardio
  const [cardioMetric, setCardioMetric] = useState("duration"); // duration, distance
  const [newExName, setNewExName] = useState("");
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState("10");
  const [newExDuration, setNewExDuration] = useState(20);
  const [newExDistance, setNewExDistance] = useState(3);
  const [newExInstructions, setNewExInstructions] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  if (!plan) return <div>Loading...</div>;

  const updateWorkoutName = (name) => {
    setCurrentDayPlan({ ...currentDayPlan, workout_name: name });
  };

  const editExercise = (idx) => {
    const ex = currentDayPlan.exercises[idx];
    setExType(ex.type);
    setNewExName(ex.name);
    setNewExInstructions(ex.instructions || "");
    if (ex.type === "strength") {
      setNewExSets(ex.sets || 3);
      setNewExReps(ex.reps || "10");
    } else {
      if (ex.duration) {
        setCardioMetric("duration");
        setNewExDuration(ex.duration);
      } else {
        setCardioMetric("distance");
        setNewExDistance(ex.distance);
      }
    }
    setEditingIndex(idx);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setNewExName("");
    setNewExInstructions("");
  };

  const addExercise = () => {
    if (!newExName.trim()) return;

    const newExercise = {
      name: newExName,
      type: exType,
      instructions: newExInstructions.trim()
    };

    if (exType === "strength") {
      newExercise.sets = parseInt(newExSets) || 3;
      newExercise.reps = newExReps;
      newExercise.rest_seconds = 60;
    } else {
      if (cardioMetric === "duration") {
        newExercise.duration = parseInt(newExDuration) || 20;
      } else {
        newExercise.distance = parseFloat(newExDistance) || 3;
      }
    }

    const updatedPlan = { ...currentDayPlan };
    if (!updatedPlan.exercises) updatedPlan.exercises = [];
    
    if (editingIndex !== null) {
      updatedPlan.exercises[editingIndex] = newExercise;
      setEditingIndex(null);
    } else {
      updatedPlan.exercises.push(newExercise);
    }
    
    updatedPlan.estimated_duration_minutes = (updatedPlan.exercises.length) * 10;
    
    setCurrentDayPlan(updatedPlan);
    setNewExName("");
    setNewExInstructions("");
  };

  const removeExercise = (idx) => {
    const updatedPlan = { ...currentDayPlan };
    updatedPlan.exercises.splice(idx, 1);
    updatedPlan.estimated_duration_minutes = (updatedPlan.exercises.length) * 10;
    setCurrentDayPlan(updatedPlan);
  };

  const clearDay = () => {
    const updatedPlan = { ...currentDayPlan };
    updatedPlan.exercises = [];
    updatedPlan.workout_name = "Rest Day";
    updatedPlan.estimated_duration_minutes = 0;
    setCurrentDayPlan(updatedPlan);
  };

  const savePlan = async () => {
    setIsSaving(true);
    try {
      const { id, scheduled_date, ...planDataToSave } = currentDayPlan;
      const res = await fetch(API_URLS.UPDATE_PLAN(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_data: planDataToSave
        })
      });
      if (res.ok) {
        onSaved();
      }
    } catch (e) {
      console.error("Failed saving plan", e);
    }
    setIsSaving(false);
  };

  return (
    <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <Button onClick={onBack} style={{ padding: '8px 16px', marginRight: '16px' }}>&larr; Back</Button>
        <h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>Edit Today's Workout</h2>
        <div style={{ width: '80px' }}></div>
      </div>
      
      <div className="clay-card mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            value={currentDayPlan.workout_name || ''}
            onChange={(e) => updateWorkoutName(e.target.value)}
            placeholder="E.g., Pull Day or Rest Day"
            style={{ 
              flex: 1, minWidth: '200px', padding: '16px', borderRadius: '16px', border: 'none', 
              boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1)', 
              background: 'var(--surface-color)', outline: 'none', fontSize: '1.5rem', fontWeight: 700, color: 'inherit'
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={clearDay} style={{ padding: '12px 16px', backgroundColor: 'var(--bg-color)', fontSize: '0.9rem' }}>
              Clear All Exercises
            </Button>
          </div>
        </div>

        {/* List of Exercises for selected day */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentDayPlan.exercises && currentDayPlan.exercises.map((ex, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-color)', borderRadius: '12px' }}>
                <div>
                  <span style={{ fontWeight: 600, display: 'block' }}>{ex.name}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {ex.type === 'strength' 
                      ? `${ex.sets} sets x ${ex.reps} reps`
                      : ex.duration 
                        ? `${ex.duration} mins`
                        : `${ex.distance} miles`
                    }
                  </span>
                  {ex.instructions && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      Note: {ex.instructions}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button onClick={() => editExercise(i)} style={{ padding: '8px 12px', backgroundColor: 'var(--surface-color)', fontSize: '0.9rem' }}>Edit</Button>
                  <Button onClick={() => removeExercise(i)} style={{ padding: '8px 12px', fontSize: '0.9rem' }}>Remove</Button>
                </div>
              </div>
            ))}
            
            {(!currentDayPlan.exercises || currentDayPlan.exercises.length === 0) && (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '24px 0' }}>This is currently a rest day.</p>
            )}
          </div>
        </div>

        {/* Add Exercise Form */}
        <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color-dark)', backgroundColor: 'var(--bg-color)' }}>
          <h4 style={{ marginBottom: '16px' }}>Add Exercise</h4>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <Button 
              variant={exType === 'strength' ? 'primary' : 'default'}
              onClick={() => setExType('strength')}
              style={{ flex: 1 }}
            >
              Weights / Strength
            </Button>
            <Button 
              variant={exType === 'cardio' ? 'primary' : 'default'}
              onClick={() => setExType('cardio')}
              style={{ flex: 1 }}
            >
              Cardio / Equipment
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Exercise Name</label>
              <input 
                type="text" 
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                placeholder={exType === 'strength' ? "e.g. Bicep Curls" : "e.g. Treadmill"}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)', background: 'var(--surface-color)', outline: 'none', color: 'inherit' }}
              />
            </div>

            {exType === 'strength' ? (
              <>
                <div style={{ flex: '1 1 100px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Sets</label>
                  <input 
                    type="number" 
                    value={newExSets}
                    onChange={(e) => setNewExSets(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)', background: 'var(--surface-color)', outline: 'none', color: 'inherit' }}
                  />
                </div>
                <div style={{ flex: '1 1 100px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Reps</label>
                  <input 
                    type="text" 
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value)}
                    placeholder="8-12"
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)', background: 'var(--surface-color)', outline: 'none', color: 'inherit' }}
                  />
                </div>
              </>
            ) : (
              <>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Track By</label>
                  <select 
                    value={cardioMetric}
                    onChange={(e) => setCardioMetric(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)', background: 'var(--surface-color)', outline: 'none', color: 'inherit' }}
                  >
                    <option value="duration">Duration (Mins)</option>
                    <option value="distance">Distance (Miles/Km)</option>
                  </select>
                </div>
                {cardioMetric === 'duration' ? (
                  <div style={{ flex: '1 1 100px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Minutes</label>
                    <input 
                      type="number" 
                      value={newExDuration}
                      onChange={(e) => setNewExDuration(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)', background: 'var(--surface-color)', outline: 'none', color: 'inherit' }}
                    />
                  </div>
                ) : (
                  <div style={{ flex: '1 1 100px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Distance</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={newExDistance}
                      onChange={(e) => setNewExDistance(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)', background: 'var(--surface-color)', outline: 'none', color: 'inherit' }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Instructions (Optional)</label>
            <input 
              type="text" 
              value={newExInstructions}
              onChange={(e) => setNewExInstructions(e.target.value)}
              placeholder="e.g. Set 1: normal, Set 2-3: incline"
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)', background: 'var(--surface-color)', outline: 'none', color: 'inherit' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', width: '100%' }}>
            <Button onClick={addExercise} style={{ padding: '12px 24px', height: '44px', flex: 1 }}>
              {editingIndex !== null ? 'Update Exercise' : `Add Exercise`}
            </Button>
            {editingIndex !== null && (
              <Button onClick={cancelEdit} style={{ padding: '12px 24px', height: '44px', backgroundColor: 'var(--bg-color)' }}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      <Button 
        variant="primary" 
        style={{ padding: '20px', fontSize: '1.2rem', width: '100%' }}
        onClick={savePlan}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : `Save Today's Plan`}
      </Button>
    </div>
  );
};
