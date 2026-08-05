"use client";

import React, { useEffect, useRef } from "react";

interface ParticleSystemProps {
  phase: number; // Current timeline phase (1 to 8)
  progress: number; // Phase progress 0 to 1
  impactTriggered: boolean;
}

interface Particle {
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
  type: "ambient" | "spark" | "debris" | "ring";
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  phase,
  progress,
  impactTriggered,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const shockwaveRadiusRef = useRef<number>(0);
  const shockwaveAlphaRef = useRef<number>(0);

  // Initialize ambient micro-dust particles
  useEffect(() => {
    const particles: Particle[] = [];
    const count = 60;
    const width = typeof window !== "undefined" ? window.innerWidth : 1200;
    const height = typeof window !== "undefined" ? window.innerHeight : 800;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.1,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? "#F6B73C" : "#3FA9FF",
        alpha: Math.random() * 0.6 + 0.2,
        decay: 0.001,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02,
        type: "ambient",
      });
    }
    particlesRef.current = particles;
  }, []);

  // Handle Phase 4 Impact Burst
  useEffect(() => {
    if (impactTriggered) {
      const width = canvasRef.current?.width || window.innerWidth;
      const height = canvasRef.current?.height || window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2 + 60; // Ground impact point

      // Spawn rock debris fragments & explosive sparks
      const newDebris: Particle[] = [];
      const debrisCount = 90;

      for (let i = 0; i < debrisCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;
        newDebris.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 4,
          size: Math.random() * 5 + 2,
          color:
            Math.random() > 0.4
              ? "#F6B73C"
              : Math.random() > 0.5
              ? "#FF8A00"
              : "#FFFFFF",
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          type: "debris",
        });
      }

      particlesRef.current = [...particlesRef.current, ...newDebris];

      // Trigger expanding shockwave
      shockwaveRadiusRef.current = 10;
      shockwaveAlphaRef.current = 1;
    }
  }, [impactTriggered]);

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

      // Render Dynamic Background Fog / Smoke (Phase 1-3)
      if (phase <= 4) {
        const grad = ctx.createRadialGradient(
          centerX,
          centerY,
          20,
          centerX,
          centerY,
          Math.max(canvas.width, canvas.height) * 0.6
        );
        grad.addColorStop(0, "rgba(15, 23, 42, 0.4)");
        grad.addColorStop(0.5, "rgba(3, 7, 18, 0.8)");
        grad.addColorStop(1, "rgba(2, 6, 23, 1)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Render Fast Drop Trail Sparks in Phase 3
      if (phase === 3 && Math.random() < 0.8) {
        const trishulY = centerY - 300 * (1 - progress);
        for (let i = 0; i < 4; i++) {
          particlesRef.current.push({
            x: centerX + (Math.random() - 0.5) * 40,
            y: trishulY + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 8 - 2,
            size: Math.random() * 3 + 1.5,
            color: Math.random() > 0.5 ? "#FF8A00" : "#F6B73C",
            alpha: 1,
            decay: 0.05,
            rotation: 0,
            vRot: 0,
            type: "spark",
          });
        }
      }

      // Update & Render Particles
      const nextParticles: Particle[] = [];

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        // Apply slight gravity to debris
        if (p.type === "debris") {
          p.vy += 0.25;
        }

        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.type === "spark" || p.type === "debris" ? 10 : 4;

          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          if (p.type === "debris") {
            // Draw diamond / jagged rock particle
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size, 0);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size, 0);
            ctx.closePath();
            ctx.fill();
          } else {
            // Draw glowing circle particle
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
          nextParticles.push(p);
        } else if (p.type === "ambient") {
          // Recycle ambient particles
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.alpha = Math.random() * 0.6 + 0.2;
          nextParticles.push(p);
        }
      });

      particlesRef.current = nextParticles;

      // Phase 5: Circular Expanding Shockwave Energy Ring
      if (shockwaveAlphaRef.current > 0.01) {
        shockwaveRadiusRef.current += 16;
        shockwaveAlphaRef.current *= 0.94;

        ctx.save();
        ctx.lineWidth = 6;
        const ringGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          Math.max(0, shockwaveRadiusRef.current - 15),
          centerX,
          centerY,
          shockwaveRadiusRef.current + 15
        );
        ringGrad.addColorStop(0, "rgba(63, 169, 255, 0)");
        ringGrad.addColorStop(
          0.5,
          `rgba(246, 183, 60, ${shockwaveAlphaRef.current})`
        );
        ringGrad.addColorStop(
          0.8,
          `rgba(63, 169, 255, ${shockwaveAlphaRef.current * 0.8})`
        );
        ringGrad.addColorStop(1, "rgba(63, 169, 255, 0)");

        ctx.strokeStyle = ringGrad;
        ctx.shadowColor = "#3FA9FF";
        ctx.shadowBlur = 20;

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
  }, [phase, progress]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
};

export default ParticleSystem;
