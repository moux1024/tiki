// Written by Claude GLM-5.1

import { useRef } from "react";
import { Mesh } from "three";
import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import GameBoard from "../Board/GameBoard";

function WaterPlane() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial
        color="#1a6b8a"
        transparent
        opacity={0.85}
        roughness={0.2}
        metalness={0.3}
      />
    </mesh>
  );
}

export default function GameScene() {
  return (
    <>
      <OrbitControls
        makeDefault
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={5}
        maxDistance={18}
        target={[0, 0, 0]}
        enablePan={false}
      />

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

      <fog attach="fog" args={["#0a1628", 15, 30]} />
      <color attach="background" args={["#0a1628"]} />

      <GameBoard />
      <WaterPlane />
    </>
  );
}
