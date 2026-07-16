# Paravion Studios — Website Documentation
> **"Think Big. Build Secure. Grow Digital."**

Welcome to the official repository for **Paravion Studios**, a 2026 Indian cybersecurity, digital design engineering, and bulk industrial printing startup. 

This project is a single-page React marketing application designed with a premium, dark-mode-only cinematic studio aesthetic. It leverages hardware-accelerated 3D WebGL scenes to map scroll transitions to an interactive digital journey.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [File Structure](#file-structure)
4. [3D WebGL Background Architecture](#3d-webgl-background-architecture)
5. [Core Creative Divisions](#core-creative-divisions)
   - [Division 01: Digital Services](#division-01-digital-services)
   - [Division 02: Printing Services](#division-02-printing-services)
6. [Interactive Quoting Terminal](#interactive-quoting-terminal)
7. [Deployment & Local Setup](#deployment--local-setup)

---

## Project Overview
* **Company**: Paravion Technologies / Studios
* **Type**: Single-page interactive marketing portfolio
* **Theme**: Deep cinematic dark mode (pure black backgrounds with glassmorphic overlay cards)
* **Visual Anchors**: Drifting metallic 3D cubes, center point light core, radial warp stars, and scroll-linked color interpolation.
* **Routing**: Minimal page routing via `Wouter`.

---

## Tech Stack
* **Framework**: React 19 + Vite
* **Styling**: Tailwind CSS
* **3D Rendering**: Three.js (implemented directly on standard WebGL canvas inside React for optimal rendering cycles)
* **Animations**: Framer Motion (leveraged for scroll entry triggers, accordion accordions, and overlays)
* **Form Validation**: React Hook Form + Zod (type-safe validation mapping)
* **Deployment**: Firebase Hosting (Classic Node deployment)

---

## File Structure
```bash
paravion/
├── .firebase/                    # Firebase cache files
├── dist/                         # Production build output
├── public/                       # Static public assets
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── toast.tsx        # Toast notification system
│   ├── pages/
│   │   └── Home.tsx             # Main page including WebGL canvas and sections
│   ├── App.tsx                  # Root React routing structure
│   ├── index.css                # Global stylesheet configuring cinematic utilities
│   └── main.tsx                 # Client entrypoint mount
├── firebase.json                 # Firebase deployment configuration
├── package.json                  # Dependencies configurations
├── tsconfig.json                 # TypeScript rules configurations
└── vite.config.ts                # Vite pipeline configs
```

---

## 3D WebGL Background Architecture
The site features a fixed-position background running a custom Three.js simulation:
* **Cube Field**: Creates 45 drifting metallic/glass cubes that float forward along the Z-axis, rotating individually. Cube materials dynamically adjust roughness and metalness parameters for a premium look.
* **Central Core**: Features a wireframe icosahedron sphere core surrounded by double-axis orbit rings.
* **Warp Particles**: Generates a custom `THREE.Points` particle system radiating outwards from the core.
* **Interactive Parallax**: Camera position tracking hooks onto both the cursor mouse coordinates (X, Y) and the scroll position (`currentScrollRatio`).
* **Scroll Color Interpolation**:
  - The scene monitors scroll depth.
  - From scroll `0.0` to `0.45`, the scene maintains an **electric cyan/blue** highlight (`#06b6d4`).
  - From scroll `0.45` to `1.0`, the scene color-interpolates to a **warm amber/orange** highlight (`#f59e0b`).

---

## Core Creative Divisions

### Division 01: Digital Services
Styled with a **cyan** visual outline. Offers structural solutions across:
1. **Web Design & Development**: Interactive React single-page systems.
2. **Mobile & Hybrid Apps**: Native iOS/Android responsive layouts.
3. **Branding & Identity System**: Typography scales, color palettes, and vectors.
4. **Digital Marketing & Copy**: Data pipelines and conversion content.
5. **Search Engine Optimization**: Core Web Vitals audit and indexing optimizations.
6. **Video & Motion Editing**: Cinematic promo trailers and logo animations.

### Division 02: Printing Services
Styled with an **amber/orange** visual outline. Emphasizes production volume:
1. **Business Cards & Stationery**: Textured card stock, gold foil stamp.
2. **Brochures & Flyers**: Pamphlets and product catalogs.
3. **Banners & Signs**: Pull-up event displays and backdrops.
4. **Custom Packaging**: Product boxes and custom merchandise containers.
5. **Wholesale Print Runs**: Offset bulk manuals and calendar print sets.
6. **Custom Merchandise**: Branded hoodies, activewear, and onboarding kits.

---

## Interactive Quoting Terminal
The **Quoting Terminal** compiles quote details via React Hook Form and Zod:
* **Validations**: Enforces valid emails, 10-digit phone formats, and positive unit inputs.
* **Minimum Order Quantity (MOQ)**: Restricts orders to a minimum of 50 units.
* **Materials & Deadlines**: Compiles delivery urgency speeds (24-48 hr rush options) and paper finishes (matte, soft-touch satin, textured linen, foil stamp).
* **Artwork Uploads**: Includes custom drop-areas for vector artwork files (`.AI`, `.PDF`, `.EPS`).

---

## Deployment & Local Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Local Development Server
```bash
pnpm run dev
```

### 3. Compile Production Bundle
Verify TypeScript output and build the minified asset assets:
```bash
pnpm run build
```

### 4. Deploy to Firebase
Ensure you have authentications setup, and deploy:
```bash
npx firebase-tools deploy --only hosting
```
