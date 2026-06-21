'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
}

export default function ApeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle settings
    const particleCount = 180;
    const particles: Particle[] = [];
    const isMobile = width < 768;
    const sphereRadius = Math.min(width, height) * (isMobile ? 0.32 : 0.35);
    const connectionThreshold = isMobile ? 78 : 85;
    const fov = 400;

    // Generate random particles distributed on a dome (hemisphere) surface
    const baseCount = 45;
    const domeCount = particleCount - baseCount;

    // 1. Dome shell particles
    for (let i = 0; i < domeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random()); // 0 to PI/2

      const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
      const y = -sphereRadius * Math.cos(phi); // upward dome (negative is up in screen space)
      const z = sphereRadius * Math.sin(phi) * Math.sin(theta);

      const colors = ['#00A7FA', '#FF5E97', '#BF5AF2', '#89D0FF'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      particles.push({
        x,
        y,
        z,
        color,
        size: Math.random() * 1.5 + 0.8,
      });
    }

    // 2. Base ring particles to clearly define the flat bottom of the dome
    for (let i = 0; i < baseCount; i++) {
      const theta = (i / baseCount) * Math.PI * 2;
      
      const x = sphereRadius * Math.cos(theta);
      const y = 0; // Flat bottom plane
      const z = sphereRadius * Math.sin(theta);

      const colors = ['#00A7FA', '#FF5E97', '#BF5AF2', '#89D0FF'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      particles.push({
        x,
        y,
        z,
        color,
        size: Math.random() * 1.5 + 1.2,
      });
    }

    // Initial tilt to show the 3D base circle of the dome
    const initialTilt = 0.4;
    particles.forEach(p => {
      const cos = Math.cos(initialTilt);
      const sin = Math.sin(initialTilt);
      const y1 = p.y * cos - p.z * sin;
      const z1 = p.z * cos + p.y * sin;
      p.y = y1;
      p.z = z1;
    });

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX - width / 2) * 0.05;
      mouseRef.current.targetY = (e.clientY - height / 2) * 0.05;
    };

    // Handle resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Rotation angles
    let angleY = 0.0015;
    let angleX = 0.0; // Keep upright, only tilt on mouse movement

    const rotateX = (p: Particle, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const y1 = p.y * cos - p.z * sin;
      const z1 = p.z * cos + p.y * sin;
      p.y = y1;
      p.z = z1;
    };

    const rotateY = (p: Particle, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x1 = p.x * cos - p.z * sin;
      const z1 = p.z * cos + p.x * sin;
      p.x = x1;
      p.z = z1;
    };

    // Render loop
    const render = () => {
      ctx.fillStyle = '#09090E';
      ctx.fillRect(0, 0, width, height);

      // Smooth mouse rotation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const extraRotY = mouseRef.current.x * 0.001;
      const extraRotX = mouseRef.current.y * 0.001;

      // Project and draw particles
      const projected: { sx: number; sy: number; size: number; z: number; color: string }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Constant spin + mouse drag spin
        rotateY(p, angleY + extraRotY);
        rotateX(p, angleX + extraRotX);

        const scale = fov / (fov + p.z);
        const sx = p.x * scale + width / 2;
        const sy = p.y * scale + height / 2;

        projected.push({
          sx,
          sy,
          size: p.size * scale,
          z: p.z,
          color: p.color,
        });
      }

      // Sort by depth (back to front) for correct rendering
      projected.sort((a, b) => b.z - a.z);

      // Draw connection lines between close particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (p1.z > 150) continue; // Skip far-away background particles for clean styling

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dist = Math.hypot(p1.sx - p2.sx, p1.sy - p2.sy);

          // Connection threshold
          if (dist < connectionThreshold) {
            const opacity = (1 - dist / connectionThreshold) * 0.12 * (fov / (fov + (p1.z + p2.z) / 2));
            ctx.strokeStyle = `rgba(137, 208, 255, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.stroke();
          }
        }
      }

      // Draw particle dots
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const alpha = Math.max(0.1, (fov - p.z) / (fov * 1.5));
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, Math.max(0.5, p.size), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0; // Reset

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen z-0 pointer-events-none select-none"
    />
  );
}
