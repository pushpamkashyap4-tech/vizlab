# VizLab

A multi-feature visualization studio. Interactive 2D charts, 3D scenes, scientific surfaces, Mermaid flowcharts, and geometric patterns — all in one app.

## Features

- **2D Charts** — line, bar, scatter, pie (Plotly)
- **3D Visuals** — orbit-able three.js scenes (torus knot, torus, sphere, box)
- **Scientific** — interactive 3D surfaces (ripple, saddle, gaussian, sin·cos)
- **Flowcharts** — live Mermaid editor with SVG export
- **Patterns** — canvas-generated mandala, spiral, fractal, wave

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Plotly · Three.js · Mermaid

Every heavy renderer is lazy-loaded with `next/dynamic`, so the initial bundle stays small.

## Local development

```bash
npm install
npm run dev
