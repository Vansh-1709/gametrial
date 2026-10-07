import React from 'react';
import { ChevronLeft, ChevronRight, Zap, Camera } from 'lucide-react';

interface TouchControlsProps {
  onControlChange: (control: 'left' | 'right' | 'accelerate' | 'brake' | 'nitro', active: boolean) => void;
  nitroLevel: number;
  onCycleCamera?: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onControlChange,
  nitroLevel,
  onCycleCamera,
}) => {
  const handlePointerDown = (control: 'left' | 'right' | 'accelerate' | 'brake' | 'nitro') => (e: React.PointerEvent) => {
    e.preventDefault();
    onControlChange(control, true);
  };

  const handlePointerUp = (control: 'left' | 'right' | 'accelerate' | 'brake' | 'nitro') => (e: React.PointerEvent) => {
    e.preventDefault();
    onControlChange(control, false);
  };

  return (
    <div className="absolute inset-x-0 bottom-3 px-3 sm:px-6 pointer-events-none flex justify-between items-end z-30 select-none touch-none">
      {/* Left Thumb: Steering Controls */}
      <div className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_#000]">
        {/* Steer Left Button */}
        <button
          type="button"
          onPointerDown={handlePointerDown('left')}
          onPointerUp={handlePointerUp('left')}
          onPointerLeave={handlePointerUp('left')}
          onPointerCancel={handlePointerUp('left')}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-white active:bg-yellow-300 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center text-black touch-none transition-transform"
          aria-label="Steer Left"
        >
          <ChevronLeft className="w-8 h-8 stroke-[3]" />
        </button>

        {/* Steer Right Button */}
        <button
          type="button"
          onPointerDown={handlePointerDown('right')}
          onPointerUp={handlePointerUp('right')}
          onPointerLeave={handlePointerUp('right')}
          onPointerCancel={handlePointerUp('right')}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-white active:bg-yellow-300 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center text-black touch-none transition-transform"
          aria-label="Steer Right"
        >
          <ChevronRight className="w-8 h-8 stroke-[3]" />
        </button>

        {/* Quick Camera button for mobile */}
        {onCycleCamera && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onCycleCamera();
            }}
            className="w-10 h-10 bg-yellow-400 active:bg-yellow-300 border-[2.5px] border-black rounded-xl shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center text-black touch-none"
            title="Cycle Camera"
          >
            <Camera className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Right Thumb: Gas, Brake & Giant NITRO Overdrive Button */}
      <div className="pointer-events-auto flex items-end gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_#000]">
        {/* Brake Button */}
        <button
          type="button"
          onPointerDown={handlePointerDown('brake')}
          onPointerUp={handlePointerUp('brake')}
          onPointerLeave={handlePointerUp('brake')}
          onPointerCancel={handlePointerUp('brake')}
          className="w-12 h-14 sm:w-14 sm:h-16 bg-rose-500 active:bg-rose-600 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center text-white font-['Chakra_Petch',sans-serif] font-black text-[10px] tracking-wider touch-none transition-transform"
          aria-label="Brake"
        >
          <span>STOP</span>
        </button>

        {/* Gas / Throttle Button */}
        <button
          type="button"
          onPointerDown={handlePointerDown('accelerate')}
          onPointerUp={handlePointerUp('accelerate')}
          onPointerLeave={handlePointerUp('accelerate')}
          onPointerCancel={handlePointerUp('accelerate')}
          className="w-14 h-16 sm:w-16 sm:h-20 bg-emerald-400 active:bg-emerald-500 border-[3.5px] border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center text-black font-['Chakra_Petch',sans-serif] font-black tracking-wider touch-none transition-transform"
          aria-label="Accelerate"
        >
          <span className="text-xs sm:text-sm">GAS</span>
        </button>

        {/* NITRO BOOST Overdrive Button */}
        <button
          type="button"
          onPointerDown={handlePointerDown('nitro')}
          onPointerUp={handlePointerUp('nitro')}
          onPointerLeave={handlePointerUp('nitro')}
          onPointerCancel={handlePointerUp('nitro')}
          className={`w-16 h-16 sm:w-20 sm:h-20 border-[3.5px] border-black rounded-xl shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center text-black font-['Chakra_Petch',sans-serif] font-black touch-none transition-all ${
            nitroLevel >= 90
              ? 'bg-gradient-to-tr from-cyan-400 via-sky-300 to-pink-400 animate-pulse text-black'
              : nitroLevel > 15
              ? 'bg-cyan-400 text-black'
              : 'bg-zinc-600 text-zinc-400 opacity-60'
          }`}
          aria-label="Nitro Boost"
        >
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
          <span className="text-[10px] sm:text-xs tracking-tighter">NITRO</span>
        </button>
      </div>
    </div>
  );
};
