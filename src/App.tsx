// Written by Claude GLM-5.1

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useGameStore } from "./store/gameStore";
import GameScene from "./components/Scene/GameScene";
import MainMenu from "./components/UI/MainMenu";
import GameHUD from "./components/UI/GameHUD";
import GameOver from "./components/UI/GameOver";

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const startGame = useGameStore((s) => s.startGame);

  return (
    <div className="w-full h-full relative bg-[#0a0a0f]">
      <Canvas
        camera={{ position: [0, 8, 8], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>

      {phase === "menu" && <MainMenu onStart={startGame} />}
      {phase === "playing" && <GameHUD />}
      {phase === "gameOver" && <GameOver />}
    </div>
  );
}
