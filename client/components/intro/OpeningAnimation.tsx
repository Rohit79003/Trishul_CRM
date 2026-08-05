"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFX } from "./SoundEffects";
import Trishul3DCanvas from "./Trishul3DCanvas";
import ParticleSystem from "./ParticleSystem";
import { Volume2, VolumeX, FastForward, Shield, Sparkles } from "lucide-react";

interface OpeningAnimationProps {
  onComplete?: () => void;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<number>(1);
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

  // Main Timeline Sequence Controller (0.0s to 5.5s)
  useEffect(() => {
    startTimeRef.current = Date.now();

    let hasPlayedRumble = false;
    let hasPlayedWhoosh = false;
    let hasPlayedImpact = false;
    let hasPlayedShockwave = false;
    let hasPlayedChime = false;

    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000; // in seconds

      if (elapsed < 0.5) {
        // Phase 1: Dark Scene (0 - 0.5s)
        setPhase(1);
        setPhaseProgress(elapsed / 0.5);
        if (!hasPlayedRumble) {
          soundFX.playAmbientRumble();
          hasPlayedRumble = true;
        }
      } else if (elapsed >= 0.5 && elapsed < 1.8) {
        // Phase 2: Trishul Appears (0.5 - 1.8s)
        setPhase(2);
        setPhaseProgress((elapsed - 0.5) / 1.3);
      } else if (elapsed >= 1.8 && elapsed < 2.5) {
        // Phase 3: Fast Drop (1.8 - 2.5s)
        setPhase(3);
        setPhaseProgress((elapsed - 1.8) / 0.7);
        if (!hasPlayedWhoosh) {
          soundFX.playDropWhoosh();
          hasPlayedWhoosh = true;
        }
      } else if (elapsed >= 2.5 && elapsed < 3.0) {
        // Phase 4: Ground Impact (2.5 - 3.0s)
        setPhase(4);
        const prog = (elapsed - 2.5) / 0.5;
        setPhaseProgress(prog);

        if (!hasPlayedImpact) {
          soundFX.playImpactBoom();
          setImpactTriggered(true);
          hasPlayedImpact = true;
        }

        // Camera shake impulse
        setCameraShake(Math.max(0, 1 - prog * 2));
      } else if (elapsed >= 3.0 && elapsed < 3.6) {
        // Phase 5: Energy Wave (3.0 - 3.6s)
        setPhase(5);
        setPhaseProgress((elapsed - 3.0) / 0.6);
        setCameraShake(0);

        if (!hasPlayedShockwave) {
          soundFX.playEnergyShockwave();
          hasPlayedShockwave = true;
        }
      } else if (elapsed >= 3.6 && elapsed < 4.0) {
        // Phase 6: Screen Flash (3.6 - 4.0s)
        setPhase(6);
        setPhaseProgress((elapsed - 3.6) / 0.4);
        setShowScreenFlash(true);
      } else if (elapsed >= 4.0 && elapsed < 4.8) {
        // Phase 7: Logo Transformation (4.0 - 4.8s)
        setShowScreenFlash(false);
        setPhase(7);
        setPhaseProgress((elapsed - 4.0) / 0.8);

        if (!hasPlayedChime) {
          soundFX.playLogoChime();
          hasPlayedChime = true;
        }
      } else if (elapsed >= 4.8 && elapsed < 5.5) {
        // Phase 8: Enter Login Screen (4.8 - 5.5s)
        setPhase(8);
        setPhaseProgress((elapsed - 4.8) / 0.7);
      } else if (elapsed >= 5.5) {
        // Complete animation & trigger callback
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
      {/* 3D Trishul WebGL / Canvas Layer */}
      <Trishul3DCanvas
        phase={phase}
        progress={phaseProgress}
        cameraShake={cameraShake}
      />

      {/* Canvas Particle Engine Layer (Debris, Sparks, Shockwave) */}
      <ParticleSystem
        phase={phase}
        progress={phaseProgress}
        impactTriggered={impactTriggered}
      />

      {/* Phase 6: Blinding White Screen Flash */}
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

      {/* Phase 7: Logo Transformation & Text Reveal overlay */}
      {phase >= 7 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
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
            Next-Gen Enterprise AI Intelligence
          </motion.p>
        </motion.div>
      )}

      {/* Top Floating Controls Bar (Skip, Mute, Progress) */}
      <div className="absolute top-6 left-6 right-6 z-40 flex items-center justify-between pointer-events-auto">
        {/* Sound Toggle */}
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

        {/* Skip Intro Button */}
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

      {/* Bottom Timeline Phase Progress Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-48 sm:w-64">
        <div className="h-1 w-full bg-slate-800/80 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-brand-amber to-sky-400 transition-all duration-100 ease-linear"
            style={{
              width: `${Math.min(100, ((phase - 1 + phaseProgress) / 8) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OpeningAnimation;
