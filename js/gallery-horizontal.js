// Galerie horizontale (scène 10) — défilement latéral continu et sans fin
// (les œuvres sont dupliquées une fois pour boucler sans coupure visible),
// manipulable au doigt/à la souris à tout moment (l'auto-défilement se met
// en pause pendant l'interaction, puis reprend). Un bouton "Retour" permet
// de revenir directement à l'œuvre précédente sans avoir à re-parcourir
// tout le défilement pour la retrouver.

document.querySelectorAll('[data-auto-scroll]').forEach((track) => {
  const originalItems = Array.from(track.children);
  if (!originalItems.length) return;

  originalItems.forEach((item) => track.appendChild(item.cloneNode(true)));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const loopWidth = () => track.scrollWidth / 2;
  const itemStep = () => {
    const first = track.children[0];
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0);
    return first.getBoundingClientRect().width + gap;
  };

  let interacting = false;
  let resumeTimer = null;
  function pauseTemporarily(duration = 2200) {
    interacting = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { interacting = false; }, duration);
  }

  ['pointerdown', 'wheel', 'touchstart'].forEach((evt) => {
    track.addEventListener(evt, () => pauseTemporarily(), { passive: true });
  });

  // Boucle sans fin : dès qu'on dépasse la première copie (dans un sens ou
  // l'autre), on rejoue exactement la même position dans l'autre copie —
  // invisible puisque le contenu y est identique.
  track.addEventListener('scroll', () => {
    const w = loopWidth();
    if (track.scrollLeft >= w) track.scrollLeft -= w;
    else if (track.scrollLeft < 0) track.scrollLeft += w;
  });

  const SPEED = 0.45; // px par frame — lent et continu
  function raf() {
    if (!interacting) {
      track.scrollLeft += SPEED;
    }
    requestAnimationFrame(raf);
  }
  if (!reduceMotion) requestAnimationFrame(raf);

  function goPrev() {
    pauseTemporarily();
    const step = itemStep();
    if (track.scrollLeft - step < 0) track.scrollLeft += loopWidth();
    track.scrollBy({ left: -step, behavior: 'smooth' });
  }
  function goNext() {
    pauseTemporarily();
    track.scrollBy({ left: itemStep(), behavior: 'smooth' });
  }

  const prevBtn = document.querySelector('[data-gallery-prev]');
  const nextBtn = document.querySelector('[data-gallery-next]');
  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  if (nextBtn) nextBtn.addEventListener('click', goNext);
});
