const CATS = {fashion:'👗 Хувцас',food:'🍔 Хоол',electronics:'📱 Электроник',beauty:'💄 Гоо сайхан',home:'🏡 Гэр',sports:'⚽ Спорт',other:'📦 Бусад'};
const DEMO = [
  {_id:'d1', name:'Premium цагаан цамц',price:35000,emoji:'👕',category:'fashion',description:'100% цэвэр хөвөн. S, M, L, XL хэмжээтэй.',store:{name:'FashionMN'},rating:4.5,reviewCount:24},
  {_id:'d2', name:'Sporty гутал Air',price:89000,salePrice:69000,emoji:'👟',category:'fashion',description:'Спорт болон өдөр тутамд тохиромжтой.',store:{name:'SportsMN'},rating:4.8,reviewCount:56},
  {_id:'d3', name:'Designer малгай',price:22000,emoji:'🧢',category:'fashion',description:'Нарны туяанаас хамгаалах загварлаг дизайн.',store:{name:'FashionMN'},rating:4.2,reviewCount:12},
  {_id:'d4', name:'Leather цүнх',price:95000,salePrice:75000,emoji:'👜',category:'fashion',description:'Жинхэнэ арьсан, том багтаамжтай.',store:{name:'LuxuryMN'},rating:4.7,reviewCount:31},
  {_id:'d5', name:'Пицца Маргарита',price:38000,emoji:'🍕',category:'food',description:'Шинэхэн томат, моцарелла, базилик.',store:{name:'PizzaMN'},rating:4.9,reviewCount:142},
  {_id:'d6', name:'Burger Double set',price:42000,salePrice:35000,emoji:'🍔',category:'food',description:'Давхар котлет, шинэ хүнсний ногоо.',store:{name:'BurgerMN'},rating:4.6,reviewCount:89},
  {_id:'d7', name:'iPhone 15 Pro case',price:18000,emoji:'📱',category:'electronics',description:'Магнитан бэхэлгээтэй, дроп хамгаалалт.',store:{name:'TechUB'},rating:4.3,reviewCount:67},
  {_id:'d8', name:'Bluetooth чихэвч',price:125000,salePrice:99000,emoji:'🎧',category:'electronics',description:'ANC, 28ц батарей, IP54 хамгаалалт.',store:{name:'TechUB'},rating:4.5,reviewCount:43},
  {_id:'d9', name:'Нүүрний крем SPF50',price:28000,emoji:'💄',category:'beauty',description:'K-beauty, SPF50+, чийгшүүлэгч, 50ml.',store:{name:'BeautyMN'},rating:4.8,reviewCount:201},
  {_id:'d10',name:'Гоо сайхны багц',price:65000,salePrice:52000,emoji:'✨',category:'beauty',description:'Натурал найрлагатай 5 бүтээгдэхүүн.',store:{name:'BeautyMN'},rating:4.6,reviewCount:78},
  {_id:'d11',name:'Гэрийн ургамал',price:15000,emoji:'🌿',category:'home',description:'Арчилгаа багатай, агаарыг цэвэршүүлдэг.',store:{name:'GreenMN'},rating:4.4,reviewCount:34},
  {_id:'d12',name:'Yoga mat pro',price:55000,salePrice:44000,emoji:'🧘',category:'sports',description:'6мм зузаан, гулсахгүй дэвсгэр.',store:{name:'SportsMN'},rating:4.7,reviewCount:55},
  {_id:'d13',name:'Утааны дусаал',price:12000,emoji:'🕯️',category:'home',description:'Тайвшруулах үнэртэй, 40ц шатаалт.',store:{name:'GreenMN'},rating:4.5,reviewCount:22},
  {_id:'d14',name:'Бөмбөг FIFA стандарт',price:32000,salePrice:25000,emoji:'⚽',category:'sports',description:'Дотоод ба гадна талбайд тохиромжтой.',store:{name:'SportsMN'},rating:4.3,reviewCount:18},
  {_id:'d15',name:'Зөөврийн цэнэглэгч 20k',price:45000,salePrice:36000,emoji:'🔋',category:'electronics',description:'20000mAh, хурдан цэнэглэлт, 3 port.',store:{name:'TechUB'},rating:4.6,reviewCount:91},
  {_id:'d16',name:'Бэлэглэлийн хаалт',price:22000,emoji:'🍱',category:'food',description:'4 хоолны дотор бэлэглэлийн сав.',store:{name:'PizzaMN'},rating:4.4,reviewCount:29},
];

let prods=[], cat='', wish=new Set(JSON.parse(localStorage.getItem('sarana_wish')||'[]')), mQty=1, sTO;

// ── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (Auth.isLoggedIn()) {
    const u = Auth.getUser();
    const el = document.getElementById('nav-user');
    el.textContent = (u?.name?.split(' ')[0] || 'Данс');
    el.href = roleHome(u?.role);
  }
  syncBadge();
  // Affiliate ref param
  const ref = new URLSearchParams(location.search).get('ref');
  if (ref) { sessionStorage.setItem('sarana_ref', ref); document.cookie=`sarana_ref=${ref};path=/;max-age=2592000`; }
  loadProds();
});
window.addEventListener('cart:updated', ()=>{ syncBadge(); if(document.getElementById('cpanel').classList.contains('on')) renderCart(); });

// ── LOAD ────────────────────────────────────────────────────
async function loadProds() {
  try {
    const d = await ProductsAPI.list({limit:60});
    prods = d.products || d || [];
    if (!prods.length) throw new Error('empty');
  } catch { prods = DEMO; }
  render();
}

// ── RENDER ──────────────────────────────────────────────────
function render() {
  const list = cat ? prods.filter(p=>p.category===cat) : prods;
  const sale = list.filter(p=>p.salePrice && p.salePrice<p.price);

  // Sale section
  if (sale.length) {
    document.getElementById('sale-sec').style.display = '';
    document.getElementById('grid-sale').innerHTML = sale.map(p=>pcard(p)).join('');
  } else {
    document.getElementById('sale-sec').style.display = 'none';
  }

  // All products grid
  document.getElementById('all-cnt').textContent = `(${list.length})`;
  document.getElementById('grid-all').innerHTML = list.length
    ? list.map(p=>pcard(p,true)).join('')
    : `<div class="empty"><div class="empty-ico">📭</div><p style="font-size:14px;font-weight:600">Бараа олдсонгүй</p></div>`;
}

// ── PRODUCT CARD ─────────────────────────────────────────────
function pcard(p, grid=false) {
  const px  = p.salePrice||p.price;
  const disc = p.salePrice&&p.price>p.salePrice ? Math.round((1-p.salePrice/p.price)*100) : 0;
  const img  = p.images?.[0] ? `<img src="${p.images[0]}" loading="lazy">` : `<span>${p.emoji||'📦'}</span>`;
  const isNew = p.createdAt && Date.now()-new Date(p.createdAt)<7*864e5;
  const liked = wish.has(p._id);
  const stars = p.rating ? '⭐'.repeat(Math.min(5,Math.round(p.rating))) : '';
  return `<div class="pc${grid?'':''}" data-id="${p._id}" onclick="openPM('${p._id}')">
    ${disc?`<span class="pc-flag flag-s">−${disc}%</span>`:isNew?`<span class="pc-flag flag-n">Шинэ</span>`:''}
    <button class="pc-w${liked?' on':''}" onclick="event.stopPropagation();toggleWish('${p._id}')">${liked?'❤️':'♡'}</button>
    <div class="pc-img">${img}</div>
    <div class="pc-body">
      ${p.store?.name?`<div class="pc-shop">🏪 ${p.store.name}</div>`:''}
      <div class="pc-name">${p.name}</div>
      <div class="pc-pr">
        <div class="pc-price">${UI.price(px)}</div>
        ${disc?`<div class="pc-orig">${UI.price(p.price)}</div>`:''}
      </div>
      ${stars?`<div class="pc-stars">${stars} <span style="color:var(--t3);font-size:10px">(${p.reviewCount||0})</span></div>`:''}
      <button class="pc-add" onclick="event.stopPropagation();quickAdd('${p._id}')">+ Сагсанд нэмэх</button>
    </div>
  </div>`;
}

// ── CATEGORY ────────────────────────────────────────────────
function setcat(el, c) {
  document.querySelectorAll('.cbt').forEach(x=>x.classList.remove('on'));
  el.classList.add('on');
  cat = c;
  render();
}
function jumpCat(c) {
  const btns = document.querySelectorAll('.cbt');
  btns.forEach(b => { b.classList.remove('on'); });
  // find matching button
  btns.forEach(b => { if((c===''&&b.textContent.includes('Бүгд'))||(c&&b.onclick?.toString().includes(`'${c}'`))) b.classList.add('on'); });
  cat = c;
  render();
  document.getElementById('all-sec').scrollIntoView({behavior:'smooth',block:'start'});
}
function scrollDown() { document.getElementById('all-sec').scrollIntoView({behavior:'smooth'}); }

// ── SEARCH ──────────────────────────────────────────────────
function onSearch(v) {
  clearTimeout(sTO);
  sTO = setTimeout(async () => {
    if (v.trim()) {
      try {
        const d = await ProductsAPI.list({search:v, limit:60});
        prods = d.products || d || [];
        if (!prods.length) throw new Error();
      } catch { prods = DEMO.filter(p=>p.name.toLowerCase().includes(v.toLowerCase())); }
    } else {
      try { const d=await ProductsAPI.list({limit:60}); prods=d.products||d||[]; if(!prods.length) throw 0; }
      catch { prods=DEMO; }
    }
    render();
  }, 320);
}

// ── WISHLIST ────────────────────────────────────────────────
function toggleWish(id) {
  wish.has(id) ? wish.delete(id) : (wish.add(id), UI.toast('❤️ Хүслийн жагсаалтад нэмэгдлээ'));
  localStorage.setItem('sarana_wish', JSON.stringify([...wish]));
  document.querySelectorAll(`.pc[data-id="${id}"] .pc-w`).forEach(b=>{
    b.className='pc-w'+(wish.has(id)?' on':'');
    b.textContent=wish.has(id)?'❤️':'♡';
  });
}

// ── QUICK ADD ────────────────────────────────────────────────
function quickAdd(id) {
  const p = prods.find(x=>x._id===id)||DEMO.find(x=>x._id===id);
  if (p) { Cart.add(p,1); openCart(); }
}

// ── CART UI ──────────────────────────────────────────────────
function syncBadge() {
  const n=Cart.count(), b=document.getElementById('cbadge');
  b.textContent=n; b.style.display=n>0?'flex':'none';
}
function openCart()  { document.getElementById('cpanel').classList.add('on'); document.getElementById('dbg').classList.add('on'); document.body.style.overflow='hidden'; renderCart(); }
function closeCart() { document.getElementById('cpanel').classList.remove('on'); document.getElementById('dbg').classList.remove('on'); document.body.style.overflow=''; }

function renderCart() {
  const items=Cart.get(), cnt=Cart.count(), sub=Cart.total();
  const del = sub>=50000?0:3000;
  document.getElementById('cp-cnt').textContent  = cnt?`(${cnt})`:'';
  document.getElementById('cp-sub').textContent  = UI.price(sub);
  document.getElementById('cp-del').textContent  = del===0?'🎉 Үнэгүй':UI.price(del);
  document.getElementById('cp-tot').textContent  = UI.price(sub+del);
  document.getElementById('go-btn').disabled     = cnt===0;

  if (!items.length) { document.getElementById('cp-body').innerHTML=`<div class="cp-empty"><div style="font-size:44px;opacity:.35;margin-bottom:10px">🛒</div><p style="font-size:13px;font-weight:600;color:var(--t3)">Сагс хоосон байна</p></div>`; return; }
  document.getElementById('cp-body').innerHTML = items.map(x=>`
    <div class="ci">
      <div class="ci-img">${x.images?.[0]?`<img src="${x.images[0]}">`:(x.emoji||'📦')}</div>
      <div class="ci-info">
        <div class="ci-name">${x.name}</div>
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

// ── CHECKOUT ────────────────────────────────────────────────
function gocheckout() {
  if (!Auth.isLoggedIn()) {
    sessionStorage.setItem('sarana_redirect','checkout.html');
    UI.toast('Захиалахын тулд нэвтэрнэ үү','warn');
    setTimeout(()=>location.href='login.html', 900);
    return;
  }
  closeCart();
  location.href = 'checkout.html';
}

// ── PRODUCT MODAL ────────────────────────────────────────────
function openPM(id) {
  const p = prods.find(x=>x._id===id)||DEMO.find(x=>x._id===id);
  if (!p) return;
  mQty=1;
  const px=p.salePrice||p.price;
  const disc=p.salePrice&&p.price>p.salePrice?Math.round((1-p.salePrice/p.price)*100):0;
  history.replaceState(null,'',`?product=${id}`);
  document.getElementById('pm-inner').innerHTML=`
    <div class="pm-img">
      ${p.images?.[0]?`<img src="${p.images[0]}">`:`<span style="font-size:80px">${p.emoji||'📦'}</span>`}
      <button class="pm-x" onclick="closePM()">✕</button>
    </div>
    <div class="pm-body">
      <span class="pm-tag">${CATS[p.category]||'📦 Бусад'}</span>
      <div class="pm-name">${p.name}</div>
      ${p.store?.name?`<div class="pm-shop">🏪 ${p.store.name}${p.rating?` · ⭐ ${p.rating} (${p.reviewCount||0})`:''}</div>`:''}
      <div class="pm-desc">${p.description||'Тайлбар байхгүй.'}</div>
      <div class="pm-prices">
        <div class="pm-price">${UI.price(px)}</div>
        ${disc?`<div class="pm-orig">${UI.price(p.price)}</div><div class="pm-disc">−${disc}%</div>`:''}
      </div>
      <div class="pm-act">
        <div class="pm-qty">
          <button onclick="chQ(-1)">−</button>
          <span id="mq">1</span>
          <button onclick="chQ(1)">+</button>
        </div>
        <button class="pm-cart" onclick="addPM('${p._id}')">🛒 Сагсанд нэмэх</button>
      </div>
      ${Auth.isLoggedIn() && Auth.getUser()?.role === 'affiliate' ?
        `<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--bo)">
          <button class="pm-share" onclick="event.stopPropagation();shareAsAffiliate('${p._id}','${p.name.replace(/'/g,'')}')"
            style="width:100%;background:var(--al);color:var(--a);border:none;border-radius:11px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:.2s;display:flex;align-items:center;justify-content:center;gap:6px">
            📢 Борлуулагчаар хуваалцах
          </button>
        </div>` : ''}
      ${!Auth.isLoggedIn() ?
        `<div style="margin-top:12px;text-align:center">
          <a href="login.html#register" style="font-size:12px;color:var(--a);font-weight:600;text-decoration:none">
            📢 Борлуулагч болж комисс олох →
          </a>
        </div>` : ''}
    </div>`;
  document.getElementById('mdbg').classList.add('on');
  document.body.style.overflow='hidden';
}
function chQ(d){ mQty=Math.max(1,mQty+d); const e=document.getElementById('mq'); if(e) e.textContent=mQty; }
function addPM(id){ const p=prods.find(x=>x._id===id)||DEMO.find(x=>x._id===id); if(p){Cart.add(p,mQty);closePM();openCart();} }
function closePM(){ document.getElementById('mdbg').classList.remove('on'); document.body.style.overflow=''; history.replaceState(null,'',location.pathname); }

// ── AFFILIATE SHARE ─────────────────────────────────────────
async function shareAsAffiliate(productId, productName) {
  const user = Auth.getUser();
  if (!user) return;

  const refCode = user.username || user.email?.split('@')[0] || user._id;
  const shareUrl = `${location.origin}/pages/product-detail.html?id=${productId}&ref=${encodeURIComponent(refCode)}`;

  // API-д линк бүртгэх
  try { await AffiliateAPI.createLink(productId); } catch {}

  // Clipboard-д хуулах
  if (navigator.share) {
    try {
      await navigator.share({ title: productName + ' — eseller.mn', text: `${productName} — eseller.mn дээр хамгийн сайн үнээр!`, url: shareUrl });
      UI.toast('📢 Амжилттай хуваалцлаа!');
      return;
    } catch {}
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    UI.toast('📋 Линк хуулагдлаа! Сошиал медиад хуваалцаарай');
  } catch {
    prompt('Линкээ хуулна уу:', shareUrl);
  }
}

document.addEventListener('keydown', e=>{ if(e.key==='Escape'){closeCart();closePM();} });
const initProd = new URLSearchParams(location.search).get('product');
if (initProd) setTimeout(()=>openPM(initProd), 600);
