'use client';

import { useEffect, useRef, useState } from 'react';

type Shape = 'knot' | 'torus' | 'sphere' | 'box';

export default function Plot3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<Shape>('knot');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let rafId = 0;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const THREE = await import('three');
        if (cancelled || !container) return;

        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
        camera.position.set(0, 0, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
        container.appendChild(renderer.domElement);

        let geom: import('three').BufferGeometry;
        switch (shape) {
          case 'torus':
            geom = new THREE.TorusGeometry(1.4, 0.4, 24, 100);
            break;
          case 'sphere':
            geom = new THREE.SphereGeometry(1.6, 48, 48);
            break;
          case 'box':
            geom = new THREE.BoxGeometry(2, 2, 2);
            break;
          default:
            geom = new THREE.TorusKnotGeometry(1.1, 0.35, 160, 32);
        }

        const mat = new THREE.MeshStandardMaterial({
          color: 0x22d3ee,
          emissive: 0x0e7490,
          metalness: 0.4,
          roughness: 0.25,
        });

        const mesh = new THREE.Mesh(geom, mat);
        scene.add(mesh);
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));

        const l1 = new THREE.DirectionalLight(0xa855f7, 2.5);
        l1.position.set(3, 4, 5);
        scene.add(l1);

        const l2 = new THREE.DirectionalLight(0x22d3ee, 2.5);
        l2.position.set(-4, -2, 3);
        scene.add(l2);

        let dragging = false;
        let lx = 0,
          ly = 0,
          rotX = 0,
          rotY = 0;

        const el = renderer.domElement;

        const onDown = (e: PointerEvent) => {
          dragging = true;
          lx = e.clientX;
          ly = e.clientY;
          try {
            el.setPointerCapture(e.pointerId);
          } catch {}
        };
        const onUp = (e: PointerEvent) => {
          dragging = false;
          try {
            el.releasePointerCapture(e.pointerId);
          } catch {}
        };
        const onMove = (e: PointerEvent) => {
          if (!dragging) return;
          rotY += (e.clientX - lx) * 0.01;
          rotX += (e.clientY - ly) * 0.01;
          lx = e.clientX;
          ly = e.clientY;
        };

        el.addEventListener('pointerdown', onDown);
        el.addEventListener('pointerup', onUp);
        el.addEventListener('pointermove', onMove);

        const ro = new ResizeObserver(() => {
          const nw = container.clientWidth || 1;
          const nh = container.clientHeight || 1;
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        });
        ro.observe(container);

        const animate = () => {
          rafId = requestAnimationFrame(animate);
          if (!dragging) {
            rotY += 0.005;
            rotX += 0.002;
          }
          mesh.rotation.x = rotX;
          mesh.rotation.y = rotY;
          renderer.render(scene, camera);
        };
        animate();

        cleanup = () => {
          cancelAnimationFrame(rafId);
          ro.disconnect();
          el.removeEventListener('pointerdown', onDown);
          el.removeEventListener('pointerup', onUp);
          el.removeEventListener('pointermove', onMove);
          geom.dispose();
          mat.dispose();
          renderer.dispose();
          if (el.parentNode === container) container.removeChild(el);
        };
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to initialize 3D');
      }
    })();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [shape]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {(['knot', 'torus', 'sphere', 'box'] as Shape[]).map((s) => (
          <button
            key={s}
            onClick={() => setShape(s)}
            className={`rounded-md px-3 py-1.5 text-sm capitalize transition ${
              shape === s ? 'bg-cyan-500 text-black' : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs text-neutral-500">Drag to rotate</span>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900 to-black">
        <div ref={containerRef} className="absolute inset-0" />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
