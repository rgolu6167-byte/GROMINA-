import { BusinessConfig, CodexFile } from '../types';

export function generateTeacherResponse(topicPrompt: string) {
  const cleanPrompt = topicPrompt.trim();
  const lower = cleanPrompt.toLowerCase();

  // Create structured steps based on topic
  let topicTitle = cleanPrompt;
  let overview = `Dekho, **${cleanPrompt}** ek fundamental concept hai. Chalo isko step-by-step tod kar clear karte hain taaki tumhe hamesha ke liye samajh aa jaye.`;
  
  let steps = [
    {
      step: 1,
      title: "Core Foundation & Context",
      content: `Pehle basic samjho: Jab hum "${cleanPrompt}" ki baat karte hain, toh pehla sawal hota hai 'kyun aur kaise'. Har concept kisi practical problem ko solve karne ke liye banaya gaya hai. Iska main idea simple logic par based hai.`
    },
    {
      step: 2,
      title: "Working Mechanism & Rules",
      content: `Isme 2-3 important components hote hain jo continuous sync me kaam karte hain. Input milne par ye rules follow karta hai aur systematically expected output generate karta hai bina kisi side-effect ke.`
    },
    {
      step: 3,
      title: "Real-World Analogy & Application",
      content: `Isko real life se relate karo: Jaise traffic signal ya recipe me ingredients order me aate hain, waise hi yahan har stage sequentially execute hoti hai. Industry me 90% systems is logic pe depend karte hain.`
    }
  ];

  let proTip = "Exam ya interview me iska seedha diagram ya formula pehle draw karna. Direct marks milte hain aur examiner ko clarity samajh aati hai!";

  let checkQuestion = {
    question: `Check your understanding: ${cleanPrompt} ke core working principle ke baare me kya sahi hai?`,
    options: [
      "Ye random execute hota hai bina kisi rule ke",
      "Ye step-by-step logic aur predefined rules follow karta hai",
      "Ye sirf theoretical concept hai aur real life me use nahi hota",
      "Iska koi defined output ya result nahi hota"
    ],
    correctIndex: 1,
    explanation: "Bilkul sahi! Har structured concept rules aur systematic stages par based hota hai."
  };

  if (lower.includes('gravity') || lower.includes('physics') || lower.includes('newton')) {
    topicTitle = "Newton's Gravitational Law & Physics";
    overview = "Gravitation universe ka wo unseen force hai jo har do mass wale objects ko ek dusre ki taraf attract karta hai. Sir Isaac Newton ne isko mathematically prove kiya tha.";
    steps = [
      {
        step: 1,
        title: "The Force Equation (F = G * m1 * m2 / r²)",
        content: "Force dono masses ke product ke directly proportional hota hai, aur unke beech ki distance ke square ke inversely proportional."
      },
      {
        step: 2,
        title: "Inverse Square Rule",
        content: "Agar distance double kar di jaye, toh gravitational attraction 4 guna kam (1/4th) ho jayegi. Ye rule satellites aur planets orbit maintain karne ke liye use hota hai."
      },
      {
        step: 3,
        title: "Weight vs Mass Difference",
        content: "Mass hamesha constant rehta hai (e.g. 60kg on Earth and Moon), jabki Weight (W = mg) local gravity par depend karta hai (Moon pe weight 1/6th ho jata hai)."
      }
    ];
    proTip = "Pro Tip: 'G' (Universal Constant = 6.67 x 10^-11 N m²/kg²) aur 'g' (acceleration due to gravity = 9.8 m/s²) me confuse mat hona!";
    checkQuestion = {
      question: "Agar do objects ke beech ki doori 2 guna badha di jaye, toh gravitational force par kya asar padega?",
      options: ["Force 2x badh jayega", "Force half (1/2) ho jayega", "Force 1/4th (one fourth) ho jayega", "Force par koi asar nahi hoga"],
      correctIndex: 2,
      explanation: "Sahi jawab! F ∝ 1/r², toh r double hone par force (1/2)² = 1/4th ho jata hai."
    };
  } else if (lower.includes('react') || lower.includes('hook') || lower.includes('javascript') || lower.includes('state')) {
    topicTitle = "React State & Component Lifecycle";
    overview = "React me State wo memory box hai jo component ke re-render hone par bhi data ko preserve rakhta hai aur UI ko auto-update karta hai.";
    steps = [
      {
        step: 1,
        title: "useState Declaration",
        content: "const [state, setState] = useState(initialValue). Pehla variable current value deta hai, dusra function update trigger karta hai."
      },
      {
        step: 2,
        title: "Immutability Rule",
        content: "State ko direct mutate mat karo (`state = 5` galat hai). Hamesha setter function use karo (`setState(5)`) taaki React virtual DOM diffing run kar sake."
      },
      {
        step: 3,
        title: "Async Batching",
        content: "React state updates ko batch karta hai better performance ke liye. Previous state par depend karne ke liye `setCount(prev => prev + 1)` functional updater use karo."
      }
    ];
    proTip = "Exam/Interview Trick: State updates async hoti hain! Turant baad `console.log(state)` karoge toh purani value dikhegi. Use useEffect to track latest updates.";
    checkQuestion = {
      question: "React me array state me new item add karne ka correct immutable tareeka kya hai?",
      options: [
        "items.push(newItem); setItems(items);",
        "setItems([...items, newItem]);",
        "items[items.length] = newItem;",
        "setItems(items.concat([newItem])); items.reverse();"
      ],
      correctIndex: 1,
      explanation: "Shabash! Spread operator `[...items, newItem]` ek new array reference banata hai jo React ko re-render trigger karne me help karta hai."
    };
  }

  return {
    topic: topicTitle,
    overview,
    steps,
    proTip,
    checkQuestion
  };
}

export function generateBusinessResponse(customerQuery: string, config: BusinessConfig): string {
  const query = customerQuery.toLowerCase();
  const bName = config.name || "Hamara Business";
  const bCat = config.category || "General Services";
  const bDesc = config.description || "Hamari team best customer support aur high quality products provide karti hai.";

  if (query.includes('price') || query.includes('cost') || query.includes('rate') || query.includes('kitna')) {
    return `Namaste! ${bName} (${bCat}) me aapka swagat hai. Hamare packages competitive aur transparent hain. Hamare basic plans standard market rates par available hain aur custom requirements ke according tailored quotes provide kiye jaate hain. Kya aap batana chahenge ki aap kis specific service ya product me interested hain?`;
  }

  if (query.includes('time') || query.includes('hour') || query.includes('kab') || query.includes('open')) {
    return `Hello! ${bName} customer support 24/7 active hai AI Employee ke through. Hamari operational delivery timing Monday se Saturday 9:00 AM se 8:00 PM tak rehti hai. Aap kabhi bhi order ya enquiry place kar sakte hain!`;
  }

  if (query.includes('return') || query.includes('refund') || query.includes('cancel')) {
    return `Ji bilkul, ${bName} me customer satisfaction hamari priority hai. Hamare yahan 7-day hassle-free return aur refund policy valid hai agar item undamaged ho. Aap order ID provide kijiye, hum turant process kar denge.`;
  }

  if (query.includes('location') || query.includes('address') || query.includes('kahan')) {
    return `Dhanyawad aapke sawal ke liye! ${bName} primarily online operate karta hai nationwide delivery aur prompt service ke saath. Hamara digital headquarters support desk hamesha connected hai WhatsApp aur web par.`;
  }

  return `Namaste! Main ${bName} ka AI Business Employee hoon. ${bDesc} Ke baare me aap jo bhi janna chahte hain—jaise products, bookings, delivery ya pricing—main yahan aapki poori madad karne ke liye tayyar hoon. Aap bataiye main aapki kya seva kar sakta hoon?`;
}

export function generateWebsiteContent(prompt: string) {
  const title = prompt.trim() ? prompt.trim().split('.').slice(0, 1)[0] : "Modern Digital Experience";
  const safeTitle = title.charAt(0).toUpperCase() + title.slice(1);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <link rel="stylesheet" href="style.css">
  <script src="script.js" defer></script>
</head>
<body>
  <!-- Header Navbar -->
  <header class="navbar">
    <div class="brand">
      <span class="logo-mark">✦</span>
      <span class="logo-text">${safeTitle.split(' ')[0] || 'Studio'}</span>
    </div>
    <nav class="nav-links">
      <a href="#features">Features</a>
      <a href="#about">About</a>
      <a href="#pricing">Pricing</a>
      <a href="#contact">Contact</a>
    </nav>
    <div class="nav-actions">
      <button class="btn btn-outline">Sign In</button>
      <button class="btn btn-primary">Get Started</button>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="badge">Next Generation Experience</div>
    <h1 class="hero-title">${safeTitle}</h1>
    <p class="hero-subtitle">Designed for speed, beauty, and modern workflows. Everything you need to turn your vision into reality seamlessly.</p>
    <div class="hero-cta">
      <button class="btn btn-primary btn-lg">Explore Now</button>
      <button class="btn btn-secondary btn-lg">Watch 2-Min Demo</button>
    </div>
    <div class="hero-stats">
      <div class="stat"><span class="stat-num">99.9%</span><span class="stat-label">Uptime SLA</span></div>
      <div class="stat"><span class="stat-num">4.9/5</span><span class="stat-label">Customer Rating</span></div>
      <div class="stat"><span class="stat-num">24/7</span><span class="stat-label">AI Assistance</span></div>
    </div>
  </section>

  <!-- Features Grid -->
  <section id="features" class="features">
    <div class="section-header">
      <h2>Engineered for Excellence</h2>
      <p>Cutting-edge tools that empower users with unprecedented efficiency.</p>
    </div>
    <div class="grid">
      <div class="card">
        <div class="card-icon">⚡</div>
        <h3>Ultra Responsive</h3>
        <p>Optimized for instantaneous loading across mobile, tablet, and ultra-wide screens.</p>
      </div>
      <div class="card">
        <div class="card-icon">🛡️</div>
        <h3>Enterprise Security</h3>
        <p>End-to-end data encryption and strict access governance standards built right in.</p>
      </div>
      <div class="card">
        <div class="card-icon">✨</div>
        <h3>Intelligent Automation</h3>
        <p>Built-in AI workflows that take care of repetitive tasks so you focus on growth.</p>
      </div>
    </div>
  </section>

  <!-- CTA Banner -->
  <section class="cta-banner">
    <h2>Ready to transform your workflow?</h2>
    <p>Join thousands of professionals already building the future.</p>
    <button class="btn btn-light btn-lg">Start Free 14-Day Trial</button>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <p>© 2026 ${safeTitle}. All rights reserved. Built with Gromina AI Studio.</p>
  </footer>
</body>
</html>`;

  const css = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #0f172a;
  color: #f8fafc;
  line-height: 1.6;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2.5rem;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.25rem;
  color: #fff;
}

.logo-mark {
  color: #38bdf8;
  font-size: 1.4rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #fff;
}

.nav-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.6rem 1.25rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #38bdf8;
  color: #0f172a;
}
.btn-primary:hover {
  background: #7dd3fc;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-light {
  background: #fff;
  color: #0f172a;
}

.btn-lg {
  padding: 0.85rem 1.75rem;
  font-size: 1rem;
}

.hero {
  padding: 5rem 2rem 4rem;
  text-align: center;
  max-w: 900px;
  margin: 0 auto;
}

.badge {
  display: inline-block;
  padding: 0.35rem 1rem;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 1.25rem;
  background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  color: #94a3b8;
  font-size: 1.15rem;
  max-width: 650px;
  margin: 0 auto 2.5rem;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3.5rem;
  flex-wrap: wrap;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 2rem;
}

.stat-num {
  display: block;
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
}

.features {
  padding: 4rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: #94a3b8;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 2rem;
  transition: transform 0.2s, border-color 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  border-color: rgba(56, 189, 248, 0.4);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.card p {
  color: #94a3b8;
  font-size: 0.95rem;
}

.cta-banner {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  border-radius: 1.5rem;
  max-width: 1000px;
  margin: 4rem auto;
  padding: 3.5rem 2rem;
  text-align: center;
}

.cta-banner h2 {
  font-size: 2.2rem;
  margin-bottom: 0.75rem;
}

.cta-banner p {
  margin-bottom: 1.75rem;
  font-size: 1.1rem;
  opacity: 0.9;
}

.footer {
  text-align: center;
  padding: 2.5rem;
  color: #64748b;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.9rem;
}`;

  const js = `// Interactivity script
document.addEventListener('DOMContentLoaded', () => {
  console.log('${safeTitle} initialized smoothly.');

  const buttons = document.querySelectorAll('.btn-primary, .btn-light');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Thank you for exploring ${safeTitle}! Welcome aboard.');
    });
  });
});`;

  return { html, css, js, title: safeTitle };
}

export function generateCodexFiles(prompt: string): CodexFile[] {
  const safeName = prompt.trim() ? prompt.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : 'app';
  
  return [
    {
      name: 'App.tsx',
      path: 'src/App.tsx',
      language: 'typescript',
      content: `import React, { useState } from 'react';
import { Sparkles, Terminal, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 p-8 font-sans">
      <header className="max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-sky-400" />
          <h1 className="text-xl font-bold tracking-tight">${prompt.slice(0, 40) || 'Gromina Code App'}</h1>
        </div>
        <button 
          onClick={() => setCount(c => c + 1)}
          className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition"
        >
          Interactions: {count}
        </button>
      </header>

      <main className="max-w-4xl mx-auto mt-10">
        <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-2">Automated Architecture</h2>
          <p className="text-zinc-400 mb-6">Generated on-demand via Gromina Codex Engine with strict types and modern UI primitives.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs uppercase tracking-wider text-sky-400 font-mono">Performance</span>
              <p className="text-lg font-bold mt-1">99 / 100</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-mono">Bundle Size</span>
              <p className="text-lg font-bold mt-1">12.4 kB gzip</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs uppercase tracking-wider text-purple-400 font-mono">Typescript</span>
              <p className="text-lg font-bold mt-1">100% Strict</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}`
    },
    {
      name: 'index.html',
      path: 'index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${prompt.slice(0, 30) || 'Codex Build'}</title>
  </head>
  <body class="bg-[#121212] text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    },
    {
      name: 'package.json',
      path: 'package.json',
      language: 'json',
      content: `{
  "name": "${safeName}-service",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.546.0"
  },
  "devDependencies": {
    "typescript": "^7.0.0",
    "vite": "^8.3.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}`
    },
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(\`Backend service listening on port \${port}\`);
});`
    },
    {
      name: 'index.css',
      path: 'src/index.css',
      language: 'css',
      content: `@import "tailwindcss";

body {
  margin: 0;
  background-color: #121212;
  color: #ededed;
  font-family: system-ui, -apple-system, sans-serif;
}`
    }
  ];
}

export function generateGeneralHomeResponse(prompt: string): string {
  const p = prompt.trim();
  return `Here is a comprehensive breakdown for **"${p}"**:

1. **Core Summary**: It centers on executing tasks efficiently through modern systematic approaches, reducing overhead while maximizing reliability.
2. **Key Consideration**: Maintain clear boundaries, keep inputs consistent, and verify assumptions with real testing.
3. **Actionable Next Step**: You can implement this right away or ask me to deep dive into code, business logic, or structured steps.`;
}

export function generateCompareResponses(prompt: string): Record<string, string> {
  const p = prompt.trim();
  
  return {
    chatgpt: `Here is a structured overview of **${p}**:

• **Core Concept**: It provides a reliable framework for addressing this problem effectively.
• **Primary Strength**: Highly adaptable, well-documented, and widely adopted across industries.
• **Recommendation**: Start with the foundational implementation before scaling complexity. Let me know if you'd like a step-by-step tutorial!`,

    meta: `Here's what you need to know about **${p}**:

1. **Practical application**: It enables quick iteration and flexible integration with modern open architectures.
2. **Key trade-off**: Requires careful tuning depending on your workload scale.
3. **Quick takeaway**: Ideal for cost-efficient, production-grade workflows where data ownership and speed matter.`,

    groq: `⚡ **842 tokens/sec | 0.08s latency**

**Summary:** ${p} is best tackled with direct, optimized pipelines.
- **Fast-path:** Minimize abstraction layers.
- **Execution:** Zero-overhead runtime evaluation.
- **Result:** Peak throughput with deterministic execution.`,

    gemini: `Analyzing **"${p}"** across context and application vectors:

• **Multimodal Synthesis**: Connects underlying semantic principles with real-time operational context.
• **Deep Reasoning**: Balances theoretical accuracy with practical usability across varied device constraints.
• **Key Insight**: Integrating this with current best practices yields a ~35% improvement in maintenance efficiency.`,

    claude: `Looking at **${p}** with a focus on precision and nuance:

There are two primary dimensions to consider:
1. **The Structural Foundation**: Ensuring the assumptions underlying this approach are sound and resilient to unexpected edge cases.
2. **The Human / Ergonomic Aspect**: Building an intuitive workflow that remains maintainable over extended lifecycles.

Would you like to examine the architectural nuances or discuss concrete edge cases?`
  };
}
