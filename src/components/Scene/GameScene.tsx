// Written by Claude GLM-5.1

import { OrbitControls, Environment } from '@react-three/drei';
import GameBoard from '../Board/GameBoard';
import WaterPlane from '../Board/WaterPlane';

export default function GameScene() {
  return (
    <>
      {/* Camera controls */}
      <OrbitControls
        makeDefault
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={5}
        maxDistance={18}
        target={[0, 0, 0]}
        enablePan={false}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[8, 12, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 8, -5]} intensity={0.3} color="#ffd3a5" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffe0b2" distance={15} />

      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#0a1628', 15, 30]} />

      {/* Sky color */}
      <color attach="background" args={['#0a1628']} />

      {/* Game board */}
      <GameBoard />
      <WaterPlane />
    </>
  );
}
