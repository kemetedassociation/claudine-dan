// Mosaïque animée des œuvres — se déclenche automatiquement dès qu'elle
// entre dans l'écran (dispersion -> ligne -> cercle), puis tourne
// doucement toute seule : plus besoin de faire défiler précisément sur la
// zone pour que quelque chose se passe (l'ancienne version, pilotée par la
// molette, restait figée si le visiteur ne scrollait pas pile dessus).
// Interpolation par lissage exponentiel (même principe que le curseur
// personnalisé de main.js), pas de dépendance supplémentaire.

const stage = document.querySelector('[data-morph-hero]');
if (stage) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Uniquement de vraies photographies — plus aucun bloc de couleur
  // "placeholder" : chaque pièce ci-dessous a désormais une image réelle.
  const CARDS = [
    { img: '../assets/images/oeuvres/curated/cld12.jpg', title: 'La Ruada', href: 'la-ruada.html' },
    { img: '../assets/images/oeuvres/curated/cld15.jpg', title: 'Éclats Floraux', href: 'eclats-floraux.html' },
    { img: '../assets/images/oeuvres/curated/cld25.jpg', title: 'Énergie Libre', href: 'energie-libre.html' },
    { img: '../assets/images/oeuvres/curated/cld47.jpg', title: 'Bleu Profond', href: 'bleu-profond.html' },
    { img: '../assets/images/oeuvres/curated/cld59.jpg', title: 'Série Géométrique Or', href: 'serie-geometrique-or.html' },
    { img: '../assets/images/oeuvres/harmony.jpg', title: 'Harmony', href: 'harmony.html' },
    { img: '../assets/images/oeuvres/identity.jpg', title: 'Identity', href: 'identity.html' },
    { img: '../assets/images/oeuvres/collection2025/full/cld80.jpg', title: 'Garanfana I', href: 'garanfana-i.html' },
    { img: '../assets/images/oeuvres/collection2025/full/cld81.jpg', title: 'Gbégouda', href: 'gbegouda.html' },
    { img: '../assets/images/oeuvres/collection2025/full/cld82.jpg', title: 'Le Déclic I', href: 'le-declic-i.html' },
    { img: '../assets/images/oeuvres/collection2025/full/cld83.jpg', title: 'Élévation', href: 'elevation.html' },
    { img: '../assets/images/oeuvres/collection2025/full/cld85.jpg', title: 'Dragon Rose I', href: 'dragon-rose-i.html' },
    { img: '../assets/images/oeuvres/collection2025/full/cld86.jpg', title: 'Infini', href: 'infini.html' },
    { img: '../assets/images/oeuvres/collection2025/full/cld87.jpg', title: 'Vague', href: 'vague.html' },
    { img: '../assets/images/oeuvres/collection2025/full/cld90.jpg', title: "L'Infini", href: 'linfini.html' },
    { img: '../assets/images/oeuvres/collection2025/full/cld91.jpg', title: 'Chemins de Vie', href: 'chemins-de-vie.html' },
    { img: '../assets/images/oeuvres/collection2025/full/cld93.jpg', title: 'Lucy', href: 'lucy.html' },
    { img: '../assets/images/oeuvres/collection2025/full/cld94.jpg', title: 'Dragon Rose II', href: 'dragon-rose-ii.html' },
    { img: '../assets/images/oeuvres/collection2025/full/cld95.jpg', title: 'Le Déclic III', href: 'le-declic-iii.html' },
    { img: '../assets/images/oeuvres/collection2025/full/cld97.jpg', title: 'Ciel', href: 'ciel.html' },
  ];

  const frag = document.createDocumentFragment();
  const cardEls = CARDS.map((c) => {
    const a = document.createElement('a');
    a.className = 'morph-card';
    a.href = c.href;
    a.setAttribute('data-save-scroll', '');
    a.innerHTML = `
      <div class="morph-card__inner">
        <div class="morph-card__face morph-card__front"><img src="${c.img}" alt="${c.title}" loading="lazy" decoding="async"></div>
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

    let phase = 'idle'; // idle -> scatter -> line -> circle (déclenché une fois visible)
    let started = false;
    let rotationOffset = 0;

    const scatter = cardEls.map(() => ({
      x: (Math.random() - 0.5) * 900,
      y: (Math.random() - 0.5) * 400,
      rot: (Math.random() - 0.5) * 90,
    }));

    function size() {
      const r = stage.getBoundingClientRect();
      return { w: r.width, h: r.height };
    }

    function computeTargets() {
      const { w, h } = size();
      if (phase === 'idle') {
        target = cardEls.map(() => ({ x: 0, y: 0, rot: 0, scale: 0.6, opacity: 0 }));
        return;
      }
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
      // phase === 'circle' — tourne doucement toute seule (rotationOffset
      // avance en continu dans raf()), jamais figée.
      const radius = Math.min(w, h) * 0.34;
      target = cardEls.map((_, i) => {
        const angle = (i / N) * 360 + rotationOffset;
        const rad = (angle * Math.PI) / 180;
        return {
          x: Math.cos(rad) * radius,
          y: Math.sin(rad) * radius * 0.62,
          rot: angle + 90,
          scale: 1,
          opacity: 1,
        };
      });
    }

    function raf() {
      if (phase === 'circle') {
        rotationOffset += 0.06; // rotation lente et continue — jamais à l'arrêt
        computeTargets();
      }
      state.forEach((s, i) => {
        const t = target[i];
        const ease = 0.08;
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

    // Se déclenche une seule fois, dès que la mosaïque entre dans l'écran —
    // aucune interaction requise, contrairement à l'ancienne version pilotée
    // par la molette qui restait figée si on ne scrollait pas dessus.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          phase = 'scatter';
          computeTargets();
          setTimeout(() => { phase = 'line'; computeTargets(); }, 500);
          setTimeout(() => { phase = 'circle'; computeTargets(); }, 1700);
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(stage);
  }
}
