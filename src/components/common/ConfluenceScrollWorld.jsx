import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  MapPin,
  Lightbulb,
  Building2,
  Users,
  ChevronDown,
  Volume2,
  VolumeX,
} from 'lucide-react';

/* ============================================================================
   CONFLUENCE CONTINUOUS 3D SCROLL WORLD
   9-Stage Synchronized Camera Timeline (5 Islands + 4 Connecting Pathways)
   ========================================================================== */

export const WORLD_STAGES = [
  { id: 'report', name: '01 Report', start: 0.0, end: 0.12, focus: 0.06, color: '#3B82F6', title: 'Report the Problem', desc: 'Citizens report real-world issues with photos, geo-location, and severity details.' },
  { id: 'path_1_2', name: 'Pathway to Validate', start: 0.12, end: 0.24, focus: 0.18, color: '#3B82F6', title: 'Connecting Community to Verification', desc: 'The report travels across the regional network to municipal authorities.' },
  { id: 'validate', name: '02 Validate', start: 0.24, end: 0.36, focus: 0.30, color: '#10B981', title: 'Verify & Assess', desc: 'Authorities and university experts inspect evidence, confirm authenticity, and prioritize scope.' },
  { id: 'path_2_3', name: 'Pathway to Innovate', start: 0.36, end: 0.48, focus: 0.42, color: '#8B5CF6', title: 'Transfer to Innovation Labs', desc: 'Validated problem statements open up to academic researchers and student creators.' },
  { id: 'innovate', name: '03 Innovate', start: 0.48, end: 0.60, focus: 0.54, color: '#8B5CF6', title: 'Find Smart Solutions', desc: 'Multidisciplinary student teams collaborate with faculty mentors to build functional prototypes.' },
  { id: 'path_3_4', name: 'Pathway to Partner', start: 0.60, end: 0.72, focus: 0.66, color: '#F59E0B', title: 'Bridging Campus to Industry', desc: 'Promising technology architectures enter the corporate CSR and government pipeline.' },
  { id: 'partner', name: '04 Partner', start: 0.72, end: 0.84, focus: 0.78, color: '#F59E0B', title: 'Execute the Plan', desc: 'Government, industry CSR leaders, and institutions unite to fund, review, and schedule deployment.' },
  { id: 'path_4_5', name: 'Pathway to Implement', start: 0.84, end: 0.94, focus: 0.89, color: '#059669', title: 'Deploying Solutions on Ground', desc: 'Heavy engineering, software rollouts, and municipal groundwork transform the community.' },
  { id: 'implement', name: '05 Implement', start: 0.94, end: 1.0, focus: 0.97, color: '#059669', title: 'Create Lasting Impact', desc: 'Verified solutions deployed across Bharat, creating clean, safe, resilient communities.' },
];

export const ConfluenceScrollWorld = ({
  onOpenAuth,
  onNavigateTab,
  stats = { issues: 12400, pitches: 3100, projects: 520, partners: 120 },
}) => {
  const mountRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  // References for render loop state without triggering re-renders
  const animState = useRef({
    targetProgress: 0,
    currentProgress: 0,
    camera: null,
    scene: null,
    renderer: null,
    clock: new THREE.Clock(),
    isDestroyed: false,
    particles: null,
    splineCurves: [],
    islandMeshes: [],
    droneMesh: null,
    lightbulbLight: null,
    beaconRings: [],
    pathwayPulseUniforms: [],
  });

  /* ==========================================================================
     THREE.JS WORLD GENERATION & CAMERA TRAJECTORY
     ========================================================================== */
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1128);
    scene.fog = new THREE.FogExp2(0x0d1b3e, 0.0018);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.5, 3500);
    camera.position.set(0, 45, 130);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    animState.current.camera = camera;
    animState.current.scene = scene;
    animState.current.renderer = renderer;

    // 2. Lighting Setup (Cinematic Sun & Ambient Sky)
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.9);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.6);
    hemiLight.position.set(0, 300, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    sunLight.position.set(250, 450, 200);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 1500;
    sunLight.shadow.camera.left = -500;
    sunLight.shadow.camera.right = 500;
    sunLight.shadow.camera.top = 500;
    sunLight.shadow.camera.bottom = -500;
    scene.add(sunLight);

    // 3. Sky Dome & Horizon Atmosphere
    const skyGeo = new THREE.SphereGeometry(2200, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0284c7) },
        bottomColor: { value: new THREE.Color(0x0f172a) },
        sunColor: { value: new THREE.Color(0xfef08a) },
        sunPosition: { value: sunLight.position.clone().normalize() },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 sunColor;
        uniform vec3 sunPosition;
        varying vec3 vWorldPosition;
        void main() {
          vec3 dir = normalize(vWorldPosition);
          float h = dir.y;
          vec3 sky = mix(bottomColor, topColor, max(h * 0.8 + 0.2, 0.0));
          float sunDot = max(dot(dir, sunPosition), 0.0);
          sky += sunColor * pow(sunDot, 120.0) * 0.7;
          sky += sunColor * pow(sunDot, 8.0) * 0.25;
          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // 4. Coordinates for 5 Floating Island Worlds
    const islandPositions = [
      new THREE.Vector3(0, 0, 0),         // 1. Report Mountain
      new THREE.Vector3(140, -35, -280),  // 2. Validate Mountain
      new THREE.Vector3(320, -70, -580),  // 3. Innovate Mountain
      new THREE.Vector3(520, -110, -900), // 4. Partner Mountain
      new THREE.Vector3(740, -150, -1240) // 5. Implement Mountain
    ];

    // Helper: Create Floating Island Landmass
    const createIslandLandmass = (pos, radius, topColorHex, rockColorHex) => {
      const group = new THREE.Group();
      group.position.copy(pos);

      // Top grassy plateau
      const topGeo = new THREE.CylinderGeometry(radius, radius * 0.92, 14, 32);
      const topMat = new THREE.MeshStandardMaterial({
        color: topColorHex,
        roughness: 0.75,
        metalness: 0.1,
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.y = 0;
      topMesh.receiveShadow = true;
      group.add(topMesh);

      // Rocky underside cone
      const coneGeo = new THREE.ConeGeometry(radius * 0.95, radius * 1.6, 24);
      const coneMat = new THREE.MeshStandardMaterial({
        color: rockColorHex,
        roughness: 0.95,
        metalness: 0.05,
        flatShading: true,
      });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      coneMesh.position.y = -radius * 0.8;
      coneMesh.rotation.x = Math.PI;
      group.add(coneMesh);

      // Sub-floating mini satellite rocks
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + Math.random() * 0.4;
        const dist = radius * (1.35 + Math.random() * 0.35);
        const satGeo = new THREE.DodecahedronGeometry(radius * 0.15 + Math.random() * 4, 1);
        const satMesh = new THREE.Mesh(satGeo, coneMat);
        satMesh.position.set(Math.cos(ang) * dist, -Math.random() * 20 - 10, Math.sin(ang) * dist);
        group.add(satMesh);
      }

      scene.add(group);
      return group;
    };

    // Helper: Create 3D Trees
    const addTreesToIsland = (group, count, radius) => {
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
      const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, flatShading: true });
      const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6, flatShading: true });

      for (let i = 0; i < count; i++) {
        const treeGroup = new THREE.Group();
        const r = Math.random() * (radius - 12);
        const theta = Math.random() * Math.PI * 2;
        treeGroup.position.set(Math.cos(theta) * r, 7, Math.sin(theta) * r);

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 8, 6), trunkMat);
        trunk.position.y = 4;
        treeGroup.add(trunk);

        const foliageGeo = new THREE.ConeGeometry(4 + Math.random() * 2, 9 + Math.random() * 4, 7);
        const foliage = new THREE.Mesh(foliageGeo, i % 2 === 0 ? foliageMat1 : foliageMat2);
        foliage.position.y = 10;
        foliage.castShadow = true;
        treeGroup.add(foliage);

        group.add(treeGroup);
      }
    };

    // -------------------------------------------------------------
    // ISLAND 1: REPORT MOUNTAIN (Citizen & Pothole Road)
    // -------------------------------------------------------------
    const island1 = createIslandLandmass(islandPositions[0], 52, 0x1e3a5f, 0x1e293b);
    addTreesToIsland(island1, 14, 48);

    // Asphalt Road with Damaged Pothole
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const roadMesh = new THREE.Mesh(new THREE.BoxGeometry(70, 0.6, 16), roadMat);
    roadMesh.position.set(0, 7.3, 2);
    island1.add(roadMesh);

    // Pothole Crater
    const potholeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 1.0 });
    const pothole = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 4.0, 1.2, 16), potholeMat);
    pothole.position.set(4, 7.5, 2);
    island1.add(pothole);

    // 3D Giant Smartphone Report Interface
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(-16, 20, 8);
    phoneGroup.rotation.y = 0.25;
    phoneGroup.rotation.x = -0.1;

    // Phone body
    const phoneBody = new THREE.Mesh(
      new THREE.BoxGeometry(14, 26, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 })
    );
    phoneGroup.add(phoneBody);

    // Phone glowing screen
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 24), screenMat);
    phoneScreen.position.z = 0.75;
    phoneGroup.add(phoneScreen);

    // Location Marker Pin hovering over pothole
    const pinGroup = new THREE.Group();
    pinGroup.position.set(4, 18, 2);
    const pinHead = new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    const pinPoint = new THREE.Mesh(new THREE.ConeGeometry(3.5, 7, 16), new THREE.MeshBasicMaterial({ color: 0xd97706 }));
    pinPoint.rotation.x = Math.PI;
    pinPoint.position.y = -3.5;
    pinGroup.add(pinHead);
    pinGroup.add(pinPoint);
    island1.add(pinGroup);

    // Radiating beacon rings
    for (let b = 0; b < 2; b++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(2 + b * 4, 3.5 + b * 4, 32),
        new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
      );
      ring.position.set(4, 7.6, 2);
      ring.rotation.x = Math.PI / 2;
      island1.add(ring);
      animState.current.beaconRings.push(ring);
    }
    island1.add(phoneGroup);

    // -------------------------------------------------------------
    // ISLAND 2: VALIDATE MOUNTAIN (Civic Center & Drone Verification)
    // -------------------------------------------------------------
    const island2 = createIslandLandmass(islandPositions[1], 56, 0x14532d, 0x0f172a);
    addTreesToIsland(island2, 18, 52);

    // Civic Authority Building
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.4 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const mainGovBldg = new THREE.Mesh(new THREE.BoxGeometry(28, 22, 22), buildingMat);
    mainGovBldg.position.set(-12, 18, -4);
    mainGovBldg.castShadow = true;
    island2.add(mainGovBldg);

    // Holographic Verification Screen
    const holoScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 15),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
    );
    holoScreen.position.set(16, 22, 10);
    holoScreen.rotation.y = -0.3;
    island2.add(holoScreen);

    // 3D Hovering Scanning Drone
    const drone = new THREE.Group();
    drone.position.set(12, 35, 20);
    const droneBody = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 6), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 }));
    drone.add(droneBody);
    const droneBeam = new THREE.Mesh(
      new THREE.ConeGeometry(8, 26, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    droneBeam.position.y = -13;
    drone.add(droneBeam);
    island2.add(drone);
    animState.current.droneMesh = drone;

    // -------------------------------------------------------------
    // ISLAND 3: INNOVATE MOUNTAIN (University Campus & Idea Lightbulb)
    // -------------------------------------------------------------
    const island3 = createIslandLandmass(islandPositions[2], 62, 0x2e1065, 0x1e1b4b);
    addTreesToIsland(island3, 16, 56);

    // University Tech Labs
    const labMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.4 });
    const lab1 = new THREE.Mesh(new THREE.BoxGeometry(24, 18, 18), labMat);
    lab1.position.set(-18, 16, -10);
    island3.add(lab1);
    const lab2 = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 24, 16), buildingMat);
    lab2.position.set(18, 19, -12);
    island3.add(lab2);

    // Giant Glowing 3D Idea Lightbulb in Center
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(0, 30, 4);
    const bulbGeo = new THREE.SphereGeometry(7, 24, 24);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbGroup.add(bulbMesh);

    const bulbLight = new THREE.PointLight(0xfde047, 3.5, 120);
    bulbLight.position.set(0, 0, 0);
    bulbGroup.add(bulbLight);
    island3.add(bulbGroup);
    animState.current.lightbulbLight = bulbLight;

    // Hologram Brainstorming Board
    const brainstormBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 14),
      new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    brainstormBoard.position.set(0, 15, 16);
    island3.add(brainstormBoard);

    // -------------------------------------------------------------
    // ISLAND 4: PARTNER MOUNTAIN (Industry & Heavy Construction)
    // -------------------------------------------------------------
    const island4 = createIslandLandmass(islandPositions[3], 64, 0x7c2d12, 0x27272a);
    addTreesToIsland(island4, 12, 58);

    // Modern Corporate Skyscraper Blocks
    const corpMat1 = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.7 });
    const corpBldg = new THREE.Mesh(new THREE.BoxGeometry(22, 42, 22), corpMat1);
    corpBldg.position.set(-20, 28, -12);
    island4.add(corpBldg);

    // Construction Excavator Model
    const excavatorGroup = new THREE.Group();
    excavatorGroup.position.set(10, 10, 6);
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    const exBody = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 8), yellowMat);
    excavatorGroup.add(exBody);
    const exArm = new THREE.Mesh(new THREE.BoxGeometry(3, 14, 3), yellowMat);
    exArm.position.set(6, 8, 0);
    exArm.rotation.z = -0.6;
    excavatorGroup.add(exArm);
    island4.add(excavatorGroup);

    // Work-in-Progress Floating HUD Board
    const wipBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 14),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    wipBoard.position.set(14, 26, 12);
    wipBoard.rotation.y = -0.2;
    island4.add(wipBoard);

    // -------------------------------------------------------------
    // ISLAND 5: IMPLEMENT MOUNTAIN (Viksit Bharat Smart Green City)
    // -------------------------------------------------------------
    const island5 = createIslandLandmass(islandPositions[4], 72, 0x065f46, 0x0f172a);
    addTreesToIsland(island5, 26, 68);

    // Smart City Skyline
    const cityMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.8 });
    for (let c = 0; c < 5; c++) {
      const h = 24 + c * 9;
      const tower = new THREE.Mesh(new THREE.BoxGeometry(12, h, 12), cityMat);
      tower.position.set(-24 + c * 12, h / 2 + 7, -18);
      island5.add(tower);
    }

    // Solar Panel Array with Reflective Glint
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.1 });
    const solarArray = new THREE.Mesh(new THREE.BoxGeometry(28, 1, 14), solarMat);
    solarArray.position.set(18, 9, 12);
    solarArray.rotation.x = -0.25;
    island5.add(solarArray);

    // Crystalline Clean Water Lake
    const lakeGeo = new THREE.CircleGeometry(16, 32);
    const lakeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.05, metalness: 0.95 });
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.position.set(-6, 7.3, 14);
    lake.rotation.x = -Math.PI / 2;
    island5.add(lake);

    // Completed Impact Milestone Ring
    const ecoBadge = new THREE.Mesh(
      new THREE.TorusGeometry(8, 1.2, 16, 32),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    ecoBadge.position.set(0, 34, 0);
    island5.add(ecoBadge);

    // -------------------------------------------------------------
    // CONNECTING 3D GLOWING PATHWAYS (Extruded Spline Ribbons)
    // -------------------------------------------------------------
    const createPathwayRibbon = (pA, pB, colorHex) => {
      const mid1 = new THREE.Vector3().lerpVectors(pA, pB, 0.33).add(new THREE.Vector3(25, 12, 10));
      const mid2 = new THREE.Vector3().lerpVectors(pA, pB, 0.66).add(new THREE.Vector3(-20, -10, -15));
      const curve = new THREE.CatmullRomCurve3([pA.clone().add(new THREE.Vector3(10, 8, 0)), mid1, mid2, pB.clone().add(new THREE.Vector3(-10, 8, 0))]);

      const tubeGeo = new THREE.TubeGeometry(curve, 64, 2.2, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({ color: colorHex, wireframe: false });
      const ribbon = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(ribbon);

      // Outer glow ribbon
      const glowGeo = new THREE.TubeGeometry(curve, 64, 4.2, 8, false);
      const glowMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.22, side: THREE.DoubleSide });
      const glowRibbon = new THREE.Mesh(glowGeo, glowMat);
      scene.add(glowRibbon);

      return curve;
    };

    createPathwayRibbon(islandPositions[0], islandPositions[1], 0x3b82f6);
    createPathwayRibbon(islandPositions[1], islandPositions[2], 0x10b981);
    createPathwayRibbon(islandPositions[2], islandPositions[3], 0x8b5cf6);
    createPathwayRibbon(islandPositions[3], islandPositions[4], 0xf59e0b);

    // 5. Floating Atmospheric Particles & Cloud Puffs
    const particleCount = 750;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 1400 + 350;
      particlePositions[i + 1] = (Math.random() - 0.5) * 400 - 50;
      particlePositions[i + 2] = (Math.random() - 0.5) * 1800 - 600;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x93c5fd, size: 3.5, transparent: true, opacity: 0.65 });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    animState.current.particles = particleSystem;

    // -------------------------------------------------------------
    // 6. CONTINUOUS 3D CAMERA PATH DEFINITION
    // -------------------------------------------------------------
    const cameraWaypoints = [
      new THREE.Vector3(0, 75, 140),       // 0.00: Wide opening Report Mountain
      new THREE.Vector3(-6, 28, 55),       // 0.06: Focus on Pothole & Citizen Phone
      new THREE.Vector3(35, 42, -50),      // 0.12: Exit Report, dive into Pathway 1
      new THREE.Vector3(90, 15, -160),     // 0.18: Mid Pathway 1 over clouds & river
      new THREE.Vector3(120, 22, -225),    // 0.24: Approach Validate Mountain
      new THREE.Vector3(135, 12, -260),    // 0.30: Focus on Verification Center & Drone
      new THREE.Vector3(190, 30, -380),    // 0.36: Exit Validate into Pathway 2
      new THREE.Vector3(260, 10, -480),    // 0.42: High speed glide toward Innovation
      new THREE.Vector3(300, 16, -535),    // 0.48: Approach Innovate Mountain
      new THREE.Vector3(320, 14, -565),    // 0.54: Focus on Glowing Idea Lightbulb
      new THREE.Vector3(380, 35, -690),    // 0.60: Fly over suspension bridge to Partner
      new THREE.Vector3(450, 0, -780),     // 0.66: Panoramic valley crossing
      new THREE.Vector3(500, 12, -845),    // 0.72: Approach Partner Mountain
      new THREE.Vector3(520, 15, -885),    // 0.78: Orbit around Work in Progress Excavator
      new THREE.Vector3(600, 35, -1000),   // 0.84: Pathway 4 to Smart City transformation
      new THREE.Vector3(670, 15, -1120),   // 0.90: Clean energy transition
      new THREE.Vector3(720, 25, -1200),   // 0.94: Enter Smart Green City
      new THREE.Vector3(740, 18, -1225),   // 0.97: Focus on Impact Delivered Lake & Towers
      new THREE.Vector3(740, 120, -1100),  // 1.00: Grand aerial ascent over entire Viksit Bharat
    ];

    const cameraLookWaypoints = [
      new THREE.Vector3(0, 10, 0),         // Report
      new THREE.Vector3(4, 7, 2),          // Pothole pin
      new THREE.Vector3(140, -35, -280),   // Validate ahead
      new THREE.Vector3(140, -35, -280),   // Validate
      new THREE.Vector3(140, -35, -280),   // Validate
      new THREE.Vector3(140, -10, -280),   // Verification Center
      new THREE.Vector3(320, -70, -580),   // Innovate ahead
      new THREE.Vector3(320, -70, -580),   // Innovate
      new THREE.Vector3(320, -70, -580),   // Innovate
      new THREE.Vector3(320, -40, -580),   // Idea lightbulb
      new THREE.Vector3(520, -110, -900),  // Partner ahead
      new THREE.Vector3(520, -110, -900),  // Partner
      new THREE.Vector3(520, -110, -900),  // Partner
      new THREE.Vector3(520, -95, -900),   // Excavator
      new THREE.Vector3(740, -150, -1240), // Implement ahead
      new THREE.Vector3(740, -150, -1240), // Implement
      new THREE.Vector3(740, -150, -1240), // Implement
      new THREE.Vector3(740, -140, -1240), // Smart city
      new THREE.Vector3(370, -80, -620),   // Complete world center
    ];

    const cameraCurve = new THREE.CatmullRomCurve3(cameraWaypoints);
    const cameraLookCurve = new THREE.CatmullRomCurve3(cameraLookWaypoints);

    // -------------------------------------------------------------
    // 7. RENDER & REVERSIBLE SCRUB ANIMATION LOOP
    // -------------------------------------------------------------
    let animationFrameId;
    const animate = () => {
      if (animState.current.isDestroyed) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = animState.current.clock.getDelta();
      const time = animState.current.clock.getElapsedTime();

      // Delta-time based damping (prevents frame-rate jitter)
      const smoothing = 1 - Math.exp(-6.5 * delta);
      animState.current.currentProgress +=
        (animState.current.targetProgress - animState.current.currentProgress) * smoothing;

      const t = THREE.MathUtils.clamp(animState.current.currentProgress, 0, 0.999);

      // Camera position & target interpolation
      const camPos = cameraCurve.getPointAt(t);
      const camLook = cameraLookCurve.getPointAt(t);

      camera.position.copy(camPos);
      camera.lookAt(camLook);

      // Animate dynamic elements
      if (animState.current.droneMesh) {
        animState.current.droneMesh.position.y = 35 + Math.sin(time * 3) * 2.5;
        animState.current.droneMesh.rotation.y = time * 0.8;
      }
      if (animState.current.lightbulbLight) {
        animState.current.lightbulbLight.intensity = 3.5 + Math.sin(time * 5) * 1.2;
      }
      if (animState.current.beaconRings.length) {
        animState.current.beaconRings.forEach((ring, idx) => {
          const s = 1 + ((time * 1.2 + idx * 0.5) % 1.5);
          ring.scale.set(s, s, s);
        });
      }
      if (animState.current.particles) {
        animState.current.particles.rotation.y = time * 0.02;
      }

      renderer.render(scene, camera);
    };
    animate();

    // -------------------------------------------------------------
    // 8. SCROLL & RESIZE EVENT LISTENERS
    // -------------------------------------------------------------
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const totalScroll = scrollContainerRef.current.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const normalized = THREE.MathUtils.clamp(window.scrollY / totalScroll, 0, 1);
      animState.current.targetProgress = normalized;
      setScrollProgress(normalized);

      // Determine active stage
      for (let i = 0; i < WORLD_STAGES.length; i++) {
        if (normalized >= WORLD_STAGES[i].start && normalized <= WORLD_STAGES[i].end) {
          setCurrentStageIndex(i);
          break;
        }
      }
    };

    const handleResize = () => {
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    handleScroll();

    // Cleanup on component unmount
    return () => {
      animState.current.isDestroyed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      skyMat.dispose();
      skyGeo.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const jumpToStage = useCallback((index) => {
    const stage = WORLD_STAGES[index];
    if (!stage || !scrollContainerRef.current) return;
    const totalScroll = scrollContainerRef.current.scrollHeight - window.innerHeight;
    const targetScroll = stage.focus * totalScroll;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }, []);

  const activeStage = useMemo(() => WORLD_STAGES[currentStageIndex] || WORLD_STAGES[0], [currentStageIndex]);

  return (
    <div
      ref={scrollContainerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '900vh', // 9 Cinematic stages
        background: '#0a1128',
      }}
    >
      {/* ================= FIXED 3D WEBGL VIEWPORT ================= */}
      <div
        ref={mountRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ================= TOP HUD TIMELINE TRACKER ================= */}
      <div
        style={{
          position: 'fixed',
          top: '76px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '6px 16px',
          borderRadius: '999px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        }}
      >
        {[
          { label: '01 Report', idx: 0 },
          { label: '02 Validate', idx: 2 },
          { label: '03 Innovate', idx: 4 },
          { label: '04 Partner', idx: 6 },
          { label: '05 Implement', idx: 8 },
        ].map((item) => {
          const isActive =
            currentStageIndex === item.idx || (currentStageIndex === item.idx + 1 && item.idx !== 8);
          return (
            <button
              key={item.label}
              onClick={() => jumpToStage(item.idx)}
              style={{
                background: isActive ? 'linear-gradient(135deg, #2563EB, #3B82F6)' : 'transparent',
                color: isActive ? '#FFFFFF' : '#94A3B8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? '0 0 16px rgba(59, 130, 246, 0.5)' : 'none',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ================= DYNAMIC STAGE HUD OVERLAY ================= */}
      <div
        style={{
          position: 'fixed',
          left: 'clamp(20px, 5vw, 80px)',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 25,
          maxWidth: 'min(480px, 85vw)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${activeStage.color}50`,
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: `0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px ${activeStage.color}25`,
            color: '#FFFFFF',
            pointerEvents: 'auto',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Stage Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: `${activeStage.color}20`,
              border: `1px solid ${activeStage.color}60`,
              color: activeStage.color,
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={14} />
            <span>{activeStage.name}</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: '0 0 0.75rem',
              color: '#FFFFFF',
            }}
          >
            {activeStage.title}
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: '#CBD5E1',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            {activeStage.desc}
          </p>

          {/* Dynamic Platform Metrics Integration */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '1rem',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Live Issues</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#60A5FA' }}>
                {stats.issues.toLocaleString()}+
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Active Projects</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34D399' }}>
                {stats.projects.toLocaleString()}+
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenAuth && onOpenAuth('register')}
              style={{
                padding: '0.8rem 1.6rem',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 800,
                border: 'none',
                background: `linear-gradient(135deg, ${activeStage.color}, #2563EB)`,
                color: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${activeStage.color}50`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>Report a Problem</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab('solutions')}
              style={{
                padding: '0.8rem 1.4rem',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              Explore Solutions
            </button>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM SCROLL HINT & PROGRESS ================= */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          color: '#94A3B8',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
        }}
      >
        <span>Scroll to fly through the world ({Math.round(scrollProgress * 100)}%)</span>
        <ChevronDown size={18} className="animate-bounce" color="#60A5FA" />
      </div>

      {/* ================= FINAL REVEAL BANNER (STAGE 09 END) ================= */}
      {scrollProgress > 0.94 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.85) 0%, rgba(10,17,40,0.95) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
            animation: 'fadeIn 0.6s ease-out forwards',
          }}
        >
          <div style={{ maxWidth: '680px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34D399',
                padding: '6px 16px',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '0.88rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>National Mission for Viksit Bharat 2047</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                marginBottom: '1.25rem',
              }}
            >
              Real Problems.{' '}
              <span style={{ color: '#38BDF8' }}>Real Solutions.</span>
              <br />
              A Stronger Bharat.
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              From citizen grievance to university research, student innovation, industry CSR funding, and district execution.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => onOpenAuth && onOpenAuth('register')}
                style={{
                  padding: '1rem 2.25rem',
                  borderRadius: '14px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(37, 99, 235, 0.6)',
                }}
              >
                Start Your Journey
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('problems')}
                style={{
                  padding: '1rem 2rem',
                  borderRadius: '14px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                }}
              >
                Explore All Problems
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
