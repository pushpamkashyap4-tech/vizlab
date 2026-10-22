export type FeatureId = 'plot2d' | 'plot3d' | 'scientific' | 'mermaid' | 'geometry';

export interface Feature {
  id: FeatureId;
  name: string;
  description: string;
  icon: string;
}

export const FEATURES: Feature[] = [
  { id: 'plot2d', name: '2D Charts', description: 'Line, bar, scatter, pie', icon: '📊' },
  { id: 'plot3d', name: '3D Visuals', description: 'Interactive three.js scenes', icon: '🧊' },
  { id: 'scientific', name: 'Scientific', description: 'Surfaces & math plots', icon: '🧪' },
  { id: 'mermaid', name: 'Flowcharts', description: 'Mermaid diagrams', icon: '🔀' },
  { id: 'geometry', name: 'Patterns', description: 'Geometric shapes & motifs', icon: '🔷' },
];
