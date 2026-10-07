export type GameState = 'HOME' | 'GARAGE' | 'TRACK_SELECT' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type CameraMode = 'chase' | 'hood' | 'cockpit';

export type TrackLocationId = 'beach' | 'mountain' | 'city';

export interface CarSpecs {
  topSpeed: number; // in km/h, e.g. 280 - 360
  acceleration: number; // 0-100 rating
  handling: number; // 0-100 rating
  nitroCapacity: number; // 0-100 rating
  armor: number; // 0-100 rating
}

export interface CarOption {
  id: string;
  name: string;
  subtitle: string;
  inspiration: string;
  specs: CarSpecs;
  defaultColor: string;
  availableColors: { name: string; hex: string; accent: string }[];
  description: string;
  soundPitch: number;
}

export interface TrackLocation {
  id: TrackLocationId;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  skyGradient: [string, string, string];
  roadColor: string;
  curbLight: string;
  curbDark: string;
  stripeColor: string;
  groundLight: string;
  groundDark: string;
  sceneryType: 'beach' | 'mountain' | 'city';
  difficulty: 'EASY' | 'MEDIUM' | 'EXPERT';
  bonusMultiplier: number;
  bgElements: string[];
}

export interface GameStats {
  score: number;
  distance: number; // in meters
  topSpeedReached: number;
  overtakes: number;
  nearMisses: number;
  nitroUsed: number;
  coinsCollected: number;
  rank: 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C';
}

export interface ComicPopup {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
  life: number; // 0 to 1
  size: 'sm' | 'md' | 'lg';
}

export interface HighScoreRecord {
  score: number;
  distance: number;
  carName: string;
  trackName: string;
  date: string;
}
