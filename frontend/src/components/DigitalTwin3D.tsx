import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TelemetryPayload } from '../types/telemetry';
import {
  Camera,
  Navigation,
  ShieldAlert,
  ZoomIn,
  Activity,
  Compass,
  Eye,
  Crosshair,
  Play,
  Pause,
  RotateCcw,
  Sliders,
} from 'lucide-react';

interface DigitalTwin3DProps {
  telemetry: TelemetryPayload | null;
  onSelectSegment?: (segmentId: number) => void;
  selectedSegmentId?: number | null;
}

export const DigitalTwin3D: React.FC<DigitalTwin3DProps> = ({
  telemetry,
  onSelectSegment,
  selectedSegmentId,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Mesh refs for dynamic animation
  const segmentMeshesRef = useRef<THREE.Mesh[]>([]);
  const valveMeshesRef = useRef<THREE.Group[]>([]);
  const leakPlumeRef = useRef<THREE.Points | null>(null);
  const auvRef = useRef<THREE.Group | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 35, 75));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Camera Mode States
  const [cameraMode, setCameraMode] = useState<string>('overview');
  const cameraModeRef = useRef<string>('overview');

  // AUV Interactive Camera Controls
  const [auvViewPreset, setAuvViewPreset] = useState<'chase' | 'cockpit' | 'top' | 'free'>('chase');
  const auvViewPresetRef = useRef<'chase' | 'cockpit' | 'top' | 'free'>('chase');
  const auvSphericalRef = useRef({ radius: 14, theta: 0.8, phi: 1.1 });
  const auvManualPosRef = useRef<number | null>(null);
  const [auvKmPos, setAuvKmPos] = useState<number>(5.0);
  const auvAutoPatrolRef = useRef<boolean>(true);
  const [isAuvPatrolling, setIsAuvPatrolling] = useState<boolean>(true);
  const auvHeadingRef = useRef<number>(1);

  // Length scale: 10,000 meters mapped to 120 Three.js units (from x = -60 to x = +60)
  const mapDistanceTo3D = (meters: number) => {
    return (meters / 10000.0) * 120.0 - 60.0;
  };

  const map3DToMeters = (x3D: number) => {
    return ((x3D + 60.0) / 120.0) * 10000.0;
  };

  // Sync refs when state changes
  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    auvViewPresetRef.current = auvViewPreset;
  }, [auvViewPreset]);

  useEffect(() => {
    auvAutoPatrolRef.current = isAuvPatrolling;
  }, [isAuvPatrolling]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene & Deep Ocean Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020b15);
    scene.fog = new THREE.FogExp2(0x020b15, 0.012);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0, 35, 75);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0d2b45, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    sunLight.position.set(20, 50, 30);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00f2fe, 1.2);
    cyanRimLight.position.set(-30, 20, -40);
    scene.add(cyanRimLight);

    // 5. Seabed Terrain (Custom undulating Bathymetry)
    const terrainGeo = new THREE.PlaneGeometry(200, 160, 64, 48);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = Math.sin(x * 0.05) * 2.2 + Math.cos(z * 0.06) * 1.8 - Math.exp(-Math.pow(x / 25, 2)) * 4.0 - 4.5;
      posAttr.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x051b2e,
      roughness: 0.88,
      metalness: 0.15,
      wireframe: false,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.receiveShadow = true;
    scene.add(terrain);

    // Grid wireframe overlay
    const gridHelper = new THREE.GridHelper(160, 40, 0x0ea5e9, 0x082f49);
    gridHelper.position.y = -4.3;
    scene.add(gridHelper);

    // 6. Suspended Marine Particulates
    const particleCount = 600;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 150;
      particlePositions[i + 1] = Math.random() * 25 - 4;
      particlePositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.28,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Pipeline Infrastructure (10 km divided into 5 segments)
    const segmentMeshes: THREE.Mesh[] = [];
    const segmentLengthUnits = 120.0 / 5; // 24 units per 2 km segment

    for (let i = 0; i < 5; i++) {
      const segStartX = -60 + i * segmentLengthUnits;
      const segCenterX = segStartX + segmentLengthUnits / 2;

      // Pipe cylinder
      const pipeGeo = new THREE.CylinderGeometry(0.85, 0.85, segmentLengthUnits - 0.4, 24);
      pipeGeo.rotateZ(Math.PI / 2);

      const pipeMat = new THREE.MeshStandardMaterial({
        color: 0x00d2eb,
        emissive: 0x003344,
        roughness: 0.35,
        metalness: 0.8,
      });

      const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
      pipeMesh.position.set(segCenterX, 0, 0);
      pipeMesh.castShadow = true;
      pipeMesh.receiveShadow = true;
      pipeMesh.userData = { segmentId: i + 1 };
      scene.add(pipeMesh);
      segmentMeshes.push(pipeMesh);

      // Support Pylons
      [-segLengthHalf(segmentLengthUnits) * 0.6, segLengthHalf(segmentLengthUnits) * 0.6].forEach((offset) => {
        const pylonGeo = new THREE.CylinderGeometry(0.3, 0.4, 4.2, 12);
        const pylonMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 });
        const pylon = new THREE.Mesh(pylonGeo, pylonMat);
        pylon.position.set(segCenterX + offset, -2.1, 0);
        scene.add(pylon);
      });
    }
    segmentMeshesRef.current = segmentMeshes;

    function segLengthHalf(len: number) {
      return len / 2;
    }

    // 8. Isolation Valve Stations (V0 to V5)
    const valveGroups: THREE.Group[] = [];
    for (let i = 0; i <= 5; i++) {
      const valveX = -60 + i * segmentLengthUnits;
      const valveGroup = new THREE.Group();
      valveGroup.position.set(valveX, 0, 0);

      const flangeGeo = new THREE.TorusGeometry(1.2, 0.22, 16, 24);
      const flangeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
      const flange = new THREE.Mesh(flangeGeo, flangeMat);
      flange.rotateY(Math.PI / 2);
      valveGroup.add(flange);

      const bonnetGeo = new THREE.BoxGeometry(1.0, 1.8, 1.0);
      const bonnetMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
      const bonnet = new THREE.Mesh(bonnetGeo, bonnetMat);
      bonnet.position.set(0, 1.4, 0);
      valveGroup.add(bonnet);

      const beaconGeo = new THREE.SphereGeometry(0.32, 16, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 1.2,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 2.5, 0);
      beacon.name = `beacon_${i}`;
      valveGroup.add(beacon);

      const blockGeo = new THREE.BoxGeometry(2.4, 1.0, 2.4);
      const blockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.set(0, -1.8, 0);
      valveGroup.add(block);

      scene.add(valveGroup);
      valveGroups.push(valveGroup);
    }
    valveMeshesRef.current = valveGroups;

    // 9. Wellhead Riser Platform at 0 km (Inlet)
    const riserGroup = new THREE.Group();
    riserGroup.position.set(-60, 0, 0);
    const towerGeo = new THREE.CylinderGeometry(1.6, 2.4, 16, 8);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.4 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(0, 8, 0);
    riserGroup.add(tower);
    scene.add(riserGroup);

    // 10. Subsea PLEM Manifold Frame at 10 km (Outlet)
    const plemGroup = new THREE.Group();
    plemGroup.position.set(60, 0, 0);
    const manifoldGeo = new THREE.BoxGeometry(5.0, 3.2, 5.0);
    const manifoldMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.7, roughness: 0.3 });
    const manifold = new THREE.Mesh(manifoldGeo, manifoldMat);
    manifold.position.set(0, 1.6, 0);
    plemGroup.add(manifold);
    scene.add(plemGroup);

    // 11. Subsea Inspection AUV (Autonomous Underwater Vehicle)
    const auv = new THREE.Group();
    const auvBodyGeo = new THREE.CylinderGeometry(0.55, 0.55, 3.2, 16);
    auvBodyGeo.rotateZ(Math.PI / 2);
    const auvBodyMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.5, roughness: 0.3 });
    const auvBody = new THREE.Mesh(auvBodyGeo, auvBodyMat);
    auv.add(auvBody);

    // AUV Nose cone
    const auvNoseGeo = new THREE.ConeGeometry(0.55, 0.9, 16);
    auvNoseGeo.rotateZ(-Math.PI / 2);
    const auvNoseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const auvNose = new THREE.Mesh(auvNoseGeo, auvNoseMat);
    auvNose.position.x = 1.8;
    auv.add(auvNose);

    // AUV Forward searchlight
    const auvLight = new THREE.SpotLight(0x38bdf8, 4.0, 35, Math.PI / 6, 0.35);
    auvLight.position.set(2.0, 0, 0);
    auvLight.target.position.set(12.0, -4.0, 0);
    auv.add(auvLight);
    auv.add(auvLight.target);

    // AUV Nav Light (Blinking Green)
    const navLightGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const navLightMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const navLight = new THREE.Mesh(navLightGeo, navLightMat);
    navLight.position.set(0, 0.65, 0);
    auv.add(navLight);

    auv.position.set(0, 4.5, 4);
    scene.add(auv);
    auvRef.current = auv;

    // 12. Dynamic Leak Plume Particle System
    const plumeCount = 280;
    const plumeGeo = new THREE.BufferGeometry();
    const plumePos = new Float32Array(plumeCount * 3);
    const plumeVel = new Float32Array(plumeCount * 3);
    for (let i = 0; i < plumeCount * 3; i += 3) {
      plumePos[i] = 0;
      plumePos[i + 1] = 0;
      plumePos[i + 2] = 0;
      plumeVel[i] = (Math.random() - 0.5) * 0.08;
      plumeVel[i + 1] = Math.random() * 0.15 + 0.05;
      plumeVel[i + 2] = (Math.random() - 0.5) * 0.08;
    }
    plumeGeo.setAttribute('position', new THREE.BufferAttribute(plumePos, 3));
    plumeGeo.userData = { velocities: plumeVel };

    const plumeMat = new THREE.PointsMaterial({
      color: 0xf87171,
      size: 0.75,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const plume = new THREE.Points(plumeGeo, plumeMat);
    plume.visible = false;
    scene.add(plume);
    leakPlumeRef.current = plume;

    // Mouse Interaction / Orbit Drag (Works in both Overview AND AUV Follow mode!)
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let spherical = { radius: 85, theta: 0.0, phi: 1.1 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };

      if (cameraModeRef.current === 'auv') {
        // Freely rotate 360° around the moving AUV!
        auvSphericalRef.current.theta -= deltaX * 0.008;
        auvSphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.02, auvSphericalRef.current.phi + deltaY * 0.008));
      } else {
        spherical.theta -= deltaX * 0.008;
        spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, spherical.phi + deltaY * 0.008));
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (cameraModeRef.current === 'auv') {
        // Zoom in/out of the AUV smoothly
        auvSphericalRef.current.radius = Math.max(2.5, Math.min(65, auvSphericalRef.current.radius + e.deltaY * 0.03));
      } else {
        spherical.radius = Math.max(15, Math.min(180, spherical.radius + e.deltaY * 0.05));
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domEl.addEventListener('wheel', handleWheel);

    // Raycaster for segment picking
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = domEl.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseCoord, camera);
      const intersects = raycaster.intersectObjects(segmentMeshes);
      if (intersects.length > 0 && onSelectSegment) {
        const segId = intersects[0].object.userData.segmentId;
        if (segId) onSelectSegment(segId);
      }
    };
    domEl.addEventListener('click', handleClick);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // 1. Update AUV Position & Kinematics
      if (auvRef.current) {
        let xPos = 0;
        let heading = 1;

        if (auvManualPosRef.current !== null) {
          xPos = auvManualPosRef.current;
          heading = 1;
        } else if (auvAutoPatrolRef.current) {
          xPos = Math.sin(elapsed * 0.22) * 52;
          heading = Math.cos(elapsed * 0.22) >= 0 ? 1 : -1;
        } else {
          xPos = auvRef.current.position.x;
        }

        auvRef.current.position.x = xPos;
        auvRef.current.position.y = 3.8 + Math.sin(elapsed * 1.2) * 0.4;
        auvRef.current.rotation.y = heading > 0 ? 0 : Math.PI;
        auvHeadingRef.current = heading;
      }

      // 2. Camera Positioning & Movement
      if (cameraModeRef.current === 'auv' && auvRef.current) {
        const auvPos = auvRef.current.position;
        const heading = auvHeadingRef.current;
        const preset = auvViewPresetRef.current;

        if (preset === 'cockpit') {
          // 1st Person Cockpit Camera from submarine nose
          const noseDir = heading > 0 ? 1 : -1;
          camera.position.set(auvPos.x + noseDir * 2.2, auvPos.y + 0.15, auvPos.z);
          camera.lookAt(auvPos.x + noseDir * 25, auvPos.y - 1.2, auvPos.z);
        } else if (preset === 'top') {
          // Bird's eye vertical tracker
          camera.position.set(auvPos.x, auvPos.y + 22, auvPos.z + 0.05);
          camera.lookAt(auvPos.x, auvPos.y, auvPos.z);
        } else if (preset === 'chase' && !isDragging) {
          // 3rd Person Smooth Chaser Camera
          const trailDir = heading > 0 ? -1 : 1;
          const chasePos = new THREE.Vector3(auvPos.x + trailDir * 14, auvPos.y + 4.5, auvPos.z + 9);
          camera.position.lerp(chasePos, 0.08);
          camera.lookAt(auvPos.x + (heading > 0 ? 4 : -4), auvPos.y, auvPos.z);
        } else {
          // Free 360° Orbit around moving AUV
          const r = auvSphericalRef.current.radius;
          const th = auvSphericalRef.current.theta;
          const ph = auvSphericalRef.current.phi;
          camera.position.x = auvPos.x + r * Math.sin(ph) * Math.sin(th);
          camera.position.y = Math.max(0.6, auvPos.y + r * Math.cos(ph));
          camera.position.z = auvPos.z + r * Math.sin(ph) * Math.cos(th);
          camera.lookAt(auvPos);
        }
      } else if (cameraModeRef.current === 'custom' || isDragging) {
        camera.position.x = targetLookAtRef.current.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        camera.position.y = Math.max(2, targetLookAtRef.current.y + spherical.radius * Math.cos(spherical.phi));
        camera.position.z = targetLookAtRef.current.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
        camera.lookAt(targetLookAtRef.current);
      } else {
        camera.position.lerp(targetCamPosRef.current, 0.05);
        camera.lookAt(targetLookAtRef.current);
      }

      // 3. Animate Suspended Particles
      const pArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        pArr[i] -= 0.015;
        if (pArr[i] < -4.0) pArr[i] = 20.0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // 4. Animate Leak Plume Particles if active
      if (leakPlumeRef.current && leakPlumeRef.current.visible) {
        const plGeo = leakPlumeRef.current.geometry;
        const pos = plGeo.attributes.position.array as Float32Array;
        const vel = plGeo.userData.velocities as Float32Array;

        for (let i = 0; i < plumeCount * 3; i += 3) {
          pos[i] += vel[i];
          pos[i + 1] += vel[i + 1];
          pos[i + 2] += vel[i + 2];

          if (pos[i + 1] > 18.0) {
            pos[i] = (Math.random() - 0.5) * 0.4;
            pos[i + 1] = 0.5;
            pos[i + 2] = (Math.random() - 0.5) * 0.4;
          }
        }
        plGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domEl.removeEventListener('wheel', handleWheel);
      domEl.removeEventListener('click', handleClick);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update 3D elements dynamically on telemetry updates
  useEffect(() => {
    if (!telemetry) return;

    // Update Segment Colors based on health & selection
    const segHealths = telemetry.analytics?.segments_health || [];
    segmentMeshesRef.current.forEach((mesh, idx) => {
      const segId = idx + 1;
      const segInfo = segHealths.find((s) => s.id === segId);
      const isSelected = selectedSegmentId === segId;
      const mat = mesh.material as THREE.MeshStandardMaterial;

      let targetColor = 0x00f2fe;
      let emissive = 0x003344;
      let emissiveIntensity = isSelected ? 0.9 : 0.25;

      if (segInfo) {
        if (segInfo.status === 'GREEN') {
          targetColor = 0x10b981;
          emissive = 0x064e3b;
        } else if (segInfo.status === 'YELLOW') {
          targetColor = 0xf59e0b;
          emissive = 0x78350f;
          emissiveIntensity = 0.6;
        } else if (segInfo.status === 'ORANGE') {
          targetColor = 0xf97316;
          emissive = 0x7c2d12;
          emissiveIntensity = 0.8;
        } else if (segInfo.status === 'RED') {
          targetColor = 0xef4444;
          emissive = 0x7f1d1d;
          emissiveIntensity = 1.2;
        }
      }

      mat.color.setHex(targetColor);
      mat.emissive.setHex(emissive);
      mat.emissiveIntensity = emissiveIntensity;
    });

    // Update Valve Status lights (V0 to V5)
    valveMeshesRef.current.forEach((vGroup, idx) => {
      const valveKey = `V${idx}`;
      const isOpen = telemetry.valves ? telemetry.valves[valveKey] : true;
      const beacon = vGroup.getObjectByName(`beacon_${idx}`) as THREE.Mesh;
      if (beacon) {
        const bMat = beacon.material as THREE.MeshStandardMaterial;
        if (isOpen) {
          bMat.color.setHex(0x10b981);
          bMat.emissive.setHex(0x10b981);
        } else {
          bMat.color.setHex(0xef4444);
          bMat.emissive.setHex(0xef4444);
        }
      }
    });

    // Update Dynamic Leak Plume
    const isLeak = telemetry.sim_status?.leak_active || telemetry.npw_localization?.detected;
    if (leakPlumeRef.current) {
      if (isLeak) {
        const locM = telemetry.npw_localization?.location_m ?? telemetry.sim_status.leak_location_m ?? 3400;
        const x3D = mapDistanceTo3D(locM);
        leakPlumeRef.current.position.set(x3D, 0.85, 0);
        leakPlumeRef.current.visible = true;
      } else {
        leakPlumeRef.current.visible = false;
      }
    }
  }, [telemetry, selectedSegmentId]);

  // Set Camera Viewpoint Presets
  const setCameraPreset = (preset: string) => {
    setCameraMode(preset);
    cameraModeRef.current = preset;

    if (preset === 'overview') {
      targetCamPosRef.current.set(0, 42, 85);
      targetLookAtRef.current.set(0, 0, 0);
    } else if (preset === 'leak') {
      const locM = telemetry?.npw_localization?.location_m ?? telemetry?.sim_status.leak_location_m ?? 3400;
      const x3D = mapDistanceTo3D(locM);
      targetCamPosRef.current.set(x3D, 8, 18);
      targetLookAtRef.current.set(x3D, 1, 0);
    } else if (preset === 'auv') {
      // Switch to AUV Chase cam mode
      setAuvViewPreset('chase');
      auvViewPresetRef.current = 'chase';
    } else if (preset.startsWith('seg_')) {
      const segId = parseInt(preset.replace('seg_', ''), 10);
      const segCenterM = (segId - 0.5) * 2000.0;
      const x3D = mapDistanceTo3D(segCenterM);
      targetCamPosRef.current.set(x3D, 14, 30);
      targetLookAtRef.current.set(x3D, 0, 0);
      if (onSelectSegment) onSelectSegment(segId);
    }
  };

  // Change AUV View Angle Preset
  const handleAuvAngleChange = (angle: 'chase' | 'cockpit' | 'top' | 'free') => {
    setAuvViewPreset(angle);
    auvViewPresetRef.current = angle;
    if (angle === 'free') {
      auvSphericalRef.current = { radius: 14, theta: 0.8, phi: 1.1 };
    }
  };

  // Handle Manual AUV Slider Positioning along 10 km
  const handleAuvSlider = (km: number) => {
    setAuvKmPos(km);
    const m = km * 1000.0;
    const x3D = mapDistanceTo3D(m);
    auvManualPosRef.current = x3D;
    setIsAuvPatrolling(false);
    auvAutoPatrolRef.current = false;
  };

  const resumeAutoPatrol = () => {
    auvManualPosRef.current = null;
    setIsAuvPatrolling(true);
    auvAutoPatrolRef.current = true;
  };

  const isLeak = telemetry?.sim_status?.leak_active || telemetry?.npw_localization?.detected;
  const isAuvMode = cameraMode === 'auv';

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-sm">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Overlays (Top Left) in simple words */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-cyan-300">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>3D VIEW • 10 KM UNDERWATER PIPE</span>
        </div>
        <div className="bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/60 text-[11px] font-mono text-slate-300 space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">WATER DEPTH:</span>
            <span className="text-cyan-300 font-semibold">{telemetry?.environment.seabed_depth_m ?? 850} meters</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">WATER TEMPERATURE:</span>
            <span className="text-cyan-300 font-semibold">{telemetry?.environment.water_temp_c ?? 4.2} °C</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">ACTIVE PIPE SECTIONS:</span>
            <span className="text-emerald-400 font-semibold">5 / 5 ONLINE</span>
          </div>
        </div>
      </div>

      {/* Rupture Breach Beacon Alert when leak is detected */}
      {isLeak && (
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-rose-950/90 border border-rose-500/80 px-3 py-2 rounded-lg text-xs font-mono text-rose-200 shadow-glow-red animate-pulse">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <div>
            <div className="font-bold text-rose-100">LEAK SPOTTED</div>
            <div className="text-[10px] text-rose-300">
              LOCATION: {((telemetry?.npw_localization?.location_m ?? telemetry?.sim_status.leak_location_m ?? 0) / 1000).toFixed(2)} KM
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED MOVABLE AUV CAMERA CONTROLLER in simple words */}
      {isAuvMode && (
        <div className="absolute top-3 right-3 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-yellow-500/50 shadow-2xl space-y-2.5 max-w-xs animate-in fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-yellow-300">
              <Navigation className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span>UNDERWATER DRONE CAMERA</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-400 border border-yellow-500/40">
              MOVABLE
            </span>
          </div>

          {/* View Presets */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-slate-400">CHOOSE CAMERA ANGLE:</div>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <button
                onClick={() => handleAuvAngleChange('chase')}
                className={`flex items-center justify-center gap-1 px-2 py-1 rounded transition-all ${
                  auvViewPreset === 'chase'
                    ? 'bg-yellow-400 text-black font-bold shadow-md'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Eye className="w-3 h-3" />
                Follow Behind
              </button>

              <button
                onClick={() => handleAuvAngleChange('cockpit')}
                className={`flex items-center justify-center gap-1 px-2 py-1 rounded transition-all ${
                  auvViewPreset === 'cockpit'
                    ? 'bg-yellow-400 text-black font-bold shadow-md'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                Front View
              </button>

              <button
                onClick={() => handleAuvAngleChange('top')}
                className={`flex items-center justify-center gap-1 px-2 py-1 rounded transition-all ${
                  auvViewPreset === 'top'
                    ? 'bg-yellow-400 text-black font-bold shadow-md'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Compass className="w-3 h-3" />
                Top View
              </button>

              <button
                onClick={() => handleAuvAngleChange('free')}
                className={`flex items-center justify-center gap-1 px-2 py-1 rounded transition-all ${
                  auvViewPreset === 'free'
                    ? 'bg-cyan-400 text-black font-bold shadow-md'
                    : 'bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                Rotate 360°
              </button>
            </div>
          </div>

          {/* Interactive Patrol Position Slider */}
          <div className="space-y-1 pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">MOVE DRONE ALONG PIPE:</span>
              <span className="text-yellow-300 font-bold">{auvKmPos.toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={9.5}
              step={0.1}
              value={auvKmPos}
              onChange={(e) => handleAuvSlider(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-ocean-950 rounded appearance-none cursor-pointer accent-yellow-400"
            />
          </div>

          {/* Play/Pause & Reset Patrol */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[10px] font-mono">
            {isAuvPatrolling ? (
              <button
                onClick={() => setIsAuvPatrolling(false)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
              >
                <Pause className="w-3 h-3 text-amber-400" />
                Pause Drone
              </button>
            ) : (
              <button
                onClick={resumeAutoPatrol}
                className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
              >
                <Play className="w-3 h-3" />
                Start Drone
              </button>
            )}

            <span className="text-slate-400 text-[9px]">🖱️ Click & drag to rotate • Scroll to zoom</span>
          </div>
        </div>
      )}

      {/* Bottom Camera Presets Toolbar in simple words */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700 shadow-lg">
        <button
          onClick={() => setCameraPreset('overview')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
            cameraMode === 'overview'
              ? 'bg-cyan-500 text-black font-semibold'
              : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          Full Pipe
        </button>

        {[1, 2, 3, 4, 5].map((segId) => (
          <button
            key={segId}
            onClick={() => setCameraPreset(`seg_${segId}`)}
            className={`px-2 py-1 rounded-lg text-xs font-mono transition-all ${
              cameraMode === `seg_${segId}`
                ? 'bg-cyan-500 text-black font-semibold'
                : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800'
            }`}
          >
            Sec {segId}
          </button>
        ))}

        {isLeak && (
          <button
            onClick={() => setCameraPreset('leak')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
              cameraMode === 'leak'
                ? 'bg-rose-500 text-white'
                : 'bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-500/40 animate-pulse'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Go to Leak
          </button>
        )}

        <button
          onClick={() => setCameraPreset('auv')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
            cameraMode === 'auv'
              ? 'bg-yellow-400 text-black font-bold shadow-md'
              : 'text-slate-300 hover:text-yellow-300 hover:bg-slate-800'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Drone Cam
        </button>
      </div>
    </div>
  );
};
