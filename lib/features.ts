export type FeatureId = 'input' | 'math' | '3d' | 'chemistry' | 'patterns' | 'flowcharts';

export const FEATURES = [
  { id: 'input', name: 'AI Command Bar', icon: 'Sparkles', description: 'Type natural language to generate visuals' },
  { id: '3d', name: '3D Structures', icon: 'Box', description: 'Crystal lattices & 3D geometry' },
  { id: 'math', name: 'Math Graphs', icon: 'LineChart', description: 'Functions, domain, range & asymptotes' },
  { id: 'chemistry', name: 'Chemistry Plots', icon: 'FlaskConical', description: 'Raoult\'s Law & thermodynamics' },
  { id: 'flowcharts', name: 'Flowcharts', icon: 'GitMerge', description: 'Mermaid flowcharts' },
  { id: 'patterns', name: 'Geometry Patterns', icon: 'Hexagon', description: 'Procedural shapes and motifs' },
];
