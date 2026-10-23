'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Menu, X, Sparkles, Box, LineChart, FlaskConical, GitMerge, Hexagon } from 'lucide-react';
import { FEATURES, FeatureId } from '@/lib/features';

const Icons: Record<string, any> = { Sparkles, Box, LineChart, FlaskConical, GitMerge, Hexagon };

// Lazy load features
const MathGraph = dynamic(() => import('./features/MathGraph'), { ssr: false, loading: () => <Loader /> });
const Crystal3D = dynamic(() => import('./features/Crystal3D'), { ssr: false, loading: () => <Loader /> });
const ChemistryGraph = dynamic(() => import('./features/ChemistryGraph'), { ssr: false, loading: () => <Loader /> });
const MermaidChart = dynamic(() => import('./features/MermaidChart'), { ssr: false, loading: () => <Loader /> });
const GeometryPatterns = dynamic(() => import('./features/GeometryPatterns'), { ssr: false, loading: () => <Loader /> });

const Loader = () => <div className="flex h-full items-center justify-center text-cyan-400 animate-pulse">Loading module...</div>;

export default function Shell() {
  const [active, setActive] = useState<FeatureId>('input');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [command, setCommand] = useState('');
  
  // Parameters to pass to features based on NLP parsing
  const [featureParams, setFeatureParams] = useState<any>({});

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const text = command.toLowerCase();

    // NLP Parsing Logic
    if (text.includes('fcc') || text.includes('bcc') || text.includes('lattice') || text.includes('crystal')) {
      setActive('3d');
      setFeatureParams({ type: text.includes('bcc') ? 'bcc' : 'fcc', highlight: text.includes('diagonal') });
    } 
    else if (text.includes('raoult') || text.includes('vapor') || text.includes('pressure')) {
      setActive('chemistry');
      setFeatureParams({ type: text.includes('non-ideal') || text.includes('deviation') ? 'non-ideal' : 'ideal' });
    }
    else if (text.includes('cos') || text.includes('cot') || text.includes('{x}') || text.includes('fractional') || text.includes('graph')) {
      setActive('math');
      setFeatureParams({ fn: text.includes('cot') ? 'cot' : text.includes('fractional') || text.includes('{x}') ? 'fractional' : 'arccos' });
    }
    else if (text.includes('flow') || text.includes('chart') || text.includes('mermaid')) {
      setActive('flowcharts');
    }
    else {
      // Default to math if unknown, or show alert
      setActive('math');
    }
    
    setCommand('');
    setIsMobileOpen(false);
  };

  const ActiveComponent = () => {
    switch (active) {
      case 'math': return <MathGraph initialFn={featureParams.fn} />;
      case '3d': return <Crystal3D initialType={featureParams.type} initialHighlight={featureParams.highlight} />;
      case 'chemistry': return <ChemistryGraph initialType={featureParams.type} />;
      case 'flowcharts': return <MermaidChart />;
      case 'patterns': return <GeometryPatterns />;
      default: return <Home onCommand={(c) => { setCommand(c); handleCommand({ preventDefault: () => {} } as any); }} />;
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col md:flex-row overflow-hidden bg-slate-950">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
        <div className="font-bold text-lg text-white">JEE <span className="text-cyan-400">Visualizer</span></div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-slate-300 hover:text-white">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar (Drawer on Mobile, Fixed on Desktop) */}
      <div className={`
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static absolute z-50 inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out flex flex-col
      `}>
        <div className="hidden md:block p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white tracking-tight">JEE <span className="text-cyan-400">Visualizer</span></h1>
          <p className="text-xs text-slate-400 mt-1">Advanced Concept Engine</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {FEATURES.map((f) => {
            const Icon = Icons[f.icon];
            return (
              <button
                key={f.id}
                onClick={() => { setActive(f.id as FeatureId); setIsMobileOpen(false); setFeatureParams({}); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  active === f.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon size={20} className={active === f.id ? 'text-cyan-400' : 'text-slate-500'} />
                <div className="text-left">
                  <div className="text-sm font-medium">{f.name}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Command Bar */}
        {active !== 'input' && (
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
            <form onSubmit={handleCommand} className="max-w-3xl mx-auto relative flex items-center">
              <Sparkles className="absolute left-4 text-cyan-400" size={20} />
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Try: 'Show FCC lattice', 'y={x}', 'Raoult's law'..."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-full py-3 pl-12 pr-4 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500"
              />
              <button type="submit" className="absolute right-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
                Generate
              </button>
            </form>
          </div>
        )}

        {/* Feature Render Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}

// Quick Home Component for the default view
function Home({ onCommand }: { onCommand: (cmd: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-6">
      <div className="p-4 bg-cyan-500/10 rounded-2xl mb-4">
        <Sparkles size={48} className="text-cyan-400" />
      </div>
      <h2 className="text-3xl font-bold text-white">What do you want to visualize today?</h2>
      <p className="text-slate-400">Type a natural language command below to instantly generate graphs, 3D models, and diagrams for JEE, NEET, and Boards.</p>
      
      <form onSubmit={(e) => { e.preventDefault(); onCommand((e.target as any).query.value); }} className="w-full relative mt-8">
        <input
          name="query"
          type="text"
          autoFocus
          placeholder="e.g., 'Draw a graph for y = {x}'"
          className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl py-4 pl-6 pr-32 outline-none focus:border-cyan-500 shadow-2xl shadow-cyan-900/20 text-lg"
        />
        <button type="submit" className="absolute right-2 top-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
          Visualize
        </button>
      </form>

      <div className="flex flex-wrap gap-2 justify-center mt-6">
        {['Show FCC unit cell', 'y = cot x', 'Raoult\'s law', 'Fractional part function'].map((s) => (
          <button key={s} onClick={() => onCommand(s)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 rounded-full border border-slate-700 transition-colors">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
