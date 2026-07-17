import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Globe,
  Smartphone,
  Server,
  Megaphone,
  BrainCircuit,
  Shield,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  Eye,
  Image as ImageIcon,
  BookOpen,
  HelpCircle,
  Upload,
  User,
  Mail,
  Phone,
  Printer,
  Copy
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { useToast } from '../components/ui/toast';

// ==========================================
// ANIMATION MOTION VARIANTS FOR SCROLL RHYTHM
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
// 1. THREE.JS 3D FLOATING CUBE FIELD BACKDROP
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
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    // Dark fog to fade cubes into black space
    scene.fog = new THREE.FogExp2(0x000000, 0.025);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 3.5, 45); // light core power
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 1.0);
    topLight.position.set(5, 10, 8);
    scene.add(topLight);

    // 3D Metallic/Glass Cubes
    const cubeCount = window.innerWidth < 768 ? 20 : 45;
    const cubesGroup = new THREE.Group();
    const cubeGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    
    // Premium Metallic/Rough glass material for cubes
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.9,
      roughness: 0.15,
      transparent: true,
      opacity: 0.45
    });

    const cubeData: {
      mesh: THREE.Mesh;
      speedX: number;
      speedY: number;
      speedZ: number;
      rotX: number;
      rotY: number;
    }[] = [];

    for (let i = 0; i < cubeCount; i++) {
      const scale = Math.random() * 0.9 + 0.3;
      const mesh = new THREE.Mesh(cubeGeom, cubeMaterial.clone()); // separate material instance to vary specs
      mesh.scale.set(scale, scale, scale);
      
      mesh.position.set(
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 20 - 5
      );
      
      cubesGroup.add(mesh);
      cubeData.push({
        mesh,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        speedZ: Math.random() * 0.4 + 0.15, // float forward
        rotX: (Math.random() - 0.5) * 0.5 + 0.2,
        rotY: (Math.random() - 0.5) * 0.4 + 0.2
      });
    }
    scene.add(cubesGroup);

    // Light Core Mesh (Rotating wireframe sphere inside light core)
    const coreGeom = new THREE.IcosahedronGeometry(1.0, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const lightCore = new THREE.Mesh(coreGeom, coreMat);
    scene.add(lightCore);

    // Dual wireframe orbits around the core
    const orbitRingGeom1 = new THREE.TorusGeometry(1.8, 0.02, 6, 24);
    const orbitRingGeom2 = new THREE.TorusGeometry(2.2, 0.015, 6, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.25 });
    
    const ring1 = new THREE.Mesh(orbitRingGeom1, ringMat);
    const ring2 = new THREE.Mesh(orbitRingGeom2, ringMat);
    
    ring1.rotation.x = Math.PI / 4;
    ring2.rotation.y = Math.PI / 3;
    
    scene.add(ring1);
    scene.add(ring2);

    // Particle streaks radiating outward from core (Emulate light warp)
    const particleCount = window.innerWidth < 768 ? 30 : 65;
    const particleGeom = new THREE.BufferGeometry();
    const partPositions = new Float32Array(particleCount * 3);
    const partSpeeds: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      partPositions[i * 3] = 0;
      partPositions[i * 3 + 1] = 0;
      partPositions[i * 3 + 2] = 0;
      partSpeeds.push(Math.random() * 4 + 1.5);
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));
    const partMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.7
    });

    const particles = new THREE.Points(particleGeom, partMaterial);
    scene.add(particles);

    // Animation loop variables
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Lerp scroll ratio
      scrollRef.current.current = THREE.MathUtils.lerp(
        scrollRef.current.current,
        scrollRef.current.target,
        0.05
      );
      const sr = scrollRef.current.current;

      // Color interpolation: Cyan (Digital) -> Amber (Printing)
      const cyanColor = new THREE.Color(0x06b6d4);
      const amberColor = new THREE.Color(0xf59e0b);
      
      // Interpolate theme color based on page scroll depth
      const currentThemeColor = new THREE.Color().copy(cyanColor).lerp(
        amberColor, 
        THREE.MathUtils.clamp((sr - 0.4) * 2.5, 0, 1)
      );

      // Apply theme color interpolation
      pointLight.color.copy(currentThemeColor);
      coreMat.color.copy(currentThemeColor);
      ringMat.color.copy(currentThemeColor);
      
      // Rotate core and orbit rings
      lightCore.rotation.y += delta * 0.3;
      lightCore.rotation.x += delta * 0.15;
      ring1.rotation.z += delta * 0.1;
      ring2.rotation.z -= delta * 0.15;

      // Expand particle streaks
      const positions = particleGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const speed = partSpeeds[i] * delta * (1.0 + sr * 3.0);
        
        positions[i * 3] += Math.cos(angle) * speed;
        positions[i * 3 + 1] += Math.sin(angle) * speed;
        positions[i * 3 + 2] += (i % 2 === 0 ? 1 : -1) * 0.1 * speed;

        const dist = Math.sqrt(positions[i * 3] ** 2 + positions[i * 3 + 1] ** 2);
        if (dist > 12) {
          positions[i * 3] = 0;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = 0;
        }
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Drift and rotate cubes
      cubeData.forEach((cube) => {
        cube.mesh.position.z += delta * cube.speedZ * (1.0 + sr * 2.5);
        cube.mesh.position.x += delta * cube.speedX;
        cube.mesh.position.y += delta * cube.speedY;

        cube.mesh.rotation.x += delta * cube.rotX;
        cube.mesh.rotation.y += delta * cube.rotY;

        // Apply interpolated color to cubes
        if (cube.mesh.material instanceof THREE.MeshStandardMaterial) {
          cube.mesh.material.color.copy(currentThemeColor);
        }

        // Loop cube boundary
        if (cube.mesh.position.z > 8) {
          cube.mesh.position.z = -18;
          cube.mesh.position.x = (Math.random() - 0.5) * 28;
          cube.mesh.position.y = (Math.random() - 0.5) * 16;
        }
      });

      // Camera parallax movement
      const targetCamX = mouseRef.current.x * 2.0;
      const targetCamY = mouseRef.current.y * 1.5 - sr * 6.0; // Panning camera down with scroll
      const targetCamZ = 14 - sr * 4.0; // Zooming camera closer

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
// BULK PRINT QUOTE SCHEMAS
// ==========================================
const printQuoteSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  productType: z.string().min(1, "Product type selection is required"),
  quantity: z.number().min(1, "Quantity must be at least 1 unit"),
  deadline: z.string().min(1, "Delivery timeline target is required"),
  finishOption: z.string().min(1, "Please select a materials finish")
});

type PrintQuoteFormInputs = z.infer<typeof printQuoteSchema>;

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function Home() {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMousePos({ x, y });
  };

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Bulk Print Quoting Form Hooks
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PrintQuoteFormInputs>({
    resolver: zodResolver(printQuoteSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      productType: '',
      quantity: 1,
      deadline: '',
      finishOption: ''
    }
  });

  const onSubmitQuote = (data: PrintQuoteFormInputs) => {
    console.log("Bulk Printing Quote Request:", data);
    toast("Quote Request Submitted Successfully — A printing coordinator will call you back within 2 hours.", "success");
    reset();
  };

  const faqs = [
    { q: "Do you have a minimum order quantity?", a: "No minimum order quantity! We accept single-page print and photocopy runs as well as high-volume spiral binding tasks." },
    { q: "Do you offer formatting and layout support?", a: "Yes! Our team helps size custom photos, convert files to PDF format, and set up documents to ensure clean margins for spiral binding." },
    { q: "What are your turnaround times?", a: "Photocopy, lamination, and spiral binding are completed same-day or within 24 hours. Digital design projects (websites, apps) range from 1 to 4 weeks." },
    { q: "What paper sizes and finishes do you support?", a: "We print and photocopy on A3, A4, and A5 paper sizes. Lamination and photo prints are available in both glossy and matte finishes." }
  ];

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-black text-[#FAFAFA] overflow-x-hidden font-sans select-none"
    >
      {/* HUD Edge Graphics */}
      <div className="fixed top-1/3 right-6 z-40 writing-mode-vertical hidden lg:flex items-center gap-3 text-[10px] font-mono text-zinc-500 tracking-[0.2em] pointer-events-none select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
        SYSTEM ACTIVE // SECTOR: DIGITAL_PRINT_2026
      </div>

      {/* ==========================================
          GLOBAL VIEWPORT FIXED 3D BACKGROUND
          ========================================== */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
        <ThreeDBackground mousePos={mousePos} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 pointer-events-none" />
      </div>

      {/* ==========================================
          NAVBAR (Fixed Cinematic Dark Panel)
          ========================================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="navHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="url(#navHexGrad)" />
              <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" fill="#000000" />
              <polygon points="50,30 70,40 70,60 50,70 30,60 30,40" fill="url(#navHexGrad)" />
            </svg>
            <span className="text-white font-extrabold tracking-[0.25em] font-sans text-lg">
              PARAVION <span className="text-teal font-light">TECHNOLOGIES</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => handleNavClick('home')} className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">Home</button>
            <button onClick={() => handleNavClick('digital-section')} className="text-xs font-semibold text-zinc-400 hover:text-teal transition-colors uppercase tracking-widest">Digital Services</button>
            <button onClick={() => handleNavClick('print-section')} className="text-xs font-semibold text-zinc-400 hover:text-gold transition-colors uppercase tracking-widest">Printing Services</button>
            <button onClick={() => handleNavClick('about')} className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">About</button>
            <button onClick={() => handleNavClick('contact')} className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">Contact</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => handleNavClick('quote-form')}
              className="px-6 py-2.5 rounded bg-zinc-900 border border-zinc-800 text-white font-semibold text-xs tracking-wider uppercase hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Order Portal
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
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
              className="md:hidden border-t border-zinc-900 bg-black px-6 py-6 flex flex-col gap-5"
            >
              <button onClick={() => handleNavClick('home')} className="text-left text-sm uppercase tracking-widest font-semibold text-zinc-400">Home</button>
              <button onClick={() => handleNavClick('digital-section')} className="text-left text-sm uppercase tracking-widest font-semibold text-zinc-400">Digital Services</button>
              <button onClick={() => handleNavClick('print-section')} className="text-left text-sm uppercase tracking-widest font-semibold text-zinc-400">Printing Services</button>
              <button onClick={() => handleNavClick('about')} className="text-left text-sm uppercase tracking-widest font-semibold text-zinc-400">About</button>
              <button onClick={() => handleNavClick('contact')} className="text-left text-sm uppercase tracking-widest font-semibold text-zinc-400">Contact</button>
              <button onClick={() => handleNavClick('quote-form')} className="w-full py-3 rounded bg-zinc-900 border border-zinc-800 text-white font-bold text-center text-xs tracking-widest uppercase">Order Portal</button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ==========================================
          HERO SECTION (Split Headline layout)
          ========================================== */}
      <section id="home" className="relative min-h-screen w-full flex items-center pt-20 overflow-hidden bg-transparent">
        
        {/* Corner HUD marks */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div className="hud-corner-br" />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col justify-center min-h-[80vh]">
          {/* Split Headline Design */}
          <div className="flex flex-col items-start gap-1 mb-8">
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none"
            >
              EXPERIENCE THE
            </motion.h1>
            <motion.h1 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              className="text-5xl md:text-8xl lg:text-9xl font-black text-transparent bg-gradient-to-r from-teal-400 to-amber-500 bg-clip-text tracking-tighter leading-none self-end"
            >
              IMPOSSIBLE.
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl text-zinc-400 text-sm md:text-base leading-relaxed mb-12 self-start border-l border-zinc-800 pl-6"
          >
            Paravion Technologies is a premier printing, photocopy, and digital services studio delivering high-quality outputs and responsive web solutions.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 z-20"
          >
            <button
              onClick={() => handleNavClick('digital-section')}
              className="px-8 py-4 rounded bg-teal text-black font-extrabold text-xs uppercase tracking-widest hover:bg-teal-400 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-teal/20"
            >
              Explore Digital Services
            </button>
            <button
              onClick={() => handleNavClick('print-section')}
              className="px-8 py-4 rounded border border-gold text-gold font-extrabold text-xs uppercase tracking-widest hover:bg-gold/5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-gold/10"
            >
              Explore Printing Shop
            </button>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          INTRO / DIVISIONS SECTION (01 / 02 Blocks)
          ========================================== */}
      <section className="py-24 max-w-7xl mx-auto px-6 z-20 relative border-t border-zinc-900 bg-black/60 backdrop-blur-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-5">
            <h2 className="text-xs font-mono text-zinc-500 tracking-[0.25em] uppercase mb-4">Core Architecture</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Two Divisions.<br />One Integrated Output.</h3>
          </div>
          <div className="lg:col-span-7">
            <p className="text-zinc-400 text-sm leading-relaxed">
              We operate through two main creative divisions that work hand in hand. By combining custom website and app engineering with high-quality printing, photocopy, and binding pipelines, we handle all your digital and physical production needs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Division 01 */}
          <div className="p-8 rounded border border-zinc-950 bg-zinc-950/40 flex flex-col justify-between group hover:border-teal/30 transition-all duration-300">
            <div>
              <span className="text-6xl font-mono text-teal/10 font-bold block mb-6 group-hover:text-teal/25 transition-colors">01</span>
              <h4 className="text-xl font-bold text-white mb-3">Digital Services</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Responsive modern website design, mobile app development, domain and hosting setup, and digital marketing to grow your brand online.
              </p>
            </div>
            <button onClick={() => handleNavClick('digital-section')} className="text-xs text-teal font-mono tracking-widest uppercase inline-flex items-center gap-2 mt-8 hover:underline">
              Enter Digital Sector <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Division 02 */}
          <div className="p-8 rounded border border-zinc-950 bg-zinc-950/40 flex flex-col justify-between group hover:border-gold/30 transition-all duration-300">
            <div>
              <span className="text-6xl font-mono text-gold/10 font-bold block mb-6 group-hover:text-gold/25 transition-colors">02</span>
              <h4 className="text-xl font-bold text-white mb-3">Printing & Photocopy Shop</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Document printing, photocopy, protective lamination, professional spiral binding, and glossy/matte photo printing of all sizes.
              </p>
            </div>
            <button onClick={() => handleNavClick('print-section')} className="text-xs text-gold font-mono tracking-widest uppercase inline-flex items-center gap-2 mt-8 hover:underline">
              Enter Print Sector <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          DIGITAL SERVICES SECTION (Cyan Accent Glow)
          ========================================== */}
      <section id="digital-section" className="py-28 bg-transparent relative z-20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            variants={revealHeaderVariants}
            className="flex flex-col items-center text-center mb-16"
          >
            <span className="text-xs font-mono text-teal tracking-[0.25em] uppercase mb-4">Division 01 // Interactive Sector</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Digital Services</h2>
            <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
              We construct digital ecosystems with modern frameworks, clean microservice APIs, and custom motion elements optimized for performance.
            </p>
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: "Website Design", desc: "Responsive, Modern & SEO Friendly websites built for speed and lead conversions." },
              { icon: Smartphone, title: "App Development", desc: "Native and hybrid Android & iOS apps engineered with cross-platform frameworks." },
              { icon: Server, title: "Domain & Hosting", desc: "Fast, secure, and reliable deployment systems with high uptime." },
              { icon: Megaphone, title: "Digital Marketing", desc: "Strategic marketing campaigns and optimizations to grow your brand online." }
            ].map((srv, idx) => (
              <motion.div
                key={srv.title}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: "-60px" }}
                variants={cardFadeUpVariants}
                className="group p-8 rounded border border-zinc-900 bg-black/80 hover:border-teal/50 hover:glow-cyan transition-all duration-300"
              >
                <div className="w-12 h-12 rounded bg-teal/10 flex items-center justify-center text-teal mb-6 group-hover:scale-105 duration-300">
                  <srv.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">{srv.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">{srv.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Digital Work Preview Gallery */}
          <div className="mt-20">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-8 text-center">Interactive Previews</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "UI Mockup v1", spec: "Figma File", src: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80" },
                { title: "Web Engine UI", spec: "React Framework", src: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=400&q=80" },
                { title: "Visual Dashboard", spec: "Analytical Core", src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80" },
                { title: "Mobile Wireframe", spec: "iOS Prototype", src: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400&q=80" }
              ].map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded overflow-hidden group border border-zinc-900 bg-zinc-950">
                  <img src={img.src} alt={img.title} className="w-full h-full object-cover opacity-30 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <span className="text-[10px] font-mono text-teal font-bold">{img.spec}</span>
                    <span className="text-xs font-bold text-white uppercase mt-0.5">{img.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <button
              onClick={() => handleNavClick('quote-form')}
              className="px-8 py-3 rounded bg-zinc-900 border border-zinc-800 text-teal text-xs uppercase font-extrabold tracking-widest hover:bg-zinc-800 transition-all cursor-pointer"
            >
              Get Digital Quote
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          PRINTING SERVICES SECTION (Amber Accent Glow)
          ========================================== */}
      <section id="print-section" className="py-28 bg-transparent relative z-20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            variants={revealHeaderVariants}
            className="flex flex-col items-center text-center mb-16"
          >
            <span className="text-xs font-mono text-gold tracking-[0.25em] uppercase mb-4">Division 02 // Production Sector</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Printing Services</h2>
            <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
              Wholesale printing and industrial packaging. We manage complete print runs with strict color checks, premium paper finishes, and fast deliveries.
            </p>
          </motion.div>

          {/* Highlights bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto text-center font-mono">
            <div className="p-4 border border-zinc-900 bg-zinc-950/40 rounded">
              <span className="text-gold text-lg font-bold block mb-1">FAST SERVICE</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Quick Turnaround</span>
            </div>
            <div className="p-4 border border-zinc-900 bg-zinc-950/40 rounded">
              <span className="text-gold text-lg font-bold block mb-1">AFFORDABLE PRICES</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Best Quality at Best Prices</span>
            </div>
            <div className="p-4 border border-zinc-900 bg-zinc-950/40 rounded">
              <span className="text-gold text-lg font-bold block mb-1">NEAT & CLEAN</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Clean, Professional & Reliable</span>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Printer, title: "Printing Services", desc: "High-quality black & white and color prints for documents, reports, assignments, and presentations." },
              { icon: Copy, title: "Photocopy Shop", desc: "Single or multiple high-speed photocopies available in A3, A4, A5, and all custom sizes." },
              { icon: Shield, title: "Protective Lamination", desc: "Glossy and matte protective seal sheets in all dimensions to shield and preserve your documents." },
              { icon: BookOpen, title: "Spiral Binding", desc: "Professional spiral binding with a strong, durable finish for projects, school reports, and reports." },
              { icon: ImageIcon, title: "Photo Printing", desc: "Vibrant photo prints across A3, A4, A5, 4x6, and custom frames with glossy or matte finishes." }
            ].map((srv, idx) => (
              <motion.div
                key={srv.title}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: "-60px" }}
                variants={cardFadeUpVariants}
                className="group p-8 rounded border border-zinc-900 bg-black/80 hover:border-gold/50 hover:glow-amber transition-all duration-300"
              >
                <div className="w-12 h-12 rounded bg-gold/10 flex items-center justify-center text-gold mb-6 group-hover:scale-105 duration-300">
                  <srv.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">{srv.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">{srv.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Materials Showcase */}
          <div className="mt-20 p-8 rounded border border-zinc-900 bg-zinc-950/40">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6 text-center">Available Finishes & Materials</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
              {[
                { title: "Glossy Lamination", desc: "Protect and preserve documents" },
                { title: "Matte Lamination", desc: "Non-reflective clean finish" },
                { title: "Glossy Photo Paper", desc: "Vibrant high-contrast photo finish" },
                { title: "Matte Photo Paper", desc: "Classic non-glare photo prints" },
                { title: "Heavy Bond Paper", desc: "Sturdy feel for premium reports" },
                { title: "Colored Stock", desc: "Vibrant custom paper layouts" }
              ].map((mat, idx) => (
                <div key={idx} className="p-3 border border-zinc-900 bg-black rounded">
                  <span className="text-xs font-bold text-white block mb-0.5">{mat.title}</span>
                  <span className="text-[10px] text-zinc-500 font-sans">{mat.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          REQUEST BULK QUOTE FORM (Custom Terminal UI)
          ========================================== */}
      <section id="quote-form" className="py-24 max-w-4xl mx-auto px-6 z-20 relative bg-transparent">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-100px" }}
          variants={revealHeaderVariants}
          className="bg-black border border-zinc-900 rounded p-8 shadow-2xl relative"
        >
          {/* Form HUD marks */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
            ORDER_PORTAL_ONLINE
          </div>

          <h3 className="text-xs font-mono text-gold tracking-widest uppercase mb-2">Quoting Terminal</h3>
          <h4 className="text-2xl font-bold text-white mb-6">Request Printing & Digital Quote</h4>
          
          <form onSubmit={handleSubmit(onSubmitQuote)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gold" /> Full Name
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="Vikram Sharma"
                className="bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-gold transition-colors font-mono"
              />
              {errors.name && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gold" /> Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="v.sharma@enterprise.com"
                className="bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-gold transition-colors font-mono"
              />
              {errors.email && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gold" /> Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
                placeholder="+91 99999 88888"
                className="bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-gold transition-colors font-mono"
              />
              {errors.phone && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.phone.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
                Product Division
              </label>
              <div className="relative">
                <select
                  {...register('productType')}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-gold appearance-none font-mono"
                >
                  <option value="">-- Select Product type --</option>
                  <option value="Website Design">Website Design</option>
                  <option value="App Development">App Development</option>
                  <option value="Domain & Hosting">Domain & Hosting</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Document Printing">Document Printing (B&W / Color)</option>
                  <option value="High-Quality Photocopying">High-Quality Photocopying</option>
                  <option value="Protective Lamination">Protective Lamination</option>
                  <option value="Professional Spiral Binding">Professional Spiral Binding</option>
                  <option value="Photo Printing">Photo Printing (All Sizes)</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
              {errors.productType && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.productType.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
                Order Quantity
              </label>
              <input
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                placeholder="1"
                className="bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-gold transition-colors font-mono"
              />
              {errors.quantity && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.quantity.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
                Target Deadline
              </label>
              <select
                {...register('deadline')}
                className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-gold appearance-none font-mono"
              >
                <option value="">-- Choose Timeline --</option>
                <option value="Urgent (24-48 Hours)">Urgent (24-48 Hours)</option>
                <option value="Standard (3-5 Days)">Standard (3-5 Days)</option>
                <option value="Flexible (1-2 Weeks)">Flexible (1-2 Weeks)</option>
              </select>
              {errors.deadline && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.deadline.message}</p>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
                Materials Finish
              </label>
              <select
                {...register('finishOption')}
                className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-gold appearance-none font-mono"
              >
                <option value="">-- Choose Finish Option --</option>
                <option value="Glossy Lamination Finish">Glossy Lamination Finish</option>
                <option value="Matte Lamination Finish">Matte Lamination Finish</option>
                <option value="Glossy Photo Paper Finish">Glossy Photo Paper Finish</option>
                <option value="Matte Photo Paper Finish">Matte Photo Paper Finish</option>
                <option value="Standard Document Bond Paper">Standard Document Bond Paper</option>
                <option value="Colored Stock Paper">Colored Stock Paper</option>
                <option value="Not Applicable (Digital)">Not Applicable (Digital)</option>
              </select>
              {errors.finishOption && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.finishOption.message}</p>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-gold" /> Upload Layout Artwork
              </label>
              <div className="border border-dashed border-zinc-800 rounded bg-zinc-950 p-6 text-center cursor-pointer hover:border-gold/50 transition-colors">
                <span className="text-[11px] text-zinc-500 block font-mono">DRAG & DROP PRINT FILE (.PDF, .DOCX, .JPG, .PNG) OR CLICK TO BROWSE</span>
              </div>
            </div>

            <button
              type="submit"
              className="md:col-span-2 w-full py-4 rounded bg-gold hover:bg-gold/90 text-white font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-gold/20"
            >
              Submit Order Request
            </button>
          </form>
        </motion.div>
      </section>

      {/* ==========================================
          SHARED TESTIMONIALS CAROUSEL
          ========================================== */}
      <section className="py-24 max-w-6xl mx-auto px-6 z-20 relative border-t border-zinc-900 bg-transparent">
        <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-10 text-center">Client Testimonials</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { quote: "Paravion's Digital team engineered our entire e-commerce portal in React while their Printing division produced 5,000 custom matte boxes in 4 days. Incredible cross-over workflow.", author: "Rajesh K., Founder of SPA Enterprises" },
            { quote: "The NFC-enabled smart business cards are spectacular. Spot-UV styling is clean, and the transaction speed is seamless. Absolute corporate recommendation.", author: "Neha S., Brand Director at Lexis Legal" }
          ].map((t, idx) => (
            <div key={idx} className="p-8 rounded border border-zinc-900 bg-zinc-950/40 font-sans italic text-sm text-zinc-300 leading-relaxed flex flex-col justify-between">
              <p>"{t.quote}"</p>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold mt-6 block">— {t.author}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          SHARED FAQ SECTION (Accordion)
          ========================================== */}
      <section className="py-24 max-w-4xl mx-auto px-6 z-20 relative border-t border-zinc-900 bg-transparent">
        <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-10 text-center">Frequently Asked Questions</h3>
        
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-zinc-900 bg-zinc-950/40 rounded overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 flex items-center justify-between text-left font-bold text-sm uppercase tracking-wide text-white hover:bg-zinc-900 transition-colors"
              >
                <span>{faq.q}</span>
                <span className="text-zinc-500 font-mono">{activeFaq === idx ? '[-]' : '[+]'}</span>
              </button>
              
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-zinc-900 bg-black/60 px-5 py-4 text-xs text-zinc-400 leading-relaxed font-sans"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          SHARED ABOUT SECTION
          ========================================== */}
      <section id="about" className="py-28 bg-transparent relative z-20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 flex flex-col items-start">
            <span className="text-xs font-mono text-gold tracking-[0.25em] uppercase mb-4">Studio Mandate</span>
            <h3 className="text-3xl md:text-5xl font-black text-white mb-6">Large Scale Printing Experts</h3>
            <p className="text-zinc-400 mb-6 leading-relaxed text-sm font-sans">
              Paravion Technologies represents a unique combination of modern digital engineering and large-scale document printing, photocopy, and bind services. We focus on providing high-quality output at affordable prices, delivering clean, professional, and reliable work for student projects, corporate reports, and personal assignments.
            </p>
            <p className="text-zinc-500 text-xs leading-relaxed font-sans">
              Headquartered in New Delhi, India, our retail print shop handles single-page runs to bulk spiral binding and glossy lamination layouts, while our engineering team crafts bespoke websites and mobile applications.
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            {[
              { icon: BrainCircuit, color: "text-teal", title: "Digital Innovations", desc: "Developing responsive websites, mobile apps, domain setup, and hosting infrastructure." },
              { icon: Printer, color: "text-blue-500", title: "Document & Photocopy Shop", desc: "Fast black & white and color photocopying for all document sizes (A4, A3, A5)." },
              { icon: Shield, color: "text-gold", title: "Lamination & Spiral Binding", desc: "Glossy/matte protective sheets and durable binding configurations for reports and projects." }
            ].map((p) => (
              <div
                key={p.title}
                className="flex gap-5 p-6 rounded border border-zinc-900 bg-zinc-950/40 shadow-sm"
              >
                <div className={`${p.color} mt-0.5`}>
                  <p.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1.5">{p.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          CONTACT SECTION (Direct connections)
          ========================================== */}
      <section id="contact" className="py-24 max-w-7xl mx-auto px-6 z-20 relative bg-transparent border-t border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="flex flex-col items-start justify-center">
            <span className="text-xs font-mono text-gold tracking-[0.25em] uppercase mb-4">Direct Connection</span>
            <h3 className="text-3xl md:text-5xl font-black text-white mb-6">Contact Us</h3>
            <p className="text-zinc-400 leading-relaxed text-sm mb-8">
              Discuss document print orders, spiral binding requests, lamination requirements, or custom website/app engineering projects.
            </p>

            <div className="flex flex-col gap-5 text-sm font-mono text-zinc-400">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">WHATSAPP / PHONE</span>
                <a href="https://wa.me/917011991268" target="_blank" rel="noopener noreferrer" className="text-white hover:text-teal font-bold transition-colors">
                  +91 7011991268
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">EMAIL CORRESPONDENCE</span>
                <a href="mailto:paraviontechnologies@gmail.com" className="text-teal hover:underline font-bold transition-colors">
                  paraviontechnologies@gmail.com
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">STUDIO HEADQUARTERS</span>
                <span className="text-white">New Delhi, India</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded border border-zinc-900 bg-zinc-950/40 text-center flex flex-col items-center justify-center">
            <HelpCircle className="w-12 h-12 text-gold mb-4" />
            <h4 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Have Design Vector Files?</h4>
            <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
              If you already have your print layout vectors ready, click the Order Portal to upload them directly with your quoting details.
            </p>
            <button
              onClick={() => handleNavClick('quote-form')}
              className="px-6 py-3 rounded bg-gold text-white font-extrabold text-xs uppercase tracking-widest hover:bg-gold/90 transition-all cursor-pointer"
            >
              Open Quoting Terminal
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          FOOTER (Grounding Dark Layout)
          ========================================== */}
      <footer className="bg-black border-t border-zinc-900 py-16 relative z-20 text-zinc-400">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-left mb-12">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="url(#navHexGrad)" />
                <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" fill="#000000" />
                <polygon points="50,30 70,40 70,60 50,70 30,60 30,40" fill="url(#navHexGrad)" />
              </svg>
              <span className="text-white font-extrabold tracking-wider font-sans text-lg">
                PARAVION TECHNOLOGIES
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-sans max-w-xs">
              Think Big. Build Secure. Grow Digital. Dedicated to responsive digital systems and high-quality document printing, photocopy, binding, and lamination services.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="text-xs font-mono text-gold uppercase tracking-wider font-bold mb-1">NAVIGATION</span>
            <button onClick={() => handleNavClick('digital-section')} className="text-sm text-zinc-500 hover:text-white transition-colors cursor-pointer">Digital Services</button>
            <button onClick={() => handleNavClick('print-section')} className="text-sm text-zinc-500 hover:text-white transition-colors cursor-pointer">Printing Shop</button>
            <button onClick={() => handleNavClick('about')} className="text-sm text-zinc-500 hover:text-white transition-colors cursor-pointer">About Us</button>
            <button onClick={() => handleNavClick('contact')} className="text-sm text-zinc-500 hover:text-white transition-colors cursor-pointer">Contact</button>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="text-xs font-mono text-gold uppercase tracking-wider font-bold mb-1">COMMUNICATION</span>
            <span className="text-sm text-zinc-500 font-mono">+91 7011991268</span>
            <span className="text-sm text-teal font-mono">paraviontechnologies@gmail.com</span>
            <span className="text-sm text-zinc-500 font-sans font-bold">New Delhi, India</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-650 font-sans">
            © 2026 Paravion Technologies. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-600">
            <span>Digital & Print Shop Model</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-teal" />
              Large Scale Production
            </span>
          </div>
        </div>
      </footer>

      {/* ==========================================
          FLOATING WHATSAPP BUTTON
          ========================================== */}
      <a
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
