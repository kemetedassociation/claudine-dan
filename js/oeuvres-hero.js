// Mosaïque animée des œuvres — dispersion -> ligne -> cercle, puis un arc en
// bas de scène qui tourne au scroll (molette capturée tant que l'animation
// n'est pas allée au bout, puis relâchée pour laisser défiler la page
// normalement : jamais un piège à scroll, cf. l'éthique du storyboard).
// Interpolation par lissage exponentiel image par image (même principe que
// le curseur personnalisé de main.js), pas de dépendance supplémentaire.

const stage = document.querySelector('[data-morph-hero]');
if (stage && !window.reduceMotionOeuvres) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Seules les pièces qui ont une vraie photographie l'affichent ; les
  // pièces de la boutique sans photo réelle reprennent le même bloc de
  // couleur (ph-*) que sur la fiche boutique — jamais la photo d'une autre
  // toile associée au mauvais titre.
  const CARDS = [
    { img: '../assets/images/oeuvres/curated/cld12.jpg', title: 'La Ruada', href: 'la-ruada.html' },
    { img: '../assets/images/oeuvres/curated/cld15.jpg', title: 'Éclats Floraux', href: 'eclats-floraux.html' },
    { img: '../assets/images/oeuvres/curated/cld25.jpg', title: 'Énergie Libre', href: 'energie-libre.html' },
    { img: '../assets/images/oeuvres/curated/cld47.jpg', title: 'Bleu Profond', href: 'bleu-profond.html' },
    { img: '../assets/images/oeuvres/curated/cld59.jpg', title: 'Série Géométrique Or', href: 'serie-geometrique-or.html' },
    { img: '../assets/images/oeuvres/harmony.jpg', title: 'Harmony', href: 'harmony.html' },
    { img: '../assets/images/oeuvres/identity.jpg', title: 'Identity', href: 'identity.html' },
    { ph: 'ph-terre', title: 'Grâce Divine', href: 'grace-divine.html' },
    { ph: 'ph-rose', title: "Éclat d'Amour", href: 'eclat-damour.html' },
    { ph: 'ph-terre', title: 'Savane', href: 'savane.html' },
    { ph: 'ph-indigo', title: 'Océan', href: 'ocean.html' },
    { ph: 'ph-mixte', title: 'ADN', href: 'adn.html' },
    { ph: 'ph-mixte', title: 'La Renaissance', href: 'la-renaissance.html' },
    { ph: 'ph-terre', title: 'Sagesse', href: 'sagesse.html' },
    { ph: 'ph-rose', title: "Fleurs d'Été", href: 'fleurs-dete.html' },
    { ph: 'ph-rose', title: 'Rose des Sables', href: 'rose-des-sables.html' },
    { img: '../assets/images/oeuvres/thumb/cld10.jpg', title: 'Pièce n°10', href: 'cld10.html' },
    { img: '../assets/images/oeuvres/thumb/cld30.jpg', title: 'Pièce n°30', href: 'cld30.html' },
    { img: '../assets/images/oeuvres/thumb/cld50.jpg', title: 'Pièce n°50', href: 'cld50.html' },
    { img: '../assets/images/oeuvres/thumb/cld70.jpg', title: 'Pièce n°70', href: 'cld70.html' },
  ];

  const frag = document.createDocumentFragment();
  const cardEls = CARDS.map((c) => {
    const a = document.createElement('a');
    a.className = 'morph-card';
    a.href = c.href;
    a.setAttribute('data-save-scroll', '');
    const front = c.img
      ? `<img src="${c.img}" alt="${c.title}" loading="lazy" decoding="async">`
      : `<div class="artwork-placeholder ${c.ph}"><span class="artwork-label">${c.title}</span></div>`;
    a.innerHTML = `
      <div class="morph-card__inner">
        <div class="morph-card__face morph-card__front">${front}</div>
        <div class="morph-card__face morph-card__back">
          <p class="morph-card__label">Voir l'œuvre</p>
          <p class="morph-card__title">${c.title}</p>
        </div>
      </div>`;
    frag.appendChild(a);
    return a;
  });
  stage.appendChild(frag);

  if (reduceMotion) {
    cardEls.forEach((el) => { el.style.opacity = '1'; });
    stage.classList.add('is-static');
  } else {
    const N = cardEls.length;
    const state = cardEls.map(() => ({ x: 0, y: 0, rot: 0, scale: 0.6, opacity: 0 }));
    let target = cardEls.map(() => ({ x: 0, y: 0, rot: 0, scale: 0.6, opacity: 0 }));

    let phase = 'scatter';
    const scatter = cardEls.map(() => ({
      x: (Math.random() - 0.5) * 900,
      y: (Math.random() - 0.5) * 400,
      rot: (Math.random() - 0.5) * 90,
    }));

    let scrollValue = 0;
    const MAX_SCROLL = 900;
    const MORPH_END = 450;

    function size() {
      const r = stage.getBoundingClientRect();
      return { w: r.width, h: r.height };
    }

    function computeTargets() {
      const { w, h } = size();
      if (phase === 'scatter') {
        target = cardEls.map((_, i) => ({ ...scatter[i], scale: 0.6, opacity: 1 }));
        return;
      }
      if (phase === 'line') {
        const spacing = Math.min(64, w / N);
        const total = N * spacing;
        target = cardEls.map((_, i) => ({ x: i * spacing - total / 2, y: 0, rot: 0, scale: 0.85, opacity: 1 }));
        return;
      }
      // phase === 'circle' (avec morph vers l'arc au scroll)
      const radius = Math.min(w, h) * 0.32;
      const morphT = Math.min(scrollValue / MORPH_END, 1);
      const rotProgress = Math.min(Math.max((scrollValue - MORPH_END) / (MAX_SCROLL - MORPH_END), 0), 1);

      const arcRadius = Math.min(w, h * 1.4) * 0.85;
      const arcApexY = h * 0.62;
      const spread = 150;
      const startAngle = -90 - spread / 2;
      const step = spread / (N - 1);
      const maxRotation = spread * 0.75;
      const boundedRotation = -rotProgress * maxRotation;

      target = cardEls.map((_, i) => {
        const circleAngle = (i / N) * 360;
        const circleRad = (circleAngle * Math.PI) / 180;
        const cx = Math.cos(circleRad) * radius;
        const cy = Math.sin(circleRad) * radius;

        const arcAngle = startAngle + i * step + boundedRotation;
        const arcRad = (arcAngle * Math.PI) / 180;
        const ax = Math.cos(arcRad) * arcRadius;
        const ay = Math.sin(arcRad) * arcRadius + arcApexY - h / 2;

        return {
          x: cx + (ax - cx) * morphT,
          y: cy + (ay - cy) * morphT,
          rot: (circleAngle + 90) + ((arcAngle + 90) - (circleAngle + 90)) * morphT,
          scale: 1 + (1.35 - 1) * morphT,
          opacity: 1,
        };
      });
    }

    function raf() {
      state.forEach((s, i) => {
        const t = target[i];
        const ease = 0.1;
        s.x += (t.x - s.x) * ease;
        s.y += (t.y - s.y) * ease;
        s.rot += (t.rot - s.rot) * ease;
        s.scale += (t.scale - s.scale) * ease;
        s.opacity += (t.opacity - s.opacity) * ease;
        cardEls[i].style.transform = `translate(-50%, -50%) translate(${s.x}px, ${s.y}px) rotate(${s.rot}deg) scale(${s.scale})`;
        cardEls[i].style.opacity = String(s.opacity);
      });
      requestAnimationFrame(raf);
    }

    window.addEventListener('resize', computeTargets);
    computeTargets();
    raf();

    setTimeout(() => { phase = 'line'; computeTargets(); }, 500);
    setTimeout(() => { phase = 'circle'; computeTargets(); }, 1800);

    // Molette : capturée tant qu'on n'a pas atteint les deux bords de
    // l'animation, puis relâchée pour laisser défiler la page normalement.
    stage.addEventListener('wheel', (e) => {
      if (phase !== 'circle') return; // laisse défiler la page normalement
      const goingDown = e.deltaY > 0;
      if (goingDown && scrollValue >= MAX_SCROLL) return; // laisse défiler la page
      if (!goingDown && scrollValue <= 0) return; // laisse remonter la page
      e.preventDefault();
      scrollValue = Math.min(Math.max(scrollValue + e.deltaY, 0), MAX_SCROLL);
      computeTargets();
    }, { passive: false });

    let touchStartY = 0;
    stage.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchmove', (e) => {
      if (phase !== 'circle') return;
      const y = e.touches[0].clientY;
      const delta = touchStartY - y;
      touchStartY = y;
      const goingDown = delta > 0;
      if (goingDown && scrollValue >= MAX_SCROLL) return;
      if (!goingDown && scrollValue <= 0) return;
      e.preventDefault();
      scrollValue = Math.min(Math.max(scrollValue + delta, 0), MAX_SCROLL);
      computeTargets();
    }, { passive: false });
  }
}
