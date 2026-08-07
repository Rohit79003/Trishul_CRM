"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFX } from "./SoundEffects";
import Trishul3DCanvas from "./Trishul3DCanvas";
import ParticleSystem from "./ParticleSystem";
import {
  IntroPhase,
  PHASE_CONFIGS,
  TOTAL_INTRO_DURATION,
  getPhaseAndProgressFromElapsed,
} from "./AnimationStateMachine";
import { Volume2, VolumeX, FastForward, Shield, Sparkles } from "lucide-react";

interface OpeningAnimationProps {
  onComplete?: () => void;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<IntroPhase>(IntroPhase.DARK_ENVIRONMENT);
  const [phaseProgress, setPhaseProgress] = useState<number>(0);
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [cameraShake, setCameraShake] = useState<number>(0);
  const [impactTriggered, setImpactTriggered] = useState<boolean>(false);
  const [showScreenFlash, setShowScreenFlash] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastFpsCheckRef = useRef<number>(0);

  // Initialize Audio & Reduced Motion state
  useEffect(() => {
    setIsMuted(soundFX.getMuted());

    // Respect user reduced-motion preference
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isSmallScreen = window.innerWidth < 640;
      if (prefersReduced) {
        setQuality("low");
      } else if (isSmallScreen) {
        setQuality("medium");
      }
    }
  }, []);

  const handleToggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFX.setMuted(nextMuted);
  };

  const handleFinish = () => {
    soundFX.stopAll();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("trishul_intro_played", "true");
    }
    if (onComplete) {
      onComplete();
    }
  };

  // Smooth Skip Intro Fast-Forward handler
  const handleSkipIntro = () => {
    setIsExiting(true);
    soundFX.stopAll();
    setTimeout(() => {
      handleFinish();
    }, 350);
  };

  // Keyboard listener for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkipIntro();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Frame-Rate Independent Master Loop Driver
  useEffect(() => {
    startTimeRef.current = performance.now();
    lastFpsCheckRef.current = performance.now();
    const playedPhases = new Set<IntroPhase>();

    const tick = (now: number) => {
      // 1. Adaptive FPS Monitor (Downgrade quality if frame-rate drops below 40 FPS)
      frameCountRef.current++;
      const fpsTimeDiff = (now - lastFpsCheckRef.current) / 1000;
      if (fpsTimeDiff >= 1.0) {
        const currentFps = frameCountRef.current / fpsTimeDiff;
        if (currentFps < 38 && quality === "high") {
          setQuality("medium");
        } else if (currentFps < 28 && quality === "medium") {
          setQuality("low");
        }
        frameCountRef.current = 0;
        lastFpsCheckRef.current = now;
      }

      // 2. Elapsed Time & Deterministic Phase Sync
      const elapsedSeconds = (now - startTimeRef.current) / 1000;
      const { phase: currentPhase, localProgress, totalProgress: gProgress } =
        getPhaseAndProgressFromElapsed(elapsedSeconds);

      setPhase(currentPhase);
      setPhaseProgress(localProgress);
      setTotalProgress(gProgress);

      // Camera Shake Intensity derived from Phase Configs
      const cfg = PHASE_CONFIGS[currentPhase];
      let shake = cfg.shakeIntensity;

      // Special Phase Handlers
      if (currentPhase === IntroPhase.LIGHTNING_STRIKE) {
        shake = cfg.shakeIntensity * Math.sin(localProgress * Math.PI);
        if (!playedPhases.has(IntroPhase.LIGHTNING_STRIKE)) {
          soundFX.playLightningStrike();
          playedPhases.add(IntroPhase.LIGHTNING_STRIKE);
        }
      } else if (currentPhase === IntroPhase.DESCENT_ACCEL) {
        if (!playedPhases.has(IntroPhase.DESCENT_ACCEL)) {
          soundFX.playDropWhoosh();
          playedPhases.add(IntroPhase.DESCENT_ACCEL);
        }
      } else if (currentPhase === IntroPhase.GROUND_IMPACT) {
        shake = cfg.shakeIntensity * Math.max(0, 1 - localProgress * 1.6);
        if (!playedPhases.has(IntroPhase.GROUND_IMPACT)) {
          soundFX.playImpactBoom();
          setImpactTriggered(true);
          playedPhases.add(IntroPhase.GROUND_IMPACT);
        }
      } else if (currentPhase === IntroPhase.GROUND_SHATTER) {
        if (!playedPhases.has(IntroPhase.GROUND_SHATTER)) {
          soundFX.playShatterCrack();
          playedPhases.add(IntroPhase.GROUND_SHATTER);
        }
      } else if (currentPhase === IntroPhase.ENERGY_SHOCKWAVE) {
        if (!playedPhases.has(IntroPhase.ENERGY_SHOCKWAVE)) {
          soundFX.playEnergyShockwave();
          playedPhases.add(IntroPhase.ENERGY_SHOCKWAVE);
        }
      } else if (currentPhase === IntroPhase.SCREEN_FLASH) {
        setShowScreenFlash(localProgress < 0.6);
      } else if (currentPhase === IntroPhase.WORLD_TRANSFORM) {
        setShowScreenFlash(false);
        if (!playedPhases.has(IntroPhase.WORLD_TRANSFORM)) {
          soundFX.playTransformSweep();
          playedPhases.add(IntroPhase.WORLD_TRANSFORM);
        }
      } else if (currentPhase === IntroPhase.LOGO_REVEAL) {
        if (!playedPhases.has(IntroPhase.LOGO_REVEAL)) {
          soundFX.playLogoChime();
          playedPhases.add(IntroPhase.LOGO_REVEAL);
        }
      }

      setCameraShake(shake);

      // Sequence Completion Check
      if (elapsedSeconds >= TOTAL_INTRO_DURATION) {
        handleFinish();
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [quality]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none"
    >
      {/* 3D Trishul Canvas Layer */}
      <Trishul3DCanvas
        phase={phase}
        progress={phaseProgress}
        cameraShake={cameraShake}
        quality={quality}
      />

      {/* Particle System Engine Layer */}
      <ParticleSystem
        phase={phase}
        progress={phaseProgress}
        impactTriggered={impactTriggered}
        quality={quality}
      />

      {/* Phase 9: Blinding White Screen Flash Overlay */}
      <AnimatePresence>
        {showScreenFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-white z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Phase 10-12: CRM Transformation & Logo Reveal */}
      {phase >= IntroPhase.LOGO_REVEAL && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-30 flex flex-col items-center text-center px-4"
        >
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-brand-amber/40 shadow-2xl shadow-brand-amber/20 backdrop-blur-xl mb-4">
            <Shield className="w-16 h-16 text-brand-amber animate-pulse" />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-3 drop-shadow-md"
          >
            TRISHUL <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-amber via-amber-400 to-sky-400">CRM</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45 }}
            className="text-xs sm:text-sm text-slate-300 font-medium tracking-widest uppercase mt-2 max-w-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-brand-amber" />
            Smart Business Management
          </motion.p>
        </motion.div>
      )}

      {/* Top Floating Controls Bar */}
      <div className="absolute top-6 left-6 right-6 z-40 flex items-center justify-between pointer-events-auto">
        <button
          type="button"
          onClick={handleToggleMute}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-brand-amber hover:border-brand-amber/40 backdrop-blur-md transition-all text-xs font-semibold shadow-lg"
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span>MUTED</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-brand-amber animate-pulse" />
              <span>AUDIO ON</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleSkipIntro}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 hover:text-white hover:border-brand-amber/50 backdrop-blur-md transition-all text-xs font-semibold tracking-wider shadow-lg hover:shadow-brand-amber/10 group"
        >
          <span>SKIP INTRO</span>
          <FastForward className="w-4 h-4 text-brand-amber group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Bottom Phase Progress Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-48 sm:w-64">
        <div className="h-1 w-full bg-slate-800/80 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-brand-amber to-sky-400 transition-all duration-100 ease-linear"
            style={{
              width: `${Math.min(100, totalProgress * 100)}%`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default OpeningAnimation;

