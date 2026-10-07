import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onGarage: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onGarage,
  onHome,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none">
      <div className="relative w-full max-w-sm bg-zinc-950 border-[4px] border-black rounded-3xl p-6 shadow-[8px_8px_0px_#000] flex flex-col gap-5 text-center">
        <div>
          <h2 className="font-['Bungee',sans-serif] text-2xl sm:text-3xl text-yellow-300 tracking-wider">
            GAME PAUSED
          </h2>
          <p className="text-xs font-mono font-bold text-zinc-400 mt-0.5">
            TAKE A BREATHER, RACER
          </p>
        </div>

        {/* Controls Info Box */}
        <div className="bg-zinc-900 border-[2.5px] border-black rounded-xl p-3 text-left shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-mono font-bold text-cyan-300 block mb-1">
            KEYBOARD & TOUCH CONTROLS:
          </span>
          <div className="text-[11px] font-mono text-zinc-300 space-y-0.5">
            <div>• <b className="text-white">A / D or ← / →</b> : Steer Left / Right</div>
            <div>• <b className="text-white">W or ↑</b> : Gas / Accelerate</div>
            <div>• <b className="text-white">S or ↓</b> : Brake / Drift</div>
            <div>• <b className="text-white">SPACEBAR</b> : Nitro Boost Overdrive</div>
            <div>• <b className="text-white">TOUCH PADS</b> : On-screen mobile thumb buttons</div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playUiClick();
              onResume();
            }}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-['Bungee',sans-serif] text-sm py-3 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>RESUME RACE</span>
          </button>

          <button
            onClick={() => {
              sound.playUiClick();
              onRestart();
            }}
            className="w-full bg-white hover:bg-zinc-200 text-black font-['Chakra_Petch',sans-serif] font-black text-xs py-2.5 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART</span>
          </button>

          <button
            onClick={() => {
              sound.playUiClick();
              onGarage();
            }}
            className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-['Chakra_Petch',sans-serif] font-black text-xs py-2.5 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
          >
            GARAGE / SWITCH CAR
          </button>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleToggleMute}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-['Chakra_Petch',sans-serif] font-bold text-xs py-2 border-[2.5px] border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
            </button>

            <button
              onClick={() => {
                sound.playUiClick();
                onHome();
              }}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-['Chakra_Petch',sans-serif] font-bold text-xs px-4 py-2 border-[2.5px] border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1"
            >
              <Home className="w-4 h-4" />
              <span>QUIT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
