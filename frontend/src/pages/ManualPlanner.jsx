import { useState } from 'react';
import { Button } from '../components/Button';
import { API_URLS } from '../api/urls';

const generateBaseWeek = () => ({
  "0": { workout_name: "Monday Push", exercises: [] },
  "1": { workout_name: "Tuesday Pull", exercises: [] },
  "2": { workout_name: "Wednesday Legs", exercises: [] },
  "3": { workout_name: "Thursday Cardio", exercises: [] },
  "4": { workout_name: "Friday Full Body", exercises: [] },
  "5": { workout_name: "Saturday Active Recovery", exercises: [] },
  "6": { workout_name: "Sunday Rest", exercises: [] }
});

export const ManualPlanner = ({ userData, onPlansCreated }) => {
  const [weeks, setWeeks] = useState([generateBaseWeek()]);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState("0");
  const [copiedDayPlan, setCopiedDayPlan] = useState(null);
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
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

  const daysOfWeek = [
    { id: "0", label: "Mon" },
    { id: "1", label: "Tue" },
    { id: "2", label: "Wed" },
    { id: "3", label: "Thu" },
    { id: "4", label: "Fri" },
    { id: "5", label: "Sat" },
    { id: "6", label: "Sun" }
  ];

  const updateWorkoutName = (name) => {
    const updatedWeeks = [...weeks];
    updatedWeeks[selectedWeek][selectedDay].workout_name = name;
    setWeeks(updatedWeeks);
  };

  const copyDay = () => {
    const currentDay = weeks[selectedWeek][selectedDay];
    setCopiedDayPlan(JSON.parse(JSON.stringify(currentDay)));
  };

  const pasteDay = () => {
    if (!copiedDayPlan) return;
    const updatedWeeks = [...weeks];
    updatedWeeks[selectedWeek][selectedDay] = JSON.parse(JSON.stringify(copiedDayPlan));
    setWeeks(updatedWeeks);
  };

  const editExercise = (idx) => {
    const ex = weeks[selectedWeek][selectedDay].exercises[idx];
    setExType(ex.type);
    setNewExName(ex.name);
    setNewExInstructions(ex.instructions || "");
    if (ex.type === "strength") {
      setNewExSets(ex.sets);
      setNewExReps(ex.reps);
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

    const updatedWeeks = [...weeks];
    if (editingIndex !== null) {
      updatedWeeks[selectedWeek][selectedDay].exercises[editingIndex] = newExercise;
      setEditingIndex(null);
    } else {
      updatedWeeks[selectedWeek][selectedDay].exercises.push(newExercise);
    }
    
    updatedWeeks[selectedWeek][selectedDay].estimated_duration_minutes = (updatedWeeks[selectedWeek][selectedDay].exercises.length + 1) * 10;
    
    setWeeks(updatedWeeks);
    setNewExName("");
    setNewExInstructions("");
  };

  const removeExercise = (idx) => {
    const updatedWeeks = [...weeks];
    updatedWeeks[selectedWeek][selectedDay].exercises.splice(idx, 1);
    setWeeks(updatedWeeks);
  };

  const clearDay = () => {
    const updatedWeeks = [...weeks];
    updatedWeeks[selectedWeek][selectedDay].exercises = [];
    updatedWeeks[selectedWeek][selectedDay].workout_name = "Rest Day";
    setWeeks(updatedWeeks);
  };

  const duplicateWeek = () => {
    const currentWeekCopy = JSON.parse(JSON.stringify(weeks[selectedWeek]));
    setWeeks([...weeks, currentWeekCopy]);
    setSelectedWeek(weeks.length);
  };

  const saveBulkPlans = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(API_URLS.BULK_PLANS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.id,
          start_date: startDate,
          end_date: endDate,
          weeks: weeks
        })
      });
      if (res.ok) {
        onPlansCreated();
      }
    } catch (e) {
      console.error("Failed saving plans", e);
    }
    setIsSaving(false);
  };

  const currentRoutine = weeks[selectedWeek];
  const currentDayPlan = currentRoutine[selectedDay];

  return (
    <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', paddingBottom: '40px' }}>
      <h2 className="text-center mb-4">Multi-Week Program Builder</h2>
      
      {/* Date Range Selection */}
      <div className="premium-card mb-4" style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1)', background: 'var(--surface-color)', outline: 'none', color: 'inherit' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1)', background: 'var(--surface-color)', outline: 'none', color: 'inherit' }}
          />
        </div>
      </div>

      {/* Week Selector */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', overflowX: 'auto', padding: '8px 0' }}>
        {weeks.map((_, idx) => (
          <Button 
            key={idx}
            variant={selectedWeek === idx ? 'primary' : 'default'}
            onClick={() => { setSelectedWeek(idx); setEditingIndex(null); }}
            style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
          >
            Week {idx + 1}
          </Button>
        ))}
        <Button onClick={duplicateWeek} style={{ padding: '8px 16px', whiteSpace: 'nowrap', backgroundColor: 'var(--bg-color)' }}>
          + Duplicate Week {selectedWeek + 1}
        </Button>
      </div>

      {/* 7-Day Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {daysOfWeek.map((day) => {
          const isSelected = selectedDay === day.id;
          const hasWorkout = currentRoutine[day.id].exercises.length > 0;
          return (
            <div 
              key={day.id}
              onClick={() => { setSelectedDay(day.id); setEditingIndex(null); }}
              style={{
                flex: '1',
                minWidth: '80px',
                textAlign: 'center',
                padding: '12px 8px',
                borderRadius: '16px',
                cursor: 'pointer',
                fontWeight: isSelected ? 800 : 600,
                backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--surface-color)',
                color: isSelected ? 'white' : 'var(--text-primary)',
                boxShadow: isSelected ? 'var(--premium-primary)' : 'var(--premium-shadow)',
                border: hasWorkout && !isSelected ? '2px solid var(--accent-secondary)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {day.label}
              <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '4px' }}>
                {hasWorkout ? `${currentRoutine[day.id].exercises.length} Ex` : 'Rest'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Builder */}
      <div className="premium-card mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            value={currentDayPlan.workout_name}
            onChange={(e) => updateWorkoutName(e.target.value)}
            placeholder="E.g., Pull Day or Rest Day"
            style={{ 
              flex: 1, minWidth: '200px', padding: '16px', borderRadius: '16px', border: 'none', 
              boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1)', 
              background: 'var(--surface-color)', outline: 'none', fontSize: '1.5rem', fontWeight: 700, color: 'inherit'
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={copyDay} style={{ padding: '12px 16px', backgroundColor: 'var(--bg-color)', fontSize: '0.9rem' }} title="Copy this day's workout">
              Copy Day
            </Button>
            {copiedDayPlan && (
              <Button onClick={pasteDay} style={{ padding: '12px 16px', backgroundColor: 'var(--accent-primary)', color: 'white', fontSize: '0.9rem' }} title="Paste copied workout">
                Paste Day
              </Button>
            )}
            <Button onClick={clearDay} style={{ padding: '12px 16px', backgroundColor: 'var(--bg-color)', fontSize: '0.9rem' }}>
              Make Rest Day
            </Button>
          </div>
        </div>

        {/* List of Exercises for selected day */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentDayPlan.exercises.map((ex, i) => (
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
            
            {currentDayPlan.exercises.length === 0 && (
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
              {editingIndex !== null ? 'Update Exercise' : `Add to ${daysOfWeek.find(d => d.id === selectedDay).label}`}
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
        onClick={saveBulkPlans}
        disabled={isSaving}
      >
        {isSaving ? "Saving to Calendar..." : `Apply ${weeks.length}-Week Program to Calendar`}
      </Button>
    </div>
  );
};
