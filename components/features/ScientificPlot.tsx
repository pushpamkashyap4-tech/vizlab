'use client';

import { useEffect, useRef, useState } from 'react';

type FnKey = 'ripple' | 'saddle' | 'gaussian' | 'sinxy';

const FUNCTIONS: Record<FnKey, (x: number, y: number) => number> = {
  ripple: (x, y) => Math.sin(Math.sqrt(x * x + y * y)) * 2,
  saddle: (x, y) => (x * x - y * y) / 5,
  gaussian: (x, y) => Math.exp(-(x * x + y * y) / 5) * 3,
  sinxy: (x, y) => Math.sin(x) * Math.cos(y),
};

export default function ScientificPlot() {
  const ref = useRef<HTMLDivElement>(null);
  const [fn, setFn] = useState<FnKey>('ripple');
  const [plotly, setPlotly] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    import('plotly.js-dist-min').then((mod: any) => {
      if (mounted) setPlotly(mod.default ?? mod);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!plotly || !ref.current) return;
    const el = ref.current;

    const size = 50;
    const axis = Array.from({ length: size }, (_, i) => -5 + (10 * i) / (size - 1));
    const z = axis.map((y) => axis.map((x) => FUNCTIONS[fn](x, y)));

    const data = [
      {
        type: 'surface',
        x: axis,
        y: axis,
        z,
        colorscale: [
          [0, '#0e7490'],
          [0.5, '#22d3ee'],
          [1, '#a855f7'],
        ],
        showscale: false,
      },
    ];

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#e5e5e5', size: 12 },
      margin: { t: 20, r: 20, b: 20, l: 20 },
      scene: {
        xaxis: { color: '#888', gridcolor: 'rgba(255,255,255,0.08)' },
        yaxis: { color: '#888', gridcolor: 'rgba(255,255,255,0.08)' },
        zaxis: { color: '#888', gridcolor: 'rgba(255,255,255,0.08)' },
        bgcolor: 'rgba(0,0,0,0)',
      },
    };

    plotly.newPlot(el, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (el) plotly.purge(el);
    };
  }, [plotly, fn]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FUNCTIONS) as FnKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setFn(k)}
            className={`rounded-md px-3 py-1.5 text-sm capitalize transition ${
              fn === k ? 'bg-cyan-500 text-black' : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            {k === 'sinxy' ? 'sin(x)·cos(y)' : k}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="min-h-0 flex-1 rounded-lg border border-neutral-800 bg-neutral-900/40"
      />
    </div>
  );
}
