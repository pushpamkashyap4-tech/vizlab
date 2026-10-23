'use client';

import { useEffect, useRef, useState } from 'react';

export default function ChemistryGraph({ initialType = 'ideal' }: { initialType?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [plotly, setPlotly] = useState<any>(null);
  const [type, setType] = useState(initialType);

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

    const xVals = Array.from({ length: 50 }, (_, i) => i / 49);
    
    // Ideal behavior (Raoult's law)
    const pA = xVals.map(x => x * 300); // Pure A = 300
    const pB = xVals.map(x => (1 - x) * 150); // Pure B = 150
    const pTotal = xVals.map((x, i) => pA[i] + pB[i]);

    const traces: any[] = [
      { x: xVals, y: pA, mode: 'lines', name: 'PA = xA·PA°', line: { color: '#3b82f6', width: 3 } },
      { x: xVals, y: pB, mode: 'lines', name: 'PB = xB·PB°', line: { color: '#f59e0b', width: 3 } },
      { x: xVals, y: pTotal, mode: 'lines', name: 'Ptotal = PA + PB', line: { color: '#8b5cf6', width: 3 } },
    ];

    if (type === 'non-ideal') {
      // Positive deviation (A-B interactions weaker)
      const pTotalDev = pTotal.map(p => p * 1.15); // Bulge up
      traces[2] = { x: xVals, y: pTotalDev, mode: 'lines', name: 'Ptotal (Positive Deviation)', line: { color: '#ef4444', width: 3, dash: 'dot' } };
    }

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#e2e8f0', size: 12 },
      margin: { t: 40, r: 20, b: 60, l: 60 },
      showlegend: true,
      legend: { orientation: 'h', y: 1.1 },
      xaxis: { title: 'Mole Fraction (xA)', gridcolor: '#334155', zerolinecolor: '#64748b', range: [0, 1] },
      yaxis: { title: 'Vapour Pressure', gridcolor: '#334155', zerolinecolor: '#64748b', range: [0, 350] },
    };

    plotly.newPlot(el, traces, layout, { responsive: true, displayModeBar: false });

    return () => { if (el) plotly.purge(el); };
  }, [plotly, type]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl p-4 md:p-6 border border-slate-800 shadow-2xl">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setType('ideal')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'ideal' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
          Ideal Solution (Raoult's Law)
        </button>
        <button onClick={() => setType('non-ideal')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'non-ideal' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
          Non-Ideal (Positive Deviation)
        </button>
      </div>
      <div ref={ref} className="flex-1 min-h-[400px]" />
      <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800 text-sm text-slate-400">
        <strong className="text-white">Concept:</strong> For an ideal binary solution, the partial vapor pressure of each component is directly proportional to its mole fraction. Total pressure is the sum of partial pressures.
      </div>
    </div>
  );
}
