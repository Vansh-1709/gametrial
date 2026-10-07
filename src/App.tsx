/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameState, CarOption, TrackLocation, GameStats, HighScoreRecord, CameraMode } from './types/game';
import { CARS } from './data/cars';
import { TRACKS } from './data/locations';
import { HomeMenu } from './components/HomeMenu';
import { GarageMenu } from './components/GarageMenu';
import { LocationSelectModal } from './components/LocationSelectModal';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { sound } from './utils/audio';

const STORAGE_KEY_RECORDS = 'redline_high_scores_v1';
const STORAGE_KEY_CAR = 'redline_selected_car_id';
const STORAGE_KEY_TRACK = 'redline_selected_track_id';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [cameraMode, setCameraMode] = useState<CameraMode>('chase');

  // Selected Car & Livery
  const [selectedCar, setSelectedCar] = useState<CarOption>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CAR);
    return CARS.find((c) => c.id === saved) || CARS[0];
  });
  const [selectedColor, setSelectedColor] = useState<string>(selectedCar.defaultColor);

  // Selected Track Location
  const [selectedTrack, setSelectedTrack] = useState<TrackLocation>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRACK);
    return TRACKS.find((t) => t.id === saved) || TRACKS[0];
  });

  // Track select modal open state
  const [isTrackSelectOpen, setIsTrackSelectOpen] = useState(false);

  // In-Game Live Telemetry
  const [inGameStats, setInGameStats] = useState({
    speed: 0,
    nitro: 100,
    health: 100,
    score: 0,
    combo: 1,
    distance: 0,
  });

  // Touch controls input state
  const [touchInput, setTouchInput] = useState({
    left: false,
    right: false,
    accelerate: false,
    brake: false,
    nitro: false,
  });

  // Is touch device detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Game over state
  const [lastGameStats, setLastGameStats] = useState<GameStats | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Persistent High Scores
  const [highScores, setHighScores] = useState<HighScoreRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Detect touch capability on mount
  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch || window.innerWidth <= 1024);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Save car & track preferences
  const handleSelectCar = (car: CarOption) => {
    setSelectedCar(car);
    setSelectedColor(car.defaultColor);
    localStorage.setItem(STORAGE_KEY_CAR, car.id);
  };

  const handleSelectTrack = (track: TrackLocation) => {
    setSelectedTrack(track);
    localStorage.setItem(STORAGE_KEY_TRACK, track.id);
    setIsTrackSelectOpen(false);
  };

  // Start race
  const handleStartRace = () => {
    sound.stopMusic();
    setInGameStats({
      speed: 0,
      nitro: 100,
      health: 100,
      score: 0,
      combo: 1,
      distance: 0,
    });
    setGameState('PLAYING');
  };

  // Pause & Resume
  const handlePause = () => {
    setGameState('PAUSED');
  };

  const handleResume = () => {
    setGameState('PLAYING');
  };

  // Restart
  const handleRestart = () => {
    handleStartRace();
  };

  // Return to Garage or Home
  const handleGoGarage = () => {
    sound.stopEngine();
    sound.stopMusic();
    setGameState('GARAGE');
  };

  const handleGoHome = () => {
    sound.stopEngine();
    sound.stopMusic();
    setGameState('HOME');
  };

  // Touch control changes from virtual buttons
  const handleTouchControlChange = useCallback(
    (control: 'left' | 'right' | 'accelerate' | 'brake' | 'nitro', active: boolean) => {
      setTouchInput((prev) => ({
        ...prev,
        [control]: active,
      }));
    },
    []
  );

  // Game over handler
  const handleGameOver = useCallback(
    (stats: GameStats) => {
      setLastGameStats(stats);

      // Check if new record
      const isRecord = highScores.length === 0 || stats.score > (highScores[0]?.score || 0);
      setIsNewHighScore(isRecord);

      // Save high score
      const newRecord: HighScoreRecord = {
        score: stats.score,
        distance: stats.distance,
        carName: selectedCar.name,
        trackName: selectedTrack.name,
        date: new Date().toLocaleDateString(),
      };

      const updated = [...highScores, newRecord]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      setHighScores(updated);
      try {
        localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updated));
      } catch {
        // Ignored
      }

      setGameState('GAME_OVER');
    },
    [highScores, selectedCar.name, selectedTrack.name]
  );

  const handleCycleCamera = useCallback(() => {
    setCameraMode((prev) => {
      if (prev === 'chase') return 'hood';
      if (prev === 'hood') return 'cockpit';
      return 'chase';
    });
  }, []);

  // Live telemetry callback from game engine
  const handleStatsUpdate = useCallback(
    (data: { speed: number; nitro: number; health: number; score: number; combo: number; distance: number; camera: CameraMode }) => {
      setInGameStats(data);
      if (data.camera && data.camera !== cameraMode) {
        setCameraMode(data.camera);
      }
    },
    [cameraMode]
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-['Outfit',sans-serif]">
      {/* 1. Home Menu */}
      {gameState === 'HOME' && (
        <HomeMenu
          selectedCar={selectedCar}
          selectedColor={selectedColor}
          selectedTrack={selectedTrack}
          highScores={highScores}
          onSelectCar={handleSelectCar}
          onSelectTrack={handleSelectTrack}
          onStartRace={handleStartRace}
          onOpenGarage={handleGoGarage}
          onOpenTrackSelect={() => setIsTrackSelectOpen(true)}
        />
      )}

      {/* 2. Tuning Garage Screen */}
      {gameState === 'GARAGE' && (
        <GarageMenu
          selectedCar={selectedCar}
          selectedColor={selectedColor}
          selectedTrack={selectedTrack}
          onSelectCar={handleSelectCar}
          onSelectColor={setSelectedColor}
          onStartRace={handleStartRace}
          onOpenTrackSelect={() => setIsTrackSelectOpen(true)}
          onBackHome={handleGoHome}
        />
      )}

      {/* 3. Active 60 FPS Racing Canvas */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <div className="relative w-full h-full">
          <GameCanvas
            car={selectedCar}
            track={selectedTrack}
            customColor={selectedColor}
            cameraMode={cameraMode}
            onCycleCamera={handleCycleCamera}
            onGameOver={handleGameOver}
            onStatsUpdate={handleStatsUpdate}
            touchControls={touchInput}
          />

          {/* HUD Overlay */}
          <HUD
            speed={inGameStats.speed}
            maxSpeed={selectedCar.specs.topSpeed}
            nitro={inGameStats.nitro}
            health={inGameStats.health}
            score={inGameStats.score}
            combo={inGameStats.combo}
            distance={inGameStats.distance}
            carName={selectedCar.name}
            trackName={selectedTrack.name}
            cameraMode={cameraMode}
            onCycleCamera={handleCycleCamera}
            onPause={handlePause}
          />

          {/* On-Screen Mobile Touch Controls */}
          {isTouchDevice && (
            <TouchControls
              onControlChange={handleTouchControlChange}
              nitroLevel={inGameStats.nitro}
              onCycleCamera={handleCycleCamera}
            />
          )}
        </div>
      )}

      {/* 4. Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onGarage={handleGoGarage}
          onHome={handleGoHome}
        />
      )}

      {/* 5. Game Over Modal */}
      {gameState === 'GAME_OVER' && lastGameStats && (
        <GameOverModal
          stats={lastGameStats}
          car={selectedCar}
          track={selectedTrack}
          isNewRecord={isNewHighScore}
          onRestart={handleRestart}
          onGarage={handleGoGarage}
          onHome={handleGoHome}
        />
      )}

      {/* 6. Circuit Selection Modal (Accessible from Home or Garage) */}
      {isTrackSelectOpen && (
        <LocationSelectModal
          currentTrack={selectedTrack}
          onSelectTrack={handleSelectTrack}
          onClose={() => setIsTrackSelectOpen(false)}
        />
      )}
    </div>
  );
}
