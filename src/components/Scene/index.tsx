// Written by Claude Opus 4.7

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Board } from '../Board';
import { Water } from './Water';

export function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 8, 6], fov: 45 }}
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-3, 5, -3]} intensity={0.3} color="#ff9f43" />
      <Water />
      <Board />
      <OrbitControls
        minPolarAngle={0.3}
        maxPolarAngle={1.2}
        minDistance={6}
        maxDistance={16}
        enablePan={false}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
