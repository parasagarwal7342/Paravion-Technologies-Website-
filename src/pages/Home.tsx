import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Globe,
  Server,
  Cloud,
  BrainCircuit,
  Shield as ShieldIcon,
  Menu,
  X,
  Layers,
  User,
  Mail,
  Phone,
  Check,
  ChevronRight,
  Send,
  Sparkles
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { useToast } from '../components/ui/toast';

// ==========================================
// 1. THREE.JS 3D ABSTRACT GEOMETRIC SHIELD LOGO
// ==========================================
interface ThreeDBackgroundProps {
  mousePos: { x: number; y: number };
}

const ThreeDBackground: React.FC<ThreeDBackgroundProps> = ({ mousePos }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef(mousePos);
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

    // Scene & Camera setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x06b6d4, 4.5, 30);
    blueLight.position.set(4, 3, 2);
    scene.add(blueLight);

    const violetLight = new THREE.PointLight(0x4f46e5, 3.5, 30);
    violetLight.position.set(-4, -3, 2);
    scene.add(violetLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);

    // Abstract Geometric Shield Mesh
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.6);
    shieldShape.quadraticCurveTo(1.3, 1.4, 1.3, 0.2);
    shieldShape.quadraticCurveTo(1.3, -0.9, 0, -1.8);
    shieldShape.quadraticCurveTo(-1.3, -0.9, -1.3, 0.2);
    shieldShape.quadraticCurveTo(-1.3, 1.4, 0, 1.6);

    const extrudeSettings = {
      depth: 0.25,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08
    };

    const shieldGeom = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    shieldGeom.center();

    // Solid plate metal material with high metallic sheen
    const shieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.95,
      roughness: 0.12,
      transparent: true,
      opacity: 0.98
    });

    const shieldMesh = new THREE.Mesh(shieldGeom, shieldMaterial);
    
    // Add glowing cyan wireframe overlay
    const wireframeGeom = new THREE.WireframeGeometry(shieldGeom);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.55
    });
    const shieldWireframe = new THREE.LineSegments(wireframeGeom, wireframeMat);
    shieldMesh.add(shieldWireframe);

    // Add glowing node points at shield vertices
    const nodeGeom = new THREE.BufferGeometry();
    const nodePositions = new Float32Array([
      0, 1.6, 0.18,
      1.3, 0.2, 0.18,
      0, -1.8, 0.18,
      -1.3, 0.2, 0.18,
      0, 0.8, 0.18,
      0, -0.8, 0.18
    ]);
    nodeGeom.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    const nodeMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.24,
      transparent: true,
      opacity: 0.9
    });
    const glowingNodes = new THREE.Points(nodeGeom, nodeMat);
    shieldMesh.add(glowingNodes);

    // Thin orbit halo ring around the shield
    const torusGeom = new THREE.TorusGeometry(2.1, 0.015, 8, 48);
    const torusMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.25 });
    const orbitRing = new THREE.Mesh(torusGeom, torusMat);
    orbitRing.rotation.x = Math.PI / 2.2;
    shieldMesh.add(orbitRing);

    scene.add(shieldMesh);

    // Coordinate Projection Function
    const getAnchorWorldPosition = (anchorId: string, camera: THREE.PerspectiveCamera, targetZ: number) => {
      const el = document.getElementById(anchorId);
      if (!el) {
        // Fallback default coordinates if anchors aren't ready
        return anchorId === 'hero-3d-anchor' 
          ? new THREE.Vector3(2.8, 0.5, targetZ) 
          : new THREE.Vector3(0, -9.5, targetZ);
      }
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const ndcX = (centerX / window.innerWidth) * 2 - 1;
      const ndcY = -(centerY / window.innerHeight) * 2 + 1;

      const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
      vec.unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const distance = (targetZ - camera.position.z) / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(distance));
    };

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth lerp scroll ratio
      scrollRef.current.current = THREE.MathUtils.lerp(
        scrollRef.current.current,
        scrollRef.current.target,
        0.06
      );
      const sr = scrollRef.current.current;

      // Project anchors to screen coordinates
      const heroPos = getAnchorWorldPosition('hero-3d-anchor', camera, 0);
      const methPos = getAnchorWorldPosition('methodology-3d-anchor', camera, 0);

      // Lerp position based on scroll progress
      const targetPos = new THREE.Vector3().copy(heroPos).lerp(methPos, sr);
      shieldMesh.position.copy(targetPos);

      // Lerp scale down slightly as we scroll to the Methodology circle
      const targetScale = THREE.MathUtils.lerp(1.0, 0.58, sr);
      shieldMesh.scale.set(targetScale, targetScale, targetScale);

      // Oscillations (Idle drift)
      const idleDriftY = Math.sin(elapsed * 1.8) * 0.12;
      const idleDriftX = Math.cos(elapsed * 1.4) * 0.08;
      shieldMesh.position.y += idleDriftY;
      shieldMesh.position.x += idleDriftX;

      // Rotations: Continuous Y rotation + Scroll rotation + Mouse parallax magnetic tilt
      const mouseParallaxX = mouseRef.current.x * 0.28;
      const mouseParallaxY = mouseRef.current.y * 0.22;

      shieldMesh.rotation.y = elapsed * 0.45 + sr * Math.PI * 2.0 + mouseParallaxX;
      shieldMesh.rotation.x = Math.sin(elapsed * 0.6) * 0.1 + sr * 0.3 + mouseParallaxY;

      // Rotate torus halo separately
      orbitRing.rotation.z -= delta * 0.3;

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
// FORM SCHEMAS (Talk to an Expert)
// ==========================================
const expertContactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  requirements: z.string().min(10, "Requirements details must be at least 10 characters")
});

type ExpertContactFormInputs = z.infer<typeof expertContactSchema>;

// ==========================================
// SPOTLIGHT CARD COMPONENT
// ==========================================
interface ServiceCardProps {
  title: string;
  desc: string;
  icon: React.ComponentType<any>;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, desc, icon: Icon }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group p-8 rounded border border-zinc-900 bg-zinc-950/60 hover:border-cyan-500/40 transition-all duration-300 overflow-hidden"
    >
      {isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, rgba(6, 182, 212, 0.08), transparent 85%)`
          }}
        />
      )}
      <div className="w-12 h-12 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-105 transition-transform duration-300">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-lg font-bold text-white mb-3 font-display">{title}</h4>
      <p className="text-xs text-zinc-400 leading-relaxed font-sans">{desc}</p>
    </div>
  );
};

// ==========================================
// ACCORDION FAQ CARD
// ==========================================
interface FaqCardProps {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FaqCard: React.FC<FaqCardProps> = ({ q, a, isOpen, onToggle }) => {
  return (
    <div className="border border-zinc-900 bg-zinc-950/40 rounded overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between text-left font-bold text-sm uppercase tracking-wide text-white hover:bg-zinc-900 transition-colors"
      >
        <span className="font-display">{q}</span>
        <span className="text-zinc-500 font-mono transition-transform duration-300">
          {isOpen ? '[-]' : '[+]'}
        </span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-900 bg-black/60 px-5 py-4 text-xs text-zinc-400 leading-relaxed font-sans"
          >
            {a}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// MAIN LANDING PAGE
// ==========================================
export default function Home() {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Testimonials Slider state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Methodology active step tracker
  const [activeMethodologyStep, setActiveMethodologyStep] = useState(0);

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

  // Expert Contact Form validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ExpertContactFormInputs>({
    resolver: zodResolver(expertContactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      requirements: ''
    }
  });

  const onSubmitContact = (data: ExpertContactFormInputs) => {
    console.log("Talk to an Expert Request:", data);
    toast("Inquiry Submitted Successfully — A Defensive Architect will reach out shortly.", "success");
    reset();
  };

  const testimonials = [
    { quote: "Paravion's defensive audits restructured our core network. The implementation of zero-trust nodes stopped lateral threat movement instantly.", author: "Arjun Mehta, CTO of Capital Secure" },
    { quote: "Their circular gap assessments provided a clean pathway to regulatory compliance. Professional and highly technical defensive capability.", author: "Priya Nair, Risk Assessment Lead at FinVibe" }
  ];

  const methodologySteps = [
    { title: "Gap Assessment", desc: "Identify structural vulnerabilities and check edge nodes for configuration errors." },
    { title: "Remediation", desc: "Patch core systems, update access vectors, and deploy zero-trust node clusters." },
    { title: "Certification", desc: "Validate that compliance metrics meet global enterprise data defense codes." },
    { title: "Audit Verification", desc: "Run secondary pen testing loops and mock breach drills to confirm system defense integrity." }
  ];

  const faqs = [
    { q: "What security frameworks do you deploy?", a: "We align defensive infrastructures directly with SOC 2 Type II, ISO 27001, and NIST frameworks using automated continuous tracking systems." },
    { q: "How long does a vulnerability audit take?", a: "Standard perimeter network audits are completed in 3 to 5 business days, with fully comprehensive codebase audits scaling up to 2 weeks." },
    { q: "Do you offer post-compliance tracking?", a: "Yes, our audit verification step includes quarterly system checks and real-time firewall intrusion audits." }
  ];

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-black text-[#FAFAFA] overflow-x-hidden font-sans select-none"
    >
      {/* Dynamic Ambient Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0e_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />

      {/* ==========================================
          PERSISTENT 3D WEBGL ENGINE CANVAS
          ========================================== */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
        <ThreeDBackground mousePos={mousePos} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/90 pointer-events-none" />
      </div>

      {/* ==========================================
          1. NAVIGATION BAR
          ========================================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="#06b6d4" fillOpacity="0.15" stroke="#06b6d4" strokeWidth="3" />
              <polygon points="50,22 80,38 80,62 50,78 20,62 20,38" fill="#4f46e5" fillOpacity="0.2" stroke="#4f46e5" strokeWidth="2" />
              <circle cx="50" cy="50" r="10" fill="#ffffff" />
            </svg>
            <span className="text-white font-extrabold tracking-[0.25em] font-display text-lg uppercase">
              PARAVION <span className="text-cyan-400 font-light">SECURE</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => handleNavClick('home')} className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">Home</button>
            <button onClick={() => handleNavClick('services')} className="text-xs font-semibold text-zinc-400 hover:text-cyan-400 transition-colors uppercase tracking-widest">Services</button>
            <button onClick={() => handleNavClick('methodology')} className="text-xs font-semibold text-zinc-400 hover:text-cyan-400 transition-colors uppercase tracking-widest">Methodology</button>
            <button onClick={() => handleNavClick('about')} className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">About</button>
            <button onClick={() => handleNavClick('faq')} className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">FAQ</button>
          </div>

          <div className="hidden md:flex items-center">
            <button
              onClick={() => handleNavClick('expert-form')}
              className="px-6 py-2.5 rounded border border-cyan-500/30 text-white font-bold text-xs tracking-wider uppercase hover:border-cyan-400 hover:bg-cyan-500/5 transition-all cursor-pointer border-beam"
            >
              Talk to an Expert
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
              <button onClick={() => handleNavClick('services')} className="text-left text-sm uppercase tracking-widest font-semibold text-zinc-400">Services</button>
              <button onClick={() => handleNavClick('methodology')} className="text-left text-sm uppercase tracking-widest font-semibold text-zinc-400">Methodology</button>
              <button onClick={() => handleNavClick('about')} className="text-left text-sm uppercase tracking-widest font-semibold text-zinc-400">About</button>
              <button onClick={() => handleNavClick('faq')} className="text-left text-sm uppercase tracking-widest font-semibold text-zinc-400">FAQ</button>
              <button onClick={() => handleNavClick('expert-form')} className="w-full py-3 rounded border border-cyan-500/30 text-white font-bold text-center text-xs tracking-widest uppercase">Talk to an Expert</button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ==========================================
          2. HERO SECTION
          ========================================== */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-transparent">
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Typography Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[10px] font-mono uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" /> Cyber Defense Systems
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white font-display tracking-tight leading-[1.05] mb-6 uppercase">
              ENGINEERING <br />
              <span className="text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text">CYBER SOVEREIGNTY.</span>
            </h1>

            <p className="max-w-xl text-zinc-400 text-sm md:text-base leading-relaxed mb-8 font-sans">
              Advanced threat defense infrastructure and zero-trust engineering layers built to protect enterprise networks, digital frameworks, and sovereign data repositories.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => handleNavClick('services')}
                className="px-8 py-4 rounded bg-cyan-500 text-black font-extrabold text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Explore Solutions
              </button>
              <button
                onClick={() => handleNavClick('methodology')}
                className="px-8 py-4 rounded border border-zinc-800 text-white font-extrabold text-xs uppercase tracking-widest hover:border-cyan-500/40 hover:bg-white/5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Verify Systems
              </button>
            </div>

            {/* Brand Badges */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">TRUSTED DEFENSE ACCREDITATIONS</span>
              <div className="flex flex-wrap items-center gap-6 text-zinc-400 font-bold text-xs uppercase tracking-widest font-display">
                <span className="border border-zinc-900 bg-zinc-950/40 px-3 py-1 rounded">SOC 2 COMPLIANT</span>
                <span className="border border-zinc-900 bg-zinc-950/40 px-3 py-1 rounded">ISO 27001</span>
                <span className="border border-zinc-900 bg-zinc-950/40 px-3 py-1 rounded">NIST FRAMED</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Emblem Container Space */}
          <div className="lg:col-span-5 flex justify-center items-center h-[450px]">
            {/* The 3D shield will project directly onto this container area */}
            <div 
              id="hero-3d-anchor" 
              className="w-full max-w-[380px] aspect-square rounded-full border border-zinc-900/30 bg-zinc-950/5 flex items-center justify-center relative"
            >
              {/* Outer faint coordinate grid inside empty target circle */}
              <div className="absolute inset-4 rounded-full border border-dashed border-zinc-900/20 animate-spin-slow" />
              <div className="absolute inset-16 rounded-full border border-zinc-900/10" />
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          3. MISSION / INTRO SECTION
          ========================================== */}
      <section id="about" className="py-28 relative z-20 border-t border-zinc-900 bg-black/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="text-xs font-mono text-cyan-400 tracking-[0.25em] uppercase mb-4 block">Our Mandate</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight font-display uppercase">
              DEVIATION IS VULNERABILITY. <br />
              EXECUTION IS DECREED.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6 font-sans">
              As digital network infrastructures grow increasingly complex, static perimeter security systems fail. Paravion Secure builds continuous, automated, multi-faceted defensive architectures that shield network assets natively.
            </p>
            <p className="text-zinc-500 text-xs md:text-sm leading-relaxed font-sans">
              From zero-trust authorization systems to comprehensive gap assessment routines and industrial certifications, we verify code integrity and system protection vectors with absolute execution precision.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          4. FEATURE / SERVICES GRID (Interactive Cards)
          ========================================== */}
      <section id="services" className="py-28 relative z-20 border-t border-zinc-900 bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-xs font-mono text-cyan-400 tracking-[0.25em] uppercase mb-4">Defensive Portfolios</span>
            <h2 className="text-3xl md:text-5xl font-black text-white font-display uppercase">DEFENSE ARCHITECTURE</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard 
              icon={BrainCircuit} 
              title="Zero-Trust Architecture" 
              desc="Deploy node verification frameworks that validate access tokens dynamically, stopping lateral breach movement."
            />
            <ServiceCard 
              icon={ShieldIcon} 
              title="Gap Assessment audits" 
              desc="Run automated scanning drills to locate perimeter vulnerabilities and configuration leaks."
            />
            <ServiceCard 
              icon={Server} 
              title="Secure Cloud Sync" 
              desc="Set up isolated server infrastructure arrays with encrypted transmission pipes and high accessibility scores."
            />
            <ServiceCard 
              icon={Layers} 
              title="Compliance Engineering" 
              desc="Map your technical codebase to fit SOC 2, ISO 27001, and NIST data regulatory specifications."
            />
            <ServiceCard 
              icon={Globe} 
              title="Continuous Penetration Drilling" 
              desc="Simulate targeted breach flows and stress-test data barriers under mock threat parameters."
            />
            <ServiceCard 
              icon={Cloud} 
              title="API Gateway Protection" 
              desc="Build secure microservice channels with custom payload cryptography and rate-limit controls."
            />
          </div>
        </div>
      </section>

      {/* ==========================================
          5. CLIENT TESTIMONIALS CAROUSEL
          ========================================== */}
      <section className="py-24 relative z-20 border-t border-zinc-900 bg-zinc-950/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-10 text-center">System Validations</h3>
          
          <div className="relative min-h-[160px] flex flex-col justify-center text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="font-display italic text-lg md:text-xl text-zinc-300 leading-relaxed"
              >
                "{testimonials[activeTestimonial].quote}"
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold mt-6 block not-italic">
                  — {testimonials[activeTestimonial].author}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Slider Navigation */}
            <div className="flex justify-center gap-4 mt-10">
              <button
                onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-cyan-400 transition-all cursor-pointer"
                aria-label="Previous Testimonial"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={() => setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-cyan-400 transition-all cursor-pointer"
                aria-label="Next Testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          6. INTERACTIVE METHODOLOGY SEGMENT (3D Target)
          ========================================== */}
      <section id="methodology" className="py-28 relative z-20 border-t border-zinc-900 bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-20">
            <span className="text-xs font-mono text-cyan-400 tracking-[0.25em] uppercase mb-4">Verification Pathway</span>
            <h2 className="text-3xl md:text-5xl font-black text-white font-display uppercase">METHODOLOGY</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left circular process columns */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {methodologySteps.slice(0, 2).map((step, idx) => (
                <div
                  key={step.title}
                  onMouseEnter={() => setActiveMethodologyStep(idx)}
                  className={`p-6 rounded border transition-all duration-300 cursor-pointer ${
                    activeMethodologyStep === idx 
                      ? 'border-cyan-500/50 bg-cyan-500/5' 
                      : 'border-zinc-900 bg-zinc-950/40 hover:border-zinc-800'
                  }`}
                >
                  <span className="text-xs font-mono text-cyan-400 font-bold block mb-1">STEP 0{idx + 1}</span>
                  <h4 className="text-base font-bold text-white mb-2 font-display uppercase">{step.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Central 3D Methodology Anchor Container */}
            <div className="lg:col-span-4 flex justify-center items-center h-[340px]">
              {/* As the user scrolls down to this section, the 3D shield will anchor here */}
              <div 
                id="methodology-3d-anchor" 
                className="w-full max-w-[260px] aspect-square rounded-full border border-dashed border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center relative shadow-2xl shadow-cyan-500/5"
              >
                <div className="absolute inset-3 rounded-full border border-zinc-900/40" />
                
                {/* Visual coordinate brackets */}
                <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-500/40 font-bold">[SYS_LOCK]</div>
                <div className="absolute bottom-2 right-2 text-[9px] font-mono text-cyan-500/40 font-bold">Z_TRANS_0</div>
              </div>
            </div>

            {/* Right circular process columns */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {methodologySteps.slice(2, 4).map((step, idx) => {
                const stepIdx = idx + 2;
                return (
                  <div
                    key={step.title}
                    onMouseEnter={() => setActiveMethodologyStep(stepIdx)}
                    className={`p-6 rounded border transition-all duration-300 cursor-pointer ${
                      activeMethodologyStep === stepIdx 
                        ? 'border-cyan-500/50 bg-cyan-500/5' 
                        : 'border-zinc-900 bg-zinc-950/40 hover:border-zinc-800'
                    }`}
                  >
                    <span className="text-xs font-mono text-cyan-400 font-bold block mb-1">STEP 0{stepIdx + 1}</span>
                    <h4 className="text-base font-bold text-white mb-2 font-display uppercase">{step.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">{step.desc}</p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ==========================================
          7. KEY FACTS / METRICS
          ========================================== */}
      <section className="py-24 relative z-20 border-t border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center font-display">
          {[
            { metric: "150+", label: "INFRASTRUCTURE ARRAYS PATCHED" },
            { metric: "45+", label: "SECURITY AUDITS RATIFIED" },
            { metric: "100%", label: "ACCERTED DATA INTEGRITY" }
          ].map((stat, idx) => (
            <div key={idx} className="p-8 border border-zinc-900 bg-zinc-950/30 rounded">
              <span className="text-transparent bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-5xl md:text-6xl font-black block mb-2">{stat.metric}</span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          8. FAQ SECTION (Accordion)
          ========================================== */}
      <section id="faq" className="py-28 relative z-20 border-t border-zinc-900 bg-transparent">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-xs font-mono text-cyan-400 tracking-[0.25em] uppercase mb-4">FAQ Support</span>
            <h2 className="text-3xl md:text-5xl font-black text-white font-display uppercase">EXPERT RESPONSES</h2>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <FaqCard 
                key={idx}
                q={faq.q}
                a={faq.a}
                isOpen={activeFaq === idx}
                onToggle={() => setActiveFaq(activeFaq === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          9. CALL-TO-ACTION (Footer Banner Form)
          ========================================== */}
      <section id="expert-form" className="py-24 max-w-4xl mx-auto px-6 z-20 relative bg-transparent">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-black border border-zinc-900 hover:border-cyan-500/30 rounded p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Neon corner flare */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <h3 className="text-xs font-mono text-cyan-400 tracking-widest uppercase mb-2">Security Core</h3>
          <h4 className="text-2xl md:text-3xl font-bold text-white font-display uppercase mb-6">Talk to a Defensive Architect</h4>
          
          <form onSubmit={handleSubmit(onSubmitContact)} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" /> Full Name
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="Devon Lane"
                className="bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
              />
              {errors.name && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="devon@enterprise.com"
                className="bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
              />
              {errors.email && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" /> Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
                placeholder="+91 99999 88888"
                className="bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
              />
              {errors.phone && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.phone.message}</p>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
                Defensive Requirements & Architecture Targets
              </label>
              <textarea
                {...register('requirements')}
                rows={4}
                placeholder="Describe your network infrastructure size and primary data compliance targets..."
                className="bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-sans leading-relaxed"
              />
              {errors.requirements && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.requirements.message}</p>}
            </div>

            <button
              type="submit"
              className="md:col-span-2 w-full py-4 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              Submit Integration Inquiry <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </motion.div>
      </section>

      {/* ==========================================
          10. FOOTER
          ========================================== */}
      <footer className="bg-black border-t border-zinc-900 py-16 relative z-20 text-zinc-400">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-left mb-12">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="#06b6d4" fillOpacity="0.15" stroke="#06b6d4" strokeWidth="3" />
                <polygon points="50,22 80,38 80,62 50,78 20,62 20,38" fill="#4f46e5" fillOpacity="0.2" stroke="#4f46e5" strokeWidth="2" />
                <circle cx="50" cy="50" r="10" fill="#ffffff" />
              </svg>
              <span className="text-white font-extrabold tracking-wider font-display text-lg uppercase">
                PARAVION SECURE
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-sans max-w-xs">
              Think Big. Build Secure. Grow Digital. Delivering state-of-the-art zero-trust defense architectures for global enterprise nodes since 2026.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold mb-1">Defense Solutions</span>
            <button onClick={() => handleNavClick('services')} className="text-sm text-zinc-500 hover:text-white transition-colors cursor-pointer">Defensive Portfolios</button>
            <button onClick={() => handleNavClick('methodology')} className="text-sm text-zinc-500 hover:text-white transition-colors cursor-pointer">Verification Pathways</button>
            <button onClick={() => handleNavClick('about')} className="text-sm text-zinc-500 hover:text-white transition-colors cursor-pointer">Sovereign Mandates</button>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold mb-1">Direct Connection</span>
            <span className="text-sm text-zinc-500 font-mono">+91 7011991268</span>
            <span className="text-sm text-cyan-400 font-mono">paraviontechnologies@gmail.com</span>
            <span className="text-sm text-zinc-500 font-sans font-bold">New Delhi, India</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-650 font-sans">
            © 2026 Paravion Technologies / Secure. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-650">
            <span>SOC 2 Type II Accerted</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-cyan-400" />
              Sovereign Node Integrity Verified
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
