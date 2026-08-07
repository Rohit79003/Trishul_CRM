"use client";

import React, { useEffect, useRef } from "react";
import { IntroPhase } from "./AnimationStateMachine";

interface ParticleSystemProps {
  phase: IntroPhase;
  progress: number;
  impactTriggered: boolean;
  quality?: "high" | "medium" | "low";
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  type: "ambient" | "spark" | "debris" | "smoke" | "digital";
}

const MAX_POOL_SIZE = 350;

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  phase,
  progress,
  impactTriggered,
  quality = "high",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlePoolRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const shockwaveRadiusRef = useRef<number>(0);
  const shockwaveAlphaRef = useRef<number>(0);

  // Initialize Particle Object Pool
  useEffect(() => {
    const pool: Particle[] = [];
    for (let i = 0; i < MAX_POOL_SIZE; i++) {
      pool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        color: "#F6B73C",
        alpha: 1,
        decay: 0.01,
        rotation: 0,
        vRot: 0,
        type: "ambient",
      });
    }

    // Spawn initial ambient particles
    const ambientCount = quality === "low" ? 35 : quality === "medium" ? 65 : 120;
    const width = typeof window !== "undefined" ? window.innerWidth : 1200;
    const height = typeof window !== "undefined" ? window.innerHeight : 800;

    for (let i = 0; i < ambientCount; i++) {
      const p = pool[i];
      p.active = true;
      p.x = Math.random() * width;
      p.y = Math.random() * height;
      p.vx = (Math.random() - 0.5) * 0.4;
      p.vy = -Math.random() * 0.5 - 0.1;
      p.size = Math.random() * 2.5 + 1;
      p.color = Math.random() > 0.4 ? "#F6B73C" : "#3FA9FF";
      p.alpha = Math.random() * 0.6 + 0.2;
      p.decay = 0.0008;
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 0.02;
      p.type = "ambient";
    }

    particlePoolRef.current = pool;
  }, [quality]);

  // Helper to spawn a particle from the pool
  const spawnParticle = (
    x: number,
    y: number,
    vx: number,
    vy: number,
    size: number,
    color: string,
    alpha: number,
    decay: number,
    type: Particle["type"],
    vRot: number = 0
  ) => {
    const pool = particlePoolRef.current;
    const inactive = pool.find((p) => !p.active);
    if (inactive) {
      inactive.active = true;
      inactive.x = x;
      inactive.y = y;
      inactive.vx = vx;
      inactive.vy = vy;
      inactive.size = size;
      inactive.color = color;
      inactive.alpha = alpha;
      inactive.decay = decay;
      inactive.rotation = Math.random() * Math.PI * 2;
      inactive.vRot = vRot;
      inactive.type = type;
    }
  };

  // Handle Ground Impact Debris & Dust Burst (Phase 6)
  useEffect(() => {
    if (impactTriggered) {
      const width = canvasRef.current?.width || window.innerWidth;
      const height = canvasRef.current?.height || window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2 + 60;

      const debrisCount = quality === "low" ? 35 : quality === "medium" ? 65 : 110;

      // 1. High Velocity 3D Polygonal Rock Debris
      for (let i = 0; i < debrisCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 16 + 4;
        const color = Math.random() > 0.4 ? "#F6B73C" : Math.random() > 0.5 ? "#FF8A00" : "#FFFFFF";
        spawnParticle(
          centerX,
          centerY,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed - Math.random() * 6,
          Math.random() * 5.5 + 2,
          color,
          1,
          Math.random() * 0.02 + 0.012,
          "debris",
          (Math.random() - 0.5) * 0.25
        );
      }

      // 2. Volumetric Rolling Smoke & Dust Clouds
      const smokeCount = quality === "low" ? 8 : 18;
      for (let i = 0; i < smokeCount; i++) {
        const angle = Math.random() * Math.PI;
        const speed = Math.random() * 6 + 2;
        spawnParticle(
          centerX,
          centerY + 10,
          Math.cos(angle) * speed,
          -Math.sin(angle) * 2 - Math.random() * 1.5,
          Math.random() * 25 + 15,
          "rgba(246, 183, 60, 0.25)",
          0.6,
          0.008 + Math.random() * 0.006,
          "smoke"
        );
      }

      shockwaveRadiusRef.current = 10;
      shockwaveAlphaRef.current = 1;
    }
  }, [impactTriggered, quality]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 + 60;

      // Dark Fog Background Gradient (Phases 1 to 5)
      if (phase <= IntroPhase.DESCENT_ACCEL) {
        const grad = ctx.createRadialGradient(
          centerX,
          centerY,
          20,
          centerX,
          centerY,
          Math.max(canvas.width, canvas.height) * 0.65
        );
        grad.addColorStop(0, "rgba(15, 23, 42, 0.45)");
        grad.addColorStop(0.5, "rgba(3, 7, 18, 0.85)");
        grad.addColorStop(1, "rgba(2, 6, 23, 1)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const skyOffset = Math.min(195, canvas.height * 0.25);

      // Phase 3 & 4: Orbiting Plasma Energy Sparks
      if (
        (phase === IntroPhase.ENERGY_BUILD || phase === IntroPhase.LIGHTNING_STRIKE) &&
        Math.random() < (quality === "low" ? 0.3 : 0.75)
      ) {
        spawnParticle(
          centerX + (Math.random() - 0.5) * 140,
          centerY - skyOffset + (Math.random() - 0.5) * 140,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          Math.random() * 3.5 + 1.5,
          Math.random() > 0.5 ? "#3FA9FF" : "#F6B73C",
          1,
          0.035,
          "spark"
        );
      }

      // Phase 5: High-Speed Plunge Trail Sparks
      if (phase === IntroPhase.DESCENT_ACCEL && Math.random() < 0.8) {
        const trishulY = centerY - skyOffset * (1 - progress);
        for (let i = 0; i < (quality === "low" ? 2 : 4); i++) {
          spawnParticle(
            centerX + (Math.random() - 0.5) * 40,
            trishulY + (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 2,
            -Math.random() * 10 - 4,
            Math.random() * 3 + 1.5,
            Math.random() > 0.5 ? "#FF8A00" : "#F6B73C",
            1,
            0.045,
            "spark"
          );
        }
      }

      // Phase 10: Neon Blue Cyber Sparks Dissolving into CRM Reveal
      if (phase === IntroPhase.WORLD_TRANSFORM && Math.random() < 0.65) {
        spawnParticle(
          Math.random() * canvas.width,
          canvas.height * (0.35 + Math.random() * 0.55),
          (Math.random() - 0.5) * 1.5,
          -Math.random() * 2.5 - 1,
          Math.random() * 3.5 + 1,
          "#3FA9FF",
          1,
          0.018,
          "digital"
        );
      }

      // Update & Render Active Particles from Pool
      const pool = particlePoolRef.current;

      pool.forEach((p) => {
        if (!p.active) return;

        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        if (p.type === "debris") {
          p.vy += 0.28; // Heavy gravity on rock debris
        } else if (p.type === "smoke") {
          p.size += 0.4; // Expanding smoke radius
        }

        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);

          if (quality !== "low") {
            ctx.shadowColor = p.color;
            ctx.shadowBlur = p.type === "spark" || p.type === "debris" ? 10 : 3;
          }

          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          if (p.type === "debris") {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size, 0);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size, 0);
            ctx.closePath();
            ctx.fill();
          } else if (p.type === "smoke") {
            const smokeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
            smokeGrad.addColorStop(0, p.color);
            smokeGrad.addColorStop(1, "rgba(246, 183, 60, 0)");
            ctx.fillStyle = smokeGrad;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === "digital") {
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        } else {
          // Deactivate particle or recycle ambient particle
          if (p.type === "ambient") {
            p.x = Math.random() * canvas.width;
            p.y = canvas.height + 10;
            p.alpha = Math.random() * 0.6 + 0.2;
          } else {
            p.active = false;
          }
        }
      });

      // Phase 8: Expanding Circular Energy Shockwave Ring
      if (shockwaveAlphaRef.current > 0.01) {
        shockwaveRadiusRef.current += 20;
        shockwaveAlphaRef.current *= 0.94;

        ctx.save();
        ctx.lineWidth = 8;
        const ringGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          Math.max(0, shockwaveRadiusRef.current - 20),
          centerX,
          centerY,
          shockwaveRadiusRef.current + 20
        );
        ringGrad.addColorStop(0, "rgba(63, 169, 255, 0)");
        ringGrad.addColorStop(0.5, `rgba(246, 183, 60, ${shockwaveAlphaRef.current})`);
        ringGrad.addColorStop(0.8, `rgba(63, 169, 255, ${shockwaveAlphaRef.current * 0.85})`);
        ringGrad.addColorStop(1, "rgba(63, 169, 255, 0)");

        ctx.strokeStyle = ringGrad;
        if (quality !== "low") {
          ctx.shadowColor = "#3FA9FF";
          ctx.shadowBlur = 24;
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, shockwaveRadiusRef.current, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [phase, progress, quality]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
};

export default ParticleSystem;

