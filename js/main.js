// Lenis + GSAP ScrollTrigger bridge, curseur personnalisé, transition vers la boutique.
// Chargé avant portfolio.js — expose window.lenis et window.reduceMotion.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.reduceMotion = reduceMotion;

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

if (!reduceMotion) {
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

window.lenis = lenis;

// ---------- Barre de progression de scroll ----------
// end() en fonction (pas 'bottom bottom') : les scènes épinglées plus
// bas dans le document (04, 06, 08, 10...) ajoutent des pin-spacers
// après coup, et 'bottom bottom' sur un trigger englobant ne se
// recalcule pas de façon fiable face à ça. ScrollTrigger.maxScroll()
// donne toujours la distance de scroll réelle, recalculée à chaque refresh.
gsap.to('.scroll-progress', {
  scaleX: 1,
  ease: 'none',
  scrollTrigger: {
    start: 0,
    end: () => ScrollTrigger.maxScroll(window),
    scrub: true,
  },
});

// ---------- Curseur personnalisé ----------
const cursor = document.querySelector('.cursor');
if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const target = { x: pos.x, y: pos.y };

  window.addEventListener('pointermove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
  });

  gsap.ticker.add(() => {
    pos.x += (target.x - pos.x) * 0.18;
    pos.y += (target.y - pos.y) * 0.18;
    cursor.style.transform = `translate(${pos.x - 5}px, ${pos.y - 5}px)`;
  });

  document.querySelectorAll('a, button, .artwork-placeholder').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor--active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--active'));
  });
}

// ---------- Transition cinématographique vers la boutique ----------
const boutiqueLink = document.querySelector('.boutique-link');
if (boutiqueLink) {
  boutiqueLink.addEventListener('click', (e) => {
    e.preventDefault();
    const href = boutiqueLink.getAttribute('href');
    const veil = document.createElement('div');
    veil.className = 'route-veil';
    document.body.appendChild(veil);
    gsap.fromTo(
      veil,
      { opacity: 0 },
      {
        opacity: 1,
        duration: reduceMotion ? 0.01 : 0.7,
        ease: 'power2.inOut',
        onComplete: () => {
          window.location.href = href;
        },
      }
    );
  });
}
