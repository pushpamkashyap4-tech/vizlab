'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FEATURES, FeatureId } from '@/lib/features';

const Loading = () => (
  <div className="flex h-full items-center justify-center text-sm text-neutral-500">Loading…</div>
);

const Plot2D = dynamic(() => import('./features/Plot2D'), { ssr: false, loading: Loading });
const Plot3D = dynamic(() => import('./features/Plot3D'), { ssr: false, loading: Loading });
const ScientificPlot = dynamic(() => import('./features/ScientificPlot'), { ssr: false, loading: Loading });
const MermaidChart = dynamic(() => import('./features/MermaidChart'), { ssr: false, loading: Loading });
const GeometryPatterns = dynamic(() => import('./features/GeometryPatterns'), { ssr: false, loading: Loading });

const COMPONENTS: Record<FeatureId, React.ComponentType> = {
  plot2d: Plot2D,
  plot3d: Plot3D,
  scientific: ScientificPlot,
  mermaid: MermaidChart,
  geometry: GeometryPatterns,
};

export default function Shell() {
  const [active, setActive] = useState<FeatureId>('plot2d');
  const Active = COMPONENTS[active];
  const activeFeature = FEATURES.find((f) => f.id === active)!;

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-neutral-800 bg-neutral-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Viz<span className="text-cyan-400">Lab</span>
            </h1>
            <p className="text-xs text-neutral-400">Multi-feature visualization studio</p>
          </div>
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            v0.1
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-64 shrink-0 overflow-y-auto border-r border-neutral-800 bg-neutral-900/30 p-3">
          {FEATURES.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={`mb-1 flex w-full items-start gap-3 rounded-lg p-3 text-left transition ${
                active === f.id
                  ? 'bg-cyan-500/10 text-cyan-300'
                  : 'text-neutral-300 hover:bg-neutral-800/60'
              }`}
            >
              <span className="text-xl leading-none">{f.icon}</span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{f.name}</span>
                <span className="block text-xs text-neutral-500">{f.description}</span>
              </span>
            </button>
          ))}
        </nav>

        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-neutral-800 px-6 py-3">
            <h2 className="text-sm font-medium">
              {activeFeature.icon} {activeFeature.name}
            </h2>
            <p className="text-xs text-neutral-500">{activeFeature.description}</p>
          </div>
          <div className="flex-1 overflow-hidden p-4">
            <Active />
          </div>
        </main>
      </div>
    </div>
  );
}
