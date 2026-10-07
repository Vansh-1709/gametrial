import React, { useState } from 'react';
import { CarOption, TrackLocation, HighScoreRecord } from '../types/game';
import { CARS } from '../data/cars';
import { TRACKS } from '../data/locations';
import { CarIllustration } from './CarIllustration';
import { SonosheeAvatar } from './SonosheeAvatar';
import { sound } from '../utils/audio';
import { Play, Wrench, MapPin, Trophy, HelpCircle, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface HomeMenuProps {
  selectedCar: CarOption;
  selectedColor: string;
  selectedTrack: TrackLocation;
  highScores: HighScoreRecord[];
  onSelectCar: (car: CarOption) => void;
  onSelectTrack: (track: TrackLocation) => void;
  onStartRace: () => void;
  onOpenGarage: () => void;
  onOpenTrackSelect: () => void;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({
  selectedCar,
  selectedColor,
  selectedTrack,
  highScores,
  onSelectCar,
  onSelectTrack,
  onStartRace,
  onOpenGarage,
  onOpenTrackSelect,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleNextCar = () => {
    sound.playUiClick();
    const idx = CARS.findIndex((c) => c.id === selectedCar.id);
    const nextCar = CARS[(idx + 1) % CARS.length];
    onSelectCar(nextCar);
  };

  const handleNextTrack = () => {
    sound.playUiClick();
    const idx = TRACKS.findIndex((t) => t.id === selectedTrack.id);
    const nextTrack = TRACKS[(idx + 1) % TRACKS.length];
    onSelectTrack(nextTrack);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-6 overflow-y-auto bg-gradient-to-b from-black via-zinc-950 to-zinc-900 select-none">
      {/* Anime Comic Halftone Pattern Background Overlay */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Bar Contract (Single-line wordmark, audio, and help) */}
      <div className="relative z-10 flex items-center justify-between border-b-4 border-black pb-3">
        <div className="flex items-center gap-2">
          <span className="font-['Bungee',sans-serif] text-lg sm:text-2xl text-yellow-300 tracking-wider text-stroke-black drop-shadow-[2px_2px_0px_#000]">
            REDLINE OVERDRIVE
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-pink-500 border-2 border-black rounded font-mono font-black text-[10px] text-white rotate-2 shadow-[2px_2px_0px_#000]">
            60 FPS ARCADE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playUiClick();
              setShowHowToPlay(true);
            }}
            className="bg-white hover:bg-yellow-300 text-black font-['Chakra_Petch',sans-serif] font-bold text-xs px-3 py-1.5 border-[2.5px] border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden xs:inline">GUIDE</span>
          </button>

          <button
            onClick={() => {
              sound.playUiClick();
              setShowLeaderboard(true);
            }}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-['Chakra_Petch',sans-serif] font-bold text-xs px-3 py-1.5 border-[2.5px] border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden xs:inline">RECORDS</span>
          </button>

          <button
            onClick={handleToggleMute}
            className="w-9 h-9 bg-white hover:bg-yellow-300 text-black border-[2.5px] border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center justify-center active:translate-x-0.5 active:translate-y-0.5"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Hero Body Section */}
      <div className="relative z-10 flex-1 my-3 flex flex-col lg:flex-row items-center justify-center gap-6 max-w-6xl mx-auto w-full">
        {/* Left: Redline Title Art & Sonoshee Welcome Card */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 text-center lg:text-left">
          {/* Main Title Badge in Comic Art Style */}
          <div className="relative inline-block">
            <div className="text-[11px] font-mono font-black text-cyan-400 tracking-widest uppercase mb-1">
              レッドライン · RACING SYNDICATE
            </div>
            <h1 className="font-['Bungee',sans-serif] text-4xl sm:text-6xl text-yellow-300 tracking-tight leading-none text-stroke-black drop-shadow-[5px_5px_0px_#000]">
              REDLINE
            </h1>
            <div className="font-['Bungee',sans-serif] text-2xl sm:text-4xl text-pink-500 tracking-wider -mt-1 sm:-mt-2 text-stroke-black drop-shadow-[4px_4px_0px_#000]">
              OVERDRIVE
            </div>
            <p className="text-xs sm:text-sm font-['Chakra_Petch',sans-serif] font-bold text-zinc-300 mt-2 max-w-md mx-auto lg:mx-0">
              High-octane endless highway racing with cel-shaded modern sports cars, Beach, Mountain, and City loops!
            </p>
          </div>

          {/* Sonoshee Anime Character Card */}
          <div className="bg-zinc-900/90 border-[3.5px] border-black rounded-2xl p-3.5 shadow-[5px_5px_0px_#000] max-w-lg mx-auto lg:mx-0">
            <SonosheeAvatar
              size="md"
              dialogue="Welcome to the underground circuit! Pick your modern dream car and let's smoke the competition!"
              mood="confident"
            />
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => {
                sound.playUiClick();
                onStartRace();
              }}
              className="w-full sm:flex-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 hover:brightness-110 text-black font-['Bungee',sans-serif] text-lg sm:text-xl py-3.5 px-6 border-[3.5px] border-black rounded-2xl shadow-[5px_5px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-2.5 transition-all"
            >
              <Play className="w-6 h-6 fill-black" />
              <span>RACE NOW!</span>
            </button>

            <button
              onClick={() => {
                sound.playUiClick();
                onOpenGarage();
              }}
              className="w-full sm:w-auto bg-cyan-400 hover:bg-cyan-300 text-black font-['Chakra_Petch',sans-serif] font-black text-sm py-3.5 px-5 border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Wrench className="w-5 h-5 stroke-[2.5]" />
              <span>GARAGE</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Stage & Car Showcase Card */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 max-w-md">
          {/* Selected Car Preview Card */}
          <div className="relative bg-zinc-900 border-[3.5px] border-black rounded-2xl p-4 shadow-[5px_5px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2 mb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-yellow-400 uppercase">
                  ACTIVE CAR (1 OF 5)
                </span>
                <h3 className="font-['Chakra_Petch',sans-serif] font-black text-lg text-white">
                  {selectedCar.name}
                </h3>
              </div>

              <button
                onClick={handleNextCar}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-['Chakra_Petch',sans-serif] font-bold text-xs px-2.5 py-1.5 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]"
              >
                SWITCH ➔
              </button>
            </div>

            {/* Car Visual */}
            <div className="h-32 sm:h-36 flex items-center justify-center relative">
              <CarIllustration
                carId={selectedCar.id}
                color={selectedColor}
                view="rear"
                className="w-48 sm:w-56 h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-zinc-800 text-center font-mono">
              <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                <span className="text-[9px] text-zinc-400 block">TOP SPEED</span>
                <span className="text-xs font-bold text-pink-400">{selectedCar.specs.topSpeed} KM/H</span>
              </div>
              <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                <span className="text-[9px] text-zinc-400 block">ACCEL</span>
                <span className="text-xs font-bold text-yellow-400">{selectedCar.specs.acceleration}%</span>
              </div>
              <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                <span className="text-[9px] text-zinc-400 block">HANDLING</span>
                <span className="text-xs font-bold text-cyan-400">{selectedCar.specs.handling}%</span>
              </div>
            </div>
          </div>

          {/* Selected Track Preview Card */}
          <div className="relative bg-zinc-900 border-[3.5px] border-black rounded-2xl p-4 shadow-[5px_5px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2 mb-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                  ACTIVE CIRCUIT (1 OF 3)
                </span>
                <h3 className="font-['Chakra_Petch',sans-serif] font-black text-lg text-white">
                  {selectedTrack.name}
                </h3>
              </div>

              <button
                onClick={() => {
                  sound.playUiClick();
                  onOpenTrackSelect();
                }}
                className="bg-cyan-400 hover:bg-cyan-300 text-black font-['Chakra_Petch',sans-serif] font-bold text-xs px-2.5 py-1.5 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>CHANGE</span>
              </button>
            </div>

            <p className="text-xs font-mono text-zinc-400 line-clamp-2">
              {selectedTrack.description}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Features & Controls Notice */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t-2 border-zinc-800 text-[11px] font-mono text-zinc-400">
        <div>
          <span>CONTROLS: </span>
          <span className="text-white font-bold">WASD / ARROWS</span>
          <span className="mx-1">·</span>
          <span className="text-yellow-400 font-bold">SPACE: NITRO</span>
          <span className="mx-1">·</span>
          <span className="text-cyan-400 font-bold">TOUCH CONTROLS FOR MOBILE</span>
        </div>
        <div className="flex items-center gap-1 text-zinc-300 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>REDLINE ANIME ENGINE · 60 FPS</span>
        </div>
      </div>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 select-none">
          <div className="w-full max-w-md bg-zinc-950 border-[4px] border-black rounded-3xl p-5 shadow-[6px_6px_0px_#000] flex flex-col gap-4">
            <h3 className="font-['Bungee',sans-serif] text-xl text-yellow-300">
              RACING GUIDE & RULES
            </h3>
            <div className="space-y-2 text-xs font-mono text-zinc-300 leading-relaxed">
              <p>
                <b className="text-cyan-300">1. GOAL:</b> Race endlessly along the 3-lane curved highway. Distance & speed rack up massive points!
              </p>
              <p>
                <b className="text-yellow-300">2. NEAR MISSES:</b> Pass close to traffic without colliding to trigger combo multipliers (x2, x3, up to x5) and earn bonus nitro!
              </p>
              <p>
                <b className="text-pink-400">3. NITRO OVERDRIVE:</b> Fill your nitro gauge by speeding, collecting tanks, or near-misses. Press SPACEBAR or the NITRO touch button to unleash extreme speeds and screen speedlines!
              </p>
              <p>
                <b className="text-emerald-400">4. PICKUPS:</b> Grab Blue Tanks for Nitro, Gold Coins for score combos, and Green Wrenches to repair armor damage!
              </p>
            </div>
            <button
              onClick={() => {
                sound.playUiClick();
                setShowHowToPlay(false);
              }}
              className="bg-yellow-400 text-black font-['Bungee',sans-serif] text-xs py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]"
            >
              GOT IT, LET'S RACE!
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 select-none">
          <div className="w-full max-w-md bg-zinc-950 border-[4px] border-black rounded-3xl p-5 shadow-[6px_6px_0px_#000] flex flex-col gap-4">
            <h3 className="font-['Bungee',sans-serif] text-xl text-yellow-300 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>CIRCUIT RECORDS</span>
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {highScores.length === 0 ? (
                <p className="text-xs font-mono text-zinc-400 py-4 text-center">
                  No records yet! Complete your first run to set a benchmark!
                </p>
              ) : (
                highScores.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-zinc-900 border-2 border-black rounded-xl text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-yellow-300 mr-2">#{i + 1}</span>
                      <span className="text-white font-bold">{rec.carName}</span>
                      <span className="text-zinc-500 text-[10px] block">{rec.trackName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-['Chakra_Petch',sans-serif] font-black text-cyan-300 text-sm block">
                        {rec.score.toLocaleString()} PTS
                      </span>
                      <span className="text-zinc-400 text-[10px]">
                        {(rec.distance / 1000).toFixed(2)} KM
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => {
                sound.playUiClick();
                setShowLeaderboard(false);
              }}
              className="bg-yellow-400 text-black font-['Bungee',sans-serif] text-xs py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]"
            >
              CLOSE RECORDS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
