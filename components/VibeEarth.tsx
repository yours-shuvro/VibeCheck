
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface VibeEarthProps {
  score: number;
}

const earthShader = {
  uniforms: {
    uTime: { value: 0 },
    uScore: { value: 0 },
    uDayMap: { value: null },
    uNightMap: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uScore;
    uniform sampler2D uDayMap;
    uniform sampler2D uNightMap;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec4 dayTex = texture2D(uDayMap, vUv);
      vec4 nightTex = texture2D(uNightMap, vUv);
      vec3 barrenColor = vec3(0.35, 0.3, 0.25);
      vec3 finalColor;
      
      if (uScore >= 0.0) {
        float t = uScore;
        finalColor = mix(barrenColor, dayTex.rgb, t);
        float lightsMask = smoothstep(0.5, 1.0, t);
        finalColor += nightTex.rgb * lightsMask * 2.0;
      } else {
        float t = -uScore;
        vec3 ashColor = vec3(0.15);
        vec3 sludgeColor = vec3(0.05, 0.03, 0.01);
        float isLand = step(0.02, (dayTex.r + dayTex.g) * 0.5 - dayTex.b);
        vec3 deathColor = mix(sludgeColor, ashColor, isLand);
        finalColor = mix(dayTex.rgb, deathColor, t);
        float noiseVal = snoise(vUv * 15.0 + uTime * 0.05);
        float crackMask = smoothstep(0.3, 0.45, noiseVal);
        vec3 lavaColor = vec3(1.0, 0.25, 0.0) * 3.5;
        float lavaIntensity = smoothstep(0.4, 1.0, t);
        finalColor = mix(finalColor, lavaColor, crackMask * lavaIntensity);
      }
      vec3 lightPos = normalize(vec3(5.0, 5.0, 5.0));
      float diff = max(0.15, dot(vNormal, lightPos));
      gl_FragColor = vec4(finalColor * diff, 1.0);
    }
  `
};

const atmosphereShader = {
  uniforms: {
    uScore: { value: 0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform float uScore;
    void main() {
      float intensity = pow(0.75 - dot(vNormal, normalize(vViewPosition)), 5.0);
      vec3 positiveColor = vec3(0.0, 0.95, 1.0);
      vec3 negativeColor = vec3(1.0, 0.35, 0.0);
      vec3 color = mix(vec3(0.4, 0.5, 1.0), positiveColor, clamp(uScore, 0.0, 1.0));
      color = mix(color, negativeColor, clamp(-uScore, 0.0, 1.0));
      gl_FragColor = vec4(color, intensity);
    }
  `
};

const VibeEarth: React.FC<VibeEarthProps> = ({ score }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const { gl, camera, size } = useThree();

  // Handle camera distance on mobile
  useEffect(() => {
    const isMobile = size.width < 768;
    camera.position.z = isMobile ? 12 : 8;
    camera.updateProjectionMatrix();
  }, [size.width, camera]);

  const [dayMap, nightMap, cloudMap] = useTexture([
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_lights_2048.png',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  useMemo(() => {
    dayMap.colorSpace = THREE.SRGBColorSpace;
    nightMap.colorSpace = THREE.SRGBColorSpace;
    cloudMap.colorSpace = THREE.SRGBColorSpace;
  }, [dayMap, nightMap, cloudMap]);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn("WebGL Context Lost. Attempting restoration...");
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      dayMap.dispose();
      nightMap.dispose();
      cloudMap.dispose();
      
      [meshRef, cloudRef, atmosphereRef].forEach(ref => {
        if (ref.current) {
          if (ref.current.geometry) ref.current.geometry.dispose();
          if (ref.current.material) {
            if (Array.isArray(ref.current.material)) {
              ref.current.material.forEach(m => m.dispose());
            } else {
              ref.current.material.dispose();
            }
          }
        }
      });
    };
  }, [gl, dayMap, nightMap, cloudMap]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const intensity = Math.abs(score);
    const rotationSpeed = 0.15 + intensity * 0.7;
    
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0015 * rotationSpeed;
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        mat.uniforms.uTime.value = time;
        mat.uniforms.uScore.value = score;
      }
    }

    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.002 * rotationSpeed;
      cloudRef.current.rotation.z += 0.0004 * rotationSpeed;
      const cloudMat = cloudRef.current.material as THREE.MeshStandardMaterial;
      cloudMat.opacity = Math.max(0.05, 0.45 + score * 0.35);
    }
    
    if (atmosphereRef.current) {
      const atmosMat = atmosphereRef.current.material as THREE.ShaderMaterial;
      if (atmosMat.uniforms) {
        atmosMat.uniforms.uScore.value = score;
      }
    }
  });

  const earthMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial(earthShader);
    mat.uniforms.uDayMap.value = dayMap;
    mat.uniforms.uNightMap.value = nightMap;
    return mat;
  }, [dayMap, nightMap]);

  const atmosMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial(atmosphereShader);
    mat.transparent = true;
    mat.side = THREE.BackSide;
    mat.blending = THREE.AdditiveBlending;
    return mat;
  }, []);

  return (
    <group>
      <Sphere args={[2.22, 128, 128]} ref={atmosphereRef}>
        <primitive object={atmosMaterial} attach="material" />
      </Sphere>
      <Sphere args={[2, 128, 128]} ref={meshRef}>
        <primitive object={earthMaterial} attach="material" />
      </Sphere>
      <Sphere args={[2.04, 128, 128]} ref={cloudRef}>
        <meshStandardMaterial 
          map={cloudMap} 
          transparent 
          opacity={0.4} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>
    </group>
  );
};

export default VibeEarth;
