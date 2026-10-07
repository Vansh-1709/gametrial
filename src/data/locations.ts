import { TrackLocation } from '../types/game';

export const TRACKS: TrackLocation[] = [
  {
    id: 'beach',
    name: 'Neon Coastline',
    subtitle: 'Sunken Reef Highway',
    description: 'Vibrant turquoise waters, swaying comic palms, sea foam barriers, and golden sunshine inspired by the underwater Redline aesthetic.',
    themeColor: '#06b6d4',
    skyGradient: ['#0284c7', '#38bdf8', '#fed7aa'], // Aqua deep to sunny peach
    roadColor: '#18181b',
    curbLight: '#ec4899', // Hot Pink
    curbDark: '#ffffff',
    stripeColor: '#facc15',
    groundLight: '#0891b2', // Tropical ocean turquoise
    groundDark: '#0e7490',
    sceneryType: 'beach',
    difficulty: 'EASY',
    bonusMultiplier: 1.0,
    bgElements: ['palm', 'coral_rock', 'beach_umbrella', 'pier_sign'],
  },
  {
    id: 'mountain',
    name: 'Akina Ridge Pass',
    subtitle: 'Sunset Alpine Touge',
    description: 'Dramatic violet rock cliffs, winding hairpin turns, guardrails, and sweeping sunset mountain crests for drift masters.',
    themeColor: '#f97316',
    skyGradient: ['#312e81', '#7c2d12', '#ea580c'], // Deep indigo to fiery orange
    roadColor: '#27272a',
    curbLight: '#f97316', // Orange
    curbDark: '#ffffff',
    stripeColor: '#ffffff',
    groundLight: '#3f3f46', // Cliffside slate
    groundDark: '#27272a',
    sceneryType: 'mountain',
    difficulty: 'MEDIUM',
    bonusMultiplier: 1.25,
    bgElements: ['pine_tree', 'cliff_rock', 'guardrail_post', 'speed_cam'],
  },
  {
    id: 'city',
    name: 'Neo Shinjuku Wangan',
    subtitle: 'Midnight Cyber Expressway',
    description: 'Nocturnal expressway flanked by glowing neon skyscrapers, overhead toll gantries, flashing billboards, and high-density traffic.',
    themeColor: '#a855f7',
    skyGradient: ['#09090b', '#1e1b4b', '#4c1d95'], // Dark void to electric purple
    roadColor: '#09090b',
    curbLight: '#22d3ee', // Neon Cyan
    curbDark: '#ec4899', // Hot Pink
    stripeColor: '#38bdf8',
    groundLight: '#18181b', // Cyber pavement
    groundDark: '#0f172a',
    sceneryType: 'city',
    difficulty: 'EXPERT',
    bonusMultiplier: 1.5,
    bgElements: ['neon_tower', 'highway_gantry', 'streetlight', 'ad_billboard'],
  },
];
