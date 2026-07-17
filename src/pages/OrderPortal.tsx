import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronDown,
  Upload,
  User,
  Mail,
  Phone,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '../components/ui/toast';
import { useLocation } from 'wouter';
import { ThreeDBackground } from './Home';

const printQuoteSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  productType: z.string().min(1, "Product type selection is required"),
  productOption: z.string().min(1, "Product option is required"),
  quantity: z.number().min(1, "Quantity must be at least 1 unit"),
  pageCount: z.number().min(1, "Page count must be at least 1"),
  deadline: z.string().min(1, "Delivery timeline target is required"),
  finishOption: z.string().min(1, "Please select a materials finish"),
  deliveryMethod: z.string().min(1, "Please select a delivery method"),
  shippingAddress: z.string().optional()
}).refine((data) => {
  if (data.deliveryMethod === "Home Delivery" && (!data.shippingAddress || data.shippingAddress.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Shipping address is required for Home Delivery",
  path: ["shippingAddress"]
});

type PrintQuoteFormInputs = z.infer<typeof printQuoteSchema>;

const getOptionsForProduct = (prod: string) => {
  switch (prod) {
    case "Website Design":
      return [{ value: "Standard Package", label: "Standard Design & Build (Starting ₹15,000)" }];
    case "App Development":
      return [{ value: "Standard App Build", label: "Custom Android & iOS Build (Starting ₹25,000)" }];
    case "Domain & Hosting":
      return [{ value: "1-Year Secure Package", label: "1 Year Domain & Hosting (₹1,500)" }];
    case "Digital Marketing":
      return [{ value: "Monthly Optimization Package", label: "Monthly Marketing Setup (₹5,000/mo)" }];
    case "Document Printing":
      return [
        { value: "Black & White (A4)", label: "Black & White A4 Page (₹5/page)" },
        { value: "Color (A4)", label: "Color A4 Page (₹10/page)" }
      ];
    case "High-Quality Photocopying":
      return [
        { value: "Black & White (A4)", label: "Black & White A4 Copy (₹2/page)" },
        { value: "Color (A4)", label: "Color A4 Copy (₹5/page)" }
      ];
    case "Protective Lamination":
      return [
        { value: "A5 Size", label: "A5 Lamination Sheet (₹15/sheet)" },
        { value: "A4 Size", label: "A4 Lamination Sheet (₹20/sheet)" },
        { value: "A3 Size", label: "A3 Lamination Sheet (₹40/sheet)" }
      ];
    case "Professional Spiral Binding":
      return [
        { value: "Binding Only", label: "Spiral Binding Only (₹30/book)" },
        { value: "Print & Bind (B&W)", label: "Print B&W + Spiral Binding (₹30 + ₹5/page)" },
        { value: "Print & Bind (Color)", label: "Print Color + Spiral Binding (₹30 + ₹10/page)" }
      ];
    case "Photo Printing":
      return [
        { value: "4x6 Size", label: "4x6 Photo Print (₹50/print)" },
        { value: "A4 Size", label: "A4 Photo Print (₹80/print)" },
        { value: "A3 Size", label: "A3 Photo Print (₹150/print)" }
      ];
    default:
      return [];
  }
};

const revealVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1
  }
};

export default function OrderPortal() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMousePos({ x, y });
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<PrintQuoteFormInputs>({
    resolver: zodResolver(printQuoteSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      productType: '',
      productOption: '',
      quantity: 1,
      pageCount: 1,
      deadline: '',
      finishOption: '',
      deliveryMethod: 'Self-Pickup',
      shippingAddress: ''
    }
  });

  const watchedProduct = watch("productType");
  const watchedOption = watch("productOption");
  const watchedQuantity = watch("quantity") || 1;
  const watchedPageCount = watch("pageCount") || 1;
  const watchedDeliveryMethod = watch("deliveryMethod");

  // Dynamic Pricing Engine
  const calculatePricing = () => {
    if (!watchedProduct || !watchedOption) {
      return { subtotal: 0, deliveryFee: 0, total: 0, details: '' };
    }

    let unitPrice = 0;
    let baseBindingFee = 0;
    let detailText = '';

    // Digital Services
    if (watchedProduct === "Website Design") {
      unitPrice = 15000;
      detailText = `Starting price for design & development`;
    } else if (watchedProduct === "App Development") {
      unitPrice = 25000;
      detailText = `Starting price for Android/iOS applications`;
    } else if (watchedProduct === "Domain & Hosting") {
      unitPrice = 1500;
      detailText = `Standard Year Hosting Package`;
    } else if (watchedProduct === "Digital Marketing") {
      unitPrice = 5000;
      detailText = `Marketing optimizations package`;
    }
    // Document Printing
    else if (watchedProduct === "Document Printing") {
      if (watchedOption === "Black & White (A4)") {
        unitPrice = 5;
        detailText = `₹5 / page (Black & White print)`;
      } else {
        unitPrice = 10;
        detailText = `₹10 / page (Color print)`;
      }
    }
    // Photocopy Shop
    else if (watchedProduct === "High-Quality Photocopying") {
      if (watchedOption === "Black & White (A4)") {
        unitPrice = 2;
        detailText = `₹2 / page (Photocopy B&W)`;
      } else {
        unitPrice = 5;
        detailText = `₹5 / page (Photocopy Color)`;
      }
    }
    // Protective Lamination
    else if (watchedProduct === "Protective Lamination") {
      if (watchedOption === "A5 Size") unitPrice = 15;
      else if (watchedOption === "A4 Size") unitPrice = 20;
      else unitPrice = 40; // A3 Size
      detailText = `₹${unitPrice} / lamination sheet`;
    }
    // Spiral Binding
    else if (watchedProduct === "Professional Spiral Binding") {
      baseBindingFee = 30; // standard binding fee
      if (watchedOption === "Print & Bind (B&W)") {
        unitPrice = 5; // printing cost per page
        detailText = `₹30 binding fee + ₹5 / page B&W printing`;
      } else if (watchedOption === "Print & Bind (Color)") {
        unitPrice = 10; // printing cost per page
        detailText = `₹30 binding fee + ₹10 / page color printing`;
      } else {
        unitPrice = 0; // binding only (bring own pages)
        detailText = `₹30 standard spiral binding fee (no printing)`;
      }
    }
    // Photo Printing
    else if (watchedProduct === "Photo Printing") {
      if (watchedOption === "4x6 Size") unitPrice = 50;
      else if (watchedOption === "A4 Size") unitPrice = 80;
      else unitPrice = 150; // A3 Size
      detailText = `₹${unitPrice} / photo print`;
    }

    // Subtotal Calculation
    let subtotal = 0;
    if (watchedProduct === "Professional Spiral Binding") {
      subtotal = (watchedPageCount * unitPrice + baseBindingFee) * watchedQuantity;
    } else if (watchedProduct === "Document Printing" || watchedProduct === "High-Quality Photocopying") {
      subtotal = watchedPageCount * unitPrice * watchedQuantity;
    } else {
      subtotal = unitPrice * watchedQuantity;
    }

    // Delivery Fee calculation (Base charge ₹40 is added for Home Delivery. No Free Delivery threshold exists.)
    let deliveryFee = 0;
    if (watchedDeliveryMethod === "Home Delivery") {
      deliveryFee = 40;
    }

    const total = subtotal + deliveryFee;
    return { subtotal, deliveryFee, total, details: detailText };
  };

  const onSubmitQuote = (data: PrintQuoteFormInputs) => {
    console.log("Order checkout confirmed:", data);
    const invoice = calculatePricing();
    toast(`Order Placed! Subtotal: ₹${invoice.subtotal}. Final delivery fee will be confirmed based on distance. Order ID: PRV-${Math.floor(Math.random() * 900000 + 100000)}`, "success");
    reset();
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-black text-[#FAFAFA] overflow-x-hidden font-sans select-none pb-16 animate-fade-in"
    >
      {/* 3D background wrapper */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ThreeDBackground mousePos={mousePos} />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation('/')}>
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="orderHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="url(#orderHexGrad)" />
              <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" fill="#000000" />
              <polygon points="50,30 70,40 70,60 50,70 30,60 30,40" fill="url(#orderHexGrad)" />
            </svg>
            <span className="text-white font-extrabold tracking-[0.25em] font-sans text-lg">
              PARAVION <span className="text-teal font-light">TECHNOLOGIES</span>
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

      {/* Main Order Form Layout */}
      <main className="max-w-6xl mx-auto px-6 pt-16 z-20 relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={revealVariants}
          transition={{ duration: 0.6 }}
          className="bg-black/85 border border-zinc-900 rounded p-8 shadow-2xl relative backdrop-blur-md"
        >
          {/* HUD online status mark */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
            CHECKOUT_TERMINAL_ONLINE
          </div>

          <h3 className="text-xs font-mono text-gold tracking-widest uppercase mb-2">Order Portal</h3>
          <h4 className="text-2xl font-bold text-white mb-6">Interactive Checkout & Calculator</h4>

          <form onSubmit={handleSubmit(onSubmitQuote)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Inputs (7 Cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
                  Product/Service Division
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
                  Service Option
                </label>
                <div className="relative">
                  <select
                    {...register('productOption')}
                    disabled={!watchedProduct}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-gold appearance-none font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Choose Option --</option>
                    {getOptionsForProduct(watchedProduct).map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
                {errors.productOption && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.productOption.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
                  {["Document Printing", "High-Quality Photocopying", "Professional Spiral Binding"].includes(watchedProduct) ? "Number of Copies" : "Quantity (Units)"}
                </label>
                <input
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  placeholder="1"
                  className="bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-gold transition-colors font-mono"
                />
                {errors.quantity && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.quantity.message}</p>}
              </div>

              {["Document Printing", "High-Quality Photocopying", "Professional Spiral Binding"].includes(watchedProduct) && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
                    Document Page Count (Per Copy)
                  </label>
                  <input
                    type="number"
                    {...register('pageCount', { valueAsNumber: true })}
                    placeholder="1"
                    className="bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-gold transition-colors font-mono"
                  />
                  {errors.pageCount && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.pageCount.message}</p>}
                </div>
              )}

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
                  <option value="Standard Document Bond Paper">Standard Document Paper</option>
                  <option value="Colored Stock Paper">Colored Stock Paper</option>
                  <option value="Not Applicable (Digital)">Not Applicable (Digital/Binding Only)</option>
                </select>
                {errors.finishOption && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.finishOption.message}</p>}
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
                  Delivery Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`border rounded p-3 flex items-center justify-between cursor-pointer transition-all ${watchedDeliveryMethod === "Self-Pickup" ? "border-gold bg-gold/5" : "border-zinc-900 bg-zinc-950"}`}>
                    <span className="text-xs text-white font-mono">Self-Pickup</span>
                    <input type="radio" value="Self-Pickup" {...register('deliveryMethod')} className="accent-gold" />
                  </label>
                  <label className={`border rounded p-3 flex items-center justify-between cursor-pointer transition-all ${watchedDeliveryMethod === "Home Delivery" ? "border-gold bg-gold/5" : "border-zinc-900 bg-zinc-950"}`}>
                    <span className="text-xs text-white font-mono">Home Delivery</span>
                    <input type="radio" value="Home Delivery" {...register('deliveryMethod')} className="accent-gold" />
                  </label>
                </div>
              </div>

              {watchedDeliveryMethod === "Home Delivery" && (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
                    Shipping Address (Required for Delivery)
                  </label>
                  <textarea
                    {...register('shippingAddress')}
                    placeholder="Enter your complete home or office address for delivery"
                    rows={3}
                    className="bg-zinc-950 border border-zinc-900 rounded p-3 text-xs text-white focus:outline-none focus:border-gold transition-colors font-mono resize-none"
                  />
                  {errors.shippingAddress && <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.shippingAddress.message}</p>}
                </div>
              )}

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-gold" /> Upload Printing Documents
                </label>
                <div className="border border-dashed border-zinc-800 rounded bg-zinc-950 p-6 text-center cursor-pointer hover:border-gold/50 transition-colors">
                  <span className="text-[11px] text-zinc-500 block font-mono">DRAG & DROP PRINT FILE (.PDF, .DOCX, .JPG, .PNG) OR CLICK TO BROWSE</span>
                </div>
              </div>
            </div>

            {/* Right Column: Invoice Summary (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="bg-zinc-950 border border-zinc-900 rounded p-6 flex flex-col justify-between h-full relative overflow-hidden min-h-[400px]">
                <div className="hud-corner-tl" />
                <div className="hud-corner-tr" />
                <div className="hud-corner-bl" />
                <div className="hud-corner-br" />

                <div>
                  <span className="text-[10px] font-mono text-gold tracking-widest block mb-4 uppercase">
                    // ORDER INVOICE SUMMARY
                  </span>
                  
                  <div className="flex flex-col gap-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-zinc-900 pb-2">
                      <span className="text-zinc-500">Service:</span>
                      <span className="text-white font-bold">{watchedProduct || "Not Selected"}</span>
                    </div>
                    
                    <div className="flex justify-between border-b border-zinc-900 pb-2">
                      <span className="text-zinc-500">Option:</span>
                      <span className="text-white font-bold">{watchedOption || "Not Selected"}</span>
                    </div>

                    {["Document Printing", "High-Quality Photocopying", "Professional Spiral Binding"].includes(watchedProduct) && (
                      <div className="flex justify-between border-b border-zinc-900 pb-2">
                        <span className="text-zinc-500">Pages:</span>
                        <span className="text-white font-bold">{watchedPageCount} pages</span>
                      </div>
                    )}

                    <div className="flex justify-between border-b border-zinc-900 pb-2">
                      <span className="text-zinc-500">Quantity:</span>
                      <span className="text-white font-bold">{watchedQuantity} {watchedProduct === "Professional Spiral Binding" ? "books" : "units"}</span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-900 pb-2">
                      <span className="text-zinc-500">Delivery:</span>
                      <span className="text-white font-bold">{watchedDeliveryMethod}</span>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Subtotal:</span>
                        <span className="text-white font-bold">₹{calculatePricing().subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Delivery Fee (Base):</span>
                        <span className={calculatePricing().deliveryFee === 0 ? "text-teal font-bold" : "text-zinc-400"}>
                          {watchedDeliveryMethod === "Self-Pickup" ? "₹0 (Pickup)" : `₹${calculatePricing().deliveryFee}`}
                        </span>
                      </div>
                      
                      {watchedDeliveryMethod === "Home Delivery" && (
                        <p className="text-[9px] text-amber-500 mt-1 leading-normal">
                          * Note: Delivery charges will be calculated and charged separately based on your location/distance after order confirmation.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-900">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-mono text-zinc-400 uppercase">Estimated Total:</span>
                    <span className="text-2xl font-black text-white">₹{calculatePricing().total}</span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!watchedProduct || !watchedOption}
                    className="w-full py-4 rounded bg-gold hover:bg-gold/90 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-gold/20"
                  >
                    Place Order Now
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
