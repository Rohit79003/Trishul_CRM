"use client";

import React, { useEffect, useRef } from "react";

interface Trishul3DCanvasProps {
  phase: number; // 1 to 8
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

      // Center and Ground Positions
      const centerX = width / 2;
      const groundY = height / 2 + 60;

      // Calculate Trishul Y Position and Scale based on Phase
      let trishulY = groundY;
      let trishulScale = 1;
      let trishulOpacity = 1;
      let trishulRotation = 0;
      let floatOffsetY = 0;
      let showSpeedLines = false;

      // Floating ambient motion
      const time = Date.now() * 0.002;
      floatOffsetY = Math.sin(time) * 8;

      if (phase === 1) {
        // Dark scene - hidden
        trishulOpacity = 0;
      } else if (phase === 2) {
        // Fade in & float high
        trishulY = groundY - 260 + floatOffsetY;
        trishulScale = 0.6 + progress * 0.4;
        trishulOpacity = Math.min(1, progress * 1.2);
        trishulRotation = (1 - progress) * -0.15;
      } else if (phase === 3) {
        // Fast Drop downwards
        const dropEase = progress * progress * progress; // Acceleration curve
        const startY = groundY - 260;
        trishulY = startY + (groundY - startY) * dropEase;
        trishulScale = 1;
        trishulOpacity = 1;
        trishulRotation = 0;
        showSpeedLines = true;
      } else if (phase >= 4) {
        // Grounded impact position
        trishulY = groundY;
        trishulScale = 1;
        trishulOpacity = phase === 8 ? Math.max(0, 1 - progress * 1.5) : 1;
      }

      ctx.save();

      // Apply Camera Shake offset
      if (cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * 35 * cameraShake;
        const shakeY = (Math.random() - 0.5) * 35 * cameraShake;
        ctx.translate(shakeX, shakeY);
      }

      // Draw Volumetric Light Rays (Phase 2 & 7)
      if ((phase === 2 && trishulOpacity > 0.2) || phase === 7) {
        ctx.save();
        ctx.translate(centerX, trishulY - 40);
        const rays = 12;
        const rayLength = 220;

        for (let i = 0; i < rays; i++) {
          const angle = (i / rays) * Math.PI * 2 + time * 0.2;
          const rayGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
          rayGrad.addColorStop(0, "rgba(246, 183, 60, 0.35)");
          rayGrad.addColorStop(1, "rgba(246, 183, 60, 0)");

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle - 0.1) * rayLength, Math.sin(angle - 0.1) * rayLength);
          ctx.lineTo(Math.cos(angle + 0.1) * rayLength, Math.sin(angle + 0.1) * rayLength);
          ctx.closePath();
          ctx.fillStyle = rayGrad;
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw Motion Blur Speed Lines in Phase 3
      if (showSpeedLines) {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(246, 183, 60, 0.4)";
        for (let i = 0; i < 8; i++) {
          const lineX = centerX + (i - 4) * 25;
          const startYLine = trishulY - 140;
          const endYLine = trishulY - 40;
          ctx.beginPath();
          ctx.moveTo(lineX, startYLine);
          ctx.lineTo(lineX, endYLine);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Render 3D Metallic Trishul / Trident Geometry
      if (trishulOpacity > 0) {
        ctx.save();
        ctx.translate(centerX, trishulY);
        ctx.scale(trishulScale, trishulScale);
        ctx.rotate(trishulRotation);
        ctx.globalAlpha = trishulOpacity;

        // Golden Specular Shadow / Glow
        ctx.shadowColor = "#F6B73C";
        ctx.shadowBlur = phase === 4 ? 40 : 20;

        // 1. Central Blade (Sharp Peak)
        const bladeGrad = ctx.createLinearGradient(-15, -120, 15, 0);
        bladeGrad.addColorStop(0, "#FFE89C");
        bladeGrad.addColorStop(0.3, "#F6B73C");
        bladeGrad.addColorStop(0.7, "#D98E04");
        bladeGrad.addColorStop(1, "#8F5800");

        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(0, -140); // Tip
        ctx.lineTo(14, -65);
        ctx.lineTo(8, 0);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-14, -65);
        ctx.closePath();
        ctx.fill();

        // High specular highlight line along center blade
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.moveTo(0, -135);
        ctx.lineTo(3, -65);
        ctx.lineTo(0, 0);
        ctx.lineTo(-1, -65);
        ctx.closePath();
        ctx.fill();

        // 2. Left Curved Prong
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(-10, -20);
        ctx.quadraticCurveTo(-45, -45, -55, -110); // Outer tip
        ctx.quadraticCurveTo(-48, -75, -28, -50);
        ctx.quadraticCurveTo(-18, -35, -10, -10);
        ctx.closePath();
        ctx.fill();

        // Left prong metallic bevel edge
        ctx.strokeStyle = "#FFE89C";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3. Right Curved Prong
        ctx.beginPath();
        ctx.moveTo(10, -20);
        ctx.quadraticCurveTo(45, -45, 55, -110); // Outer tip
        ctx.quadraticCurveTo(48, -75, 28, -50);
        ctx.quadraticCurveTo(18, -35, 10, -10);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#FFE89C";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 4. Center Decorative Ring / Collar
        const ringGrad = ctx.createLinearGradient(-30, 0, 30, 20);
        ringGrad.addColorStop(0, "#F6B73C");
        ringGrad.addColorStop(0.5, "#FFFFFF");
        ringGrad.addColorStop(1, "#D98E04");

        ctx.fillStyle = ringGrad;
        ctx.beginPath();
        ctx.roundRect(-22, -8, 44, 16, 4);
        ctx.fill();

        // 5. Metallic Handle (Shaft)
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

        // Handle grip texture lines
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = 2;
        for (let y = 25; y < 110; y += 12) {
          ctx.beginPath();
          ctx.moveTo(-7, y);
          ctx.lineTo(7, y);
          ctx.stroke();
        }

        // 6. Handle Bottom Pommel Spearhead
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
