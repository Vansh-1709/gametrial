import React, { useState } from 'react';
import { CARS } from '../data/cars';
import { CarOption, TrackLocation } from '../types/game';
import { CarIllustration } from './CarIllustration';
import { SonosheeAvatar } from './SonosheeAvatar';
import { sound } from '../utils/audio';
import { ChevronLeft, ChevronRight, Gauge, Zap, Shield, RotateCw, Play, Volume2 } from 'lucide-react';

interface GarageMenuProps {
  selectedCar: CarOption;
  selectedColor: string;
  selectedTrack: TrackLocation;
  onSelectCar: (car: CarOption) => void;
  onSelectColor: (hex: string) => void;
  onStartRace: () => void;
  onOpenTrackSelect: () => void;
  onBackHome: () => void;
}

export const GarageMenu: React.FC<GarageMenuProps> = ({
  selectedCar,
  selectedColor,
  selectedTrack,
  onSelectCar,
  onSelectColor,
  onStartRace,
  onOpenTrackSelect,
  onBackHome,
}) => {
  const [viewMode, setViewMode] = useState<'rear' | 'top'>('rear');
  const [isRevving, setIsRevving] = useState(false);

  const currentIndex = CARS.findIndex((c) => c.id === selectedCar.id);

  const handlePrev = () => {
    sound.playUiClick();
    const nextIdx = (currentIndex - 1 + CARS.length) % CARS.length;
    onSelectCar(CARS[nextIdx]);
    onSelectColor(CARS[nextIdx].defaultColor);
  };

  const handleNext = () => {
    sound.playUiClick();
    const nextIdx = (currentIndex + 1) % CARS.length;
    onSelectCar(CARS[nextIdx]);
    onSelectColor(CARS[nextIdx].defaultColor);
  };

  const handleTestRev = () => {
    if (isRevving) return;
    setIsRevving(true);
    sound.updateEngine(selectedCar.specs.topSpeed * 0.7, selectedCar.specs.topSpeed, false, selectedCar.soundPitch);
    setTimeout(() => {
      sound.updateEngine(selectedCar.specs.topSpeed * 0.95, selectedCar.specs.topSpeed, true, selectedCar.soundPitch);
    }, 280);
    setTimeout(() => {
      sound.stopEngine();
      setIsRevving(false);
    }, 700);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-6 overflow-y-auto bg-gradient-to-b from-zinc-950 via-zinc-900 to-black select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b-4 border-black pb-3">
        <button
          onClick={() => {
            sound.playUiClick();
            onBackHome();
          }}
          className="bg-white hover:bg-yellow-300 text-black font-['Chakra_Petch',sans-serif] font-black text-xs sm:text-sm px-3 sm:px-4 py-2 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
        >
          ← HOME
        </button>

        <div className="text-center">
          <h1 className="font-['Bungee',sans-serif] text-xl sm:text-3xl text-yellow-300 tracking-wider text-stroke-black drop-shadow-[3px_3px_0px_#000]">
            GARAGE TUNING
          </h1>
          <p className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400">
            CHOOSE YOUR SUPERCAR & CUSTOMIZE LIVERY
          </p>
        </div>

        <button
          onClick={() => {
            sound.playUiClick();
            onOpenTrackSelect();
          }}
          className="bg-cyan-400 hover:bg-cyan-300 text-black font-['Chakra_Petch',sans-serif] font-black text-xs sm:text-sm px-3 sm:px-4 py-2 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5"
        >
          <span>CIRCUIT: {selectedTrack.name.split(' ')[0]}</span>
        </button>
      </div>

      {/* Main Garage Interactive Showcase */}
      <div className="flex-1 my-3 flex flex-col lg:flex-row items-center justify-center gap-6 max-w-6xl mx-auto w-full">
        {/* Left / Center: 3D Car Viewport */}
        <div className="relative w-full lg:w-3/5 bg-zinc-900/90 border-[4px] border-black rounded-3xl p-5 shadow-[6px_6px_0px_#000] flex flex-col items-center justify-between min-h-[340px] sm:min-h-[420px]">
          {/* Car Navigation Arrows & Title */}
          <div className="w-full flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="w-10 h-10 bg-white hover:bg-yellow-300 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center justify-center text-black active:translate-x-0.5 active:translate-y-0.5"
              aria-label="Previous Car"
            >
              <ChevronLeft className="w-6 h-6 stroke-[3]" />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-mono font-bold bg-yellow-400 text-black px-2 py-0.5 rounded border border-black uppercase">
                {selectedCar.inspiration}
              </span>
              <h2 className="font-['Chakra_Petch',sans-serif] font-black text-xl sm:text-3xl text-white tracking-wide mt-1">
                {selectedCar.name}
              </h2>
              <p className="text-xs font-mono text-cyan-300 font-semibold">{selectedCar.subtitle}</p>
            </div>

            <button
              onClick={handleNext}
              className="w-10 h-10 bg-white hover:bg-yellow-300 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center justify-center text-black active:translate-x-0.5 active:translate-y-0.5"
              aria-label="Next Car"
            >
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Interactive Car Illustration */}
          <div className="relative my-4 w-56 sm:w-80 h-44 sm:h-64 flex items-center justify-center">
            <CarIllustration
              carId={selectedCar.id}
              color={selectedColor}
              view={viewMode}
              isNitroActive={isRevving}
              className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* View Mode Toggle & Test Rev Button */}
          <div className="w-full flex items-center justify-between pt-2 border-t-2 border-zinc-800">
            <button
              onClick={() => {
                sound.playUiClick();
                setViewMode(viewMode === 'rear' ? 'top' : 'rear');
              }}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-['Chakra_Petch',sans-serif] font-bold text-xs px-3 py-1.5 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{viewMode === 'rear' ? 'TOP VIEW' : 'REAR VIEW'}</span>
            </button>

            <button
              onClick={handleTestRev}
              disabled={isRevving}
              className="bg-pink-500 hover:bg-pink-400 text-white font-['Chakra_Petch',sans-serif] font-black text-xs px-3 py-1.5 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isRevving ? 'REVVING!!' : 'TEST REV'}</span>
            </button>
          </div>
        </div>

        {/* Right: Car Specs & Livery Customizer */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4">
          {/* Livery Color Palette */}
          <div className="bg-zinc-900 border-[3.5px] border-black rounded-2xl p-4 shadow-[5px_5px_0px_#000]">
            <h3 className="font-['Chakra_Petch',sans-serif] font-black text-sm text-yellow-300 tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>LIVERY PAINT SCHEME</span>
            </h3>
            <div className="flex items-center gap-3">
              {selectedCar.availableColors.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => {
                    sound.playUiClick();
                    onSelectColor(col.hex);
                  }}
                  className={`relative w-10 h-10 rounded-xl border-[3px] border-black transition-all ${
                    selectedColor === col.hex ? 'scale-110 ring-4 ring-yellow-400 shadow-[3px_3px_0px_#000]' : 'opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
          </div>

          {/* Specs Dashboard Bars */}
          <div className="bg-zinc-900 border-[3.5px] border-black rounded-2xl p-4 shadow-[5px_5px_0px_#000]">
            <h3 className="font-['Chakra_Petch',sans-serif] font-black text-sm text-yellow-300 tracking-wider mb-3">
              VEHICLE TELEMETRY
            </h3>

            <div className="space-y-2.5">
              {/* Top Speed */}
              <div>
                <div className="flex justify-between text-xs font-['Chakra_Petch',sans-serif] font-bold text-zinc-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-pink-400" /> TOP SPEED
                  </span>
                  <span className="text-white font-mono">{selectedCar.specs.topSpeed} KM/H</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-950 border border-zinc-700 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-pink-500 rounded-full"
                    style={{ width: `${(selectedCar.specs.topSpeed / 370) * 100}%` }}
                  />
                </div>
              </div>

              {/* Acceleration */}
              <div>
                <div className="flex justify-between text-xs font-['Chakra_Petch',sans-serif] font-bold text-zinc-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> ACCELERATION
                  </span>
                  <span className="text-white font-mono">{selectedCar.specs.acceleration}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-950 border border-zinc-700 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${selectedCar.specs.acceleration}%` }}
                  />
                </div>
              </div>

              {/* Handling */}
              <div>
                <div className="flex justify-between text-xs font-['Chakra_Petch',sans-serif] font-bold text-zinc-300 mb-1">
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 text-cyan-400" /> CORNERING / HANDLING
                  </span>
                  <span className="text-white font-mono">{selectedCar.specs.handling}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-950 border border-zinc-700 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${selectedCar.specs.handling}%` }}
                  />
                </div>
              </div>

              {/* Armor */}
              <div>
                <div className="flex justify-between text-xs font-['Chakra_Petch',sans-serif] font-bold text-zinc-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" /> CHASSIS ARMOR
                  </span>
                  <span className="text-white font-mono">{selectedCar.specs.armor}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-950 border border-zinc-700 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${selectedCar.specs.armor}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] font-mono text-zinc-400 leading-relaxed border-t border-zinc-800 pt-2">
              {selectedCar.description}
            </p>
          </div>

          {/* Sonya Driver Advice Box */}
          <SonosheeAvatar
            size="sm"
            dialogue={`The ${selectedCar.name} is a beast! Let's take it out onto the ${selectedTrack.name}!`}
            mood="confident"
          />
        </div>
      </div>

      {/* Bottom Start CTA */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t-4 border-black">
        {/* Car quick thumbnail badges */}
        <div className="hidden md:flex items-center gap-2">
          {CARS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                sound.playUiClick();
                onSelectCar(c);
                onSelectColor(c.defaultColor);
              }}
              className={`px-3 py-1.5 rounded-xl border-[2.5px] border-black font-['Chakra_Petch',sans-serif] font-bold text-xs transition-all ${
                selectedCar.id === c.id
                  ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_#000] scale-105'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => {
            sound.playUiClick();
            onStartRace();
          }}
          className="w-full md:w-auto bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-['Bungee',sans-serif] text-base sm:text-xl px-8 py-3.5 border-[3.5px] border-black rounded-2xl shadow-[5px_5px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-3 transition-transform"
        >
          <Play className="w-6 h-6 fill-black" />
          <span>START RACING!!</span>
        </button>
      </div>
    </div>
  );
};
