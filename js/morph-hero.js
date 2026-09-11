// Mosaïque animée réutilisable — dispersion -> ligne -> cercle qui tourne
// doucement en continu. Se déclenche automatiquement dès qu'une zone entre
// dans l'écran (IntersectionObserver), jamais figée. Fonctionne pour
// chaque [data-morph-hero] présent sur la page (accueil des œuvres,
// groupes de la galerie…) — les cartes viennent des <a> déjà présents
// dans le HTML (href + <img>), pas d'un tableau JS séparé à maintenir.
// Interpolation par lissage exponentiel (même principe que le curseur
// personnalisé de main.js), pas de dépendance supplémentaire.

function setupMorphHero(stage) {
  const links = Array.from(stage.children).filter((el) => el.tagName === 'A');
  if (!links.length) return;

  const cardEls = links.map((a) => {
    a.classList.add('morph-card');
    if (!a.hasAttribute('data-save-scroll')) a.setAttribute('data-save-scroll', '');
    if (!a.querySelector('.morph-card__inner')) {
      const img = a.querySelector('img');
      const title = img ? img.alt : '';
      const front = img ? img.outerHTML : a.innerHTML;
      a.innerHTML = `
        <div class="morph-card__inner">
          <div class="morph-card__face morph-card__front">${front}</div>
          <div class="morph-card__face morph-card__back">
            <p class="morph-card__label">Voir l'œuvre</p>
            <p class="morph-card__title">${title}</p>
          </div>
        </div>`;
    }
    return a;
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    cardEls.forEach((el) => { el.style.opacity = '1'; });
    stage.classList.add('is-static');
    return;
  }

  const N = cardEls.length;
  const state = cardEls.map(() => ({ x: 0, y: 0, rot: 0, scale: 0.6, opacity: 0 }));
  let target = cardEls.map(() => ({ x: 0, y: 0, rot: 0, scale: 0.6, opacity: 0 }));

  let phase = 'idle'; // idle -> scatter -> line -> circle (déclenché une fois visible)
  let started = false;
  let rotationOffset = Math.random() * 360;

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

document.querySelectorAll('[data-morph-hero]').forEach(setupMorphHero);
