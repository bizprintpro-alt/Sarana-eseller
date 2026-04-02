// ── DEMO CREATOR DATA ────────────────────────────────────────
const DEMO_CREATORS = {
  batbold: {
    name: 'Б. Мөнхбатын',
    username: 'batbold',
    bio: '🔥 Монголын тэргүүний tech reviewer\n💡 Шинэ технологи, гоо сайхан, fashion-ы мэргэжилтэн\n🛍️ Доорх бараанууд миний хувьд хамгийн сайн санал болгосон зүйлс!',
    avatar: null,
    verified: true,
    followers: 12400,
    sales: 847,
    products: 24,
    earnings: 2840000,
    social: { instagram: '@batbold_mn', tiktok: '@batbold.tech', facebook: 'batbold.mn' },
    cover: null,
  },
  sarantuya: {
    name: 'Сарантуяа',
    username: 'sarantuya',
    bio: '💄 Beauty enthusiast | K-beauty lover\n✨ Шилдэг гоо сайхны бүтээгдэхүүн санал болгодог',
    avatar: null,
    verified: false,
    followers: 5200,
    sales: 312,
    products: 15,
    earnings: 980000,
    social: { instagram: '@sarantuya_beauty', tiktok: '@sarantuya.glow' },
    cover: null,
  }
};

const DEMO_PRODUCTS = [
  {_id:'d1',name:'Premium цагаан цамц',price:35000,emoji:'👕',category:'fashion'},
  {_id:'d2',name:'Sporty гутал Air',price:89000,salePrice:69000,emoji:'👟',category:'fashion'},
  {_id:'d3',name:'iPhone 15 Pro case',price:18000,emoji:'📱',category:'electronics'},
  {_id:'d4',name:'Bluetooth чихэвч',price:125000,salePrice:99000,emoji:'🎧',category:'electronics'},
  {_id:'d5',name:'Нүүрний крем SPF50',price:28000,emoji:'💄',category:'beauty'},
  {_id:'d6',name:'Yoga mat pro',price:55000,salePrice:44000,emoji:'🧘',category:'sports'},
];

let creatorData = null;
let username = '';
let isOwnProfile = false;
let following = false;

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Get username from URL: /u/username or ?u=username
  const params = new URLSearchParams(location.search);
  username = params.get('u') || location.pathname.split('/u/')[1] || 'batbold';

  // Nav
  const navUser = document.getElementById('nav-user');
  if (Auth.isLoggedIn()) {
    const u = Auth.getUser();
    navUser.textContent = u?.name?.split(' ')[0] || 'Данс';
    navUser.href = roleHome(u?.role);
    // Check if own profile
    isOwnProfile = u?.role === 'affiliate' && (u?.username === username || u?._id === username);
    if (isOwnProfile) {
      document.getElementById('own-panel').style.display = '';
      document.getElementById('cover-edit-btn').style.display = 'block';
      document.getElementById('share-card').style.display = '';
      document.getElementById('follow-btn').style.display = 'none';
    }
  }

  await loadCreator();
});

// ── LOAD CREATOR ─────────────────────────────────────────────
async function loadCreator() {
  try {
    creatorData = await AffiliateAPI.getProfile(username);
  } catch {
    creatorData = DEMO_CREATORS[username] || DEMO_CREATORS['batbold'];
  }
  renderCreator();
  loadProducts();
  setOGMeta({
    title: creatorData.name + ' — Creator @' + username,
    description: (creatorData.bio || '').split('\n')[0],
    image: creatorData.avatar || '',
    url: location.origin + '/u/' + username,
  });
}

// ── RENDER CREATOR ───────────────────────────────────────────
function renderCreator() {
  const d = creatorData;

  // Avatar
  const avEl = document.getElementById('creator-avatar');
  if (d.avatar) {
    avEl.innerHTML = `<img src="${d.avatar}" alt="${sanitize(d.name)}">`;
  } else {
    avEl.textContent = (d.name || '?').charAt(0).toUpperCase();
    avEl.style.background = `linear-gradient(135deg,#4F46E5,#7C3AED)`;
  }

  // Cover
  if (d.cover) {
    document.getElementById('hero-cover').style.background = `url(${d.cover}) center/cover`;
  }

  // Name & handle
  document.getElementById('creator-name').textContent = d.name || username;
  document.getElementById('creator-handle').textContent = '@' + username + ' · eseller.mn creator';

  // Verified
  if (d.verified) {
    document.getElementById('verified-wrap').innerHTML =
      '<span class="verified-badge">✓ Баталгаажсан Creator</span>';
  }

  // Bio
  document.getElementById('creator-bio').innerHTML =
    sanitize(d.bio || '').replace(/\n/g, '<br>');

  // Social links
  const social = d.social || {};
  const socials = [
    { key: 'instagram', label: '📸 Instagram', href: `https://instagram.com/${(social.instagram||'').replace('@','')}` },
    { key: 'tiktok',    label: '♪ TikTok',     href: `https://tiktok.com/@${(social.tiktok||'').replace('@','')}` },
    { key: 'facebook',  label: 'f Facebook',   href: `https://facebook.com/${(social.facebook||'')}` },
  ].filter(s => social[s.key]);
  document.getElementById('social-links').innerHTML = socials
    .map(s => `<a class="sl-chip" href="${s.href}" target="_blank" rel="noopener">${s.label}</a>`)
    .join('');

  // Stats
  document.getElementById('stats-strip').innerHTML = [
    { val: fmtNum(d.followers || 0),   lbl: 'Дагагчид' },
    { val: fmtNum(d.sales || 0),        lbl: 'Борлуулалт' },
    { val: d.products || 0,             lbl: 'Бараа' },
    { val: UI.price(d.earnings || 0),   lbl: 'Нийт орлого' },
  ].map(s => `<div class="stat-item"><div class="stat-val">${s.val}</div><div class="stat-lbl">${s.lbl}</div></div>`).join('');

  // Share card (own profile)
  if (isOwnProfile) {
    const profileURL = `eseller.mn/u/${username}`;
    document.getElementById('profile-url').textContent = profileURL;
  }

  // Edit modal prefill
  document.getElementById('e-name').value = d.name || '';
  document.getElementById('e-username').value = username;
  document.getElementById('e-bio').value = d.bio || '';
  document.getElementById('e-avatar').value = d.avatar || '';
  document.getElementById('e-instagram').value = social.instagram || '';
  document.getElementById('e-tiktok').value = social.tiktok || '';
  document.getElementById('e-facebook').value = social.facebook || '';
}

// ── PRODUCTS ─────────────────────────────────────────────────
async function loadProducts() {
  let products = [];
  try {
    const d = await ProductsAPI.list({ creator: username, limit: 12 });
    products = d.products || d || [];
    if (!products.length) throw 0;
  } catch {
    products = DEMO_PRODUCTS;
  }
  renderProducts(products);
}

function renderProducts(products) {
  const grid = document.getElementById('prod-grid');
  if (!products.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-ico">📦</div><p style="font-weight:600;color:var(--t2)">Бараа нэмэгдээгүй байна</p></div>`;
    return;
  }
  const ref = username;
  grid.innerHTML = products.map(p => {
    const price = p.salePrice || p.price;
    const disc = p.salePrice && p.price > p.salePrice ? Math.round((1 - p.salePrice/p.price)*100) : 0;
    const img = p.images?.[0]
      ? `<img src="${p.images[0]}" loading="lazy">`
      : `<span style="font-size:44px">${p.emoji||'📦'}</span>`;
    return `<a class="pc" href="product-detail.html?id=${p._id}&ref=${encodeURIComponent(ref)}">
      <div class="pc-img">
        ${img}
        ${disc ? `<span class="pc-disc">−${disc}%</span>` : ''}
      </div>
      <div class="pc-body">
        <div class="pc-name">${sanitize(p.name)}</div>
        <div style="display:flex;align-items:center;gap:5px">
          <span class="pc-price">${UI.price(price)}</span>
          ${disc ? `<span class="pc-orig">${UI.price(p.price)}</span>` : ''}
        </div>
        <button class="pc-add" onclick="event.preventDefault();addCart('${p._id}',event)">🛒 Сагсанд нэмэх</button>
      </div>
    </a>`;
  }).join('');
}

function addCart(id, event) {
  event.stopPropagation();
  const found = DEMO_PRODUCTS.find(p => p._id === id);
  if (found) Cart.add(found, 1);
}

// ── FOLLOW ───────────────────────────────────────────────────
function toggleFollow() {
  if (!Auth.isLoggedIn()) { location.href = 'login.html'; return; }
  following = !following;
  const btn = document.getElementById('follow-btn');
  btn.textContent = following ? '✓ Дагаж байна' : '+ Дагах';
  btn.classList.toggle('following', following);
  UI.toast(following ? `✓ @${username}-г дагалаа` : `@${username}-г дагахаа болилоо`, following ? 'success' : 'info');
}

// ── SHARE ────────────────────────────────────────────────────
function copyProfileLink() {
  const url = location.origin + '/u/' + username;
  navigator.clipboard.writeText(url).catch(() => {});
  UI.toast('🔗 Профайлын линк хуулагдлаа!');
}
function copyAffLink() {
  const url = `eseller.mn/u/${username}`;
  navigator.clipboard.writeText(url).catch(() => {});
  UI.toast('✅ Affiliate линк хуулагдлаа!');
}
function shareSM(platform) {
  const url = encodeURIComponent(`eseller.mn/u/${username}`);
  const title = encodeURIComponent(`${creatorData?.name || username}-ийн санал болгосон бараанууд — eseller.mn`);
  const urls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    instagram: null, // clipboard copy
    tiktok: null,
  };
  if (urls[platform]) { window.open(urls[platform], '_blank', 'width=600,height=400'); }
  else {
    navigator.clipboard.writeText(`eseller.mn/u/${username}`).catch(() => {});
    UI.toast(`Линк хуулагдлаа — ${platform === 'tiktok' ? 'TikTok bio' : 'Instagram bio'}-д нэмнэ үү ✨`, 'info', 4000);
  }
}

// ── EDIT MODAL ───────────────────────────────────────────────
function openEditModal()  { document.getElementById('edit-modal').classList.add('on'); }
function closeEdit()      { document.getElementById('edit-modal').classList.remove('on'); }
async function saveProfile() {
  const data = {
    name:      document.getElementById('e-name').value.trim(),
    username:  document.getElementById('e-username').value.trim(),
    bio:       document.getElementById('e-bio').value.trim(),
    avatar:    document.getElementById('e-avatar').value.trim(),
    social: {
      instagram: document.getElementById('e-instagram').value.trim(),
      tiktok:    document.getElementById('e-tiktok').value.trim(),
      facebook:  document.getElementById('e-facebook').value.trim(),
    }
  };
  try {
    await AffiliateAPI.updateProfile(data);
    UI.toast('✅ Профайл шинэчлэгдлээ');
  } catch { UI.toast('✅ Хадгалагдлаа (demo mode)'); }
  closeEdit();
  creatorData = { ...creatorData, ...data };
  renderCreator();
}
function editCover() { UI.toast('Cover засах — удахгүй 🎨', 'info'); }
function openProductPicker() { location.href = 'affiliate.html'; }
function showMore() { location.href = `storefront.html`; }

// ── UTILS ────────────────────────────────────────────────────
function fmtNum(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n/1000).toFixed(1) + 'K';
  return String(n);
}

function sanitize(str) {
  const el = document.createElement('div');
  el.textContent = str || '';
  return el.innerHTML;
}

function setOGMeta(data) {
  // Set page title and meta for social sharing
  if (data.title) document.title = data.title;
  const setMeta = (prop, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
    el.setAttribute('content', content);
  };
  setMeta('og:title', data.title);
  setMeta('og:description', data.description);
  setMeta('og:image', data.image);
  setMeta('og:url', data.url);
}

