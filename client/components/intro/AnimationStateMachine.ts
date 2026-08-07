// Animation State Machine for Trishul CRM Cinematic Intro
export enum IntroPhase {
  DARK_ENVIRONMENT = 1,
  TRISHUL_REVEAL = 2,
  ENERGY_BUILD = 3,
  LIGHTNING_STRIKE = 4,
  DESCENT_ACCEL = 5,
  GROUND_IMPACT = 6,
  GROUND_SHATTER = 7,
  ENERGY_SHOCKWAVE = 8,
  SCREEN_FLASH = 9,
  WORLD_TRANSFORM = 10,
  LOGO_REVEAL = 11,
  LOGIN_TRANSITION = 12,
}

export interface PhaseConfig {
  phase: IntroPhase;
  name: string;
  duration: number; // in seconds
  cameraPosition: { x: number; y: number; z: number };
  fov: number;
  bloomIntensity: number;
  shakeIntensity: number;
}

export const PHASE_CONFIGS: Record<IntroPhase, PhaseConfig> = {
  [IntroPhase.DARK_ENVIRONMENT]: {
    phase: IntroPhase.DARK_ENVIRONMENT,
    name: "Dark Environment",
    duration: 1.2,
    cameraPosition: { x: 0, y: 20, z: 150 },
    fov: 45,
    bloomIntensity: 0.2,
    shakeIntensity: 0,
  },
  [IntroPhase.TRISHUL_REVEAL]: {
    phase: IntroPhase.TRISHUL_REVEAL,
    name: "Trishul Appears",
    duration: 1.3,
    cameraPosition: { x: 0, y: 15, z: 100 },
    fov: 45,
    bloomIntensity: 0.8,
    shakeIntensity: 0,
  },
  [IntroPhase.ENERGY_BUILD]: {
    phase: IntroPhase.ENERGY_BUILD,
    name: "Energy Build-up",
    duration: 1.5,
    cameraPosition: { x: 15, y: 10, z: 80 },
    fov: 45,
    bloomIntensity: 1.5,
    shakeIntensity: 0.08,
  },
  [IntroPhase.LIGHTNING_STRIKE]: {
    phase: IntroPhase.LIGHTNING_STRIKE,
    name: "Lightning Intensifies",
    duration: 1.0,
    cameraPosition: { x: 0, y: 5, z: 70 },
    fov: 45,
    bloomIntensity: 3.5,
    shakeIntensity: 0.5,
  },
  [IntroPhase.DESCENT_ACCEL]: {
    phase: IntroPhase.DESCENT_ACCEL,
    name: "Downward Acceleration",
    duration: 0.8,
    cameraPosition: { x: 0, y: -10, z: 60 },
    fov: 50,
    bloomIntensity: 2.0,
    shakeIntensity: 0.25,
  },
  [IntroPhase.GROUND_IMPACT]: {
    phase: IntroPhase.GROUND_IMPACT,
    name: "Ground Impact",
    duration: 0.8,
    cameraPosition: { x: 0, y: 0, z: 50 },
    fov: 55,
    bloomIntensity: 4.5,
    shakeIntensity: 1.0,
  },
  [IntroPhase.GROUND_SHATTER]: {
    phase: IntroPhase.GROUND_SHATTER,
    name: "Ground Shattering",
    duration: 1.0,
    cameraPosition: { x: 0, y: -5, z: 55 },
    fov: 52,
    bloomIntensity: 2.5,
    shakeIntensity: 0.35,
  },
  [IntroPhase.ENERGY_SHOCKWAVE]: {
    phase: IntroPhase.ENERGY_SHOCKWAVE,
    name: "Energy Wave",
    duration: 0.8,
    cameraPosition: { x: 0, y: 0, z: 60 },
    fov: 50,
    bloomIntensity: 2.0,
    shakeIntensity: 0.08,
  },
  [IntroPhase.SCREEN_FLASH]: {
    phase: IntroPhase.SCREEN_FLASH,
    name: "Screen Flash",
    duration: 0.5,
    cameraPosition: { x: 0, y: 0, z: 60 },
    fov: 50,
    bloomIntensity: 5.0,
    shakeIntensity: 0,
  },
  [IntroPhase.WORLD_TRANSFORM]: {
    phase: IntroPhase.WORLD_TRANSFORM,
    name: "World Transformation",
    duration: 1.0,
    cameraPosition: { x: 0, y: 0, z: 55 },
    fov: 48,
    bloomIntensity: 1.2,
    shakeIntensity: 0,
  },
  [IntroPhase.LOGO_REVEAL]: {
    phase: IntroPhase.LOGO_REVEAL,
    name: "CRM Logo Reveal",
    duration: 0.8,
    cameraPosition: { x: 0, y: 0, z: 50 },
    fov: 45,
    bloomIntensity: 1.0,
    shakeIntensity: 0,
  },
  [IntroPhase.LOGIN_TRANSITION]: {
    phase: IntroPhase.LOGIN_TRANSITION,
    name: "Login Page Reveal",
    duration: 0.8,
    cameraPosition: { x: 0, y: 0, z: 50 },
    fov: 45,
    bloomIntensity: 0.5,
    shakeIntensity: 0,
  },
};

// Calculate total animation sequence duration
export const TOTAL_INTRO_DURATION = Object.values(PHASE_CONFIGS).reduce(
  (sum, cfg) => sum + cfg.duration,
  0
);

// Precompute cumulative start times for exact deterministic lookup
const PHASE_TIMINGS: Array<{ phase: IntroPhase; startTime: number; endTime: number; duration: number }> = [];
let cumulative = 0;
for (let p = IntroPhase.DARK_ENVIRONMENT; p <= IntroPhase.LOGIN_TRANSITION; p++) {
  const duration = PHASE_CONFIGS[p as IntroPhase].duration;
  PHASE_TIMINGS.push({
    phase: p as IntroPhase,
    startTime: cumulative,
    endTime: cumulative + duration,
    duration,
  });
  cumulative += duration;
}

export function getPhaseAndProgressFromElapsed(elapsedSeconds: number): {
  phase: IntroPhase;
  localProgress: number;
  totalProgress: number;
} {
  const totalProgress = Math.min(1, Math.max(0, elapsedSeconds / TOTAL_INTRO_DURATION));

  if (elapsedSeconds <= 0) {
    return { phase: IntroPhase.DARK_ENVIRONMENT, localProgress: 0, totalProgress: 0 };
  }

  for (const item of PHASE_TIMINGS) {
    if (elapsedSeconds >= item.startTime && elapsedSeconds < item.endTime) {
      const localProgress = Math.min(1, Math.max(0, (elapsedSeconds - item.startTime) / item.duration));
      return { phase: item.phase, localProgress, totalProgress };
    }
  }

  return { phase: IntroPhase.LOGIN_TRANSITION, localProgress: 1, totalProgress: 1 };
}

// Cinematic Easing Functions
export const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  exponentialDrop: (t: number) => Math.pow(t, 4), // Plunging downward ease
  elasticOut: (t: number) => {
    return Math.sin((-13 * Math.PI * (t + 1)) / 2) * Math.pow(2, -10 * t) + 1;
  },
};

