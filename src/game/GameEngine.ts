import { CarOption, TrackLocation, ComicPopup, GameStats, CameraMode } from '../types/game';
import { sound } from '../utils/audio';

export interface TrafficCar {
  id: number;
  lane: number; // -0.7 to 0.7
  worldZ: number;
  speed: number;
  type: 'suv' | 'sedan' | 'truck' | 'rival';
  color: string;
  width: number;
  length: number;
  passed: boolean;
  trail: { x: number; y: number; alpha: number }[];
}

export interface PickupItem {
  id: number;
  type: 'nitro' | 'coin' | 'repair';
  lane: number;
  worldZ: number;
  collected: boolean;
  angle: number;
}

export interface SceneryObject {
  id: number;
  type: string;
  side: -1 | 1;
  worldZ: number;
  xOffset: number;
  scale: number;
}

export interface RoadHazard {
  id: number;
  type: 'oil' | 'cone';
  lane: number;
  worldZ: number;
  hit: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type?: 'spark' | 'smoke' | 'leaf' | 'rain' | 'spray';
}

export interface HighwayGantry {
  worldZ: number;
  signText: string;
  color: string;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Selected config
  public car: CarOption;
  public track: TrackLocation;
  public customColor: string;
  public cameraMode: CameraMode = 'chase';

  // Controls state
  public input = {
    left: false,
    right: false,
    accelerate: false,
    brake: false,
    nitro: false,
  };

  // Player state
  public playerX: number = 0; // -1 to 1 is road width, outside is off-road
  public playerSteer: number = 0; // For visual car leaning (-1 to 1)
  public playerPitch: number = 0; // Suspension pitch (-1 brake squat, +1 throttle lift)
  public playerZ: number = 0;
  public speed: number = 0; // in km/h
  public maxSpeed: number = 320;
  public nitro: number = 100; // 0 to 100
  public isNitroActive: boolean = false;
  public health: number = 100; // 0 to 100
  public isInvincible: boolean = false;
  public invincibleTimer: number = 0;
  public brakeHeat: number = 0; // 0 to 1 for glowing brake rotors

  // Scoring & stats
  public score: number = 0;
  public distance: number = 0; // in meters
  public overtakes: number = 0;
  public nearMisses: number = 0;
  public nitroUsed: number = 0;
  public coinsCollected: number = 0;
  public combo: number = 1;
  public comboTimer: number = 0;
  public topSpeedReached: number = 0;

  // Visual effects
  public screenShake: number = 0;
  public speedLineIntensity: number = 0;
  public chromaticAberration: number = 0;
  public comicPopups: ComicPopup[] = [];
  public particles: Particle[] = [];
  public weatherParticles: { x: number; y: number; speed: number; size: number }[] = [];
  private nextEntityId: number = 1;

  // Road geometry constants
  private segmentLength: number = 200;
  private totalSegments: number = 700;
  private roadWidth: number = 2200;
  private drawDistance: number = 190;
  private baseCameraHeight: number = 1150;
  private baseCameraDepth: number = 0.84;

  // Entities
  private traffic: TrafficCar[] = [];
  private pickups: PickupItem[] = [];
  private hazards: RoadHazard[] = [];
  private scenery: SceneryObject[] = [];
  private gantries: HighwayGantry[] = [];

  // Parallax background offsets
  private bgSkyOffset: number = 0;
  private bgHillsOffset: number = 0;

  // Callbacks
  public onGameOver: ((stats: GameStats) => void) | null = null;
  public onStatsUpdate: ((data: { speed: number; nitro: number; health: number; score: number; combo: number; distance: number; camera: CameraMode }) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, car: CarOption, track: TrackLocation, customColor?: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.car = car;
    this.track = track;
    this.customColor = customColor || car.defaultColor;
    this.maxSpeed = car.specs.topSpeed;

    this.resize();
    this.initWorld();
  }

  public resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.floor(rect.width * dpr);
    const height = Math.floor(rect.height * dpr);

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = Math.max(320, width);
      this.canvas.height = Math.max(240, height);
    }
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
    sound.playUiClick();
  }

  public cycleCameraMode() {
    const modes: CameraMode[] = ['chase', 'hood', 'cockpit'];
    const nextIdx = (modes.indexOf(this.cameraMode) + 1) % modes.length;
    this.setCameraMode(modes[nextIdx]);
  }

  private initWorld() {
    this.traffic = [];
    this.pickups = [];
    this.hazards = [];
    this.scenery = [];
    this.particles = [];
    this.comicPopups = [];
    this.gantries = [];
    this.weatherParticles = [];

    // Initialize environment weather particles
    const numWeather = this.track.id === 'city' ? 90 : this.track.id === 'mountain' ? 45 : 30;
    for (let i = 0; i < numWeather; i++) {
      this.weatherParticles.push({
        x: Math.random() * (this.canvas.width || 800),
        y: Math.random() * (this.canvas.height || 600),
        speed: 300 + Math.random() * 400,
        size: 1.5 + Math.random() * 2.5,
      });
    }

    // Seed road scenery objects along segments
    for (let i = 20; i < this.totalSegments; i += 5) {
      this.scenery.push({
        id: this.nextEntityId++,
        type: this.track.bgElements[Math.floor(Math.random() * this.track.bgElements.length)],
        side: -1,
        worldZ: i * this.segmentLength,
        xOffset: -1.6 - Math.random() * 0.9,
        scale: 0.85 + Math.random() * 0.45,
      });

      this.scenery.push({
        id: this.nextEntityId++,
        type: this.track.bgElements[Math.floor(Math.random() * this.track.bgElements.length)],
        side: 1,
        worldZ: i * this.segmentLength,
        xOffset: 1.6 + Math.random() * 0.9,
        scale: 0.85 + Math.random() * 0.45,
      });
    }

    // Seed Overhead Highway Gantries
    const gantryPhrases = [
      'OVERDRIVE ZONE: UNLIMITED',
      'REDLINE EXPRESSWAY',
      'WARNING: 300 KM/H SPEED LIMIT',
      'CAUTION: NITRO BURNOUT AHEAD',
      'SYNDICATE TOLL: CLEARED',
    ];
    for (let i = 80; i < this.totalSegments; i += 75) {
      this.gantries.push({
        worldZ: i * this.segmentLength,
        signText: gantryPhrases[Math.floor(Math.random() * gantryPhrases.length)],
        color: this.track.id === 'city' ? '#22d3ee' : this.track.id === 'mountain' ? '#f97316' : '#facc15',
      });
    }

    // Seed initial traffic ahead
    for (let i = 35; i < this.totalSegments; i += 16) {
      this.spawnTrafficAtZ(i * this.segmentLength);
    }

    // Seed initial pickups & hazards
    for (let i = 22; i < this.totalSegments; i += 12) {
      if (Math.random() > 0.38) {
        this.spawnPickupAtZ(i * this.segmentLength);
      } else if (Math.random() > 0.48) {
        this.spawnHazardAtZ(i * this.segmentLength);
      }
    }
  }

  private spawnTrafficAtZ(worldZ: number) {
    const lanes = [-0.65, -0.22, 0.22, 0.65];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const types: ('suv' | 'sedan' | 'truck' | 'rival')[] = ['sedan', 'suv', 'truck', 'rival'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = ['#3b82f6', '#e11d48', '#eab308', '#10b981', '#64748b', '#ec4899', '#a855f7', '#06b6d4'];

    const baseSpeeds = {
      truck: 140,
      suv: 180,
      sedan: 210,
      rival: 275,
    };

    this.traffic.push({
      id: this.nextEntityId++,
      lane,
      worldZ,
      speed: baseSpeeds[type] + (Math.random() * 32 - 16),
      type,
      color: colors[Math.floor(Math.random() * colors.length)],
      width: type === 'truck' ? 1.45 : 1.0,
      length: type === 'truck' ? 2.3 : 1.0,
      passed: false,
      trail: [],
    });
  }

  private spawnPickupAtZ(worldZ: number) {
    const lanes = [-0.6, -0.2, 0.2, 0.6];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const rand = Math.random();
    const type: 'nitro' | 'coin' | 'repair' = rand < 0.45 ? 'coin' : rand < 0.82 ? 'nitro' : 'repair';

    this.pickups.push({
      id: this.nextEntityId++,
      type,
      lane,
      worldZ,
      collected: false,
      angle: 0,
    });
  }

  private spawnHazardAtZ(worldZ: number) {
    const lanes = [-0.5, 0.0, 0.5];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const type: 'oil' | 'cone' = Math.random() > 0.5 ? 'oil' : 'cone';

    this.hazards.push({
      id: this.nextEntityId++,
      type,
      lane,
      worldZ,
      hit: false,
    });
  }

  public start() {
    this.lastTime = performance.now();
    sound.startMusic(this.track.id);

    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      this.update(dt);
      this.render();

      if (this.health > 0) {
        this.animFrameId = requestAnimationFrame(loop);
      } else {
        this.handleGameOver();
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sound.stopEngine();
    sound.stopMusic();
  }

  // Curvature function
  public getCurveAt(segIndex: number): number {
    const cycle = (segIndex % 180) / 180;
    return Math.sin(cycle * Math.PI * 2) * 2.8;
  }

  // 3D Elevation Hill profile
  public getElevationAt(segIndex: number): number {
    const s = segIndex % this.totalSegments;
    const hill1 = Math.sin(s * 0.038) * 620;
    const hill2 = Math.cos(s * 0.018) * 340;
    return hill1 + hill2;
  }

  private update(dt: number) {
    const accelRate = (this.car.specs.acceleration / 100) * 118;
    const dragRate = 35;
    const brakeRate = 240;

    // Nitro handling
    if (this.input.nitro && this.nitro > 4) {
      if (!this.isNitroActive) {
        sound.playNitro();
        this.addPopup('NITRO OVERDRIVE!!', '#38bdf8', 'lg');
      }
      this.isNitroActive = true;
      this.nitro = Math.max(0, this.nitro - dt * 25);
      this.nitroUsed += dt;
      const boostMax = this.maxSpeed * 1.25;
      this.speed = Math.min(boostMax, this.speed + accelRate * 2.45 * dt);
      this.playerPitch += (0.6 - this.playerPitch) * Math.min(1, 12 * dt);
    } else {
      this.isNitroActive = false;
      if (this.speed > 160) {
        this.nitro = Math.min(100, this.nitro + dt * (this.car.specs.nitroCapacity / 100) * 4);
      }
    }

    // Throttle & Brake
    if (this.input.accelerate || this.isNitroActive) {
      const targetMax = this.isNitroActive ? this.maxSpeed * 1.25 : this.maxSpeed;
      if (this.speed < targetMax) {
        this.speed += accelRate * dt;
      }
      this.playerPitch += (0.4 - this.playerPitch) * Math.min(1, 8 * dt);
      this.brakeHeat = Math.max(0, this.brakeHeat - dt * 0.6);
    } else if (this.input.brake) {
      this.speed = Math.max(0, this.speed - brakeRate * dt);
      this.playerPitch += (-0.8 - this.playerPitch) * Math.min(1, 14 * dt);
      this.brakeHeat = Math.min(1, this.brakeHeat + dt * 1.5);
      if (this.speed > 120 && Math.random() < 0.25) {
        sound.playDrift();
      }
    } else {
      this.speed = Math.max(0, this.speed - dragRate * dt);
      this.playerPitch += (0 - this.playerPitch) * Math.min(1, 8 * dt);
      this.brakeHeat = Math.max(0, this.brakeHeat - dt * 0.8);
    }

    // Off-road slowdown
    if (Math.abs(this.playerX) > 1.05) {
      this.speed = Math.max(50, this.speed - 140 * dt);
      if (Math.random() < 0.35) {
        this.screenShake = Math.max(this.screenShake, 4);
      }
    }

    if (this.speed > this.topSpeedReached) {
      this.topSpeedReached = Math.round(this.speed);
    }

    // Steering Physics
    const steerSpeed = (this.car.specs.handling / 100) * 2.6;
    let targetSteer = 0;
    if (this.input.left) targetSteer -= 1;
    if (this.input.right) targetSteer += 1;

    this.playerSteer += (targetSteer - this.playerSteer) * Math.min(1, 14 * dt);

    const speedRatio = this.speed / this.maxSpeed;
    this.playerX += this.playerSteer * steerSpeed * speedRatio * dt;
    this.playerX = Math.max(-2.2, Math.min(2.2, this.playerX));

    // World Progression
    const metersPerSec = (this.speed * 1000) / 3600;
    const distanceDelta = metersPerSec * dt;
    this.playerZ += distanceDelta * 40;
    this.distance += distanceDelta;

    // Parallax background
    const currentSegIdx = Math.floor(this.playerZ / this.segmentLength);
    const curveAmount = this.getCurveAt(currentSegIdx);
    this.bgSkyOffset += curveAmount * speedRatio * 0.003;
    this.bgHillsOffset += curveAmount * speedRatio * 0.008;

    const loopLength = this.totalSegments * this.segmentLength;
    if (this.playerZ >= loopLength) {
      this.playerZ -= loopLength;
    }

    // Engine Audio
    sound.updateEngine(this.speed, this.maxSpeed, this.isNitroActive, this.car.soundPitch);

    // Traffic, Pickups, Hazards
    this.updateTraffic(dt);
    this.updatePickups(dt);
    this.updateHazards();

    // Scoring & Combo
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 1;
    }
    this.score += Math.round(distanceDelta * 0.5 * this.combo * this.track.bonusMultiplier);

    // Timers
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) this.isInvincible = false;
    }
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 16);
    }

    // Speed Lines & Chromatic Aberration
    const speedThreshold = 210;
    if (this.speed > speedThreshold || this.isNitroActive) {
      const targetIntensity = this.isNitroActive
        ? 1.0
        : (this.speed - speedThreshold) / (this.maxSpeed - speedThreshold);
      this.speedLineIntensity += (targetIntensity - this.speedLineIntensity) * 0.12;
      this.chromaticAberration = this.isNitroActive ? 5 : (this.speed / this.maxSpeed) * 3;
    } else {
      this.speedLineIntensity = Math.max(0, this.speedLineIntensity - dt * 2.8);
      this.chromaticAberration = 0;
    }

    // Popups & Particles
    for (let i = this.comicPopups.length - 1; i >= 0; i--) {
      const popup = this.comicPopups[i];
      popup.life -= dt * 1.5;
      popup.y -= dt * 60;
      if (popup.life <= 0) this.comicPopups.splice(i, 1);
    }
    this.updateParticles(dt);

    // Weather Particles
    const w = this.canvas.width;
    const h = this.canvas.height;
    for (const wp of this.weatherParticles) {
      wp.y += wp.speed * dt;
      wp.x += (this.playerSteer * -150 - curveAmount * 80) * dt;
      if (wp.y > h) {
        wp.y = 0;
        wp.x = Math.random() * w;
      }
      if (wp.x < 0) wp.x = w;
      if (wp.x > w) wp.x = 0;
    }

    // Callback notification
    if (this.onStatsUpdate) {
      this.onStatsUpdate({
        speed: Math.round(this.speed),
        nitro: Math.round(this.nitro),
        health: Math.round(this.health),
        score: this.score,
        combo: this.combo,
        distance: Math.round(this.distance),
        camera: this.cameraMode,
      });
    }
  }

  private updateTraffic(dt: number) {
    const loopLength = this.totalSegments * this.segmentLength;

    for (const car of this.traffic) {
      const carMetersSec = (car.speed * 1000) / 3600;
      car.worldZ += (carMetersSec * 40) * dt;

      if (car.worldZ >= loopLength) {
        car.worldZ -= loopLength;
        car.passed = false;
      }

      let relZ = car.worldZ - this.playerZ;
      if (relZ < -loopLength / 2) relZ += loopLength;
      if (relZ > loopLength / 2) relZ -= loopLength;

      if (relZ < -600) {
        car.worldZ = (this.playerZ + 8000 + Math.random() * 6000) % loopLength;
        car.passed = false;
        continue;
      }

      const zDistance = Math.abs(relZ);
      const xDistance = Math.abs(car.lane - this.playerX);

      if (zDistance < 180 && xDistance < 0.42) {
        this.handleTrafficCollision(car);
      } else if (zDistance < 220 && xDistance < 0.75 && !car.passed && this.speed > car.speed + 25) {
        car.passed = true;
        this.handleNearMiss(car);
      }
    }
  }

  private handleTrafficCollision(trafficCar: TrafficCar) {
    if (this.isInvincible) return;

    sound.playCollision();
    this.screenShake = 18;
    this.isInvincible = true;
    this.invincibleTimer = 1.2;

    const armorRating = this.car.specs.armor;
    const damage = Math.round((100 - armorRating * 0.4) * 0.35);
    this.health = Math.max(0, this.health - damage);
    this.speed = Math.max(50, this.speed * 0.55);
    this.combo = 1;

    // Friction sparks & explosion particles
    for (let i = 0; i < 26; i++) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 80,
        y: this.canvas.height * 0.78 + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 500,
        vy: -Math.random() * 380,
        life: 0.65,
        maxLife: 0.65,
        color: Math.random() > 0.4 ? '#facc15' : '#ef4444',
        size: 4 + Math.random() * 6,
        type: 'spark',
      });
    }

    this.addPopup('CRUNCH! -' + damage + ' HP', '#ef4444', 'md');
  }

  private handleNearMiss(trafficCar: TrafficCar) {
    sound.playNearMiss(trafficCar.lane - this.playerX);
    this.nearMisses++;
    this.overtakes++;

    this.combo = Math.min(5, this.combo + 1);
    this.comboTimer = 3.5;
    this.nitro = Math.min(100, this.nitro + 14);

    const bonusPts = 250 * this.combo;
    this.score += bonusPts;

    const text = this.combo > 2 ? `NEAR MISS x${this.combo}! +${bonusPts}` : `+${bonusPts} CLOSE CALL!`;
    this.addPopup(text, '#facc15', 'sm');
  }

  private updatePickups(dt: number) {
    const loopLength = this.totalSegments * this.segmentLength;

    for (const item of this.pickups) {
      item.angle += dt * 4;

      let relZ = item.worldZ - this.playerZ;
      if (relZ < -loopLength / 2) relZ += loopLength;
      if (relZ > loopLength / 2) relZ -= loopLength;

      if (relZ < -300) {
        item.worldZ = (this.playerZ + 6000 + Math.random() * 4000) % loopLength;
        item.collected = false;
        continue;
      }

      if (!item.collected && Math.abs(relZ) < 140 && Math.abs(item.lane - this.playerX) < 0.45) {
        item.collected = true;
        sound.playPickup(item.type);

        if (item.type === 'nitro') {
          this.nitro = Math.min(100, this.nitro + 45);
          this.score += 250 * this.combo;
          this.addPopup('+NITRO REFILL!', '#38bdf8', 'sm');
        } else if (item.type === 'coin') {
          this.coinsCollected++;
          this.score += 400 * this.combo;
          this.addPopup('+400 REDLINE COIN!', '#facc15', 'sm');
        } else if (item.type === 'repair') {
          this.health = Math.min(100, this.health + 30);
          this.addPopup('+30% ARMOR REPAIRED!', '#10b981', 'sm');
        }
      }
    }
  }

  private updateHazards() {
    const loopLength = this.totalSegments * this.segmentLength;

    for (const h of this.hazards) {
      let relZ = h.worldZ - this.playerZ;
      if (relZ < -loopLength / 2) relZ += loopLength;
      if (relZ > loopLength / 2) relZ -= loopLength;

      if (relZ < -300) {
        h.worldZ = (this.playerZ + 7000 + Math.random() * 5000) % loopLength;
        h.hit = false;
        continue;
      }

      if (!h.hit && Math.abs(relZ) < 130 && Math.abs(h.lane - this.playerX) < 0.45) {
        h.hit = true;
        if (h.type === 'oil') {
          sound.playDrift();
          this.playerSteer = (Math.random() > 0.5 ? 1 : -1) * 1.6;
          this.speed = Math.max(80, this.speed * 0.7);
          this.screenShake = 12;
          this.addPopup('OIL SKID!!', '#a855f7', 'md');
        } else if (h.type === 'cone') {
          sound.playCollision();
          this.health = Math.max(0, this.health - 6);
          this.screenShake = 6;
          this.addPopup('CONE HIT! -6 HP', '#f97316', 'sm');
        }
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Mach Diamond Nitro Sparks
    if (this.isNitroActive) {
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height * (this.cameraMode === 'hood' ? 0.95 : 0.86);
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          x: cx + (Math.random() - 0.5) * 55,
          y: cy + 15,
          vx: (Math.random() - 0.5) * 220,
          vy: 140 + Math.random() * 260,
          life: 0.32,
          maxLife: 0.32,
          color: Math.random() > 0.5 ? '#38bdf8' : '#ec4899',
          size: 4 + Math.random() * 5,
          type: 'spark',
        });
      }
    }

    // Tire Smoke on Drift
    if (Math.abs(this.playerSteer) > 0.65 && this.speed > 160) {
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height * (this.cameraMode === 'hood' ? 0.95 : 0.88);
      this.particles.push({
        x: cx + (this.playerSteer > 0 ? -50 : 50),
        y: cy,
        vx: (Math.random() - 0.5) * 120,
        vy: -40 - Math.random() * 60,
        life: 0.45,
        maxLife: 0.45,
        color: '#f4f4f5',
        size: 10 + Math.random() * 14,
        type: 'smoke',
      });
    }
  }

  private addPopup(text: string, color: string, size: 'sm' | 'md' | 'lg') {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height * 0.44;
    this.comicPopups.push({
      id: this.nextEntityId++,
      text,
      color,
      x: cx + (Math.random() - 0.5) * 140,
      y: cy + (Math.random() - 0.5) * 60,
      life: 1.0,
      size,
    });
  }

  private handleGameOver() {
    this.stop();
    const rank: 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' =
      this.score > 25000
        ? 'SSS'
        : this.score > 15000
        ? 'SS'
        : this.score > 9000
        ? 'S'
        : this.score > 5000
        ? 'A'
        : this.score > 2500
        ? 'B'
        : 'C';

    const finalStats: GameStats = {
      score: this.score,
      distance: Math.round(this.distance),
      topSpeedReached: this.topSpeedReached,
      overtakes: this.overtakes,
      nearMisses: this.nearMisses,
      nitroUsed: Math.round(this.nitroUsed),
      coinsCollected: this.coinsCollected,
      rank,
    };

    if (this.onGameOver) {
      this.onGameOver(finalStats);
    }
  }

  // --- 60 FPS Render Pipeline ---
  public render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.save();
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // Dynamic Camera Configuration
    let camHeight = this.baseCameraHeight;
    let camDepth = this.baseCameraDepth;
    let horizonY = h * 0.46;

    if (this.cameraMode === 'hood') {
      camHeight = 520; // Very low to road
      horizonY = h * 0.42;
    } else if (this.cameraMode === 'cockpit') {
      camHeight = 780; // Eye level of driver
      horizonY = h * 0.44;
    }

    // Dynamic FOV Pull-Back on Nitro
    if (this.isNitroActive) {
      camDepth = this.baseCameraDepth * 0.76;
    }

    // Player elevation smoothing
    const currentSegIdx = Math.floor(this.playerZ / this.segmentLength);
    const playerElevation = this.getElevationAt(currentSegIdx);

    // 1. Parallax Cel-Shaded Sky
    this.renderBackground(w, h, horizonY);

    // 2. 3D Elevation Curved Road
    this.renderRoad(w, h, horizonY, camHeight, camDepth, playerElevation);

    // 3. World Entities (Traffic, Scenery, Pickups, Hazards, Gantries)
    this.renderWorldEntities(w, h, horizonY, camHeight, camDepth, playerElevation);

    // 4. Headlight Beams projected forward
    this.renderHeadlights(w, h, horizonY);

    // 5. Player Car / Cockpit Frame
    if (this.cameraMode === 'chase') {
      this.renderPlayerCar(w, h);
    } else if (this.cameraMode === 'cockpit') {
      this.renderCockpitInterior(w, h);
    } else if (this.cameraMode === 'hood') {
      this.renderHoodView(w, h);
    }

    // 6. Particles & Weather
    this.renderParticles();
    this.renderWeather(w, h);

    // 7. Manga Speedlines Overlay
    if (this.speedLineIntensity > 0.05) {
      this.renderSpeedlines(w, h);
    }

    // 8. Chromatic Aberration Post-Processing (RGB Split)
    if (this.chromaticAberration > 0.5) {
      this.renderChromaticAberration(w, h);
    }

    // 9. Floating Comic Text Popups
    this.renderPopups(ctx);

    ctx.restore();
  }

  private renderBackground(w: number, h: number, horizonY: number) {
    const ctx = this.ctx;

    // Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, this.track.skyGradient[0]);
    skyGrad.addColorStop(0.6, this.track.skyGradient[1]);
    skyGrad.addColorStop(1, this.track.skyGradient[2]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, horizonY);
    ctx.clip();

    if (this.track.id === 'beach') {
      // Tropical Turquoise Ocean
      const oceanY = horizonY * 0.68;
      const oceanGrad = ctx.createLinearGradient(0, oceanY, 0, horizonY);
      oceanGrad.addColorStop(0, '#0284c7');
      oceanGrad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, oceanY, w, horizonY - oceanY);

      // Ink wave foam crests
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      const waveOffset = (this.bgHillsOffset * 400) % 130;
      for (let x = -100; x < w + 100; x += 110) {
        ctx.beginPath();
        ctx.arc(x + waveOffset, oceanY + 12, 38, Math.PI, 0, false);
        ctx.stroke();
      }

      // Distant islands
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      for (let i = 0; i < 4; i++) {
        const islandX = ((i * 320 + this.bgSkyOffset * 250) % (w + 400)) - 100;
        ctx.beginPath();
        ctx.ellipse(islandX, oceanY + 4, 85, 28, 0, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
      }
    } else if (this.track.id === 'mountain') {
      // Jagged Anime Peaks with Bold Ink Outlines
      ctx.fillStyle = '#2e1065';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4.5;

      const peakOffset = (this.bgSkyOffset * 300) % (w + 200);
      ctx.beginPath();
      ctx.moveTo(-100, horizonY);
      for (let x = -100; x < w + 300; x += 130) {
        const peakHeight = horizonY * 0.32 + Math.sin(x * 0.02) * 55;
        ctx.lineTo(x + peakOffset - 100, peakHeight);
        ctx.lineTo(x + peakOffset - 25, horizonY);
      }
      ctx.lineTo(w + 100, horizonY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Neo Tokyo Cyber City Skylines with Glowing Neon Windows
      const cityOffset = (this.bgSkyOffset * 400) % 240;
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;

      for (let x = -100; x < w + 200; x += 65) {
        const towerH = 120 + Math.abs(Math.sin(x * 0.05)) * 150;
        const towerY = horizonY - towerH;
        ctx.fillRect(x + cityOffset - 50, towerY, 55, towerH);
        ctx.strokeRect(x + cityOffset - 50, towerY, 55, towerH);

        // Windows (Cyan & Magenta dots)
        for (let wy = towerY + 12; wy < horizonY - 10; wy += 14) {
          ctx.fillStyle = (x + wy) % 3 === 0 ? '#22d3ee' : '#ec4899';
          ctx.fillRect(x + cityOffset - 40, wy, 10, 5);
          ctx.fillRect(x + cityOffset - 22, wy, 10, 5);
        }
        ctx.fillStyle = '#09090b';
      }
    }

    ctx.restore();
  }

  private renderRoad(
    w: number,
    h: number,
    horizonY: number,
    camHeight: number,
    camDepth: number,
    playerElevation: number
  ) {
    const ctx = this.ctx;
    const currentSegIdx = Math.floor(this.playerZ / this.segmentLength);
    const roadH = h - horizonY;

    ctx.fillStyle = this.track.groundDark;
    ctx.fillRect(0, horizonY, w, roadH);

    let maxScreenY = h;
    let dx = 0;
    const camX = this.playerX * (this.roadWidth * 0.5);

    // Far to near segment rendering with 3D elevation
    for (let n = this.drawDistance; n >= 1; n--) {
      const segIdx = (currentSegIdx + n) % this.totalSegments;
      const worldZ = (currentSegIdx + n) * this.segmentLength;

      const segElevNear = this.getElevationAt(segIdx) - playerElevation;
      const segElevFar = this.getElevationAt(segIdx + 1) - playerElevation;

      const pNear = this.project3D(
        worldZ - this.playerZ,
        camX - dx,
        camHeight - segElevNear,
        camDepth,
        w,
        h,
        horizonY
      );

      const pFar = this.project3D(
        worldZ + this.segmentLength - this.playerZ,
        camX - dx - this.getCurveAt(segIdx) * 12,
        camHeight - segElevFar,
        camDepth,
        w,
        h,
        horizonY
      );

      dx += this.getCurveAt(segIdx) * 1.5;

      if (pNear.y >= maxScreenY || pFar.y >= pNear.y) continue;

      const isAlternate = Math.floor(segIdx / 4) % 2 === 0;

      // Ground strip
      ctx.fillStyle = isAlternate ? this.track.groundLight : this.track.groundDark;
      ctx.fillRect(0, pFar.y, w, pNear.y - pFar.y);

      // Curbs with 3D Bevel Edge
      const curbWNear = pNear.w * 1.25;
      const curbWFar = pFar.w * 1.25;
      ctx.fillStyle = isAlternate ? this.track.curbLight : this.track.curbDark;
      this.drawPolygon(
        ctx,
        pFar.x - curbWFar,
        pFar.y,
        pFar.x + curbWFar,
        pFar.y,
        pNear.x + curbWNear,
        pNear.y,
        pNear.x - curbWNear,
        pNear.y
      );

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Road Asphalt
      ctx.fillStyle = this.track.roadColor;
      this.drawPolygon(
        ctx,
        pFar.x - pFar.w,
        pFar.y,
        pFar.x + pFar.w,
        pFar.y,
        pNear.x + pNear.w,
        pNear.y,
        pNear.x - pNear.w,
        pNear.y
      );

      // Wet Asphalt Rain Reflections in City Track
      if (this.track.id === 'city' && isAlternate && Math.random() < 0.6) {
        ctx.fillStyle = 'rgba(34, 211, 238, 0.08)';
        ctx.fillRect(pNear.x - pNear.w * 0.8, pNear.y - 2, pNear.w * 1.6, 4);
      }

      // Lane Markings
      if (isAlternate) {
        const laneWNear = pNear.w * 0.05;
        const laneWFar = pFar.w * 0.05;
        ctx.fillStyle = this.track.stripeColor;

        // Center stripe
        this.drawPolygon(
          ctx,
          pFar.x - laneWFar * 0.5,
          pFar.y,
          pFar.x + laneWFar * 0.5,
          pFar.y,
          pNear.x + laneWNear * 0.5,
          pNear.y,
          pNear.x - laneWNear * 0.5,
          pNear.y
        );

        // Left lane
        const leftOffFar = pFar.w * 0.45;
        const leftOffNear = pNear.w * 0.45;
        this.drawPolygon(
          ctx,
          pFar.x - leftOffFar - laneWFar * 0.5,
          pFar.y,
          pFar.x - leftOffFar + laneWFar * 0.5,
          pFar.y,
          pNear.x - leftOffNear + laneWNear * 0.5,
          pNear.y,
          pNear.x - leftOffNear - laneWNear * 0.5,
          pNear.y
        );

        // Right lane
        this.drawPolygon(
          ctx,
          pFar.x + leftOffFar - laneWFar * 0.5,
          pFar.y,
          pFar.x + leftOffFar + laneWFar * 0.5,
          pFar.y,
          pNear.x + leftOffNear + laneWNear * 0.5,
          pNear.y,
          pNear.x + leftOffNear - laneWNear * 0.5,
          pNear.y
        );
      }
    }
  }

  private renderWorldEntities(
    w: number,
    h: number,
    horizonY: number,
    camHeight: number,
    camDepth: number,
    playerElevation: number
  ) {
    const ctx = this.ctx;
    const loopLength = this.totalSegments * this.segmentLength;

    type Renderable =
      | { kind: 'traffic'; obj: TrafficCar; relZ: number }
      | { kind: 'pickup'; obj: PickupItem; relZ: number }
      | { kind: 'hazard'; obj: RoadHazard; relZ: number }
      | { kind: 'scenery'; obj: SceneryObject; relZ: number }
      | { kind: 'gantry'; obj: HighwayGantry; relZ: number };

    const items: Renderable[] = [];

    // Traffic
    for (const c of this.traffic) {
      let rZ = c.worldZ - this.playerZ;
      if (rZ < -loopLength / 2) rZ += loopLength;
      if (rZ > loopLength / 2) rZ -= loopLength;
      if (rZ > 45 && rZ < this.drawDistance * this.segmentLength) {
        items.push({ kind: 'traffic', obj: c, relZ: rZ });
      }
    }

    // Pickups
    for (const p of this.pickups) {
      if (p.collected) continue;
      let rZ = p.worldZ - this.playerZ;
      if (rZ < -loopLength / 2) rZ += loopLength;
      if (rZ > loopLength / 2) rZ -= loopLength;
      if (rZ > 35 && rZ < this.drawDistance * this.segmentLength) {
        items.push({ kind: 'pickup', obj: p, relZ: rZ });
      }
    }

    // Hazards
    for (const hz of this.hazards) {
      let rZ = hz.worldZ - this.playerZ;
      if (rZ < -loopLength / 2) rZ += loopLength;
      if (rZ > loopLength / 2) rZ -= loopLength;
      if (rZ > 35 && rZ < this.drawDistance * this.segmentLength) {
        items.push({ kind: 'hazard', obj: hz, relZ: rZ });
      }
    }

    // Scenery
    for (const sc of this.scenery) {
      let rZ = sc.worldZ - this.playerZ;
      if (rZ < -loopLength / 2) rZ += loopLength;
      if (rZ > loopLength / 2) rZ -= loopLength;
      if (rZ > 55 && rZ < this.drawDistance * this.segmentLength) {
        items.push({ kind: 'scenery', obj: sc, relZ: rZ });
      }
    }

    // Gantries
    for (const g of this.gantries) {
      let rZ = g.worldZ - this.playerZ;
      if (rZ < -loopLength / 2) rZ += loopLength;
      if (rZ > loopLength / 2) rZ -= loopLength;
      if (rZ > 50 && rZ < this.drawDistance * this.segmentLength) {
        items.push({ kind: 'gantry', obj: g, relZ: rZ });
      }
    }

    // Sort far to near
    items.sort((a, b) => b.relZ - a.relZ);

    const camX = this.playerX * (this.roadWidth * 0.5);

    for (const item of items) {
      const segIdx = Math.floor((this.playerZ + item.relZ) / this.segmentLength) % this.totalSegments;
      const curveOffset = this.getCurveAt(segIdx) * (item.relZ / this.segmentLength) * 1.5;
      const segElev = this.getElevationAt(segIdx) - playerElevation;

      if (item.kind === 'traffic') {
        const c = item.obj;
        const laneWorldX = c.lane * (this.roadWidth * 0.5);
        const p = this.project3D(
          item.relZ,
          camX - laneWorldX - curveOffset,
          camHeight - segElev,
          camDepth,
          w,
          h,
          horizonY
        );
        this.drawTrafficCar(ctx, p.x, p.y, p.scale, c);
      } else if (item.kind === 'pickup') {
        const pk = item.obj;
        const laneWorldX = pk.lane * (this.roadWidth * 0.5);
        const p = this.project3D(
          item.relZ,
          camX - laneWorldX - curveOffset,
          camHeight - segElev,
          camDepth,
          w,
          h,
          horizonY
        );
        this.drawPickup(ctx, p.x, p.y, p.scale, pk);
      } else if (item.kind === 'hazard') {
        const hz = item.obj;
        const laneWorldX = hz.lane * (this.roadWidth * 0.5);
        const p = this.project3D(
          item.relZ,
          camX - laneWorldX - curveOffset,
          camHeight - segElev,
          camDepth,
          w,
          h,
          horizonY
        );
        this.drawHazard(ctx, p.x, p.y, p.scale, hz);
      } else if (item.kind === 'scenery') {
        const sc = item.obj;
        const worldX = sc.xOffset * (this.roadWidth * 0.5);
        const p = this.project3D(
          item.relZ,
          camX - worldX - curveOffset,
          camHeight - segElev,
          camDepth,
          w,
          h,
          horizonY
        );
        this.drawSceneryObject(ctx, p.x, p.y, p.scale * sc.scale, sc.type);
      } else if (item.kind === 'gantry') {
        const p = this.project3D(
          item.relZ,
          camX - curveOffset,
          camHeight - segElev,
          camDepth,
          w,
          h,
          horizonY
        );
        this.drawHighwayGantry(ctx, p.x, p.y, p.scale, p.w, item.obj);
      }
    }
  }

  // Draw Overhead Highway Gantry Structure
  private drawHighwayGantry(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    roadW: number,
    gantry: HighwayGantry
  ) {
    const archH = 240 * scale;
    const spanW = roadW * 2.3;
    if (archH < 10) return;

    ctx.save();
    ctx.translate(x, y);

    // Left & Right Support Steel Columns
    ctx.fillStyle = '#27272a';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(2, 4 * scale);

    const colW = 24 * scale;
    ctx.fillRect(-spanW * 0.5 - colW, -archH, colW, archH);
    ctx.strokeRect(-spanW * 0.5 - colW, -archH, colW, archH);

    ctx.fillRect(spanW * 0.5, -archH, colW, archH);
    ctx.strokeRect(spanW * 0.5, -archH, colW, archH);

    // Overhead Truss Beam
    const trussH = 55 * scale;
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-spanW * 0.55, -archH, spanW * 1.1, trussH);
    ctx.strokeRect(-spanW * 0.55, -archH, spanW * 1.1, trussH);

    // Digital LED Electronic Signboard in Center
    const signW = spanW * 0.75;
    const signH = trussH * 0.75;
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-signW * 0.5, -archH + (trussH - signH) * 0.5, signW, signH);
    ctx.strokeRect(-signW * 0.5, -archH + (trussH - signH) * 0.5, signW, signH);

    // Flashing Yellow Amber Caution Lights on End
    const isFlashing = Math.floor(Date.now() / 250) % 2 === 0;
    ctx.fillStyle = isFlashing ? '#facc15' : '#713f12';
    ctx.beginPath();
    ctx.arc(-signW * 0.46, -archH + trussH * 0.5, 6 * scale, 0, Math.PI * 2);
    ctx.arc(signW * 0.46, -archH + trussH * 0.5, 6 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Sign Text
    ctx.fillStyle = gantry.color;
    ctx.font = `900 ${Math.max(7, Math.round(18 * scale))}px 'Chakra Petch', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(gantry.signText, 0, -archH + trussH * 0.5);

    ctx.restore();
  }

  // Headlight Light Cones onto Road Surface
  private renderHeadlights(w: number, h: number, horizonY: number) {
    const ctx = this.ctx;
    const cx = w * 0.5;
    const cy = h * 0.88;

    ctx.save();
    const beamGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy - 250, 420);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
    beamGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.15)');
    beamGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = beamGrad;

    ctx.beginPath();
    ctx.moveTo(cx - 70, cy);
    ctx.lineTo(cx - 320, horizonY + 30);
    ctx.lineTo(cx + 320, horizonY + 30);
    ctx.lineTo(cx + 70, cy);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Draw Traffic Cars with Taillight Trails
  private drawTrafficCar(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, car: TrafficCar) {
    const carW = 120 * scale * car.width;
    const carH = 75 * scale * car.length;
    if (carW < 4) return;

    ctx.save();
    ctx.translate(x, y);

    // Neon Taillight Light Streaks at High Speed
    if (car.speed > 190) {
      const trailH = 40 * scale;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.fillRect(-carW * 0.34, -carH * 0.45, carW * 0.18, trailH);
      ctx.fillRect(carW * 0.16, -carH * 0.45, carW * 0.18, trailH);
    }

    // Shadow
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(0, 0, carW * 0.55, carH * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1.5, 2.5 * scale);
    const wheelW = carW * 0.18;
    const wheelH = carH * 0.4;
    ctx.fillRect(-carW * 0.48, -wheelH * 0.7, wheelW, wheelH);
    ctx.strokeRect(-carW * 0.48, -wheelH * 0.7, wheelW, wheelH);
    ctx.fillRect(carW * 0.48 - wheelW, -wheelH * 0.7, wheelW, wheelH);
    ctx.strokeRect(carW * 0.48 - wheelW, -wheelH * 0.7, wheelW, wheelH);

    // Body
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.roundRect(-carW * 0.42, -carH * 0.85, carW * 0.84, carH * 0.75, [6 * scale, 6 * scale, 3 * scale, 3 * scale]);
    ctx.fill();
    ctx.stroke();

    // Windshield
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.roundRect(-carW * 0.32, -carH * 0.78, carW * 0.64, carH * 0.32, 4 * scale);
    ctx.fill();
    ctx.stroke();

    // Glowing Taillights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-carW * 0.36, -carH * 0.45, carW * 0.22, carH * 0.14);
    ctx.fillRect(carW * 0.14, -carH * 0.45, carW * 0.22, carH * 0.14);

    // License plate
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-carW * 0.12, -carH * 0.38, carW * 0.24, carH * 0.1);

    ctx.restore();
  }

  private drawPickup(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, item: PickupItem) {
    const size = Math.max(8, 56 * scale);
    ctx.save();
    ctx.translate(x, y - size);

    const bob = Math.sin(item.angle) * 8 * scale;
    ctx.translate(0, bob);

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, size - bob, size * 0.4, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = Math.max(2, 3.5 * scale);
    ctx.strokeStyle = '#000000';

    if (item.type === 'nitro') {
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.roundRect(-size * 0.3, -size * 0.6, size * 0.6, size * 1.1, 6 * scale);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.fillRect(-size * 0.12, -size * 0.8, size * 0.24, size * 0.2);
      ctx.strokeRect(-size * 0.12, -size * 0.8, size * 0.24, size * 0.2);

      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.max(8, Math.round(14 * scale))}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('NOS', 0, 0);
    } else if (item.type === 'coin') {
      const spinScale = Math.abs(Math.cos(item.angle));
      ctx.scale(spinScale, 1);

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = `900 ${Math.max(8, Math.round(16 * scale))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('R', 0, 0);
    } else if (item.type === 'repair') {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(-size * 0.4, -size * 0.4, size * 0.8, size * 0.8, 8 * scale);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-size * 0.1, -size * 0.28, size * 0.2, size * 0.56);
      ctx.fillRect(-size * 0.28, -size * 0.1, size * 0.56, size * 0.2);
    }

    ctx.restore();
  }

  private drawHazard(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, hazard: RoadHazard) {
    const size = Math.max(6, 48 * scale);
    ctx.save();
    ctx.translate(x, y);

    if (hazard.type === 'oil') {
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = Math.max(1.5, 3 * scale);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.7, size * 0.25, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = Math.max(1, 2 * scale);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.45, size * 0.15, 0.2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#f97316';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(1.5, 2.5 * scale);

      ctx.beginPath();
      ctx.moveTo(-size * 0.35, 0);
      ctx.lineTo(0, -size * 0.85);
      ctx.lineTo(size * 0.35, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-size * 0.18, -size * 0.28);
      ctx.lineTo(-size * 0.1, -size * 0.55);
      ctx.lineTo(size * 0.1, -size * 0.55);
      ctx.lineTo(size * 0.18, -size * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawSceneryObject(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, type: string) {
    const size = Math.max(10, 150 * scale);
    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(2, 3.5 * scale);

    if (type === 'palm') {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(-size * 0.08, 0);
      ctx.quadraticCurveTo(size * 0.15, -size * 0.6, size * 0.05, -size);
      ctx.lineTo(size * 0.18, -size);
      ctx.quadraticCurveTo(size * 0.25, -size * 0.6, size * 0.08, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#15803d';
      for (let i = 0; i < 5; i++) {
        const ang = (i * 0.5 - 1) * Math.PI * 0.35;
        ctx.beginPath();
        ctx.ellipse(size * 0.1 + Math.cos(ang) * size * 0.3, -size + Math.sin(ang) * size * 0.15, size * 0.28, size * 0.1, ang, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    } else if (type === 'pine_tree') {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-size * 0.08, -size * 0.2, size * 0.16, size * 0.2);
      ctx.strokeRect(-size * 0.08, -size * 0.2, size * 0.16, size * 0.2);

      ctx.fillStyle = '#166534';
      for (let tier = 0; tier < 3; tier++) {
        const tierY = -size * (0.2 + tier * 0.25);
        const tierW = size * (0.45 - tier * 0.09);
        const tierH = size * 0.32;
        ctx.beginPath();
        ctx.moveTo(-tierW, tierY);
        ctx.lineTo(0, tierY - tierH);
        ctx.lineTo(tierW, tierY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (type === 'streetlight') {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(2, 4 * scale);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -size * 0.9);
      ctx.quadraticCurveTo(0, -size, size * 0.3, -size);
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(size * 0.3, -size, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === 'neon_tower') {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-size * 0.25, -size * 1.3, size * 0.5, size * 1.3);
      ctx.strokeRect(-size * 0.25, -size * 1.3, size * 0.5, size * 1.3);

      ctx.fillStyle = '#ec4899';
      ctx.fillRect(-size * 0.2, -size * 1.25, size * 0.4, size * 0.25);
      ctx.strokeRect(-size * 0.2, -size * 1.25, size * 0.4, size * 0.25);
    } else {
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(-size * 0.05, -size * 0.6, size * 0.1, size * 0.6);
      ctx.strokeRect(-size * 0.05, -size * 0.6, size * 0.1, size * 0.6);

      ctx.fillStyle = '#facc15';
      ctx.fillRect(-size * 0.3, -size * 0.95, size * 0.6, size * 0.38);
      ctx.strokeRect(-size * 0.3, -size * 0.95, size * 0.6, size * 0.38);

      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.max(6, Math.round(12 * scale))}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('SPEED', 0, -size * 0.74);
    }

    ctx.restore();
  }

  // Chase Camera View (Third-Person Arcade)
  private renderPlayerCar(w: number, h: number) {
    const ctx = this.ctx;
    const carW = Math.min(w * 0.35, 230);
    const carH = carW * 0.75;
    const cx = w * 0.5;
    const cy = h * 0.86;

    if (this.isInvincible && Math.floor(Date.now() / 80) % 2 === 0) return;

    ctx.save();
    ctx.translate(cx, cy);

    // Dynamic lean & pitch
    const tilt = this.playerSteer * 0.13;
    ctx.rotate(tilt);
    ctx.translate(0, this.playerPitch * 8);

    // Ink Shadow
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(0, carH * 0.22, carW * 0.48, carH * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Supersonic Mach Diamond Exhaust Flames
    if (this.isNitroActive) {
      const flameH = 48 + Math.random() * 32;
      const flameW = 20 + Math.random() * 8;

      [-carW * 0.22, carW * 0.22].forEach((xPos) => {
        // Outer plume
        const grad = ctx.createLinearGradient(xPos, carH * 0.15, xPos, carH * 0.15 + flameH);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.25, '#38bdf8');
        grad.addColorStop(0.75, '#ec4899');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(xPos, carH * 0.15 + flameH * 0.5, flameW * 0.5, flameH * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner Supersonic Shock Diamonds
        ctx.fillStyle = '#ffffff';
        for (let d = 1; d <= 3; d++) {
          const dy = carH * 0.18 + d * 14;
          ctx.beginPath();
          ctx.moveTo(xPos, dy - 5);
          ctx.lineTo(xPos + 5, dy);
          ctx.lineTo(xPos, dy + 5);
          ctx.lineTo(xPos - 5, dy);
          ctx.closePath();
          ctx.fill();
        }
      });
    }

    // Rear Wheels
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    const wheelW = carW * 0.16;
    const wheelH = carH * 0.38;

    // Glowing Brake Rotors on Hard Braking
    const brakeColor = `rgba(239, 68, 68, ${this.brakeHeat * 0.9})`;

    // Left wheel
    ctx.beginPath();
    ctx.roundRect(-carW * 0.48, -wheelH * 0.3, wheelW, wheelH, 6);
    ctx.fill();
    ctx.stroke();
    if (this.brakeHeat > 0.1) {
      ctx.fillStyle = brakeColor;
      ctx.fillRect(-carW * 0.46, -wheelH * 0.15, wheelW * 0.7, wheelH * 0.4);
      ctx.fillStyle = '#18181b';
    }

    // Right wheel
    ctx.beginPath();
    ctx.roundRect(carW * 0.48 - wheelW, -wheelH * 0.3, wheelW, wheelH, 6);
    ctx.fill();
    ctx.stroke();
    if (this.brakeHeat > 0.1) {
      ctx.fillStyle = brakeColor;
      ctx.fillRect(carW * 0.48 - wheelW + 4, -wheelH * 0.15, wheelW * 0.7, wheelH * 0.4);
    }

    // Lower Diffuser Fins
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(-carW * 0.38, carH * 0.04, carW * 0.76, carH * 0.16, 4);
    ctx.fill();
    ctx.stroke();
    for (let f = -3; f <= 3; f++) {
      ctx.beginPath();
      ctx.moveTo(f * (carW * 0.08), carH * 0.04);
      ctx.lineTo(f * (carW * 0.08), carH * 0.2);
      ctx.stroke();
    }

    // Body Shell
    const bodyGrad = ctx.createLinearGradient(0, -carH * 0.6, 0, carH * 0.1);
    bodyGrad.addColorStop(0, this.customColor);
    bodyGrad.addColorStop(0.7, this.customColor);
    bodyGrad.addColorStop(1, '#09090b');
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.roundRect(-carW * 0.4, -carH * 0.45, carW * 0.8, carH * 0.54, [14, 14, 6, 6]);
    ctx.fill();
    ctx.stroke();

    // Comic Crease Lines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-carW * 0.32, -carH * 0.12);
    ctx.lineTo(carW * 0.32, -carH * 0.12);
    ctx.stroke();

    // Windshield
    const windowGrad = ctx.createLinearGradient(0, -carH * 0.75, 0, -carH * 0.35);
    windowGrad.addColorStop(0, '#22d3ee');
    windowGrad.addColorStop(0.5, '#0891b2');
    windowGrad.addColorStop(1, '#09090b');
    ctx.fillStyle = windowGrad;

    ctx.beginPath();
    ctx.roundRect(-carW * 0.28, -carH * 0.68, carW * 0.56, carH * 0.32, [12, 12, 2, 2]);
    ctx.fill();
    ctx.stroke();

    // Canopy Glare
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-carW * 0.15, -carH * 0.42);
    ctx.lineTo(-carW * 0.05, -carH * 0.62);
    ctx.stroke();

    // Wings with Active Aero DRS Tilt
    const drsOffset = this.isNitroActive ? 8 : this.input.brake ? -12 : 0;
    if (this.car.id === 'gt3_rs') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(-carW * 0.22, -carH * 0.88, carW * 0.05, carH * 0.32);
      ctx.fillRect(carW * 0.17, -carH * 0.88, carW * 0.05, carH * 0.32);

      ctx.fillStyle = this.customColor;
      ctx.beginPath();
      ctx.roundRect(-carW * 0.48, -carH * 0.92 + drsOffset, carW * 0.96, carH * 0.12, 4);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    }

    // Taillight Strip
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(-carW * 0.34, -carH * 0.18);
    ctx.lineTo(carW * 0.34, -carH * 0.18);
    ctx.stroke();

    // License Plate
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-carW * 0.12, -carH * 0.04, carW * 0.24, carH * 0.1);
    ctx.strokeRect(-carW * 0.12, -carH * 0.04, carW * 0.24, carH * 0.1);

    ctx.fillStyle = '#000000';
    ctx.font = '900 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('REDLINE', 0, carH * 0.035);

    ctx.restore();
  }

  // Redline Anime Cockpit Interior View
  private renderCockpitInterior(w: number, h: number) {
    const ctx = this.ctx;
    ctx.save();

    // Windshield Pillared Frame (Comic Black Ink)
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;

    // A-Pillars
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w * 0.16, 0);
    ctx.lineTo(w * 0.22, h * 0.65);
    ctx.lineTo(0, h * 0.72);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w * 0.84, 0);
    ctx.lineTo(w * 0.78, h * 0.65);
    ctx.lineTo(w, h * 0.72);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Upper Sunvisor Strip
    ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.fillRect(w * 0.16, 0, w * 0.68, h * 0.1);
    ctx.fillStyle = '#000000';
    ctx.fillRect(w * 0.16, h * 0.1, w * 0.68, 6);

    // Rearview Mirror with Live Reflection of Passing Road!
    const mirrorW = w * 0.28;
    const mirrorH = h * 0.11;
    const mirrorX = (w - mirrorW) * 0.5;
    const mirrorY = h * 0.05;

    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.roundRect(mirrorX - 4, mirrorY - 4, mirrorW + 8, mirrorH + 8, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(mirrorX, mirrorY, mirrorW, mirrorH, 6);
    ctx.fill();

    // Mirror reflection details
    ctx.fillStyle = '#09090b';
    ctx.fillRect(mirrorX, mirrorY + mirrorH * 0.5, mirrorW, mirrorH * 0.5);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mirrorX + mirrorW * 0.5, mirrorY + mirrorH * 0.5);
    ctx.lineTo(mirrorX + mirrorW * 0.5, mirrorY + mirrorH);
    ctx.stroke();

    // Lower Dashboard
    const dashY = h * 0.64;
    const dashGrad = ctx.createLinearGradient(0, dashY, 0, h);
    dashGrad.addColorStop(0, '#18181b');
    dashGrad.addColorStop(1, '#09090b');
    ctx.fillStyle = dashGrad;

    ctx.beginPath();
    ctx.moveTo(0, dashY + 40);
    ctx.quadraticCurveTo(w * 0.5, dashY - 10, w, dashY + 40);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Carbon fiber weave texture line accents
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    for (let lx = 0; lx < w; lx += 20) {
      ctx.beginPath();
      ctx.moveTo(lx, dashY);
      ctx.lineTo(lx + 40, h);
      ctx.stroke();
    }

    // Steering Wheel with Animated Steer & Gloved Hands!
    const wheelRadius = Math.min(w * 0.22, 130);
    const wheelCX = w * 0.5;
    const wheelCY = h * 0.88;
    const steerAngle = this.playerSteer * 0.55;

    ctx.save();
    ctx.translate(wheelCX, wheelCY);
    ctx.rotate(steerAngle);

    // Wheel Rim
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.arc(0, 0, wheelRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, wheelRadius + 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, wheelRadius - 13, 0, Math.PI * 2);
    ctx.stroke();

    // Center 12 o'clock Red Marker Stripe
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-6, -wheelRadius - 13, 12, 26);

    // Wheel Spokes
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-wheelRadius + 12, -14, (wheelRadius - 12) * 2, 28);

    // Center Horn Button
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '900 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('REDLINE', 0, 0);

    // Sonoshee's Gloved Racing Hands (Mint green & pink accents)
    // Left hand
    ctx.fillStyle = '#86efac';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(-wheelRadius, 0, 22, 14, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right hand
    ctx.beginPath();
    ctx.ellipse(wheelRadius, 0, 22, 14, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    ctx.restore();
  }

  // Hood / Bumper View
  private renderHoodView(w: number, h: number) {
    const ctx = this.ctx;
    ctx.save();

    // Low aerodynamic hood nose visible at bottom edge
    const hoodH = h * 0.14;
    const hoodY = h - hoodH;

    const hoodGrad = ctx.createLinearGradient(0, hoodY, 0, h);
    hoodGrad.addColorStop(0, this.customColor);
    hoodGrad.addColorStop(1, '#09090b');
    ctx.fillStyle = hoodGrad;

    ctx.beginPath();
    ctx.moveTo(w * 0.2, h);
    ctx.quadraticCurveTo(w * 0.5, hoodY, w * 0.8, h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center hood crease line
    ctx.beginPath();
    ctx.moveTo(w * 0.5, hoodY);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();

    ctx.restore();
  }

  private renderWeather(w: number, h: number) {
    const ctx = this.ctx;
    ctx.save();

    if (this.track.id === 'city') {
      // Cyber Rain streaks
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.65)';
      ctx.lineWidth = 1.5;
      for (const p of this.weatherParticles) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 4, p.y + 18);
        ctx.stroke();
      }
    } else if (this.track.id === 'mountain') {
      // Drifting Autumn Leaves
      ctx.fillStyle = '#f97316';
      for (const p of this.weatherParticles) {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 2, p.size, 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Tropical Sunbeams & Spray
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      for (const p of this.weatherParticles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private renderParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  private renderSpeedlines(w: number, h: number) {
    const ctx = this.ctx;
    const cx = w * 0.5;
    const cy = h * 0.46;
    const numLines = Math.round(30 * this.speedLineIntensity);

    ctx.save();
    ctx.strokeStyle = this.isNitroActive ? '#38bdf8' : '#ffffff';
    ctx.lineWidth = 2.8;
    ctx.globalAlpha = this.speedLineIntensity * 0.85;

    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2 + Math.random() * 0.08;
      const innerR = Math.min(w, h) * 0.28 + Math.random() * 50;
      const outerR = Math.max(w, h) * 0.88;

      const x1 = cx + Math.cos(angle) * innerR;
      const y1 = cy + Math.sin(angle) * innerR;
      const x2 = cx + Math.cos(angle) * outerR;
      const y2 = cy + Math.sin(angle) * outerR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderChromaticAberration(w: number, h: number) {
    const ctx = this.ctx;
    const offset = this.chromaticAberration;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(236, 72, 153, 0.08)';
    ctx.fillRect(offset, 0, w, h);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.fillRect(-offset, 0, w, h);
    ctx.restore();
  }

  private renderPopups(ctx: CanvasRenderingContext2D) {
    for (const popup of this.comicPopups) {
      ctx.save();
      ctx.translate(popup.x, popup.y);

      const scale = 0.8 + (1 - popup.life) * 0.3;
      ctx.scale(scale, scale);
      ctx.rotate(-0.06);

      const fontSize = popup.size === 'lg' ? 26 : popup.size === 'md' ? 20 : 16;
      ctx.font = `900 ${fontSize}px 'Chakra Petch', 'Bangers', Impact, sans-serif`;
      ctx.textAlign = 'center';

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.strokeText(popup.text, 0, 0);

      ctx.fillStyle = popup.color;
      ctx.fillText(popup.text, 0, 0);

      ctx.restore();
    }
  }

  private project3D(
    z: number,
    worldX: number,
    worldY: number,
    camDepth: number,
    w: number,
    h: number,
    horizonY: number
  ) {
    const scale = camDepth / Math.max(1, z);
    const screenX = Math.round(w * 0.5 + scale * worldX * (w * 0.5));
    const screenY = Math.round(horizonY + scale * worldY * (h - horizonY));
    const screenW = Math.round(scale * this.roadWidth * (w * 0.5));

    return {
      x: screenX,
      y: screenY,
      w: screenW,
      scale,
    };
  }

  private drawPolygon(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  }
}
