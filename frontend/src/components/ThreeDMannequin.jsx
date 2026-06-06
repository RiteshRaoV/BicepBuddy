import React, { useState, useEffect, Component } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, RoundedBox } from '@react-three/drei'

function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return gl !== null;
  } catch (e) {
    return false;
  }
}

class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("WebGL could not be initialized:", error);
  }

  render() {
    if (this.state.hasError) {
      const { selectedMuscle, onMuscleClick, accentColor, baseColor } = this.props;
      return <PremiumImageMap selectedMuscle={selectedMuscle} onMuscleClick={onMuscleClick} accentColor={accentColor} baseColor={baseColor} />;
    }
    return this.props.children;
  }
}

const PremiumImageMap = ({ selectedMuscle, onMuscleClick, accentColor, baseColor }) => {
  const [hoveredZone, setHoveredZone] = useState(null);

  const getFill = (muscleCategory) => {
    if (selectedMuscle === muscleCategory || hoveredZone === muscleCategory) {
      return accentColor;
    }
    return 'transparent';
  };

  const getStroke = (muscleCategory) => {
    if (selectedMuscle === muscleCategory || hoveredZone === muscleCategory) {
      return accentColor;
    }
    if (selectedMuscle === 'all') return 'rgba(255,255,255,0.1)';
    return 'transparent';
  };

  const commonProps = (muscleCategory) => ({
    onMouseEnter: () => setHoveredZone(muscleCategory),
    onMouseLeave: () => setHoveredZone(null),
    onClick: () => onMuscleClick(muscleCategory),
    fill: getFill(muscleCategory),
    stroke: getStroke(muscleCategory),
    strokeWidth: "1",
    rx: "6",
    style: { cursor: 'pointer', transition: 'all 0.3s ease', mixBlendMode: 'screen', opacity: 0.6 }
  });

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
      <div style={{ marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Interactive Anatomy Map (Front & Back)
      </div>
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', width: '100%', maxWidth: '900px' }}>
        
        {/* Front Map */}
        <div style={{ position: 'relative', flex: 1, aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', background: 'var(--surface-color)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
          <div style={{ position: 'absolute', width: '120%', height: '120%', transformOrigin: 'center center' }}>
            <img src="/assets/anatomy-front.png" alt="Front Anatomy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100">
              {/* Shoulders */}
              <rect x="29" y="21" width="12" height="10" {...commonProps('shoulders')} />
              <rect x="59" y="21" width="12" height="10" {...commonProps('shoulders')} />
              {/* Chest */}
              <rect x="39" y="23" width="22" height="12" {...commonProps('chest')} />
              {/* Arms */}
              <rect x="26" y="31" width="12" height="28" {...commonProps('arms')} />
              <rect x="62" y="31" width="12" height="28" {...commonProps('arms')} />
              {/* Core */}
              <rect x="41" y="35" width="18" height="20" {...commonProps('core')} />
              {/* Legs */}
              <rect x="37" y="55" width="12" height="40" {...commonProps('legs')} />
              <rect x="51" y="55" width="12" height="40" {...commonProps('legs')} />
            </svg>
          </div>
        </div>

        {/* Back Map */}
        <div style={{ position: 'relative', flex: 1, aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', background: 'var(--surface-color)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
          <div style={{ position: 'absolute', width: '120%', height: '120%', transformOrigin: 'center center' }}>
            <img src="/assets/anatomy-back.png" alt="Back Anatomy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100">
              {/* Shoulders */}
              <rect x="29" y="21" width="12" height="10" {...commonProps('shoulders')} />
              <rect x="59" y="21" width="12" height="10" {...commonProps('shoulders')} />
              {/* Back (Lats/Traps) */}
              <rect x="40" y="21" width="20" height="26" {...commonProps('back')} />
              {/* Arms */}
              <rect x="26" y="31" width="12" height="28" {...commonProps('arms')} />
              <rect x="62" y="31" width="12" height="28" {...commonProps('arms')} />
              {/* Legs */}
              <rect x="37" y="55" width="12" height="40" {...commonProps('legs')} />
              <rect x="51" y="55" width="12" height="40" {...commonProps('legs')} />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}

const MuscleMesh = ({ position, rotation = [0,0,0], args, type = 'box', muscleName, selectedMuscle, onClick, accentColor, baseColor }) => {
  const [hovered, setHover] = useState(false)
  const isSelected = selectedMuscle === muscleName || selectedMuscle === 'all'
  const isActive = isSelected || hovered

  const color = isActive ? accentColor : baseColor

  const materialProps = {
    color: color,
    wireframe: !isActive,
    transparent: true,
    opacity: isActive ? 0.9 : 0.3,
    emissive: isActive ? color : '#000000',
    emissiveIntensity: isActive ? 0.6 : 0
  }

  const handlePointerOver = (e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }
  const handlePointerOut = (e) => { setHover(false); document.body.style.cursor = 'auto'; }
  const handleClick = (e) => { e.stopPropagation(); onClick(muscleName); }

  if (type === 'rounded-box') {
    return (
      <RoundedBox 
        args={args} 
        position={position} 
        rotation={rotation} 
        radius={0.15} 
        smoothness={4}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <meshStandardMaterial {...materialProps} />
      </RoundedBox>
    )
  }

  return (
    <mesh 
      position={position} 
      rotation={rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {type === 'box' && <boxGeometry args={args} />}
      {type === 'cylinder' && <cylinderGeometry args={args} />}
      {type === 'capsule' && <capsuleGeometry args={args} />}
      {type === 'sphere' && <sphereGeometry args={args} />}
      
      <meshStandardMaterial {...materialProps} />
    </mesh>
  )
}

const Mannequin = ({ selectedMuscle, onMuscleClick, accentColor, baseColor }) => {
  const commonProps = { selectedMuscle, onClick: onMuscleClick, accentColor, baseColor };
  
  return (
    <group position={[0, 1.2, 0]}>
      {/* Head */}
      <MuscleMesh type="sphere" position={[0, 2.3, 0]} args={[0.35, 64, 64]} muscleName="head" {...commonProps} />
      
      {/* Neck */}
      <MuscleMesh type="cylinder" position={[0, 1.8, 0]} args={[0.15, 0.15, 0.5, 32]} muscleName="head" {...commonProps} />

      {/* Shoulders (Broad) */}
      <MuscleMesh type="sphere" position={[-0.9, 1.4, 0]} args={[0.35, 64, 64]} muscleName="shoulders" {...commonProps} />
      <MuscleMesh type="sphere" position={[0.9, 1.4, 0]} args={[0.35, 64, 64]} muscleName="shoulders" {...commonProps} />

      {/* Chest (Thick and wide) */}
      <MuscleMesh type="rounded-box" position={[0, 1.1, 0.15]} args={[1.6, 0.7, 0.4]} muscleName="chest" {...commonProps} />
      
      {/* Back (Lats flaring out - V taper) */}
      <MuscleMesh type="rounded-box" position={[0, 1.0, -0.15]} args={[1.7, 0.8, 0.4]} muscleName="back" {...commonProps} />

      {/* Core / Abs (Narrow waist) */}
      <MuscleMesh type="rounded-box" position={[0, 0.2, 0.1]} args={[1.0, 0.9, 0.35]} muscleName="core" {...commonProps} />
      
      {/* Lower Back (Narrow) */}
      <MuscleMesh type="rounded-box" position={[0, 0.2, -0.1]} args={[1.0, 0.9, 0.3]} muscleName="back" {...commonProps} />

      {/* Arms (Thick, using capsules) */}
      {/* Left Arm */}
      <MuscleMesh type="capsule" position={[-1.15, 0.4, 0]} rotation={[0, 0, 0.15]} args={[0.22, 1.2, 16, 32]} muscleName="arms" {...commonProps} />
      {/* Right Arm */}
      <MuscleMesh type="capsule" position={[1.15, 0.4, 0]} rotation={[0, 0, -0.15]} args={[0.22, 1.2, 16, 32]} muscleName="arms" {...commonProps} />

      {/* Pelvis */}
      <MuscleMesh type="rounded-box" position={[0, -0.4, 0]} args={[1.1, 0.5, 0.45]} muscleName="core" {...commonProps} />

      {/* Legs (Thick quads, capsules) */}
      <MuscleMesh type="capsule" position={[-0.35, -1.6, 0]} args={[0.25, 1.6, 16, 32]} muscleName="legs" {...commonProps} />
      <MuscleMesh type="capsule" position={[0.35, -1.6, 0]} args={[0.25, 1.6, 16, 32]} muscleName="legs" {...commonProps} />
    </group>
  )
}

export const ThreeDMannequin = ({ selectedMuscle, onMuscleClick }) => {
  const [accentColor, setAccentColor] = useState('#00ffcc')
  const [baseColor, setBaseColor] = useState('#555555')
  const [hasWebGL, setHasWebGL] = useState(checkWebGLSupport)

  useEffect(() => {
    // Small delay to ensure CSS variables are applied by themeConfig
    setTimeout(() => {
      const styles = getComputedStyle(document.documentElement);
      const accent = styles.getPropertyValue('--accent-primary').trim();
      const text = styles.getPropertyValue('--text-primary').trim();
      if (accent) setAccentColor(accent);
      if (text) setBaseColor(text);
    }, 100);
  }, []);

  if (!hasWebGL) {
    return <PremiumImageMap selectedMuscle={selectedMuscle} onMuscleClick={onMuscleClick} accentColor={accentColor} baseColor={baseColor} />;
  }

  return (
    <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
      <WebGLErrorBoundary selectedMuscle={selectedMuscle} onMuscleClick={onMuscleClick} accentColor={accentColor} baseColor={baseColor}>
        <Canvas camera={{ position: [0, 1.5, 6], fov: 50 }} gl={{ preserveDrawingBuffer: true, alpha: true }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Mannequin 
            selectedMuscle={selectedMuscle} 
            onMuscleClick={onMuscleClick} 
            accentColor={accentColor} 
            baseColor={baseColor} 
          />
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5} 
            autoRotate 
            autoRotateSpeed={2}
          />
          <Environment preset="city" />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  )
}
