'use client';

import { useEffect, useRef, useState } from 'react';
import * as math from 'mathjs';

export default function ScientificPlot({ initialFn = 'z = sin(x) * cos(y)' }: { initialFn?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [plotly, setPlotly] = useState<any>(null);
  const [expression, setExpression] = useState(initialFn);

  useEffect(() => {
    import('plotly.js-dist-min').then((mod: any) => setPlotly(mod.default ?? mod));
  }, []);

  useEffect(() => {
    if (!plotly || !ref.current) return;
    const el = ref.current;

    const cleanExpr = expression.replace('z =', '').replace('z=', '').trim();
    const size = 40;
    const axis = Array.from({ length: size }, (_, i) => -5 + (10 * i) / (size - 1));
    
    const z = axis.map(y => axis.map(x => {
      try {
        return math.evaluate(cleanExpr, { x, y });
      } catch {
        return 0;
      }
    }));

    const trace = {
      type: 'surface',
      x: axis,
      y: axis,
      z: z,
      colorscale: 'Viridis',
      showscale: false,
    };

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#e2e8f0' },
      margin: { t: 0, r: 0, b: 0, l: 0 },
      scene: {
        xaxis: { color: '#64748b', gridcolor: '#334155' },
        yaxis: { color: '#64748b', gridcolor: '#334155' },
        zaxis: { color: '#64748b', gridcolor: '#334155' },
        bgcolor: 'rgba(0,0,0,0)',
      },
    };

    plotly.newPlot(el, [trace], layout, { responsive: true, displayModeBar: false });
    return () => { if (el) plotly.purge(el); };
  }, [plotly, expression]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl p-4 md:p-6 border border-slate-800">
      <div className="mb-4">
        <input 
          type="text" 
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 text-cyan-400 font-mono text-lg rounded-lg p-3 outline-none focus:border-cyan-500"
        />
        <p className="text-xs text-slate-400 mt-2">Try: z = x^2 - y^2, z = sin(x) + cos(y), z = 1/(x^2+y^2)</p>
      </div>
      <div ref={ref} className="flex-1 min-h-[400px]" />
    </div>
  );
}
