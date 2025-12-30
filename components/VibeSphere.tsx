
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

interface VibeSphereProps {
  score: number;
}

const VibeSphere: React.FC<VibeSphereProps> = ({ score }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Color calculation based on sentiment score (-1 to 1)
  // -1: Crimson Red, 0: Indigo/Blue, 1: Emerald Green
  const color = useMemo(() => {
    if (score > 0.5) return '#10b981'; // Emerald
    if (score < -0.5) return '#ef4444'; // Crimson
    return '#6366f1'; // Indigo (Neutral)
  }, [score]);

  // Distortion factor
  const distortion = useMemo(() => {
    // High distortion for negative, smooth for positive
    return score < -0.3 ? Math.abs(score) * 1.5 : 0.4;
  }, [score]);

  // Speed factor
  const speed = useMemo(() => {
    return score < -0.5 ? 4 : score > 0.5 ? 1.5 : 2.5;
  }, [score]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere args={[1.5, 64, 64]} ref={meshRef}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distortion}
          speed={speed}
          roughness={0.1}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      {/* Background Glow */}
      <Sphere args={[1.6, 32, 32]}>
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.1} 
          side={THREE.BackSide} 
        />
      </Sphere>
    </Float>
  );
};

export default VibeSphere;
