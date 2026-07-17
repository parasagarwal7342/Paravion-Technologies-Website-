import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Trash2,
  Phone,
  MessageSquare,
  Plus
} from 'lucide-react';
import { useToast } from '../components/ui/toast';
import { useLocation } from 'wouter';
import { ThreeDBackground } from './Home';

interface LoggedOrder {
  id: string;
  name: string;
  phone: string;
  email: string;
  productType: string;
  productOption: string;
  quantity: string;
  pageCount: string;
  finishOption: string;
  deadline: string;
  deliveryMethod: string;
  shippingAddress: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'Received' | 'In Production' | 'Lamination / Binding' | 'Dispatched' | 'Completed';
  notes: string;
  timestamp: string;
}

const parseOrderText = (text: string): Partial<LoggedOrder> | null => {
  try {
    const idMatch = text.match(/\[(PRV-\d+)\]/i);
    const nameMatch = text.match(/Name:\s*(.+)/i);
    const phoneMatch = text.match(/Phone:\s*(.+)/i);
    const emailMatch = text.match(/Email:\s*(.+)/i);
    const serviceMatch = text.match(/Service:\s*(.+)/i);
    const optionMatch = text.match(/Option:\s*(.+)/i);
    const qtyMatch = text.match(/Quantity:\s*(\d+)/i);
    const pageMatch = text.match(/Pages:\s*(.+)/i);
    const finishMatch = text.match(/Finish:\s*(.+)/i);
    const deadlineMatch = text.match(/Deadline:\s*(.+)/i);
    const deliveryMatch = text.match(/Method:\s*(.+)/i);
    const addressMatch = text.match(/Address:\s*(.+)/i);
    const subtotalMatch = text.match(/Subtotal:\s*₹(\d+)/i);
    const feeMatch = text.match(/Delivery Fee\s*\(Base\):\s*₹?(\d+|FREE)/i) || text.match(/Delivery Fee:\s*₹?(\d+|FREE)/i);
    const totalMatch = text.match(/Total:\s*₹(\d+)/i);

    if (!idMatch) return null;

    return {
      id: idMatch[1],
      name: nameMatch ? nameMatch[1].trim() : 'Unknown Client',
      phone: phoneMatch ? phoneMatch[1].trim() : '',
      email: emailMatch ? emailMatch[1].trim() : '',
      productType: serviceMatch ? serviceMatch[1].trim() : 'General Printing',
      productOption: optionMatch ? optionMatch[1].trim() : '',
      quantity: qtyMatch ? qtyMatch[1].trim() : '1',
      pageCount: pageMatch ? pageMatch[1].trim() : '1',
      finishOption: finishMatch ? finishMatch[1].trim() : 'Standard',
      deadline: deadlineMatch ? deadlineMatch[1].trim() : 'Standard',
      deliveryMethod: deliveryMatch ? deliveryMatch[1].trim() : 'Self-Pickup',
      shippingAddress: addressMatch ? addressMatch[1].trim() : '',
      subtotal: subtotalMatch ? parseInt(subtotalMatch[1], 10) : 0,
      deliveryFee: feeMatch ? (feeMatch[1].toUpperCase() === 'FREE' ? 0 : parseInt(feeMatch[1], 10)) : 0,
      total: totalMatch ? parseInt(totalMatch[1], 10) : 0
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default function EmployeePortal() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [rawText, setRawText] = useState('');
  const [orders, setOrders] = useState<LoggedOrder[]>([]);

  // Load existing orders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('paravion_employee_orders');
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveOrders = (updatedList: LoggedOrder[]) => {
    setOrders(updatedList);
    localStorage.setItem('paravion_employee_orders', JSON.stringify(updatedList));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMousePos({ x, y });
  };

  const handleParseAndLog = () => {
    if (!rawText.trim()) {
      toast("Please paste order details first.", "error");
      return;
    }

    const parsed = parseOrderText(rawText);
    if (!parsed || !parsed.id) {
      toast("Failed to parse order text. Verify the format matches the PRV invoice.", "error");
      return;
    }

    // Check if order already exists
    if (orders.some(o => o.id === parsed.id)) {
      toast(`Order ID ${parsed.id} has already been logged.`, "error");
      return;
    }

    const newOrder: LoggedOrder = {
      id: parsed.id,
      name: parsed.name || 'Unknown Client',
      phone: parsed.phone || '',
      email: parsed.email || '',
      productType: parsed.productType || 'General Service',
      productOption: parsed.productOption || '',
      quantity: parsed.quantity || '1',
      pageCount: parsed.pageCount || '1',
      finishOption: parsed.finishOption || 'Standard',
      deadline: parsed.deadline || 'Standard',
      deliveryMethod: parsed.deliveryMethod || 'Self-Pickup',
      shippingAddress: parsed.shippingAddress || '',
      subtotal: parsed.subtotal || 0,
      deliveryFee: parsed.deliveryFee || 0,
      total: parsed.total || 0,
      status: 'Received',
      notes: '',
      timestamp: new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newOrder, ...orders];
    saveOrders(updated);
    setRawText('');
    toast(`Successfully logged Order ${newOrder.id} for ${newOrder.name}.`, "success");
  };

  const handleStatusChange = (id: string, nextStatus: LoggedOrder['status']) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: nextStatus } : o);
    saveOrders(updated);
    toast(`Order ${id} status updated to: ${nextStatus}`, "success");
  };

  const handleNotesChange = (id: string, notesText: string) => {
    const updated = orders.map(o => o.id === id ? { ...o, notes: notesText } : o);
    saveOrders(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to delete Order ${id}?`)) {
      const updated = orders.filter(o => o.id !== id);
      saveOrders(updated);
      toast(`Order ${id} deleted.`, "success");
    }
  };

  // Stats
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingCount = orders.filter(o => o.status === 'Received').length;
  const productionCount = orders.filter(o => o.status === 'In Production' || o.status === 'Lamination / Binding').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-black text-[#FAFAFA] overflow-x-hidden font-sans select-none pb-24"
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ThreeDBackground mousePos={mousePos} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation('/')}>
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="empHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="url(#empHexGrad)" />
              <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" fill="#000000" />
              <polygon points="50,30 70,40 70,60 50,70 30,60 30,40" fill="url(#empHexGrad)" />
            </svg>
            <span className="text-white font-extrabold tracking-[0.25em] font-sans text-lg">
              PARAVION <span className="text-teal font-light">EMPLOYEES</span>
            </span>
          </div>

          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 px-4 py-2 rounded bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-white uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-gold" /> Back to Home
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12 z-20 relative">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 font-mono">
          <div className="bg-zinc-950 border border-zinc-900 rounded p-5 relative">
            <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Estimated Revenue</span>
            <span className="text-2xl font-black text-white mt-2 block">₹{totalRevenue}</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded p-5 relative">
            <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">New/Received</span>
            <span className="text-2xl font-black text-amber-500 mt-2 block">{pendingCount}</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded p-5 relative">
            <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">In Production</span>
            <span className="text-2xl font-black text-teal mt-2 block">{productionCount}</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded p-5 relative">
            <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Completed Jobs</span>
            <span className="text-2xl font-black text-green-500 mt-2 block">{completedCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Parser Left Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-zinc-950/80 border border-zinc-900 rounded p-6 backdrop-blur-md relative overflow-hidden">
              <div className="hud-corner-tl" />
              <div className="hud-corner-tr" />
              <div className="hud-corner-bl" />
              <div className="hud-corner-br" />

              <span className="text-[10px] font-mono text-gold tracking-widest block mb-4 uppercase">
                // ORDER INGESTION ENGINE
              </span>
              
              <p className="text-zinc-500 text-[11px] leading-relaxed mb-4 font-mono">
                Paste the monospace invoice block received on WhatsApp or Email here to log it into the tracking dashboard.
              </p>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="📥 Paste order text here..."
                rows={12}
                className="w-full bg-black border border-zinc-900 rounded p-3 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-gold resize-none mb-4"
              />

              <button
                onClick={handleParseAndLog}
                className="w-full py-3 rounded bg-gold hover:bg-gold/90 text-white font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Parse & Log Order
              </button>
            </div>

            {/* Pricing Matrix Shortcut */}
            <div className="bg-zinc-950/85 border border-zinc-900 rounded p-6 font-mono text-xs">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-3 font-bold">Standard Pricing Matrix</span>
              <ul className="flex flex-col gap-2 text-zinc-400">
                <li>• B&W Print: ₹5/page</li>
                <li>• Color Print: ₹10/page</li>
                <li>• B&W Photocopy: ₹2/page</li>
                <li>• Color Photocopy: ₹5/page</li>
                <li>• Spiral Binding: ₹30 base fee</li>
                <li>• Lamination: A5 (₹15), A4 (₹20), A3 (₹40)</li>
                <li>• Photo Prints: 4x6 (₹50), A4 (₹80), A3 (₹150)</li>
                <li>• Delivery: Cost charged per distance</li>
              </ul>
            </div>
          </div>

          {/* Logged Orders Right Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs text-zinc-500 uppercase tracking-widest">// Tracked Production Runs</span>
              <span className="text-xs text-zinc-600">Total Logged: {orders.length}</span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-zinc-950/40 border border-zinc-900 rounded p-12 text-center text-zinc-500 font-mono text-xs">
                No orders logged yet. Paste an invoice on the left panel to populate this dashboard.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <AnimatePresence>
                  {orders.map((order) => {
                    const statusColors = {
                      'Received': 'border-amber-500/30 text-amber-400 bg-amber-500/5',
                      'In Production': 'border-teal-500/30 text-teal-400 bg-teal-500/5',
                      'Lamination / Binding': 'border-blue-500/30 text-blue-400 bg-blue-500/5',
                      'Dispatched': 'border-purple-500/30 text-purple-400 bg-purple-500/5',
                      'Completed': 'border-green-500/30 text-green-400 bg-green-500/5'
                    };

                    const waPrompt = `Hello ${order.name}, this is Paravion Technologies. We are currently processing your order ${order.id} (₹${order.total}) for ${order.productType}. Please send us your print/design files directly in this chat.`;

                    return (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-zinc-950/70 border border-zinc-900 rounded p-6 backdrop-blur-sm relative"
                      >
                        {/* Header card info */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-white font-mono">{order.id}</span>
                              <span className={`text-[9px] font-mono border px-2 py-0.5 rounded ${statusColors[order.status]}`}>
                                {order.status}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 mt-1 block">Logged: {order.timestamp}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as LoggedOrder['status'])}
                              className="bg-black border border-zinc-800 rounded p-2 text-[10px] font-mono text-white focus:outline-none focus:border-gold"
                            >
                              <option value="Received">Status: Received</option>
                              <option value="In Production">Status: In Production</option>
                              <option value="Lamination / Binding">Status: Lamination/Binding</option>
                              <option value="Dispatched">Status: Dispatched</option>
                              <option value="Completed">Status: Completed</option>
                            </select>
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-2 border border-zinc-900 hover:border-red-500/40 rounded text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Customer & Order details grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                          
                          {/* Left Details */}
                          <div>
                            <span className="text-[10px] text-zinc-500 block mb-2 font-bold uppercase tracking-wider">Client Contact</span>
                            <ul className="flex flex-col gap-1 text-zinc-300">
                              <li>• <span className="text-zinc-500">Name:</span> {order.name}</li>
                              <li>• <span className="text-zinc-500">Phone:</span> {order.phone}</li>
                              <li>• <span className="text-zinc-500">Email:</span> {order.email}</li>
                              {order.deliveryMethod === "Home Delivery" && (
                                <li className="mt-2 text-zinc-400 break-words">
                                  <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Shipping Address</span>
                                  {order.shippingAddress}
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Right Details */}
                          <div>
                            <span className="text-[10px] text-zinc-500 block mb-2 font-bold uppercase tracking-wider">Specifications</span>
                            <ul className="flex flex-col gap-1 text-zinc-300">
                              <li>• <span className="text-zinc-500">Product:</span> {order.productType}</li>
                              <li>• <span className="text-zinc-500">Option:</span> {order.productOption}</li>
                              <li>• <span className="text-zinc-500">Qty / Pages:</span> {order.quantity} units / {order.pageCount} pages</li>
                              <li>• <span className="text-zinc-500">Finish:</span> {order.finishOption}</li>
                              <li>• <span className="text-zinc-500">Deadline:</span> {order.deadline}</li>
                              <li className="mt-2 font-bold text-white">
                                • <span className="text-zinc-500">Invoice:</span> ₹{order.subtotal} + ₹{order.deliveryFee} (Delivery) = ₹{order.total}
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Notes and Quick Comms Action Links */}
                        <div className="border-t border-zinc-900 mt-6 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={order.notes}
                              onChange={(e) => handleNotesChange(order.id, e.target.value)}
                              placeholder="📝 Add internal processing notes..."
                              className="w-full bg-black border border-zinc-900 rounded px-3 py-2 text-[10px] font-mono text-zinc-400 focus:outline-none focus:border-gold"
                            />
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <a
                              href={`tel:${order.phone}`}
                              className="px-4 py-2 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 rounded text-[10px] font-mono text-white tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5 text-gold" /> Call
                            </a>
                            <a
                              href={`https://wa.me/${order.phone}?text=${encodeURIComponent(waPrompt)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 rounded text-[10px] font-mono text-white tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-green-500" /> WhatsApp
                            </a>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
