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
    duration: 1.0,
    cameraPosition: { x: 0, y: 20, z: 150 },
    fov: 45,
    bloomIntensity: 0.2,
    shakeIntensity: 0,
  },
  [IntroPhase.TRISHUL_REVEAL]: {
    phase: IntroPhase.TRISHUL_REVEAL,
    name: "Trishul Appears",
    duration: 1.0,
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
    shakeIntensity: 0.1,
  },
  [IntroPhase.LIGHTNING_STRIKE]: {
    phase: IntroPhase.LIGHTNING_STRIKE,
    name: "Lightning Intensifies",
    duration: 1.0,
    cameraPosition: { x: 0, y: 5, z: 70 },
    fov: 45,
    bloomIntensity: 3.5,
    shakeIntensity: 0.8,
  },
  [IntroPhase.DESCENT_ACCEL]: {
    phase: IntroPhase.DESCENT_ACCEL,
    name: "Downward Acceleration",
    duration: 0.8,
    cameraPosition: { x: 0, y: -10, z: 60 },
    fov: 50,
    bloomIntensity: 2.0,
    shakeIntensity: 0.3,
  },
  [IntroPhase.GROUND_IMPACT]: {
    phase: IntroPhase.GROUND_IMPACT,
    name: "Ground Impact",
    duration: 1.0,
    cameraPosition: { x: 0, y: 0, z: 50 },
    fov: 55,
    bloomIntensity: 4.0,
    shakeIntensity: 1.0,
  },
  [IntroPhase.GROUND_SHATTER]: {
    phase: IntroPhase.GROUND_SHATTER,
    name: "Ground Shattering",
    duration: 0.8,
    cameraPosition: { x: 0, y: -5, z: 55 },
    fov: 52,
    bloomIntensity: 2.5,
    shakeIntensity: 0.4,
  },
  [IntroPhase.ENERGY_SHOCKWAVE]: {
    phase: IntroPhase.ENERGY_SHOCKWAVE,
    name: "Energy Wave",
    duration: 0.8,
    cameraPosition: { x: 0, y: 0, z: 60 },
    fov: 50,
    bloomIntensity: 2.0,
    shakeIntensity: 0.1,
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
    duration: 1.0,
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
