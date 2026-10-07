import { CarOption } from '../types/game';

export const CARS: CarOption[] = [
  {
    id: 'gt3_rs',
    name: 'Apex GT3 RS',
    subtitle: 'Track Precision Master',
    inspiration: 'Porsche 911 GT3 RS',
    specs: {
      topSpeed: 312,
      acceleration: 88,
      handling: 98,
      nitroCapacity: 84,
      armor: 78,
    },
    defaultColor: '#10b981', // Acid Mint Green matching Redline style
    availableColors: [
      { name: 'Redline Mint', hex: '#10b981', accent: '#064e3b' },
      { name: 'Solar Yellow', hex: '#facc15', accent: '#854d0e' },
      { name: 'Lava Orange', hex: '#f97316', accent: '#7c2d12' },
      { name: 'Stuttgart White', hex: '#f8fafc', accent: '#334155' },
    ],
    description: 'Equipped with a giant swan-neck rear wing and active aero DRS. Unbeatable cornering stability and scalpel-sharp lane transitions.',
    soundPitch: 1.15,
  },
  {
    id: 'daytona_sp3',
    name: 'Rosso SP3 Daytona',
    subtitle: 'V12 Italian Stallion',
    inspiration: 'Ferrari Daytona SP3',
    specs: {
      topSpeed: 345,
      acceleration: 93,
      handling: 85,
      nitroCapacity: 88,
      armor: 80,
    },
    defaultColor: '#ef4444', // Corsa Red
    availableColors: [
      { name: 'Corsa Red', hex: '#ef4444', accent: '#7f1d1d' },
      { name: 'Modena Giallo', hex: '#eab308', accent: '#713f12' },
      { name: 'Blu Nart', hex: '#0284c7', accent: '#0c4a6e' },
      { name: 'Nero Daytona', hex: '#18181b', accent: '#3f3f46' },
    ],
    description: 'Sleek aerodynamic wedge body with horizontal rear blade strakes. Raw V12 screaming power capable of devastating straightaway speeds.',
    soundPitch: 1.3,
  },
  {
    id: 'gtr_nismo',
    name: 'Godzilla R35',
    subtitle: 'All-Wheel Cyber Demon',
    inspiration: 'Nissan GT-R Nismo',
    specs: {
      topSpeed: 325,
      acceleration: 96,
      handling: 82,
      nitroCapacity: 92,
      armor: 95,
    },
    defaultColor: '#8b5cf6', // Midnight Violet
    availableColors: [
      { name: 'Midnight Violet', hex: '#8b5cf6', accent: '#4c1d95' },
      { name: 'Stealth Carbon', hex: '#27272a', accent: '#52525b' },
      { name: 'Tokyo White', hex: '#f4f4f5', accent: '#dc2626' },
      { name: 'Cyber Blue', hex: '#06b6d4', accent: '#164e63' },
    ],
    description: 'Reinforced carbon chassis and brutal twin-turbo launch control. Shrugs off heavy traffic grazes and builds nitro at astonishing rates.',
    soundPitch: 0.95,
  },
  {
    id: 'huracan_sto',
    name: 'Toro Huracán STO',
    subtitle: 'Aggressive Aero Brawler',
    inspiration: 'Lamborghini Huracán STO',
    specs: {
      topSpeed: 332,
      acceleration: 94,
      handling: 90,
      nitroCapacity: 90,
      armor: 82,
    },
    defaultColor: '#06b6d4', // Comic Cyan
    availableColors: [
      { name: 'Hyper Cyan', hex: '#06b6d4', accent: '#f97316' },
      { name: 'Verde Shock', hex: '#84cc16', accent: '#15803d' },
      { name: 'Arancio Borealis', hex: '#fb923c', accent: '#9a3412' },
      { name: 'Viola Pasifae', hex: '#d946ef', accent: '#701a75' },
    ],
    description: 'Sculpted shark fin, roof air snorkel, and confetti-carbon bodywork. Engineered for instantaneous throttle snaps and hyper-reactive overtakes.',
    soundPitch: 1.25,
  },
  {
    id: 'valkyrie_amr',
    name: 'Nebula Valkyrie AMR',
    subtitle: 'F1 Hypercar Phenomenon',
    inspiration: 'Aston Martin Valkyrie',
    specs: {
      topSpeed: 362,
      acceleration: 98,
      handling: 96,
      nitroCapacity: 96,
      armor: 72,
    },
    defaultColor: '#ec4899', // Hot Redline Magenta
    availableColors: [
      { name: 'Redline Magenta', hex: '#ec4899', accent: '#831843' },
      { name: 'Podium Lime', hex: '#10b981', accent: '#047857' },
      { name: 'Cosmic Violet', hex: '#a855f7', accent: '#581c87' },
      { name: 'Titanium Slate', hex: '#64748b', accent: '#1e293b' },
    ],
    description: 'Radical Venturi underfloor tunnels generate aerospace-grade downforce. The apex predator of modern automotive engineering.',
    soundPitch: 1.45,
  },
];
