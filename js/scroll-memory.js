// Retenir la position de scroll avant d'ouvrir la fiche d'une œuvre, pour
// que le bouton "Retour" de cette fiche (history.back()) ramène le visiteur
// exactement où il s'était arrêté, plutôt que de faire recharger la page
// tout en haut à chaque fois.

(function () {
  const key = `scrollpos:${location.pathname}`;

  function restore() {
    const saved = sessionStorage.getItem(key);
    if (saved === null) return;
    const y = parseFloat(saved);
    if (Number.isNaN(y)) return;
    if (window.lenis) {
      window.lenis.scrollTo(y, { immediate: true });
    } else {
      window.scrollTo(0, y);
    }
  }

  // Attend que Lenis/ScrollTrigger aient fini de mesurer la page (pin-spacers
  // ajoutés après coup sur l'accueil) avant de repositionner le scroll.
  window.addEventListener('load', () => setTimeout(restore, 60));

  document.querySelectorAll('[data-save-scroll]').forEach((el) => {
    el.addEventListener('click', () => {
      const y = window.lenis ? window.lenis.scroll : window.scrollY;
      sessionStorage.setItem(key, String(y));
    });
  });
})();
