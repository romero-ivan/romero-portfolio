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
  const closeReader = document.querySelector('.close-reader');

  // SVG Water Ripple elements
  const displacement = document.querySelector('#water-filter feDisplacementMap');
  const turbulence = document.querySelector('#water-filter feTurbulence');
  const waterLens = document.querySelector('.water-lens');

  // Shrink nav on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.style.padding = '0.5rem 2rem';
      nav.style.background = 'rgba(15, 23, 42, 0.65)';
    } else {
      nav.style.padding = '0.8rem 2.5rem';
      nav.style.background = 'rgba(15, 23, 42, 0.45)';
    }
  });

  // Parallax droplet on mouse move
  window.addEventListener('mousemove', (e) => {
    if (!dropletContainer) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;
    dropletContainer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });

  // Water Lens Positioning and SVG Ripple Physics
  let mouseX = 0;
  let mouseY = 0;
  let lensX = 0;
  let lensY = 0;
  let hasMoved = false;

  let targetScale = 0;
  let currentScale = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!hasMoved) {
      hasMoved = true;
      if (waterLens) waterLens.classList.add('active');
      // Set initial position instantly to avoid slide-in on page entry
      lensX = mouseX;
      lensY = mouseY;
    }
    
    if (displacement && turbulence) {
      // Scale ripple intensity slightly based on mouse movement speed
      targetScale = 15; 
      
      // Shift baseFrequency slightly based on coordinate ratios to propagate waves
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      turbulence.setAttribute('baseFrequency', `${0.015 + x * 0.005} ${0.015 + y * 0.005}`);
    }
  });

  // Smooth easing loop
  function animateLens() {
    if (hasMoved && waterLens) {
      // Easing interpolation (lerp)
      lensX += (mouseX - lensX) * 0.12;
      lensY += (mouseY - lensY) * 0.12;
      
      // Centering the lens (180px width/height -> offset by 90px)
      waterLens.style.transform = `translate3d(${lensX - 90}px, ${lensY - 90}px, 0)`;
    }

    if (displacement) {
      currentScale += (targetScale - currentScale) * 0.08;
      displacement.setAttribute('scale', currentScale);
      targetScale *= 0.94; // Decay water ripple scale back to 0
    }
    requestAnimationFrame(animateLens);
  }
  requestAnimationFrame(animateLens);

  // Project data for the MiniDiscs reader
  const projectData = {
    'project-1': {
      title: 'Enjambre IA // AI SWARM',
      desc: 'Red descentralizada de microagentes autónomos operando en tiempo real. Orquestación automática utilizando Claude y Gemini para realizar tareas complejas en paralelo con resolución de conflictos automatizada.',
      link: '#'
    },
    'project-2': {
      title: 'Neural API // GATEWAY',
      desc: 'Gateway de inferencia ultrarrápida para LLMs con balanceo dinámico de carga, optimización de caché semántica y traducción instantánea de tokens a nivel de red para minimizar la latencia de respuesta.',
      link: '#'
    },
    'project-3': {
      title: 'ACE Runner // ENGINE',
      desc: 'Motor de ejecución seguro para entornos de código agente (ACE). Ejecución aislada de código generado, autodepuración de fallos en bucle cerrado y sandbox de pruebas con control de dependencias.',
      link: '#'
    }
  };

  // MiniDiscs Interactions
  minidiscs.forEach(disc => {
    disc.addEventListener('click', () => {
      const projId = disc.getAttribute('data-project');
      const data = projectData[projId];

      if (data && projectReader) {
        // Slide out animation effect
        projectReader.classList.remove('open');
        
        setTimeout(() => {
          readerTitle.innerText = data.title;
          readerDesc.innerText = data.desc;
          readerLink.setAttribute('href', data.link);
          projectReader.classList.add('open');
        }, 200);
      }
    });
  });

  if (closeReader && projectReader) {
    closeReader.addEventListener('click', () => {
      projectReader.classList.remove('open');
    });
  }

  // Trigger hydro-reactor cylinder liquid fill and bubbles on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (liquidGlow) {
          liquidGlow.style.height = '95%';
        }
        if (bubbleChamber) {
          bubbleChamber.style.opacity = '1';
        }
      } else {
        if (liquidGlow) {
          liquidGlow.style.height = '0%';
        }
        if (bubbleChamber) {
          bubbleChamber.style.opacity = '0';
        }
      }
    });
  }, { threshold: 0.2 });

  if (productivitySection) {
    observer.observe(productivitySection);
  }

  // Scenario Explorer (Liquid Brancher) Interactions
  const dropletNodes = document.querySelectorAll('.droplet-node');
  const brancherTitle = document.getElementById('brancher-title');
  const brancherSubtitle = document.getElementById('brancher-subtitle');
  const brancherGrid = document.getElementById('brancher-grid');
  const txtStandard = document.getElementById('txt-standard');
  const txtRomero = document.getElementById('txt-romero');

  const brancherData = {
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
  };

  dropletNodes.forEach(node => {
    const target = node.querySelector('.droplet-hover-target');
    const branch = node.getAttribute('data-branch');

    if (target) {
      target.addEventListener('mouseenter', () => {
        const data = brancherData[branch];
        if (data) {
          node.classList.add('active');
          const connLine = document.getElementById(`path-${branch}`);
          if (connLine) connLine.classList.add('active');

          const coreText = document.querySelector('.blob-core-text');
          if (coreText) coreText.innerText = branch.toUpperCase();

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
        if (coreText) coreText.innerText = "Requerimiento";

        brancherTitle.innerText = "Explorador de Escenarios";
        brancherSubtitle.innerText = "Pasa el ratón por los nodos de la izquierda para ver cómo enfoco las soluciones.";
        brancherGrid.style.display = 'none';
      });
    }
  });

  // Version Badge Click Animation
  const versionBtn = document.getElementById('version-badge-btn');
  if (versionBtn) {
    const syncText = versionBtn.querySelector('.sync-text');
    versionBtn.addEventListener('click', () => {
      const isExpanded = versionBtn.classList.contains('expanded');
      
      if (!isExpanded) {
        versionBtn.classList.add('expanded');
        syncText.style.display = 'inline';
        
        // Auto-collapse after 4 seconds
        setTimeout(() => {
          versionBtn.classList.remove('expanded');
          setTimeout(() => {
            if (!versionBtn.classList.contains('expanded')) {
              syncText.style.display = 'none';
            }
          }, 500);
        }, 4000);
      } else {
        versionBtn.classList.remove('expanded');
        setTimeout(() => {
          if (!versionBtn.classList.contains('expanded')) {
            syncText.style.display = 'none';
          }
        }, 500);
      }
    });
  }
});
