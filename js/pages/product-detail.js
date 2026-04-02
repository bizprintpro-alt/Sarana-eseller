// ── DEMO DATA ────────────────────────────────────────────────
const DEMO_PRODUCTS = [
  {_id:'d1',name:'Premium цагаан цамц',price:35000,emoji:'👕',category:'fashion',description:'100% цэвэр хөвөн. Амьсгаладаг, уян хатан эд. Дотуур болон гаднаа өмсөхөд тохиромжтой. Машинд угаалгах боломжтой, 30 хэмд угаана.',store:{name:'FashionMN',_id:'s1'},rating:4.5,reviewCount:24,stock:18,images:[]},
  {_id:'d2',name:'Sporty гутал Air',price:89000,salePrice:69000,emoji:'👟',category:'fashion',description:'Хөнгөн, амьсгаладаг материалтай. Foam cushion sole, mesh upper. Өдрийн турш тав тухтай.',store:{name:'SportsMN',_id:'s2'},rating:4.8,reviewCount:56,stock:9,images:[]},
  {_id:'d3',name:'iPhone 15 Pro case',price:18000,emoji:'📱',category:'electronics',description:'Магнитан бэхэлгээтэй MagSafe compatible. 2м уналтыг тэсвэрлэдэг. Slim profile, carbon fiber texture.',store:{name:'TechUB',_id:'s3'},rating:4.3,reviewCount:67,stock:42,images:[]},
  {_id:'d4',name:'Bluetooth чихэвч',price:125000,salePrice:99000,emoji:'🎧',category:'electronics',description:'Active Noise Cancelling, 28ц батарей. IP54 ус тоосноос хамгаалалт. Foldable design, quick charge.',store:{name:'TechUB',_id:'s3'},rating:4.5,reviewCount:43,stock:15,images:[]},
  {_id:'d5',name:'Нүүрний крем SPF50',price:28000,emoji:'💄',category:'beauty',description:'K-Beauty формула, SPF50+ хамгаалалт. Hyaluronic acid, Niacinamide агуулсан. 50ml, бүх арьсны төрөлд тохиромжтой.',store:{name:'BeautyMN',_id:'s4'},rating:4.8,reviewCount:201,stock:87,images:[]},
  {_id:'d6',name:'Yoga mat pro',price:55000,salePrice:44000,emoji:'🧘',category:'sports',description:'6мм зузаан TPE материал. Гулсахгүй текстур. 183x61cm стандарт хэмжээ. Carry strap оруулсан.',store:{name:'SportsMN',_id:'s2'},rating:4.7,reviewCount:55,stock:31,images:[]},
  {_id:'d7',name:'Зөөврийн цэнэглэгч',price:45000,salePrice:36000,emoji:'🔋',category:'electronics',description:'20000mAh их багтаамж. 22.5W PD хурдан цэнэглэлт. 3 USB port, LED дэлгэц.',store:{name:'TechUB',_id:'s3'},rating:4.6,reviewCount:91,stock:24,images:[]},
  {_id:'d8',name:'Гоо сайхны багц',price:65000,salePrice:52000,emoji:'✨',category:'beauty',description:'Натурал найрлагатай 5 бүтээгдэхүүн. Cleanser, toner, serum, moisturizer, sunscreen. Trial size хайрцагтай.',store:{name:'BeautyMN',_id:'s4'},rating:4.6,reviewCount:78,stock:19,images:[]},
];

const DEMO_REVIEWS = [
  {user:{name:'Б. Мөнхбат',_id:'u1'},rating:5,text:'Маш сайн бараа! Хурдан ирсэн, чанар сайн. Дахин авна.',date:'2024-01-15'},
  {user:{name:'Д. Саран',_id:'u2'},rating:4,text:'Зураг дээрхтэй яг адилхан. Үнэ чанарын харьцаа сайн байна.',date:'2024-01-12'},
  {user:{name:'Э. Болд',_id:'u3'},rating:5,text:'Хэмжээ нь яг таарсан, маш таатай өмсдөг.',date:'2024-01-10'},
];

const CATS = {fashion:'👗 Хувцас',electronics:'📱 Электроник',food:'🍔 Хоол',beauty:'💄 Гоо сайхан',home:'🏡 Гэр',sports:'⚽ Спорт',other:'📦 Бусад'};

let product = null, qty = 1, activeThumb = 0;
let refCode = Ref.get() || new URLSearchParams(location.search).get('ref');

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Nav user
  if (Auth.isLoggedIn()) {
    const u = Auth.getUser();
    const el = document.getElementById('nav-user');
    el.textContent = u?.name?.split(' ')[0] || 'Данс';
    el.href = roleHome(u?.role);
  }
  syncBadge();
  window.addEventListener('cart:updated', () => { syncBadge(); if(document.getElementById('cpanel').classList.contains('on')) renderCart(); });

  const pid = new URLSearchParams(location.search).get('id') || new URLSearchParams(location.search).get('product');
  if (!pid) {
    // No product ID: show storefront
    location.href = 'storefront.html';
    return;
  }
  await loadProduct(pid);
});

// ── LOAD PRODUCT ─────────────────────────────────────────────
async function loadProduct(id) {
  try {
    product = await ProductsAPI.get(id);
  } catch {
    product = DEMO_PRODUCTS.find(p => p._id === id) || DEMO_PRODUCTS[0];
  }
  renderProduct();
  loadRelated();
  renderReviews();
}

// ── RENDER PRODUCT ───────────────────────────────────────────
function renderProduct() {
  const p = product;
  const price = p.salePrice || p.price;
  const disc = p.salePrice && p.price > p.salePrice ? Math.round((1 - p.salePrice/p.price)*100) : 0;
  const imgs = p.images?.length ? p.images : [];
  const catLabel = CATS[p.category] || '📦 Бусад';

  // Update meta
  setOGMeta({
    title: p.name,
    description: p.description || p.name + ' — eseller.mn',
    image: imgs[0] || '',
    url: location.href,
  });
  document.title = p.name + ' — eseller.mn';

  // Breadcrumb
  document.getElementById('bc-cat').textContent = catLabel;
  document.getElementById('bc-cat').href = `storefront.html?cat=${p.category}`;
  document.getElementById('bc-name').textContent = p.name;

  // Gallery
  const mainImg = document.getElementById('main-img');
  mainImg.innerHTML = imgs[0]
    ? `${disc ? `<span class="img-badge badge-sale">−${disc}%</span>` : ''}<img id="main-photo" src="${imgs[0]}" alt="${sanitize(p.name)}">`
    : `${disc ? `<span class="img-badge badge-sale">−${disc}%</span>` : ''}<span style="font-size:90px">${p.emoji||'📦'}</span>`;

  const thumbRow = document.getElementById('thumb-row');
  if (imgs.length > 1) {
    thumbRow.innerHTML = imgs.slice(0,5).map((src, i) =>
      `<div class="thumb${i===0?' on':''}" onclick="setThumb(${i},'${src}',this)"><img src="${src}" loading="lazy"></div>`
    ).join('');
  } else {
    thumbRow.innerHTML = '';
  }

  // Build creator banner if ref exists
  const creatorHTML = refCode ? `
    <a class="creator-banner" href="creator.html?u=${encodeURIComponent(refCode)}" id="creator-banner">
      <div class="cr-av">🎯</div>
      <div>
        <div class="cr-name" id="cr-name">Creator-ийн санал болголт</div>
        <div class="cr-sub">@${sanitize(refCode)} · Хөнгөлөлт авах боломжтой</div>
      </div>
      <div class="cr-arrow">→</div>
    </a>` : '';

  // Info panel
  const storeAv = (p.store?.name || 'S').substring(0, 2).toUpperCase();
  const stars = p.rating ? '⭐'.repeat(Math.min(5, Math.round(p.rating))) : '☆☆☆☆☆';
  const stockOk = (p.stock ?? 99) > 0;
  const stockLow = (p.stock ?? 99) > 0 && (p.stock ?? 99) <= 5;

  document.getElementById('info-panel').innerHTML = `
    <span class="category-tag">${catLabel}</span>
    <h1 class="product-name">${sanitize(p.name)}</h1>
    <div class="store-row">
      <a class="store-link" href="storefront.html">
        <div class="store-av">${sanitize(storeAv)}</div>
        ${sanitize(p.store?.name || 'Дэлгүүр')}
      </a>
      ${p.verified ? '<span style="font-size:11px;color:var(--g);font-weight:700;background:var(--gl);padding:3px 8px;border-radius:6px">✓ Баталгаажсан</span>' : ''}
    </div>
    <div class="rating-row">
      <span class="stars">${stars}</span>
      <span class="rating-num">${p.rating || '—'}</span>
      <span class="review-cnt">(${p.reviewCount || 0} үнэлгээ)</span>
    </div>
    <div class="price-row">
      <span class="price">${UI.price(price)}</span>
      ${disc ? `<span class="orig-price">${UI.price(p.price)}</span><span class="disc-badge">−${disc}%</span>` : ''}
    </div>
    ${disc ? `<div class="per-unit" style="color:var(--r);font-size:12px;font-weight:600">🔥 ${UI.price(p.price - price)} хэмнэлт</div>` : ''}

    ${creatorHTML}

    <div class="qty-row">
      <div class="qty-wrap">
        <button onclick="chQty(-1)">−</button>
        <span id="qty-disp">1</span>
        <button onclick="chQty(1)">+</button>
      </div>
      <div class="stock-info ${stockLow?'stock-low':''}">
        ${stockOk
          ? (stockLow ? `⚠️ Зөвхөн ${p.stock} үлдсэн!` : `✓ Нөөцтэй (${p.stock ?? '∞'})`)
          : '❌ Нөөц дууссан'}
      </div>
    </div>
    <button class="add-btn" ${stockOk?'':'disabled'} onclick="addToCart()">🛒 Сагсанд нэмэх</button>
    <button class="buy-btn" ${stockOk?'':'disabled'} onclick="buyNow()">⚡ Шууд захиалах</button>

    <div class="share-row">
      <span class="share-lbl">Хуваалцах:</span>
      <button class="share-btn" style="background:#1877F2;color:#fff" onclick="shareFB()" title="Facebook">f</button>
      <button class="share-btn" style="background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff" onclick="shareIG()" title="Instagram">📸</button>
      <button class="share-btn" style="background:#000;color:#fff;font-size:12px;font-weight:900" onclick="shareTT()" title="TikTok">♪</button>
      <button class="share-btn sb-copy" onclick="copyLink()" title="Линк хуулах">🔗</button>
    </div>

    <div class="delivery-box">
      <div class="di-row"><div class="di-ico">🚀</div><span><strong>Хурдан хүргэлт</strong> — 30-60 минут</span></div>
      <div class="di-row"><div class="di-ico">🔄</div><span>7 хоногийн буцаалтын баталгаа</span></div>
      <div class="di-row"><div class="di-ico">🔒</div><span>QPay аюулгүй төлбөр</span></div>
      <div class="di-row"><div class="di-ico">📦</div><span>Үнэгүй хүргэлт ₮50,000-с дээш</span></div>
    </div>`;

  // Description tab
  document.getElementById('desc-text').innerHTML = `<p style="margin-bottom:14px">${sanitize(p.description || 'Тайлбар байхгүй байна.')}</p>`;

  // Specs tab
  const specs = p.specs || { 'Ангилал': catLabel, 'Нөөц': p.stock ?? '—', 'Дэлгүүр': p.store?.name || '—' };
  document.getElementById('spec-table').innerHTML = Object.entries(specs)
    .map(([k,v]) => `<tr><td>${sanitize(String(k))}</td><td>${sanitize(String(v))}</td></tr>`).join('');
}

// ── GALLERY ──────────────────────────────────────────────────
function setThumb(idx, src, el) {
  activeThumb = idx;
  const photo = document.getElementById('main-photo');
  if (photo) photo.src = src;
  document.querySelectorAll('.thumb').forEach((t,i) => t.classList.toggle('on', i===idx));
}

// ── QTY ──────────────────────────────────────────────────────
function chQty(d) {
  qty = Math.max(1, Math.min(qty + d, product?.stock ?? 99));
  document.getElementById('qty-disp').textContent = qty;
}

// ── CART ─────────────────────────────────────────────────────
function addToCart() {
  if (!product) return;
  Cart.add(product, qty);
  openCart();
}
function buyNow() {
  if (!product) return;
  Cart.add(product, qty);
  gocheckout();
}

// ── TABS ─────────────────────────────────────────────────────
function switchTab(btn, id) {
  document.querySelectorAll('.tab-item').forEach(b => b.classList.remove('on'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('pane-' + id).classList.add('on');
}

// ── REVIEWS ──────────────────────────────────────────────────
function renderReviews() {
  const reviews = DEMO_REVIEWS;
  const avg = reviews.reduce((s,r)=>s+r.rating,0) / reviews.length || 0;
  document.getElementById('rev-cnt-tab').textContent = `(${reviews.length})`;

  const bars = [5,4,3,2,1].map(n => {
    const cnt = reviews.filter(r=>r.rating===n).length;
    const pct = reviews.length ? Math.round(cnt/reviews.length*100) : 0;
    return `<div class="rb-row"><span style="min-width:14px;text-align:right">${n}</span>
      <span style="color:var(--a);font-size:11px">⭐</span>
      <div class="rb-bar"><div class="rb-fill" style="width:${pct}%"></div></div>
      <span style="min-width:26px;text-align:right">${pct}%</span></div>`;
  }).join('');

  document.getElementById('reviews-wrap').innerHTML = `
    <div class="review-summary">
      <div class="big-rating">
        <div class="score">${avg.toFixed(1)}</div>
        <span class="stars">${'⭐'.repeat(Math.round(avg))}</span>
        <div class="cnt">${reviews.length} үнэлгээ</div>
      </div>
      <div class="rating-bars">${bars}</div>
    </div>
    ${reviews.map(r => `
      <div class="review-card">
        <div class="rc-top">
          <div class="rc-av">${sanitize((r.user?.name||'X').split(' ').map(w=>w[0]).join('').substring(0,2))}</div>
          <div>
            <div class="rc-name">${sanitize(r.user?.name||'Хэрэглэгч')}</div>
            <div class="rc-date">${r.date || ''}</div>
            <div class="rc-stars">${'⭐'.repeat(r.rating)}</div>
          </div>
        </div>
        <div class="rc-text">${sanitize(r.text||'')}</div>
      </div>`).join('')}`;
}

// ── RELATED ──────────────────────────────────────────────────
async function loadRelated() {
  if (!product) return;
  let related = [];
  try {
    const d = await ProductsAPI.list({ category: product.category, limit: 6 });
    related = (d.products || d || []).filter(p => p._id !== product._id).slice(0, 5);
    if (!related.length) throw 0;
  } catch {
    related = DEMO_PRODUCTS.filter(p => p.category === product.category && p._id !== product._id).slice(0,5);
  }
  document.getElementById('related-grid').innerHTML = related.length
    ? related.map(p => `
        <a class="rpc" href="product-detail.html?id=${p._id}${refCode?'&ref='+encodeURIComponent(refCode):''}">
          <div class="rpc-img">${p.images?.[0] ? `<img src="${p.images[0]}" loading="lazy">` : p.emoji||'📦'}</div>
          <div class="rpc-body">
            <div class="rpc-name">${sanitize(p.name)}</div>
            <div class="rpc-price">${UI.price(p.salePrice||p.price)}</div>
          </div>
        </a>`).join('')
    : '<div style="grid-column:1/-1;text-align:center;padding:28px;color:var(--t3)">Төстэй бараа олдсонгүй</div>';
}

// ── SHARE ────────────────────────────────────────────────────
function getShareURL() {
  const base = location.origin + location.pathname + '?id=' + (product?._id || '');
  return refCode ? base + '&ref=' + encodeURIComponent(refCode) : base;
}
function shareFB() { window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(getShareURL()), '_blank', 'width=600,height=400'); }
function shareIG() { copyLink(); UI.toast('Линк хуулагдлаа — Instagram bio-д нэмнэ үү 📸', 'info'); }
function shareTT() { copyLink(); UI.toast('Линк хуулагдлаа — TikTok bio-д нэмнэ үү ♪', 'info'); }
function copyLink() {
  navigator.clipboard.writeText(getShareURL()).then(() => UI.toast('🔗 Линк хуулагдлаа!')).catch(() => {
    const t = document.createElement('textarea'); t.value = getShareURL();
    document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
    UI.toast('🔗 Линк хуулагдлаа!');
  });
}

// ── CART DRAWER ──────────────────────────────────────────────
function syncBadge() {
  const n=Cart.count(),b=document.getElementById('cbadge');
  b.textContent=n; b.style.display=n>0?'flex':'none';
}
function openCart()  { document.getElementById('cpanel').classList.add('on'); document.getElementById('dbg').classList.add('on'); document.body.style.overflow='hidden'; renderCart(); }
function closeCart() { document.getElementById('cpanel').classList.remove('on'); document.getElementById('dbg').classList.remove('on'); document.body.style.overflow=''; }
function renderCart() {
  const items=Cart.get(),sub=Cart.total(),del=sub>=50000?0:3000;
  document.getElementById('cp-cnt').textContent=items.length?`(${Cart.count()})`:'';
  document.getElementById('cp-sub').textContent=UI.price(sub);
  document.getElementById('cp-del').textContent=del===0?'🎉 Үнэгүй':UI.price(del);
  document.getElementById('cp-tot').textContent=UI.price(sub+del);
  document.getElementById('go-btn').disabled=items.length===0;
  if (!items.length) { document.getElementById('cp-body').innerHTML=`<div class="cp-empty"><div style="font-size:44px;opacity:.35;margin-bottom:10px">🛒</div><p style="font-size:13px;font-weight:600">Сагс хоосон байна</p></div>`; return; }
  document.getElementById('cp-body').innerHTML=items.map(x=>`
    <div class="ci">
      <div class="ci-img">${x.images?.[0]?`<img src="${x.images[0]}" style="width:100%;height:100%;object-fit:cover;border-radius:9px">`:(x.emoji||'📦')}</div>
      <div style="flex:1;min-width:0">
        <div class="ci-name">${sanitize(x.name)}</div>
        <div class="ci-price">${UI.price((x.salePrice||x.price)*(x.qty||1))}</div>
        <div class="ci-q">
          <button onclick="Cart.updateQty('${x._id}',${(x.qty||1)-1})">−</button>
          <span>${x.qty||1}</span>
          <button onclick="Cart.updateQty('${x._id}',${(x.qty||1)+1})">+</button>
        </div>
      </div>
      <button class="ci-del" onclick="Cart.remove('${x._id}')">✕</button>
    </div>`).join('');
}
function gocheckout() {
  if (!Auth.isLoggedIn()) { sessionStorage.setItem('sarana_redirect','checkout.html'); UI.toast('Захиалахын тулд нэвтэрнэ үү','warn'); setTimeout(()=>location.href='login.html',900); return; }
  closeCart(); location.href='checkout.html';
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCart();});
