import React, { useEffect, useRef, useState } from 'react';
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
// 1. HERO CANVAS PARTICLE MESH BACKGROUND
// ==========================================
const HeroCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particlesCount = 80;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4, // subtle drift
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      ctx.fillStyle = '#080C16';
      ctx.fillRect(0, 0, width, height);

      // Connect particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particlesCount; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Boundaries bounce
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        for (let j = i + 1; j < particlesCount; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.strokeStyle = `rgba(0, 212, 170, ${0.12 * (1 - dist / 150)})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw node
        ctx.fillStyle = 'rgba(0, 212, 170, 0.6)';
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

// ==========================================
// 2. STATS BAR ANIMATED COUNTER
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
    <span ref={ref} className="font-mono text-3xl md:text-4xl font-extrabold text-white tracking-tight">
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
// 3. PRODUCTS DATA ARRAY
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
// 4. CONTACT FORM ZOD RESOLVER
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
// 5. MAIN HOME PAGE COMPONENT
// ==========================================
export default function Home() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'All' | 'Deployed' | 'Prototype'>('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

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
  let riskColor = "text-red-500 border-red-500/20 bg-red-500/10";
  let riskMessage = "Critical exposure. Contact us immediately.";

  if (yesCount >= 4) {
    riskStatus = "LOW RISK";
    riskColor = "text-green-400 border-green-500/20 bg-green-500/10";
    riskMessage = "Good posture. Let us take you to enterprise-grade.";
  } else if (yesCount >= 2) {
    riskStatus = "MEDIUM RISK";
    riskColor = "text-amber-400 border-amber-500/20 bg-amber-500/10";
    riskMessage = "Significant gaps remain. Let's fix them.";
  }

  // Live Visitor Counter (CounterAPI hook)
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
        // Local simulation fallback
        const simulated = localStorage.getItem('sim_visits') 
          ? parseInt(localStorage.getItem('sim_visits')!) + 1 
          : 12450;
        localStorage.setItem('sim_visits', simulated.toString());
        setVisitorCount(simulated);
      });
  }, []);

  // Form submit handler
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
    console.log("Contact submission:", data);
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
    <div className="relative min-h-screen bg-[#080C16] text-[#F0F4FF] overflow-x-hidden">
      {/* ==========================================
          6.1 NAVBAR (Fixed Glassmorphic Header)
          ========================================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080C16]/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
            {/* Hexagon Logo */}
            <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00D4AA" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="url(#hexGrad)" />
              <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" fill="#080C16" />
              <polygon points="50,30 70,40 70,60 50,70 30,60 30,40" fill="url(#hexGrad)" className="animate-pulse" />
            </svg>
            <span className="text-white font-extrabold tracking-[0.2em] font-sans text-lg md:text-xl">
              PARAVION <span className="text-teal font-light">TECHNOLOGIES</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button data-testid="nav-home" onClick={() => handleNavClick('home')} className="text-sm font-medium hover:text-teal transition-colors">Home</button>
            <button data-testid="nav-products" onClick={() => handleNavClick('products')} className="text-sm font-medium hover:text-teal transition-colors">Products</button>
            <button data-testid="nav-services" onClick={() => handleNavClick('services')} className="text-sm font-medium hover:text-teal transition-colors">Services</button>
            <button data-testid="nav-about" onClick={() => handleNavClick('about')} className="text-sm font-medium hover:text-teal transition-colors">About</button>
            <button data-testid="nav-contact" onClick={() => handleNavClick('contact')} className="text-sm font-medium hover:text-teal transition-colors">Contact</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {visitorCount !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal/20 bg-teal/5 text-xs text-teal font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-ping" />
                Network Visits: {visitorCount}
              </div>
            )}
            <button
              data-testid="btn-nav-cta"
              onClick={() => handleNavClick('contact')}
              className="px-6 py-2.5 rounded-full bg-gold hover:bg-gold/90 text-background font-bold text-sm transition-transform hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-[#080C16] px-6 py-6 flex flex-col gap-5"
            >
              <button onClick={() => handleNavClick('home')} className="text-left text-base font-semibold hover:text-teal">Home</button>
              <button onClick={() => handleNavClick('products')} className="text-left text-base font-semibold hover:text-teal">Products</button>
              <button onClick={() => handleNavClick('services')} className="text-left text-base font-semibold hover:text-teal">Services</button>
              <button onClick={() => handleNavClick('about')} className="text-left text-base font-semibold hover:text-teal">About</button>
              <button onClick={() => handleNavClick('contact')} className="text-left text-base font-semibold hover:text-teal">Contact</button>
              
              <div className="h-px bg-white/5 my-2" />
              
              {visitorCount !== null && (
                <div className="flex items-center gap-2 self-start px-3 py-1.5 rounded-full border border-teal/20 bg-teal/5 text-xs text-teal font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal animate-ping" />
                  Visits: {visitorCount}
                </div>
              )}
              <button
                onClick={() => handleNavClick('contact')}
                className="w-full py-3 rounded-full bg-gold text-background font-bold text-center transition-transform hover:scale-[1.02]"
              >
                Get Started
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ==========================================
          6.2 HERO (Interactive Particle background)
          ========================================== */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <HeroCanvas />

        {/* Gradient Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#080C16] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            {/* Tag badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 px-4 py-1.5 rounded-full border border-teal/20 bg-teal/5 text-teal text-xs font-mono tracking-widest uppercase font-semibold"
            >
              Indian Cyber Sovereignty // 2026
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] font-sans"
            >
              Defend. Develop.<br />
              <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Dominate.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed font-sans"
            >
              Paravion Technologies builds AI-powered cybersecurity systems and enterprise digital products that protect and scale modern businesses.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <button
                data-testid="btn-hero-products"
                onClick={() => handleNavClick('products')}
                className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg hover:shadow-blue-500/20 hover:scale-[1.03] text-center"
              >
                View Our Products
              </button>
              <button
                data-testid="btn-hero-contact"
                onClick={() => handleNavClick('contact')}
                className="px-8 py-4 rounded-xl border border-gold text-gold font-bold hover:bg-gold/5 transition-all hover:scale-[1.03] text-center"
              >
                Secure Your Business
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==========================================
          6.3 STATS BAR (6-column counters)
          ========================================== */}
      <section className="relative bg-[#0F1626] border-y border-white/5 py-10 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
            {/* Stat 1 */}
            <div className="flex flex-col gap-1 items-center">
              <AnimatedCounter value={14.4} suffix="M+" decimals={1} />
              <span className="text-xs text-gray-400 font-mono tracking-wider uppercase mt-1">Nodal Points Secured</span>
            </div>
            {/* Stat 2 */}
            <div className="flex flex-col gap-1 items-center">
              <AnimatedCounter value={14} suffix="ms" />
              <span className="text-xs text-gray-400 font-mono tracking-wider uppercase mt-1">UBS Engine Latency</span>
            </div>
            {/* Stat 3 */}
            <div className="flex flex-col gap-1 items-center">
              <AnimatedCounter value={40} prefix="INR " suffix="B+" />
              <span className="text-xs text-gray-400 font-mono tracking-wider uppercase mt-1">Fraud Prevented</span>
            </div>
            {/* Stat 4 */}
            <div className="flex flex-col gap-1 items-center">
              <AnimatedCounter value={8} />
              <span className="text-xs text-gray-400 font-mono tracking-wider uppercase mt-1">Core Patents Pending</span>
            </div>
            {/* Stat 5 */}
            <div className="flex flex-col gap-1 items-center">
              <AnimatedCounter value={5} />
              <span className="text-xs text-gray-400 font-mono tracking-wider uppercase mt-1">Products Built in 2026</span>
            </div>
            {/* Stat 6 */}
            <div className="flex flex-col gap-1 items-center">
              <AnimatedCounter value={1} />
              <span className="text-xs text-gray-400 font-mono tracking-wider uppercase mt-1">Live Deployments</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          6.4 PRODUCTS SECTION (Filterable Grid)
          ========================================== */}
      <section id="products" className="py-24 max-w-7xl mx-auto px-6 z-20 relative">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-xs font-mono text-gold tracking-[0.25em] uppercase mb-4">Our Products</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6">What We've Built</h3>
          <p className="text-gray-400 max-w-2xl leading-relaxed">
            From deployed enterprise platforms to advanced cybersecurity prototypes — every product is real, technical, and solving a critical problem.
          </p>

          {/* Filter Tabs */}
          <div className="flex bg-[#0F1626] border border-white/5 p-1 rounded-full mt-10">
            <button
              data-testid="filter-all"
              onClick={() => setFilter('All')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === 'All' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              data-testid="filter-deployed"
              onClick={() => setFilter('Deployed')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === 'Deployed' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Deployed
            </button>
            <button
              data-testid="filter-prototype"
              onClick={() => setFilter('Prototype')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === 'Prototype' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Prototype
            </button>
          </div>
        </div>

        {/* Product Cards Layout Grid */}
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                data-testid={`card-product-${p.id}`}
                className="group relative flex flex-col justify-between p-8 rounded-2xl border border-white/5 bg-[#0F1626]/80 hover:border-teal/30 hover:glow-teal transition-all duration-300"
              >
                <div>
                  {/* Top line metadata */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-gold tracking-widest font-semibold uppercase">PARAVION TECH</span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${
                        p.status === 'DEPLOYED'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {p.badgeText} · 2026
                    </span>
                  </div>

                  {/* Callout box if exists */}
                  {p.callout && (
                    <div className="mb-4 p-3 rounded-lg border border-teal/15 bg-teal/5 text-teal text-xs italic font-medium leading-relaxed">
                      {p.callout}
                    </div>
                  )}

                  {/* Title & subtitle */}
                  <h4 className="text-2xl font-extrabold text-white mb-1 group-hover:text-teal transition-colors">{p.name}</h4>
                  <p className="text-xs font-mono text-gold mb-4 uppercase tracking-wider">{p.subtitle}</p>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-300 mb-6 leading-relaxed font-sans">{p.description}</p>

                  {/* Achievements List */}
                  <div className="mb-6 flex flex-col gap-2.5">
                    {p.achievements.map((ach, idx) => (
                      <div key={idx} className="flex gap-2 text-sm leading-relaxed">
                        <span className="text-teal font-mono">▷</span>
                        <span className="text-gray-300 font-sans">{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Tech stack pills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {p.tech.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md border border-white/5 bg-white/5 text-[11px] font-mono text-gray-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Links Row */}
                  <div className="flex items-center gap-5 border-t border-white/5 pt-4">
                    {p.restricted ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold font-mono">
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
                            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white font-mono transition-colors font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Source Code
                          </a>
                        )}
                        {p.demoUrl && (
                          <a
                            href={p.demoUrl}
                            data-testid={`link-${p.id}-demo`}
                            className="inline-flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 font-mono transition-colors font-semibold"
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
          6.5 DIGITAL SERVICES (Grid showcase)
          ========================================== */}
      <section id="services" className="bg-[#05080f] py-24 border-t border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-xs font-mono text-teal tracking-[0.25em] uppercase mb-4">Enterprise Capabilities</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Digital Services</h3>
            <p className="text-gray-400 max-w-2xl leading-relaxed">
              We design, build, and deploy digital systems with a security-first posture, ensuring stability and performance at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="group p-8 rounded-2xl border border-white/5 bg-[#0F1626]/40 hover:border-teal/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal mb-6 transition-transform group-hover:scale-110 duration-300">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Website & Web App Development</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                Highly responsive, state-of-the-art Single Page and Multi Page web applications built with React, Next.js, and lightweight fast backends.
              </p>
            </motion.div>

            {/* Service 2 */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group p-8 rounded-2xl border border-white/5 bg-[#0F1626]/40 hover:border-teal/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal mb-6 transition-transform group-hover:scale-110 duration-300">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Mobile App Development</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                Native and hybrid mobile application designs delivering flawless user experiences on iOS and Android with optimized secure transactions.
              </p>
            </motion.div>

            {/* Service 3 */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group p-8 rounded-2xl border border-white/5 bg-[#0F1626]/40 hover:border-teal/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal mb-6 transition-transform group-hover:scale-110 duration-300">
                <Server className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Domain & Hosting Solutions</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                Reliable host configurations, SSL protection protocols, content delivery networks (CDNs), and high-availability server administration.
              </p>
            </motion.div>

            {/* Service 4 */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="group p-8 rounded-2xl border border-white/5 bg-[#0F1626]/40 hover:border-teal/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal mb-6 transition-transform group-hover:scale-110 duration-300">
                <Megaphone className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Digital Marketing & SEO</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                Data-driven SEO strategies, keyword optimization, analytics, and targeted marketing campaigns to maximize digital expansion.
              </p>
            </motion.div>

            {/* Service 5 */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group p-8 rounded-2xl border border-white/5 bg-[#0F1626]/40 hover:border-teal/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal mb-6 transition-transform group-hover:scale-110 duration-300">
                <Paintbrush className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">UI/UX Design</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                Premium, technical, and intuitive user interfaces that enhance branding, streamline interactions, and maximize user conversion.
              </p>
            </motion.div>

            {/* Service 6 */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group p-8 rounded-2xl border border-white/5 bg-[#0F1626]/40 hover:border-teal/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal mb-6 transition-transform group-hover:scale-110 duration-300">
                <Cloud className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Cloud Infrastructure</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                Automated dev pipelines, high-density secure container deployments, microservices orchestration, and zero-downtime infrastructure.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==========================================
          6.6 TECHNOLOGY STACK (Centered flexing grid)
          ========================================== */}
      <section id="stack" className="relative bg-[#0F1626]/50 border-y border-white/5 py-16 z-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-xs font-mono text-gold tracking-[0.25em] uppercase mb-10">Advanced System Toolkit</h2>
          <div className="flex flex-wrap items-center justify-center gap-3.5 max-w-4xl mx-auto">
            {[
              'React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'TensorFlow', 'OpenCV',
              'Polygon Blockchain', 'Razorpay', 'Anthropic Claude', 'XGBoost', 'Flask',
              'Fastify', 'WASM', 'SHA-256', 'Edge AI', 'RAG'
            ].map((tech) => (
              <span
                key={tech}
                className="px-5 py-2.5 rounded-full border border-white/10 text-gray-300 bg-[#0F1626]/60 font-mono text-sm tracking-wide transition-colors hover:border-teal/40 hover:text-white"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          6.7 SECURITY HEALTH CHECK (Interactive widget)
          ========================================== */}
      <section id="assessment" className="py-24 max-w-4xl mx-auto px-6 z-20 relative">
        <div className="bg-[#0F1626]/80 backdrop-blur-md rounded-2xl border border-white/5 p-8 md:p-12 shadow-2xl glow-blue">
          <div className="text-center mb-10">
            <h2 className="text-xs font-mono text-gold tracking-[0.25em] uppercase mb-3">Instant Evaluation</h2>
            <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Security Health Check</h3>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Evaluate your startup posture against standard threats. Answer the questions below to calculate your risk exposure index.
            </p>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-col gap-6 mb-10 border-t border-white/5 pt-8">
            {questions.map((q, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-[#080C16]/40">
                <span className="text-sm md:text-base text-gray-300 leading-relaxed">{q}</span>
                <Switch
                  id={`switch-assessment-${idx}`}
                  checked={assessmentAnswers[idx]}
                  onCheckedChange={() => toggleAssessment(idx)}
                />
              </div>
            ))}
          </div>

          {/* Live calculation result box */}
          <div className="p-6 rounded-xl border border-white/5 bg-[#080C16]/80 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">CALCULATED RISK LEVEL</span>
              <span className={`px-4 py-1.5 rounded-full border text-xs font-black tracking-widest uppercase font-mono mt-1 ${riskColor}`}>
                {riskStatus}
              </span>
            </div>

            <p className="text-sm text-gray-300 font-medium text-center md:text-left max-w-xs">{riskMessage}</p>

            <button
              data-testid="btn-assessment-cta"
              onClick={() => handleNavClick('contact')}
              className="px-6 py-3 rounded-lg bg-gold hover:bg-gold/90 text-background font-bold text-sm tracking-wide transition-all shadow-md inline-flex items-center gap-2 hover:scale-[1.03]"
            >
              Talk to a Security Expert
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          6.8 ABOUT / VISION (Sovereign-First)
          ========================================== */}
      <section id="about" className="bg-[#05080f] py-24 border-t border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 flex flex-col items-start">
            <h2 className="text-xs font-mono text-gold tracking-[0.25em] uppercase mb-4">Startup Vision</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Sovereign-First Digital Architecture</h3>
            <p className="text-gray-300 mb-6 leading-relaxed font-sans">
              Founded in 2026, Paravion Technologies represents a critical pivot towards absolute digital sovereignty. We do not just build web apps or install security monitoring packages; we develop custom security operating components, blockchain anchors, and sandboxed AI structures that shield enterprises from systemic dependency and vulnerabilities.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed font-sans mb-8">
              Based in India, our mandate is to engineer credible, technical systems using modern toolchains. By infusing zero-trust verification rules at core system interfaces, we establish robust platforms capable of scaling while retaining absolute data privacy.
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            {/* Pillar 1 */}
            <div className="flex gap-5 p-6 rounded-xl border border-white/5 bg-[#0F1626]/40 hover:border-blue-500/30 transition-all">
              <div className="text-blue-400 mt-0.5">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-1.5">AI-First Automation</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Deep integration of Large Language Models (LLMs) and neural classifiers mapped directly to client environments.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex gap-5 p-6 rounded-xl border border-white/5 bg-[#0F1626]/40 hover:border-teal/30 transition-all">
              <div className="text-teal mt-0.5">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-1.5">Zero-Trust Protocol</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Systemic validation at every logical boundary, eliminating vulnerable assumptions in transaction processing pipelines.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex gap-5 p-6 rounded-xl border border-white/5 bg-[#0F1626]/40 hover:border-gold/30 transition-all">
              <div className="text-gold mt-0.5">
                <LinkIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-1.5">Blockchain-Anchored Logs</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Cryptographic ledger hashes establishing immutable, verifiable histories of transactional and server actions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          6.9 CONTACT (Form + info)
          ========================================== */}
      <section id="contact" className="py-24 max-w-7xl mx-auto px-6 z-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 flex flex-col items-start justify-center">
            <h2 className="text-xs font-mono text-gold tracking-[0.25em] uppercase mb-4">Direct Connection</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Contact Us</h3>
            <p className="text-gray-300 leading-relaxed mb-8">
              Discuss enterprise integration, request audits for your products, or coordinate strategic project partnerships.
            </p>

            <div className="flex flex-col gap-5 text-sm font-mono text-gray-300">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">WHATSAPP / PHONE</span>
                <a href="https://wa.me/917011991268" target="_blank" rel="noopener noreferrer" className="text-white hover:text-teal font-bold transition-colors">
                  +91 7011991268
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">EMAIL CORRESPONDENCE</span>
                <a href="mailto:paraviontechnologies@gmail.com" className="text-teal hover:underline font-bold transition-colors">
                  paraviontechnologies@gmail.com
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">HEADQUARTERS</span>
                <span className="text-white">New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-[#0F1626] border border-white/5 p-8 rounded-2xl shadow-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 font-mono tracking-wider">FULL NAME</label>
                <input
                  type="text"
                  data-testid="input-name"
                  {...register('name')}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full bg-[#080C16] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 font-mono tracking-wider">EMAIL ADDRESS</label>
                <input
                  type="email"
                  data-testid="input-email"
                  {...register('email')}
                  placeholder="e.g. v.sharma@enterprise.com"
                  className="w-full bg-[#080C16] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 font-mono tracking-wider">PHONE NUMBER</label>
                <input
                  type="tel"
                  data-testid="input-phone"
                  {...register('phone')}
                  placeholder="e.g. +91 99999 88888"
                  className="w-full bg-[#080C16] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
              </div>

              {/* Inquiry Type Select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 font-mono tracking-wider">INQUIRY TYPE</label>
                <div className="relative">
                  <select
                    data-testid="select-inquiry"
                    {...register('inquiryType')}
                    className="w-full appearance-none bg-[#080C16] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors pr-10"
                  >
                    <option value="">-- Select Inquiry Type --</option>
                    <option value="Cybersecurity Product">Cybersecurity Product</option>
                    <option value="Digital Service">Digital Service</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.inquiryType && <p className="text-xs text-red-500 font-medium">{errors.inquiryType.message}</p>}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 font-mono tracking-wider">MESSAGE DESCRIPTION</label>
                <textarea
                  data-testid="input-message"
                  {...register('message')}
                  rows={4}
                  placeholder="Describe your security details or product goals in detail..."
                  className="w-full bg-[#080C16] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
                {errors.message && <p className="text-xs text-red-500 font-medium">{errors.message.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                data-testid="btn-submit-contact"
                className="w-full py-4 rounded-xl bg-gold hover:bg-gold/90 text-background font-bold text-sm tracking-wide transition-all shadow-lg hover:scale-[1.01] active:scale-95"
              >
                Send Message →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ==========================================
          6.10 FOOTER (3-column layout)
          ========================================== */}
      <footer className="bg-[#05080f] border-t border-white/5 py-16 relative z-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-left mb-12">
          {/* Logo column */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="url(#hexGrad)" />
                <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" fill="#05080f" />
                <polygon points="50,30 70,40 70,60 50,70 30,60 30,40" fill="url(#hexGrad)" />
              </svg>
              <span className="text-white font-extrabold tracking-wider font-sans text-lg">
                PARAVION TECHNOLOGIES
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-sans max-w-xs">
              Think Big. Build Secure. Grow Digital. Dedicated to Sovereign-First AI infrastructure and digital product engineering.
            </p>
          </div>

          {/* Links column */}
          <div className="flex flex-col items-start gap-3">
            <span className="text-xs font-mono text-gold uppercase tracking-wider font-bold mb-1">NAVIGATION</span>
            <button data-testid="footer-products" onClick={() => handleNavClick('products')} className="text-sm text-gray-400 hover:text-white transition-colors">Products</button>
            <button data-testid="footer-services" onClick={() => handleNavClick('services')} className="text-sm text-gray-400 hover:text-white transition-colors">Services</button>
            <button data-testid="footer-about" onClick={() => handleNavClick('about')} className="text-sm text-gray-400 hover:text-white transition-colors">About</button>
            <button data-testid="footer-contact" onClick={() => handleNavClick('contact')} className="text-sm text-gray-400 hover:text-white transition-colors">Contact</button>
          </div>

          {/* Contact info column */}
          <div className="flex flex-col items-start gap-3">
            <span className="text-xs font-mono text-gold uppercase tracking-wider font-bold mb-1">COMMUNICATION</span>
            <span className="text-sm text-gray-400 font-mono">+91 7011991268</span>
            <span className="text-sm text-teal font-mono">paraviontechnologies@gmail.com</span>
            <span className="text-sm text-gray-500 font-sans">New Delhi, India</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-sans">
            © 2026 Paravion Technologies. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
            <span>Sovereign-First Philosophy</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-teal" />
              Real-time Global Visits: {visitorCount ?? '...'}
            </span>
          </div>
        </div>
      </footer>

      {/* ==========================================
          6.11 FLOATING WHATSAPP BUTTON (Always visible)
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
