import { useState } from 'react';
import { Button } from '../components/Button';
import { EQUIPMENT_LIST } from '../data/equipment';
import { LOCATIONS_LIST } from '../data/locations';
import { GOALS_LIST } from '../data/goals';

export const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(2);
  const [formData, setFormData] = useState({
    lifestyle: '',
    preferred_environment: '',
    goals: '',
    equipment: []
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleEquipment = (eqId) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(eqId) 
        ? prev.equipment.filter(i => i !== eqId)
        : [...prev.equipment, eqId]
    }));
  };

  const handleSubmit = async () => {
    onComplete(formData);
  };

  return (
    <div className="premium-card" style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Onboarding</h3>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Step {step - 1} of 3</span>
      </div>

      {step === 2 && (
        <div className="step-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 className="text-center" style={{ fontSize: '2rem' }}>Where do you prefer to train?</h2>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {LOCATIONS_LIST.map(loc => (
              <Button 
                key={loc.id}
                onClick={() => handleSelect('preferred_environment', loc.id)}
                className={formData.preferred_environment === loc.id ? 'premium-button-selected' : ''}
                style={{ flex: 1, minWidth: '200px', padding: '24px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
              >
                {loc.assetUrl ? (
                  <img src={loc.assetUrl} alt={loc.name} style={{ height: '30px' }} />
                ) : (
                  <span>{loc.icon}</span>
                )}
                <span>{loc.name}</span>
              </Button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <Button onClick={prevStep} style={{ flex: 1, padding: '16px', fontSize: '1.1rem' }}>Back</Button>
            <Button onClick={nextStep} variant="primary" style={{ flex: 1, padding: '16px', fontSize: '1.1rem' }}>Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 className="text-center" style={{ fontSize: '2rem' }}>What equipment do you have?</h2>
          <p className="text-center" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Select all that apply</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px' }}>
            {EQUIPMENT_LIST.map(eq => (
              <div 
                key={eq.id}
                onClick={() => toggleEquipment(eq.id)}
                style={{ 
                  padding: '24px', 
                  borderRadius: '20px', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  boxShadow: formData.equipment.includes(eq.id) ? 'var(--premium-shadow-active)' : 'var(--premium-shadow)',
                  backgroundColor: formData.equipment.includes(eq.id) ? 'var(--surface-color)' : 'var(--surface-color)',
                  color: formData.equipment.includes(eq.id) ? 'var(--accent-primary)' : 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                  transform: formData.equipment.includes(eq.id) ? 'translateY(2px)' : 'none',
                }}
              >
                <div style={{ height: '50px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {eq.assetUrl ? (
                    <img src={eq.assetUrl} alt={eq.name} style={{ height: '50px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ fontSize: '2.5rem' }}>{eq.icon}</div>
                  )}
                </div>
                <span style={{ fontWeight: '600' }}>{eq.name}</span>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <Button onClick={prevStep} style={{ flex: 1, padding: '16px', fontSize: '1.1rem' }}>Back</Button>
            <Button onClick={nextStep} variant="primary" style={{ flex: 1, padding: '16px', fontSize: '1.1rem' }}>Continue</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="step-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 className="text-center" style={{ fontSize: '2rem' }}>What's your primary goal?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {GOALS_LIST.map(goal => (
              <Button 
                key={goal.id}
                onClick={() => handleSelect('goals', goal.id)}
                className={formData.goals === goal.id ? 'premium-button-selected' : ''}
                style={{ padding: '24px', fontSize: '1.2rem' }}
              >
                {goal.name}
              </Button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <Button onClick={prevStep} style={{ flex: 1, padding: '16px', fontSize: '1.1rem' }}>Back</Button>
            <div style={{ display: 'flex', gap: '16px', flex: 2 }}>
              <Button onClick={() => onComplete(formData, 'manual')} style={{ flex: 1, padding: '16px', fontSize: '1.1rem' }}>Build Manual Plan</Button>
              <Button onClick={() => onComplete(formData, 'ai')} variant="primary" style={{ flex: 1, padding: '16px', fontSize: '1.1rem' }}>Generate with AI</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
