"use client";

import React, { useEffect, useRef } from "react";
import { IntroPhase } from "./AnimationStateMachine";

interface Trishul3DCanvasProps {
  phase: IntroPhase; // 1 to 12
  progress: number; // 0 to 1 inside phase
  cameraShake: number; // 0 to 1 intensity
}

export const Trishul3DCanvas: React.FC<Trishul3DCanvasProps> = ({
  phase,
  progress,
  cameraShake,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

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

      const centerX = width / 2;
      const groundY = height / 2 + 60;

      let trishulY = groundY;
      let trishulScale = 1;
      let trishulOpacity = 1;
      let trishulRotation = 0;
      let floatOffsetY = 0;
      let showSpeedLines = false;
      let showGridTransform = false;

      const time = Date.now() * 0.002;
      floatOffsetY = Math.sin(time) * 8;

      if (phase === IntroPhase.DARK_ENVIRONMENT) {
        trishulOpacity = 0;
      } else if (phase === IntroPhase.TRISHUL_REVEAL) {
        trishulY = groundY - 260 + floatOffsetY;
        trishulScale = 0.6 + progress * 0.4;
        trishulOpacity = Math.min(1, progress * 1.2);
        trishulRotation = (1 - progress) * -0.15;
      } else if (phase === IntroPhase.ENERGY_BUILD) {
        trishulY = groundY - 260 + floatOffsetY;
        trishulScale = 1;
        trishulOpacity = 1;
        trishulRotation = time * 1.2;
      } else if (phase === IntroPhase.LIGHTNING_STRIKE) {
        trishulY = groundY - 260 + floatOffsetY;
        trishulScale = 1.05;
        trishulOpacity = 1;
        trishulRotation = Math.sin(time * 8) * 0.1;
      } else if (phase === IntroPhase.DESCENT_ACCEL) {
        const dropEase = progress * progress * progress;
        const startY = groundY - 260;
        trishulY = startY + (groundY - startY) * dropEase;
        trishulScale = 1;
        trishulOpacity = 1;
        trishulRotation = 0;
        showSpeedLines = true;
      } else if (
        phase === IntroPhase.GROUND_IMPACT ||
        phase === IntroPhase.GROUND_SHATTER ||
        phase === IntroPhase.ENERGY_SHOCKWAVE
      ) {
        trishulY = groundY;
        trishulScale = 1;
        trishulOpacity = 1;
      } else if (phase === IntroPhase.WORLD_TRANSFORM) {
        trishulY = groundY;
        trishulScale = 1 - progress * 0.2;
        trishulOpacity = 1 - progress * 0.5;
        showGridTransform = true;
      } else if (phase >= IntroPhase.LOGO_REVEAL) {
        trishulY = groundY;
        trishulScale = 0.8;
        trishulOpacity = phase === IntroPhase.LOGIN_TRANSITION ? Math.max(0, 1 - progress * 1.5) : 0.5;
        showGridTransform = true;
      }

      ctx.save();

      // Camera Shake
      if (cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * 38 * cameraShake;
        const shakeY = (Math.random() - 0.5) * 38 * cameraShake;
        ctx.translate(shakeX, shakeY);
      }

      // Volumetric Light Rays (Phase 2, 4, 7, 11)
      if (
        (phase === IntroPhase.TRISHUL_REVEAL && trishulOpacity > 0.2) ||
        phase === IntroPhase.LIGHTNING_STRIKE ||
        phase === IntroPhase.GROUND_SHATTER ||
        phase === IntroPhase.LOGO_REVEAL
      ) {
        ctx.save();
        ctx.translate(centerX, trishulY - 40);
        const rays = 14;
        const rayLength = 240;

        for (let i = 0; i < rays; i++) {
          const angle = (i / rays) * Math.PI * 2 + time * 0.25;
          const rayGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
          rayGrad.addColorStop(0, phase === IntroPhase.LIGHTNING_STRIKE ? "rgba(63, 169, 255, 0.45)" : "rgba(246, 183, 60, 0.35)");
          rayGrad.addColorStop(1, "rgba(246, 183, 60, 0)");

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle - 0.08) * rayLength, Math.sin(angle - 0.08) * rayLength);
          ctx.lineTo(Math.cos(angle + 0.08) * rayLength, Math.sin(angle + 0.08) * rayLength);
          ctx.closePath();
          ctx.fillStyle = rayGrad;
          ctx.fill();
        }
        ctx.restore();
      }

      // Voronoi Ground Fractures (Phase 6 & 7)
      if (phase === IntroPhase.GROUND_IMPACT || phase === IntroPhase.GROUND_SHATTER) {
        ctx.save();
        ctx.translate(centerX, groundY + 20);
        ctx.strokeStyle = "rgba(246, 183, 60, 0.7)";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#F6B73C";
        ctx.shadowBlur = 15;

        // Radial fracture lines spreading outward
        const crackLines = 10;
        for (let i = 0; i < crackLines; i++) {
          const angle = (i / crackLines) * Math.PI * 2 + (i % 2) * 0.1;
          const len = 120 * progress;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * (len * 0.5), Math.sin(angle) * (len * 0.5));
          ctx.lineTo(Math.cos(angle + 0.1) * len, Math.sin(angle + 0.1) * len);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Phase 10: Neon Blue Digital Grid Transformation
      if (showGridTransform) {
        ctx.save();
        ctx.strokeStyle = "rgba(63, 169, 255, 0.35)";
        ctx.lineWidth = 1;
        const gridSpacing = 40;
        const gridY = groundY;

        for (let x = 0; x <= width; x += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, gridY);
          ctx.lineTo(centerX + (x - centerX) * 2.5, height);
          ctx.stroke();
        }
        for (let y = gridY; y <= height; y += 25) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Motion Blur Speed Lines (Phase 5)
      if (showSpeedLines) {
        ctx.save();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(246, 183, 60, 0.5)";
        for (let i = 0; i < 10; i++) {
          const lineX = centerX + (i - 5) * 22;
          const startYLine = trishulY - 150;
          const endYLine = trishulY - 30;
          ctx.beginPath();
          ctx.moveTo(lineX, startYLine);
          ctx.lineTo(lineX, endYLine);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Render Metallic Trishul Geometry
      if (trishulOpacity > 0) {
        ctx.save();
        ctx.translate(centerX, trishulY);
        ctx.scale(trishulScale, trishulScale);
        ctx.rotate(trishulRotation);
        ctx.globalAlpha = trishulOpacity;

        ctx.shadowColor = phase === IntroPhase.LIGHTNING_STRIKE ? "#3FA9FF" : "#F6B73C";
        ctx.shadowBlur = phase === IntroPhase.LIGHTNING_STRIKE || phase === IntroPhase.GROUND_IMPACT ? 45 : 22;

        // Central Blade
        const bladeGrad = ctx.createLinearGradient(-15, -120, 15, 0);
        bladeGrad.addColorStop(0, "#FFE89C");
        bladeGrad.addColorStop(0.3, "#F6B73C");
        bladeGrad.addColorStop(0.7, "#D98E04");
        bladeGrad.addColorStop(1, "#8F5800");

        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(0, -140);
        ctx.lineTo(14, -65);
        ctx.lineTo(8, 0);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-14, -65);
        ctx.closePath();
        ctx.fill();

        // High specular highlight line
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.beginPath();
        ctx.moveTo(0, -135);
        ctx.lineTo(3, -65);
        ctx.lineTo(0, 0);
        ctx.lineTo(-1, -65);
        ctx.closePath();
        ctx.fill();

        // Left Curved Prong
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(-10, -20);
        ctx.quadraticCurveTo(-45, -45, -55, -110);
        ctx.quadraticCurveTo(-48, -75, -28, -50);
        ctx.quadraticCurveTo(-18, -35, -10, -10);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#FFE89C";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Right Curved Prong
        ctx.beginPath();
        ctx.moveTo(10, -20);
        ctx.quadraticCurveTo(45, -45, 55, -110);
        ctx.quadraticCurveTo(48, -75, 28, -50);
        ctx.quadraticCurveTo(18, -35, 10, -10);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#FFE89C";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Center Ring Collar
        const ringGrad = ctx.createLinearGradient(-30, 0, 30, 20);
        ringGrad.addColorStop(0, "#F6B73C");
        ringGrad.addColorStop(0.5, "#FFFFFF");
        ringGrad.addColorStop(1, "#D98E04");

        ctx.fillStyle = ringGrad;
        ctx.beginPath();
        ctx.roundRect(-22, -8, 44, 16, 4);
        ctx.fill();

        // Metallic Handle Shaft
        const handleGrad = ctx.createLinearGradient(-8, 0, 8, 120);
        handleGrad.addColorStop(0, "#D98E04");
        handleGrad.addColorStop(0.2, "#FFE89C");
        handleGrad.addColorStop(0.5, "#F6B73C");
        handleGrad.addColorStop(0.8, "#8F5800");
        handleGrad.addColorStop(1, "#3A2100");

        ctx.fillStyle = handleGrad;
        ctx.beginPath();
        ctx.rect(-7, 8, 14, 110);
        ctx.fill();

        // Grip Lines
        ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
        ctx.lineWidth = 2;
        for (let y = 25; y < 110; y += 12) {
          ctx.beginPath();
          ctx.moveTo(-7, y);
          ctx.lineTo(7, y);
          ctx.stroke();
        }

        // Pommel Spearhead
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(0, 135);
        ctx.lineTo(10, 118);
        ctx.lineTo(-10, 118);
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
  }, [phase, progress, cameraShake]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20"
    />
  );
};

export default Trishul3DCanvas;
