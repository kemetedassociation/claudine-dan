// Menu mosaïque (toutes les pages) — bascule mobile + newsletter (mailto,
// comme le panier de la boutique : pas de backend, un e-mail pré-rempli).

const NEWSLETTER_EMAIL = 'creations.dan02@gmail.com';

document.querySelectorAll('[data-nav]').forEach((nav) => {
  const toggle = nav.querySelector('.nav-toggle');
  const links = nav.querySelector('.site-nav__links');
  if (!toggle || !links) return;
  function setBackgroundScroll(enabled) {
    // Empêche le fond de scroller derrière le menu plein écran (mobile).
    // Sur l'accueil, Lenis pilote le scroll lui-même : on le met en pause
    // aussi, sinon body{overflow:hidden} seul ne suffit pas à l'arrêter.
    document.body.style.overflow = enabled ? '' : 'hidden';
    if (window.lenis) enabled ? window.lenis.start() : window.lenis.stop();
  }

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    setBackgroundScroll(!open);
  });
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      setBackgroundScroll(true);
    });
  });
});

document.querySelectorAll('[data-newsletter]').forEach((form) => {
  const note = form.querySelector('.newsletter-note') || (() => {
    const p = document.createElement('p');
    p.className = 'newsletter-note';
    form.after(p);
    return p;
  })();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value.trim();
    if (!email) return;
    const subject = encodeURIComponent('Inscription newsletter');
    const body = encodeURIComponent(`Merci de m'inscrire à la newsletter avec cette adresse : ${email}`);
    window.location.href = `mailto:${NEWSLETTER_EMAIL}?subject=${subject}&body=${body}`;
    note.textContent = 'Votre logiciel de messagerie va s\'ouvrir pour confirmer votre inscription.';
  });
});
