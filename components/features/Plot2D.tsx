'use client';

import { useEffect, useRef, useState } from 'react';

type PlotType = 'line' | 'bar' | 'scatter' | 'pie';

function buildPlot(type: PlotType) {
  if (type === 'line') {
    const x = Array.from({ length: 50 }, (_, i) => i);
    return {
      data: [
        { x, y: x.map((v) => Math.sin(v / 5) * 10), type: 'scatter', mode: 'lines', name: 'sin' },
        { x, y: x.map((v) => Math.cos(v / 5) * 10), type: 'scatter', mode: 'lines', name: 'cos' },
      ],
    };
  }
  if (type === 'bar') {
    return {
      data: [
        {
          x: ['A', 'B', 'C', 'D', 'E'],
          y: [12, 19, 8, 15, 22],
          type: 'bar',
          marker: { color: ['#3b82f6', '#22d3ee', '#a855f7', '#f97316', '#10b981'] },
        },
      ],
    };
  }
  if (type === 'scatter') {
    const n = 120;
    return {
      data: [
        {
          x: Array.from({ length: n }, () => Math.random() * 100),
          y: Array.from({ length: n }, () => Math.random() * 100),
          mode: 'markers',
          type: 'scatter',
          marker: { size: 8, color: '#22d3ee' },
        },
      ],
    };
  }
  return {
    data: [
      {
        values: [30, 25, 20, 15, 10],
        labels: ['React', 'Vue', 'Svelte', 'Angular', 'Other'],
        type: 'pie',
        hole: 0.4,
      },
    ],
  };
}

export default function Plot2D() {
  const ref = useRef<HTMLDivElement>(null);
  const [type, setType] = useState<PlotType>('line');
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
    const { data } = buildPlot(type);
    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#e5e5e5', size: 12 },
      margin: { t: 30, r: 20, b: 40, l: 50 },
      showlegend: type === 'line',
      xaxis: { gridcolor: 'rgba(255,255,255,0.06)' },
      yaxis: { gridcolor: 'rgba(255,255,255,0.06)' },
    };

    plotly.newPlot(el, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (el) plotly.purge(el);
    };
  }, [plotly, type]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {(['line', 'bar', 'scatter', 'pie'] as PlotType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-md px-3 py-1.5 text-sm capitalize transition ${
              type === t ? 'bg-cyan-500 text-black' : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            {t}
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
