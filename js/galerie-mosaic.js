// Les 75 œuvres sont réparties en 8 mosaïques (7 de 10, une de 5) qui se
// révèlent l'une après l'autre au fil du scroll normal de la page — chaque
// groupe se déclenche une seule fois, dès qu'il entre dans l'écran.

const groups = document.querySelectorAll('[data-mosaic-group]');

if (groups.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  groups.forEach((group) => observer.observe(group));
}
