'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

export default function Universal3D({ 
  initialCommand, 
  initialType, 
  initialHighlight 
}: { 
  initialCommand?: string; 
  initialType?: string; 
  initialHighlight?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'sandbox' | 'lattice'>(initialType ? 'lattice' : 'sandbox');
  
  // Sandbox State
  const [objects, setObjects] = useState<any[]>([
    { type: 'sphere', pos: [0, 0, 0], size: 1, color: '#38bdf8' },
    { type: 'box', pos: [2, 0, 0], size: 1.5, color: '#f59e0b' },
  ]);
  const [inputStr, setInputStr] = useState('');

  // Lattice State
  const [lattice, setLattice] = useState<'fcc' | 'bcc'>(initialType === 'bcc' ? 'bcc' : 'fcc');
  const [showCorners, setShowCorners] = useState(true);
  const [showFaces, setShowFaces] = useState(true);
  const [spaceFilling, setSpaceFilling] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showDiagonal, setShowDiagonal] = useState(initialHighlight || false);

  // Handle commands coming from the main search bar
  useEffect(() => {
    if (initialCommand) {
      const lower = initialCommand.toLowerCase();
      if (lower.includes('fcc') || lower.includes('bcc') || lower.includes('lattice')) {
        setMode('lattice');
        setLattice(lower.includes('bcc') ? 'bcc' : 'fcc');
        if (lower.includes('diagonal')) setShowDiagonal(true);
      } else {
        setMode('sandbox');
        parseCommand(initialCommand);
      }
    }
  }, [initialCommand]);

  const parseCommand = (cmd: string) => {
    const lower = cmd.toLowerCase();
    const newObj: any = { color: '#ec4899', size: 1, pos: [0, 0, 0] };
    const nums = cmd.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
    
    if (lower.includes('sphere')) newObj.type = 'sphere';
    else if (lower.includes('box') || lower.includes('cube')) newObj.type = 'box';
    else if (lower.includes('cylinder')) newObj.type = 'cylinder';
    else if (lower.includes('torus')) newObj.type = 'torus';
    else return;

    if (nums.length >= 3) newObj.pos = [nums[0], nums[1], nums[2]];
    if (nums.length >= 4) newObj.size = nums[3];

    setObjects(prev => [...prev, newObj]);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputStr) return;
    parseCommand(inputStr);
    setInputStr('');
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cleanup: any;
    (async () => {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

      const w = container.clientWidth;
      const h = container.clientHeight;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#0f172a');

      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
      camera.position.set(mode === 'lattice' ? 3 : 5, mode === 'lattice' ? 3 : 5, mode === 'lattice' ? 3 : 5);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(w, h);
      container.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.autoRotate = mode === 'lattice' ? autoRotate : true;

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const dLight = new THREE.DirectionalLight(0xffffff, 2);
      dLight.position.set(5, 10, 7);
      scene.add(dLight);
      const fillLight = new THREE.DirectionalLight(0x4f46e5, 1);
      fillLight.position.set(-5, 0, 5);
      scene.add(fillLight);

      if (mode === 'lattice') {
        // --- LATTICE RENDERING LOGIC ---
        const boxGeo = new THREE.BoxGeometry(2, 2, 2);
        const boxEdges = new THREE.EdgesGeometry(boxGeo);
        const boxLines = new THREE.LineSegments(boxEdges, new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.5 }));
        scene.add(boxLines);

        const atomRadius = spaceFilling ? 0.707 : 0.25;
        const cornerMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8 });
        const faceMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 });
        const centerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.8 });
        const sphereGeo = new THREE.SphereGeometry(atomRadius, 32, 32);

        if (showCorners) {
          [-1, 1].forEach(x => [-1, 1].forEach(y => [-1, 1].forEach(z => {
            const mesh = new THREE.Mesh(sphereGeo, cornerMat);
            mesh.position.set(x, y, z);
            scene.add(mesh);
          })));
        }

        if (lattice === 'fcc' && showFaces) {
          [[1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1]].forEach(pos => {
            const mesh = new THREE.Mesh(sphereGeo, faceMat);
            mesh.position.set(pos[0], pos[1], pos[2]);
            scene.add(mesh);
          });
        }

        if (lattice === 'bcc' && showFaces) {
           const mesh = new THREE.Mesh(sphereGeo, centerMat);
           mesh.position.set(0, 0, 0);
           scene.add(mesh);
        }

        if (showDiagonal) {
          const points = [new THREE.Vector3(-1, -1, 1), new THREE.Vector3(1, 1, 1)];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 }));
          scene.add(line);
        }

      } else {
        // --- SANDBOX RENDERING LOGIC ---
        scene.add(new THREE.GridHelper(10, 10, 0x334155, 0x1e293b));
        objects.forEach(obj => {
          let geo;
          if (obj.type === 'sphere') geo = new THREE.SphereGeometry(obj.size, 32, 32);
          if (obj.type === 'box') geo = new THREE.BoxGeometry(obj.size, obj.size, obj.size);
          if (obj.type === 'cylinder') geo = new THREE.CylinderGeometry(obj.size, obj.size, obj.size * 2, 32);
          if (obj.type === 'torus') geo = new THREE.TorusGeometry(obj.size, obj.size * 0.4, 16, 100);

          if (geo) {
            const mat = new THREE.MeshStandardMaterial({ color: obj.color, roughness: 0.2, metalness: 0.8 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(obj.pos[0], obj.pos[1], obj.pos[2]);
            scene.add(mesh);
          }
        });
      }

      const ro = new ResizeObserver(() => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
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
        if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      };
    })();

    return () => { if (cleanup) cleanup(); };
  }, [objects, mode, lattice, showCorners, showFaces, spaceFilling, autoRotate, showDiagonal]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl p-4 md:p-6 border border-slate-800">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-4">
        <button onClick={() => setMode('lattice')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'lattice' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Crystal Lattice</button>
        <button onClick={() => setMode('sandbox')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'sandbox' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}>3D Sandbox</button>
      </div>

      {mode === 'sandbox' && (
        <div className="mb-4 flex gap-2">
          <form onSubmit={handleCommandSubmit} className="flex-1 flex gap-2">
            <input type="text" value={inputStr} onChange={(e) => setInputStr(e.target.value)} placeholder="e.g., sphere at 2,2,2 radius 1" className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-cyan-500" />
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 rounded-lg font-medium">Add</button>
          </form>
          <button onClick={() => setObjects([])} className="bg-slate-800 hover:bg-slate-700 text-red-400 px-4 rounded-lg">Clear</button>
        </div>
      )}

      <div ref={containerRef} className="flex-1 min-h-[400px] rounded-lg overflow-hidden border border-slate-800" />

      {mode === 'lattice' && (
        <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800">
          <div className="flex flex-wrap gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={spaceFilling} onChange={(e) => setSpaceFilling(e.target.checked)} className="w-4 h-4 accent-cyan-500" /> Space-filling
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={showCorners} onChange={(e) => setShowCorners(e.target.checked)} className="w-4 h-4 accent-cyan-500" /> Corners
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={showFaces} onChange={(e) => setShowFaces(e.target.checked)} className="w-4 h-4 accent-cyan-500" /> {lattice === 'fcc' ? 'Face Centers' : 'Body Center'}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} className="w-4 h-4 accent-cyan-500" /> Auto-rotate
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={showDiagonal} onChange={(e) => setShowDiagonal(e.target.checked)} className="w-4 h-4 accent-red-500" /> Face Diagonal
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLattice('fcc')} className={`px-3 py-1.5 rounded-md text-sm ${lattice === 'fcc' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}>FCC</button>
            <button onClick={() => setLattice('bcc')} className={`px-3 py-1.5 rounded-md text-sm ${lattice === 'bcc' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}>BCC</button>
          </div>
        </div>
      )}
    </div>
  );
        }
