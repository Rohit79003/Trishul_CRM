"use client";

import React, { useEffect, useRef } from "react";
import { IntroPhase, Easing } from "./AnimationStateMachine";

interface Trishul3DCanvasProps {
  phase: IntroPhase; // 1 to 12
  progress: number; // 0 to 1 inside phase
  cameraShake: number; // 0 to 1 intensity
  quality?: "high" | "medium" | "low";
}

interface LightningPoint {
  x: number;
  y: number;
}

interface LightningBranch {
  points: LightningPoint[];
  alpha: number;
}

interface CachedLightningBolt {
  mainPoints: LightningPoint[];
  branches: LightningBranch[];
  birthTime: number;
  lifeTime: number; // in seconds
}

export const Trishul3DCanvas: React.FC<Trishul3DCanvasProps> = ({
  phase,
  progress,
  cameraShake,
  quality = "high",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lightningBoltsRef = useRef<CachedLightningBolt[]>([]);
  const lastStrikeTimeRef = useRef<number>(0);

  // Procedural Lightning Generator (Only called on strike trigger, cached across frames)
  const generateLightningStrike = (startX: number, startY: number, endX: number, endY: number): CachedLightningBolt => {
    const mainPoints: LightningPoint[] = [{ x: startX, y: startY }];
    const branches: LightningBranch[] = [];

    const segments = 12;
    const dx = (endX - startX) / segments;
    const dy = (endY - startY) / segments;

    let currX = startX;
    let currY = startY;

    for (let i = 1; i <= segments; i++) {
      const isLast = i === segments;
      const jitterX = isLast ? 0 : (Math.random() - 0.5) * 38;
      const jitterY = isLast ? 0 : (Math.random() - 0.5) * 20;

      currX = startX + dx * i + jitterX;
      currY = startY + dy * i + jitterY;
      mainPoints.push({ x: currX, y: currY });

      // Generate a small sub-branch randomly
      if (!isLast && Math.random() < 0.45) {
        const branchLength = Math.random() * 50 + 20;
        const branchAngle = (Math.random() - 0.5) * Math.PI * 0.75 + (dy > 0 ? Math.PI / 2 : -Math.PI / 2);
        const branchPoints: LightningPoint[] = [{ x: currX, y: currY }];
        const subSegs = 4;

        let bX = currX;
        let bY = currY;
        for (let j = 1; j <= subSegs; j++) {
          bX += (Math.cos(branchAngle) * branchLength) / subSegs + (Math.random() - 0.5) * 12;
          bY += (Math.sin(branchAngle) * branchLength) / subSegs + (Math.random() - 0.5) * 12;
          branchPoints.push({ x: bX, y: bY });
        }
        branches.push({ points: branchPoints, alpha: 0.8 });
      }
    }

    return {
      mainPoints,
      branches,
      birthTime: performance.now() / 1000,
      lifeTime: 0.28, // 280ms duration
    };
  };

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

      const width = canvas.width;
      const height = canvas.height;
      const now = performance.now() / 1000;

      const centerX = width / 2;
      const groundY = height / 2 + 60;
      const skyOffset = Math.min(195, height * 0.25);

      let trishulY = groundY;
      let trishulScale = 1;
      let trishulOpacity = 1;
      let trishulRotation = 0;
      let trishulTiltX = 0;
      let floatOffsetY = 0;
      let showSpeedLines = false;
      let showGridTransform = false;

      const time = now * 2;
      floatOffsetY = Math.sin(time) * 10;

      // Phase State Positioning & Transformation Easing
      if (phase === IntroPhase.DARK_ENVIRONMENT) {
        trishulOpacity = 0;
      } else if (phase === IntroPhase.TRISHUL_REVEAL) {
        const ease = Easing.easeOutCubic(progress);
        trishulY = groundY - skyOffset + floatOffsetY * ease;
        trishulScale = 0.5 + ease * 0.5;
        trishulOpacity = Math.min(1, ease * 1.2);
        trishulRotation = (1 - ease) * -0.2;
        trishulTiltX = (1 - ease) * 0.15;
      } else if (phase === IntroPhase.ENERGY_BUILD) {
        trishulY = groundY - skyOffset + floatOffsetY;
        trishulScale = 1;
        trishulOpacity = 1;
        trishulRotation = Math.sin(now * 1.5) * 0.25;
        trishulTiltX = Math.cos(now * 1.5) * 0.1;
      } else if (phase === IntroPhase.LIGHTNING_STRIKE) {
        trishulY = groundY - skyOffset + floatOffsetY * 0.5;
        trishulScale = 1.08;
        trishulOpacity = 1;
        trishulRotation = Math.sin(now * 12) * 0.08;
        trishulTiltX = 0;

        // Trigger cached lightning strikes on strike intervals (every 220ms)
        if (now - lastStrikeTimeRef.current > 0.22) {
          lastStrikeTimeRef.current = now;
          const startX = centerX + (Math.random() - 0.5) * 300;
          const startY = -40;
          const endX = centerX + (Math.random() - 0.5) * 80;
          const endY = trishulY - 60;
          lightningBoltsRef.current.push(generateLightningStrike(startX, startY, endX, endY));
        }
      } else if (phase === IntroPhase.DESCENT_ACCEL) {
        const dropEase = Easing.exponentialDrop(progress);
        const startY = groundY - skyOffset;
        trishulY = startY + (groundY - startY) * dropEase;
        trishulScale = 1 + (1 - dropEase) * 0.1;
        trishulOpacity = 1;
        trishulRotation = 0;
        trishulTiltX = -0.15 * (1 - dropEase);
        showSpeedLines = true;
      } else if (
        phase === IntroPhase.GROUND_IMPACT ||
        phase === IntroPhase.GROUND_SHATTER ||
        phase === IntroPhase.ENERGY_SHOCKWAVE
      ) {
        trishulY = groundY;
        trishulScale = 1;
        trishulOpacity = 1;
        trishulRotation = 0;
        trishulTiltX = 0;
      } else if (phase === IntroPhase.WORLD_TRANSFORM) {
        trishulY = groundY;
        trishulScale = 1 - progress * 0.2;
        trishulOpacity = 1 - progress * 0.6;
        showGridTransform = true;
      } else if (phase >= IntroPhase.LOGO_REVEAL) {
        trishulY = groundY;
        trishulScale = 0.8;
        trishulOpacity = phase === IntroPhase.LOGIN_TRANSITION ? Math.max(0, 1 - progress * 1.8) : 0.4;
        showGridTransform = true;
      }

      ctx.save();

      // Camera Shake & Recoil Math (Damped Oscillator)
      if (cameraShake > 0) {
        const d = cameraShake;
        const shakeX = Math.sin(now * 45) * 24 * d + (Math.random() - 0.5) * 8 * d;
        const shakeY = Math.cos(now * 38) * 24 * d + (Math.random() - 0.5) * 8 * d;
        ctx.translate(shakeX, shakeY);
      }

      // Volumetric Radial Light Rays (Phase 2, 4, 7, 11)
      if (
        (phase === IntroPhase.TRISHUL_REVEAL && trishulOpacity > 0.2) ||
        phase === IntroPhase.LIGHTNING_STRIKE ||
        phase === IntroPhase.GROUND_SHATTER ||
        phase === IntroPhase.LOGO_REVEAL
      ) {
        ctx.save();
        ctx.translate(centerX, trishulY - 40);
        const rayCount = quality === "low" ? 6 : quality === "medium" ? 10 : 16;
        const rayLength = 280;

        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2 + time * 0.18;
          const rayGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
          const color1 = phase === IntroPhase.LIGHTNING_STRIKE ? "rgba(63, 169, 255, 0.4)" : "rgba(246, 183, 60, 0.35)";
          rayGrad.addColorStop(0, color1);
          rayGrad.addColorStop(1, "rgba(246, 183, 60, 0)");

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle - 0.06) * rayLength, Math.sin(angle - 0.06) * rayLength);
          ctx.lineTo(Math.cos(angle + 0.06) * rayLength, Math.sin(angle + 0.06) * rayLength);
          ctx.closePath();
          ctx.fillStyle = rayGrad;
          ctx.fill();
        }
        ctx.restore();
      }

      // Render Cached Lightning Strikes
      const remainingBolts: CachedLightningBolt[] = [];
      lightningBoltsRef.current.forEach((bolt) => {
        const age = now - bolt.birthTime;
        if (age < bolt.lifeTime) {
          const alpha = 1 - age / bolt.lifeTime;
          ctx.save();
          ctx.strokeStyle = `rgba(220, 240, 255, ${alpha})`;
          ctx.lineWidth = 3;
          if (quality !== "low") {
            ctx.shadowColor = "#3FA9FF";
            ctx.shadowBlur = 18;
          }

          // Main Bolt
          ctx.beginPath();
          bolt.mainPoints.forEach((pt, idx) => {
            const jx = (Math.random() - 0.5) * 3 * alpha;
            const jy = (Math.random() - 0.5) * 3 * alpha;
            if (idx === 0) ctx.moveTo(pt.x + jx, pt.y + jy);
            else ctx.lineTo(pt.x + jx, pt.y + jy);
          });
          ctx.stroke();

          // Sub Branches
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = `rgba(63, 169, 255, ${alpha * 0.75})`;
          bolt.branches.forEach((br) => {
            ctx.beginPath();
            br.points.forEach((pt, idx) => {
              if (idx === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.stroke();
          });

          ctx.restore();
          remainingBolts.push(bolt);
        }
      });
      lightningBoltsRef.current = remainingBolts;

      // Voronoi Ground Fractures (Phase 6, 7, 8)
      if (
        phase === IntroPhase.GROUND_IMPACT ||
        phase === IntroPhase.GROUND_SHATTER ||
        phase === IntroPhase.ENERGY_SHOCKWAVE
      ) {
        ctx.save();
        ctx.translate(centerX, groundY + 15);
        ctx.strokeStyle = "rgba(246, 183, 60, 0.85)";
        ctx.lineWidth = 3;
        if (quality !== "low") {
          ctx.shadowColor = "#F6B73C";
          ctx.shadowBlur = 16;
        }

        const crackCount = 12;
        const maxLen = 140 * (phase === IntroPhase.GROUND_IMPACT ? progress : 1);

        for (let i = 0; i < crackCount; i++) {
          const angle = (i / crackCount) * Math.PI * 2 + (i % 3) * 0.12;
          const len = maxLen * (0.6 + (i % 4) * 0.15);

          ctx.beginPath();
          ctx.moveTo(0, 0);
          const midX = Math.cos(angle) * (len * 0.5);
          const midY = Math.sin(angle) * (len * 0.5) * 0.45;
          ctx.lineTo(midX, midY);

          const endX = Math.cos(angle + 0.15) * len;
          const endY = Math.sin(angle + 0.15) * len * 0.45;
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Sub fracture tip
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "rgba(255, 232, 156, 0.6)";
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(endX + Math.cos(angle + 0.4) * 20, endY + Math.sin(angle + 0.4) * 10);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Neon Blue Digital Transform Grid (Phase 10 & 11)
      if (showGridTransform) {
        ctx.save();
        ctx.strokeStyle = "rgba(63, 169, 255, 0.3)";
        ctx.lineWidth = 1;
        const gridSpacing = 48;
        const gridY = groundY;

        for (let x = 0; x <= width; x += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, gridY);
          ctx.lineTo(centerX + (x - centerX) * 2.8, height);
          ctx.stroke();
        }
        for (let y = gridY; y <= height; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Speed Blur Trails (Phase 5)
      if (showSpeedLines) {
        ctx.save();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(246, 183, 60, 0.6)";
        for (let i = 0; i < 12; i++) {
          const lineX = centerX + (i - 6) * 24;
          const startYLine = trishulY - 180;
          const endYLine = trishulY - 20;
          ctx.beginPath();
          ctx.moveTo(lineX, startYLine);
          ctx.lineTo(lineX, endYLine);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Render Metallic 3D Trishul Geometry
      if (trishulOpacity > 0) {
        ctx.save();
        ctx.translate(centerX, trishulY);
        ctx.scale(trishulScale, trishulScale * (1 - trishulTiltX * 0.5));
        ctx.rotate(trishulRotation);
        ctx.globalAlpha = trishulOpacity;

        if (quality !== "low") {
          ctx.shadowColor = phase === IntroPhase.LIGHTNING_STRIKE ? "#3FA9FF" : "#F6B73C";
          ctx.shadowBlur = quality === "high" ? (phase === IntroPhase.LIGHTNING_STRIKE || phase === IntroPhase.GROUND_IMPACT ? 48 : 24) : 12;
        }

        // Multi-Layer Outer Energy Aura
        if (phase >= IntroPhase.ENERGY_BUILD && phase <= IntroPhase.DESCENT_ACCEL) {
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          const auraGrad = ctx.createRadialGradient(0, -50, 20, 0, -50, 160);
          auraGrad.addColorStop(0, "rgba(255, 245, 208, 0.4)");
          auraGrad.addColorStop(0.5, "rgba(246, 183, 60, 0.25)");
          auraGrad.addColorStop(1, "rgba(63, 169, 255, 0)");
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(0, -50, 160, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Metallic Gradients
        const bladeGrad = ctx.createLinearGradient(-20, -140, 20, 0);
        bladeGrad.addColorStop(0, "#FFF4D0");
        bladeGrad.addColorStop(0.25, "#F6B73C");
        bladeGrad.addColorStop(0.6, "#D98E04");
        bladeGrad.addColorStop(1, "#693F00");

        const bevelGrad = ctx.createLinearGradient(-15, -140, 15, 0);
        bevelGrad.addColorStop(0, "#FFFFFF");
        bevelGrad.addColorStop(0.4, "#FFE49E");
        bevelGrad.addColorStop(1, "#B37300");

        // Central Spear Blade
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(0, -150);
        ctx.lineTo(16, -70);
        ctx.lineTo(9, 0);
        ctx.lineTo(-9, 0);
        ctx.lineTo(-16, -70);
        ctx.closePath();
        ctx.fill();

        // Central Blade Specular Ridge Line
        ctx.fillStyle = bevelGrad;
        ctx.beginPath();
        ctx.moveTo(0, -145);
        ctx.lineTo(4, -70);
        ctx.lineTo(0, 0);
        ctx.lineTo(-1, -70);
        ctx.closePath();
        ctx.fill();

        // Left Curved Prong
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(-9, -22);
        ctx.quadraticCurveTo(-48, -48, -60, -118);
        ctx.quadraticCurveTo(-52, -80, -30, -54);
        ctx.quadraticCurveTo(-18, -38, -9, -10);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#FFE89C";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Right Curved Prong
        ctx.beginPath();
        ctx.moveTo(9, -22);
        ctx.quadraticCurveTo(48, -48, 60, -118);
        ctx.quadraticCurveTo(52, -80, 30, -54);
        ctx.quadraticCurveTo(18, -38, 9, -10);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#FFE89C";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Central Gem / Ornament Ring Collar
        const collarGrad = ctx.createLinearGradient(-30, 0, 30, 20);
        collarGrad.addColorStop(0, "#F6B73C");
        collarGrad.addColorStop(0.5, "#FFFFFF");
        collarGrad.addColorStop(1, "#8F5800");

        ctx.fillStyle = collarGrad;
        ctx.beginPath();
        ctx.roundRect(-24, -10, 48, 18, 5);
        ctx.fill();

        // Center Gem Emblem
        ctx.fillStyle = "#3FA9FF";
        ctx.beginPath();
        ctx.arc(0, -1, 6, 0, Math.PI * 2);
        ctx.fill();

        // Metallic Handle Shaft
        const handleGrad = ctx.createLinearGradient(-8, 0, 8, 120);
        handleGrad.addColorStop(0, "#D98E04");
        handleGrad.addColorStop(0.2, "#FFE49E");
        handleGrad.addColorStop(0.5, "#F6B73C");
        handleGrad.addColorStop(0.8, "#8F5800");
        handleGrad.addColorStop(1, "#2C1800");

        ctx.fillStyle = handleGrad;
        ctx.beginPath();
        ctx.rect(-8, 8, 16, 115);
        ctx.fill();

        // Grip Rings
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 2;
        for (let y = 25; y < 115; y += 14) {
          ctx.beginPath();
          ctx.moveTo(-8, y);
          ctx.lineTo(8, y);
          ctx.stroke();
        }

        // Pommel Spearhead Tip
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(0, 142);
        ctx.lineTo(11, 123);
        ctx.lineTo(-11, 123);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [phase, progress, cameraShake, quality]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20"
    />
  );
};

export default Trishul3DCanvas;

