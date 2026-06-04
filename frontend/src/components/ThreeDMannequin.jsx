import React, { useState, useEffect, Component } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei'

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
      
      const getMuscleFill = (muscle) => {
        if (selectedMuscle === 'all' || selectedMuscle === muscle) return accentColor;
        return baseColor;
      };

      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            (3D Viewer unavailable in your Linux browser. Displaying 2D Map.)
          </div>
          <svg width="200" height="400" viewBox="0 0 100 200" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>
            <g style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <circle cx="50" cy="20" r="12" fill="rgba(128,128,128,0.2)" />
              <path d="M 25 40 Q 50 30 75 40 L 85 55 L 15 55 Z" fill={getMuscleFill('shoulders')} onClick={() => onMuscleClick('shoulders')} />
              <path d="M 30 55 L 70 55 L 65 75 L 35 75 Z" fill={getMuscleFill('chest')} onClick={() => onMuscleClick('chest')} />
              <path d="M 15 55 L 25 100 L 10 100 Z" fill={getMuscleFill('arms')} onClick={() => onMuscleClick('arms')} />
              <path d="M 85 55 L 90 100 L 75 100 Z" fill={getMuscleFill('arms')} onClick={() => onMuscleClick('arms')} />
              <rect x="35" y="75" width="30" height="40" fill={getMuscleFill('core')} onClick={() => onMuscleClick('core')} />
              <path d="M 25 55 L 30 55 L 35 90 L 25 90 Z" fill={getMuscleFill('back')} onClick={() => onMuscleClick('back')} />
              <path d="M 75 55 L 70 55 L 65 90 L 75 90 Z" fill={getMuscleFill('back')} onClick={() => onMuscleClick('back')} />
              <path d="M 35 115 L 48 115 L 48 190 L 35 190 Z" fill={getMuscleFill('legs')} onClick={() => onMuscleClick('legs')} />
              <path d="M 52 115 L 65 115 L 65 190 L 52 190 Z" fill={getMuscleFill('legs')} onClick={() => onMuscleClick('legs')} />
            </g>
          </svg>
        </div>
      );
    }
    return this.props.children;
  }
}

const MuscleMesh = ({ position, rotation = [0,0,0], args, type = 'box', muscleName, selectedMuscle, onClick, accentColor, baseColor }) => {
  const [hovered, setHover] = useState(false)
  const isSelected = selectedMuscle === muscleName || selectedMuscle === 'all'
  const isActive = isSelected || hovered

  const color = isActive ? accentColor : baseColor

  return (
    <mesh 
      position={position} 
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { setHover(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(muscleName); }}
    >
      {type === 'box' && <boxGeometry args={args} />}
      {type === 'cylinder' && <cylinderGeometry args={args} />}
      {type === 'sphere' && <sphereGeometry args={args} />}
      
      <meshStandardMaterial 
        color={color} 
        wireframe={!isActive} 
        transparent
        opacity={isActive ? 0.9 : 0.3}
        emissive={isActive ? color : '#000000'}
        emissiveIntensity={isActive ? 0.6 : 0}
      />
    </mesh>
  )
}

const Mannequin = ({ selectedMuscle, onMuscleClick, accentColor, baseColor }) => {
  const commonProps = { selectedMuscle, onClick: onMuscleClick, accentColor, baseColor };
  
  return (
    <group position={[0, 1, 0]}>
      {/* Head */}
      <MuscleMesh type="sphere" position={[0, 2.5, 0]} args={[0.5, 32, 32]} muscleName="head" {...commonProps} />
      
      {/* Neck */}
      <MuscleMesh type="cylinder" position={[0, 1.8, 0]} args={[0.2, 0.2, 0.6, 16]} muscleName="head" {...commonProps} />

      {/* Shoulders */}
      <MuscleMesh type="sphere" position={[-1.2, 1.3, 0]} args={[0.4, 16, 16]} muscleName="shoulders" {...commonProps} />
      <MuscleMesh type="sphere" position={[1.2, 1.3, 0]} args={[0.4, 16, 16]} muscleName="shoulders" {...commonProps} />

      {/* Chest */}
      <MuscleMesh type="box" position={[0, 1.1, 0.2]} args={[1.8, 0.8, 0.4]} muscleName="chest" {...commonProps} />
      
      {/* Back */}
      <MuscleMesh type="box" position={[0, 1.1, -0.2]} args={[1.8, 0.8, 0.4]} muscleName="back" {...commonProps} />

      {/* Core / Abs */}
      <MuscleMesh type="box" position={[0, 0.2, 0.1]} args={[1.4, 1.0, 0.5]} muscleName="core" {...commonProps} />
      
      {/* Lower Back */}
      <MuscleMesh type="box" position={[0, 0.2, -0.2]} args={[1.4, 1.0, 0.3]} muscleName="back" {...commonProps} />

      {/* Arms (Left & Right) */}
      <MuscleMesh type="cylinder" position={[-1.4, 0.3, 0]} rotation={[0, 0, 0.2]} args={[0.25, 0.2, 1.8, 16]} muscleName="arms" {...commonProps} />
      <MuscleMesh type="cylinder" position={[1.4, 0.3, 0]} rotation={[0, 0, -0.2]} args={[0.25, 0.2, 1.8, 16]} muscleName="arms" {...commonProps} />

      {/* Pelvis */}
      <MuscleMesh type="box" position={[0, -0.5, 0]} args={[1.6, 0.6, 0.6]} muscleName="core" {...commonProps} />

      {/* Legs (Left & Right) */}
      <MuscleMesh type="cylinder" position={[-0.5, -1.8, 0]} args={[0.3, 0.2, 2.2, 16]} muscleName="legs" {...commonProps} />
      <MuscleMesh type="cylinder" position={[0.5, -1.8, 0]} args={[0.3, 0.2, 2.2, 16]} muscleName="legs" {...commonProps} />
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
    const getMuscleFill = (muscle) => {
      if (selectedMuscle === 'all' || selectedMuscle === muscle) return accentColor;
      return baseColor;
    };

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          (3D Viewer unavailable in your Linux browser. Displaying 2D Map.)
        </div>
        <svg width="200" height="400" viewBox="0 0 100 200" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>
          <g style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <circle cx="50" cy="20" r="12" fill="rgba(128,128,128,0.2)" />
            <path d="M 25 40 Q 50 30 75 40 L 85 55 L 15 55 Z" fill={getMuscleFill('shoulders')} onClick={() => onMuscleClick('shoulders')} />
            <path d="M 30 55 L 70 55 L 65 75 L 35 75 Z" fill={getMuscleFill('chest')} onClick={() => onMuscleClick('chest')} />
            <path d="M 15 55 L 25 100 L 10 100 Z" fill={getMuscleFill('arms')} onClick={() => onMuscleClick('arms')} />
            <path d="M 85 55 L 90 100 L 75 100 Z" fill={getMuscleFill('arms')} onClick={() => onMuscleClick('arms')} />
            <rect x="35" y="75" width="30" height="40" fill={getMuscleFill('core')} onClick={() => onMuscleClick('core')} />
            <path d="M 25 55 L 30 55 L 35 90 L 25 90 Z" fill={getMuscleFill('back')} onClick={() => onMuscleClick('back')} />
            <path d="M 75 55 L 70 55 L 65 90 L 75 90 Z" fill={getMuscleFill('back')} onClick={() => onMuscleClick('back')} />
            <path d="M 35 115 L 48 115 L 48 190 L 35 190 Z" fill={getMuscleFill('legs')} onClick={() => onMuscleClick('legs')} />
            <path d="M 52 115 L 65 115 L 65 190 L 52 190 Z" fill={getMuscleFill('legs')} onClick={() => onMuscleClick('legs')} />
          </g>
        </svg>
      </div>
    );
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
