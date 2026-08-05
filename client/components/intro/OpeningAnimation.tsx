"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFX } from "./SoundEffects";
import Trishul3DCanvas from "./Trishul3DCanvas";
import ParticleSystem from "./ParticleSystem";
import { IntroPhase, PHASE_CONFIGS } from "./AnimationStateMachine";
import { Volume2, VolumeX, FastForward, Shield, Sparkles } from "lucide-react";

interface OpeningAnimationProps {
  onComplete?: () => void;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<IntroPhase>(IntroPhase.DARK_ENVIRONMENT);
  const [phaseProgress, setPhaseProgress] = useState<number>(0);
  const [cameraShake, setCameraShake] = useState<number>(0);
  const [impactTriggered, setImpactTriggered] = useState<boolean>(false);
  const [showScreenFlash, setShowScreenFlash] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSkip, setShowSkip] = useState<boolean>(true);

  const startTimeRef = useRef<number>(Date.now());
  const animFrameRef = useRef<number | null>(null);

  // Initialize Audio state
  useEffect(() => {
    setIsMuted(soundFX.getMuted());
  }, []);

  const handleToggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFX.setMuted(nextMuted);
  };

  const handleFinish = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("trishul_intro_played", "true");
    }
    if (onComplete) {
      onComplete();
    }
  };

  // Keyboard shortcut listener for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleFinish();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Main 12-Phase Timeline Sequence Controller (Total ~9.5 seconds)
  useEffect(() => {
    startTimeRef.current = Date.now();

    let playedPhases = new Set<IntroPhase>();

    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000; // in seconds

      if (elapsed < 1.0) {
        // Phase 1: Dark Environment (0 - 1.0s)
        setPhase(IntroPhase.DARK_ENVIRONMENT);
        setPhaseProgress(elapsed / 1.0);
        if (!playedPhases.has(IntroPhase.DARK_ENVIRONMENT)) {
          soundFX.playAmbientRumble();
          playedPhases.add(IntroPhase.DARK_ENVIRONMENT);
        }
      } else if (elapsed >= 1.0 && elapsed < 2.0) {
        // Phase 2: Trishul Appears (1.0 - 2.0s)
        setPhase(IntroPhase.TRISHUL_REVEAL);
        setPhaseProgress((elapsed - 1.0) / 1.0);
      } else if (elapsed >= 2.0 && elapsed < 3.5) {
        // Phase 3: Rotation & Energy Build-up (2.0 - 3.5s)
        setPhase(IntroPhase.ENERGY_BUILD);
        setPhaseProgress((elapsed - 2.0) / 1.5);
        if (!playedPhases.has(IntroPhase.ENERGY_BUILD)) {
          soundFX.playEnergyHum();
          playedPhases.add(IntroPhase.ENERGY_BUILD);
        }
      } else if (elapsed >= 3.5 && elapsed < 4.5) {
        // Phase 4: Lightning Intensifies (3.5 - 4.5s)
        setPhase(IntroPhase.LIGHTNING_STRIKE);
        const p4 = (elapsed - 3.5) / 1.0;
        setPhaseProgress(p4);
        setCameraShake(0.8 * Math.sin(p4 * Math.PI));
        if (!playedPhases.has(IntroPhase.LIGHTNING_STRIKE)) {
          soundFX.playLightningStrike();
          playedPhases.add(IntroPhase.LIGHTNING_STRIKE);
        }
      } else if (elapsed >= 4.5 && elapsed < 5.3) {
        // Phase 5: Downward Acceleration (4.5 - 5.3s)
        setPhase(IntroPhase.DESCENT_ACCEL);
        setPhaseProgress((elapsed - 4.5) / 0.8);
        setCameraShake(0.2);
        if (!playedPhases.has(IntroPhase.DESCENT_ACCEL)) {
          soundFX.playDropWhoosh();
          playedPhases.add(IntroPhase.DESCENT_ACCEL);
        }
      } else if (elapsed >= 5.3 && elapsed < 6.3) {
        // Phase 6: Ground Impact (5.3 - 6.3s)
        setPhase(IntroPhase.GROUND_IMPACT);
        const p6 = (elapsed - 5.3) / 1.0;
        setPhaseProgress(p6);
        setCameraShake(Math.max(0, 1 - p6 * 1.5));
        if (!playedPhases.has(IntroPhase.GROUND_IMPACT)) {
          soundFX.playImpactBoom();
          setImpactTriggered(true);
          playedPhases.add(IntroPhase.GROUND_IMPACT);
        }
      } else if (elapsed >= 6.3 && elapsed < 7.1) {
        // Phase 7: Ground Shattering (6.3 - 7.1s)
        setPhase(IntroPhase.GROUND_SHATTER);
        setPhaseProgress((elapsed - 6.3) / 0.8);
        setCameraShake(0.3);
        if (!playedPhases.has(IntroPhase.GROUND_SHATTER)) {
          soundFX.playShatterCrack();
          playedPhases.add(IntroPhase.GROUND_SHATTER);
        }
      } else if (elapsed >= 7.1 && elapsed < 7.9) {
        // Phase 8: Energy Wave (7.1 - 7.9s)
        setPhase(IntroPhase.ENERGY_SHOCKWAVE);
        setPhaseProgress((elapsed - 7.1) / 0.8);
        setCameraShake(0);
        if (!playedPhases.has(IntroPhase.ENERGY_SHOCKWAVE)) {
          soundFX.playEnergyShockwave();
          playedPhases.add(IntroPhase.ENERGY_SHOCKWAVE);
        }
      } else if (elapsed >= 7.9 && elapsed < 8.4) {
        // Phase 9: Screen Flash (7.9 - 8.4s)
        setPhase(IntroPhase.SCREEN_FLASH);
        setPhaseProgress((elapsed - 7.9) / 0.5);
        setShowScreenFlash(true);
      } else if (elapsed >= 8.4 && elapsed < 9.4) {
        // Phase 10: World Transformation (8.4 - 9.4s)
        setShowScreenFlash(false);
        setPhase(IntroPhase.WORLD_TRANSFORM);
        setPhaseProgress((elapsed - 8.4) / 1.0);
        if (!playedPhases.has(IntroPhase.WORLD_TRANSFORM)) {
          soundFX.playTransformSweep();
          playedPhases.add(IntroPhase.WORLD_TRANSFORM);
        }
      } else if (elapsed >= 9.4 && elapsed < 10.4) {
        // Phase 11: CRM Logo Reveal (9.4 - 10.4s)
        setPhase(IntroPhase.LOGO_REVEAL);
        setPhaseProgress((elapsed - 9.4) / 1.0);
        if (!playedPhases.has(IntroPhase.LOGO_REVEAL)) {
          soundFX.playLogoChime();
          playedPhases.add(IntroPhase.LOGO_REVEAL);
        }
      } else if (elapsed >= 10.4 && elapsed < 11.2) {
        // Phase 12: Login Page Reveal (10.4 - 11.2s)
        setPhase(IntroPhase.LOGIN_TRANSITION);
        setPhaseProgress((elapsed - 10.4) / 0.8);
      } else if (elapsed >= 11.2) {
        handleFinish();
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none">
      {/* 3D Trishul Canvas Layer */}
      <Trishul3DCanvas
        phase={phase}
        progress={phaseProgress}
        cameraShake={cameraShake}
      />

      {/* Particle System Engine Layer */}
      <ParticleSystem
        phase={phase}
        progress={phaseProgress}
        impactTriggered={impactTriggered}
      />

      {/* Phase 9: Blinding White Screen Flash Overlay */}
      <AnimatePresence>
        {showScreenFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-white z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Phase 11 & 12: Logo Transformation & Text Reveal */}
      {phase >= IntroPhase.LOGO_REVEAL && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-30 flex flex-col items-center text-center px-4"
        >
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-brand-amber/40 shadow-2xl shadow-brand-amber/20 backdrop-blur-xl mb-4">
            <Shield className="w-16 h-16 text-brand-amber animate-pulse" />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-3 drop-shadow-md"
          >
            TRISHUL <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-amber via-amber-400 to-sky-400">CRM</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-brand-amber hover:border-brand-amber/40 backdrop-blur-md transition-all text-xs font-semibold shadow-lg"
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

        {showSkip && (
          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 hover:text-white hover:border-brand-amber/50 backdrop-blur-md transition-all text-xs font-semibold tracking-wider shadow-lg hover:shadow-brand-amber/10 group"
          >
            <span>SKIP INTRO</span>
            <FastForward className="w-4 h-4 text-brand-amber group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Bottom Phase Progress Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-48 sm:w-64">
        <div className="h-1 w-full bg-slate-800/80 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-brand-amber to-sky-400 transition-all duration-100 ease-linear"
            style={{
              width: `${Math.min(100, ((phase - 1 + phaseProgress) / 12) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OpeningAnimation;
