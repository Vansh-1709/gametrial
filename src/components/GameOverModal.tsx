import React, { useEffect } from 'react';
import { GameStats, CarOption, TrackLocation } from '../types/game';
import { SonosheeAvatar } from './SonosheeAvatar';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Award, Gauge, Zap } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  car: CarOption;
  track: TrackLocation;
  isNewRecord: boolean;
  onRestart: () => void;
  onGarage: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  car,
  track,
  isNewRecord,
  onRestart,
  onGarage,
  onHome,
}) => {
  useEffect(() => {
    if (isNewRecord || stats.rank === 'SSS' || stats.rank === 'SS') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#facc15', '#06b6d4', '#ec4899', '#ffffff'],
        });
      } catch {
        // Ignored
      }
    }
  }, [isNewRecord, stats.rank]);

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'SSS':
        return 'bg-pink-500 text-white';
      case 'SS':
        return 'bg-yellow-400 text-black';
      case 'S':
        return 'bg-cyan-400 text-black';
      case 'A':
        return 'bg-emerald-400 text-black';
      case 'B':
        return 'bg-orange-400 text-black';
      default:
        return 'bg-zinc-600 text-white';
    }
  };

  const getSonosheeDialogue = () => {
    if (stats.rank === 'SSS' || stats.rank === 'SS') {
      return 'UNBELIEVABLE RUN!! You pushed that machine past its physical limits!';
    }
    if (stats.rank === 'S' || stats.rank === 'A') {
      return 'Great racing! Your reaction times on those near-misses were razor sharp!';
    }
    return 'Ouch, that was a wild impact! Brush off the dust and let’s hit the throttle again!';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-950 border-[4px] border-black rounded-3xl p-5 sm:p-7 shadow-[8px_8px_0px_#000] flex flex-col gap-4">
        {/* Header Title with Redline Comic Badge */}
        <div className="text-center relative border-b-4 border-black pb-3">
          {isNewRecord && (
            <div className="inline-block bg-yellow-400 text-black font-['Chakra_Petch',sans-serif] font-black text-xs px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_#000] uppercase mb-1 animate-bounce">
              ★ NEW HIGH SCORE RECORD! ★
            </div>
          )}
          <h2 className="font-['Bungee',sans-serif] text-2xl sm:text-4xl text-yellow-300 tracking-wider">
            RACE FINISHED!
          </h2>
          <p className="text-xs font-mono font-bold text-zinc-400">
            {car.name} · {track.name}
          </p>

          {/* Big Rank Stamp */}
          <div
            className={`absolute top-0 right-0 transform rotate-12 px-3 py-1.5 rounded-2xl border-[3.5px] border-black shadow-[4px_4px_0px_#000] font-['Bungee',sans-serif] text-2xl sm:text-3xl ${getRankColor(
              stats.rank
            )}`}
          >
            {stats.rank}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* Total Score */}
          <div className="col-span-2 sm:col-span-1 bg-zinc-900 border-[3px] border-black rounded-xl p-3 shadow-[3px_3px_0px_#000]">
            <span className="text-[10px] font-mono text-zinc-400 font-bold block">FINAL SCORE</span>
            <span className="font-['Chakra_Petch',sans-serif] font-black text-xl text-yellow-300">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {/* Distance */}
          <div className="bg-zinc-900 border-[3px] border-black rounded-xl p-3 shadow-[3px_3px_0px_#000]">
            <span className="text-[10px] font-mono text-zinc-400 font-bold block">DISTANCE</span>
            <span className="font-['Chakra_Petch',sans-serif] font-black text-xl text-cyan-300">
              {(stats.distance / 1000).toFixed(2)} KM
            </span>
          </div>

          {/* Top Speed */}
          <div className="bg-zinc-900 border-[3px] border-black rounded-xl p-3 shadow-[3px_3px_0px_#000]">
            <span className="text-[10px] font-mono text-zinc-400 font-bold block flex items-center gap-1">
              <Gauge className="w-3 h-3 text-pink-400" /> TOP SPEED
            </span>
            <span className="font-['Chakra_Petch',sans-serif] font-black text-xl text-white">
              {stats.topSpeedReached} KM/H
            </span>
          </div>

          {/* Near Misses */}
          <div className="bg-zinc-900 border-[3px] border-black rounded-xl p-3 shadow-[3px_3px_0px_#000]">
            <span className="text-[10px] font-mono text-zinc-400 font-bold block flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" /> NEAR MISSES
            </span>
            <span className="font-['Chakra_Petch',sans-serif] font-black text-xl text-yellow-400">
              {stats.nearMisses}
            </span>
          </div>

          {/* Overtakes */}
          <div className="bg-zinc-900 border-[3px] border-black rounded-xl p-3 shadow-[3px_3px_0px_#000]">
            <span className="text-[10px] font-mono text-zinc-400 font-bold block">OVERTAKES</span>
            <span className="font-['Chakra_Petch',sans-serif] font-black text-xl text-emerald-400">
              {stats.overtakes}
            </span>
          </div>

          {/* Coins */}
          <div className="bg-zinc-900 border-[3px] border-black rounded-xl p-3 shadow-[3px_3px_0px_#000]">
            <span className="text-[10px] font-mono text-zinc-400 font-bold block flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" /> REDLINE COINS
            </span>
            <span className="font-['Chakra_Petch',sans-serif] font-black text-xl text-amber-300">
              {stats.coinsCollected}
            </span>
          </div>
        </div>

        {/* Driver Commentary Box */}
        <SonosheeAvatar
          size="sm"
          dialogue={getSonosheeDialogue()}
          mood={stats.rank === 'SSS' || stats.rank === 'SS' ? 'excited' : 'confident'}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t-2 border-zinc-800">
          <button
            onClick={() => {
              sound.playUiClick();
              onRestart();
            }}
            className="w-full sm:flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-['Bungee',sans-serif] text-sm py-3.5 border-[3.5px] border-black rounded-xl shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>RACE AGAIN</span>
          </button>

          <button
            onClick={() => {
              sound.playUiClick();
              onGarage();
            }}
            className="w-full sm:w-auto bg-cyan-400 hover:bg-cyan-300 text-black font-['Chakra_Petch',sans-serif] font-black text-xs sm:text-sm px-5 py-3.5 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
          >
            TUNING GARAGE
          </button>

          <button
            onClick={() => {
              sound.playUiClick();
              onHome();
            }}
            className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white font-['Chakra_Petch',sans-serif] font-bold text-xs sm:text-sm px-4 py-3.5 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>HOME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
