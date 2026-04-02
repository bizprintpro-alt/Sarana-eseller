/* ══════════════════════════════════════
   eseller.mn — Affiliate Dashboard
   Бараа сонгох, линк үүсгэх, орлого хянах,
   мөнгө татах, social share
   ══════════════════════════════════════ */

if (!requireAuth('affiliate', 'admin')) {}

const user = Auth.getUser();
const av = user?.name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
document.getElementById('sb-av').textContent   = av;
document.getElementById('sb-name').textContent = user?.name || 'Борлуулагч';
document.getElementById('pg-title').textContent = `Өрлийн мэнд, ${user?.name?.split(' ')[0] || ''}!`;

const username = user?.username || user?.name?.toLowerCase().replace(/\s+/g, '') || user?._id?.slice(-6) || 'user';
const myRefLink = `${location.origin}/pages/storefront.html?ref=${encodeURIComponent(username)}`;
document.getElementById('main-ref-link').textContent = myRefLink;

// ── STATE ─────────────────────────
let browseLoaded = false, browseProds = [], browseCat = '';
let myLinks = [], myEarnings = { total: 0, pending: 0, withdrawn: 0 };
let currentProdForSell = null;

// ── DEMO DATA ─────────────────────
const DEMO_PRODUCTS = [
  { _id: 'p1', name: 'Premium цагаан цамц', price: 35000, emoji: '👕', category: 'fashion', commission: 15, store: { name: 'Fashion MN' } },
  { _id: 'p2', name: 'Sporty гутал Air', price: 89000, salePrice: 69000, emoji: '👟', category: 'fashion', commission: 15, store: { name: 'Sports World' } },
  { _id: 'p3', name: 'iPhone 15 case', price: 18000, emoji: '📱', category: 'electronics', commission: 12, store: { name: 'Tech Store UB' } },
  { _id: 'p4', name: 'Bluetooth чихэвч', price: 125000, salePrice: 99000, emoji: '🎧', category: 'electronics', commission: 12, store: { name: 'Tech Store UB' } },
  { _id: 'p5', name: 'Пицца Маргарита', price: 38000, emoji: '🍕', category: 'food', commission: 10, store: { name: 'Pizza MN' } },
  { _id: 'p6', name: 'Нүүрний крем SPF50', price: 45000, salePrice: 38000, emoji: '💄', category: 'beauty', commission: 18, store: { name: 'Beauty MN' } },
  { _id: 'p7', name: 'Leather цүнх', price: 95000, salePrice: 75000, emoji: '👜', category: 'fashion', commission: 15, store: { name: 'Fashion MN' } },
  { _id: 'p8', name: 'Yoga mat', price: 55000, salePrice: 44000, emoji: '🧘', category: 'sports', commission: 14, store: { name: 'Sports World' } },
];

const DEMO_LINKS = [
  { _id: 'l1', productId: 'p1', productName: 'Premium цагаан цамц', clicks: 142, sales: 8, earned: 42000, emoji: '👕' },
  { _id: 'l2', productId: 'p2', productName: 'Sporty гутал Air', clicks: 89, sales: 3, earned: 31050, emoji: '👟' },
  { _id: 'l3', productId: 'p4', productName: 'Bluetooth чихэвч', clicks: 234, sales: 12, earned: 142560, emoji: '🎧' },
];

// ── TABS ──────────────────────────
const tabs = ['overview', 'browse', 'links', 'earnings'];
function switchTab(t) {
  tabs.forEach(id => {
    document.getElementById('pane-' + id).style.display = t === id ? '' : 'none';
    document.getElementById('nav-' + id)?.classList.toggle('on', t === id);
  });
  const titles = { overview: 'Миний самбар', browse: 'Бараа сонгох', links: 'Миний линкүүд', earnings: 'Орлого & Татах' };
  document.getElementById('pg-title').textContent = titles[t];
  if (t === 'browse' && !browseLoaded) loadBrowse();
  if (t === 'links') renderLinks();
  if (t === 'earnings') renderEarnings();
}

// ══════════════════════════════════════════════════════════════
//  OVERVIEW — Stats + Top Links
// ══════════════════════════════════════════════════════════════
async function loadOverview() {
  // Try API first, fallback to demo
  try {
    const linksData = await AffiliateAPI.getLinks();
    myLinks = linksData.links || linksData || [];
  } catch { myLinks = DEMO_LINKS; }

  try {
    const earningsData = await AffiliateAPI.getEarnings();
    myEarnings = earningsData;
  } catch {
    const total = myLinks.reduce((s, l) => s + (l.earned || 0), 0);
    myEarnings = { total, pending: Math.round(total * 0.2), withdrawn: 0 };
  }

  const totalClicks = myLinks.reduce((s, l) => s + (l.clicks || 0), 0);
  const totalSales  = myLinks.reduce((s, l) => s + (l.sales || 0), 0);
  const totalEarned = myEarnings.total || myLinks.reduce((s, l) => s + (l.earned || 0), 0);
  const cvr = totalClicks > 0 ? ((totalSales / totalClicks) * 100).toFixed(1) : '0';

  document.getElementById('s-links').textContent   = myLinks.length;
  document.getElementById('s-clicks').textContent  = totalClicks.toLocaleString();
  document.getElementById('s-sales').textContent   = totalSales;
  document.getElementById('s-earned').textContent  = UI.price(totalEarned);
  document.getElementById('s-cvr').textContent     = `Хувиршилт: ${cvr}%`;
  document.getElementById('wallet-bal').textContent = UI.price(totalEarned - (myEarnings.withdrawn || 0));

  // Top links table
  const top = myLinks.slice(0, 5);
  if (!top.length) {
    document.getElementById('top-links-wrap').innerHTML = `<div class="empty"><div class="ei">🔗</div><p>Линк байхгүй. "Бараа сонгох" хэсгээс бараа сонгоод зарж эхлээрэй!</p></div>`;
    return;
  }
  document.getElementById('top-links-wrap').innerHTML = `
    <table>
      <thead><tr><th>Бараа</th><th>Клик</th><th>Борлуулалт</th><th>Орлого</th></tr></thead>
      <tbody>${top.map(l => `
        <tr>
          <td>${l.emoji || '📦'} <strong>${l.productName || '—'}</strong></td>
          <td><span class="stat-chip chip-b">${l.clicks || 0}</span></td>
          <td><span class="stat-chip chip-g">${l.sales || 0}</span></td>
          <td><strong style="color:var(--g)">${UI.price(l.earned || 0)}</strong></td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

// ══════════════════════════════════════════════════════════════
//  BROWSE — Marketplace-с бараа сонгох
// ══════════════════════════════════════════════════════════════
async function loadBrowse() {
  browseLoaded = true;
  try {
    const d = await ProductsAPI.list({ limit: 60 });
    browseProds = (d.products || d || []).map(p => ({
      ...p,
      commission: p.commission || 15,
    }));
    if (!browseProds.length) throw new Error();
  } catch {
    browseProds = [...DEMO_PRODUCTS];
  }
  renderBrowse();
}

function renderBrowse() {
  const filtered = browseCat ? browseProds.filter(p => p.category === browseCat) : browseProds;
  const isSelling = id => myLinks.some(l => l.productId === id);

  // Update stats
  const bsTotal = document.getElementById('bs-total');
  if (bsTotal) bsTotal.textContent = filtered.length;
  const bsSelling = document.getElementById('bs-selling');
  if (bsSelling) bsSelling.textContent = filtered.filter(p => isSelling(p._id)).length;

  document.getElementById('browse-grid').innerHTML = filtered.map(p => {
    const selling = isSelling(p._id);
    const price = p.salePrice || p.price;
    const comm = Math.round(price * (p.commission || 15) / 100);
    return `
      <div class="pc ${selling ? 'pc-selling' : ''}">
        <span class="selling-tag">✓ Зарж байна</span>
        ${p.salePrice ? `<span class="pc-disc">−${Math.round((1 - p.salePrice / p.price) * 100)}%</span>` : ''}
        <div class="pc-img" style="font-size:${p.images?.[0] ? '0' : '52px'}">
          ${p.images?.[0] ? `<img src="${p.images[0]}">` : (p.emoji || '📦')}
        </div>
        <div class="pc-body">
          <div class="pc-shop">🏪 ${p.store?.name || '—'}</div>
          <div class="pc-name">${p.name}</div>
          <div class="pc-price">${UI.price(price)}</div>
          <div class="pc-comm">+${UI.price(comm)} орлого (${p.commission || 15}%)</div>
          <button class="start-btn ${selling ? 'selling' : ''}" onclick="openSellModal('${p._id}')">
            ${selling ? '✓ Зарж байна — Линк авах' : '🚀 Start Selling'}
          </button>
        </div>
      </div>`;
  }).join('') || `<div class="empty" style="grid-column:1/-1"><div class="ei">📭</div><p>Бараа олдсонгүй</p></div>`;
}

function filterBrowse(v) {
  const all = browseCat ? browseProds : browseProds;
  renderBrowse();
  if (v) {
    const filtered = browseProds.filter(p => p.name.toLowerCase().includes(v.toLowerCase()));
    document.getElementById('browse-grid').innerHTML = filtered.length
      ? filtered.map(p => renderBrowseCard(p)).join('')
      : `<div class="empty" style="grid-column:1/-1"><p>Олдсонгүй</p></div>`;
  } else { renderBrowse(); }
}

function catBrowse(el, cat) {
  document.querySelectorAll('#cat-filters .filter-chip').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  browseCat = cat;
  renderBrowse();
}

function sortBrowse(method) {
  const sorted = [...browseProds];
  if (method === 'price-low')  sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
  if (method === 'price-high') sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
  if (method === 'comm-high')  sorted.sort((a, b) => (b.commission || 15) - (a.commission || 15));
  if (method === 'popular')    sorted.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  browseProds = sorted;
  renderBrowse();
}

// ══════════════════════════════════════════════════════════════
//  START SELLING MODAL
// ══════════════════════════════════════════════════════════════
async function openSellModal(productId) {
  currentProdForSell = browseProds.find(p => p._id === productId) || DEMO_PRODUCTS.find(p => p._id === productId);
  if (!currentProdForSell) return;
  const p = currentProdForSell;
  const price = p.salePrice || p.price;
  const comm = Math.round(price * (p.commission || 15) / 100);

  // Generate affiliate link
  const link = `${location.origin}/pages/product-detail.html?id=${p._id}&ref=${encodeURIComponent(username)}`;

  // Try to register link with API
  try { await AffiliateAPI.createLink(p._id); } catch {}

  document.getElementById('sm-prod-name').textContent = `${p.emoji || '📦'} ${p.name} — ${UI.price(price)}`;
  document.getElementById('sm-comm').innerHTML = `💰 Нэг борлуулалтаас: <strong>${UI.price(comm)}</strong> (${p.commission || 15}%) автоматаар орно`;
  document.getElementById('sm-link').textContent = link;
  document.getElementById('sell-modal').classList.add('on');

  // Reset to link tab
  document.querySelectorAll('.tk-tab').forEach(t => t.classList.remove('on'));
  document.querySelector('.tk-tab').classList.add('on');
  document.querySelectorAll('.tk-pane').forEach(p => p.style.display = 'none');
  document.getElementById('tk-link').style.display = '';
}
function closeSellModal() { document.getElementById('sell-modal').classList.remove('on'); }

// ══════ TOOLKIT TABS ══════
function tkTab(el, pane) {
  document.querySelectorAll('.tk-tab').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  document.querySelectorAll('.tk-pane').forEach(p => p.style.display = 'none');
  document.getElementById(pane).style.display = '';

  if (pane === 'tk-qr') generateQR();
  if (pane === 'tk-poster') generatePoster();
  if (pane === 'tk-social') generateSocialContent();
}

// ══════ QR CODE GENERATOR ══════
function generateQR() {
  const link = document.getElementById('sm-link').textContent;
  const canvas = document.getElementById('qr-canvas');
  const ctx = canvas.getContext('2d');
  const size = 200;
  canvas.width = size; canvas.height = size;

  // Simple QR-like pattern (visual representation — use qrcode.js in production)
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000';

  // Generate deterministic pattern from link
  const data = link.split('').map(c => c.charCodeAt(0));
  const cellSize = 6;
  const grid = Math.floor(size / cellSize);
  const margin = 2;

  // Position markers (3 corners)
  drawFinderPattern(ctx, margin * cellSize, margin * cellSize, cellSize);
  drawFinderPattern(ctx, (grid - margin - 7) * cellSize, margin * cellSize, cellSize);
  drawFinderPattern(ctx, margin * cellSize, (grid - margin - 7) * cellSize, cellSize);

  // Data modules
  for (let i = 0; i < data.length * 3; i++) {
    const val = data[i % data.length];
    const x = (9 + (i * 7) % (grid - 18)) * cellSize;
    const y = (9 + Math.floor((i * 7) / (grid - 18)) % (grid - 18)) * cellSize;
    if ((val + i) % 3 !== 0) {
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }

  // Product info
  const p = currentProdForSell;
  if (p) {
    document.getElementById('qr-product-info').innerHTML = `
      <div style="font-weight:700;margin-bottom:4px">${p.emoji || '📦'} ${p.name}</div>
      <div style="color:var(--p);font-weight:900">${UI.price(p.salePrice || p.price)}</div>
      <div style="color:var(--g);font-size:12px;margin-top:4px">Комисс: ${p.commission || 15}%</div>
    `;
  }
}

function drawFinderPattern(ctx, x, y, cell) {
  // Outer border
  ctx.fillRect(x, y, 7 * cell, 7 * cell);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + cell, y + cell, 5 * cell, 5 * cell);
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 2 * cell, y + 2 * cell, 3 * cell, 3 * cell);
}

function downloadQR() {
  const canvas = document.getElementById('qr-canvas');
  const link = document.createElement('a');
  link.download = `eseller-qr-${currentProdForSell?.name || 'product'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  UI.toast('📥 QR код татагдлаа!');
}

function printQR() {
  const canvas = document.getElementById('qr-canvas');
  const win = window.open('', '_blank');
  win.document.write(`<html><head><title>QR Код — eseller.mn</title></head><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif">
    <h2>${currentProdForSell?.emoji || '📦'} ${currentProdForSell?.name || ''}</h2>
    <img src="${canvas.toDataURL()}" style="width:300px;height:300px;margin:20px">
    <p style="font-size:24px;font-weight:900;color:#CC0000">${UI.price(currentProdForSell?.salePrice || currentProdForSell?.price || 0)}</p>
    <p>eseller.mn дээрх QR кодыг уншуулж худалдаж аваарай</p>
  </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// ══════ POSTER GENERATOR ══════
let posterType = 'story';

function selectPoster(el, type) {
  document.querySelectorAll('.poster-tpl').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  posterType = type;
  generatePoster();
}

function generatePoster() {
  const p = currentProdForSell;
  if (!p) return;
  const price = p.salePrice || p.price;
  document.getElementById('pp-emoji').textContent = p.emoji || '📦';
  document.getElementById('pp-name').textContent = p.name;
  document.getElementById('pp-price').textContent = UI.price(price);
  document.getElementById('pp-qr').textContent = 'QR';

  // Adjust preview aspect ratio
  const preview = document.getElementById('poster-preview');
  if (posterType === 'story') { preview.style.minHeight = '380px'; preview.style.maxWidth = '280px'; preview.style.margin = '0 auto var(--space-4)'; }
  else if (posterType === 'post') { preview.style.minHeight = '300px'; preview.style.maxWidth = '300px'; preview.style.margin = '0 auto var(--space-4)'; }
  else { preview.style.minHeight = '200px'; preview.style.maxWidth = '100%'; preview.style.margin = '0 0 var(--space-4)'; }
}

function downloadPoster() {
  UI.toast('📥 Постер татагдаж байна... (HTML2Canvas шаардлагатай)', 'info');
  // In production: use html2canvas to capture poster-preview div
  copyPosterText();
}

function copyPosterText() {
  const p = currentProdForSell;
  if (!p) return;
  const text = `${p.emoji || '📦'} ${p.name}\n💰 ${UI.price(p.salePrice || p.price)}\n\n🛒 Худалдаж авах: ${document.getElementById('sm-link').textContent}\n\neseller.mn`;
  navigator.clipboard.writeText(text).catch(() => {});
  UI.toast('📋 Постер текст хуулагдлаа!');
}

// ══════ SOCIAL CONTENT GENERATOR ══════
function generateSocialContent() {
  const p = currentProdForSell;
  if (!p) return;
  const price = UI.price(p.salePrice || p.price);
  const link = document.getElementById('sm-link').textContent;
  const disc = p.salePrice && p.price > p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
  const commAmt = UI.price(Math.round((p.salePrice || p.price) * (p.commission || 15) / 100));

  document.getElementById('social-post').textContent =
    `${p.emoji || '📦'} ${p.name}\n\n💰 Үнэ: ${price}${disc ? ` (${disc}% хямдралтай!)` : ''}\n\n✅ Чанартай, хурдан хүргэлттэй\n🛒 Захиалах: ${link}\n\n#eseller #онлайндэлгүүр #хямдрал #монгол`;

  document.getElementById('social-story').textContent =
    `🔥 ${p.name}\n\n${price}${disc ? ` 🏷️ -${disc}%` : ''}\n\n⬆️ Линк bio-д байна\nэсвэл "eseller.mn" хайгаарай`;

  document.getElementById('social-hashtags').textContent =
    `#eseller #esellermn #онлайнхудалдаа #${(p.category || 'бараа').replace(/\s/g, '')} #хямдрал #борлуулалт #монгол #шинэбараа #худалдаа #onlineshopping`;

  document.getElementById('social-msg').textContent =
    `Сайн байна уу! 👋\n\n${p.emoji || '📦'} ${p.name} — ${price}${disc ? ` (${disc}% хямдралтай)` : ''}\n\n🛒 Энд дарж захиалаарай:\n${link}\n\nХурдан хүргэлт, QPay төлбөр 🚀`;
}

function copySocialText(id) {
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).catch(() => {});
  UI.toast('📋 Текст хуулагдлаа!');
}

function shareProductLink(platform) {
  const link = document.getElementById('sm-link').textContent;
  const text = `${currentProdForSell?.name} — eseller.mn-оос авна уу!`;
  const urls = {
    facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`,
    twitter:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
  };
  if (urls[platform]) window.open(urls[platform], '_blank');
}

// ══════════════════════════════════════════════════════════════
//  MY LINKS
// ══════════════════════════════════════════════════════════════
function renderLinks() {
  if (!myLinks.length) {
    document.getElementById('links-wrap').innerHTML = `<div class="empty"><div class="ei">🔗</div><p>Линк байхгүй байна. "Бараа сонгох" хэсгээс бараа сонгоод Start Selling дарна уу.</p></div>`;
    return;
  }
  document.getElementById('links-wrap').innerHTML = `<div style="overflow-x:auto"><table>
    <thead><tr><th>Бараа</th><th>Клик</th><th>Борлуулалт</th><th>Орлого</th><th>Үйлдэл</th></tr></thead>
    <tbody>${myLinks.map(l => {
      const link = `${location.origin}/pages/product-detail.html?id=${l.productId}&ref=${encodeURIComponent(username)}`;
      return `<tr>
        <td>${l.emoji || '📦'} <strong>${l.productName || '—'}</strong></td>
        <td><span class="stat-chip chip-b">${l.clicks || 0}</span></td>
        <td><span class="stat-chip chip-g">${l.sales || 0}</span></td>
        <td><strong style="color:var(--g)">${UI.price(l.earned || 0)}</strong></td>
        <td>
          <button onclick="copyLink('${link}')" class="tb-btn btn-ghost" style="padding:5px 10px;font-size:11px">📋 Хуулах</button>
          <button onclick="shareFrom('${l._id}')" class="tb-btn btn-p" style="padding:5px 10px;font-size:11px">📤 Хуваалцах</button>
        </td>
      </tr>`;
    }).join('')}</tbody></table></div>`;
}

// ══════════════════════════════════════════════════════════════
//  EARNINGS & WITHDRAW
// ══════════════════════════════════════════════════════════════
function renderEarnings() {
  const balance = (myEarnings.total || 0) - (myEarnings.withdrawn || 0);
  document.getElementById('e-balance').textContent = UI.price(balance);
  document.getElementById('wallet-bal').textContent = UI.price(balance);
  document.getElementById('e-pending').textContent  = UI.price(myEarnings.pending || 0);

  // Transaction history (demo + real)
  const txns = [
    { name: 'Bluetooth чихэвч борлуулалт', date: '2024-01-15', amount: 11880, type: 'earn' },
    { name: 'Sporty гутал борлуулалт', date: '2024-01-14', amount: 10350, type: 'earn' },
    { name: 'Мөнгө татсан', date: '2024-01-10', amount: -50000, type: 'withdraw' },
    { name: 'Premium цамц борлуулалт', date: '2024-01-09', amount: 5250, type: 'earn' },
  ];
  document.getElementById('txn-wrap').innerHTML = txns.map(t => `
    <div class="txn-item">
      <div class="txn-info">
        <div class="ti-name">${t.name}</div>
        <div class="ti-date">${t.date}</div>
      </div>
      <div class="txn-amt ${t.type}">${t.amount > 0 ? '+' : ''}${UI.price(Math.abs(t.amount))}</div>
    </div>`).join('');
}

async function requestWithdraw() {
  const bank    = document.getElementById('w-bank').value;
  const account = document.getElementById('w-account').value.trim();
  const amount  = parseFloat(document.getElementById('w-amount').value);
  if (!account) { UI.toast('Дансны дугаар оруулна уу', 'warn'); return; }
  if (!amount || amount < 10000) { UI.toast('Дор хаяж ₮10,000 татах боломжтой', 'warn'); return; }

  const balance = (myEarnings.total || 0) - (myEarnings.withdrawn || 0);
  if (amount > balance) { UI.toast('Үлдэгдэл хүрэлцэхгүй байна', 'warn'); return; }

  const btn = document.getElementById('withdraw-btn');
  UI.loading(btn);
  try {
    await WalletAPI.withdraw(amount, bank);
    UI.toast('✅ Татах хүсэлт амжилттай! 24 цагт шилжих болно.');
    myEarnings.withdrawn = (myEarnings.withdrawn || 0) + amount;
    renderEarnings();
  } catch(e) {
    UI.toast(e.message || 'Алдаа гарлаа. Дахин оролдоно уу.', 'error');
  }
  UI.loading(btn, false);
}

// ══════════════════════════════════════════════════════════════
//  UTILITIES
// ══════════════════════════════════════════════════════════════
function copyLink(link) {
  navigator.clipboard.writeText(link).then(() => {
    UI.toast('✅ Линк хуулагдлаа! Сошиал медиад paste хийнэ үү.');
  }).catch(() => {
    prompt('Линкээ хуулна уу:', link);
  });
}

function shareLink(platform) {
  const link = myRefLink;
  const text = 'eseller.mn дээрх гайхалтай бараанаас аваарай!';
  const urls = {
    facebook:  `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
    instagram: link,
    whatsapp:  `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`,
    twitter:   `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
    telegram:  `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`,
  };
  if (platform === 'instagram') { copyLink(link); UI.toast('📸 Instagram-д paste хийнэ үү'); return; }
  if (urls[platform]) window.open(urls[platform], '_blank');
}

function shareFrom(linkId) {
  const l = myLinks.find(x => x._id === linkId);
  if (!l) return;
  currentProdForSell = browseProds.find(p => p._id === l.productId) || { name: l.productName, emoji: l.emoji };
  const link = `${location.origin}/pages/product-detail.html?id=${l.productId}&ref=${encodeURIComponent(username)}`;
  document.getElementById('sm-prod-name').textContent = `${l.emoji || '📦'} ${l.productName}`;
  document.getElementById('sm-comm').innerHTML = `💰 Нийт орлого: <strong>${UI.price(l.earned || 0)}</strong> (${l.sales || 0} борлуулалт)`;
  document.getElementById('sm-link').textContent = link;
  document.getElementById('sell-modal').classList.add('on');
}

// Keyboard
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSellModal(); });

// ── INIT ─────────────────────────
loadOverview();
