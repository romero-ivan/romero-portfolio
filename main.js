document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.glass-nav');
  const dropletContainer = document.querySelector('.droplet-container');
  const liquidGlow = document.querySelector('.liquid-glow');
  const bubbleChamber = document.querySelector('.bubble-chamber');
  const productivitySection = document.querySelector('.productivity-section');
  
  // Project Reader Elements
  const minidiscs = document.querySelectorAll('.minidisc-case');
  const projectReader = document.getElementById('project-reader');
  const readerTitle = document.getElementById('reader-title');
  const readerDesc = document.getElementById('reader-desc');
  const readerLink = document.getElementById('reader-link');
  const readerGithub = document.getElementById('reader-github');
  const readerSpecs = document.getElementById('reader-specs');
  const readerMedia = document.getElementById('reader-media');
  const readerImg1 = document.getElementById('reader-img-project-1');
  const readerImg2 = document.getElementById('reader-img-project-2');
  const readerImg3 = document.getElementById('reader-img-project-3');
  const closeReader = document.querySelector('.close-reader');

  // SVG Water Ripple elements
  const displacement = document.querySelector('#water-filter feDisplacementMap');
  const turbulence = document.querySelector('#water-filter feTurbulence');
  const waterLens = document.querySelector('.water-lens');

  // CV Overlay SPA elements
  const cvOverlay = document.getElementById('cv-overlay');
  const cvCloseBtn = document.getElementById('cv-close-btn');
  const cvOpenTriggers = document.querySelectorAll('.cv-open-trigger');

  // Aurora background elements for scroll color (cross-fading static layers for performance)
  const auroraZone1 = document.querySelector('.aurora-bg.zone-1');
  const auroraZone2 = document.querySelector('.aurora-bg.zone-2');
  const auroraZone3 = document.querySelector('.aurora-bg.zone-3');

  // =============================================
  // SPRING PHYSICS SYSTEM (Inertial UI Engine)
  // =============================================
  class Spring {
    constructor({ stiffness = 170, damping = 26, mass = 1, initialValue = 0 } = {}) {
      this.k = stiffness;
      this.c = damping;
      this.m = mass;
      this.x = initialValue;
      this.v = 0;
      this.target = initialValue;
    }

    update(dt) {
      const fSpring = -this.k * (this.x - this.target);
      const fDamping = -this.c * this.v;
      const a = (fSpring + fDamping) / this.m;
      this.v += a * dt;
      this.x += this.v * dt;
      return this.x;
    }
  }

  const cvCard = document.querySelector('.cv-card');
  const cvYSpring = new Spring({ stiffness: 120, damping: 14, mass: 1, initialValue: 40 });
  let cvAnimFrame = null;

  function cvLoop() {
    const dt = 0.016;
    const y = cvYSpring.update(dt);
    if (cvCard) {
      cvCard.style.transform = `translateY(${y}px)`;
    }

    const isResting = Math.abs(cvYSpring.x - cvYSpring.target) < 0.05 && Math.abs(cvYSpring.v) < 0.05;
    if (!isResting) {
      cvAnimFrame = requestAnimationFrame(cvLoop);
    } else {
      if (cvCard) {
        cvCard.style.transform = `translateY(${cvYSpring.target}px)`;
      }
      cvAnimFrame = null;
    }
  }

  function startCvLoop() {
    if (cvAnimFrame) cancelAnimationFrame(cvAnimFrame);
    cvAnimFrame = requestAnimationFrame(cvLoop);
  }

  // =============================================
  // CV OVERLAY SPA LOGIC
  // =============================================
  function openCV(e) {
    if (e) e.preventDefault();
    if (!cvOverlay) return;
    cvOverlay.style.display = 'flex';
    // Force reflow before adding class for transition
    cvOverlay.offsetHeight;
    cvOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Start spring animation
    cvYSpring.x = 40;
    cvYSpring.v = 0;
    cvYSpring.target = 0;
    startCvLoop();
  }

  function closeCV() {
    if (!cvOverlay) return;
    cvOverlay.classList.remove('open');
    document.body.style.overflow = '';

    // Animate CV card out
    cvYSpring.target = 40;
    startCvLoop();

    // Wait for fade-out then hide
    setTimeout(() => {
      if (!cvOverlay.classList.contains('open')) {
        cvOverlay.style.display = 'none';
      }
    }, 400);
  }

  cvOpenTriggers.forEach(trigger => {
    trigger.addEventListener('click', openCV);
  });

  if (cvCloseBtn) {
    cvCloseBtn.addEventListener('click', closeCV);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cvOverlay && cvOverlay.classList.contains('open')) {
      closeCV();
    }
  });

  // =============================================
  // SCROLL COLOR INTERPOLATION (Submarine theme)
  // =============================================
  const colorStops = [
    { pos: 0.0,  bg: [6, 6, 8] },
    { pos: 0.25, bg: [30, 18, 8] },
    { pos: 0.5,  bg: [12, 12, 14] },
    { pos: 0.75, bg: [24, 18, 10] },
    { pos: 1.0,  bg: [8, 8, 10] },
  ];

  function lerpColor(a, b, t) {
    return a.map((v, i) => v + (b[i] - v) * t);
  }

  function getInterpolated(progress) {
    let lower = colorStops[0];
    let upper = colorStops[colorStops.length - 1];
    for (let i = 0; i < colorStops.length - 1; i++) {
      if (progress >= colorStops[i].pos && progress <= colorStops[i + 1].pos) {
        lower = colorStops[i];
        upper = colorStops[i + 1];
        break;
      }
    }
    const range = upper.pos - lower.pos;
    const t = range === 0 ? 0 : (progress - lower.pos) / range;

    const bg = lerpColor(lower.bg, upper.bg, t);
    return { bg };
  }

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

      // 1. Smoothly interpolate body background color
      const { bg } = getInterpolated(progress);
      document.body.style.backgroundColor = `rgb(${Math.round(bg[0])}, ${Math.round(bg[1])}, ${Math.round(bg[2])})`;

      // 2. Hardware-accelerated crossfade of static aurora layers based on progress
      let op1 = 0, op2 = 0, op3 = 0;
      if (progress <= 0.5) {
        const t = progress / 0.5; // 0 to 1
        op1 = 1 - t;
        op2 = t;
        op3 = 0;
      } else {
        const t = (progress - 0.5) / 0.5; // 0 to 1
        op1 = 0;
        op2 = 1 - t;
        op3 = t;
      }

      if (auroraZone1) auroraZone1.style.opacity = op1.toFixed(3);
      if (auroraZone2) auroraZone2.style.opacity = op2.toFixed(3);
      if (auroraZone3) auroraZone3.style.opacity = op3.toFixed(3);

      // Shrink nav on scroll
      if (nav) {
        if (scrollTop > 50) {
          nav.style.padding = '0.5rem 2rem';
          nav.style.background = 'rgba(8, 8, 10, 0.65)';
        } else {
          nav.style.padding = '0.8rem 2.5rem';
          nav.style.background = 'rgba(8, 8, 10, 0.45)';
        }
      }

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // =============================================
  // SCROLL REVEAL — IntersectionObserver
  // =============================================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Check for section title glow children
        const glowTitle = entry.target.querySelector('.section-title-glow');
        if (glowTitle) {
          glowTitle.classList.add('glowing');
          // Remove glow after animation
          setTimeout(() => glowTitle.classList.remove('glowing'), 2000);
        }

        // Also handle direct glow elements
        if (entry.target.classList.contains('section-title-glow')) {
          entry.target.classList.add('glowing');
          setTimeout(() => entry.target.classList.remove('glowing'), 2000);
        }
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // =============================================
  // PARALLAX DROPLET
  // =============================================
  window.addEventListener('mousemove', (e) => {
    if (!dropletContainer) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;
    dropletContainer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });

  // =============================================
  // WATER LENS TRACKING & GENERALIZED SNAPPING
  // =============================================
  let mouseX = 0;
  let mouseY = 0;
  let lensX = 0;
  let lensY = 0;
  let hasMoved = false;

  let targetWidth = 180;
  let targetHeight = 180;
  let targetRadius = 90;
  let currentWidth = 180;
  let currentHeight = 180;
  let currentRadius = 90;
  let snappedOrb = null;
  let snappedGeomTarget = null;
  let cachedRadius = 90;
  let lensEnabled = true;

  const defaultBorder = '1px solid rgba(255, 255, 255, 0.08)';
  const defaultShadow = 'inset 0 1px 1px rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 8px 32px rgba(0, 0, 0, 0.35)';
  const defaultBg = 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.0) 100%)';
  const defaultFilter = "url('#water-filter') saturate(130%)";

  const snapBorder = '1px solid rgba(197, 160, 89, 0.35)';
  const snapShadow = 'inset 0 1px 1px rgba(197, 160, 89, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 8px 32px rgba(197, 160, 89, 0.15)';

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!hasMoved) {
      hasMoved = true;
      if (waterLens && lensEnabled) waterLens.classList.add('active');
      lensX = mouseX;
      lensY = mouseY;
    }
  });

  function animateLens() {
    if (hasMoved && waterLens) {
      let targetX = mouseX;
      let targetY = mouseY;

      if (snappedOrb) {
        const geomTarget = snappedGeomTarget || snappedOrb;
        const rect = geomTarget.getBoundingClientRect();
        const orbCenterX = rect.left + rect.width / 2;
        const orbCenterY = rect.top + rect.height / 2;

        targetX = orbCenterX;
        targetY = orbCenterY;
        targetWidth = rect.width;
        targetHeight = rect.height;
        targetRadius = cachedRadius;

        // Dynamic elastic break-free boundary relative to element size (based on trigger orb)
        const triggerRect = snappedOrb.getBoundingClientRect();
        const threshold = Math.max(120, triggerRect.width / 2 + 100);

        // Distance check
        const dx = mouseX - (triggerRect.left + triggerRect.width / 2);
        const dy = mouseY - (triggerRect.top + triggerRect.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > threshold) {
          snappedOrb = null;
          snappedGeomTarget = null;
          targetWidth = 180;
          targetHeight = 180;
          targetRadius = 90;
          waterLens.style.border = defaultBorder;
          waterLens.style.boxShadow = defaultShadow;
          waterLens.style.background = defaultBg;
          waterLens.style.backdropFilter = defaultFilter;
          waterLens.style.webkitBackdropFilter = defaultFilter;
        } else {
          // Snap glow styling: clear background glare and bypass displacement filter to prevent text warp
          waterLens.style.border = snapBorder;
          waterLens.style.boxShadow = snapShadow;
          waterLens.style.background = 'transparent';
          waterLens.style.backdropFilter = 'none';
          waterLens.style.webkitBackdropFilter = 'none';
        }
      } else {
        targetWidth = 180;
        targetHeight = 180;
        targetRadius = 90;
        waterLens.style.border = defaultBorder;
        waterLens.style.boxShadow = defaultShadow;
        waterLens.style.background = defaultBg;
        waterLens.style.backdropFilter = defaultFilter;
        waterLens.style.webkitBackdropFilter = defaultFilter;
      }

      // Smooth interpolation for both position and shape
      lensX += (targetX - lensX) * 0.12;
      lensY += (targetY - lensY) * 0.12;
      currentWidth += (targetWidth - currentWidth) * 0.12;
      currentHeight += (targetHeight - currentHeight) * 0.12;
      currentRadius += (targetRadius - currentRadius) * 0.12;

      waterLens.style.width = `${currentWidth}px`;
      waterLens.style.height = `${currentHeight}px`;
      waterLens.style.borderRadius = `${currentRadius}px`;
      waterLens.style.transform = `translate3d(${lensX - currentWidth / 2}px, ${lensY - currentHeight / 2}px, 0)`;
    }
    requestAnimationFrame(animateLens);
  }
  requestAnimationFrame(animateLens);

  // General event delegation to capture hover on any magnetic elements
  document.addEventListener('mouseover', (e) => {
    if (!lensEnabled) return;
    const target = e.target.closest('.glass-button, .lang-toggle-btn, .lens-toggle-btn, .nav-btn, .glass-nav a, .cv-btn, .close-reader, .reader-nav-btn, .contact-fluid-orb, .droplet-node');
    if (target && target !== snappedOrb) {
      // If target is a droplet-node, snap to its visual element (which is the actual circle!)
      const geomTarget = target.classList.contains('droplet-node') ? target.querySelector('.droplet-visual') : target;
      if (!geomTarget) return;

      snappedOrb = target;
      snappedGeomTarget = geomTarget;

      // Compute and cache border-radius once
      const compStyle = window.getComputedStyle(geomTarget);
      const radStr = compStyle.borderRadius;
      if (radStr.includes('%') || radStr === '50%') {
        const rect = geomTarget.getBoundingClientRect();
        cachedRadius = rect.height / 2;
      } else {
        cachedRadius = parseFloat(radStr) || 0;
      }
    }
  });

  // =============================================
  // TRANSLATION SYSTEM DICTIONARY
  // =============================================
  const translations = {
    es: {
      'meta-desc': 'Romero - Experto en LLMs y Entornos de Código Agente (ACE).',
      'meta-title': 'Romero | Experto en IA & Sistemas Agentes',
      'nav-about': 'Sobre mí',
      'nav-projects': 'Proyectos',
      'nav-productivity': 'Rendimiento',
      'nav-cv': 'CV',
      'nav-contact': 'Contactar',
      'nav-lens-disable': 'DESACTIVAR LUPA',
      'nav-lens-enable': 'ACTIVAR LUPA',
      'hero-title': 'Desarrollo de<br>Software Interactivo.',
      'hero-desc': 'Soy desarrollador generalista. Mi trayectoria autodidacta y experiencia con la informática y la IA hacen que el desarrollo me resulte intuitivo, centrado en evitar código descuidado (slop) y con un fuerte enfoque en rendimiento, seguridad y auditabilidad. Me especializo en frontend interactivo, backend y despliegues en Google Cloud.',
      'hero-btn-projects': 'Ver Proyectos',
      'hero-btn-cv': 'Ver CV',
      'sect-projects-title': 'Proyectos',
      'shelf-progress-title': 'SISTEMAS EN DESARROLLO (NO DISPONIBLES)',
      'disc-sec': 'CIBERSEGURIDAD',
      'disc-dist': 'DISTRIBUCIÓN',
      'disc-game': 'VIDEOJUEGOS',
      'disc-mktg': 'MARKETING',
      'disc-soc': 'SOCIALIZACIÓN',
      'disc-etc': 'Y MÁS',
      'reader-selected-module': 'MÓDULO SELECCIONADO',
      'reader-placeholder-title': 'Selecciona un proyecto...',
      'reader-placeholder-desc': 'Selecciona un módulo técnico para visualizar la descripción detallada de su arquitectura.',
      'reader-btn-demo': 'Demo &rarr;',
      'reader-btn-github': 'Código GitHub',
      'sect-productivity-sub': 'EFICIENCIA',
      'sect-productivity-title': 'Optimización del Flujo de Trabajo',
      'sect-productivity-desc': 'Comparación del rendimiento y velocidad de desarrollo utilizando automatización asistida frente a métodos tradicionales.',
      'reactor-slow-title': 'Desarrollo Convencional',
      'reactor-slow-desc': 'Escritura y depuración manual',
      'reactor-fast-title': 'Desarrollo Asistido',
      'reactor-fast-desc': 'Automatización y optimización',
      'sect-thinking-sub': 'METODOLOGÍA',
      'sect-thinking-title': 'Análisis y Planificación',
      'sect-thinking-desc': 'Evaluación estructurada de requisitos y diseño de arquitectura para optimizar la fiabilidad antes de escribir código.',
      'node-efficiency': 'Rendimiento',
      'node-failures': 'Errores',
      'node-features': 'Negocio',
      'node-scalability': 'Futuro',
      'blob-core': 'Requerimiento',
      'brancher-default-title': 'Evaluación Multidimensional de Soluciones',
      'brancher-default-desc': 'Interactúa con los nodos de la izquierda para evaluar mi enfoque analítico ante diferentes escenarios críticos.',
      'brancher-card-slow': 'Desarrollador Común',
      'brancher-card-fast': 'Mi Enfoque',
      'sect-contact-title': 'Contacto',
      'cv-btn-back': '&larr; Volver al Portfolio',
      'cv-btn-print': 'Imprimir / Guardar en PDF',
      'cv-sidebar-contact': 'Contacto',
      'cv-phone': 'Teléfono',
      'cv-email': 'Email',
      'cv-location': 'Ubicación',
      'cv-loc-val': 'Huesca, España',
      'cv-license': 'Licencia',
      'cv-lic-val': 'Carné de conducir: B',
      'cv-skills': 'Habilidades',
      'cv-skills-frontend': 'Frontend &amp; Interactividad',
      'cv-skill-layout3d': 'Layouts 3D',
      'cv-skills-backend': 'Backend &amp; Cloud',
      'cv-skills-logic': 'Automatización &amp; Lógica',
      'cv-skill-industrial': 'Bases de Automatismos',
      'cv-skill-control': 'Instalaciones Eléctricas',
      'cv-skill-audit': 'Auditoría Código',
      'cv-education': 'Educación',
      'cv-edu-ongoing': 'En curso (Paso a 2º)',
      'cv-edu-electricity': 'Grado Medio en Instalaciones Eléctricas y Automáticas',
      'cv-edu-admin': 'Grado Medio en Gestión Administrativa',
      'cv-edu-eso': 'Educación Secundaria Obligatoria',
      'cv-name': 'Iván Romero Figueroa',
      'cv-job-title': 'Desarrollador de Software &amp; Lógica de Sistemas',
      'cv-profile-title': 'Perfil Profesional',
      'cv-profile-desc': 'Desarrollador generalista enfocado en aplicaciones web interactivas y simulación. Cuento con nociones de automatización eléctrica obtenidas durante mi formación práctica y más de 4 años de experiencia en desarrollo web y despliegues serverless (Firebase, GCP). Comprometido con la seguridad, el alto rendimiento y la entrega de código de excelente calidad.',
      'cv-exp-title': 'Experiencia Laboral',
      'cv-exp-freelance-role': 'Desarrollador Web Freelance',
      'cv-exp-freelance-date': '2020 — 2024',
      'cv-exp-freelance-company': 'Desarrollo de Software y Gestión Operativa',
      'cv-exp-freelance-bullet1': 'Desarrollo de escritorios virtuales interactivos y simulaciones web en tiempo real.',
      'cv-exp-freelance-bullet2': 'Integración de bases de datos y servicios serverless con Firebase y Google Cloud.',
      'cv-exp-freelance-bullet3': 'Gestión completa de proyectos desde los requisitos técnicos hasta el despliegue final.',
      'cv-exp-intern-role': 'Ayudante de Electricidad (Prácticas)',
      'cv-exp-intern-date': '2026 (1 mes)',
      'cv-exp-intern-company': 'Iluminación Mi Casa S.L., Huesca',
      'cv-exp-intern-bullet1': 'Ayudante en la instalación y sustitución de ventiladores y componentes de iluminación.',
      'cv-exp-intern-bullet2': 'Inspección técnica de edificios para la sustitución de bombillas y optimización de consumo.',
      'cv-exp-intern-bullet3': 'Revisión y soporte básico en la localización de averías eléctricas para particulares y aseguradoras.',
      'badge-sync': '— Sincronizado con GitHub',
      'reader-close': 'CERRAR'
    },
    en: {
      'meta-desc': 'Romero - Expert in LLMs and Agentic Code Environments (ACE).',
      'meta-title': 'Romero | AI & Agentic Systems Expert',
      'nav-about': 'About',
      'nav-projects': 'Projects',
      'nav-productivity': 'Performance',
      'nav-cv': 'CV',
      'nav-contact': 'Contact',
      'nav-lens-disable': 'DISABLE LENS',
      'nav-lens-enable': 'ENABLE LENS',
      'hero-title': 'Interactive<br>Software Development.',
      'hero-desc': 'I am a generalist developer. My self-taught journey and experience with computer science and AI make development intuitive to me, focused on avoiding slop code and with a strong emphasis on performance, security, and auditability. I specialize in interactive frontend, backend, and Google Cloud deployments.',
      'hero-btn-projects': 'View Projects',
      'hero-btn-cv': 'View CV',
      'sect-projects-title': 'Projects',
      'shelf-progress-title': 'SYSTEMS IN DEVELOPMENT (NOT AVAILABLE)',
      'disc-sec': 'CYBERSECURITY',
      'disc-dist': 'DISTRIBUTION',
      'disc-game': 'VIDEO GAMES',
      'disc-mktg': 'MARKETING',
      'disc-soc': 'SOCIALIZATION',
      'disc-etc': 'AND MORE',
      'reader-selected-module': 'SELECTED MODULE',
      'reader-placeholder-title': 'Select a project...',
      'reader-placeholder-desc': 'Select a technical module to visualize the detailed description of its architecture.',
      'reader-btn-demo': 'Demo &rarr;',
      'reader-btn-github': 'GitHub Code',
      'sect-productivity-sub': 'EFFICIENCY',
      'sect-productivity-title': 'Workflow Optimization',
      'sect-productivity-desc': 'Comparison of performance and development speed using assisted automation vs. traditional methods.',
      'reactor-slow-title': 'Conventional Development',
      'reactor-slow-desc': 'Manual writing and debugging',
      'reactor-fast-title': 'Assisted Development',
      'reactor-fast-desc': 'Automation and optimization',
      'sect-thinking-sub': 'METHODOLOGY',
      'sect-thinking-title': 'Analysis & Planning',
      'sect-thinking-desc': 'Structured evaluation of requirements and architecture design to optimize reliability before writing code.',
      'node-efficiency': 'Performance',
      'node-failures': 'Errors',
      'node-features': 'Business',
      'node-scalability': 'Future',
      'blob-core': 'Requirement',
      'brancher-default-title': 'Multidimensional Solution Evaluation',
      'brancher-default-desc': 'Interact with the nodes on the left to evaluate my analytical approach to different critical scenarios.',
      'brancher-card-slow': 'Average Developer',
      'brancher-card-fast': 'My Approach',
      'sect-contact-title': 'Contact',
      'cv-btn-back': '&larr; Back to Portfolio',
      'cv-btn-print': 'Print / Save to PDF',
      'cv-sidebar-contact': 'Contact',
      'cv-phone': 'Phone',
      'cv-email': 'Email',
      'cv-location': 'Location',
      'cv-loc-val': 'Huesca, Spain',
      'cv-license': 'License',
      'cv-lic-val': 'Driver\'s license: B',
      'cv-skills': 'Skills',
      'cv-skills-frontend': 'Frontend &amp; Interactivity',
      'cv-skill-layout3d': '3D Layouts',
      'cv-skills-backend': 'Backend &amp; Cloud',
      'cv-skills-logic': 'Automation &amp; Logic',
      'cv-skill-industrial': 'Basic Automation',
      'cv-skill-control': 'Electrical Installations',
      'cv-skill-audit': 'Code Auditing',
      'cv-education': 'Education',
      'cv-edu-ongoing': 'In progress (Moving to 2nd year)',
      'cv-edu-electricity': 'Intermediate Vocational Training in Electrical and Automatic Installations',
      'cv-edu-admin': 'Intermediate Vocational Training in Administrative Management',
      'cv-edu-eso': 'Compulsory Secondary Education (ESO)',
      'cv-name': 'Iván Romero Figueroa',
      'cv-job-title': 'Software Developer &amp; Systems Logic',
      'cv-profile-title': 'Professional Profile',
      'cv-profile-desc': 'Generalist developer focused on interactive web applications and simulation. I have basic notions of electrical automation obtained during my practical training, and more than 4 years of experience in web development and serverless deployments (Firebase, GCP). Committed to security, high performance, and delivering high-quality code.',
      'cv-exp-title': 'Work Experience',
      'cv-exp-freelance-role': 'Freelance Web Developer',
      'cv-exp-freelance-date': '2020 — 2024',
      'cv-exp-freelance-company': 'Software Development & Operations Management',
      'cv-exp-freelance-bullet1': 'Development of interactive virtual desktops and real-time web simulations.',
      'cv-exp-freelance-bullet2': 'Integration of databases and serverless services with Firebase and Google Cloud.',
      'cv-exp-freelance-bullet3': 'Full project management from technical requirements to final deployment.',
      'cv-exp-intern-role': 'Electrical Assistant (Internship)',
      'cv-exp-intern-date': '2026 (1 month)',
      'cv-exp-intern-company': 'Iluminación Mi Casa S.L., Huesca',
      'cv-exp-intern-bullet1': 'Assisted in the installation and replacement of fans and lighting components.',
      'cv-exp-intern-bullet2': 'Technical inspection of buildings for light bulb replacement and consumption optimization.',
      'cv-exp-intern-bullet3': 'Basic support in troubleshooting electrical faults for private homes and insurance claims.',
      'badge-sync': '— Synced with GitHub',
      'reader-close': 'CLOSE'
    }
  };

  // State
  let currentLang = localStorage.getItem('romero-portfolio-lang') || 'es';
  let activeProjectId = null;

  // =============================================
  // PROJECT READER DATA
  // =============================================
  const projectData = {
    es: {
      'project-1': {
        title: 'Borda Silente',
        desc: 'Plataforma integral de reservas y gestión operativa para un refugio boutique en el Valle de Ansó, Pirineos. Cuenta con vistas de huéspedes con calculadora de tarifas e informes PDF, mostrador de recepción con chat y control de habitaciones, y supervisión ejecutiva con simulación de CCTV en vivo.',
        link: 'https://bordasim.web.app/',
        github: 'https://github.com/romero-ivan/Borda-Silente',
        year: '2024',
        techs: 'Firebase, GCP, PDF Generator, JS',
        type: 'Sistema de Gestión Operativa',
        scope: 'Fullstack & Control de Sistemas',
        serial: '[ ID-ROMERO-X01 ]',
        screenshot: '/demo-borda.png'
      },
      'project-2': {
        title: 'Smoking Sim',
        desc: 'Simulador interactivo de relajación en 3D (Three.js) ambientado en un pub subterráneo de estética retro-futurista. Incluye físicas de partículas de humo en Canvas y jazz de piano procedural interactivo.',
        link: 'https://fablesclub.web.app/',
        github: 'https://github.com/romero-ivan/smoking-sim',
        year: '2024',
        techs: 'Three.js, WebGL, HTML Canvas',
        type: 'Simulador 3D Interactivo',
        scope: 'Frontend & Físicas de Partículas',
        serial: '[ ID-ROMERO-X02 ]',
        screenshot: '/demo-smoking.png'
      },
      'project-3': {
        title: 'Aero Desktop',
        desc: 'Entorno de escritorio virtual interactivo inspirado en la estética clásica Frutiger Aero. Cuenta con ventanas flotantes con Pointer Events, aplicaciones integradas (Diario, Finanzas, Médico con PDF y Calendario de eventos) y sincronización con Firestore en tiempo real.',
        link: 'https://escritorio-aero.web.app/',
        github: 'https://github.com/romero-ivan/escritorio-aero',
        year: '2024',
        techs: 'Firestore, Pointer Events, CSS Grid',
        type: 'Escritorio Virtual Interactivo',
        scope: 'Frontend & Bases de Datos Tiempo Real',
        serial: '[ ID-ROMERO-X03 ]',
        screenshot: '/demo-aero.png'
      }
    },
    en: {
      'project-1': {
        title: 'Borda Silente',
        desc: 'Comprehensive booking and operational management platform for a boutique shelter in the Ansó Valley, Pyrenees. It features guest views with a rate calculator and PDF reports, a front desk with chat and room control, and executive oversight with live CCTV simulation.',
        link: 'https://bordasim.web.app/',
        github: 'https://github.com/romero-ivan/Borda-Silente',
        year: '2024',
        techs: 'Firebase, GCP, PDF Generator, JS',
        type: 'Operational Management System',
        scope: 'Fullstack & Systems Control',
        serial: '[ ID-ROMERO-X01 ]',
        screenshot: '/demo-borda.png'
      },
      'project-2': {
        title: 'Smoking Sim',
        desc: 'Interactive 3D relaxation simulator (Three.js) set in a retro-futuristic underground pub. It includes smoke particle physics in Canvas and interactive procedural piano jazz.',
        link: 'https://fablesclub.web.app/',
        github: 'https://github.com/romero-ivan/smoking-sim',
        year: '2024',
        techs: 'Three.js, WebGL, HTML Canvas',
        type: 'Interactive 3D Simulator',
        scope: 'Frontend & Particle Physics',
        serial: '[ ID-ROMERO-X02 ]',
        screenshot: '/demo-smoking.png'
      },
      'project-3': {
        title: 'Aero Desktop',
        desc: 'Interactive virtual desktop environment inspired by the classic Frutiger Aero aesthetic. It features floating windows with Pointer Events, built-in applications (Journal, Finance, Medical with PDF, and Event Calendar), and real-time Firestore synchronization.',
        link: 'https://escritorio-aero.web.app/',
        github: 'https://github.com/romero-ivan/escritorio-aero',
        year: '2024',
        techs: 'Firestore, Pointer Events, CSS Grid',
        type: 'Interactive Virtual Desktop',
        scope: 'Frontend & Real-time Databases',
        serial: '[ ID-ROMERO-X03 ]',
        screenshot: '/demo-aero.png'
      }
    }
  };

  function setMediaAndSpecs(data) {
    if (readerSpecs) {
      if (data && data.techs) {
        // Render specs grid
        readerSpecs.innerHTML = `
          <dt>${currentLang === 'es' ? 'Tipo' : 'Type'}</dt>
          <dd>${data.type}</dd>
          <dt>${currentLang === 'es' ? 'Tecnologías' : 'Technologies'}</dt>
          <dd>${data.techs}</dd>
          <dt>${currentLang === 'es' ? 'Enfoque' : 'Focus'}</dt>
          <dd>${data.scope}</dd>
        `;
        readerSpecs.style.display = 'grid';

        // Toggle preloaded screenshots display instantly
        if (readerMedia) {
          if (readerImg1) readerImg1.style.display = 'none';
          if (readerImg2) readerImg2.style.display = 'none';
          if (readerImg3) readerImg3.style.display = 'none';

          if (activeProjectId === 'project-1' && readerImg1) {
            readerImg1.style.display = 'block';
          } else if (activeProjectId === 'project-2' && readerImg2) {
            readerImg2.style.display = 'block';
          } else if (activeProjectId === 'project-3' && readerImg3) {
            readerImg3.style.display = 'block';
          }
          readerMedia.style.display = 'flex';
        }
      } else {
        readerSpecs.style.display = 'none';
        if (readerMedia) {
          readerMedia.style.display = 'none';
          if (readerImg1) readerImg1.style.display = 'none';
          if (readerImg2) readerImg2.style.display = 'none';
          if (readerImg3) readerImg3.style.display = 'none';
        }
      }
    }
  }

  function updateProjectReader(instant = false) {
    if (!projectReader) return;
    if (!activeProjectId) {
      readerTitle.innerText = translations[currentLang]['reader-placeholder-title'];
      readerDesc.innerText = translations[currentLang]['reader-placeholder-desc'];
      if (readerLink) readerLink.setAttribute('href', '#');
      if (readerGithub) readerGithub.setAttribute('href', '#');
      setMediaAndSpecs(null);
      return;
    }

    const data = projectData[currentLang][activeProjectId];
    if (!data) return;

    if (instant) {
      readerTitle.innerText = data.title;
      readerDesc.innerText = data.desc;
      if (readerLink) readerLink.setAttribute('href', data.link);
      if (readerGithub) readerGithub.setAttribute('href', data.github);
      setMediaAndSpecs(data);
    } else {
      const readerContent = projectReader.querySelector('.reader-content');
      if (readerContent) {
        readerContent.classList.add('fade-out');
        setTimeout(() => {
          readerTitle.innerText = data.title;
          readerDesc.innerText = data.desc;
          if (readerLink) readerLink.setAttribute('href', data.link);
          if (readerGithub) readerGithub.setAttribute('href', data.github);
          setMediaAndSpecs(data);
          readerContent.classList.remove('fade-out');
        }, 250);
      } else {
        readerTitle.innerText = data.title;
        readerDesc.innerText = data.desc;
        if (readerLink) readerLink.setAttribute('href', data.link);
        if (readerGithub) readerGithub.setAttribute('href', data.github);
        setMediaAndSpecs(data);
      }
    }
  }

  minidiscs.forEach(disc => {
    const ySpring = new Spring({ stiffness: 180, damping: 15, mass: 1, initialValue: -85 });
    const scaleSpring = new Spring({ stiffness: 180, damping: 15, mass: 1, initialValue: 1.0 });
    const rotXSpring = new Spring({ stiffness: 120, damping: 12, mass: 1, initialValue: 8 });
    const rotYSpring = new Spring({ stiffness: 120, damping: 12, mass: 1, initialValue: -12 });
    
    let animFrame = null;

    function loop() {
      const dt = 0.016;
      const y = ySpring.update(dt);
      const scale = scaleSpring.update(dt);
      const rx = rotXSpring.update(dt);
      const ry = rotYSpring.update(dt);

      disc.style.transform = `translateY(${y}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${scale})`;

      const isResting = 
        Math.abs(ySpring.x - ySpring.target) < 0.05 && Math.abs(ySpring.v) < 0.05 &&
        Math.abs(scaleSpring.x - scaleSpring.target) < 0.005 && Math.abs(scaleSpring.v) < 0.005 &&
        Math.abs(rotXSpring.x - rotXSpring.target) < 0.05 && Math.abs(rotXSpring.v) < 0.05 &&
        Math.abs(rotYSpring.x - rotYSpring.target) < 0.05 && Math.abs(rotYSpring.v) < 0.05;

      if (!isResting) {
        animFrame = requestAnimationFrame(loop);
      } else {
        disc.style.transform = `translateY(${ySpring.target}px) rotateY(${rotYSpring.target}deg) rotateX(${rotXSpring.target}deg) scale(${scaleSpring.target})`;
        animFrame = null;
      }
    }

    function startLoop() {
      if (!animFrame) {
        animFrame = requestAnimationFrame(loop);
      }
    }

    disc.addEventListener('mouseenter', () => {
      ySpring.target = -105;
      scaleSpring.target = 1.1;
      rotXSpring.target = 0;
      rotYSpring.target = 0;
      startLoop();
    });

    disc.addEventListener('mousemove', (e) => {
      const rect = disc.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      disc.style.setProperty('--mouse-x', `${x}%`);
      disc.style.setProperty('--mouse-y', `${y}%`);
    });

    disc.addEventListener('mouseleave', () => {
      ySpring.target = -85;
      scaleSpring.target = 1.0;
      rotXSpring.target = 8;
      rotYSpring.target = -12;
      startLoop();

      disc.style.setProperty('--mouse-x', '30%');
      disc.style.setProperty('--mouse-y', '30%');
    });

    disc.addEventListener('click', () => {
      const projId = disc.getAttribute('data-project');
      if (projId) {
        selectProject(projId, true);
      }
    });
  });

  function selectProject(projId, scroll = true) {
    activeProjectId = projId;
    const caseEl = document.querySelector(`.minidisc-case[data-project="${projId}"]`);
    if (!caseEl) return;

    if (projectReader) {
      const shelf = caseEl.closest('.shelf-container');

      // 1. Mechanical Eject on all other cases first
      document.querySelectorAll('.minidisc-case').forEach(c => {
        c.classList.remove('minidisc-inserted');
      });
      document.querySelectorAll('.shelf-container').forEach(s => {
        s.classList.remove('has-inserted-disc');
      });

      // 2. Mechanical Insert state (sinks disc in Z-axis)
      caseEl.classList.add('minidisc-inserted');
      if (shelf) {
        shelf.classList.add('has-inserted-disc');
      }

      // 3. Delayed reader power-on transition
      if (projectReader.classList.contains('visible')) {
        // Already open: do a mechanical swap cross-fade transition
        projectReader.classList.remove('visible');
        setTimeout(() => {
          updateProjectReader(true);
          projectReader.classList.add('visible');
          if (scroll) {
            projectReader.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 200);
      } else {
        // First open: slide & fade down
        updateProjectReader(true);
        projectReader.style.display = 'block';
        projectReader.classList.add('open');
        
        // Force compositor reflow
        projectReader.offsetHeight;
        projectReader.classList.add('visible');
        
        if (scroll) {
          projectReader.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }

  // Previous / Next Dossier Navigation Arrows
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const projectList = ['project-1', 'project-2', 'project-3'];

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (!activeProjectId) return;
      let idx = projectList.indexOf(activeProjectId);
      let prevIdx = (idx - 1 + projectList.length) % projectList.length;
      selectProject(projectList[prevIdx], true);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!activeProjectId) return;
      let idx = projectList.indexOf(activeProjectId);
      let nextIdx = (idx + 1) % projectList.length;
      selectProject(projectList[nextIdx], true);
    });
  }

  if (closeReader && projectReader) {
    closeReader.addEventListener('click', () => {
      // 1. Mechanical Eject inserted disc
      const insertedCase = document.querySelector('.minidisc-case.minidisc-inserted');
      if (insertedCase) {
        insertedCase.classList.remove('minidisc-inserted');
        const shelf = insertedCase.closest('.shelf-container');
        if (shelf) {
          shelf.classList.remove('has-inserted-disc');
        }
      }

      // 2. Slide and fade reader panel closed
      projectReader.classList.remove('visible');

      // 3. Eject completion timeout
      setTimeout(() => {
        projectReader.style.display = 'none';
        projectReader.classList.remove('open');
        activeProjectId = null;
      }, 500); // Matches transition duration
    });
  }

  // =============================================
  // HYDRO-REACTOR SCROLL TRIGGER
  // =============================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (liquidGlow) liquidGlow.style.height = '95%';
        if (bubbleChamber) bubbleChamber.style.opacity = '1';
      } else {
        if (liquidGlow) liquidGlow.style.height = '0%';
        if (bubbleChamber) bubbleChamber.style.opacity = '0';
      }
    });
  }, { threshold: 0.2 });

  if (productivitySection) {
    observer.observe(productivitySection);
  }

  // =============================================
  // SCENARIO EXPLORER (Liquid Brancher)
  // =============================================
  const dropletNodes = document.querySelectorAll('.droplet-node');
  const brancherTitle = document.getElementById('brancher-title');
  const brancherSubtitle = document.getElementById('brancher-subtitle');
  const brancherGrid = document.getElementById('brancher-grid');
  const txtStandard = document.getElementById('txt-standard');
  const txtRomero = document.getElementById('txt-romero');

  const brancherData = {
    es: {
      efficiency: {
        title: "Rendimiento y Velocidad",
        subtitle: "¿Cómo nos aseguramos de que la web cargue instantáneamente y no consuma recursos innecesarios?",
        standard: "Pica el código directo y reza para que no vaya lento. No se maneja caché de datos ni procesos en paralelo.",
        romero: "Estructuro el código para procesar datos pesados en segundo plano, evitar consultas repetidas y optimizar el rendimiento al milisegundo."
      },
      failures: {
        title: "Resiliencia y Control de Errores",
        subtitle: "¿Qué pasa si un servicio externo (como Stripe) se cae o responde con lentitud?",
        standard: "Asume que todo funciona al 100%. Si un servicio externo cae, la web se congela o muestra un error en crudo que asusta al usuario.",
        romero: "Diseño sistemas de emergencia automáticos. Si algo externo falla, la web sigue funcionando y el usuario ni se entera."
      },
      features: {
        title: "Anticipación y Valor de Negocio",
        subtitle: "¿Cómo evitamos construir características inútiles o que causen problemas funcionales?",
        standard: "Se limita a picar estrictamente lo que pide el papel de especificación, sin pensar si es lógico o útil para el usuario final.",
        romero: "Cuestiono la experiencia completa antes de escribir código. Propongo mejoras prácticas y meto registros internos de comportamiento."
      },
      scalability: {
        title: "Evolución y Código Limpio",
        subtitle: "¿Cómo evitamos que añadir una nueva funcionalidad meses después sea una pesadilla?",
        standard: "Código desordenado y fuertemente acoplado. Cambiar algo en el futuro requiere rehacer la mitad de la plataforma.",
        romero: "Código modular e independiente. Cambiar de base de datos o añadir nuevos métodos toma horas en lugar de semanas."
      }
    },
    en: {
      efficiency: {
        title: "Performance and Speed",
        subtitle: "How do we ensure that the web loads instantly and does not consume unnecessary resources?",
        standard: "Writes raw code directly and prays it doesn't run slowly. Data caching and parallel processes are not managed.",
        romero: "I structure code to process heavy data in the background, prevent repeated queries, and optimize performance down to the millisecond."
      },
      failures: {
        title: "Resilience and Error Control",
        subtitle: "What happens if an external service (like Stripe) goes down or responds slowly?",
        standard: "Assumes everything works 100% of the time. If an external service fails, the website freezes or shows a raw error that scares the user.",
        romero: "I design automatic failover systems. If an external service fails, the website keeps running and the user doesn't even notice."
      },
      features: {
        title: "Anticipation and Business Value",
        subtitle: "How do we avoid building useless features or ones that cause functional issues?",
        standard: "Limits work strictly to coding what is requested in the spec sheet, without thinking if it is logical or useful for the end user.",
        romero: "I question the entire user experience before writing code. I propose practical improvements and build in internal behavior logging."
      },
      scalability: {
        title: "Evolution and Clean Code",
        subtitle: "How do we prevent adding a new feature months later from becoming a nightmare?",
        standard: "Messy, tightly coupled code. Changing something in the future requires rewriting half of the platform.",
        romero: "Modular and independent code. Changing the database or adding new methods takes hours instead of weeks."
      }
    }
  };

  dropletNodes.forEach(node => {
    const target = node.querySelector('.droplet-hover-target');
    const branch = node.getAttribute('data-branch');

    if (target) {
      target.addEventListener('mouseenter', () => {
        const data = brancherData[currentLang][branch];
        if (data) {
          node.classList.add('active');
          const connLine = document.getElementById(`path-${branch}`);
          if (connLine) connLine.classList.add('active');

          const coreText = document.querySelector('.blob-core-text');
          if (coreText) {
            const spanText = node.querySelector('.droplet-visual span').innerText;
            coreText.innerText = spanText.toUpperCase();
          }

          brancherTitle.innerText = data.title;
          brancherSubtitle.innerText = data.subtitle;
          txtStandard.innerText = data.standard;
          txtRomero.innerText = data.romero;

          brancherGrid.style.display = 'flex';
        }
      });

      target.addEventListener('mouseleave', () => {
        node.classList.remove('active');
        const connLine = document.getElementById(`path-${branch}`);
        if (connLine) connLine.classList.remove('active');

        const coreText = document.querySelector('.blob-core-text');
        if (coreText) {
          coreText.innerText = translations[currentLang]['blob-core'];
        }

        brancherTitle.innerText = translations[currentLang]['brancher-default-title'];
        brancherSubtitle.innerText = translations[currentLang]['brancher-default-desc'];
        brancherGrid.style.display = 'none';
      });
    }
  });

  // =============================================
  // LANGUAGE TOGGLE SYSTEM
  // =============================================
  function applyLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    
    // Update Title and Description Meta
    document.title = translations[lang]['meta-title'];
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', translations[lang]['meta-desc']);
    }

    // Toggle button state and text
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      const label = langBtn.querySelector('.lang-label');
      if (label) label.innerText = lang.toUpperCase() === 'ES' ? 'ES' : 'EN';
      
      if (lang === 'en') {
        langBtn.classList.add('en');
      } else {
        langBtn.classList.remove('en');
      }
    }

    // Update static translatable nodes
    const translatableElements = document.querySelectorAll('[data-translate]');
    translatableElements.forEach(el => {
      const key = el.getAttribute('data-translate');
      if (translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });

    // Update active project details in reader
    updateProjectReader(true);
  }

  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'es' ? 'en' : 'es';
      localStorage.setItem('romero-portfolio-lang', currentLang);
      applyLanguage(currentLang);
    });
  }

  const lensToggleBtn = document.getElementById('lens-toggle-btn');
  if (lensToggleBtn) {
    lensToggleBtn.addEventListener('click', () => {
      lensEnabled = !lensEnabled;
      if (lensEnabled) {
        lensToggleBtn.classList.remove('disabled');
        if (hasMoved && waterLens) waterLens.classList.add('active');
      } else {
        lensToggleBtn.classList.add('disabled');
        if (waterLens) waterLens.classList.remove('active');
        snappedOrb = null;
        snappedGeomTarget = null;
        targetWidth = 180;
        targetHeight = 180;
        targetRadius = 90;
      }
    });
  }

  // Initialize lang on load
  applyLanguage(currentLang);



  // =============================================
  // SMOOTH SCROLL FOR ANCHORS WITHOUT HASH CHANGE
  // =============================================
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not(.cv-open-trigger)');
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
