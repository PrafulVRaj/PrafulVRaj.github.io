/* ═══════════════════════════════════════════════════════════════
   config.js  —  ✏️  YOUR PERSONAL DATA
   Edit this file to customize the entire portfolio.
   No other file needs to change for personal info.
═══════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* ── Identity ─────────────────────────────────────────────── */
  user: {
    name:     'CiFy',          // shown on login screen & start menu
    fullName: 'Praful V Raj',     // shown in About window
    role:     'Software Engineer',  // shown in About window
    bio:      "Hi, I'm Praful V Raj, I am a B.Tech student in Computer Science Engineering at the East West Institute of Technology Banglore (EWIT).I used to split time between building systems, web development, and web3 projects.",
    bio2:     ' I’m passionate about systems engineering, computational programing, mathematics and open source development. When I’m not coding, you’ll probably find me reading philosophy, making an art, or thinking about how to balance consumption vs creation (still losing that battle).',
    avatar:   '👨‍💻',               // emoji avatar (replace with <img> path later)
    tags:     ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Open Source'],
  },

  /* ── Contact links ────────────────────────────────────────── */
  contact: [
    { icon: '📧', label: 'Email',    value: 'prafulvraj@gmail.com',              href: 'mailto:prafulvraj@gmail.com' },
    { icon: '💼', label: 'LinkedIn', value: 'linkedin.com/in/praful-v-raj',   href: 'https://www.linkedin.com/in/praful-v-raj-a6a525307' },
    { icon: '🐙', label: 'GitHub',   value: 'github.com/PrafulVRaj',        href: 'https://github.com/PrafulVRaj' },
  ],

  /* ── Skills ───────────────────────────────────────────────── */
  skills: {
    'Frontend': [
      ['React / Next.js',  92],
      ['TypeScript',       88],
      ['CSS / Tailwind',   85],
    ],
    'Backend': [
      ['Node.js',          88],
      ['Python / FastAPI', 80],
      ['PostgreSQL',       76],
    ],
    'Tools & Cloud': [
      ['Docker',           78],
      ['AWS / Cloud',      70],
      ['Git / CI/CD',      90],
    ],
  },

  /* ── Projects ─────────────────────────────────────────────── */
  /*
   *  type: 'card'    — simple card in the Projects window (default)
   *  type: 'app'     — gets its OWN window + taskbar icon  (Step 2+)
   *
   *  For 'app' type you can also set:
   *    appFile: 'apps/myproject.js'   — JS file that renders the window body
   *    liveUrl: 'https://...'         — iframe src for web demos
   */
  projects: [
    {
      id:      'ecommerce',
      emoji:   '🛒',
      title:   'E-Commerce Platform',
      desc:    'Full-stack marketplace with real-time inventory, payments, and admin dashboard.',
      stack:   ['React', 'Node.js', 'MongoDB', 'Stripe'],
      type:    'card',
    },
    {
      id:      'aichat',
      emoji:   '🤖',
      title:   'AI Chat Assistant',
      desc:    'LLM-powered chatbot with memory, file uploads, and multi-modal support.',
      stack:   ['Python', 'FastAPI', 'OpenAI', 'React'],
      type:    'card',
    },
    {
      id:      'analytics',
      emoji:   '📊',
      title:   'Analytics Dashboard',
      desc:    'Real-time data visualisation platform with custom chart builders.',
      stack:   ['Vue.js', 'D3.js', 'GraphQL', 'Redis'],
      type:    'card',
    },
    {
      id:      'Simple Websites',
      emoji:   '📱',
      title:   'Simple Websites',
      desc:    'A simple responsive website built with modern web technologies.',
      stack:   ['HTML', 'CSS', 'JavaScript'],
      type:    'card',
    },
    {
      id:      'Amedi',
      emoji:   '🌿',
      title:   'Medical Plant Identifier',
      desc:    'Image recognition app that identifies medicinal plants from photos.',
      stack:   ['HTML', 'CSS', 'JavaScript','Python'],
      type:    'card',
    },
    {
      id:      'Auto trader',
      emoji:   '📈',
      title:   'Auto trader',
      desc:    'Automated trading platform for stock market analysis and execution.',
      stack:   ['Python', 'Pandas', 'NumPy', 'Scikit-learn'],
      type:    'card',
    },
  ],

  /* ── Wallpapers ───────────────────────────────────────────── */
  defaultWallpaper: 'city',    // 'bloom' | 'sunset' | 'aurora' | 'midnight' | 'city'

  /* ── Login ────────────────────────────────────────────────── */
  /*  Extra accounts shown on the login screen */
  loginUsers: [
    { id: 'Cify', name: 'CiFy', avatar: '👨‍💻' },
    { id: 'guest',   name: 'Guest',   avatar: '👤' },
  ],
  /* Password to log in — leave empty string '' to match screenshot */
  loginPassword: '',

};
