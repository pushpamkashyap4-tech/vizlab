'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Menu, X, Sparkles, Box, LineChart, FlaskConical, GitMerge, Hexagon, Activity } from 'lucide-react';
import { FEATURES, FeatureId } from '@/lib/features';

const Icons: Record<string, any> = { Sparkles, Box, LineChart, FlaskConical, GitMerge, Hexagon, Activity };

// Lazy load features
const MathGraph = dynamic(() => import('./features/MathGraph'), { ssr: false, loading: () => <Loader /> });
const ScientificPlot = dynamic(() => import('./features/ScientificPlot'), { ssr: false, loading: () => <Loader /> });
const Universal3D = dynamic(() => import('./features/Universal3D'), { ssr: false, loading: () => <Loader /> });
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
    if (!command.trim()) return;
    
    const text = command.toLowerCase();

    // --- NLP PARSING LOGIC ---

    // 1. 3D Objects & Lattices
    if (text.includes('fcc') || text.includes('bcc') || text.includes('lattice') || text.includes('crystal') || text.includes('sphere') || text.includes('cube') || text.includes('cylinder')) {
      setActive('3d');
      setFeatureParams({ 
        initialCommand: command,
        type: text.includes('bcc') ? 'bcc' : 'fcc', 
        highlight: text.includes('diagonal') 
      });
    } 
    // 2. Chemistry Graphs
    else if (text.includes('raoult') || text.includes('vapor') || text.includes('pressure') || text.includes('ideal')) {
      setActive('chemistry');
      setFeatureParams({ type: text.includes('non-ideal') || text.includes('deviation') ? 'non-ideal' : 'ideal' });
    }
    // 3. Scientific 3D Surfaces (z = ...)
    else if (text.includes('z =') || text.includes('z=') || text.includes('surface')) {
      setActive('scientific');
      setFeatureParams({ fn: command });
    }
    // 4. Universal 2D Math Graphs (y = ...)
    else if (text.includes('y =') || text.includes('y=') || text.includes('graph') || text.includes('fractional') || text.includes('{x}') || text.includes('cos') || text.includes('sin') || text.includes('tan')) {
      setActive('math');
      // Pass the entire raw command to the graph engine to parse dynamically
      setFeatureParams({ fn: command }); 
    }
    // 5. Flowcharts
    else if (text.includes('flow') || text.includes('chart') || text.includes('mermaid')) {
      setActive('flowcharts');
    }
    // Fallback
    else {
      setActive('math');
      setFeatureParams({ fn: command });
    }
    
    setCommand('');
    setIsMobileOpen(false);
  };

  const ActiveComponent = () => {
    switch (active) {
      case 'math': 
        return <MathGraph initialFn={featureParams.fn || 'y = sin(x)'} />;
      case 'scientific': 
        return <ScientificPlot initialFn={featureParams.fn || 'z = sin(x) * cos(y)'} />;
      case '3d': 
        return <Universal3D initialCommand={featureParams.initialCommand} initialType={featureParams.type} initialHighlight={featureParams.highlight} />;
      case 'chemistry': 
        return <ChemistryGraph initialType={featureParams.type || 'ideal'} />;
      case 'flowcharts': 
        return <MermaidChart />;
      case 'patterns': 
        return <GeometryPatterns />;
      default: 
        return <Home onCommand={(c) => { setCommand(c); handleCommand({ preventDefault: () => {} } as any); }} />;
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col md:flex-row overflow-hidden bg-slate-950">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 shrink-0">
        <div className="font-bold text-lg text-white">JEE <span className="text-cyan-400">Visualizer</span></div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-slate-300 hover:text-white">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar (Drawer on Mobile, Fixed on Desktop) */}
      <div className={`
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static absolute z-50 inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out flex flex-col shrink-0
      `}>
        <div className="hidden md:block p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white tracking-tight">JEE <span className="text-cyan-400">Visualizer</span></h1>
          <p className="text-xs text-slate-400 mt-1">Advanced Concept Engine</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Add Scientific to the top of the sidebar manually if it's not in FEATURES yet */}
          {FEATURES.map((f) => {
            const Icon = Icons[f.icon] || Sparkles;
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
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md shrink-0">
            <form onSubmit={handleCommand} className="max-w-3xl mx-auto relative flex items-center">
              <Sparkles className="absolute left-4 text-cyan-400" size={20} />
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Type any equation, e.g., 'y = x^3', 'z = x^2 + y^2', 'Show FCC'..."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-full py-3 pl-12 pr-24 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500 text-sm md:text-base"
              />
              <button type="submit" className="absolute right-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
                Generate
              </button>
            </form>
          </div>
        )}

        {/* Feature Render Area */}
        <div className="flex-1 overflow-auto p-2 md:p-6 relative">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}

// Quick Home Component for the default view
function Home({ onCommand }: { onCommand: (cmd: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center space-y-6 px-4">
      <div className="p-4 bg-cyan-500/10 rounded-2xl mb-2">
        <Sparkles size={48} className="text-cyan-400" />
      </div>
      <h2 className="text-2xl md:text-4xl font-bold text-white">What do you want to visualize today?</h2>
      <p className="text-slate-400 text-sm md:text-base max-w-xl">
        Type a natural language command below to instantly generate graphs, 3D models, and diagrams for JEE, NEET, and Boards.
      </p>
      
      <form onSubmit={(e) => { e.preventDefault(); onCommand((e.target as any).query.value); }} className="w-full relative mt-6">
        <input
          name="query"
          type="text"
          autoFocus
          placeholder="e.g., 'Draw y = tan(x)' or 'Show 3D surface z = x^2 - y^2'"
          className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl py-4 pl-6 pr-32 outline-none focus:border-cyan-500 shadow-2xl shadow-cyan-900/20 text-base md:text-lg"
        />
        <button type="submit" className="absolute right-2 top-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 md:px-6 py-2.5 rounded-xl font-medium transition-colors text-sm md:text-base">
          Visualize
        </button>
      </form>

      <div className="flex flex-wrap gap-2 justify-center mt-8">
        {[
          'Show FCC unit cell', 
          'y = {x}', 
          'y = cot x', 
          'z = x^2 + y^2', 
          'Raoult\'s law',
          'y = 1/x'
        ].map((s) => (
          <button 
            key={s} 
            onClick={() => onCommand(s)} 
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 rounded-full border border-slate-700 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
                }
