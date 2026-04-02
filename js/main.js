/* ══════════════════════════════════════
   eseller.mn — Shared JavaScript
   Runs on every page after api.js
   ══════════════════════════════════════ */

/* ── Referral capture (бүх хуудсанд) ── */
Ref.capture();

/* ── Nav scroll effect (dark topnav) ── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const upd = () => nav.classList.toggle('scrolled', scrollY > 30);
  window.addEventListener('scroll', upd, { passive: true });
  upd();
})();

/* ── Fade-up on scroll ── */
(function initFadeUp() {
  const els = document.querySelectorAll('.fu');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries =>
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); }),
    { threshold: .08, rootMargin: '0px 0px -24px 0px' }
  );
  els.forEach(el => obs.observe(el));
})();

/* ── Mobile nav cart badge ── */
function updateCartBadge() {
  document.querySelectorAll('.m-badge, .cbadge').forEach(b => {
    const n = Cart.count();
    b.textContent = n;
    b.style.display = n > 0 ? 'flex' : 'none';
  });
}
window.addEventListener('cart:updated', updateCartBadge);
window.addEventListener('cart-updated', updateCartBadge);
document.addEventListener('DOMContentLoaded', updateCartBadge);
