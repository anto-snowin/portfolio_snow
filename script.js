// ══════════════════════════════════════
// LOADER ANIMATION (GSAP)
// ══════════════════════════════════════
window.addEventListener("load", () => {
  const fill = document.getElementById('loaderFill');
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Animate the loading bar
  let progress = 0;
  const barInterval = setInterval(() => {
    progress += Math.random() * 25 + 10;
    if (progress > 100) progress = 100;
    if (fill) fill.style.width = progress + '%';
    if (progress >= 100) clearInterval(barInterval);
  }, 200);

  // GSAP loader exit timeline
  const tl = gsap.timeline({ delay: 1.2 });

  tl.to(".loader-logo", {
    scale: 40,
    duration: 0.6,
    ease: "power4.inOut"
  })
    .to(".loader-text", {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: "power2.out"
    }, "-=0.5")
    .to(".loader-bar-track", {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out"
    }, "-=0.4")
    .to("#loader", {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      onStart: () => {
        loader.style.pointerEvents = "none";
      },
      onComplete: () => {
        loader.remove();
        // Trigger hero entrance animations after loader
        animateHeroEntrance();
      }
    });
});

// ═════════════════════════  ═════════════
// SMOOTH SCROLL (LENIS)
// ══════════════════════════════════════
const lenis = new Lenis({
  smooth: true,
  lerp: 0.07,
  wheelMultiplier: 0.8,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ══════════════════════════════════════
// HERO ENTRANCE ANIMATIONS
// ══════════════════════════════════════
function animateHeroEntrance() {
  const heroTL = gsap.timeline();

  // Portrait and atmospheric glow entrance
  heroTL.from("#heroPortraitWrapper", {
    scale: 1.08,
    y: 40,
    opacity: 0,
    duration: 1.6,
    ease: "power3.out"
  })
    .from(".hero-portrait-glow", {
      scale: 0.5,
      opacity: 0,
      duration: 1.8,
      ease: "power2.out"
    }, "-=1.4")
    // Name slides in
    .from("#heroTopText", {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    }, "-=1.2")
    // Status badge
    .from("#heroStatusBadge", {
      y: -30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.8")
    // Signature draw-on
    .to(".signature-text", {
      strokeDashoffset: 0,
      duration: 2.2,
      ease: "power2.inOut"
    }, "-=0.8")
    // Bottom meta
    .from("#heroBottomMeta", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    }, "-=1.8")
    // Scroll indicator
    .from("#heroScrollIndicator", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power3.out"
    }, "-=1.4")
    // Wave layers fade in
    .from(".wave-layer", {
      opacity: 0,
      scale: 1.1,
      duration: 1.5,
      ease: "power2.out",
      stagger: 0.2
    }, "-=2.2");

  // Show nav after hero entrance
  gsap.to("#mainNav", {
    opacity: 1,
    y: 0,
    duration: 0.6,
    delay: 0.3,
    ease: "power3.out"
  });
}

// Initially hide nav
gsap.set("#mainNav", { opacity: 0, y: -30 });

// ══════════════════════════════════════
// HERO PORTRAIT 3D MOUSE PARALLAX
// ══════════════════════════════════════
(function initHeroParallax() {
  const portrait = document.getElementById('heroPortraitImg');
  const glow = document.querySelector('.hero-portrait-glow');
  const hero = document.getElementById('heroSection');
  if (!portrait || !hero) return;

  let targetX = 0, targetY = 0;
  let currX = 0, currY = 0;

  window.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const xPct = (e.clientX / window.innerWidth - 0.5) * 2;
    const yPct = (e.clientY / window.innerHeight - 0.5) * 2;
    targetX = xPct * 22;
    targetY = yPct * 15;
  });

  function updateParallax() {
    currX += (targetX - currX) * 0.08;
    currY += (targetY - currY) * 0.08;
    portrait.style.transform = `translate3d(${currX}px, ${currY}px, 0) rotateY(${currX * 0.2}deg) rotateX(${-currY * 0.2}deg)`;
    if (glow) {
      glow.style.transform = `translate(calc(-50% + ${-currX * 0.6}px), calc(-50% + ${-currY * 0.6}px))`;
    }
    requestAnimationFrame(updateParallax);
  }
  updateParallax();
})();

// ══════════════════════════════════════
// SMOOTH CARD STACK PAGE TRANSITIONS
// (Full 3D physical movement & card depth across all pages)
// ══════════════════════════════════════
(function initPageTransitions() {
  // Define all stacked sections in order
  const SECTIONS = [
    {
      wrapper: '#heroScrollWrapper',
      section: '#heroSection',
      fades: ['#heroTopText', '#heroStatusBadge', '.hero-signature', '#heroBottomMeta', '#heroScrollIndicator', '#heroPortraitWrapper']
    },
    {
      wrapper: '#aboutScrollWrapper',
      section: '#about',
      fades: ['.about-bio', '.about-details']
    },
    {
      wrapper: '#skillsScrollWrapper',
      section: '#skills',
      fades: ['.orbit-container', '.skill-cards']
    },
    {
      wrapper: '#projectsScrollWrapper',
      section: '#projects',
      fades: ['.cs-stage', '.cs-controls']
    },
    {
      wrapper: '#contactScrollWrapper',
      section: '#contact',
      fades: []
    }
  ];

  // Apply smooth shrinking & stacking physics to each section card except the final one
  SECTIONS.forEach((item, index) => {
    const wrapper = document.querySelector(item.wrapper);
    const section = document.querySelector(item.section);
    if (!wrapper || !section) return;

    // Skip shrinking the last section (Contact is base footer)
    if (index < SECTIONS.length - 1) {
      // 1. Physical card shrink, elevation & upward parallax movement
      gsap.to(section, {
        scale: 0.96,
        yPercent: -3,
        borderRadius: "20px",
        filter: "brightness(0.92)",
        opacity: 0.88,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "55% top",
          end: "bottom top",
          scrub: 0.5,
          pin: false,
          invalidateOnRefresh: true
        }
      });

      // 2. Parallax drift of content elements inside card (NO opacity fade — let CSS .reveal handle visibility)
      if (item.fades && item.fades.length > 0) {
        item.fades.forEach(selector => {
          const el = section.querySelector(selector);
          if (el) {
            gsap.to(el, {
              y: -30,
              ease: "none",
              scrollTrigger: {
                trigger: wrapper,
                start: "60% top",
                end: "90% top",
                scrub: 0.4,
                invalidateOnRefresh: true
              }
            });
          }
        });
      }
    }

    // 3. Smooth upward emergence & reveal for incoming sections (About, Skills, Projects, Contact)
    if (index > 0) {
      const inner = section.querySelector('.section-inner');
      if (inner) {
        gsap.fromTo(inner, 
          { y: 30, opacity: 0.9 },
          {
            y: 0,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: wrapper,
              start: "top 100%",
              end: "top 55%",
              scrub: 0.4,
              invalidateOnRefresh: true
            }
          }
        );
      }
    }
  });

  // Hero specific background wave layer parallax
  gsap.to(".wave-layer-1", {
    y: -70,
    scrollTrigger: {
      trigger: "#heroScrollWrapper",
      start: "top top",
      end: "bottom top",
      scrub: 0.5,
    }
  });

  gsap.to(".wave-layer-2", {
    y: -110,
    scrollTrigger: {
      trigger: "#heroScrollWrapper",
      start: "top top",
      end: "bottom top",
      scrub: 0.5,
    }
  });

  gsap.to(".wave-layer-3", {
    y: -150,
    scrollTrigger: {
      trigger: "#heroScrollWrapper",
      start: "top top",
      end: "bottom top",
      scrub: 0.5,
    }
  });
})();

// ══════════════════════════════════════
// SMOOTH NAVIGATION LINK TRANSITIONS
// ══════════════════════════════════════
(function initNavTransitions() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, {
          offset: 0,
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          lock: false
        });
        if (typeof closeMobileNav === 'function') {
          closeMobileNav();
        }
      }
    });
  });
})();

// ══════════════════════════════════════
// CURSOR
// ══════════════════════════════════════
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function moveCursor() {
  dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(moveCursor);
})();

// ══════════════════════════════════════
// NAV SCROLL STATE
// ══════════════════════════════════════
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ══════════════════════════════════════
// PILL NAV
// ══════════════════════════════════════
(function initPillNav() {
  const track = document.getElementById('navPillTrack');
  const cursor = document.getElementById('navPillCursor');
  if (!track || !cursor) return;

  const links = track.querySelectorAll('li a');

  function movePill(li) {
    const trackRect = track.getBoundingClientRect();
    const liRect = li.getBoundingClientRect();
    cursor.style.opacity = '1';
    cursor.style.left = (liRect.left - trackRect.left - 4) + 'px';
    cursor.style.width = liRect.width + 'px';
  }

  links.forEach(a => {
    a.addEventListener('mouseenter', () => movePill(a.parentElement));
  });

  track.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  // highlight active section link on scroll
  const sections = [
    { id: 'aboutScrollWrapper', href: '#aboutScrollWrapper' },
    { id: 'skillsScrollWrapper', href: '#skillsScrollWrapper' },
    { id: 'projectsScrollWrapper', href: '#projectsScrollWrapper' },
    { id: 'contactScrollWrapper', href: '#contactScrollWrapper' }
  ];
  window.addEventListener('scroll', () => {
    let currentHref = '';
    sections.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el && window.scrollY >= el.offsetTop - window.innerHeight * 0.4) {
        currentHref = sec.href;
      }
    });
    links.forEach(a => {
      const isActive = a.getAttribute('href') === currentHref;
      a.style.color = isActive ? 'var(--accent)' : '';
    });
  }, { passive: true });
})();

// ══════════════════════════════════════
// HAMBURGER
// ══════════════════════════════════════
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
});
function closeMobileNav() {
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
}

// ══════════════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════════════
const revealEls = document.querySelectorAll('.reveal');
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealIO.unobserve(e.target); }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });
revealEls.forEach(el => revealIO.observe(el));

// ══════════════════════════════════════
// ORBIT ANIMATION
// ══════════════════════════════════════
(function buildOrbit() {
  const container = document.getElementById('orbitContainer');
  if (!container) return;

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  (function waitForSize() {
    const size = container.offsetWidth;
    if (!size) { requestAnimationFrame(waitForSize); return; }

    const icons = [
      { label: 'PY', color: '#3776AB' },
      { label: 'JS', color: '#F7DF1E' },
      { label: 'TS', color: '#3178C6' },
      { label: 'JSX', color: '#61DAFB' },
      { label: 'NXT', color: '#c8a96e' },
      { label: 'HTML', color: '#E34F26' },
      { label: 'CSS', color: '#1572B6' },
      { label: 'SQL', color: '#4fad7e' },
      { label: 'GIT', color: '#F05032' },
      { label: 'DOCK', color: '#2496ED' },
      { label: 'LNX', color: '#FCC624' },
      { label: 'JAVA', color: '#ED8B00' },
      { label: 'C', color: '#A8B9CC' },
      { label: 'C++', color: '#00599C' },
      { label: 'NODE', color: '#339933' },
    ];

    const rings = [
      { r: 0.21, icons: icons.slice(0, 5), dir: 1, speed: 0.45 },
      { r: 0.35, icons: icons.slice(5, 10), dir: -1, speed: 0.28 },
      { r: 0.47, icons: icons.slice(10), dir: 1, speed: 0.16 },
    ];

    const animItems = [];

    rings.forEach((ringDef, ri) => {
      const rad = ringDef.r * size;
      const diameter = rad * 2;

      const ringEl = document.createElement('div');
      ringEl.className = 'orbit-ring';
      ringEl.style.width = diameter + 'px';
      ringEl.style.height = diameter + 'px';
      container.appendChild(ringEl);

      ringDef.icons.forEach((ic, ii) => {
        const startAngle = (ii / ringDef.icons.length) * 360;

        const wrap = document.createElement('div');
        wrap.className = 'orbit-icon-wrap';
        wrap.style.cssText =
          `width:0;height:0;left:50%;top:50%;transform-origin:0 0;` +
          `transform:rotate(${startAngle}deg);`;

        const iconDiv = document.createElement('div');
        iconDiv.className = 'orbit-icon';
        iconDiv.textContent = ic.label;
        iconDiv.style.color = ic.color;
        iconDiv.style.borderColor = `rgba(${hexToRgb(ic.color)},0.3)`;
        iconDiv.style.transform =
          `translate(${rad}px,-50%) rotate(${-startAngle}deg)`;

        wrap.appendChild(iconDiv);
        container.appendChild(wrap);

        animItems.push({
          wrap, iconDiv, rad,
          deg: startAngle,
          delta: ringDef.dir * ringDef.speed
        });
      });
    });

    function animate() {
      for (let i = 0; i < animItems.length; i++) {
        const item = animItems[i];
        item.deg += item.delta;
        if (item.deg > 360) item.deg -= 360;
        if (item.deg < -360) item.deg += 360;
        item.wrap.style.transform = `rotate(${item.deg}deg)`;
        item.iconDiv.style.transform =
          `translate(${item.rad}px,-50%) rotate(${-item.deg}deg)`;
      }
      requestAnimationFrame(animate);
    }
    animate();
  })();
})();

// ══════════════════════════════════════
// CARD STACK (PROJECTS)
// ══════════════════════════════════════
(function initCardStack() {
  const PROJECTS = [
    {
      num: '01', title: 'churn-mlops',
      desc: 'Predicts customer churn using the IBM Telco datase.',
      tags: ['Python', 'CLI', 'PyPI'], accent: '#5b8fd4',
      github: 'https://github.com/anto-snowin/churn-mlops', demo: '#',
      bg: `radial-gradient(ellipse 75% 70% at 20% 45%, rgba(21,101,192,0.95) 0%, transparent 55%),
      radial-gradient(ellipse 55% 55% at 78% 28%, rgba(100,181,246,0.65) 0%, transparent 48%),
      radial-gradient(ellipse 45% 40% at 55% 82%, rgba(13,71,161,0.82) 0%, transparent 42%),
      #040d1c`
    },
    {
      num: '02', title: 'Brutal Blog',
      desc: 'Blogging platform with an interactive Brutalist.',
      tags: ['TypeScript', 'JavaScript', 'Tailwind', 'Solidity'], accent: '#4fad7e',
      github: 'https://github.com/anto-snowin/Brutal_blog', demo: '#',
      bg: `radial-gradient(ellipse 70% 68% at 28% 42%, rgba(0,121,107,0.92) 0%, transparent 55%),
      radial-gradient(ellipse 50% 50% at 72% 68%, rgba(0,77,64,0.82) 0%, transparent 46%),
      radial-gradient(ellipse 45% 38% at 58% 16%, rgba(178,223,219,0.35) 0%, transparent 40%),
      #041110`
    },
    {
      num: '03', title: 'Lemore',
      desc: 'A full-stack web application for creating customized travel plans with smart recommendations.',
      tags: ['TypeScript', 'JavaScript', 'Canvas'], accent: '#f97316',
      github: 'https://github.com/anto-snowin/lemore', demo: '#',
      bg: `radial-gradient(ellipse 72% 62% at 28% 50%, rgba(234,88,12,0.94) 0%, transparent 55%),
      radial-gradient(ellipse 52% 52% at 76% 32%, rgba(251,146,60,0.7) 0%, transparent 46%),
      radial-gradient(ellipse 42% 42% at 50% 80%, rgba(180,30,10,0.68) 0%, transparent 42%),
      #140800`
    },
    {
      num: '04', title: 'Student Dashboard',
      desc: 'Grade tracker and timetable manager built for fellow students.',
      tags: ['React', 'Node.js', 'MongoDB'], accent: '#a855f7',
      github: '#', demo: '#',
      bg: `radial-gradient(ellipse 70% 68% at 28% 42%, rgba(126,34,206,0.95) 0%, transparent 54%),
      radial-gradient(ellipse 52% 52% at 72% 66%, rgba(76,29,149,0.84) 0%, transparent 46%),
      radial-gradient(ellipse 40% 36% at 60% 16%, rgba(192,132,252,0.38) 0%, transparent 40%),
      #0c0415`
    },
    {
      num: '05', title: 'AI Chat Interface',
      desc: 'Lightweight chat UI powered by FastAPI with streaming responses.',
      tags: ['Python', 'FastAPI', 'React'], accent: '#22c55e',
      github: '#', demo: '#',
      bg: `radial-gradient(ellipse 72% 65% at 28% 44%, rgba(21,128,61,0.95) 0%, transparent 54%),
      radial-gradient(ellipse 50% 50% at 74% 30%, rgba(22,163,74,0.7) 0%, transparent 46%),
      radial-gradient(ellipse 42% 40% at 55% 76%, rgba(5,46,22,0.92) 0%, transparent 42%),
      #030e07`
    },
    {
      num: '06', title: 'Linux Dotfiles',
      desc: 'Battle-tested dotfiles and shell scripts for a productive Linux setup.',
      tags: ['Bash', 'Linux', 'Shell'], accent: '#e05252',
      github: '#', demo: '#',
      bg: `radial-gradient(ellipse 70% 64% at 30% 46%, rgba(185,28,28,0.95) 0%, transparent 54%),
      radial-gradient(ellipse 52% 52% at 70% 30%, rgba(239,68,68,0.65) 0%, transparent 46%),
      radial-gradient(ellipse 44% 40% at 52% 78%, rgba(127,29,29,0.88) 0%, transparent 42%),
      #120404`
    },
  ];

  const stage = document.getElementById('csStage');
  const dotsWrap = document.getElementById('csDots');
  if (!stage || !dotsWrap) return;

  const LEN = PROJECTS.length;
  const MAX_OFFSET = 3;
  const SPREAD_DEG = 44;
  const STEP_DEG = SPREAD_DEG / MAX_OFFSET;
  const SPACING = 196;
  const DEPTH_PX = 100;
  const TILT_X = 10;

  let active = 0;
  let dragStart = null;

  // Build cards
  const cardEls = PROJECTS.map((p, i) => {
    const card = document.createElement('div');
    card.className = 'cs-card';
    card.style.setProperty('--c-accent', p.accent);

    const bg = document.createElement('div');
    bg.className = 'cs-bg';
    bg.style.background = p.bg;

    const overlay = document.createElement('div');
    overlay.className = 'cs-overlay';

    const content = document.createElement('div');
    content.className = 'cs-content';
    content.innerHTML =
      `<div class="cs-num">${p.num}&thinsp;/&thinsp;0${LEN}</div>` +
      `<div class="cs-title">${p.title}</div>` +
      `<div class="cs-desc">${p.desc}</div>` +
      `<div class="cs-tags">${p.tags.map(t => `<span class="cs-tag">${t}</span>`).join('')}</div>` +
      `<div class="cs-links">` +
      `<a href="${p.github}" class="cs-link" target="_blank" rel="noopener">GitHub &#8599;</a>` +
      `<a href="${p.demo}"   class="cs-link" target="_blank" rel="noopener">Live Demo &#8599;</a>` +
      `</div>`;

    card.append(bg, overlay, content);
    stage.appendChild(card);
    card.addEventListener('click', () => { if (i !== active) setActive(i); });
    return card;
  });

  // Build dots
  const dotEls = PROJECTS.map((p, i) => {
    const d = document.createElement('button');
    d.className = 'cs-dot';
    d.setAttribute('aria-label', 'Go to ' + p.title);
    d.addEventListener('click', () => setActive(i));
    dotsWrap.appendChild(d);
    return d;
  });

  // Helpers
  function wrapIdx(n) { return ((n % LEN) + LEN) % LEN; }

  function signedOff(i, act) {
    const raw = i - act;
    const alt = raw > 0 ? raw - LEN : raw + LEN;
    return Math.abs(alt) < Math.abs(raw) ? alt : raw;
  }

  // Render all cards
  function render() {
    cardEls.forEach((card, i) => {
      const off = signedOff(i, active);
      const abs = Math.abs(off);
      const vis = abs <= MAX_OFFSET;
      const isAct = off === 0;

      card.style.opacity = vis ? String(1 - abs * 0.05) : '0';
      card.style.pointerEvents = vis ? 'auto' : 'none';
      card.style.zIndex = String(100 - abs);
      card.classList.toggle('is-active', isAct);

      if (vis) {
        const x = off * SPACING;
        const y = abs * 10;
        const z = -abs * DEPTH_PX;
        const rZ = off * STEP_DEG;
        const rX = isAct ? 0 : TILT_X + abs * 2;
        const scale = isAct ? 1.04 : 0.91 - abs * 0.045;
        const lift = isAct ? -22 : 0;

        card.style.transform =
          `translateX(${x}px) translateY(${y + lift}px) translateZ(${z}px) ` +
          `rotateZ(${rZ}deg) rotateX(${rX}deg) scale(${scale})`;

        card.style.boxShadow = isAct
          ? `0 24px 60px ${PROJECTS[i].accent}55, 0 0 0 1px ${PROJECTS[i].accent}28`
          : '';

        card.querySelectorAll('.cs-tag').forEach(t => {
          t.style.borderColor = isAct ? PROJECTS[i].accent + '66' : 'rgba(255,255,255,0.18)';
          t.style.color = isAct ? '#fff' : 'rgba(255,255,255,0.7)';
        });
      }
    });

    dotEls.forEach((d, i) => {
      const on = i === active;
      d.classList.toggle('is-active', on);
      d.style.background = on ? PROJECTS[active].accent : '';
      d.style.width = on ? '20px' : '6px';
    });
  }

  function setActive(idx) { active = wrapIdx(idx); render(); }

  // Controls
  document.getElementById('csPrev').addEventListener('click', () => setActive(active - 1));
  document.getElementById('csNext').addEventListener('click', () => setActive(active + 1));

  document.addEventListener('keydown', e => {
    if (document.activeElement.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft') setActive(active - 1);
    if (e.key === 'ArrowRight') setActive(active + 1);
  });

  // drag — desktop
  stage.addEventListener('mousedown', e => {
    if (e.target.closest('.cs-card.is-active')) dragStart = e.clientX;
  });
  window.addEventListener('mouseup', e => {
    if (dragStart === null) return;
    const delta = e.clientX - dragStart;
    if (Math.abs(delta) > 55) { delta > 0 ? setActive(active - 1) : setActive(active + 1); }
    dragStart = null;
  });

  // swipe — mobile
  stage.addEventListener('touchstart', e => {
    dragStart = e.touches[0].clientX;
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (dragStart === null) return;
    const delta = e.changedTouches[0].clientX - dragStart;
    if (Math.abs(delta) > 50) { delta > 0 ? setActive(active - 1) : setActive(active + 1); }
    dragStart = null;
  });

  // First paint
  render();

  // Project card entrance — deck bloom
  (function setupEntrance() {
    cardEls.forEach(card => {
      card.style.transition = 'none';
      card.style.transform =
        'translateX(0px) translateY(200px) translateZ(0px) ' +
        'rotateZ(0deg) rotateX(30deg) scale(0.5)';
      card.style.opacity = '0';
      card.style.boxShadow = 'none';
    });

    const ctrlRow = document.querySelector('#projects .cs-controls');
    if (ctrlRow) ctrlRow.style.cssText = 'opacity:0;transition:opacity 0.5s ease 0.7s;';

    let entered = false;
    const entryIO = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || entered) return;
      entered = true;
      entryIO.disconnect();

      if (ctrlRow) requestAnimationFrame(() => { ctrlRow.style.opacity = '1'; });

      requestAnimationFrame(() => {
        cardEls.forEach((card, i) => {
          const abs = Math.abs(signedOff(i, active));
          const delay = abs * 110;
          card.style.transition =
            `transform  0.95s cubic-bezier(0.34,1.65,0.64,1) ${delay}ms,` +
            `opacity    0.6s  ease                            ${delay + 20}ms,` +
            `box-shadow 0.65s ease                            ${delay}ms`;
        });

        requestAnimationFrame(() => {
          render();

          setTimeout(() => {
            const ac = cardEls[active];
            const col = PROJECTS[active].accent;
            const orig = `0 24px 60px ${col}55, 0 0 0 1px ${col}28`;
            ac.style.transition = 'box-shadow 0.22s ease';
            ac.style.boxShadow = `0 32px 110px ${col}bb, 0 0 80px ${col}44, 0 0 0 1px ${col}70`;
            setTimeout(() => {
              ac.style.transition = 'box-shadow 1s ease';
              ac.style.boxShadow = orig;
              setTimeout(() => { ac.style.transition = ''; }, 1000);
            }, 300);
          }, 980);

          setTimeout(() => {
            cardEls.forEach(card => { card.style.transition = ''; });
          }, 2100);
        });
      });
    }, { threshold: 0.12 });

    entryIO.observe(document.getElementById('projects'));
  })();
})();

// ══════════════════════════════════════
// STACKED SOCIAL CARDS (CONTACT)
// ══════════════════════════════════════
(function initStackedCards() {
  const stack = document.getElementById('scardStack');
  if (!stack) return;

  const ICONS = {
    email: `<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="2.2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 3.5h3.2l1.4 4.4-2.2 1.6a13.8 13.8 0 0 0 6.2 6.2l1.6-2.2 4.4 1.4v3.2a1.6 1.6 0 0 1-1.7 1.6A17.4 17.4 0 0 1 3.9 5.2a1.6 1.6 0 0 1 1.6-1.7z"/></svg>`,
    github: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667h-3.554V9h3.412v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    x: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    resume: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6M9 9h2"/></svg>`
  };

  const ITEMS = [
    {
      title: 'Email',
      sub: 'antosnowin07@gmail.com',
      url: 'mailto:antosnowin07@gmail.com',
      external: false,
      bg: 'linear-gradient(135deg,rgba(200,169,110,0.32) 0%,rgba(200,169,110,0.06) 100%)',
      color: '#c8a96e',
      icon: ICONS.email
    },
    {
      title: 'Phone',
      sub: '+91 93445 41527',
      url: 'tel:+919344541527',
      external: false,
      bg: 'linear-gradient(135deg,#1a1c28 0%,#23263a 100%)',
      color: '#c8a96e',
      icon: ICONS.phone
    },
    {
      title: 'GitHub',
      sub: 'Explore my open source projects',
      url: 'https://github.com/anto-snowin',
      bg: 'linear-gradient(135deg,#0d1117 0%,#161b22 60%,#1a2035 100%)',
      color: '#e8e8ea',
      icon: ICONS.github
    },
    {
      title: 'LinkedIn',
      sub: 'Connect with me professionally',
      url: 'https://www.linkedin.com/in/anto-snowin-1b9666327/',
      bg: 'linear-gradient(135deg,#0a66c2 0%,#004182 100%)',
      color: '#ffffff',
      icon: ICONS.linkedin
    },
    {
      title: 'X (Twitter)',
      sub: 'Thoughts on code and tech',
      url: 'https://x.com/antosnowin07',
      bg: 'linear-gradient(135deg,#000000 0%,#1c1c1c 100%)',
      color: '#ffffff',
      icon: ICONS.x
    },
    {
      title: 'Résumé',
      sub: 'Download my latest CV',
      url: '#',
      bg: 'linear-gradient(135deg,rgba(200,169,110,0.38) 0%,rgba(200,169,110,0.08) 100%)',
      color: '#c8a96e',
      icon: ICONS.resume
    }
  ];

  function buildPeek(n) {
    const arr = [0];
    let gap = 9;
    for (let i = 1; i < n; i++) {
      arr.push(arr[i - 1] + gap);
      gap += 1.4;
    }
    return arr;
  }

  const CARD_H = 88;
  const GAP = 16;
  const PEEK = buildPeek(ITEMS.length);
  let expanded = false;

  const hintEl = stack.querySelector('.scard-hint');
  const toggleEl = document.getElementById('scardToggle');

  ITEMS.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'scard';
    card.style.top = PEEK[i] + 'px';
    card.style.zIndex = String(ITEMS.length - i);

    const link = document.createElement('a');
    link.className = 'scard-link';
    link.href = item.url;
    if (item.external !== false) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    link.innerHTML =
      `<div class="scard-thumb" style="background:${item.bg};color:${item.color}">${item.icon}</div>` +
      `<div class="scard-info">` +
      `<div class="scard-title">${item.title}</div>` +
      `<div class="scard-sub">${item.sub}</div>` +
      `</div>` +
      `<span class="scard-arrow">&#8599;</span>`;

    card.appendChild(link);
    stack.insertBefore(card, hintEl);
  });

  function setExpanded(val) {
    expanded = val;
    stack.classList.toggle('expanded', val);

    const cardEls = stack.querySelectorAll('.scard');
    cardEls.forEach((card, i) => {
      card.style.top = val
        ? (i * (CARD_H + GAP)) + 'px'
        : PEEK[i] + 'px';
    });

    stack.style.minHeight = val
      ? ((ITEMS.length - 1) * (CARD_H + GAP) + CARD_H + 52) + 'px'
      : (PEEK[ITEMS.length - 1] + CARD_H + 44) + 'px';
  }

  stack.style.minHeight = (PEEK[ITEMS.length - 1] + CARD_H + 44) + 'px';

  stack.addEventListener('click', () => {
    if (!expanded) setExpanded(true);
  });

  toggleEl.addEventListener('click', e => {
    e.stopPropagation();
    setExpanded(false);
  });
})();
