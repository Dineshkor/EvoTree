'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import type { EraPalette, ParticleKind } from '@/lib/types';

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
}

function seedParticle(kind: ParticleKind, w: number, h: number): Particle {
  const base: Particle = {
    x: Math.random() * w,
    y: Math.random() * h,
    r: 1 + Math.random() * 2,
    vx: (Math.random() - 0.5) * 0.25,
    vy: 0,
    a: 0.2 + Math.random() * 0.6,
  };
  switch (kind) {
    case 'ember':
      return { ...base, r: 1 + Math.random() * 2.4, vy: -(0.15 + Math.random() * 0.5) };
    case 'ash':
      return { ...base, r: 1 + Math.random() * 2.2, vy: 0.15 + Math.random() * 0.5 };
    case 'bubble':
      return { ...base, r: 1.5 + Math.random() * 3, vy: -(0.2 + Math.random() * 0.6) };
    case 'mist':
      return { ...base, r: 24 + Math.random() * 60, vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.08, a: 0.05 + Math.random() * 0.09 };
    case 'mote':
    default:
      return { ...base, r: 1 + Math.random() * 1.8, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4 };
  }
}

function ParticleField({ kind, accent }: { kind: ParticleKind; accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const kindRef = useRef(kind);
  const accentRef = useRef(accent);
  kindRef.current = kind;
  accentRef.current = accent;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = kindRef.current === 'mist' ? 16 : 70;
      particles = Array.from({ length: count }, () => seedParticle(kindRef.current, w, h));
    };
    resize();
    window.addEventListener('resize', resize);

    let currentKind = kindRef.current;

    const tick = () => {
      if (kindRef.current !== currentKind) {
        currentKind = kindRef.current;
        const count = currentKind === 'mist' ? 16 : 70;
        particles = Array.from({ length: count }, () => seedParticle(currentKind, w, h));
      }
      ctx.clearRect(0, 0, w, h);
      const color = accentRef.current;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -80) p.x = w + 80;
        if (p.x > w + 80) p.x = -80;
        if (p.y < -80) p.y = h + 80;
        if (p.y > h + 80) p.y = -80;
        ctx.beginPath();
        ctx.globalAlpha = p.a;
        ctx.fillStyle = color;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="phylo-particles" />;
}

export function EraBackdrop({ era }: { era: EraPalette }) {
  const style = {
    '--era-from': era.from,
    '--era-to': era.to,
    '--era-accent': era.accent,
  } as CSSProperties;

  return (
    <div className="phylo-backdrop" style={style}>
      <motion.div
        key={era.id}
        className="phylo-backdrop-layer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />
      <div className="phylo-backdrop-glow" />
      <ParticleField kind={era.particle} accent={era.accent} />
      <div className="phylo-vignette" />
    </div>
  );
}
