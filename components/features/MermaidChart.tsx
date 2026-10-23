'use client';

import { useEffect, useRef, useState } from 'react';

const DEFAULT_CODE = `graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Do it]
  B -->|No| D[Skip]
  C --> E([Done])
  D --> E`;

export default function MermaidChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    import('mermaid').then((mod) => {
      mod.default.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || !ref.current) return;
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        const id = 'm' + Math.random().toString(36).slice(2);
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Render error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, ready]);

  const downloadSvg = () => {
    if (!ref.current) return;
    const svg = ref.current.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">Edit Mermaid source on the left — diagram updates live.</span>
        <button
          onClick={downloadSvg}
          className="rounded-md bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700"
        >
          Download SVG
        </button>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="h-full min-h-[200px] resize-none rounded-lg border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-200 outline-none focus:border-cyan-500/60"
        />
        <div className="flex min-h-[200px] items-center justify-center overflow-auto rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          {error ? (
            <div className="text-sm text-red-400">{error}</div>
          ) : (
            <div ref={ref} className="max-w-full" />
          )}
        </div>
      </div>
    </div>
  );
}
