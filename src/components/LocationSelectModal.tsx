import React from 'react';
import { TRACKS } from '../data/locations';
import { TrackLocation } from '../types/game';
import { sound } from '../utils/audio';
import { X, Check, Waves, Mountain, Building2, Flame } from 'lucide-react';

interface LocationSelectModalProps {
  currentTrack: TrackLocation;
  onSelectTrack: (track: TrackLocation) => void;
  onClose: () => void;
}

export const LocationSelectModal: React.FC<LocationSelectModalProps> = ({
  currentTrack,
  onSelectTrack,
  onClose,
}) => {
  const getTrackIcon = (id: string) => {
    switch (id) {
      case 'beach':
        return <Waves className="w-6 h-6 text-cyan-300" />;
      case 'mountain':
        return <Mountain className="w-6 h-6 text-orange-400" />;
      case 'city':
        return <Building2 className="w-6 h-6 text-purple-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none">
      <div className="relative w-full max-w-3xl bg-zinc-950 border-[4px] border-black rounded-3xl p-5 sm:p-7 shadow-[8px_8px_0px_#000] flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-3">
          <div>
            <h2 className="font-['Bungee',sans-serif] text-xl sm:text-3xl text-yellow-300 tracking-wider">
              SELECT RACING CIRCUIT
            </h2>
            <p className="text-xs font-mono font-bold text-zinc-400">
              CHOOSE YOUR ENDLESS HIGHWAY STAGE
            </p>
          </div>
          <button
            onClick={() => {
              sound.playUiClick();
              onClose();
            }}
            className="w-10 h-10 bg-white hover:bg-yellow-300 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center justify-center text-black active:translate-x-0.5 active:translate-y-0.5"
            aria-label="Close"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* 3 Circuit Cards (Beach, Mountain, City) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRACKS.map((track) => {
            const isSelected = track.id === currentTrack.id;

            return (
              <div
                key={track.id}
                onClick={() => {
                  sound.playUiClick();
                  onSelectTrack(track);
                }}
                className={`cursor-pointer rounded-2xl border-[3.5px] border-black p-4 flex flex-col justify-between transition-all duration-150 ${
                  isSelected
                    ? 'bg-zinc-800 ring-4 ring-yellow-400 shadow-[5px_5px_0px_#000] scale-102'
                    : 'bg-zinc-900/90 hover:bg-zinc-850 opacity-80 hover:opacity-100 shadow-[3px_3px_0px_#000]'
                }`}
              >
                {/* Circuit Banner / Preview Frame */}
                <div
                  className="w-full h-28 rounded-xl border-[2.5px] border-black overflow-hidden relative p-3 flex flex-col justify-between mb-3 shadow-[2px_2px_0px_#000]"
                  style={{
                    background: `linear-gradient(135deg, ${track.skyGradient[0]}, ${track.skyGradient[1]}, ${track.skyGradient[2]})`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 bg-black/60 rounded-lg backdrop-blur-sm">
                      {getTrackIcon(track.id)}
                    </span>
                    <span className="px-2 py-0.5 bg-black text-[10px] font-['Chakra_Petch',sans-serif] font-black text-yellow-300 border border-black rounded">
                      {track.difficulty}
                    </span>
                  </div>

                  {/* Curbs graphic strip */}
                  <div className="w-full h-4 bg-zinc-900 border border-black rounded flex overflow-hidden">
                    <div className="w-1/2 h-full" style={{ backgroundColor: track.curbLight }} />
                    <div className="w-1/2 h-full" style={{ backgroundColor: track.curbDark }} />
                  </div>
                </div>

                {/* Track Details */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Chakra_Petch',sans-serif] font-black text-lg text-white">
                      {track.name}
                    </h3>
                    {isSelected && (
                      <span className="w-6 h-6 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center text-black">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono font-semibold text-cyan-300 mb-2">
                    {track.subtitle}
                  </p>
                  <p className="text-[11px] font-mono text-zinc-400 leading-snug">
                    {track.description}
                  </p>
                </div>

                {/* Bonus Multiplier Badge */}
                <div className="mt-3 pt-2 border-t border-zinc-700/60 flex items-center justify-between text-xs font-['Chakra_Petch',sans-serif] font-bold">
                  <span className="text-zinc-400">SCORE BONUS:</span>
                  <span className="text-yellow-400 flex items-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 fill-yellow-400" />
                    +{Math.round((track.bonusMultiplier - 1) * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Confirm */}
        <div className="flex items-center justify-end pt-2">
          <button
            onClick={() => {
              sound.playUiClick();
              onClose();
            }}
            className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-black font-['Bungee',sans-serif] text-sm px-8 py-3 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
          >
            CONFIRM CIRCUIT
          </button>
        </div>
      </div>
    </div>
  );
};
