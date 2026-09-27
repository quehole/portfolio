window.PORTFOLIO_DATA = {
  projects: [
    {
      id: 'szh', name: 'SZH', status: 'ACTIVE', type: 'DEVELOPMENT ORGANIZATION',
      stack: ['WEB', 'SYSTEMS', 'INTERACTION'], focus: 'EXPERIMENTAL DIGITAL PRODUCTS',
      description: 'An independent development organization focused on interactive digital projects, systems and experiments.',
      link: 'https://quehole.github.io/szh-website/', casePage: 'projects/szh/',
      route: 'casefile://szh',
      build: 'A platform and project space for exploring interactive web work, systems and new ideas.'
    },
    {
      id: 'pretend', name: 'PRETEND', status: 'ACTIVE DEVELOPMENT', type: 'DISCORD BOT',
      stack: ['DISCORD', 'BOT SYSTEMS', 'AUTOMATION'], focus: 'COMMUNITY TOOLING',
      description: 'A multifunctional Discord bot built as a practical system for communities, automation and everyday server tools.',
      link: 'https://quehole.github.io/pretend/', casePage: 'projects/pretend/',
      route: 'casefile://pretend',
      build: 'A multifunctional bot system designed around useful server tools, automation and extensible Discord workflows.'
    },
    { id: 'navithingy', name: 'NAVITHINGY', status: 'PROJECT', type: 'PROJECT', stack: [], focus: 'PREVIOUS WORK', description: 'Previously listed portfolio project.', link: '#work' },
    { id: 'tidal-subsonic', name: 'TIDAL SUBSONIC', status: 'PROJECT', type: 'PROJECT', stack: [], focus: 'PREVIOUS WORK', description: 'Previously listed portfolio project.', link: '#work' },
    { id: 'peekless', name: 'PEEKLESS', status: 'PROJECT', type: 'PROJECT', stack: [], focus: 'PREVIOUS WORK', description: 'Previously listed portfolio project.', link: '#work' }
  ],
  timeline: [
    ['v01', 'FOUNDATION', 'Initial portfolio and developer identity.'],
    ['v05', 'INTERFACE', 'Terminal, command palette and system layers.'],
    ['v08', 'AUDIO', 'Ambient audio, mixer and reactive visualizer.'],
    ['v12', 'HEADER', 'Header and interaction system rebuilt.'],
    ['v16', 'HERO', 'Hero simplified and navigation refined.'],
    ['v19', 'MOBILE', 'Dedicated mobile navigation and responsive redesign.'],
    ['v20', 'SYSTEM', 'Developer environment, case files and lab.'],
    ['v21', 'EXPANSION', 'Architecture, playground, history and hidden systems.'],
    ['v24', 'THEME', 'Dark and light theme system.'],
    ['v26', 'POLISH', 'Orb and architecture surfaces synchronized with the light theme.'],
    ['v27', 'DEVELOPER OS', 'Command center, project network, data layer, code vault and deeper developer tooling.']
  ],
  codeVault: [
    {
      id: 'theme', label: 'THEME PERSISTENCE', language: 'JS',
      description: 'The local theme preference is restored before the interface renders.',
      code: 'const saved = localStorage.getItem("portfolio-theme");\nif (saved === "light") document.documentElement.classList.add("light-theme-preload");'
    },
    {
      id: 'terminal', label: 'TERMINAL COMMAND DISPATCH', language: 'JS',
      description: 'Commands are normalized, parsed and routed through a local command map.',
      code: 'const normalized = value.toLowerCase();\nconst [command, ...args] = normalized.split(/\\s+/);\nif (commands[command]) commands[command](args);'
    },
    {
      id: 'orb', label: 'ORGANIC ORB MOTION', language: 'JS',
      description: 'Pointer movement is converted into a restrained transform offset.',
      code: 'const targetX = (window.innerWidth / 2 - event.clientX) * 0.012;\nconst targetY = (window.innerHeight / 2 - event.clientY) * 0.012;\norb.style.setProperty("--orb-x", `${targetX}px`);'
    },
    {
      id: 'audio', label: 'AUDIO REACTIVITY', language: 'JS',
      description: 'The visual layer receives a normalized level from the audio analyser.',
      code: 'window.dispatchEvent(new CustomEvent("portfolio:audio-level", {\n  detail: { level }\n}));'
    }
  ],
  architecture: {
    portfolio: ['PORTFOLIO', 'PROJECTS', 'GITHUB', 'LAB', 'TERMINAL'],
    projects: ['SZH', 'PRETEND', 'LEGACY WORK', 'UNKNOWN'],
    systems: ['LIVE DATA', 'AUDIO', 'DISCORD', 'THEME', 'LOCAL STATE']
  },
  experimentTracks: [
    ['LIQUID INTERFACE', 'MOTION / ORGANIC GEOMETRY', 'LAB / 001'],
    ['DISCORD SYSTEMS', 'PRESENCE / AUTOMATION', 'LAB / 002'],
    ['TERMINAL UI', 'COMMAND-DRIVEN INTERFACE', 'LAB / 003'],
    ['AUDIO REACTIVITY', 'WEB AUDIO / VISUAL RESPONSE', 'LAB / 004'],
    ['WEBGL / NEXT', 'SPATIAL GRAPHICS / RESERVED', 'LAB / 005']
  ],
  buildPlan: [
    ['ACTIVE', 'SZH', 'Platform, interface and supporting systems.'],
    ['ACTIVE', 'PRETEND', 'Multifunctional Discord bot and automation systems.'],
    ['EXPERIMENT', 'LAB', 'Interactive UI, audio reactivity and future spatial work.'],
    ['SYSTEM', 'PORTFOLIO', 'Developer OS, terminal and live data surfaces.']
  ]
};
