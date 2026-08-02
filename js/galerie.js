// Galerie complète — lightbox plein écran.
// Les liens gardent leur href (fallback : ouverture dans un nouvel
// onglet sans JS) ; avec JS, un clic simple ouvre l'image en grand ici.

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = lightbox.querySelector('.lightbox-close');

function openLightbox(href, alt) {
  lightboxImg.src = href;
  lightboxImg.alt = alt;
  lightbox.dataset.open = 'true';
}

function closeLightbox() {
  lightbox.dataset.open = 'false';
  lightboxImg.src = '';
}

document.querySelectorAll('.oeuvre-item').forEach((link) => {
  link.addEventListener('click', (e) => {
    // Laisse cmd/ctrl/molette-clic ouvrir un vrai nouvel onglet.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    const img = link.querySelector('img');
    openLightbox(link.getAttribute('href'), img ? img.alt : '');
  });
});

closeBtn.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
