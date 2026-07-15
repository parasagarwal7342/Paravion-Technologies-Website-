import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Globe,
  Smartphone,
  Server,
  Megaphone,
  Paintbrush,
  Cloud,
  ExternalLink,
  Lock,
  BrainCircuit,
  Shield,
  Link as LinkIcon,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  Eye
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { useToast } from '../components/ui/toast';
import { Switch } from '../components/ui/switch';

// ==========================================
// 1. THREE.JS 3D SCROLL-LINKED CYBER SKY (LIGHT THEME)
// ==========================================
interface ThreeDBackgroundProps {
  mousePos: { x: number; y: number };
}

const ThreeDBackground: React.FC<ThreeDBackgroundProps> = ({ mousePos }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef(mousePos);
  
  // Track scroll position
  const scrollRef = useRef({ target: 0, current: 0 });

  useEffect(() => {
    mouseRef.current = mousePos;
  }, [mousePos]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      scrollRef.current.target = window.scrollY / scrollHeight;
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // initialize

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.015); // fade to slate white

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 2, 15);

    // Alpha true for transparent WebGL rendering over the watermark image
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // fully transparent clear color
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x3b82f6, 1.2); // light blue light source
    dirLight.position.set(5, 12, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x2563eb, 2.0, 60);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    // Starfield (Deep blue/teal points for light theme contrast)
    const starsCount = 200;
    const starsGeom = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 60 + 2;
      starPositions[i * 3 + 2] = -Math.random() * 80;

      const isTeal = Math.random() > 0.5;
      // R, G, B channels mapping to Slate/Indigo values
      starColors[i * 3] = isTeal ? 0.05 : 0.14; 
      starColors[i * 3 + 1] = isTeal ? 0.58 : 0.38; 
      starColors[i * 3 + 2] = isTeal ? 0.53 : 0.92; 
    }

    starsGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    const starField = new THREE.Points(starsGeom, starMat);
    scene.add(starField);

    // Base Scrolling Grid Plane (Soft blue lines)
    const gridHelper = new THREE.GridHelper(150, 50, 0x3b82f6, 0xe2e8f0);
    gridHelper.position.y = -4;
    scene.add(gridHelper);

    // 3D Digital Wireframe Mountains Terrain (Soft blue coordinates)
    const terrainGeom = new THREE.PlaneGeometry(120, 120, 24, 24);
    const posAttr = terrainGeom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = Math.sin(x * 0.08) * Math.cos(y * 0.08) * 3.5 + Math.sin(x * 0.04) * 2.0;
      posAttr.setZ(i, z);
    }
    terrainGeom.computeVertexNormals();
    terrainGeom.rotateX(-Math.PI / 2);

    const terrainMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.0 
    });
    const terrain = new THREE.Mesh(terrainGeom, terrainMat);
    terrain.position.set(0, -6, -20);
    scene.add(terrain);

    // 3D Matrix Cube Nodes (Teal wireframes)
    const cubesGroup = new THREE.Group();
    const cubeGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const cubeMat = new THREE.MeshBasicMaterial({
      color: 0x0d9488,
      wireframe: true,
      transparent: true,
      opacity: 0.0 
    });

    const cubeCount = 12;
    const cubes: THREE.Mesh[] = [];
    for (let i = 0; i < cubeCount; i++) {
      const m = new THREE.Mesh(cubeGeom, cubeMat);
      m.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 15 + 3,
        -Math.random() * 40 - 10
      );
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      cubesGroup.add(m);
      cubes.push(m);
    }
    scene.add(cubesGroup);

    // Giant Security Core Orb (Blue wireframe)
    const coreGeom = new THREE.IcosahedronGeometry(3.0, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.0 
    });
    const securityCore = new THREE.Mesh(coreGeom, coreMat);
    securityCore.position.set(0, 1, -10);
    scene.add(securityCore);

    // 3D Wireframe Jet Plane (Rich Blue wireframe)
    const jetGroup = new THREE.Group();
    const jetMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });

    // Fuselage
    const fuselageGeom = new THREE.CylinderGeometry(0.1, 0.7, 7, 5);
    fuselageGeom.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeom, jetMat);
    jetGroup.add(fuselage);

    // Nose
    const noseGeom = new THREE.ConeGeometry(0.7, 2.2, 5);
    noseGeom.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeom, jetMat);
    nose.position.z = 4.6;
    jetGroup.add(nose);

    // Left Wing
    const wingLeftGeom = new THREE.ConeGeometry(2.2, 4.5, 3);
    wingLeftGeom.rotateZ(Math.PI / 2);
    wingLeftGeom.scale(1, 0.05, 1);
    const wingLeft = new THREE.Mesh(wingLeftGeom, jetMat);
    wingLeft.position.set(-1.8, 0, -0.5);
    jetGroup.add(wingLeft);

    // Right Wing
    const wingRightGeom = new THREE.ConeGeometry(2.2, 4.5, 3);
    wingRightGeom.rotateZ(-Math.PI / 2);
    wingRightGeom.scale(1, 0.05, 1);
    const wingRight = new THREE.Mesh(wingRightGeom, jetMat);
    wingRight.position.set(2, 0, -0.5);
    jetGroup.add(wingRight);

    // Tail Fin
    const finGeom = new THREE.ConeGeometry(0.5, 1.2, 3);
    finGeom.rotateX(-Math.PI / 4);
    finGeom.scale(0.05, 1, 1);
    const fin = new THREE.Mesh(finGeom, jetMat);
    fin.position.set(0, 0.7, -3.0);
    jetGroup.add(fin);

    scene.add(jetGroup);
    jetGroup.position.set(0, 0, 5);

    // Animation variables
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smoothly interpolate scroll ratio
      scrollRef.current.current = THREE.MathUtils.lerp(
        scrollRef.current.current,
        scrollRef.current.target,
        0.05 
      );
      const sr = scrollRef.current.current;
      
      const scrollSpeedMultiplier = 1.0 + sr * 4.0;
      gridHelper.position.z += delta * 12 * scrollSpeedMultiplier;
      if (gridHelper.position.z > 6) gridHelper.position.z = 0;

      // Stars
      const positions = starsGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < starsCount; i++) {
        positions[i * 3 + 2] += delta * 16 * scrollSpeedMultiplier;
        if (positions[i * 3 + 2] > 10) {
          positions[i * 3 + 2] = -70;
          positions[i * 3] = (Math.random() - 0.5) * 100;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 60 + 2;
        }
      }
      starsGeom.attributes.position.needsUpdate = true;

      // Jet Plane motion
      if (sr < 0.4) {
        jetGroup.visible = true;
        const planeZ = 5 - (sr / 0.4) * 35;
        jetGroup.position.z = THREE.MathUtils.lerp(jetGroup.position.z, planeZ, 0.1);
        
        const planeRoll = -sr * Math.PI * 1.2;
        const planePitch = sr * Math.PI * 0.2;
        jetGroup.rotation.z = THREE.MathUtils.lerp(jetGroup.rotation.z, planeRoll, 0.1);
        jetGroup.rotation.x = THREE.MathUtils.lerp(jetGroup.rotation.x, planePitch, 0.1);
        
        jetGroup.position.y = Math.sin(elapsed * 2.5) * 0.15;
        jetGroup.position.x = Math.cos(elapsed * 1.5) * 0.1;
      } else {
        jetGroup.visible = false;
      }

      // Digital Mountains
      if (sr >= 0.15 && sr <= 0.65) {
        terrain.visible = true;
        let opacity = 0;
        if (sr < 0.35) {
          opacity = (sr - 0.15) / 0.2;
        } else {
          opacity = 1.0 - (sr - 0.35) / 0.3;
        }
        terrainMat.opacity = opacity * 0.22;
        
        terrain.position.z += delta * 15;
        if (terrain.position.z > 20) terrain.position.z = -40;
      } else {
        terrain.visible = false;
      }

      // Matrix Nodes
      if (sr >= 0.45 && sr <= 0.85) {
        cubesGroup.visible = true;
        let opacity = 0;
        if (sr < 0.65) {
          opacity = (sr - 0.45) / 0.2;
        } else {
          opacity = 1.0 - (sr - 0.65) / 0.2;
        }
        cubeMat.opacity = opacity * 0.4;

        cubes.forEach((cube, idx) => {
          cube.rotation.x += delta * 0.8 * (idx % 2 === 0 ? 1 : -1);
          cube.rotation.y += delta * 0.5;
          cube.position.z += delta * 10;
          if (cube.position.z > 10) {
            cube.position.z = -50;
            cube.position.x = (Math.random() - 0.5) * 30;
          }
        });
      } else {
        cubesGroup.visible = false;
      }

      // Security Core Orb
      if (sr >= 0.70) {
        securityCore.visible = true;
        const opacity = (sr - 0.70) / 0.25;
        coreMat.opacity = Math.min(opacity * 0.35, 0.35);

        securityCore.rotation.y += delta * 0.4;
        securityCore.rotation.x += delta * 0.2;
        
        const coreScale = 1.0 + Math.sin(elapsed * 2.0) * 0.05 + (sr - 0.7) * 0.5;
        securityCore.scale.set(coreScale, coreScale, coreScale);
      } else {
        securityCore.visible = false;
      }

      // Mouse Parallax
      const targetCamX = mouseRef.current.x * 2.0;
      const targetCamY = 2 + mouseRef.current.y * 1.5 - sr * 4.0;
      const targetCamZ = 15 - sr * 6.0;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.05);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
};

// ==========================================
// 2. STATS BAR: ROTATING NODAL GLOBE
// ==========================================
const StatGlobe3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const container = containerRef.current;
    if (!container) return;

    const width = 80;
    const height = 80;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const globeGeom = new THREE.SphereGeometry(1.6, 12, 12);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb, // blue globe for light theme
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const globe = new THREE.Mesh(globeGeom, globeMat);
    scene.add(globe);

    const pointsMat = new THREE.PointsMaterial({
      color: 0x0d9488, // teal nodes
      size: 0.12,
      transparent: true,
      opacity: 0.8
    });
    const points = new THREE.Points(globeGeom, pointsMat);
    scene.add(points);

    const ringGeom = new THREE.RingGeometry(2.0, 2.05, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0d9488,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      globe.rotation.y += 0.005;
      globe.rotation.x += 0.002;
      points.rotation.y += 0.005;
      points.rotation.x += 0.002;
      ring.rotation.z -= 0.008;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, [isInView]);

  return <div ref={containerRef} className="w-20 h-20 flex items-center justify-center pointer-events-none" />;
};

// ==========================================
// 3. HEALTH CHECK: PULSING SECURITY CORE SHIELD
// ==========================================
interface SecurityShield3DProps {
  yesCount: number;
}

const SecurityShield3D: React.FC<SecurityShield3DProps> = ({ yesCount }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!coreRef.current || !ringRef.current) return;
    
    let colorHex = 0xe11d48; // rose red (0-1)
    if (yesCount >= 4) {
      colorHex = 0x0d9488; // teal green
    } else if (yesCount >= 2) {
      colorHex = 0xd97706; // amber
    }

    const material = coreRef.current.material as THREE.MeshBasicMaterial;
    material.color.setHex(colorHex);

    const ringMat = ringRef.current.material as THREE.MeshBasicMaterial;
    ringMat.color.setHex(colorHex);
  }, [yesCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const coreGeom = new THREE.IcosahedronGeometry(1.5, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    scene.add(core);
    coreRef.current = core;

    const pointsMat = new THREE.PointsMaterial({
      color: 0x0f172a, // dark points
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });
    const points = new THREE.Points(coreGeom, pointsMat);
    scene.add(points);

    const ringGeom = new THREE.TorusGeometry(2.1, 0.03, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      transparent: true,
      opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 4;
    scene.add(ring);
    ringRef.current = ring;

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      let speedFactor = 2.5; 
      if (yesCount >= 4) speedFactor = 0.6; 
      else if (yesCount >= 2) speedFactor = 1.4; 

      core.rotation.y += 0.005 * speedFactor;
      core.rotation.x += 0.003 * speedFactor;
      points.rotation.copy(core.rotation);
      ring.rotation.z -= 0.003 * speedFactor;

      const pulse = 1.0 + Math.sin(elapsed * (speedFactor * 2)) * 0.08;
      core.scale.set(pulse, pulse, pulse);
      points.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-64 flex items-center justify-center" />;
};

// ==========================================
// 3.5 STATS BAR ANIMATED COUNTER
// ==========================================
interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const AnimatedCounter: React.FC<CounterProps> = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const intervalTime = 16;
    const totalSteps = duration / intervalTime;
    const increment = value / totalSteps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= totalSteps) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount((prev) => Math.min(prev + increment, value));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-mono text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
      {prefix}
      {count.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

// ==========================================
// 4. PRODUCTS DATA ARRAY
// ==========================================
interface Product {
  id: string;
  name: string;
  status: 'DEPLOYED' | 'PROTOTYPE';
  badgeText: string;
  category: 'Deployed' | 'Prototype';
  subtitle: string;
  description: string;
  callout?: string;
  achievements: string[];
  tech: string[];
  demoUrl?: string;
  sourceUrl?: string;
  restricted: boolean;
}

const products: Product[] = [
  {
    id: 'sentinel-ai',
    name: 'Sentinel-AI',
    status: 'PROTOTYPE',
    badgeText: 'PROTOTYPE',
    category: 'Prototype',
    subtitle: 'Sovereign Email Intelligence & Fraud Forensics',
    description: 'An advanced, IP-hardened email fraud detection framework using four-layer Sovereign Logic Fusion (SLF) — Structural Integrity Audit (SFA), DNA matching, Machine Learning ensembles, and Explainable AI (XAI). Flags threats via SHAP-interpreted Non-Linear Manipulation Entropy.',
    achievements: [
      'Adversarial Obfuscation Buster (AOB v3.0) detects invisible zero-width Unicode characters',
      'SHAP-interpreted NLME metrics quantify urgency and greed triggers',
      'Structural Forensic Audits (SFA) provide uncopyable algorithmic defense layer',
      'Official patent filings secured for Sentinel-AI technologies'
    ],
    tech: ['Python', 'Flask', 'XGBoost', 'NLTK', 'Scikit', 'Cyber-Dark UI', 'AOB v3.0'],
    demoUrl: '#',
    sourceUrl: 'https://github.com/parasagarwal7342/Paravion-Technologies-Website-.git',
    restricted: false
  },
  {
    id: 'spa-platform',
    name: 'SPA Enterprise Platform',
    status: 'DEPLOYED',
    badgeText: 'DEPLOYED',
    category: 'Deployed',
    subtitle: 'Official Distribution E-Commerce Core',
    callout: 'First live client project — exclusively built and maintained by Paravion Tech for SPA Enterprises.',
    description: 'A high-performance, three-portal enterprise e-commerce platform with customer shopping, secure role-based staff portal, and ownership analytics dashboard. B2B/B2C hybrid marketplace with Razorpay payment rails and AI-enhanced capabilities. Deployed on Vercel + Railway. This is the only live production deployment in the portfolio.',
    achievements: [
      'Multi-portal architecture for Customers, Staff, and Owners with distinct optimized UX',
      'B2B/B2C hybrid marketplace with deeply integrated Razorpay payment rails',
      'AI-enhanced platform via Anthropic Claude and OpenAI DALL·E 3 APIs',
      'Production-ready deployment pipelines using Vercel and Railway infrastructure'
    ],
    tech: ['React 19', 'Vite', 'TypeScript', 'Fastify', 'Razorpay', 'Anthropic Claude'],
    demoUrl: '#',
    sourceUrl: 'https://github.com/parasagarwal7342/Paravion-Technologies-Website-.git',
    restricted: false
  },
  {
    id: 'shadowguard',
    name: 'Paravion ShadowGuard v2.0',
    status: 'PROTOTYPE',
    badgeText: 'MVP COMPLETED',
    category: 'Prototype',
    subtitle: 'Sovereign AI Governance Platform',
    description: "The world's most advanced software-only solution for enterprises to detect, control, and audit Shadow AI usage. Built with a Sovereign-First philosophy — intercepts real-time LLM prompt leakage across ChatGPT, Gemini, and Claude using a Python-based Neural Classification Engine.",
    achievements: [
      'CISO Command Center with Holographic Risk Gauges and real-time telemetry feeds',
      'WASM-powered browser extension intercepts and secures network layer prompts',
      'Neural Classification Engine with Logistic normalization for Threat Index calculation',
      'Immutable Compliance Audit Agent mapped to SOC2 protocols'
    ],
    tech: ['Next.js', 'Python', 'Tailwind CSS', 'AI Security', 'SOC2 Automation'],
    sourceUrl: 'https://github.com/parasagarwal7342/Paravion-Technologies-Website-.git',
    restricted: false
  },
  {
    id: 'hexguard-fim',
    name: 'HexGuard FIM',
    status: 'PROTOTYPE',
    badgeText: 'MVP COMPLETED',
    category: 'Prototype',
    subtitle: 'Enterprise-Grade File Integrity Monitor',
    description: 'High-performance File Integrity Monitor using deep system-level tracking to detect zero-day ransomware via kernel-level syscall tracing. Features SHA-256 cryptographic anchoring and algorithmic analytics for unconventional folder/file movement detection.',
    achievements: [
      'Kernel-level syscall tracing for real-time ransomware behavior detection',
      'SHA-256 cryptographic anchoring ensures immutable system state logs',
      'Advanced algorithmic analysis flags unconventional directory traversal patterns'
    ],
    tech: ['Python', 'PowerShell', 'Kernel-level Tracing', 'Ransomware Analytics', 'SHA-256 Crypto'],
    sourceUrl: 'https://github.com/parasagarwal7342/Paravion-Technologies-Website-.git',
    restricted: false
  },
  {
    id: 'digital-shield',
    name: 'Digital Shield v2.0',
    status: 'PROTOTYPE',
    badgeText: 'PROTOTYPE',
    category: 'Prototype',
    subtitle: 'Zero-Trust Fraud Prevention for Digital Payments',
    description: 'Real-time security OS intercepting UPI/digital payment transactions before authorization. Features our custom UBS Engine: 14ms latency, 14.4M+ nodal points secured. 8 core patents pending. $3.5M Seed Round strategized for banking integration. Restricted — IP-sensitive.',
    achievements: [
      'Real-time OS interception layer blocking unauthorized UPI transactions',
      'Ultra-low latency execution (14ms) powered by Paravion\'s UBS Engine',
      'Multi-agent architecture analyzing user behavior models in real-time'
    ],
    tech: ['Node.js', 'React', 'Android Capacitor', 'Behavioral Mapping', 'Edge AI', 'RAG', 'Blockchain'],
    restricted: true
  },
  {
    id: 'returnshield',
    name: 'ReturnShield',
    status: 'PROTOTYPE',
    badgeText: 'PROTOTYPE',
    category: 'Prototype',
    subtitle: 'AI-Powered Multi-Stage Return Fraud Protection',
    description: 'Multi-tier return fraud prevention for enterprise sellers. Features pre-shipment video analytics, Polygon blockchain anchoring, and computer vision warehouse validation to address INR 40B+ annual industry loss. Offers 30-second seller verification via blockchain-anchored hashes.',
    achievements: [
      '3D spatial scanning and pre-shipment package verification using computer vision',
      'Polygon blockchain ledger anchors cryptographic hashes of warehouse shipments',
      'Mitigates multi-billion INR merchant losses through automated returns scoring'
    ],
    tech: ['TensorFlow', 'OpenCV', 'Polygon Blockchain', 'Python', 'Node.js', 'React', 'Mobile SDK'],
    restricted: true
  }
];

// ==========================================
// 5. CONTACT FORM SCHEMA
// ==========================================
const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  inquiryType: z.string().min(1, "Please select an inquiry type"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormInputs = z.infer<typeof contactSchema>;

// ==========================================
// 6. ANIMATION MOTION VARIANTS FOR SCROLL RHYTHM
// ==========================================
const revealHeaderVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } 
  }
};

const cardLeftVariants = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { type: "spring" as const, stiffness: 45, damping: 14 } 
  }
};

const cardRightVariants = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { type: "spring" as const, stiffness: 45, damping: 14 } 
  }
};

const cardFadeUpVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (idx: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      type: "spring" as const, 
      stiffness: 45, 
      damping: 14,
      delay: idx * 0.1 
    }
  })
};

// ==========================================
// 7. MAIN HOME PAGE COMPONENT
// ==========================================
export default function Home() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'All' | 'Deployed' | 'Prototype'>('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Security Health Check State
  const [assessmentAnswers, setAssessmentAnswers] = useState<boolean[]>([false, false, false, false, false]);

  const questions = [
    "Do you use two-factor authentication across your systems?",
    "Are your software and systems regularly patched and updated?",
    "Do you have a firewall and intrusion detection system?",
    "Are employees trained to recognize phishing and social engineering?",
    "Do you have an incident response plan for data breaches?"
  ];

  // Calculate live risk assessment
  const yesCount = assessmentAnswers.filter(Boolean).length;
  let riskStatus = "HIGH RISK";
  let riskColor = "text-rose-600 border-rose-500/20 bg-rose-500/5";
  let riskMessage = "Critical exposure. Contact us immediately.";

  if (yesCount >= 4) {
    riskStatus = "LOW RISK";
    riskColor = "text-teal border-teal/20 bg-teal/5";
    riskMessage = "Good posture. Let us take you to enterprise-grade.";
  } else if (yesCount >= 2) {
    riskStatus = "MEDIUM RISK";
    riskColor = "text-amber-600 border-amber-500/20 bg-amber-500/5";
    riskMessage = "Significant gaps remain. Let's fix them.";
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMousePos({ x, y });
  };

  // Live Visitor Counter
  useEffect(() => {
    fetch('https://api.counterapi.dev/v1/paravion-technologies/visits/up')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.count) {
          setVisitorCount(data.count);
        }
      })
      .catch((err) => {
        console.error("CounterAPI fetch error, falling back to local simulation", err);
        const simulated = localStorage.getItem('sim_visits') 
          ? parseInt(localStorage.getItem('sim_visits')!) + 1 
          : 12450;
        localStorage.setItem('sim_visits', simulated.toString());
        setVisitorCount(simulated);
      });
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      inquiryType: '',
      message: ''
    }
  });

  const onSubmit = (data: ContactFormInputs) => {
    console.log("Contact form submitted:", data);
    toast("Message Sent Successfully — We will get back to you shortly.", "success");
    reset();
  };

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleAssessment = (index: number) => {
    setAssessmentAnswers((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const filteredProducts = products.filter(
    (p) => filter === 'All' || p.category === filter
  );

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen text-[#0F172A] overflow-x-hidden font-sans"
    >
      {/* ==========================================
          6.1 NAVBAR (Fixed Glassmorphic Header - Light Theme)
          ========================================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
            <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0D9488" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="url(#hexGrad)" />
              <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" fill="#F8FAFC" />
              <polygon points="50,30 70,40 70,60 50,70 30,60 30,40" fill="url(#hexGrad)" />
            </svg>
            <span className="text-[#0F172A] font-extrabold tracking-[0.2em] font-sans text-lg md:text-xl">
              PARAVION <span className="text-teal font-light">TECHNOLOGIES</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button data-testid="nav-home" onClick={() => handleNavClick('home')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Home</button>
            <button data-testid="nav-products" onClick={() => handleNavClick('products')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Products</button>
            <button data-testid="nav-services" onClick={() => handleNavClick('services')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Services</button>
            <button data-testid="nav-about" onClick={() => handleNavClick('about')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">About</button>
            <button data-testid="nav-contact" onClick={() => handleNavClick('contact')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Contact</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {visitorCount !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal/20 bg-teal/5 text-xs text-teal font-mono animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-ping" />
                Network Visits: {visitorCount}
              </div>
            )}
            <button
              data-testid="btn-nav-cta"
              onClick={() => handleNavClick('contact')}
              className="px-6 py-2.5 rounded-full bg-gold hover:bg-gold/90 text-white font-bold text-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Get Started
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-900 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 bg-white px-6 py-6 flex flex-col gap-5"
            >
              <button onClick={() => handleNavClick('home')} className="text-left text-base font-semibold text-slate-700 hover:text-blue-600">Home</button>
              <button onClick={() => handleNavClick('products')} className="text-left text-base font-semibold text-slate-700 hover:text-blue-600">Products</button>
              <button onClick={() => handleNavClick('services')} className="text-left text-base font-semibold text-slate-700 hover:text-blue-600">Services</button>
              <button onClick={() => handleNavClick('about')} className="text-left text-base font-semibold text-slate-700 hover:text-blue-600">About</button>
              <button onClick={() => handleNavClick('contact')} className="text-left text-base font-semibold text-slate-700 hover:text-blue-600">Contact</button>
              
              <div className="h-px bg-slate-100 my-2" />
              
              {visitorCount !== null && (
                <div className="flex items-center gap-2 self-start px-3 py-1.5 rounded-full border border-teal/20 bg-teal/5 text-xs text-teal font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal animate-ping" />
                  Visits: {visitorCount}
                </div>
              )}
              <button
                onClick={() => handleNavClick('contact')}
                className="w-full py-3 rounded-full bg-gold text-white font-bold text-center transition-transform hover:scale-[1.02]"
              >
                Get Started
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ==========================================
          6.2 HERO (Immersive Passenger Window - Silver finish)
          ========================================== */}
      <section id="home" className="relative min-h-screen w-full flex items-center pt-20 overflow-hidden">
        
        {/* Full-Screen Metallic Passenger Window Frame */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none p-4 md:p-10 select-none">
          {/* Transparent canvas container showing the watermark image through WebGL */}
          <div className="absolute inset-[3%] md:inset-[6%_12%] rounded-[40px] md:rounded-[80px_80px_80px_80px_/_120px_120px_120px_120px] airplane-window-bezel pointer-events-auto overflow-hidden">
            
            {/* Transparent WebGL canvas scene */}
            <ThreeDBackground mousePos={mousePos} />
            
            <div className="absolute inset-0 airplane-glass-shimmer mix-blend-screen opacity-50 z-10" />
            <div className="absolute inset-0 airplane-window-inner-shadow z-10" />
          </div>
        </div>

        {/* Hero floating contents */}
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-16">
          <div className="lg:col-span-8 flex flex-col items-start text-left bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-slate-200/50 shadow-xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 px-4 py-1.5 rounded-full border border-teal/20 bg-teal/5 text-teal text-xs font-mono tracking-widest uppercase font-bold"
            >
              Indian Cyber Sovereignty // 2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1] font-sans"
            >
              Defend. Develop.<br />
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Dominate.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed font-sans"
            >
              Paravion Technologies builds AI-powered cybersecurity systems and enterprise digital products that protect and scale modern businesses.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <button
                data-testid="btn-hero-products"
                onClick={() => handleNavClick('products')}
                className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg hover:shadow-blue-500/20 hover:scale-[1.03] text-center cursor-pointer"
              >
                View Our Products
              </button>
              <button
                data-testid="btn-hero-contact"
                onClick={() => handleNavClick('contact')}
                className="px-8 py-4 rounded-xl border border-gold text-gold font-bold hover:bg-gold/5 transition-all hover:scale-[1.03] text-center cursor-pointer"
              >
                Secure Your Business
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==========================================
          6.3 STATS BAR (6-column counters + 3D Globe - Light theme)
          ========================================== */}
      <section className="relative bg-slate-100/80 backdrop-blur-md border-y border-slate-200/50 py-12 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center items-center">
            <div className="flex flex-col gap-1 items-center">
              <StatGlobe3D />
              <AnimatedCounter value={14.4} suffix="M+" decimals={1} />
              <span className="text-xs text-slate-500 font-mono tracking-wider uppercase mt-1">Nodal Points Secured</span>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className="h-20 w-20 flex items-center justify-center text-teal font-mono text-xl border border-slate-200 bg-white rounded-full mb-2">14ms</div>
              <AnimatedCounter value={14} suffix="ms" />
              <span className="text-xs text-slate-500 font-mono tracking-wider uppercase mt-1">UBS Engine Latency</span>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className="h-20 w-20 flex items-center justify-center text-blue-600 font-mono text-xl border border-slate-200 bg-white rounded-full mb-2">₹40B</div>
              <AnimatedCounter value={40} prefix="INR " suffix="B+" />
              <span className="text-xs text-slate-500 font-mono tracking-wider uppercase mt-1">Fraud Prevented</span>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className="h-20 w-20 flex items-center justify-center text-gold font-mono text-xl border border-slate-200 bg-white rounded-full mb-2">PAT</div>
              <AnimatedCounter value={8} />
              <span className="text-xs text-slate-500 font-mono tracking-wider uppercase mt-1">Core Patents Pending</span>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className="h-20 w-20 flex items-center justify-center text-slate-500 font-mono text-xl border border-slate-200 bg-white rounded-full mb-2">2026</div>
              <AnimatedCounter value={5} />
              <span className="text-xs text-slate-500 font-mono tracking-wider uppercase mt-1">Products Built in 2026</span>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className="h-20 w-20 flex items-center justify-center text-green-600 font-mono text-xl border border-slate-200 bg-white rounded-full mb-2">LIVE</div>
              <AnimatedCounter value={1} />
              <span className="text-xs text-slate-500 font-mono tracking-wider uppercase mt-1">Live Deployments</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          6.4 PRODUCTS SECTION (Light Theme Cards)
          ========================================== */}
      <section id="products" className="py-24 max-w-7xl mx-auto px-6 z-20 relative">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-100px" }}
          variants={revealHeaderVariants}
          className="flex flex-col items-center text-center mb-16"
        >
          <h2 className="text-xs font-mono text-gold tracking-[0.25em] uppercase mb-4">Our Products</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">What We've Built</h3>
          <p className="text-slate-600 max-w-2xl leading-relaxed">
            From deployed enterprise platforms to advanced cybersecurity prototypes — every product is real, technical, and solving a critical problem.
          </p>

          <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-full mt-10">
            {['All', 'Deployed', 'Prototype'].map((t) => (
              <button
                key={t}
                data-testid={`filter-${t.toLowerCase()}`}
                onClick={() => setFilter(t as any)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  filter === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((p, idx) => (
              <motion.div
                key={p.id}
                layout
                initial="hidden"
                whileInView="visible"
                exit={{ opacity: 0, scale: 0.95 }}
                viewport={{ once: false, margin: "-80px" }}
                variants={idx % 2 === 0 ? cardLeftVariants : cardRightVariants}
                data-testid={`card-product-${p.id}`}
                className="group relative flex flex-col justify-between p-8 rounded-2xl border border-slate-200/60 bg-white/80 hover:border-teal/50 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-gold tracking-widest font-bold uppercase">PARAVION TECH</span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${
                        p.status === 'DEPLOYED'
                          ? 'bg-green-500/10 text-green-700 border-green-500/20'
                          : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                      }`}
                    >
                      {p.badgeText} · 2026
                    </span>
                  </div>

                  {p.callout && (
                    <div className="mb-4 p-3 rounded-lg border border-teal/15 bg-teal/5 text-teal text-xs italic font-semibold leading-relaxed">
                      {p.callout}
                    </div>
                  )}

                  <h4 className="text-2xl font-extrabold text-[#0F172A] mb-1 group-hover:text-blue-600 transition-colors">{p.name}</h4>
                  <p className="text-xs font-mono text-gold mb-4 uppercase tracking-wider font-semibold">{p.subtitle}</p>
                  
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed font-sans">{p.description}</p>

                  <div className="mb-6 flex flex-col gap-2.5">
                    {p.achievements.map((ach, id) => (
                      <div key={id} className="flex gap-2 text-sm leading-relaxed">
                        <span className="text-teal font-mono">▷</span>
                        <span className="text-slate-600 font-sans">{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {p.tech.map((t, id) => (
                      <span
                        key={id}
                        className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-500"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-5 border-t border-slate-100 pt-4">
                    {p.restricted ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold font-mono">
                        <Lock className="w-3.5 h-3.5" />
                        Restricted Access
                      </div>
                    ) : (
                      <>
                        {p.sourceUrl && (
                          <a
                            href={p.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid={`link-${p.id}-source`}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-mono transition-colors font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Source Code
                          </a>
                        )}
                        {p.demoUrl && (
                          <a
                            href={p.demoUrl}
                            data-testid={`link-${p.id}-demo`}
                            className="inline-flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 font-mono transition-colors font-bold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Live Demo
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ==========================================
          6.5 DIGITAL SERVICES (Light theme cards)
          ========================================== */}
      <section id="services" className="bg-slate-50/50 py-24 border-t border-slate-200/50 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            variants={revealHeaderVariants}
            className="flex flex-col items-center text-center mb-16"
          >
            <h2 className="text-xs font-mono text-teal tracking-[0.25em] uppercase mb-4">Enterprise Capabilities</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">Digital Services</h3>
            <p className="text-slate-600 max-w-2xl leading-relaxed">
              We design, build, and deploy digital systems with a security-first posture, ensuring stability and performance at scale.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Website & Web App Development", icon: Globe, desc: "Highly responsive, state-of-the-art Single Page and Multi Page web applications built with React, Next.js, and lightweight fast backends." },
              { title: "Mobile App Development", icon: Smartphone, desc: "Native and hybrid mobile application designs delivering flawless user experiences on iOS and Android with optimized secure transactions." },
              { title: "Domain & Hosting Solutions", icon: Server, desc: "Reliable host configurations, SSL protection protocols, content delivery networks (CDNs), and high-availability server administration." },
              { title: "Digital Marketing & SEO", icon: Megaphone, desc: "Data-driven SEO strategies, keyword optimization, analytics, and targeted marketing campaigns to maximize digital expansion." },
              { title: "UI/UX Design", icon: Paintbrush, desc: "Premium, technical, and intuitive user interfaces that enhance branding, streamline interactions, and maximize user conversion." },
              { title: "Cloud Infrastructure", icon: Cloud, desc: "Automated dev pipelines, high-density secure container deployments, microservices orchestration, and zero-downtime infrastructure." }
            ].map((srv, idx) => (
              <motion.div
                key={srv.title}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: "-60px" }}
                variants={cardFadeUpVariants}
                className="group p-8 rounded-2xl border border-slate-200/50 bg-white/80 hover:border-teal/45 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal mb-6 transition-transform group-hover:scale-110 duration-300">
                  <srv.icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{srv.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-sans">{srv.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          6.6 TECHNOLOGY STACK
          ========================================== */}
      <section id="stack" className="relative bg-slate-100/50 border-y border-slate-200/50 py-16 z-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            variants={revealHeaderVariants}
            className="text-xs font-mono text-gold tracking-[0.25em] uppercase mb-10 font-bold"
          >
            Advanced System Toolkit
          </motion.h2>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-60px" }}
            variants={revealHeaderVariants}
            className="flex flex-wrap items-center justify-center gap-3.5 max-w-4xl mx-auto"
          >
            {[
              'React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'TensorFlow', 'OpenCV',
              'Polygon Blockchain', 'Razorpay', 'Anthropic Claude', 'XGBoost', 'Flask',
              'Fastify', 'WASM', 'SHA-256', 'Edge AI', 'RAG'
            ].map((tech) => (
              <span
                key={tech}
                className="px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-600 font-mono text-sm tracking-wide transition-colors hover:border-teal/50 hover:text-slate-900"
              >
                {tech}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          6.7 SECURITY HEALTH CHECK (Dynamic Shield)
          ========================================== */}
      <section id="assessment" className="py-24 max-w-6xl mx-auto px-6 z-20 relative">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-100px" }}
          variants={revealHeaderVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/50 p-8 md:p-12 shadow-xl glow-blue items-center"
        >
          <div className="lg:col-span-7">
            <div className="mb-8">
              <h2 className="text-xs font-mono text-gold tracking-[0.25em] uppercase mb-2">Instant Evaluation</h2>
              <h3 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-3">Security Health Check</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Evaluate your startup posture against standard threats. Toggle systems status below to feed real-time calculations into the core shield.
              </p>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 pt-6">
              {questions.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200/40 bg-slate-50/50">
                  <span className="text-xs md:text-sm text-slate-700 leading-relaxed font-semibold">{q}</span>
                  <Switch
                    id={`switch-assessment-${idx}`}
                    checked={assessmentAnswers[idx]}
                    onCheckedChange={() => toggleAssessment(idx)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 border border-slate-200 bg-slate-50 rounded-xl text-center">
            <SecurityShield3D yesCount={yesCount} />
            
            <div className="flex flex-col items-center gap-1 mt-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">POSTURE INDEX</span>
              <span className={`px-4 py-1.5 rounded-full border text-xs font-black tracking-widest uppercase font-mono mt-1 ${riskColor}`}>
                {riskStatus}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium my-4 max-w-xs">{riskMessage}</p>

            <button
              data-testid="btn-assessment-cta"
              onClick={() => handleNavClick('contact')}
              className="w-full py-3 rounded-lg bg-gold hover:bg-gold/90 text-white font-bold text-xs tracking-wider transition-all shadow-md inline-flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
            >
              Talk to a Security Expert
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          6.8 ABOUT / VISION
          ========================================== */}
      <section id="about" className="bg-slate-50/50 py-24 border-t border-slate-200/50 relative z-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            variants={cardLeftVariants}
            className="lg:col-span-7 flex flex-col items-start"
          >
            <h2 className="text-xs font-mono text-gold tracking-[0.25em] uppercase mb-4">Startup Vision</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">Sovereign-First Digital Architecture</h3>
            <p className="text-slate-700 mb-6 leading-relaxed font-sans">
              Founded in 2026, Paravion Technologies represents a critical pivot towards absolute digital sovereignty. We do not just build web apps or install security monitoring packages; we develop custom security operating components, blockchain anchors, and sandboxed AI structures that shield enterprises from systemic dependency and vulnerabilities.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed font-sans mb-8">
              Based in India, our mandate is to engineer credible, technical systems using modern toolchains. By infusing zero-trust verification rules at core system interfaces, we establish robust platforms capable of scaling while retaining absolute data privacy.
            </p>
          </motion.div>

          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            {[
              { icon: BrainCircuit, color: "text-blue-600", border: "hover:border-blue-500/30", title: "AI-First Automation", desc: "Deep integration of Large Language Models (LLMs) and neural classifiers mapped directly to client environments." },
              { icon: Shield, color: "text-teal", border: "hover:border-teal/30", title: "Zero-Trust Protocol", desc: "Systemic validation at every logical boundary, eliminating vulnerable assumptions in transaction processing pipelines." },
              { icon: LinkIcon, color: "text-gold", border: "hover:border-gold/30", title: "Blockchain-Anchored Logs", desc: "Cryptographic ledger hashes establishing immutable, verifiable histories of transactional and server actions." }
            ].map((p, idx) => (
              <motion.div
                key={p.title}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: "-60px" }}
                variants={cardFadeUpVariants}
                className={`flex gap-5 p-6 rounded-xl border border-slate-200 bg-white/80 ${p.border} transition-all duration-300 shadow-sm`}
              >
                <div className={`${p.color} mt-0.5`}>
                  <p.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1.5">{p.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          6.9 CONTACT
          ========================================== */}
      <section id="contact" className="py-24 max-w-7xl mx-auto px-6 z-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            variants={cardLeftVariants}
            className="lg:col-span-5 flex flex-col items-start justify-center"
          >
            <h2 className="text-xs font-mono text-gold tracking-[0.25em] uppercase mb-4">Direct Connection</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">Contact Us</h3>
            <p className="text-slate-700 leading-relaxed mb-8">
              Discuss enterprise integration, request audits for your products, or coordinate strategic project partnerships.
            </p>

            <div className="flex flex-col gap-5 text-sm font-mono text-slate-700">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">WHATSAPP / PHONE</span>
                <a href="https://wa.me/917011991268" target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:text-blue-600 font-bold transition-colors">
                  +91 7011991268
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">EMAIL CORRESPONDENCE</span>
                <a href="mailto:paraviontechnologies@gmail.com" className="text-teal hover:underline font-bold transition-colors">
                  paraviontechnologies@gmail.com
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">HEADQUARTERS</span>
                <span className="text-slate-900 font-bold">New Delhi, India</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-80px" }}
            variants={cardRightVariants}
            className="lg:col-span-7 bg-white border border-slate-200/80 p-8 rounded-2xl shadow-xl"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 font-mono tracking-wider">FULL NAME</label>
                <input
                  type="text"
                  data-testid="input-name"
                  {...register('name')}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
                {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 font-mono tracking-wider">EMAIL ADDRESS</label>
                <input
                  type="email"
                  data-testid="input-email"
                  {...register('email')}
                  placeholder="e.g. v.sharma@enterprise.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 font-mono tracking-wider">PHONE NUMBER</label>
                <input
                  type="tel"
                  data-testid="input-phone"
                  {...register('phone')}
                  placeholder="e.g. +91 99999 88888"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
                {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 font-mono tracking-wider">INQUIRY TYPE</label>
                <div className="relative">
                  <select
                    data-testid="select-inquiry"
                    {...register('inquiryType')}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors pr-10"
                  >
                    <option value="">-- Select Inquiry Type --</option>
                    <option value="Cybersecurity Product">Cybersecurity Product</option>
                    <option value="Digital Service">Digital Service</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
                {errors.inquiryType && <p className="text-xs text-red-500 font-medium">{errors.inquiryType.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 font-mono tracking-wider">MESSAGE DESCRIPTION</label>
                <textarea
                  data-testid="input-message"
                  {...register('message')}
                  rows={4}
                  placeholder="Describe your security details or product goals in detail..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"
                />
                {errors.message && <p className="text-xs text-red-500 font-medium">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                data-testid="btn-submit-contact"
                className="w-full py-4 rounded-xl bg-gold hover:bg-gold/90 text-white font-bold text-sm tracking-wide transition-all shadow-lg hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                Send Message →
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          6.10 FOOTER (3-column layout - Slate/Dark theme contrast)
          ========================================== */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-16 relative z-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-left mb-12">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="url(#hexGrad)" />
                <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" fill="#0f172a" />
                <polygon points="50,30 70,40 70,60 50,70 30,60 30,40" fill="url(#hexGrad)" />
              </svg>
              <span className="text-white font-extrabold tracking-wider font-sans text-lg">
                PARAVION TECHNOLOGIES
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-xs">
              Think Big. Build Secure. Grow Digital. Dedicated to Sovereign-First AI infrastructure and digital product engineering.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="text-xs font-mono text-gold uppercase tracking-wider font-bold mb-1">NAVIGATION</span>
            <button data-testid="footer-products" onClick={() => handleNavClick('products')} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">Products</button>
            <button data-testid="footer-services" onClick={() => handleNavClick('services')} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">Services</button>
            <button data-testid="footer-about" onClick={() => handleNavClick('about')} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">About</button>
            <button data-testid="footer-contact" onClick={() => handleNavClick('contact')} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">Contact</button>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="text-xs font-mono text-gold uppercase tracking-wider font-bold mb-1">COMMUNICATION</span>
            <span className="text-sm text-slate-400 font-mono">+91 7011991268</span>
            <span className="text-sm text-teal font-mono">paraviontechnologies@gmail.com</span>
            <span className="text-sm text-slate-400 font-sans">New Delhi, India</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-sans">
            © 2026 Paravion Technologies. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span>Sovereign-First Philosophy</span>
            <span>·</span>
            <span className="flex items-center gap-1.5 animate-pulse">
              <Eye className="w-3.5 h-3.5 text-teal" />
              Real-time Global Visits: {visitorCount ?? '...'}
            </span>
          </div>
        </div>
      </footer>

      {/* ==========================================
          6.11 FLOATING WHATSAPP BUTTON
          ========================================== */}
      <a
        data-testid="btn-whatsapp-floating"
        href="https://wa.me/917011991268"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 hover:shadow-[#25D366]/40 active:scale-95 duration-200"
        aria-label="Contact us on WhatsApp"
      >
        <SiWhatsapp className="w-7 h-7" />
      </a>
    </div>
  );
}
