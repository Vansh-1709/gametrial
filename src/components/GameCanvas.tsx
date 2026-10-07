import React, { useEffect, useRef } from 'react';
import { CarOption, TrackLocation, GameStats, CameraMode } from '../types/game';
import { GameEngine } from '../game/GameEngine';

interface GameCanvasProps {
  car: CarOption;
  track: TrackLocation;
  customColor: string;
  cameraMode: CameraMode;
  onCycleCamera?: () => void;
  onGameOver: (stats: GameStats) => void;
  onStatsUpdate: (data: { speed: number; nitro: number; health: number; score: number; combo: number; distance: number; camera: CameraMode }) => void;
  touchControls: {
    left: boolean;
    right: boolean;
    accelerate: boolean;
    brake: boolean;
    nitro: boolean;
  };
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  car,
  track,
  customColor,
  cameraMode,
  onCycleCamera,
  onGameOver,
  onStatsUpdate,
  touchControls,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.input.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.input.right = true;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        engine.input.accelerate = true;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'Shift') {
        engine.input.brake = true;
      }
      if (e.key === ' ' || e.key === 'Control') {
        engine.input.nitro = true;
      }
      if (e.key === 'c' || e.key === 'C') {
        if (onCycleCamera) {
          onCycleCamera();
        } else {
          engine.cycleCameraMode();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.input.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.input.right = false;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        engine.input.accelerate = false;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'Shift') {
        engine.input.brake = false;
      }
      if (e.key === ' ' || e.key === 'Control') {
        engine.input.nitro = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onCycleCamera]);

  // Sync camera mode changes
  useEffect(() => {
    if (engineRef.current && engineRef.current.cameraMode !== cameraMode) {
      engineRef.current.cameraMode = cameraMode;
    }
  }, [cameraMode]);

  // Sync touch controls with engine input
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.input.left = touchControls.left;
    engine.input.right = touchControls.right;
    engine.input.accelerate = touchControls.accelerate;
    engine.input.brake = touchControls.brake;
    engine.input.nitro = touchControls.nitro;
  }, [touchControls]);

  // Initialize and run engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, car, track, customColor);
    engine.cameraMode = cameraMode;
    engine.onGameOver = onGameOver;
    engine.onStatsUpdate = onStatsUpdate;
    engineRef.current = engine;

    engine.start();

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
      engineRef.current = null;
    };
  }, [car, track, customColor]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair touch-none"
      />
    </div>
  );
};

