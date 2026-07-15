import { Link } from 'wouter';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080C16] px-4 relative overflow-hidden">
      {/* Cyber Mesh Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      
      {/* Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <div className="relative text-center max-w-md w-full bg-[#0F1626]/80 backdrop-blur-md p-8 rounded-2xl border border-white/5 shadow-2xl glow-blue">
        <div className="inline-flex p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 font-sans">404</h1>
        <p className="text-sm font-mono text-gold mb-6">ROUTE_NOT_FOUND</p>
        
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          The requested security clearance node does not exist or has been relocated within the network hierarchy.
        </p>

        <Link href="/">
          <span className="cursor-pointer inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/20 transition-all">
            <ArrowLeft className="w-4 h-4" />
            Return to Command Center
          </span>
        </Link>
      </div>
    </div>
  );
}
