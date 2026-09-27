import { BusinessConfig, CodexFile } from '../types';

export function generateTeacherResponse(topicPrompt: string) {
  const cleanPrompt = topicPrompt.trim();
  const lower = cleanPrompt.toLowerCase();

  // Create structured steps based on topic
  let topicTitle = cleanPrompt;
  let overview = `**${cleanPrompt}** is a fundamental concept. Let's break it down step-by-step so you understand it completely and permanently.`;
  
  let steps = [
    {
      step: 1,
      title: "Core Foundation & Context",
      content: `First understand the foundation: When we explore "${cleanPrompt}", the primary question is 'why and how'. Every concept is engineered to solve a practical real-world problem, grounded in simple, elegant logic.`
    },
    {
      step: 2,
      title: "Working Mechanism & Rules",
      content: `It contains 2-3 essential components that work in continuous synchronization. Upon receiving input, it follows defined rules and systematically produces the expected output without unintended side-effects.`
    },
    {
      step: 3,
      title: "Real-World Analogy & Application",
      content: `Relate this to everyday life: Just like a traffic signal sequence or a recipe where ingredients follow strict order, every stage here executes sequentially. In industry, over 90% of architectures depend on this very logic.`
    }
  ];

  let proTip = "In exams or technical interviews, draw the direct architecture diagram or formula first. It earns immediate marks and proves conceptual clarity!";

  let checkQuestion = {
    question: `Check your understanding: What is true about the core working principle of ${cleanPrompt}?`,
    options: [
      "It executes randomly without adhering to any rules",
      "It follows structured step-by-step logic and predefined rules",
      "It is merely theoretical and cannot be used in real life",
      "It produces no predictable output or deterministic results"
    ],
    correctIndex: 1,
    explanation: "Exactly right! Every robust concept operates on systematic rules and deterministic stages."
  };

  if (lower.includes('gravity') || lower.includes('physics') || lower.includes('newton')) {
    topicTitle = "Newton's Gravitational Law & Physics";
    overview = "Gravitation is the universal attractive force that pulls any two objects with mass toward each other, formulated mathematically by Sir Isaac Newton.";
    steps = [
      {
        step: 1,
        title: "The Force Equation (F = G * m1 * m2 / r²)",
        content: "The gravitational force is directly proportional to the product of their masses, and inversely proportional to the square of the distance between them."
      },
      {
        step: 2,
        title: "Inverse Square Rule",
        content: "If the distance is doubled, the gravitational attraction decreases to one-fourth (1/4th). This rule governs planetary orbits and satellites."
      },
      {
        step: 3,
        title: "Weight vs Mass Difference",
        content: "Mass is invariant (e.g. 60kg on Earth and Moon), whereas Weight (W = mg) varies with local gravitational field strength (1/6th on the Moon)."
      }
    ];
    proTip = "Pro Tip: Never confuse 'G' (Universal Constant = 6.67 x 10^-11 N m²/kg²) with 'g' (local acceleration due to gravity ≈ 9.8 m/s²)!";
    checkQuestion = {
      question: "If the distance between two objects is doubled, what happens to the gravitational force between them?",
      options: ["Force increases by 2x", "Force is halved (1/2)", "Force drops to 1/4th (one fourth)", "Force remains completely unchanged"],
      correctIndex: 2,
      explanation: "Correct! By the inverse-square law F ∝ 1/r², doubling the distance reduces the force to (1/2)² = 1/4th."
    };
  } else if (lower.includes('react') || lower.includes('hook') || lower.includes('javascript') || lower.includes('state')) {
    topicTitle = "React State & Component Lifecycle";
    overview = "In React, State is the component's internal memory that preserves values across re-renders and automatically synchronizes the DOM.";
    steps = [
      {
        step: 1,
        title: "useState Declaration",
        content: "const [state, setState] = useState(initialValue). The first variable provides the current snapshot, while the updater function schedules re-renders."
      },
      {
        step: 2,
        title: "Immutability Rule",
        content: "Never mutate state directly (`state = 5` is incorrect). Always use the setter function (`setState(5)`) so React can run Virtual DOM diffing."
      },
      {
        step: 3,
        title: "Async Batching",
        content: "React batches state updates for optimal performance. When computing next state from prior state, always use a functional updater: `setCount(prev => prev + 1)`."
      }
    ];
    proTip = "Interview Pro Tip: State updates are asynchronous! Logging immediately after calling `setState` yields the old snapshot. Use useEffect to observe updated values.";
    checkQuestion = {
      question: "What is the correct immutable pattern to append an item to an array in React state?",
      options: [
        "items.push(newItem); setItems(items);",
        "setItems([...items, newItem]);",
        "items[items.length] = newItem;",
        "setItems(items.concat([newItem])); items.reverse();"
      ],
      correctIndex: 1,
      explanation: "Well done! The spread operator `[...items, newItem]` creates a fresh array reference that triggers React's reconciliation."
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
  const bName = config.name || "Our Business";
  const bCat = config.category || "General Services";
  const bDesc = config.description || "Our team provides top-tier customer support and high quality products.";

  if (query.includes('price') || query.includes('cost') || query.includes('rate') || query.includes('pricing')) {
    return `Hello! Welcome to ${bName} (${bCat}). Our pricing is transparent and highly competitive. Standard plans are available at competitive rates, and we also provide tailored quotes for custom needs. Which specific product or service are you interested in?`;
  }

  if (query.includes('time') || query.includes('hour') || query.includes('open') || query.includes('when') || query.includes('schedule')) {
    return `Hello! ${bName} customer support is active 24/7 via our AI Employee. Our standard delivery and operations run Monday through Saturday, 9:00 AM to 8:00 PM. Feel free to place your inquiry or order anytime!`;
  }

  if (query.includes('return') || query.includes('refund') || query.includes('cancel')) {
    return `Customer satisfaction is our top priority at ${bName}. We provide a hassle-free 7-day return and refund policy on undamaged items. Please provide your order ID, and we will process it right away.`;
  }

  if (query.includes('location') || query.includes('address') || query.includes('where') || query.includes('contact')) {
    return `Thank you for asking! ${bName} operates primarily online with nationwide delivery and prompt service. Our digital support desk is always accessible via web and chat.`;
  }

  return `Hello! I am the AI Business Employee for ${bName}. Regarding ${bDesc}, whatever you'd like to know—such as products, bookings, delivery, or pricing—I am here to assist you fully. How can I help you today?`;
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
