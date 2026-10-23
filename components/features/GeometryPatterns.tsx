'use client';

import { useEffect, useRef, useState } from 'react';

type Pattern = 'mandala' | 'spiral' | 'fractal' | 'wave';

function drawPattern(
  ctx: CanvasRenderingContext2D,
  pattern: Pattern,
  w: number,
  h: number,
  color: string
) {
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * 0.4;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;

  if (pattern === 'spiral') {
    ctx.beginPath();
    const turns = 20;
    const steps = 1200;
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 2 * turns;
      const r = (i / steps) * R;
      const x = cx + r * Math.cos(t);
      const y = cy + r * Math.sin(t);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    return;
  }

  if (pattern === 'mandala') {
    const petals = 16;
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(R * 0.6, 0, R * 0.4, R * 0.14, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    for (let r = R * 0.2; r <= R * 1.02; r += R * 0.16) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    return;
  }

  if (pattern === 'fractal') {
    const star = (x: number, y: number, rad: number, pts: number, depth: number) => {
      if (rad < 3 || depth > 4) return;
      ctx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI * 2 - Math.PI / 2;
        const px = x + Math.cos(a) * rad;
        const py = y + Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      for (let i = 0; i < pts; i++) {
        const a = (i / pts) * Math.PI * 2 - Math.PI / 2;
        star(x + Math.cos(a) * rad * 0.7, y + Math.sin(a) * rad * 0.7, rad * 0.4, pts, depth + 1);
      }
    };
    star(cx, cy, R, 5, 0);
    return;
  }

  // wave
  const rows = 22;
  for (let row = 0; row < rows; row++) {
    ctx.beginPath();
    for (let x = 0; x < w; x += 4) {
      const t = row / rows;
      const y =
        t * h +
        Math.sin(x * 0.02 + row * 0.5) * 14 +
        Math.cos(x * 0.011 + row) * 10;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

export default function GeometryPatterns() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pattern, setPattern] = useState<Pattern>('mandala');
  const [color, setColor] = useState('#22d3ee');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const draw = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);
      drawPattern(ctx, pattern, w, h, color);
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(container);
    return () => ro.disconnect();
  }, [pattern, color]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {(['mandala', 'spiral', 'fractal', 'wave'] as Pattern[]).map((p) => (
          <button
            key={p}
            onClick={() => setPattern(p)}
            className={`rounded-md px-3 py-1.5 text-sm capitalize transition ${
              pattern === p ? 'bg-cyan-500 text-black' : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            {p}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-xs text-neutral-400">
          Color
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-7 w-10 cursor-pointer rounded border border-neutral-700 bg-transparent"
          />
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </div>
  );
}
