// Menu mosaïque (toutes les pages) — bascule mobile + newsletter (mailto,
// comme le panier de la boutique : pas de backend, un e-mail pré-rempli).

const NEWSLETTER_EMAIL = 'creations.dan02@gmail.com';

document.querySelectorAll('[data-nav]').forEach((nav) => {
  const toggle = nav.querySelector('.nav-toggle');
  const links = nav.querySelector('.site-nav__links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
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
