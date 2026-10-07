import React, { useState, useEffect } from 'react';
import { SonosheeAvatar } from './SonosheeAvatar';
import { Volume2, VolumeX, Pause, Shield, Zap, Flame, Camera } from 'lucide-react';
import { CameraMode } from '../types/game';
import { sound } from '../utils/audio';

interface HUDProps {
  speed: number;
  maxSpeed: number;
  nitro: number;
  health: number;
  score: number;
  combo: number;
  distance: number;
  carName: string;
  trackName: string;
  cameraMode: CameraMode;
  onCycleCamera: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  speed,
  maxSpeed,
  nitro,
  health,
  score,
  combo,
  distance,
  carName,
  cameraMode,
  onCycleCamera,
  onPause,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [dialogue, setDialogue] = useState('Floor that gas pedal! Let\'s go beyond Redline!');
  const [dialogueMood, setDialogueMood] = useState<'confident' | 'excited' | 'shocked' | 'smug'>('confident');

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Dynamic Radio commentary from Sonoshee
  useEffect(() => {
    if (health < 30) {
      setDialogue('Car armor is critical! Dodge incoming traffic!');
      setDialogueMood('shocked');
    } else if (speed > maxSpeed * 1.1) {
      setDialogue('INTO OVERDRIVE!! We are breaking through the sound barrier!!');
      setDialogueMood('excited');
    } else if (combo >= 4) {
      setDialogue(`AMAZING NEAR-MISS COMBO x${combo}! Keep that streak alive!`);
      setDialogueMood('smug');
    } else if (nitro >= 95) {
      setDialogue('Nitro booster fully loaded! Hit SPACE or BOOST!');
      setDialogueMood('confident');
    } else if (distance > 3000 && distance < 3200) {
      setDialogue('3 Kilometers cleared! You have got real racing talent!');
      setDialogueMood('excited');
    }
  }, [health, speed, combo, nitro, distance, maxSpeed]);

  const nitroPercent = Math.min(100, Math.max(0, nitro));
  const healthPercent = Math.min(100, Math.max(0, health));
  const speedRatio = Math.min(1.3, speed / maxSpeed);

  // Simulated Turbo Boost & G-force
  const boostBar = (speedRatio * 1.8 + (speedRatio > 1 ? 0.6 : 0)).toFixed(1);
  const gForce = (1.0 + Math.abs(speedRatio) * 0.9).toFixed(1);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none z-20">
      {/* Top Bar: Radio, Score & Controls */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: Driver Radio Chatter Box */}
        <div className="pointer-events-auto flex items-center gap-2 max-w-[280px] sm:max-w-md">
          <SonosheeAvatar size="sm" dialogue={dialogue} mood={dialogueMood} />
        </div>

        {/* Center/Right: Score, Distance & Top Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Combo Badge */}
          {combo > 1 && (
            <div className="hidden xs:flex items-center gap-1 bg-yellow-400 border-[3px] border-black px-2.5 py-1 rounded-lg shadow-[3px_3px_0px_#000] animate-bounce">
              <Flame className="w-4 h-4 text-red-600 fill-red-600" />
              <span className="font-['Chakra_Petch',sans-serif] font-black text-black text-xs sm:text-sm tracking-wider">
                x{combo} COMBO
              </span>
            </div>
          )}

          {/* Score & Distance Panel */}
          <div className="bg-black/85 backdrop-blur-sm border-[3px] border-white px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_#000] text-right">
            <div className="font-['Chakra_Petch',sans-serif] font-black text-yellow-300 text-base sm:text-xl tracking-wider leading-none">
              {score.toLocaleString()}
              <span className="text-[10px] text-zinc-400 font-bold ml-1">PTS</span>
            </div>
            <div className="text-[10px] sm:text-xs font-mono font-bold text-cyan-300 tracking-wider">
              {(distance / 1000).toFixed(2)} KM
            </div>
          </div>

          {/* Action Buttons: Camera, Sound & Pause */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            {/* Camera View Switcher */}
            <button
              onClick={onCycleCamera}
              className="bg-yellow-400 hover:bg-yellow-300 active:translate-x-0.5 active:translate-y-0.5 border-[3px] border-black px-2.5 h-9 sm:h-10 rounded-lg shadow-[3px_3px_0px_#000] flex items-center gap-1.5 text-black font-['Chakra_Petch',sans-serif] font-black text-xs transition-transform"
              title="Change Camera View (Key: C)"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline uppercase">{cameraMode}</span>
            </button>

            <button
              onClick={handleToggleMute}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-yellow-300 active:translate-x-0.5 active:translate-y-0.5 border-[3px] border-black rounded-lg shadow-[3px_3px_0px_#000] flex items-center justify-center text-black transition-transform"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            <button
              onClick={onPause}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-yellow-300 active:translate-x-0.5 active:translate-y-0.5 border-[3px] border-black rounded-lg shadow-[3px_3px_0px_#000] flex items-center justify-center text-black transition-transform"
              title="Pause Game"
            >
              <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Cockpit Gauges */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pointer-events-none">
        {/* Left: Armor & Nitro Info */}
        <div className="flex flex-col gap-2 w-48 sm:w-60">
          {/* Armor Bar */}
          <div className="bg-black/85 backdrop-blur-sm border-[3px] border-black rounded-xl p-2 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between text-[11px] font-['Chakra_Petch',sans-serif] font-bold text-white mb-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> ARMOR
              </span>
              <span className={healthPercent < 35 ? 'text-red-400 animate-pulse font-black' : 'text-emerald-400'}>
                {healthPercent}%
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-900 border border-zinc-700 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  healthPercent > 50
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                    : healthPercent > 25
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                    : 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
                }`}
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>

          {/* Nitro Gauge */}
          <div className="bg-black/85 backdrop-blur-sm border-[3px] border-black rounded-xl p-2 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between text-[11px] font-['Chakra_Petch',sans-serif] font-bold text-white mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" /> NITRO N₂O
              </span>
              <span className={nitroPercent >= 95 ? 'text-yellow-300 font-black animate-bounce' : 'text-cyan-400'}>
                {nitroPercent >= 95 ? 'READY!' : `${nitroPercent}%`}
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-900 border border-zinc-700 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-pink-500 transition-all duration-100"
                style={{ width: `${nitroPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Anime Speedometer Cockpit with Turbo & G-Force Telemetry */}
        <div className="relative bg-black/90 backdrop-blur-md border-[3.5px] border-black rounded-2xl p-3 shadow-[5px_5px_0px_#000] flex items-center gap-3">
          {/* Circular Dial / Speed readout */}
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span
                className={`font-['Chakra_Petch',sans-serif] font-black text-3xl sm:text-5xl tracking-tighter leading-none italic ${
                  speedRatio > 1.05
                    ? 'text-pink-500 animate-pulse'
                    : speedRatio > 0.8
                    ? 'text-yellow-400'
                    : 'text-white'
                }`}
              >
                {speed}
              </span>
              <span className="font-['Chakra_Petch',sans-serif] font-black text-xs sm:text-sm text-cyan-400">
                KM/H
              </span>
            </div>

            {/* Car Name & Real-time Telemetry (Boost + G-Force) */}
            <div className="flex items-center justify-end gap-2 text-[10px] font-mono font-bold text-zinc-300 tracking-wider">
              <span className="text-pink-400">BOOST: {boostBar} BAR</span>
              <span className="text-yellow-300">G: {gForce}</span>
            </div>
            <div className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 tracking-wider truncate max-w-[140px]">
              {carName}
            </div>
          </div>

          {/* RPM Arc Meter (SVG) */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 relative flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#27272a"
                strokeWidth="9"
                strokeDasharray="180 360"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke={speedRatio > 1.0 ? '#ec4899' : speedRatio > 0.8 ? '#facc15' : '#06b6d4'}
                strokeWidth="9"
                strokeDasharray={`${Math.min(180, speedRatio * 180)} 360`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-mono font-bold text-zinc-400">RPM</span>
              <span className="text-[11px] font-mono font-black text-white leading-none">
                {Math.round(speed * 28)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
