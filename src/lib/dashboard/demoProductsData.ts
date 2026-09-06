/*
|-----------------------------------------
| setting up demoProductsData.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 01 September, 2026
|-----------------------------------------
*/

import { emptyRichText, normalizeSlug, type ProductInput } from "./catalog";

export type RawDemoProduct = {
  name: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  realPrice: number;
  discountPrice: number;
  stock: number;
  star: number;
  shortDescription: string;
  features: string[];
  image: string;
};

// 40 curated demo products matching categories from the Category page with real, distinct images
export const DEMO_PRODUCTS: RawDemoProduct[] = [
  // 1. Software & Apps
  {
    name: "CloudPulse SaaS Analytics & Metrics Platform",
    brand: "CloudPulse",
    categorySlug: "software-apps",
    categoryName: "Software & Apps",
    realPrice: 12000,
    discountPrice: 9600,
    stock: 99,
    star: 4.9,
    shortDescription: "Real-time enterprise analytics suite with automated funnel tracking and executive dashboards.",
    features: ["Real-time event tracking", "Custom dashboard builder", "Automated weekly reports", "REST API & Webhooks"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "DevForge AI Code Assistant & Terminal",
    brand: "DevForge",
    categorySlug: "software-apps",
    categoryName: "Software & Apps",
    realPrice: 6500,
    discountPrice: 5200,
    stock: 85,
    star: 4.8,
    shortDescription: "Intelligent CLI tool and IDE extension delivering automated refactoring and unit test generation.",
    features: ["Multi-language code completion", "Instant test suite generation", "Local LLM execution option", "Git flow automation"],
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "CyberShield VPN & Endpoint Security",
    brand: "CyberShield",
    categorySlug: "software-apps",
    categoryName: "Software & Apps",
    realPrice: 4800,
    discountPrice: 3840,
    stock: 120,
    star: 4.7,
    shortDescription: "Zero-log encrypted VPN network with automated threat blocking and malware isolation.",
    features: ["AES-256 WireGuard protocol", "Global 10Gbps server network", "Ad & tracker blocker", "Unlimited device connection"],
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
  },

  // 2. Web Templates & Themes
  {
    name: "Apex Next.js 15 E-Commerce Storefront Template",
    brand: "ThemeCraft",
    categorySlug: "web-templates-themes",
    categoryName: "Web Templates & Themes",
    realPrice: 4500,
    discountPrice: 3600,
    stock: 50,
    star: 4.9,
    shortDescription: "Production-ready headless storefront built with Next.js App Router, Tailwind CSS, and Stripe checkout.",
    features: ["Full TypeScript support", "Mobile-first responsive layouts", "Lighthouse 98+ score", "Stripe & LemonSqueezy integration"],
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Vanguard Agency & Creative Portfolio Theme",
    brand: "PixelStudio",
    categorySlug: "web-templates-themes",
    categoryName: "Web Templates & Themes",
    realPrice: 3500,
    discountPrice: 2800,
    stock: 60,
    star: 4.8,
    shortDescription: "Sleek dark-mode portfolio theme featuring smooth page transitions and dynamic case study templates.",
    features: ["Framer Motion animations", "Dynamic MDX blog included", "Custom contact form handler", "SEO & OpenGraph pre-configured"],
    image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Minimalist Editorial & Publication Theme",
    brand: "TypoCraft",
    categorySlug: "web-templates-themes",
    categoryName: "Web Templates & Themes",
    realPrice: 2800,
    discountPrice: 2240,
    stock: 40,
    star: 4.6,
    shortDescription: "Distraction-free publishing theme engineered for newsletters, essays, and long-form publications.",
    features: ["Optimized typography scales", "Newsletter signup modals", "Reading time estimator", "Dark and light reading modes"],
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&auto=format&fit=crop&q=80",
  },

  // 3. Graphics & UI Kits
  {
    name: "Horizon Pro Design System & Figma UI Kit",
    brand: "DesignCore",
    categorySlug: "graphics-ui-kits",
    categoryName: "Graphics & UI Kits",
    realPrice: 5500,
    discountPrice: 4400,
    stock: 75,
    star: 4.9,
    shortDescription: "Over 2,500 customizable Figma components with auto-layout v5, responsive tokens, and dark theme.",
    features: ["2,500+ scalable Figma components", "Light & dark theme tokens", "Figma variables ready", "Free lifetime version updates"],
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Lumina 3D Glassmorphic Icon Collection",
    brand: "IconForge",
    categorySlug: "graphics-ui-kits",
    categoryName: "Graphics & UI Kits",
    realPrice: 2500,
    discountPrice: 2000,
    stock: 80,
    star: 4.7,
    shortDescription: "1,200 ultra-high resolution 3D icons with PNG, SVG, and editable Blender source files.",
    features: ["3000x3000px transparent PNGs", "Includes Blender 3D source files", "5 color styling variations", "Commercial usage license"],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Veritas Brand Identity & Vector Mockup Suite",
    brand: "BrandMatrix",
    categorySlug: "graphics-ui-kits",
    categoryName: "Graphics & UI Kits",
    realPrice: 3800,
    discountPrice: 3040,
    stock: 55,
    star: 4.8,
    shortDescription: "Comprehensive branding kit with stationery mockups, typography guidelines, and social media assets.",
    features: ["Photorealistic PSD mockups", "Vector logo variations", "Social media post templates", "Print-ready CMYK layouts"],
    image: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=800&auto=format&fit=crop&q=80",
  },

  // 4. E-books & Guides
  {
    name: "Full-Stack Architecture Mastery: The Guide",
    brand: "TechPress",
    categorySlug: "ebooks-guides",
    categoryName: "E-books & Guides",
    realPrice: 1800,
    discountPrice: 1440,
    stock: 100,
    star: 4.9,
    shortDescription: "Practical guide to designing distributed microservices, caching strategies, and resilient DB schemas.",
    features: ["380 pages of in-depth diagrams", "Interactive code sandbox links", "Available in PDF, ePub, & Kindle", "Production checklist included"],
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "The Zero-to-One Founder Playbook",
    brand: "VenturePress",
    categorySlug: "ebooks-guides",
    categoryName: "E-books & Guides",
    realPrice: 1600,
    discountPrice: 1280,
    stock: 90,
    star: 4.8,
    shortDescription: "Step-by-step roadmap for validating product ideas, finding early adopters, and fundraising.",
    features: ["Financial model spreadsheets", "Pitch deck templates", "Customer interview framework", "Audiobook version included"],
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Design Systems for Frontend Engineers",
    brand: "UIBooks",
    categorySlug: "ebooks-guides",
    categoryName: "E-books & Guides",
    realPrice: 2200,
    discountPrice: 1760,
    stock: 70,
    star: 4.7,
    shortDescription: "Comprehensive manual on token architecture, headless UI components, and web accessibility standards.",
    features: ["WCAG 2.2 accessibility guide", "Token naming conventions", "Storybook integration patterns", "Real-world case studies"],
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=800&auto=format&fit=crop&q=80",
  },

  // 5. Online Courses & Tutorials
  {
    name: "Complete Next.js 15 & React 19 Bootcamp",
    brand: "CodeAcademy",
    categorySlug: "online-courses-tutorials",
    categoryName: "Online Courses & Tutorials",
    realPrice: 9500,
    discountPrice: 7600,
    stock: 150,
    star: 4.9,
    shortDescription: "40 hours of HD video training covering Server Actions, App Router, SSR, Turbopack, and deployment.",
    features: ["40+ hours on-demand 4K video", "6 real-world portfolio projects", "Private Discord developer community", "Certificate of completion"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "AI Agents & Autonomous Workflows Masterclass",
    brand: "NeuroTech",
    categorySlug: "online-courses-tutorials",
    categoryName: "Online Courses & Tutorials",
    realPrice: 14000,
    discountPrice: 11200,
    stock: 120,
    star: 4.9,
    shortDescription: "Build production-grade multi-agent architectures, RAG pipelines, and tool-calling systems.",
    features: ["LangChain & LlamaIndex deep dive", "Local open-source model fine-tuning", "Live bi-weekly mentor Q&A", "Source code repository access"],
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Data-Driven Growth & Performance Marketing",
    brand: "GrowthForge",
    categorySlug: "online-courses-tutorials",
    categoryName: "Online Courses & Tutorials",
    realPrice: 8000,
    discountPrice: 6400,
    stock: 85,
    star: 4.7,
    shortDescription: "Master paid acquisition, conversion rate optimization, and retention loops for modern brands.",
    features: ["Google & Meta ads playbook", "A/B testing statistical models", "Attribution tracking templates", "LTV-to-CAC calculation sheets"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
  },

  // 6. Audio & Music Tracks
  {
    name: "Cinematic Ambient Soundscapes Vol. 1",
    brand: "SonicWave",
    categorySlug: "audio-music-tracks",
    categoryName: "Audio & Music Tracks",
    realPrice: 2900,
    discountPrice: 2320,
    stock: 200,
    star: 4.8,
    shortDescription: "Royalty-free cinematic soundscapes and orchestral swells for films, trailers, and YouTube videos.",
    features: ["24-bit 96kHz lossless WAV files", "Includes individual instrument stems", "Commercial broadcast license", "Loopable ambient edits"],
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Lo-Fi Beats for Creators & Podcasts",
    brand: "ChillTape",
    categorySlug: "audio-music-tracks",
    categoryName: "Audio & Music Tracks",
    realPrice: 2100,
    discountPrice: 1680,
    stock: 180,
    star: 4.7,
    shortDescription: "50 warm, nostalgic lo-fi instrumental tracks curated specifically for streams and podcasts.",
    features: ["50 royalty-free original tracks", "Content ID cleared on YouTube/Twitch", "BPM and musical key labeled", "WAV & 320kbps MP3 formats"],
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Studio Foley & Game Sound Effects 800+",
    brand: "FoleyCraft",
    categorySlug: "audio-music-tracks",
    categoryName: "Audio & Music Tracks",
    realPrice: 3400,
    discountPrice: 2720,
    stock: 150,
    star: 4.8,
    shortDescription: "Over 800 game-ready sound effects including UI clicks, weapon impacts, footsteps, and sci-fi lasers.",
    features: ["800+ categorized SFX audio clips", "Unity and Unreal Engine sound cues", "Dry and wet acoustic versions", "Metadata tagged for Soundminer"],
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
  },

  // 7. 3D Models & CGI Assets
  {
    name: "Cyberpunk Hovercraft 3D Sci-Fi Vehicle",
    brand: "PolygonStudio",
    categorySlug: "3d-models-cgi-assets",
    categoryName: "3D Models & CGI Assets",
    realPrice: 5800,
    discountPrice: 4640,
    stock: 65,
    star: 4.9,
    shortDescription: "Game-ready sci-fi vehicle with fully articulated landing gear, cockpit interior, and 4K PBR textures.",
    features: ["Rigged and ready for Unreal Engine 5", "4K PBR metallic/roughness textures", "3 level-of-detail (LOD) meshes", "FBX, OBJ, and Blender formats"],
    image: "https://images.unsplash.com/photo-1633493106115-6238b6d39cb2?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Scandinavian Interior Architecture 3D Assets",
    brand: "ArchRender",
    categorySlug: "3d-models-cgi-assets",
    categoryName: "3D Models & CGI Assets",
    realPrice: 6900,
    discountPrice: 5520,
    stock: 45,
    star: 4.8,
    shortDescription: "Photorealistic modular Scandinavian living room furniture collection optimized for architectural rendering.",
    features: ["Physically calibrated materials", "V-Ray and Corona shader presets", "Real-world metric measurements", "Detailed fabric micro-displacement"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
  },

  // 8. Consumer Electronics
  {
    name: "SonicPulse Wireless Active Noise-Cancelling Headphones",
    brand: "SonicPulse",
    categorySlug: "consumer-electronics",
    categoryName: "Consumer Electronics",
    realPrice: 4500,
    discountPrice: 3825,
    stock: 28,
    star: 4.8,
    shortDescription: "Premium over-ear headphones with 40dB hybrid ANC, transparency mode, and 45-hour battery life.",
    features: ["Hybrid Active Noise Cancellation 40dB", "45-hour playback time", "Fast USB-C charging", "Multipoint Bluetooth 5.3"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "PulseFit Smart Fitness Tracker AMOLED Watch",
    brand: "PulseFit",
    categorySlug: "consumer-electronics",
    categoryName: "Consumer Electronics",
    realPrice: 3200,
    discountPrice: 2720,
    stock: 40,
    star: 4.6,
    shortDescription: "Waterproof smartwatch featuring continuous heart rate, SpO2 monitor, GPS, and 14-day battery.",
    features: ["1.47-inch AMOLED color display", "24/7 Heart rate & SpO2 tracking", "5ATM water resistance", "14 days standby battery"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "SoundWave Rugged Waterproof Bluetooth Speaker",
    brand: "SoundWave",
    categorySlug: "consumer-electronics",
    categoryName: "Consumer Electronics",
    realPrice: 2750,
    discountPrice: 2200,
    stock: 35,
    star: 4.7,
    shortDescription: "Rugged outdoor wireless speaker delivering punchy 360-degree audio with IPX7 submersible casing.",
    features: ["20W stereo output with dual radiators", "IPX7 submersible waterproof", "16-hour continuous playtime", "TWS dual speaker pairing"],
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "HyperCharge 100W GaN 4-Port Fast Wall Charger",
    brand: "HyperCharge",
    categorySlug: "consumer-electronics",
    categoryName: "Consumer Electronics",
    realPrice: 2500,
    discountPrice: 2000,
    stock: 45,
    star: 4.8,
    shortDescription: "Compact GaN III fast charger powering laptops, tablets, and smartphones simultaneously.",
    features: ["100W Power Delivery 3.0", "3x USB-C + 1x USB-A ports", "Advanced GaN III thermal protection", "Foldable travel plug design"],
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
  },

  // 9. Computers & Accessories
  {
    name: "KeyForge Pro RGB Hot-Swappable Mechanical Keyboard",
    brand: "KeyForge",
    categorySlug: "computers-accessories",
    categoryName: "Computers & Accessories",
    realPrice: 5200,
    discountPrice: 4420,
    stock: 22,
    star: 4.8,
    shortDescription: "Hot-swappable mechanical keyboard with pre-lubed switches and sound-dampening foam.",
    features: ["Hot-swappable 5-pin PCB", "Double-shot PBT keycaps", "Per-key RGB customization", "Aircraft-grade aluminum frame"],
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "AeroGlide Precision Ergonomic Wireless Mouse",
    brand: "AeroGlide",
    categorySlug: "computers-accessories",
    categoryName: "Computers & Accessories",
    realPrice: 1850,
    discountPrice: 1480,
    stock: 35,
    star: 4.6,
    shortDescription: "Precision optical mouse with 4000 DPI sensor, silent micro-switches, and dual-mode wireless.",
    features: ["Dual Bluetooth & 2.4GHz USB dongle", "Adjustable DPI up to 4000", "Silent micro-switches", "Rechargeable 600mAh battery"],
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "UltraView 34-inch 165Hz Curved Gaming Monitor",
    brand: "UltraView",
    categorySlug: "computers-accessories",
    categoryName: "Computers & Accessories",
    realPrice: 38900,
    discountPrice: 33065,
    stock: 12,
    star: 4.9,
    shortDescription: "Ultrawide 1500R curved monitor with WQHD resolution, 165Hz refresh rate, and 1ms response.",
    features: ["WQHD 3440x1440 resolution", "165Hz high refresh rate", "HDR400 certified", "1500R immersive curvature"],
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "OmniHub 9-in-1 Aluminum USB-C Multiport Dock",
    brand: "OmniHub",
    categorySlug: "computers-accessories",
    categoryName: "Computers & Accessories",
    realPrice: 3400,
    discountPrice: 2890,
    stock: 25,
    star: 4.7,
    shortDescription: "Universal USB-C dock with 4K HDMI, Gigabit Ethernet, SD card reader, and 100W PD passthrough.",
    features: ["4K@60Hz HDMI video output", "1000Mbps Gigabit RJ45", "100W Power Delivery port", "SD & TF card reader slots"],
    image: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800&auto=format&fit=crop&q=80",
  },

  // 10. Fashion & Apparel
  {
    name: "UrbanMinimalist Heavyweight French Terry Hoodie",
    brand: "AuraWear",
    categorySlug: "fashion-apparel",
    categoryName: "Fashion & Apparel",
    realPrice: 3600,
    discountPrice: 2880,
    stock: 45,
    star: 4.8,
    shortDescription: "Pre-shrunk 450 GSM French Terry cotton hoodie with reinforced ribbed cuffs and double-layered hood.",
    features: ["450 GSM 100% organic cotton", "Double-needle stitching throughout", "Pre-shrunk anti-pilling fabric", "Unisex relaxed street fit"],
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "AeroStrider Breathable Lightweight Running Sneakers",
    brand: "Velocity",
    categorySlug: "fashion-apparel",
    categoryName: "Fashion & Apparel",
    realPrice: 5400,
    discountPrice: 4320,
    stock: 30,
    star: 4.7,
    shortDescription: "Responsive cushioning road running shoes with breathable knit upper and high-traction rubber outsole.",
    features: ["Nitrogen-infused foam midsole", "Seamless engineered knit upper", "High-traction carbon rubber outsole", "Orthopedic removable insole"],
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Classic Chronograph Stainless Steel Mesh Watch",
    brand: "Horology",
    categorySlug: "fashion-apparel",
    categoryName: "Fashion & Apparel",
    realPrice: 8200,
    discountPrice: 6560,
    stock: 18,
    star: 4.9,
    shortDescription: "Minimalist stainless steel watch with Japanese quartz movement and sapphire crystal glass.",
    features: ["Japanese quartz movement", "Scratch-resistant sapphire crystal", "50M water resistance", "Quick-release mesh strap"],
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Horizon Polarized Italian Acetate Sunglasses",
    brand: "SolStyle",
    categorySlug: "fashion-apparel",
    categoryName: "Fashion & Apparel",
    realPrice: 2400,
    discountPrice: 1920,
    stock: 50,
    star: 4.6,
    shortDescription: "Handcrafted Italian acetate frames featuring polarized UV400 lenses with anti-glare coating.",
    features: ["100% UV400 polarized lenses", "Handcrafted cellulose acetate", "Stainless steel 5-barrel hinges", "Includes leather protective case"],
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
  },

  // 11. Home & Living
  {
    name: "ErgoSpine Mesh High-Back Ergonomic Office Chair",
    brand: "ErgoSpine",
    categorySlug: "home-living",
    categoryName: "Home & Living",
    realPrice: 16500,
    discountPrice: 13200,
    stock: 15,
    star: 4.8,
    shortDescription: "Ergonomic mesh chair with dynamic lumbar support, 3D adjustable armrests, and 135-degree tilt.",
    features: ["Adaptive dynamic lumbar support", "3D adjustable armrests", "135-degree tilt recline with lock", "Heavy-duty Class 4 gas lift"],
    image: "https://images.unsplash.com/photo-1580481077195-c3a82105e3b5?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "LuminaTouch Touch-Dimmable Smart LED Desk Lamp",
    brand: "LuminaTouch",
    categorySlug: "home-living",
    categoryName: "Home & Living",
    realPrice: 2500,
    discountPrice: 2000,
    stock: 40,
    star: 4.7,
    shortDescription: "Flicker-free eye protection lamp with 5 color temperatures, slide dimming, and USB charging port.",
    features: ["Flicker-free eye protection LED", "5 color modes & slide dimming", "Integrated 5V/1A USB port", "Auto-off 45min timer"],
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Ceramic Pour-Over Artisan Coffee Maker Set",
    brand: "BrewCraft",
    categorySlug: "home-living",
    categoryName: "Home & Living",
    realPrice: 2100,
    discountPrice: 1680,
    stock: 35,
    star: 4.8,
    shortDescription: "Heat-resistant borosilicate glass carafe with matte ceramic dripper and reusable steel mesh filter.",
    features: ["600ml borosilicate glass carafe", "Artisan matte ceramic dripper", "Dual-layer stainless steel filter", "Insulated silicone heat grip"],
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "PureMist Ultrasonic Essential Oil Diffuser",
    brand: "PureMist",
    categorySlug: "home-living",
    categoryName: "Home & Living",
    realPrice: 2200,
    discountPrice: 1760,
    stock: 30,
    star: 4.6,
    shortDescription: "Whisper-quiet ultrasonic mist diffuser with 7 ambient LED mood lights and auto shut-off.",
    features: ["500ml water tank capacity", "Whisper-quiet <25dB operation", "7 ambient LED color cycles", "Waterless auto shut-off safety"],
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80",
  },

  // 12. Health & Wellness
  {
    name: "HyperRelief Pro Deep Tissue Percussive Massage Gun",
    brand: "PulseTherapy",
    categorySlug: "health-wellness",
    categoryName: "Health & Wellness",
    realPrice: 5000,
    discountPrice: 4000,
    stock: 25,
    star: 4.8,
    shortDescription: "High-torque brushless motor percussive therapy device with 6 interchangeable massage heads.",
    features: ["Brushless motor up to 3200 RPM", "6 interchangeable massage heads", "LED touch speed screen", "6-hour lithium battery life"],
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "EcoGrip High-Density Non-Slip TPE Yoga Mat",
    brand: "ZenFlow",
    categorySlug: "health-wellness",
    categoryName: "Health & Wellness",
    realPrice: 1850,
    discountPrice: 1480,
    stock: 50,
    star: 4.7,
    shortDescription: "Extra thick 6mm eco-friendly TPE mat with alignment guide lines and carry strap.",
    features: ["6mm dual-layer high-density cushioning", "Laser-engraved body alignment lines", "Non-slip traction on both sides", "100% recyclable non-toxic TPE"],
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "HydroShield Double-Wall Vacuum Insulated Bottle",
    brand: "HydroVault",
    categorySlug: "health-wellness",
    categoryName: "Health & Wellness",
    realPrice: 1500,
    discountPrice: 1200,
    stock: 65,
    star: 4.8,
    shortDescription: "32oz food-grade 18/8 stainless steel bottle keeping drinks ice cold for 24h or hot for 12h.",
    features: ["Keeps cold 24h / hot 12h", "18/8 Pro-grade stainless steel", "BPA-free leakproof straw lid", "Condensation-free powder coat"],
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "SmartBody Bluetooth Composition Diagnostic Scale",
    brand: "ScalePro",
    categorySlug: "health-wellness",
    categoryName: "Health & Wellness",
    realPrice: 2700,
    discountPrice: 2160,
    stock: 35,
    star: 4.7,
    shortDescription: "High-precision scale measuring 14 body metrics including BMI, body fat, muscle mass, and water %.",
    features: ["14 key biometric measurements", "Instant Bluetooth sync with health apps", "Supports up to 8 user profiles", "Tempered glass ITO sensor surface"],
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
  },
];

/**
 * Builds a valid, ready-to-POST ProductInput payload from a demo product definition.
 */
export function buildDemoProductPayload({
  demo,
  index,
  categoryId,
  imageUrl,
}: {
  demo: RawDemoProduct;
  index: number;
  categoryId: string;
  imageUrl?: string;
}): ProductInput {
  const seed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}-${index + 1}`.toLowerCase();
  const slug = normalizeSlug(`${demo.name}-${seed}`);
  const sku = `DEMO-${seed.toUpperCase()}`;
  const primaryImage = imageUrl || demo.image;

  // Exact discount calculation ensuring discount matches backend check:
  // Math.abs(expectedDiscount - discount) <= 0.01
  const realPrice = demo.realPrice;
  const discountPrice = demo.discountPrice;
  const discount = realPrice > 0 ? Number((((realPrice - discountPrice) / realPrice) * 100).toFixed(2)) : 0;

  return {
    name: demo.name,
    slug,
    description: emptyRichText,
    shortDescription: demo.shortDescription,
    realPrice,
    discountPrice,
    discount,
    star: demo.star,
    primaryImage,
    images: [primaryImage],
    video: "",
    mainFeatures: demo.features,
    deliveryTime: "2–4 business days",
    warranty: "1 Year Official Warranty",
    stock: demo.stock,
    sku,
    categories: [categoryId],
    brand: demo.brand,
    status: "active",
    isFeatured: index < 5,
  };
}

/**
 * Returns 12 demo products, exactly 1 product per unique category from the Category page.
 */
export function getDemo12Products(): RawDemoProduct[] {
  const seen = new Set<string>();
  const result: RawDemoProduct[] = [];
  for (const product of DEMO_PRODUCTS) {
    if (!seen.has(product.categorySlug)) {
      seen.add(product.categorySlug);
      result.push(product);
    }
  }
  return result;
}

/**
 * Returns 24 demo products, balanced with 2 products per category from the Category page.
 */
export function getDemo24Products(): RawDemoProduct[] {
  const counts = new Map<string, number>();
  const result: RawDemoProduct[] = [];
  for (const product of DEMO_PRODUCTS) {
    const current = counts.get(product.categorySlug) ?? 0;
    if (current < 2) {
      counts.set(product.categorySlug, current + 1);
      result.push(product);
    }
  }
  return result;
}
