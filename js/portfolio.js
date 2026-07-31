// Séquences GSAP/ScrollTrigger — une par scène du storyboard (storyboard.md).
// main.js s'exécute avant ce fichier et expose window.reduceMotion.

import { initBasculeShader } from './bascule-shader.js';

const reduceMotion = window.reduceMotion;

function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', text);
  const frag = document.createDocumentFragment();
  [...text].forEach((ch) => {
    const span = document.createElement('span');
    span.textContent = ch === ' ' ? ' ' : ch;
    span.style.display = 'inline-block';
    span.setAttribute('aria-hidden', 'true');
    frag.appendChild(span);
  });
  el.appendChild(frag);
  return el.querySelectorAll('span');
}

function drawableLength(el) {
  const len = el.getTotalLength();
  el.style.strokeDasharray = `${len}`;
  el.style.strokeDashoffset = `${len}`;
  return len;
}

gsap.matchMedia().add(
  {
    full: '(prefers-reduced-motion: no-preference)',
    reduced: '(prefers-reduced-motion: reduce)',
  },
  (context) => {
    const { full } = context.conditions;

    // ---------- 00 — Silence ----------
    const signalPoint00 = document.querySelector('.scene--silence .signal-point');
    const scrollCue = document.querySelector('.scene--silence .scroll-cue');
    if (signalPoint00) {
      if (full) {
        gsap.to(signalPoint00, {
          scale: 1.8,
          opacity: 0.4,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          transformOrigin: 'center',
        });
      }
      gsap.fromTo(scrollCue, { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 1, delay: 1.2, ease: 'power2.out', transformOrigin: 'top' });
    }

    // ---------- 01 — Le nombre avant la couleur ----------
    const nombreShapes = gsap.utils.toArray('.scene--nombre svg circle, .scene--nombre svg line, .scene--nombre svg path');
    if (nombreShapes.length) {
      if (full) {
        nombreShapes.forEach(drawableLength);
        gsap.to(nombreShapes, {
          strokeDashoffset: 0,
          ease: 'none',
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.scene--nombre',
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            pin: true,
          },
        });
      } else {
        gsap.set(nombreShapes, { strokeDasharray: 'none', strokeDashoffset: 0 });
      }
    }

    // ---------- 02 — Le visage ----------
    const portrait = document.querySelector('.scene--visage .portrait-wrap img');
    if (portrait) {
      if (full) {
        gsap.set(portrait, { scale: 1.15, clipPath: 'inset(0 0 0 100%)' });
        gsap.to(portrait, {
          clipPath: 'inset(0 0 0 0%)',
          ease: 'none',
          scrollTrigger: {
            trigger: '.scene--visage',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
        gsap.to(portrait, {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.scene--visage',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }

    // ---------- 03 — La phrase fondatrice ----------
    const phraseEl = document.querySelector('.scene--phrase .quote');
    if (phraseEl) {
      if (full) {
        const chars = splitChars(phraseEl);
        gsap.set(chars, { opacity: 0.12, y: '0.3em' });
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          ease: 'none',
          stagger: { each: 0.012, from: 'start' },
          scrollTrigger: {
            trigger: '.scene--phrase',
            start: 'top 75%',
            end: 'bottom 60%',
            scrub: true,
          },
        });
      }
    }

    // ---------- 04 — Le basculement ----------
    const bascule = document.querySelector('.scene--bascule');
    if (bascule) {
      const figure = bascule.querySelector('.bascule-figure');
      const matter = bascule.querySelector('.bascule-matter');
      const stage = bascule.querySelector('.bascule-stage');

      if (full) {
        // Le crossfade CSS/SVG démarre tout de suite (aucun temps mort
        // pendant le chargement différé de Three.js). S'il réussit, le
        // seul effet WebGL/GLSL du site (voir bascule-shader.js) prend
        // le relais et remplace ce repli ; sinon ce dernier reste actif.
        const cssTl = gsap.timeline({
          scrollTrigger: {
            trigger: bascule,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            pin: true,
          },
        });
        cssTl.to(figure, { rotate: 50, opacity: 0, ease: 'none' }, 0)
          .fromTo(matter, { opacity: 0, filter: 'blur(18px)' }, { opacity: 1, filter: 'blur(0px)', ease: 'none' }, 0.45);

        if (stage) {
          initBasculeShader(stage).then((shader) => {
            if (!shader) return;
            cssTl.scrollTrigger.kill();
            gsap.set([figure, matter], { opacity: 0 });
            ScrollTrigger.create({
              trigger: bascule,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
              pin: true,
              onUpdate: (self) => shader.setProgress(self.progress),
              onToggle: (self) => shader.setActive(self.isActive),
            });
            ScrollTrigger.refresh();
          });
        }
      } else {
        gsap.set(matter, { opacity: 1, filter: 'blur(0px)' });
        gsap.set(figure, { opacity: 0 });
      }
    }

    // ---------- 05 — Galerie flottante I ----------
    const floatItems = gsap.utils.toArray('.gallery-float__item');
    if (floatItems.length && full) {
      floatItems.forEach((item, i) => {
        const speed = [0.6, 0.85, 0.5, 0.75][i % 4];
        gsap.to(item, {
          y: () => -120 * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: '.scene--galerie-i',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
      const galleryI = document.querySelector('.scene--galerie-i');
      galleryI.addEventListener('pointermove', (e) => {
        const { innerWidth, innerHeight } = window;
        const rx = (e.clientY / innerHeight - 0.5) * -6;
        const ry = (e.clientX / innerWidth - 0.5) * 6;
        gsap.to(floatItems, { rotateX: rx, rotateY: ry, duration: 0.6, ease: 'power2.out' });
      });
    }

    // ---------- 06 — Rapprochement matière ----------
    const matiereArt = document.querySelector('.scene--matiere .artwork-placeholder, .scene--matiere .artwork-photo');
    if (matiereArt && full) {
      gsap.fromTo(
        matiereArt,
        { scale: 1 },
        {
          scale: 2.4,
          ease: 'none',
          scrollTrigger: {
            trigger: '.scene--matiere',
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            pin: true,
          },
        }
      );
    }

    // ---------- 07 — Citation courte ----------
    const souffle = document.querySelector('.scene--souffle .quote');
    if (souffle) {
      if (full) {
        gsap.fromTo(
          souffle,
          { opacity: 0, letterSpacing: '0.4em' },
          {
            opacity: 1,
            letterSpacing: '0em',
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: { trigger: souffle, start: 'top 80%' },
          }
        );
      }
    }

    // ---------- 08 — La Ruada ----------
    const ruadaPath = document.querySelector('.scene--ruada .ruada-stage svg path');
    const ruadaArt = document.querySelector('.scene--ruada .artwork-placeholder');
    if (ruadaPath && full) {
      drawableLength(ruadaPath);
      gsap.set(ruadaArt, { clipPath: 'inset(0 100% 0 0)' });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.scene--ruada',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          pin: true,
        },
      });
      tl.to(ruadaPath, { strokeDashoffset: 0, ease: 'none' }, 0)
        .to(ruadaArt, { clipPath: 'inset(0 0% 0 0)', ease: 'none' }, 0.5);
    } else if (ruadaArt) {
      gsap.set(ruadaArt, { clipPath: 'inset(0 0% 0 0)' });
    }

    // ---------- 09 — Racines et mémoire ----------
    const racinesLines = gsap.utils.toArray('.scene--racines .racines-lines p');
    const racinesArt = gsap.utils.toArray('.scene--racines .artwork-placeholder, .scene--racines .racines-gallery img');
    if (racinesLines.length) {
      if (full) {
        gsap.set(racinesLines, { opacity: 0 });
        gsap.set(racinesArt, { opacity: 0 });
        gsap.to(racinesArt, {
          opacity: 1,
          duration: 2,
          ease: 'sine.inOut',
          scrollTrigger: { trigger: '.scene--racines', start: 'top 70%' },
        });
        gsap.to(racinesLines, {
          opacity: 1,
          duration: 1.6,
          stagger: 1,
          ease: 'sine.inOut',
          scrollTrigger: { trigger: '.scene--racines', start: 'top 55%' },
        });
      }
    }

    // ---------- 10 — Galerie horizontale Afrique / Voyage ----------
    const horizTrack = document.querySelector('.gallery-horizontal');
    if (horizTrack && full) {
      const getScrollAmount = () => horizTrack.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--section-pad-x')) * 2;
      gsap.to(horizTrack, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: '.scene--galerie-horizontale',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
    }

    // ---------- 11 — Transmission ----------
    const transmission = document.querySelector('.scene--transmission .transmission-grid');
    if (transmission && full) {
      gsap.set(transmission.children, { clipPath: 'inset(0 0 100% 0)' });
      gsap.to(transmission.children, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: transmission, start: 'top 75%' },
      });
    }

    // ---------- 12 — Épilogue ----------
    const signalPoint12 = document.querySelector('.scene--epilogue .signal-point');
    const boutiqueLink = document.querySelector('.scene--epilogue .boutique-link');
    if (signalPoint12) {
      gsap.set(boutiqueLink, { opacity: 0, y: 12 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.scene--epilogue', start: 'top 60%' } });
      tl.to(signalPoint12, { scale: 14, backgroundColor: '#b5702c', duration: 1.4, ease: 'power2.out' })
        .to(boutiqueLink, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.4');
    }
  }
);

ScrollTrigger.addEventListener('refreshInit', () => window.lenis && window.lenis.resize());

// Les scènes épinglées (04, 06, 08, 10...) ajoutent des pin-spacers après
// coup. Constaté en testant : ScrollTrigger.refresh() (méthode statique)
// ne recalcule pas de façon fiable un trigger scrub sans pin (ex. la
// barre de progression) une fois plusieurs triggers pin créés après lui
// — il garde son ancienne fin de course. Rafraîchir chaque instance
// individuellement (st.refresh()) contourne le problème de façon fiable.
window.addEventListener('load', () => {
  ScrollTrigger.getAll().forEach((st) => st.refresh());
});
