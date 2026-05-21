import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@300;400;500;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg:           #070709;
    --surface:      #0d0d11;
    --surface2:     #13131a;
    --surface3:     #18181f;
    --border:       #1c1c26;
    --border2:      #252530;
    --amber:        #f59e0b;
    --amber2:       #fbbf24;
    --amber-glow:   rgba(245,158,11,0.07);
    --amber-glow2:  rgba(245,158,11,0.14);
    --violet:       #8b5cf6;
    --violet-glow:  rgba(139,92,246,0.08);
    --teal:         #2dd4bf;
    --green:        #22c55e;
    --text:         #eeebe4;
    --muted:        #6b6b7a;
    --dim:          #2e2e3a;
    --card-glow:    rgba(245,158,11,0.04);
    --nav-blur:     rgba(7,7,9,0.85);
    --scrollbar-thumb: #252530;
    --progress-bar: var(--amber);
  }

  [data-theme="light"] {
    --bg:           #f5f4f0;
    --surface:      #ffffff;
    --surface2:     #f0ede8;
    --surface3:     #e8e5e0;
    --border:       #e0ddd8;
    --border2:      #ccc9c4;
    --amber-glow:   rgba(245,158,11,0.06);
    --amber-glow2:  rgba(245,158,11,0.12);
    --violet-glow:  rgba(139,92,246,0.06);
    --text:         #1a1a1a;
    --muted:        #666;
    --dim:          #bbb;
    --card-glow:    rgba(245,158,11,0.02);
    --nav-blur:     rgba(245,244,240,0.88);
    --scrollbar-thumb: #ccc9c4;
  }

  html { scroll-behavior: smooth; }
  body { background: var(--bg); }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 2px; }

  /* ── Typography ── */
  .bebas { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.01em; }
  .mono  { font-family: 'JetBrains Mono', monospace; }
  .sans  { font-family: 'DM Sans', sans-serif; }

  /* ── Progress bar ── */
  #progress-bar {
    position: fixed; top: 0; left: 0; height: 2px; z-index: 200;
    background: linear-gradient(90deg, var(--violet), var(--amber));
    width: 0%; transition: width 0.1s linear;
    box-shadow: 0 0 8px var(--amber);
  }

  /* ── Keyframes ── */
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes scanline { from{transform:translateY(-100%)} to{transform:translateY(100vh)} }
  @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.9)} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes shimmer  {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes glow-pulse {
    0%,100% { box-shadow: 0 0 12px rgba(245,158,11,0.15); }
    50%     { box-shadow: 0 0 28px rgba(245,158,11,0.35); }
  }
  @keyframes slideRight { from{width:0} to{width:100%} }

  .fade-up  { opacity: 0; }
  .fade-up.visible { animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
  .blink    { animation: blink 1s step-end infinite; }

  /* ── Nav ── */
  .nav-btn {
    background: none; border: none; cursor: pointer;
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--muted); letter-spacing: 0.14em; text-transform: uppercase;
    padding: 6px 0; position: relative; transition: color 0.2s;
  }
  .nav-btn::after {
    content: ''; position: absolute; bottom: 0; left: 0;
    width: 0; height: 1px; background: var(--amber);
    transition: width 0.25s ease;
  }
  .nav-btn:hover { color: var(--amber); }
  .nav-btn:hover::after { width: 100%; }
  .nav-btn.active { color: var(--amber); }
  .nav-btn.active::after { width: 100%; }

  /* ── Skill tags ── */
  .skill-tag {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    padding: 5px 13px; border: 1px solid var(--border);
    background: var(--surface); color: var(--muted);
    letter-spacing: 0.04em; transition: all 0.2s; cursor: default;
    display: inline-block; border-radius: 2px;
  }
  .skill-tag:hover {
    border-color: var(--amber); color: var(--amber);
    background: var(--amber-glow); transform: translateY(-2px);
  }

  /* ── Project cards ── */
  .proj-card {
    background: var(--surface); padding: 32px; cursor: default;
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s;
    position: relative; overflow: hidden;
    border: 1px solid var(--border);
  }
  .proj-card::before {
    content: ''; position: absolute; left: 0; top: 0;
    width: 2px; height: 0; background: linear-gradient(to bottom, var(--amber), var(--violet));
    transition: height 0.4s cubic-bezier(0.22,1,0.36,1);
  }
  .proj-card::after {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 0%, var(--amber-glow) 0%, transparent 65%);
    opacity: 0; transition: opacity 0.4s;
  }
  .proj-card:hover { transform: translateY(-5px); box-shadow: 0 20px 60px rgba(0,0,0,0.35); }
  .proj-card:hover::before { height: 100%; }
  .proj-card:hover::after  { opacity: 1; }

  /* ── Project link icon ── */
  .proj-link {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--muted); text-decoration: none; letter-spacing: 0.06em;
    border: 1px solid var(--border); padding: 6px 14px;
    transition: all 0.2s; border-radius: 2px;
  }
  .proj-link:hover { color: var(--amber); border-color: var(--amber); background: var(--amber-glow); }

  /* ── Buttons ── */
  .btn-fill {
    font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700;
    padding: 14px 34px; background: var(--amber); color: #080808; border: none;
    cursor: pointer; letter-spacing: 0.12em; text-transform: uppercase;
    transition: all 0.2s; position: relative; overflow: hidden;
  }
  .btn-fill::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    transform: translateX(-100%); transition: transform 0.4s;
  }
  .btn-fill:hover { background: var(--amber2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,158,11,0.3); }
  .btn-fill:hover::after { transform: translateX(100%); }
  .btn-fill:active { transform: translateY(0); }

  .btn-ghost {
    font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500;
    padding: 13px 34px; background: transparent; color: var(--text);
    border: 1px solid var(--border); cursor: pointer;
    letter-spacing: 0.12em; text-transform: uppercase; transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: var(--amber); color: var(--amber); background: var(--amber-glow); }

  /* ── Labels ── */
  .label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: var(--amber); letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 14px;
  }

  /* ── Rules ── */
  .rule { height: 1px; background: var(--border); }

  /* ── Inputs ── */
  input, textarea {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 15px;
    padding: 14px 18px; outline: none; transition: all 0.25s; resize: none; border-radius: 2px;
  }
  input:focus, textarea:focus { border-color: var(--amber); background: var(--surface3); box-shadow: 0 0 0 3px var(--amber-glow); }
  input::placeholder, textarea::placeholder { color: var(--dim); }

  /* ── Footer links ── */
  a.footer-link {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--muted); text-decoration: none; letter-spacing: 0.06em;
    transition: color 0.2s; display: flex; align-items: center; gap: 6px;
  }
  a.footer-link:hover { color: var(--amber); }

  /* ── Stat items ── */
  .stat-item { position: relative; }
  .stat-item::after {
    content: ''; position: absolute; right: -28px; top: 4px;
    width: 1px; height: 40px; background: var(--border);
  }
  .stat-item:last-child::after { display: none; }

  /* ── Experience rows ── */
  .exp-row {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 22px 0; border-bottom: 1px solid var(--border);
    transition: padding-left 0.2s;
  }
  .exp-row:hover { padding-left: 12px; }

  /* ── Hash tags ── */
  .hash {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: var(--violet); letter-spacing: 0.04em;
    background: var(--violet-glow); padding: 3px 8px; border-radius: 2px;
  }

  /* ── Filter pills ── */
  .filter-pill {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    padding: 6px 18px; border: 1px solid var(--border); background: transparent;
    color: var(--muted); cursor: pointer; letter-spacing: 0.12em; text-transform: uppercase;
    transition: all 0.2s; border-radius: 2px;
  }
  .filter-pill:hover   { border-color: var(--border2); color: var(--text); }
  .filter-pill.active  { border-color: var(--amber); color: var(--amber); background: var(--amber-glow); }

  /* ── Terminal ── */
  .terminal {
    background: #080810; border: 1px solid var(--border); border-radius: 6px;
    overflow: hidden; font-family: 'JetBrains Mono', monospace;
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  }
  .terminal-bar {
    background: #111118; padding: 12px 16px; display: flex;
    align-items: center; gap: 8px; border-bottom: 1px solid var(--border);
  }
  .t-dot { width: 10px; height: 10px; border-radius: 50%; }
  .terminal-body { padding: 20px 22px; min-height: 180px; font-size: 12.5px; line-height: 1.9; }
  .t-prompt { color: var(--green); }
  .t-cmd    { color: var(--text); }
  .t-out    { color: var(--muted); }
  .t-key    { color: var(--amber); }
  .t-val    { color: var(--violet); }
  .t-str    { color: var(--teal); }

  /* ── Skill bar ── */
  .skill-bar-track {
    height: 2px; background: var(--border); margin-top: 6px; overflow: hidden;
  }
  .skill-bar-fill {
    height: 100%; background: linear-gradient(90deg, var(--amber), var(--violet));
    width: 0; transition: width 1.2s cubic-bezier(0.22,1,0.36,1);
  }

  /* ── Tooltip ── */
  .has-tooltip { position: relative; }
  .tooltip {
    position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
    background: var(--surface3); border: 1px solid var(--border); border-radius: 4px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text);
    padding: 5px 10px; white-space: nowrap; pointer-events: none;
    opacity: 0; transition: opacity 0.15s; z-index: 10;
  }
  .has-tooltip:hover .tooltip { opacity: 1; }

  /* ── Available badge ── */
  .avail-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(34,197,94,0.07); border: 1px solid rgba(34,197,94,0.18);
    padding: 6px 14px; border-radius: 100px;
  }
  .avail-dot {
    width: 6px; height: 6px; background: var(--green); border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  /* ── Section counter ── */
  .sec-counter {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: var(--dim); letter-spacing: 0.1em; margin-bottom: 6px;
  }

  /* ── Glow line ── */
  .glow-line {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--amber), transparent);
    opacity: 0.35;
  }

  /* ── Grid overlay hero ── */
  .grid-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: 0.35;
    mask-image: radial-gradient(ellipse 70% 70% at 80% 50%, black, transparent);
  }

  /* ── Theme toggle ── */
  .theme-toggle {
    background: var(--surface2); border: 1px solid var(--border);
    width: 36px; height: 36px; border-radius: 6px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; color: var(--muted); font-size: 15px;
  }
  .theme-toggle:hover { border-color: var(--amber); color: var(--amber); background: var(--amber-glow); }

  /* ── Notification toast ── */
  .toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 300;
    background: var(--surface3); border: 1px solid var(--amber);
    padding: 14px 22px; display: flex; align-items: center; gap: 10px;
    font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 16px rgba(245,158,11,0.15);
    animation: fadeUp 0.4s ease forwards;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .proj-grid   { grid-template-columns: 1fr !important; }
    .about-grid  { grid-template-columns: 1fr !important; }
    .stack-grid  { grid-template-columns: 1fr !important; }
    .stats-row   { gap: 32px !important; }
  }
  @media (max-width: 520px) {
    .hero-name { font-size: 72px !important; }
    .cta-row   { flex-direction: column !important; }
    .cta-row button { width: 100%; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const ROLES = [
  "Full-Stack Engineer",
  "Systems Architect",
  "Open Source Contributor",
  "API Designer",
  "Performance Obsessive",
];

const SKILLS = {
  Languages:      { items: ["TypeScript", "Python", "Go", "Rust", "SQL"],           level: [92, 88, 80, 65, 85] },
  Frontend:       { items: ["React", "Next.js", "Vue", "Three.js", "WebGL"],        level: [95, 90, 78, 70, 60] },
  Backend:        { items: ["Node.js", "FastAPI", "PostgreSQL", "Redis", "GraphQL"], level: [90, 85, 88, 82, 80] },
  Infrastructure: { items: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"],   level: [85, 78, 88, 75, 90] },
};

const PROJECTS = [
  {
    tag: "Web App", year: "2024", name: "Nexus", filter: "web",
    desc: "Real-time collaborative platform with multiplayer editing, live cursors, and CRDT conflict resolution. Handles 10K+ concurrent connections with sub-50ms latency.",
    stack: ["#react", "#nodejs", "#websockets", "#redis"],
    link: "#", github: "#",
    metrics: "10K+ users · <50ms latency",
  },
  {
    tag: "Dev Tool", year: "2024", name: "Vault CLI", filter: "tool",
    desc: "Zero-dependency secrets management CLI with AES-256 encryption, team sharing workflows, and native Git hooks. 3.2K stars on GitHub.",
    stack: ["#go", "#sqlite", "#aes-256"],
    link: "#", github: "#",
    metrics: "3.2K ★ · 0 dependencies",
  },
  {
    tag: "Library", year: "2023", name: "Helix UI", filter: "lib",
    desc: "Production-ready React component library — 60+ accessible components, full dark mode, and a Figma design system. Ships to 200+ downstream projects.",
    stack: ["#react", "#typescript", "#radix", "#storybook"],
    link: "#", github: "#",
    metrics: "200+ projects · 60+ components",
  },
  {
    tag: "API", year: "2023", name: "Synapse API", filter: "tool",
    desc: "High-performance GraphQL gateway with automatic query batching, schema stitching, and built-in observability. Reduces over-fetching by 70%.",
    stack: ["#graphql", "#nodejs", "#prometheus", "#opentelemetry"],
    link: "#", github: "#",
    metrics: "−70% over-fetching · 99.97% uptime",
  },
  {
    tag: "Web App", year: "2022", name: "Orbit", filter: "web",
    desc: "Developer analytics dashboard with real-time GitHub, Jira, and Linear integrations. Tracks velocity, cycle time, and team health across sprints.",
    stack: ["#nextjs", "#d3.js", "#postgresql", "#prisma"],
    link: "#", github: "#",
    metrics: "500+ teams · 12 integrations",
  },
  {
    tag: "Library", year: "2022", name: "Piper", filter: "lib",
    desc: "Type-safe event streaming library for Node.js with first-class TypeScript generics, backpressure handling, and pluggable transports.",
    stack: ["#typescript", "#nodejs", "#kafka", "#rabbitmq"],
    link: "#", github: "#",
    metrics: "1.1K ★ · 8K weekly downloads",
  },
];

const STATS = [
  ["7+",  "Years Exp"],
  ["50+", "Projects"],
  ["4.3K","GH Stars"],
  ["12",  "OSS Repos"],
];

const EXP = [
  {
    role: "Senior Software Engineer", co: "Vercel", period: "2022 — Now",
    summary: "Leading the DX infrastructure team. Built the incremental cache layer powering Next.js deployments.",
    tags: ["Next.js", "Go", "Edge Runtime"],
  },
  {
    role: "Lead Engineer", co: "Fern (YC W22)", period: "2020 — 2022",
    summary: "First engineering hire. Grew the platform from 0 to 800 paying customers and hired a team of 6.",
    tags: ["Node.js", "React", "Stripe", "AWS"],
  },
  {
    role: "Software Engineer", co: "Stripe", period: "2017 — 2020",
    summary: "Contributed to the Billing & Invoicing API. Shipped features used by millions of businesses worldwide.",
    tags: ["Ruby", "Go", "PostgreSQL"],
  },
];

const FILTERS = ["All", "Web", "Tool", "Lib"];

/* ─────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────── */
function useIntersection(ref, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function useScroll() {
  const [progress, setProgress] = useState(0);
  const [section, setSection]   = useState("home");
  useEffect(() => {
    const fn = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
      const ids = ["home", "about", "stack", "projects", "contact"];
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && window.scrollY >= el.offsetTop - 120) { setSection(ids[i]); break; }
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return { progress, section };
}

/* ─────────────────────────────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let raf;

    const particles = Array.from({ length: 55 }, () => ({
      x:  Math.random() * W, y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r:  Math.random() * 1.2 + 0.4,
      a:  Math.random(),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,158,11,${p.a * 0.5})`;
        ctx.fill();
      });

      // lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(245,158,11,${(1 - d / 110) * 0.08})`;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        opacity: 0.6, zIndex: 0,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   TERMINAL BLOCK
───────────────────────────────────────────────────────────── */
const TERMINAL_LINES = [
  { type: "prompt", text: "whoami" },
  { type: "out",    text: "alex.rivera — Senior Software Engineer @ Vercel" },
  { type: "prompt", text: "cat profile.json" },
  { type: "json",   pairs: [["location", '"San Francisco, CA"'], ["available", "true"], ["focus", '"distributed systems"']] },
  { type: "prompt", text: "gh repo list --limit 3" },
  { type: "repo",   items: ["nexus-collab", "vault-cli", "helix-ui"] },
  { type: "prompt", text: "_", blink: true },
];

function Terminal() {
  const [lines, setLines] = useState([]);
  const idx = useRef(0);

  useEffect(() => {
    const addLine = () => {
      if (idx.current >= TERMINAL_LINES.length) return;
      setLines(prev => [...prev, TERMINAL_LINES[idx.current]]);
      idx.current++;
      if (idx.current < TERMINAL_LINES.length) {
        setTimeout(addLine, idx.current % 2 === 0 ? 380 : 180);
      }
    };
    const t = setTimeout(addLine, 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="terminal">
      <div className="terminal-bar">
        <div className="t-dot" style={{ background: "#ff5f57" }} />
        <div className="t-dot" style={{ background: "#febc2e" }} />
        <div className="t-dot" style={{ background: "#28c840" }} />
        <span className="mono" style={{ fontSize: 11, color: "var(--muted)", marginLeft: 10, letterSpacing: "0.06em" }}>
          ~/alex.rivera — zsh
        </span>
      </div>
      <div className="terminal-body">
        {lines.map((l, i) => {
          if (l.type === "prompt") return (
            <div key={i}>
              <span className="t-prompt">→ </span>
              <span className="t-cmd">{l.text}</span>
              {l.blink && <span className="blink" style={{ color: "var(--amber)" }}>█</span>}
            </div>
          );
          if (l.type === "out") return <div key={i} className="t-out">{l.text}</div>;
          if (l.type === "json") return (
            <div key={i}>
              <span className="t-out">{"{"}</span>
              {l.pairs.map(([k, v]) => (
                <div key={k} style={{ paddingLeft: 16 }}>
                  <span className="t-key">"{k}"</span>
                  <span className="t-out">: </span>
                  <span className="t-str">{v}</span>
                </div>
              ))}
              <span className="t-out">{"}"}</span>
            </div>
          );
          if (l.type === "repo") return (
            <div key={i}>
              {l.items.map(r => (
                <div key={r} style={{ display: "flex", gap: 12 }}>
                  <span className="t-val">⬡</span>
                  <span className="t-str">alex-rivera/{r}</span>
                </div>
              ))}
            </div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FADE-UP WRAPPER
───────────────────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const visible = useIntersection(ref);
  return (
    <div
      ref={ref}
      className={`fade-up${visible ? " visible" : ""}`}
      style={{ animationDelay: `${delay}s`, ...style }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKILL BAR
───────────────────────────────────────────────────────────── */
function SkillBar({ label, level, delay }) {
  const ref     = useRef(null);
  const visible = useIntersection(ref);
  return (
    <div ref={ref} style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{label}</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--dim)" }}>{level}%</span>
      </div>
      <div className="skill-bar-track">
        <div
          className="skill-bar-fill"
          style={{
            width:            visible ? `${level}%` : "0%",
            transitionDelay:  `${delay}s`,
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────────────────────────── */
function ContactForm({ showToast }) {
  const [form,    setForm]    = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); showToast("Message sent! I'll reply within 24h ✓"); }, 1400);
  };

  if (sent) return (
    <div style={{
      background: "var(--surface2)", border: "1px solid rgba(34,197,94,0.25)",
      padding: "48px", textAlign: "center", borderRadius: 4,
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
      <p className="bebas" style={{ fontSize: 32, color: "var(--green)", marginBottom: 8 }}>Message Sent!</p>
      <p style={{ fontSize: 14, color: "var(--muted)" }}>I'll get back to you within 24 hours.</p>
    </div>
  );

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="about-grid">
        <input name="name"  value={form.name}  onChange={handle} placeholder="Your name"     required />
        <input name="email" value={form.email} onChange={handle} placeholder="Email address" type="email" required />
      </div>
      <input    name="subject" value={form.subject} onChange={handle} placeholder="Subject" />
      <textarea name="message" value={form.message} onChange={handle} placeholder="Your message…" rows={5} required />
      <div>
        <button className="btn-fill" type="submit" disabled={sending} style={{ opacity: sending ? 0.7 : 1 }}>
          {sending ? "Sending…" : "Send Message →"}
        </button>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────
   LIVE CLOCK
───────────────────────────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="mono" style={{ fontSize: 10, color: "var(--dim)", letterSpacing: "0.08em" }}>
      {time.toLocaleTimeString("en-US", { hour12: false, timeZone: "America/Los_Angeles" })} PT
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function Portfolio() {
  const [roleIdx,     setRoleIdx]     = useState(0);
  const [typed,       setTyped]       = useState("");
  const [deleting,    setDeleting]    = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [filter,      setFilter]      = useState("All");
  const [theme,       setTheme]       = useState("dark");
  const [toast,       setToast]       = useState(null);
  const [menuOpen,    setMenuOpen]    = useState(false);

  const { progress, section } = useScroll();

  useEffect(() => { setTimeout(() => setHeroVisible(true), 80); }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* typewriter */
  useEffect(() => {
    const full = ROLES[roleIdx];
    let t;
    if (!deleting && typed.length < full.length) {
      t = setTimeout(() => setTyped(full.slice(0, typed.length + 1)), 68);
    } else if (!deleting && typed.length === full.length) {
      t = setTimeout(() => setDeleting(true), 2400);
    } else if (deleting && typed.length > 0) {
      t = setTimeout(() => setTyped(typed.slice(0, -1)), 32);
    } else {
      setDeleting(false);
      setRoleIdx((roleIdx + 1) % ROLES.length);
    }
    return () => clearTimeout(t);
  }, [typed, deleting, roleIdx]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const W = { maxWidth: 1120, margin: "0 auto", padding: "0 40px" };

  const filteredProjects = filter === "All"
    ? PROJECTS
    : PROJECTS.filter(p => p.filter === filter.toLowerCase());

  const NAV_ITEMS = ["about", "stack", "projects", "contact"];

  return (
    <>
      <style>{CSS}</style>

      {/* ── PROGRESS BAR ── */}
      <div id="progress-bar" style={{ width: `${progress}%` }} />

      <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)", fontFamily: "'DM Sans', sans-serif", position: "relative" }}>

        {/* ── NAV ── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "var(--nav-blur)", backdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ ...W, display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            {/* Logo */}
            <button
              onClick={() => scrollTo("home")}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <span className="mono" style={{ fontSize: 14, color: "var(--amber)", fontWeight: 700, letterSpacing: "0.04em" }}>
                alex<span style={{ color: "var(--dim)" }}>.</span>rivera<span style={{ color: "var(--dim)" }}>.dev</span>
              </span>
            </button>

            {/* Desktop nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 36 }} className="hide-mobile">
              {NAV_ITEMS.map(s => (
                <button key={s} className={`nav-btn${section === s ? " active" : ""}`} onClick={() => scrollTo(s)}>{s}</button>
              ))}
            </div>

            {/* Right controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <LiveClock />
              <button
                className="theme-toggle"
                onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
                title="Toggle theme"
              >
                {theme === "dark" ? "☀" : "☽"}
              </button>
              {/* Mobile hamburger */}
              <button
                className="theme-toggle hide-desktop"
                onClick={() => setMenuOpen(m => !m)}
                style={{ display: "none" }}
              >
                ☰
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div style={{
              borderTop: "1px solid var(--border)", background: "var(--nav-blur)",
              padding: "16px 40px", display: "flex", flexDirection: "column", gap: 16,
            }}>
              {NAV_ITEMS.map(s => (
                <button key={s} className="nav-btn" style={{ textAlign: "left" }} onClick={() => scrollTo(s)}>{s}</button>
              ))}
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <section
          id="home"
          style={{ position: "relative", overflow: "hidden", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center" }}
        >
          <ParticleCanvas />
          <div className="grid-overlay" />

          <div style={{ ...W, padding: "80px 40px 100px", position: "relative", zIndex: 1, width: "100%" }}>
            {heroVisible && (
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,0.9fr)", gap: 72, alignItems: "center" }}>
                {/* Left */}
                <div>
                  <div className="fade-up visible" style={{ animationDelay: "0.05s", marginBottom: 28 }}>
                    <div className="avail-badge">
                      <div className="avail-dot" />
                      <span className="mono" style={{ fontSize: 10, color: "var(--green)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                        available for hire
                      </span>
                    </div>
                  </div>

                  <div className="fade-up visible" style={{ animationDelay: "0.12s" }}>
                    <h1
                      className="bebas hero-name"
                      style={{ fontSize: "clamp(80px, 10vw, 136px)", lineHeight: 0.92, marginBottom: 24 }}
                    >
                      Alex<br />
                      <span style={{ WebkitTextStroke: "1.5px var(--amber)", color: "transparent" }}>Rivera</span>
                    </h1>
                  </div>

                  <div className="fade-up visible" style={{ animationDelay: "0.22s", marginBottom: 28, height: 44, display: "flex", alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: "clamp(14px, 1.8vw, 18px)", color: "var(--muted)", letterSpacing: "0.02em" }}>
                      {">"}&nbsp;
                      <span style={{ color: "var(--amber)" }}>{typed}</span>
                      <span className="blink" style={{ color: "var(--amber)" }}>█</span>
                    </span>
                  </div>

                  <div className="fade-up visible" style={{ animationDelay: "0.32s", marginBottom: 44 }}>
                    <p style={{ fontSize: 16, color: "var(--muted)", maxWidth: 480, lineHeight: 1.8, fontWeight: 300 }}>
                      Building systems that scale. 7+ years crafting production software —
                      from early-stage startups to infrastructure serving millions of developers worldwide.
                    </p>
                  </div>

                  <div className="fade-up visible cta-row" style={{ animationDelay: "0.42s", display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <button className="btn-fill" onClick={() => scrollTo("projects")}>View Work →</button>
                    <button className="btn-ghost" onClick={() => scrollTo("contact")}>Get in Touch</button>
                  </div>

                  {/* Stats */}
                  <div className="fade-up visible stats-row" style={{ animationDelay: "0.52s", display: "flex", gap: 52, marginTop: 72, borderTop: "1px solid var(--border)", paddingTop: 44, flexWrap: "wrap" }}>
                    {STATS.map(([val, label], i) => (
                      <div key={label} className="stat-item" style={{ animationDelay: `${0.6 + i * 0.08}s` }}>
                        <div className="bebas" style={{ fontSize: 44, color: "var(--amber)", lineHeight: 1 }}>{val}</div>
                        <div className="mono" style={{ fontSize: 9, color: "var(--dim)", letterSpacing: "0.16em", marginTop: 8, textTransform: "uppercase" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right — Terminal */}
                <div className="fade-up visible hide-mobile" style={{ animationDelay: "0.35s" }}>
                  <Terminal />
                  {/* Floating badges */}
                  <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
                    {["PRO Vercel", "YC Alumni", "OSS Contributor"].map(b => (
                      <span key={b} className="mono" style={{ fontSize: 9, color: "var(--dim)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: "100px", letterSpacing: "0.08em" }}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom glow line */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
            <div className="glow-line" />
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" style={{ ...W, padding: "112px 40px" }}>
          <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 80, alignItems: "start" }}>
            <FadeUp>
              <div className="sec-counter">01 / 04</div>
              <p className="label">// about me</p>
              <h2 className="bebas" style={{ fontSize: 58, lineHeight: 1, marginBottom: 28 }}>Who I Am</h2>
              <p style={{ fontSize: 15.5, color: "var(--muted)", lineHeight: 1.9, marginBottom: 18, fontWeight: 300 }}>
                I'm a full-stack engineer based in San Francisco obsessed with clean abstractions and systems that are a joy to maintain.
                I've led engineering at two YC-backed startups and contributed to tools used by hundreds of thousands of developers.
              </p>
              <p style={{ fontSize: 15.5, color: "var(--muted)", lineHeight: 1.9, fontWeight: 300 }}>
                Outside of work, I maintain open-source tools, write about distributed systems on my blog, and occasionally speak at conferences on developer experience.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
                {["Systems Design", "API Craft", "DX Focus", "Open Source"].map(t => (
                  <span key={t} className="skill-tag">{t}</span>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.12}>
              <p className="label" style={{ marginBottom: 0 }}>// experience</p>
              <div style={{ borderTop: "1px solid var(--border)", marginTop: 14 }}>
                {EXP.map((e, i) => (
                  <div key={e.co} className="exp-row" style={{ transitionDelay: `${i * 0.07}s` }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{e.role}</p>
                      <p className="mono" style={{ fontSize: 11, color: "var(--amber)", letterSpacing: "0.06em", marginBottom: 8 }}>{e.co}</p>
                      <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, fontWeight: 300, marginBottom: 10 }}>{e.summary}</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {e.tags.map(t => <span key={t} className="hash">{t}</span>)}
                      </div>
                    </div>
                    <p className="mono" style={{ fontSize: 10, color: "var(--dim)", whiteSpace: "nowrap", marginTop: 2, marginLeft: 20 }}>{e.period}</p>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        <div style={{ ...W }}><div className="glow-line" /></div>

        {/* ── STACK ── */}
        <section id="stack" style={{ ...W, padding: "112px 40px" }}>
          <FadeUp>
            <div className="sec-counter">02 / 04</div>
            <p className="label">// tech stack</p>
            <h2 className="bebas" style={{ fontSize: 58, lineHeight: 1, marginBottom: 56 }}>What I Work With</h2>
          </FadeUp>

          <div className="stack-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
            {Object.entries(SKILLS).map(([cat, { items, level }], ci) => (
              <FadeUp key={cat} delay={ci * 0.08}>
                <p className="mono" style={{ fontSize: 9, color: "var(--dim)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>{cat}</p>
                {items.map((s, ii) => (
                  <SkillBar key={s} label={s} level={level[ii]} delay={ci * 0.08 + ii * 0.06} />
                ))}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
                  {items.map(s => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        <div style={{ ...W }}><div className="glow-line" /></div>

        {/* ── PROJECTS ── */}
        <section id="projects" style={{ ...W, padding: "112px 40px" }}>
          <FadeUp>
            <div className="sec-counter">03 / 04</div>
            <p className="label">// selected work</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
              <h2 className="bebas" style={{ fontSize: 58, lineHeight: 1 }}>Projects</h2>
              <div style={{ display: "flex", gap: 8 }}>
                {FILTERS.map(f => (
                  <button
                    key={f}
                    className={`filter-pill${filter === f ? " active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </FadeUp>

          <div
            className="proj-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 1, background: "var(--border)" }}
          >
            {filteredProjects.map((p, i) => (
              <FadeUp key={p.name} delay={i * 0.06}>
                <div className="proj-card" style={{ height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 22 }}>
                    <span className="mono" style={{
                      fontSize: 9, color: "var(--amber)", letterSpacing: "0.16em",
                      textTransform: "uppercase", background: "var(--amber-glow)",
                      padding: "5px 12px", border: "1px solid rgba(245,158,11,0.18)",
                    }}>
                      {p.tag}
                    </span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--dim)" }}>{p.year}</span>
                  </div>
                  <h3 className="bebas" style={{ fontSize: 42, color: "var(--text)", lineHeight: 1, marginBottom: 12 }}>{p.name}</h3>
                  <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.8, marginBottom: 16, fontWeight: 300 }}>{p.desc}</p>
                  <p className="mono" style={{ fontSize: 10, color: "var(--teal)", marginBottom: 18, letterSpacing: "0.04em" }}>
                    ↗ {p.metrics}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
                    {p.stack.map(t => <span key={t} className="hash">{t}</span>)}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                    <a href={p.github} className="proj-link">GitHub ↗</a>
                    <a href={p.link}   className="proj-link">Live ↗</a>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        <div style={{ ...W }}><div className="glow-line" /></div>

        {/* ── CONTACT ── */}
        <section id="contact" style={{ ...W, padding: "112px 40px 148px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,0.9fr) minmax(0,1.1fr)", gap: 80, alignItems: "start" }} className="about-grid">
            <FadeUp>
              <div className="sec-counter">04 / 04</div>
              <p className="label">// get in touch</p>
              <h2 className="bebas" style={{ fontSize: 58, lineHeight: 1, marginBottom: 20 }}>Let's Work<br />Together</h2>
              <p style={{ fontSize: 15.5, color: "var(--muted)", lineHeight: 1.8, marginBottom: 36, fontWeight: 300 }}>
                Open to full-time roles, contract work, and interesting side projects.
                Typical response time is under 24 hours.
              </p>
              <div style={{ display: "grid", gap: 14 }}>
                {[
                  { icon: "✉", label: "Email", val: "alex@rivera.dev" },
                  { icon: "📍", label: "Location", val: "San Francisco, CA" },
                  { icon: "⚡", label: "Response", val: "Under 24 hours" },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 4 }}>
                    <span style={{ fontSize: 18 }}>{r.icon}</span>
                    <div>
                      <div className="mono" style={{ fontSize: 9, color: "var(--dim)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2 }}>{r.label}</div>
                      <div style={{ fontSize: 14, color: "var(--text)" }}>{r.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <ContactForm showToast={showToast} />
            </FadeUp>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid var(--border)", padding: "28px 40px", background: "var(--surface)" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="mono" style={{ fontSize: 10, color: "var(--dim)", letterSpacing: "0.05em" }}>© 2024 Alex Rivera — Built with React</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 5, height: 5, background: "var(--green)", borderRadius: "50%", animation: "pulse 2s ease-in-out infinite" }} />
                <span className="mono" style={{ fontSize: 9, color: "var(--dim)", letterSpacing: "0.08em" }}>All systems operational</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {[
                { label: "GitHub",   icon: "⬡" },
                { label: "LinkedIn", icon: "⬡" },
                { label: "Twitter",  icon: "⬡" },
                { label: "Blog",     icon: "⬡" },
              ].map(s => (
                <a key={s.label} href="#" className="footer-link">{s.label}</a>
              ))}
            </div>
          </div>
        </footer>

      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div className="toast">
          <span style={{ color: "var(--green)" }}>✓</span>
          {toast}
        </div>
      )}
    </>
  );
}
