import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VizLab — Multi-feature visualization studio',
  description: 'Interactive 2D/3D graphs, scientific plots, mermaid flowcharts, and geometric patterns.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">{children}</body>
    </html>
  );
}
