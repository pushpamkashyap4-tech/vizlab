'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

export default function Crystal3D({ initialType = 'fcc', initialHighlight = false }: { initialType?: string, initialHighlight?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lattice, setLattice] = useState<'fcc' | 'bcc'>(initialType as any);
  const [showCorners, setShowCorners] = useState(true);
  const [showFaces, setShowFaces] = useState(true);
  const [spaceFilling, setSpaceFilling] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showDiagonal, setShowDiagonal] = useState(initialHighlight);
  
  // We use a key to force re-render of Three.js scene when settings change
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        if (cancelled || !container) return;

        const w = container.clientWidth;
        const h = container.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#0f172a'); // slate-900

        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        camera.position.set(3, 3, 3);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(w, h);
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 2.0;

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dLight = new THREE.DirectionalLight(0xffffff, 2);
        dLight.position.set(5, 10, 7);
        scene.add(dLight);
        const fillLight = new THREE.DirectionalLight(0x4f46e5, 1);
        fillLight.position.set(-5, 0, 5);
        scene.add(fillLight);

        // Unit Cell Box (Wireframe)
        const boxGeo = new THREE.BoxGeometry(2, 2, 2);
        const boxEdges = new THREE.EdgesGeometry(boxGeo);
        const boxLines = new THREE.LineSegments(boxEdges, new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.5 }));
        scene.add(boxLines);

        const atomRadius = spaceFilling ? 0.707 : 0.25; // Radius for space filling (touching along face diagonal)
        
        const cornerMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8 }); // Cyan/Blue
        const faceMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 }); // Orange
        const centerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.8 }); // Red

        const sphereGeo = new THREE.SphereGeometry(atomRadius, 32, 32);

        // Corners (8)
        if (showCorners) {
          const coords = [-1, 1];
          coords.forEach(x => coords.forEach(y => coords.forEach(z => {
            const mesh = new THREE.Mesh(sphereGeo, cornerMat);
            mesh.position.set(x, y, z);
            scene.add(mesh);
          })));
        }

        // Face Centers (6) - Only for FCC
        if (lattice === 'fcc' && showFaces) {
          const faces = [
            [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1]
          ];
          faces.forEach(pos => {
            const mesh = new THREE.Mesh(sphereGeo, faceMat);
            mesh.position.set(pos[0], pos[1], pos[2]);
            scene.add(mesh);
          });
        }

        // Body Center (1) - Only for BCC
        if (lattice === 'bcc' && showFaces) {
           const mesh = new THREE.Mesh(sphereGeo, centerMat);
           mesh.position.set(0, 0, 0);
           scene.add(mesh);
        }

        // Face Diagonal Highlight
        if (showDiagonal) {
          const points = [
            new THREE.Vector3(-1, -1, 1),
            new THREE.Vector3(1, 1, 1)
          ];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 });
          const line = new THREE.Line(lineGeo, lineMat);
          scene.add(line);

          // Add label dot
          const dotGeo = new THREE.SphereGeometry(0.05, 16, 16);
          const dotMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const dot1 = new THREE.Mesh(dotGeo, dotMat); dot1.position.set(-1,-1,1); scene.add(dot1);
          const dot2 = new THREE.Mesh(dotGeo, dotMat); dot2.position.set(1,1,1); scene.add(dot2);
        }

        const ro = new ResizeObserver(() => {
          const nw = container.clientWidth;
          const nh = container.clientHeight;
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        });
        ro.observe(container);

        const animate = () => {
          requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        cleanup = () => {
          ro.disconnect();
          controls.dispose();
          renderer.dispose();
          if (el.parentNode === container) container.removeChild(renderer.domElement);
        };
      } catch (e) {}
    })();

    return () => { cancelled = true; if (cleanup) cleanup(); };
  }, [lattice, showCorners, showFaces, spaceFilling, autoRotate, showDiagonal, renderKey]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* 3D Canvas Area */}
      <div ref={containerRef} className="flex-1 min-h-[300px] relative" />
      
      {/* Controls Panel (Matching your screenshot) */}
      <div className="p-4 md:p-6 bg-slate-900/90 border-t border-slate-800">
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
            <input type="checkbox" checked={spaceFilling} onChange={(e) => setSpaceFilling(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
            Space-filling spheres
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
            <input type="checkbox" checked={showCorners} onChange={(e) => setShowCorners(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
            Corner atoms
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
            <input type="checkbox" checked={showFaces} onChange={(e) => setShowFaces(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
            {lattice === 'fcc' ? 'Face-center atoms' : 'Body-center atom'}
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
            <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
            Auto-rotate
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
            <input type="checkbox" checked={showDiagonal} onChange={(e) => setShowDiagonal(e.target.checked)} className="w-4 h-4 accent-red-500" />
            Highlight face diagonal
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setLattice('fcc')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${lattice === 'fcc' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
            FCC Lattice
          </button>
          <button onClick={() => setLattice('bcc')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${lattice === 'bcc' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
            BCC Lattice
          </button>
          <button onClick={() => setRenderKey(k => k + 1)} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition-colors">
            <RotateCcw size={16} /> Reset View
          </button>
        </div>

        {/* Educational Text Block */}
        <div className="mt-6 p-4 bg-slate-950 rounded-lg border border-slate-800 text-sm text-slate-400 leading-relaxed">
          {lattice === 'fcc' ? (
            <p><strong className="text-white">Face-Centered Cubic (FCC):</strong> 8 corners × 1/8 + 6 face centers × 1/2 = 4 atoms per unit cell. Nearest neighbors touch along a face diagonal: \(4r = \sqrt{2}a\). Each atom has 12 nearest neighbors in the extended crystal.</p>
          ) : (
            <p><strong className="text-white">Body-Centered Cubic (BCC):</strong> 8 corners × 1/8 + 1 body center = 2 atoms per unit cell. Nearest neighbors touch along the body diagonal: \(4r = \sqrt{3}a\). Each atom has 8 nearest neighbors.</p>
          )}
        </div>
      </div>
    </div>
  );
            }
