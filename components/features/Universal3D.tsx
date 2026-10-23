'use client';

import { useEffect, useRef, useState } from 'react';

export default function Universal3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [objects, setObjects] = useState<any[]>([
    { type: 'sphere', pos: [0, 0, 0], size: 1, color: '#38bdf8' },
    { type: 'box', pos: [2, 0, 0], size: 1.5, color: '#f59e0b' },
  ]);
  const [inputStr, setInputStr] = useState('');

  // Parser for natural language 3D commands
  const parseCommand = (cmd: string) => {
    const lower = cmd.toLowerCase();
    const newObj: any = { color: '#ec4899', size: 1, pos: [0, 0, 0] };
    
    // Extract numbers
    const nums = cmd.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
    
    if (lower.includes('sphere')) newObj.type = 'sphere';
    else if (lower.includes('box') || lower.includes('cube')) newObj.type = 'box';
    else if (lower.includes('cylinder')) newObj.type = 'cylinder';
    else if (lower.includes('torus') || lower.includes('donut')) newObj.type = 'torus';
    else return; // Unknown type

    if (nums.length >= 3) newObj.pos = [nums[0], nums[1], nums[2]];
    if (nums.length >= 4) newObj.size = nums[3];

    setObjects(prev => [...prev, newObj]);
  };

  const handleCommand = (e: React.FormEvent) => {
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
      camera.position.set(5, 5, 5);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(w, h);
      container.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.autoRotate = true;

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(5, 10, 7);
      scene.add(light);

      // Grid Helper
      scene.add(new THREE.GridHelper(10, 10, 0x334155, 0x1e293b));

      // Render Objects
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
  }, [objects]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl p-4 md:p-6 border border-slate-800">
      <div className="mb-4 flex gap-2">
        <form onSubmit={handleCommand} className="flex-1 flex gap-2">
          <input 
            type="text" 
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            placeholder="e.g., sphere at 2,2,2 radius 1"
            className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-cyan-500"
          />
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 rounded-lg font-medium">Add Object</button>
        </form>
        <button onClick={() => setObjects([])} className="bg-slate-800 hover:bg-slate-700 text-red-400 px-4 rounded-lg">Clear</button>
      </div>
      <div ref={containerRef} className="flex-1 min-h-[400px] rounded-lg overflow-hidden" />
    </div>
  );
}
