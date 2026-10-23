export type FeatureId = 'input' | 'math' | 'scientific' | '3d' | 'chemistry' | 'patterns' | 'flowcharts';

export const FEATURES = [
  { id: 'input', name: 'AI Command Bar', icon: 'Sparkles', description: 'Type natural language to generate visuals' },
  { id: 'math', name: 'Math Graphs', icon: 'LineChart', description: 'Functions, domain, range & asymptotes' },
  { id: 'scientific', name: '3D Surfaces', icon: 'Activity', description: 'Scientific 3D surface plots' },
  { id: '3d', name: '3D Structures', icon: 'Box', description: 'Crystal lattices & 3D geometry' },
  { id: 'chemistry', name: 'Chemistry Plots', icon: 'FlaskConical', description: 'Raoult\'s Law & thermodynamics' },
  { id: 'flowcharts', name: 'Flowcharts', icon: 'GitMerge', description: 'Mermaid flowcharts' },
  { id: 'patterns', name: 'Geometry Patterns', icon: 'Hexagon', description: 'Procedural shapes and motifs' },
];
