/* ══════════════════════════════════════
   eseller.mn — Seller Dashboard
   Бараа CRUD, захиалга удирдах, орлого,
   affiliate комисс, тохиргоо
   ══════════════════════════════════════ */

if (!requireAuth('seller', 'admin')) {}

const user = Auth.getUser();
let allProds = [], editId = null, allOrders = [], orderFilter = 'all';

// ── INIT ─────────────────────────────────────────────────────
const av = (user?.name || 'S').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
document.getElementById('sb-av').textContent   = av;
document.getElementById('sb-uav').textContent  = av;
document.getElementById('wc-av').textContent   = av;
document.getElementById('sb-sname').textContent = user?.store?.name || (user?.name ? user.name + 'ийн дэлгүүр' : 'Миний дэлгүүр');
document.getElementById('sb-uname').textContent = user?.name || 'Хэрэглэгч';
document.getElementById('sb-uemail').textContent = user?.email || '';
document.getElementById('wc-name').textContent  = `Өрлийн мэнд, ${user?.name?.split(' ')[0] || 'борлуулагч'}!`;
document.getElementById('wc-sub').textContent   = new Date().toLocaleDateString('mn-MN', { weekday: 'long', month: 'long', day: 'numeric' });

// Load settings from localStorage
loadSettings();

// Load all data
loadProds();
loadOrders();

// ── TABS ──────────────────────────────────────────────────────
const tabs = ['dashboard', 'orders', 'products', 'customers', 'marketing', 'promotions', 'affiliate', 'revenue', 'analytics', 'settings'];
function gotoTab(t) {
  tabs.forEach(id => {
    const pane = document.getElementById('pane-' + id);
    if (pane) pane.style.display = id === t ? '' : 'none';
    const sn = document.getElementById('snav-' + id);
    if (sn) sn.classList.toggle('on', id === t);
  });
  const titles = {
    dashboard: 'Самбар', orders: 'Захиалгууд', products: 'Бүтээгдэхүүн',
    customers: 'Хэрэглэгчид', marketing: 'Маркетинг', promotions: 'Урамшуулал',
    affiliate: 'Affiliate', revenue: 'Орлого', analytics: 'Хандалт', settings: 'Тохиргоо',
  };
  document.getElementById('pg-title').textContent = titles[t] || t;
  if (t === 'orders') renderOrdersTable();
  if (t === 'products') renderProds(allProds);
  if (t === 'revenue') renderRevenue();
  if (t === 'affiliate') renderAffiliateStats();
  document.getElementById('pg-sub').textContent = '';
}

// ══════════════════════════════════════════════════════════════
//  PRODUCTS
// ══════════════════════════════════════════════════════════════
async function loadProds() {
  try {
    const d = await ProductsAPI.list({ limit: 100 });
    allProds = d.products || d || [];
  } catch { allProds = []; }
  document.getElementById('s-prods').textContent = allProds.length;
  document.getElementById('s-prods-sub').textContent = `${allProds.length} идэвхтэй`;
  document.getElementById('plan-prods').textContent  = `${allProds.length} / ∞`;
  renderTopProds();
  renderProds(allProds);
}

function renderProds(list) {
  if (!list.length) {
    document.getElementById('prod-grid').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;padding:60px">
        <div style="font-size:52px;margin-bottom:14px;opacity:.4">📦</div>
        <div style="font-size:16px;font-weight:700;color:var(--t2);margin-bottom:6px">Бараа байхгүй байна</div>
        <p style="color:var(--t3);margin-bottom:16px">Эхний барааг нэмж борлуулалтаа эхлүүлэх</p>
        <button onclick="openAddModal()" class="tbtn tbtn-p" style="margin:0 auto">+ Бараа нэмэх</button>
      </div>`;
    return;
  }
  document.getElementById('prod-grid').innerHTML = list.map(p => {
    const stock = p.stock ?? 0;
    const comm = p.commission || 15;
    return `<div class="pcard">
      <div class="pcard-img" style="font-size:${p.images?.[0] ? '0' : '44px'}">
        ${p.images?.[0] ? `<img src="${p.images[0]}" loading="lazy">` : (p.emoji || '📦')}
        <span class="pcard-status ps-on">✓ Идэвхтэй</span>
        ${comm ? `<span class="pcard-comm">📢 ${comm}%</span>` : ''}
      </div>
      <div class="pcard-body">
        <div class="pcard-name" title="${p.name}">${p.name}</div>
        <div class="pcard-price">${UI.price(p.salePrice || p.price)}${p.salePrice ? `<s>${UI.price(p.price)}</s>` : ''}</div>
        <div class="pcard-stock ${stock < 5 ? 'stock-low' : 'stock-ok'}">Нөөц: ${stock}${stock < 5 ? ' ⚠️' : ''}</div>
        <div class="pcard-acts">
          <button class="pbtn pbtn-e" onclick="openModal('${p._id}')">✏️ Засах</button>
          <button class="pbtn pbtn-d" onclick="delProd('${p._id}')">🗑</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterProds(v) {
  renderProds(v ? allProds.filter(p => p.name.toLowerCase().includes(v.toLowerCase())) : allProds);
}

function renderTopProds() {
  const top = allProds.slice(0, 5);
  if (!top.length) {
    document.getElementById('top-products').innerHTML = `<div class="empty-state">Бараа байхгүй байна</div>`;
    return;
  }
  document.getElementById('top-products').innerHTML = `<div class="prod-list">${top.map(p => `
    <div class="prod-row">
      <div class="pr-img">${p.images?.[0] ? `<img src="${p.images[0]}">` : (p.emoji || '📦')}</div>
      <div class="pr-name">${p.name}</div>
      <div class="pr-price">${UI.price(p.salePrice || p.price)}</div>
      <div class="pr-stock ${(p.stock ?? 0) < 5 ? 'stock-low' : 'stock-ok'}">×${p.stock ?? 0}</div>
    </div>`).join('')}</div>`;
}

// ══════════════════════════════════════════════════════════════
//  ORDERS
// ══════════════════════════════════════════════════════════════
const smap = {
  pending:   ['bp', '⏳ Хүлээгдэж буй'],
  confirmed: ['bc', '✅ Баталгаажсан'],
  shipped:   ['bc', '🚚 Явсан'],
  delivered: ['bd', '📦 Хүргэгдсэн'],
  cancelled: ['bx', '❌ Цуцлагдсан']
};

async function loadOrders() {
  try {
    const d = await OrdersAPI.list();
    allOrders = d.orders || d || [];
  } catch { allOrders = []; }

  // Pending badge
  const pend = allOrders.filter(o => o.status === 'pending').length;
  const b = document.getElementById('pend-badge');
  b.textContent = pend; b.style.display = pend ? '' : 'none';

  // Monthly stats
  const now = new Date();
  const thisMonthOrders = allOrders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonthOrders = allOrders.filter(o => {
    const d = new Date(o.createdAt);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });

  document.getElementById('s-month-ord').textContent = thisMonthOrders.length;
  document.getElementById('s-month-cmp').textContent = `Өмнөх сар: ${lastMonthOrders.length}`;

  // Revenue
  const thisRevenue = thisMonthOrders.reduce((s, o) => s + (o.total || 0), 0);
  const lastRevenue = lastMonthOrders.reduce((s, o) => s + (o.total || 0), 0);
  document.getElementById('s-revenue').textContent = UI.price(thisRevenue);
  const revChange = lastRevenue > 0 ? Math.round(((thisRevenue - lastRevenue) / lastRevenue) * 100) : 0;
  const revEl = document.getElementById('s-rev-cmp');
  if (revChange > 0) { revEl.textContent = `↑ ${revChange}% өсөлт`; revEl.className = 'sc-sub sc-up'; }
  else if (revChange < 0) { revEl.textContent = `↓ ${Math.abs(revChange)}% бууралт`; revEl.className = 'sc-sub sc-down'; }
  else { revEl.textContent = `Өмнөх сар: ${UI.price(lastRevenue)}`; revEl.className = 'sc-sub sc-neu'; }

  // Affiliate sales
  const affOrders = allOrders.filter(o => o.referral || o.referralCode);
  document.getElementById('s-aff-sales').textContent = affOrders.length;
  const affPct = allOrders.length > 0 ? Math.round((affOrders.length / allOrders.length) * 100) : 0;
  document.getElementById('s-aff-pct').textContent = `${affPct}% борлуулагчаар`;

  renderRecentOrders();
}

function renderRecentOrders() {
  const recent = allOrders.slice(0, 5);
  if (!recent.length) {
    document.getElementById('recent-orders').innerHTML = `<div class="empty-state">Захиалга байхгүй байна</div>`;
    return;
  }
  document.getElementById('recent-orders').innerHTML = `<div class="order-list">${recent.map(o => {
    const [cls, lbl] = smap[o.status] || ['bp', o.status];
    const items = o.items?.map(i => i.product?.name || i.name || '').filter(Boolean).join(', ') || '—';
    return `<div class="order-row" onclick="openOrderDetail('${o._id}')" style="cursor:pointer">
      <div class="or-num">#${o.orderNumber || o._id?.slice(-5) || '—'}</div>
      <div class="or-info">
        <div class="or-buyer">${o.user?.name || 'Хэрэглэгч'}</div>
        <div class="or-items">${items}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
        <div class="or-amt">${UI.price(o.total || 0)}</div>
        <span class="badge ${cls}" style="font-size:10px">${lbl}</span>
      </div>
    </div>`;
  }).join('')}</div>`;
}

function filterOrders(f) {
  orderFilter = f;
  ['all', 'pending', 'confirmed', 'shipped', 'delivered'].forEach(id => {
    document.getElementById('ot-' + id).classList.toggle('on', id === f);
  });
  renderOrdersTable();
}

function renderOrdersTable() {
  const list = orderFilter === 'all' ? allOrders : allOrders.filter(o => o.status === orderFilter);
  if (!list.length) {
    document.getElementById('orders-table').innerHTML = `<div class="empty-state">Захиалга байхгүй</div>`;
    return;
  }
  document.getElementById('orders-table').innerHTML = `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">
    <thead><tr style="background:var(--bg)">
      <th style="text-align:left;padding:10px 18px;font-size:11px;font-weight:700;color:var(--t2);border-bottom:1px solid var(--bo)">№</th>
      <th style="text-align:left;padding:10px 18px;font-size:11px;font-weight:700;color:var(--t2);border-bottom:1px solid var(--bo)">Хэрэглэгч</th>
      <th style="text-align:left;padding:10px 18px;font-size:11px;font-weight:700;color:var(--t2);border-bottom:1px solid var(--bo)">Дүн</th>
      <th style="text-align:left;padding:10px 18px;font-size:11px;font-weight:700;color:var(--t2);border-bottom:1px solid var(--bo)">Төлөв</th>
      <th style="text-align:left;padding:10px 18px;font-size:11px;font-weight:700;color:var(--t2);border-bottom:1px solid var(--bo)">Ref</th>
      <th style="text-align:left;padding:10px 18px;font-size:11px;font-weight:700;color:var(--t2);border-bottom:1px solid var(--bo)">Өөрчлөх</th>
      <th style="text-align:left;padding:10px 18px;font-size:11px;font-weight:700;color:var(--t2);border-bottom:1px solid var(--bo)">Огноо</th>
    </tr></thead>
    <tbody>${list.slice(0, 50).map(o => {
      const [cls, lbl] = smap[o.status] || ['bp', o.status];
      const opts = Object.entries(smap).map(([k, [, l]]) => `<option value="${k}" ${o.status === k ? 'selected' : ''}>${l}</option>`).join('');
      const ref = o.referral || o.referralCode;
      return `<tr style="border-bottom:1px solid var(--bo);cursor:pointer" onclick="openOrderDetail('${o._id}')">
        <td style="padding:11px 18px;font-size:12px;font-family:monospace;color:var(--p);font-weight:700">#${o.orderNumber || o._id?.slice(-5) || '—'}</td>
        <td style="padding:11px 18px;font-size:13px">${o.user?.name || '—'}</td>
        <td style="padding:11px 18px;font-size:13px;font-weight:900">${UI.price(o.total || 0)}</td>
        <td style="padding:11px 18px"><span class="badge ${cls}">${lbl}</span></td>
        <td style="padding:11px 18px">${ref ? `<span style="background:var(--al);color:var(--a);font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px">📢 ${ref}</span>` : '<span style="color:var(--t3);font-size:11px">—</span>'}</td>
        <td style="padding:11px 18px" onclick="event.stopPropagation()">
          <select style="border:1.5px solid var(--bo);border-radius:7px;padding:5px 9px;font-size:12px;font-family:inherit;outline:none;background:#fff;cursor:pointer" onchange="updateStatus('${o._id}',this.value)">${opts}</select>
        </td>
        <td style="padding:11px 18px;font-size:12px;color:var(--t3)">${new Date(o.createdAt).toLocaleDateString('mn-MN')}</td>
      </tr>`;
    }).join('')}</tbody>
  </table></div>`;
}

async function updateStatus(id, status) {
  try {
    await OrdersAPI.updateStatus(id, status);
    UI.toast('✅ Төлөв шинэчлэгдлээ');
    loadOrders();
  } catch { UI.toast('Алдаа гарлаа', 'error'); }
}

// ── ORDER DETAIL MODAL ───────────────────────────────────────
function openOrderDetail(id) {
  const o = allOrders.find(x => x._id === id);
  if (!o) return;
  const [cls, lbl] = smap[o.status] || ['bp', o.status];
  const ref = o.referral || o.referralCode;

  document.getElementById('om-title').textContent = `📋 Захиалга #${o.orderNumber || o._id?.slice(-5)}`;
  document.getElementById('om-body').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <span class="badge ${cls}" style="font-size:12px;padding:5px 12px">${lbl}</span>
      <span style="font-size:12px;color:var(--t3)">${new Date(o.createdAt).toLocaleString('mn-MN')}</span>
    </div>

    <div style="background:var(--bg);border-radius:12px;padding:14px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:8px">Хэрэглэгч</div>
      <div style="font-size:14px;font-weight:700">${o.user?.name || '—'}</div>
      ${o.delivery?.phone ? `<div style="font-size:13px;color:var(--t2);margin-top:2px">📞 ${o.delivery.phone}</div>` : ''}
      ${o.delivery?.address ? `<div style="font-size:12px;color:var(--t3);margin-top:4px">📍 ${[o.delivery.address.district, o.delivery.address.street, o.delivery.address.building].filter(Boolean).join(', ')}</div>` : ''}
    </div>

    <div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:8px">Барааны жагсаалт</div>
    ${(o.items || []).map(i => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bo)">
        <div style="width:36px;height:36px;border-radius:8px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">
          ${i.product?.emoji || '📦'}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:700">${i.product?.name || i.name || '—'}</div>
          <div style="font-size:11px;color:var(--t3)">×${i.quantity || 1}</div>
        </div>
        <div style="font-size:13px;font-weight:900;color:var(--p)">${UI.price((i.product?.salePrice || i.product?.price || i.price || 0) * (i.quantity || 1))}</div>
      </div>
    `).join('')}

    <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:16px;font-weight:900;border-top:2px solid var(--t1);margin-top:8px">
      <span>Нийт дүн</span>
      <span style="color:var(--p)">${UI.price(o.total || 0)}</span>
    </div>

    ${ref ? `
    <div style="background:var(--al);border-radius:10px;padding:10px 14px;margin-top:12px;display:flex;align-items:center;gap:8px">
      <span style="font-size:16px">📢</span>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--a)">Affiliate борлуулалт</div>
        <div style="font-size:11px;color:var(--t2)">Борлуулагч: ${ref}</div>
      </div>
    </div>` : ''}

    <div style="display:flex;gap:10px;margin-top:16px">
      <select id="om-status" style="flex:1;border:1.5px solid var(--bo);border-radius:10px;padding:10px;font-size:13px;font-family:inherit;outline:none;background:#fff">
        ${Object.entries(smap).map(([k, [, l]]) => `<option value="${k}" ${o.status === k ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
      <button class="tbtn tbtn-p" onclick="updateStatus('${o._id}',document.getElementById('om-status').value);closeOrderModal()">Шинэчлэх</button>
    </div>
  `;
  document.getElementById('order-modal').classList.add('on');
}
function closeOrderModal() { document.getElementById('order-modal').classList.remove('on'); }

// ══════════════════════════════════════════════════════════════
//  PRODUCT MODAL (CRUD)
// ══════════════════════════════════════════════════════════════
function openAddModal() { openModal(null); }
function openModal(id) {
  editId = id || null;
  document.getElementById('modal-title').textContent = id ? '✏️ Бараа засах' : '📦 Бараа нэмэх';
  if (id) {
    const p = allProds.find(x => x._id === id);
    if (p) {
      document.getElementById('m-name').value  = p.name || '';
      document.getElementById('m-desc').value  = p.description || '';
      document.getElementById('m-price').value = p.price || '';
      document.getElementById('m-sale').value  = p.salePrice || '';
      document.getElementById('m-cat').value   = p.category || 'other';
      document.getElementById('m-stock').value = p.stock ?? 0;
      document.getElementById('m-commission').value = p.commission ?? 15;
      document.getElementById('m-emoji').value = p.emoji || '';
      const url = p.images?.[0] || '';
      document.getElementById('m-img').value = url;
      prevImg(url);
    }
  } else {
    ['m-name', 'm-desc', 'm-price', 'm-sale', 'm-img', 'm-emoji'].forEach(x => document.getElementById(x).value = '');
    document.getElementById('m-stock').value = '10';
    document.getElementById('m-commission').value = getStoreSetting('commission') || '15';
    prevImg('');
  }
  document.getElementById('prod-modal').classList.add('on');
}
function closeModal() { document.getElementById('prod-modal').classList.remove('on'); editId = null; }

function prevImg(url) {
  const box = document.getElementById('img-box');
  if (url && url.startsWith('http')) {
    box.innerHTML = `<img src="${url}" onerror="this.parentElement.innerHTML='<div class=img-ph><div class=pi>❌</div><p>Зураг ачааллагдсангүй</p></div>'">`;
  } else {
    box.innerHTML = `<div class="img-ph"><div class="pi">🖼️</div><p>Зургийн URL оруулна уу</p></div>`;
  }
}

async function saveProd() {
  const name  = document.getElementById('m-name').value.trim();
  const price = parseFloat(document.getElementById('m-price').value);
  const sale  = parseFloat(document.getElementById('m-sale').value);
  if (!name)  { UI.toast('Барааны нэр оруулна уу', 'warn'); return; }
  if (!price) { UI.toast('Үнэ оруулна уу', 'warn'); return; }
  if (sale && sale >= price) { UI.toast('Хямдралтай үнэ үндсэн үнээс бага байх ёстой', 'warn'); return; }

  const data = {
    name,
    price,
    description: document.getElementById('m-desc').value,
    salePrice:   sale || undefined,
    category:    document.getElementById('m-cat').value,
    stock:       parseInt(document.getElementById('m-stock').value) || 0,
    commission:  parseInt(document.getElementById('m-commission').value) || 15,
    emoji:       document.getElementById('m-emoji').value || undefined,
    images:      document.getElementById('m-img').value ? [document.getElementById('m-img').value] : []
  };

  const btn = document.getElementById('save-btn');
  UI.loading(btn);
  try {
    if (editId) await ProductsAPI.update(editId, data);
    else await ProductsAPI.create(data);
    UI.toast(editId ? '✅ Бараа шинэчлэгдлээ' : '✅ Бараа нэмэгдлээ');
    closeModal();
    loadProds();
  } catch(e) {
    UI.toast('Алдаа: ' + (e.message || 'Серверийн алдаа'), 'error');
    UI.loading(btn, false);
  }
}

async function delProd(id) {
  if (!UI.confirm('Энэ барааг устгах уу?')) return;
  try {
    await ProductsAPI.delete(id);
    UI.toast('Устгагдлаа');
    loadProds();
  } catch { UI.toast('Устгахад алдаа', 'error'); }
}

// ══════════════════════════════════════════════════════════════
//  SETTINGS — localStorage + API hybrid
// ══════════════════════════════════════════════════════════════
const STORE_KEY = 'eseller_store_settings';

function getStoreSettings() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
}
function getStoreSetting(key) { return getStoreSettings()[key]; }

function loadSettings() {
  const s = getStoreSettings();
  const fields = {
    'cfg-name': s.storeName || user?.name || '',
    'cfg-desc': s.description || '',
    'cfg-logo': s.logo || '',
    'cfg-phone': s.phone || '',
    'cfg-address': s.address || '',
    'cfg-commission': s.commission || 15,
    'cfg-max-commission': s.maxCommission || 25,
    'cfg-bank': s.bank || '',
    'cfg-account': s.accountNumber || '',
    'cfg-account-name': s.accountName || '',
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
}

function saveSettings() {
  const s = getStoreSettings();
  s.storeName   = document.getElementById('cfg-name').value.trim();
  s.description = document.getElementById('cfg-desc').value.trim();
  s.logo        = document.getElementById('cfg-logo').value.trim();
  s.phone       = document.getElementById('cfg-phone').value.trim();
  s.address     = document.getElementById('cfg-address').value.trim();
  localStorage.setItem(STORE_KEY, JSON.stringify(s));

  // Sidebar update
  if (s.storeName) {
    document.getElementById('sb-sname').textContent = s.storeName;
  }
  UI.toast('✅ Дэлгүүрийн мэдээлэл хадгалагдлаа');
}

function saveCommission() {
  const s = getStoreSettings();
  s.commission    = parseInt(document.getElementById('cfg-commission').value) || 15;
  s.maxCommission = parseInt(document.getElementById('cfg-max-commission').value) || 25;
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
  UI.toast('✅ Комиссын тохиргоо хадгалагдлаа');
}

function savePayment() {
  const s = getStoreSettings();
  s.bank          = document.getElementById('cfg-bank').value;
  s.accountNumber = document.getElementById('cfg-account').value.trim();
  s.accountName   = document.getElementById('cfg-account-name').value.trim();
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
  UI.toast('✅ Төлбөрийн мэдээлэл хадгалагдлаа');
}

// ══════════════════════════════════════════════════════════════
//  REVENUE
// ══════════════════════════════════════════════════════════════
async function renderRevenue() {
  const totalRev = allOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const thisMonth = allOrders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === new Date().getMonth() && o.status !== 'cancelled';
  }).reduce((s, o) => s + (o.total || 0), 0);
  const pendingRev = allOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').reduce((s, o) => s + (o.total || 0), 0);

  document.getElementById('rev-total').textContent = UI.price(totalRev);
  document.getElementById('rev-month').textContent = UI.price(thisMonth);
  document.getElementById('rev-pending').textContent = UI.price(pendingRev);
  document.getElementById('rev-withdrawn').textContent = UI.price(0);

  const list = allOrders.filter(o => o.status !== 'cancelled').slice(0, 10);
  document.getElementById('rev-history').innerHTML = list.length
    ? list.map(o => `<div class="order-row">
        <div class="or-num">#${o.orderNumber || o._id?.slice(-5)}</div>
        <div class="or-info"><div class="or-buyer">${o.user?.name || '—'}</div><div class="or-items">${new Date(o.createdAt).toLocaleDateString('mn-MN')}</div></div>
        <div style="font-weight:900;color:var(--g)">+${UI.price(o.total || 0)}</div>
      </div>`).join('')
    : '<div class="empty-state">Орлого байхгүй</div>';
}

// ══════════════════════════════════════════════════════════════
//  AFFILIATE STATS
// ══════════════════════════════════════════════════════════════
function renderAffiliateStats() {
  const affOrders = allOrders.filter(o => o.referral || o.referralCode);
  document.getElementById('aff-count').textContent = new Set(affOrders.map(o => o.referral || o.referralCode)).size;
  document.getElementById('aff-sales').textContent = affOrders.length;
  const affRev = affOrders.reduce((s, o) => s + (o.commissions?.affiliate || 0), 0);
  document.getElementById('aff-paid').textContent = UI.price(affRev);

  // Marketing tab stats
  const mktAffCount = document.getElementById('mkt-aff-count');
  if (mktAffCount) {
    mktAffCount.textContent = new Set(affOrders.map(o => o.referral || o.referralCode)).size;
    document.getElementById('mkt-aff-sales').textContent = affOrders.length;
    document.getElementById('mkt-aff-rev').textContent = UI.price(affOrders.reduce((s, o) => s + (o.total || 0), 0));
  }
}

function shareStore() {
  const url = `${location.origin}/pages/storefront.html`;
  if (navigator.share) {
    navigator.share({ title: 'eseller.mn дэлгүүр', url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).catch(() => {});
    UI.toast('🔗 Дэлгүүрийн линк хуулагдлаа!');
  }
}

// Keyboard shortcut
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeOrderModal(); }
});
