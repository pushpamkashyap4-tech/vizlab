'use client';

import { useEffect, useRef, useState } from 'react';
import * as math from 'mathjs';

export default function MathGraph({ initialFn = 'y = sin(x)' }: { initialFn?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [plotly, setPlotly] = useState<any>(null);
  const [expression, setExpression] = useState(initialFn);

  useEffect(() => {
    import('plotly.js-dist-min').then((mod: any) => setPlotly(mod.default ?? mod));
  }, []);

  useEffect(() => {
    if (!plotly || !ref.current) return;
    const el = ref.current;

    // Parse math expression (e.g., "y = x^2 + 3")
    const cleanExpr = expression.replace('y =', '').replace('y=', '').trim();
    
    const xVals: (number | null)[] = [];
    const yVals: (number | null)[] = [];
    
    // Sample the graph
    for (let x = -10; x <= 10; x += 0.05) {
      xVals.push(x);
      try {
        // Handle fractional part {x} specially since mathjs doesn't natively use {}
        let evalStr = cleanExpr;
        if (evalStr.includes('{x}')) {
          evalStr = evalStr.replace(/{x}/g, '(x - floor(x))');
        }
        
        const scope = { x: x, pi: Math.PI, e: Math.E };
        const y = math.evaluate(evalStr, scope);
        
        // If y is complex, infinity, or NaN, push null to break the line
        if (typeof y === 'number' && isFinite(y) && Math.abs(y) < 100) {
          yVals.push(y);
        } else {
          yVals.push(null);
        }
      } catch (err) {
        yVals.push(null);
      }
    }

    const trace = {
      x: xVals,
      y: yVals,
      mode: 'lines',
      line: { color: '#22d3ee', width: 3 },
      connectgaps: false, // Prevents connecting across asymptotes (like tan x)
    };

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#e2e8f0', size: 12 },
      margin: { t: 20, r: 20, b: 40, l: 40 },
      showlegend: false,
      xaxis: { gridcolor: '#334155', zerolinecolor: '#64748b', range: [-10, 10] },
      yaxis: { gridcolor: '#334155', zerolinecolor: '#64748b' },
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
          placeholder="Type any function, e.g., y = tan(x)"
        />
        {/* FIXED LINE BELOW: Wrapped {x} in a string {'{x}'} */}
        <p className="text-xs text-slate-400 mt-2">Try: y = x^2, y = sin(x)*cos(x), y = 1/x, y = {'{x}'}, y = e^x</p>
      </div>
      <div ref={ref} className="flex-1 min-h-[400px]" />
    </div>
  );
}
