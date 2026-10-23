'use client';

import { useEffect, useRef, useState } from 'react';

export default function MathGraph({ initialFn = 'fractional' }: { initialFn?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [plotly, setPlotly] = useState<any>(null);
  const [fn, setFn] = useState(initialFn);

  useEffect(() => {
    let mounted = true;
    import('plotly.js-dist-min').then((mod: any) => {
      if (mounted) setPlotly(mod.default ?? mod);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!plotly || !ref.current) return;
    const el = ref.current;
    const traces: any[] = [];
    const layout: any = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#e2e8f0', size: 12 },
      margin: { t: 40, r: 20, b: 40, l: 50 },
      showlegend: false,
      xaxis: { gridcolor: '#334155', zerolinecolor: '#64748b', range: [-4, 4] },
      yaxis: { gridcolor: '#334155', zerolinecolor: '#64748b', range: [-2, 4] },
    };

    if (fn === 'fractional') {
      // y = {x}
      const xVals: number[] = [];
      const yVals: number[] = [];
      for (let i = -3; i <= 3; i += 0.05) {
        xVals.push(i);
        yVals.push(i - Math.floor(i));
      }
      
      traces.push({
        x: xVals, y: yVals, mode: 'lines', line: { color: '#3b82f6', width: 3 },
      });

      // Add open/closed circles manually via scatter
      const dotsX: number[] = [], dotsY: number[] = [];
      for (let i = -3; i <= 3; i++) {
        dotsX.push(i); dotsY.push(0); // Closed (start of each segment)
        dotsX.push(i + 0.999); dotsY.push(0.999); // Open (end of each segment)
      }
      
      traces.push({
        x: dotsX.filter((_, i) => i % 2 === 0), y: dotsY.filter((_, i) => i % 2 === 0),
        mode: 'markers', marker: { color: '#3b82f6', size: 8, symbol: 'circle' },
      });
      traces.push({
        x: dotsX.filter((_, i) => i % 2 !== 0), y: dotsY.filter((_, i) => i % 2 !== 0),
        mode: 'markers', marker: { color: '#0f172a', size: 8, symbol: 'circle-open', line: { width: 2, color: '#3b82f6' } },
      });
      
      layout.title = { text: 'Fractional Part Function f(x) = {x}', font: { color: '#94a3b8' } };
    } 
    else if (fn === 'cot') {
      // y = cot(x)
      const xVals: number[] = [];
      for (let i = -3; i <= 3; i += 0.01) {
        if (Math.abs(Math.sin(i)) > 0.05) xVals.push(i);
      }
      traces.push({
        x: xVals, y: xVals.map(x => 1 / Math.tan(x)), mode: 'lines', line: { color: '#84cc16', width: 3 },
      });
      layout.yaxis.range = [-5, 5];
      layout.title = { text: 'y = cot x', font: { color: '#94a3b8' } };
    }
    else if (fn === 'arccos') {
      // y = arccos(x)
      const xVals = Array.from({ length: 100 }, (_, i) => -1 + (2 * i) / 99);
      traces.push({
        x: xVals, y: xVals.map(x => Math.acos(x)), mode: 'lines', line: { color: '#84cc16', width: 3 },
      });
      layout.title = { text: 'y = cos⁻¹ x', font: { color: '#94a3b8' } };
    }

    plotly.newPlot(el, traces, layout, { responsive: true, displayModeBar: false });

    return () => { if (el) plotly.purge(el); };
  }, [plotly, fn]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl p-4 md:p-6 border border-slate-800 shadow-2xl">
      <div className="flex flex-wrap gap-2 mb-4">
        {['fractional', 'cot', 'arccos'].map((t) => (
          <button
            key={t}
            onClick={() => setFn(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${fn === t ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            {t === 'fractional' ? 'y = {x}' : t === 'cot' ? 'y = cot x' : 'y = cos⁻¹ x'}
          </button>
        ))}
      </div>
      <div ref={ref} className="flex-1 min-h-[400px]" />
    </div>
  );
}
