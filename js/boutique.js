// Boutique — filtres par catégorie + panier de sélection (pas de paiement :
// débouche sur un mailto pré-rempli en attendant une intégration
// Stripe/WooCommerce future, comme prévu dans le brief).

const STORAGE_KEY = 'claudine-dan-selection';
const CONTACT_EMAIL = 'creations.dan02@gmail.com';

function loadSelection() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveSelection(items) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let selection = loadSelection();

const cartCount = document.querySelector('.cart-count');
const cartList = document.getElementById('cart-list');
const cartCta = document.getElementById('cart-cta');
const cartDrawer = document.getElementById('cart-drawer');
const cartVeil = document.querySelector('.cart-veil');
const cartToggle = document.querySelector('.cart-toggle');
const cartClose = document.querySelector('.cart-close');

function syncAddButtons() {
  document.querySelectorAll('.add-btn').forEach((btn) => {
    const title = btn.dataset.title;
    const added = selection.includes(title);
    btn.dataset.added = added ? 'true' : 'false';
    btn.setAttribute('aria-pressed', added ? 'true' : 'false');
    btn.textContent = added ? 'Ajouté à ma sélection' : 'Ajouter à ma sélection';
  });
}

function renderCart() {
  cartCount.textContent = selection.length;
  cartList.innerHTML = '';
  if (selection.length === 0) {
    const li = document.createElement('li');
    li.className = 'cart-empty';
    li.textContent = 'Aucune pièce sélectionnée pour l’instant.';
    cartList.appendChild(li);
  } else {
    selection.forEach((title) => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = title;
      const remove = document.createElement('button');
      remove.textContent = 'Retirer';
      remove.className = 'label';
      remove.addEventListener('click', () => toggleSelection(title));
      li.append(span, remove);
      cartList.appendChild(li);
    });
  }
  const subject = encodeURIComponent('Sélection depuis le site — ' + selection.length + ' pièce(s)');
  const body = encodeURIComponent(
    selection.length
      ? 'Bonjour,\n\nJe souhaite en savoir plus sur ces pièces :\n\n- ' + selection.join('\n- ') + '\n\nMerci !'
      : 'Bonjour,\n\nJe souhaite en savoir plus sur vos œuvres.\n\nMerci !'
  );
  cartCta.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  syncAddButtons();
}

function toggleSelection(title) {
  const idx = selection.indexOf(title);
  if (idx === -1) {
    selection.push(title);
  } else {
    selection.splice(idx, 1);
  }
  saveSelection(selection);
  renderCart();
}

document.querySelectorAll('.add-btn').forEach((btn) => {
  btn.addEventListener('click', () => toggleSelection(btn.dataset.title));
});

function openCart() {
  cartDrawer.dataset.open = 'true';
  cartDrawer.removeAttribute('aria-hidden');
  cartVeil.dataset.open = 'true';
  cartToggle.setAttribute('aria-expanded', 'true');
}
function closeCart() {
  cartDrawer.dataset.open = 'false';
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartVeil.dataset.open = 'false';
  cartToggle.setAttribute('aria-expanded', 'false');
}
closeCart();
cartToggle.addEventListener('click', () => {
  cartDrawer.dataset.open === 'true' ? closeCart() : openCart();
});
cartClose.addEventListener('click', closeCart);
cartVeil.addEventListener('click', closeCart);

renderCart();

// ---------- Filtres ----------
document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.product-card').forEach((card) => {
      const match = filter === 'tous' || card.dataset.category === filter;
      card.style.display = match ? '' : 'none';
    });
  });
});

// ---------- Curseur personnalisé (repris de main.js, périmètre boutique) ----------
const cursor = document.querySelector('.cursor');
if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const target = { x: pos.x, y: pos.y };
  window.addEventListener('pointermove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
  });
  gsap.ticker.add(() => {
    pos.x += (target.x - pos.x) * 0.18;
    pos.y += (target.y - pos.y) * 0.18;
    cursor.style.transform = `translate(${pos.x - 5}px, ${pos.y - 5}px)`;
  });
}
