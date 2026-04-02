if (!requireAuth('admin')) {}

const user = Auth.getUser();
const av = user?.name?.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()||'AD';
document.getElementById('sb-av').textContent   = av;
document.getElementById('sb-name').textContent = user?.name||'Admin';
document.getElementById('last-update').textContent = 'Сүүлд: ' + new Date().toLocaleTimeString('mn-MN');

// ── DEMO DATA ─────────────────────
const STATS = {gmv:145600000,revenue:14560000,orders:1247,pendingPay:3200000,users:5890,shops:127,affiliates:843,drivers:56};

const ORDERS = [
  {id:'DS29847',user:'Б. Мөнхбат',shop:'FashionMN',items:'Цамц x2',total:70000,status:'delivered',date:'2024-01-15'},
  {id:'DS29846',user:'Д. Саран',shop:'TechUB',items:'iPhone case x1',total:18000,status:'shipped',date:'2024-01-15'},
  {id:'DS29845',user:'Э. Бат',shop:'FoodMN',items:'Пицца x3',total:114000,status:'confirmed',date:'2024-01-14'},
  {id:'DS29844',user:'Н. Дарь',shop:'BeautyMN',items:'Крем x1',total:45000,status:'pending',date:'2024-01-14'},
  {id:'DS29843',user:'С. Оюу',shop:'SportsMN',items:'Yoga mat x1',total:44000,status:'cancelled',date:'2024-01-13'},
];

const PAYOUTS = [
  {id:'pw1',name:'Б. Болд',role:'affiliate',amount:85000,bank:'Голомт банк',account:'****7890',date:'2024-01-15',av:'ББ'},
  {id:'pw2',name:'Д. Саран',role:'seller',amount:320000,bank:'Хаан банк',account:'****5421',date:'2024-01-15',av:'ДС'},
  {id:'pw3',name:'Э. Бат-Эрдэнэ',role:'delivery',amount:42000,bank:'TDB',account:'****2341',date:'2024-01-14',av:'ЭБ'},
  {id:'pw4',name:'Н. Мөнх',role:'affiliate',amount:156000,bank:'Хас банк',account:'****8823',date:'2024-01-14',av:'НМ'},
];

const USERS_DEMO = [
  {name:'Б. Мөнхбат',email:'monkhbat@gmail.com',role:'buyer',joined:'2024-01-10',orders:12,spent:240000},
  {name:'Д. Саран',email:'saran@gmail.com',role:'seller',joined:'2024-01-05',orders:47,spent:1200000},
  {name:'Э. Бат-Эрдэнэ',email:'bat@gmail.com',role:'affiliate',joined:'2024-01-08',orders:23,spent:580000},
  {name:'Н. Дарь',email:'dari@gmail.com',role:'delivery',joined:'2024-01-12',orders:89,spent:0},
  {name:'С. Оюу',email:'oyuu@gmail.com',role:'buyer',joined:'2024-01-15',orders:3,spent:67000},
];

// ── TABS ─────────────────────────
const allTabs = ['dashboard','orders','payouts','commission','users','shops','affiliates','reports'];
function switchTab(t) {
  allTabs.forEach(id => {
    document.getElementById('pane-'+id).style.display = t===id?'':'none';
    document.getElementById('nav-'+id)?.classList.toggle('on', t===id);
  });
  const titles = {dashboard:'Admin самбар',orders:'Захиалгууд',payouts:'Мөнгө татах',commission:'Комисс тохируулах',users:'Хэрэглэгчид',shops:'Дэлгүүрүүд',affiliates:'Борлуулагчид',reports:'Тайлан'};
  document.getElementById('pg-title').textContent = titles[t]||t;
  if (t==='orders')     loadRealOrders().then(o => renderOrdersTable(o));
  if (t==='payouts')    renderPayouts();
  if (t==='commission') { switchCommTab('global'); updateTotal(); }
  if (t==='users')      renderUsers(USERS_DEMO);
  if (t==='shops')      renderShops();
  if (t==='affiliates') renderAffiliates();
  if (t==='reports')    renderReports();
}

// ── DASHBOARD ────────────────────
async function loadDashboard() {
  // Try real API, fallback to demo
  let stats = STATS;
  try {
    const d = await AdminAPI.getStats();
    if (d) stats = { ...STATS, ...d };
  } catch {}
  document.getElementById('d-gmv').textContent       = UI.price(stats.gmv);
  document.getElementById('d-revenue').textContent   = UI.price(stats.revenue);
  document.getElementById('d-orders').textContent    = (stats.orders||0).toLocaleString();
  document.getElementById('d-pending-pay').textContent = UI.price(stats.pendingPay);
  document.getElementById('d-users').textContent     = (stats.users||0).toLocaleString();
  document.getElementById('d-shops').textContent     = stats.shops;
  document.getElementById('d-affs').textContent      = (stats.affiliates||0).toLocaleString();
  document.getElementById('d-drivers').textContent   = stats.drivers;
  document.getElementById('d-gmv-b').textContent     = '+23% өссөн';
  document.getElementById('d-rev-b').textContent     = '+18% өссөн';

  // Pending badge
  document.getElementById('pay-badge').textContent   = PAYOUTS.length;
  document.getElementById('pay-badge').style.display = '';
  document.getElementById('ord-badge').textContent   = ORDERS.filter(o=>o.status==='pending').length||'';

  // Recent orders
  const rows = ORDERS.slice(0,5).map(o=>{
    const cls = {pending:'bp',confirmed:'bc',shipped:'bc',delivered:'bd',cancelled:'bx'}[o.status]||'bp';
    const lbl = {pending:'⏳ Хүлээгдэж буй',confirmed:'✅ Баталгаажсан',shipped:'🚚 Явааны',delivered:'📦 Хүргэгдсэн',cancelled:'❌ Цуцлагдсан'}[o.status]||o.status;
    return `<tr>
      <td><strong style="font-family:monospace;font-size:11px">#${o.id}</strong></td>
      <td>${o.user}</td><td>${o.shop}</td>
      <td><strong>${UI.price(o.total)}</strong></td>
      <td><span class="badge ${cls}">${lbl}</span></td>
    </tr>`;
  }).join('');
  document.getElementById('recent-orders').innerHTML = `
    <table><thead><tr><th>№</th><th>Хэрэглэгч</th><th>Дэлгүүр</th><th>Дүн</th><th>Төлөв</th></tr></thead>
    <tbody>${rows}</tbody></table>`;
}

// ── ORDERS ───────────────────────
let realOrders = null;
async function loadRealOrders() {
  if (realOrders) return realOrders;
  try {
    const d = await OrdersAPI.list({ limit: 100 });
    const list = d.orders || d || [];
    if (list.length) {
      realOrders = list.map(o => ({
        id: o.orderNumber || o._id?.slice(-5),
        _id: o._id,
        user: o.user?.name || '—',
        shop: o.items?.[0]?.product?.store?.name || '—',
        items: o.items?.map(i => `${i.product?.name||'?'} x${i.quantity||1}`).join(', ') || '—',
        total: o.total || 0,
        status: o.status || 'pending',
        date: new Date(o.createdAt).toLocaleDateString('mn-MN'),
        ref: o.referral || o.referralCode || null,
      }));
      return realOrders;
    }
  } catch {}
  return ORDERS;
}

function renderOrdersTable(orders) {
  const rows = orders.map(o=>{
    const cls = {pending:'bp',confirmed:'bc',shipped:'bc',delivered:'bd',cancelled:'bx'}[o.status]||'bp';
    const lbl = {pending:'⏳ Хүлээгдэж буй',confirmed:'✅ Баталгаажсан',shipped:'🚚 Явааны',delivered:'📦 Хүргэгдсэн',cancelled:'❌ Цуцлагдсан'}[o.status]||o.status;
    const opts = ['pending','confirmed','shipped','delivered','cancelled'].map(s=>
      `<option value="${s}" ${o.status===s?'selected':''}>${{pending:'⏳ Хүлээгдэж буй',confirmed:'✅ Баталгаажсан',shipped:'🚚 Явааны',delivered:'📦 Хүргэгдсэн',cancelled:'❌ Цуцлагдсан'}[s]}</option>`).join('');
    return `<tr>
      <td><strong style="font-family:monospace;font-size:11px">#${o.id}</strong></td>
      <td>${o.user}</td><td>${o.shop}</td><td style="color:var(--t2)">${o.items}</td>
      <td><strong>${UI.price(o.total)}</strong></td>
      <td><span class="badge ${cls}">${lbl}</span></td>
      <td><select onchange="updateOrderStatus('${o.id}',this.value)" style="border:1.5px solid var(--bo);border-radius:7px;padding:5px 8px;font-size:12px;font-family:inherit;outline:none">${opts}</select></td>
      <td style="color:var(--t3);font-size:11px">${o.date}</td>
    </tr>`;
  }).join('');
  document.getElementById('orders-table').innerHTML = `<div style="overflow-x:auto">
    <table><thead><tr><th>№</th><th>Хэрэглэгч</th><th>Дэлгүүр</th><th>Бараа</th><th>Дүн</th><th>Төлөв</th><th>Өөрчлөх</th><th>Огноо</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

async function filterOrdersTable(status) {
  const orders = await loadRealOrders();
  renderOrdersTable(status ? orders.filter(o=>o.status===status) : orders);
}

async function updateOrderStatus(id, status) {
  try {
    const order = realOrders?.find(o => o.id === id || o._id === id);
    if (order?._id) await OrdersAPI.updateStatus(order._id, status);
    UI.toast(`✅ #${id} → ${status}`);
  } catch { UI.toast(`✅ #${id} → ${status} (demo)`); }
}

// ── PAYOUTS ──────────────────────
function renderPayouts() {
  const roleLabel = {affiliate:'📢 Борлуулагч',seller:'🏪 Дэлгүүр эзэн',delivery:'🚚 Жолооч'};
  document.getElementById('payouts-list').innerHTML = PAYOUTS.length
    ? PAYOUTS.map(p=>`
      <div class="payout-card">
        <div class="payout-av">${p.av}</div>
        <div class="payout-info">
          <div class="pi-name">${p.name} <span class="badge bc" style="font-size:11px">${roleLabel[p.role]||p.role}</span></div>
          <div class="pi-bank">${p.bank} ${p.account}</div>
          <div class="pi-date">${p.date}</div>
        </div>
        <div class="payout-amt">${UI.price(p.amount)}</div>
        <div class="payout-actions">
          <button class="pabtn pa-approve" onclick="approvePayout('${p.id}')">✅ Батлах</button>
          <button class="pabtn pa-reject"  onclick="rejectPayout('${p.id}')">✕ Цуцлах</button>
        </div>
      </div>`).join('')
    : '<div class="loading">📭 Хүлээгдэж буй хүсэлт байхгүй</div>';

  document.getElementById('payout-history').innerHTML = `
    <table><thead><tr><th>Хэрэглэгч</th><th>Дүн</th><th>Банк</th><th>Огноо</th><th>Төлөв</th></tr></thead>
    <tbody>
      <tr><td>Г. Энхбаяр</td><td>${UI.price(120000)}</td><td>Голомт</td><td>2024-01-13</td><td><span class="badge bd">✅ Шилжүүлэгдсэн</span></td></tr>
      <tr><td>О. Бат</td><td>${UI.price(75000)}</td><td>Хаан</td><td>2024-01-12</td><td><span class="badge bd">✅ Шилжүүлэгдсэн</span></td></tr>
    </tbody></table>`;
}

function approvePayout(id) {
  UI.toast(`✅ ${id} батлагдлаа — банкны систем рүү илгээгдэнэ`);
  document.getElementById('pay-badge').textContent = Math.max(0, parseInt(document.getElementById('pay-badge').textContent||0)-1);
}
function rejectPayout(id) { UI.toast(`❌ ${id} цуцлагдлаа`, 'error'); }
async function approveAll() {
  const confirmed = await UI.confirm(`${PAYOUTS.length} татах хүсэлтийг бүгдийг батлах уу?`);
  if (confirmed) { UI.toast(`✅ ${PAYOUTS.length} хүсэлт батлагдлаа`); document.getElementById('pay-badge').style.display='none'; }
}

// ── COMMISSION DEFAULTS ──────────────────────────────────────
const CAT_DEFAULTS = {
  fashion:     { seller:70, affiliate:10, platform:13, delivery:7,  label:'👗 Хувцас' },
  electronics: { seller:72, affiliate:5,  platform:16, delivery:7,  label:'📱 Электроник' },
  food:        { seller:65, affiliate:8,  platform:17, delivery:10, label:'🍔 Хоол' },
  beauty:      { seller:68, affiliate:12, platform:13, delivery:7,  label:'💄 Гоо сайхан' },
  digital:     { seller:60, affiliate:20, platform:18, delivery:2,  label:'💻 Дижитал' },
  services:    { seller:62, affiliate:15, platform:18, delivery:5,  label:'🛎️ Үйлчилгээ' },
  home:        { seller:70, affiliate:10, platform:13, delivery:7,  label:'🏡 Гэр' },
  sports:      { seller:70, affiliate:10, platform:13, delivery:7,  label:'⚽ Спорт' },
};
let catRates = JSON.parse(JSON.stringify(CAT_DEFAULTS)); // mutable copy

// ── COMMISSION SUB-TAB SWITCH ─────────────────────────────────
function switchCommTab(t) {
  ['global','category','sim'].forEach(id => {
    document.getElementById('cpane-'+id).style.display = id===t ? '' : 'none';
    document.getElementById('ctab-'+id).classList.toggle('on', id===t);
  });
  if (t==='category') renderCatCommGrid();
  if (t==='sim') simulate();
}

// ── GLOBAL COMMISSION ─────────────────────────────────────────
function updateTotal() {
  const v = ['c-shop','c-affiliate','c-platform','c-delivery']
    .reduce((s,id) => s + (parseFloat(document.getElementById(id).value)||0), 0);
  const el = document.getElementById('comm-total');
  el.textContent = v===100 ? `✅ Нийт: ${v}% — Зөв тохируулгатай байна` : `⚠️ Нийт: ${v}% — 100% байх ёстой`;
  el.className = 'comm-total ' + (v===100 ? 'ok' : 'err');
}

async function saveCommission() {
  const total = ['c-shop','c-affiliate','c-platform','c-delivery']
    .reduce((s,id) => s + (parseFloat(document.getElementById(id).value)||0), 0);
  if (total !== 100) { UI.toast('Нийт 100% байх ёстой!','error'); return; }
  try {
    await AdminAPI.updateCommission({
      seller: parseFloat(document.getElementById('c-shop').value),
      affiliate: parseFloat(document.getElementById('c-affiliate').value),
      platform: parseFloat(document.getElementById('c-platform').value),
      delivery: parseFloat(document.getElementById('c-delivery').value),
    });
    UI.toast('✅ Глобал комисс хадгалагдлаа');
  } catch { UI.toast('✅ Комисс хадгалагдлаа (demo mode)'); }
}

function resetCommission() {
  document.getElementById('c-shop').value     = '70';
  document.getElementById('c-affiliate').value = '15';
  document.getElementById('c-platform').value  = '10';
  document.getElementById('c-delivery').value  = '5';
  updateTotal();
}

// ── CATEGORY COMMISSION ───────────────────────────────────────
function renderCatCommGrid() {
  const grid = document.getElementById('cat-comm-grid');
  if (!grid) return;
  grid.innerHTML = Object.entries(catRates).map(([cat, rates]) => {
    const total = rates.seller + rates.affiliate + rates.platform + rates.delivery;
    const ok = total === 100;
    return `<div class="cat-comm-card" id="catcard-${cat}">
      <div class="cat-header">
        <span>${rates.label.split(' ')[0]}</span>
        <div><div class="cat-title">${rates.label.split(' ').slice(1).join(' ')}</div>
        <div class="cat-sub">Ангиллын тохируулга</div></div>
      </div>
      <div class="cat-row"><label>🏪 Дэлгүүр эзэн</label>
        <div style="display:flex;align-items:center;gap:4px">
          <input type="number" min="0" max="100" value="${rates.seller}" id="cat-${cat}-seller" oninput="catTotalUpdate('${cat}')"> %
        </div></div>
      <div class="cat-row"><label>📢 Affiliate</label>
        <div style="display:flex;align-items:center;gap:4px">
          <input type="number" min="0" max="100" value="${rates.affiliate}" id="cat-${cat}-affiliate" oninput="catTotalUpdate('${cat}')"> %
        </div></div>
      <div class="cat-row"><label>🏢 Платформ</label>
        <div style="display:flex;align-items:center;gap:4px">
          <input type="number" min="0" max="100" value="${rates.platform}" id="cat-${cat}-platform" oninput="catTotalUpdate('${cat}')"> %
        </div></div>
      <div class="cat-row"><label>🚚 Жолооч</label>
        <div style="display:flex;align-items:center;gap:4px">
          <input type="number" min="0" max="100" value="${rates.delivery}" id="cat-${cat}-delivery" oninput="catTotalUpdate('${cat}')"> %
        </div></div>
      <div class="cat-total ${ok?'ok':'err'}" id="catotal-${cat}">${ok?'✅':'⚠️'} Нийт: ${total}%</div>
    </div>`;
  }).join('');
}

function catTotalUpdate(cat) {
  const fields = ['seller','affiliate','platform','delivery'];
  const total = fields.reduce((s,f) => s + (parseFloat(document.getElementById(`cat-${cat}-${f}`)?.value)||0), 0);
  const el = document.getElementById(`catotal-${cat}`);
  if (el) {
    el.textContent = (total===100?'✅':'⚠️') + ` Нийт: ${total}%`;
    el.className = 'cat-total ' + (total===100?'ok':'err');
  }
  // Update in-memory
  fields.forEach(f => {
    if (catRates[cat]) catRates[cat][f] = parseFloat(document.getElementById(`cat-${cat}-${f}`)?.value)||0;
  });
}

async function saveCatCommission() {
  // Validate all categories sum to 100
  const errors = Object.keys(catRates).filter(cat => {
    const fields = ['seller','affiliate','platform','delivery'];
    const total = fields.reduce((s,f) => s + (parseFloat(document.getElementById(`cat-${cat}-${f}`)?.value)||0), 0);
    return total !== 100;
  });
  if (errors.length) { UI.toast(`${errors.length} ангилал 100% биш байна!`, 'error'); return; }
  try {
    await AdminAPI.updateCommissionCategories(catRates);
    UI.toast('✅ Ангиллын комисс хадгалагдлаа');
  } catch { UI.toast('✅ Ангиллын комисс хадгалагдлаа (demo)'); }
}

function resetCatCommission() {
  catRates = JSON.parse(JSON.stringify(CAT_DEFAULTS));
  renderCatCommGrid();
  UI.toast('Анхны утга руу буцлаа', 'info');
}

// ── SIMULATOR ─────────────────────────────────────────────────
function simulate() {
  const price = parseFloat(document.getElementById('sim-price')?.value || 100000);
  const selCat = document.getElementById('sim-cat')?.value || 'global';
  let rates;
  if (selCat === 'global') {
    rates = {
      seller:   parseFloat(document.getElementById('c-shop')?.value    || 70),
      affiliate:parseFloat(document.getElementById('c-affiliate')?.value|| 15),
      platform: parseFloat(document.getElementById('c-platform')?.value || 10),
      delivery: parseFloat(document.getElementById('c-delivery')?.value || 5),
    };
  } else {
    rates = catRates[selCat] || CAT_DEFAULTS[selCat] || { seller:70, affiliate:15, platform:10, delivery:5 };
  }
  const parts = [
    { who:'🏪 Дэлгүүр эзэн', key:'seller',    color:'var(--p)' },
    { who:'📢 Affiliate',     key:'affiliate', color:'var(--g)' },
    { who:'🏢 Платформ',      key:'platform',  color:'var(--a)' },
    { who:'🚚 Жолооч',        key:'delivery',  color:'var(--r)' },
  ];
  const el = document.getElementById('sim-result');
  if (!el) return;
  el.innerHTML = parts.map(p => {
    const pct = rates[p.key] || 0;
    const amt = price * pct / 100;
    return `<div style="border:1.5px solid var(--bo);border-radius:12px;padding:16px;text-align:center;background:#fff;transition:.2s" onmouseover="this.style.borderColor='var(--p)'" onmouseout="this.style.borderColor='var(--bo)'">
      <div style="font-size:22px;margin-bottom:5px">${p.who.split(' ')[0]}</div>
      <div style="font-size:12px;color:var(--t2);margin-bottom:10px;font-weight:600">${p.who.split(' ').slice(1).join(' ')}</div>
      <div style="font-size:22px;font-weight:900;color:${p.color}">${UI.price(amt)}</div>
      <div style="font-size:12px;color:var(--t3);margin-top:3px;font-weight:700">${pct}%</div>
    </div>`;
  }).join('')
  + `<div style="border:1.5px solid var(--bo);border-radius:12px;padding:16px;text-align:center;background:var(--bg)">
      <div style="font-size:22px;margin-bottom:5px">💰</div>
      <div style="font-size:12px;color:var(--t2);margin-bottom:10px;font-weight:600">Нийт захиалга</div>
      <div style="font-size:22px;font-weight:900;color:var(--t1)">${UI.price(price)}</div>
      <div style="font-size:12px;color:var(--t3);margin-top:3px;font-weight:700">${selCat==='global'?'Глобал хувь':catRates[selCat]?.label||selCat}</div>
    </div>`;
}

// ── USERS ────────────────────────
let allUsers = [...USERS_DEMO];

async function loadUsers(el, role) {
  document.querySelectorAll('.rtab').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  // Try real API on first load
  if (allUsers === USERS_DEMO || allUsers.length === USERS_DEMO.length) {
    try {
      const d = await AdminAPI.getUsers({ limit: 100 });
      const users = d.users || d || [];
      if (users.length) allUsers = users.map(u => ({
        name: u.name, email: u.email, role: u.role,
        joined: new Date(u.createdAt).toLocaleDateString('mn-MN'),
        orders: u.orderCount || 0, spent: u.totalSpent || 0
      }));
    } catch {}
  }
  const filtered = role==='all' ? allUsers : allUsers.filter(u=>u.role===role);
  renderUsers(filtered);
}

function renderUsers(users) {
  const roleMap = {buyer:'🛍️ Худалдан авагч',seller:'🏪 Дэлгүүр эзэн',affiliate:'📢 Борлуулагч',delivery:'🚚 Жолооч',admin:'🔧 Админ'};
  const rows = users.map(u=>`<tr>
    <td><strong>${u.name}</strong><br><span style="font-size:11px;color:var(--t3)">${u.email}</span></td>
    <td><span class="badge bc">${roleMap[u.role]||u.role}</span></td>
    <td>${u.orders}</td>
    <td>${u.spent?UI.price(u.spent):'—'}</td>
    <td style="color:var(--t3);font-size:12px">${u.joined}</td>
    <td>
      <button class="tb-btn btn-ghost" style="padding:4px 10px;font-size:11px">Харах</button>
      <button class="tb-btn" style="padding:4px 10px;font-size:11px;background:var(--rl);color:var(--r);border:1px solid var(--r)">🚫</button>
    </td>
  </tr>`).join('');
  document.getElementById('users-table').innerHTML = `
    <table><thead><tr><th>Хэрэглэгч</th><th>Үүрэг</th><th>Захиалга</th><th>Нийт зарцуулалт</th><th>Нэгдсэн</th><th>Үйлдэл</th></tr></thead>
    <tbody>${rows}</tbody></table>`;
  document.getElementById('ut-all').textContent = `(${USERS_DEMO.length})`;
}

// ── SHOPS ────────────────────────
function renderShops() {
  const shops = [
    {name:'FashionMN',owner:'Д. Саран',products:47,orders:234,revenue:8400000,status:'active'},
    {name:'TechUB',owner:'Э. Бат',products:23,orders:89,revenue:3200000,status:'active'},
    {name:'BeautyMN',owner:'Н. Дарь',products:31,orders:156,revenue:5600000,status:'active'},
    {name:'SportsMN',owner:'О. Ган',products:18,orders:67,revenue:2100000,status:'pending'},
  ];
  const rows = shops.map(s=>`<tr>
    <td><strong>🏪 ${s.name}</strong></td>
    <td>${s.owner}</td>
    <td>${s.products}</td><td>${s.orders}</td>
    <td><strong>${UI.price(s.revenue)}</strong></td>
    <td><span class="badge ${s.status==='active'?'bd':'bp'}">${s.status==='active'?'✅ Идэвхтэй':'⏳ Хянагдаж байна'}</span></td>
    <td>
      <button class="tb-btn btn-ghost" style="padding:4px 10px;font-size:11px">Харах</button>
      ${s.status==='pending'?`<button class="tb-btn btn-g" style="padding:4px 10px;font-size:11px" onclick="UI.toast('Дэлгүүр батлагдлаа ✅')">Батлах</button>`:''}
    </td>
  </tr>`).join('');
  document.getElementById('shops-table').innerHTML = `
    <table><thead><tr><th>Дэлгүүр</th><th>Эзэн</th><th>Бараа</th><th>Захиалга</th><th>Орлого</th><th>Төлөв</th><th>Үйлдэл</th></tr></thead>
    <tbody>${rows}</tbody></table>`;
}

// ── AFFILIATES ───────────────────
function renderAffiliates() {
  const affs = [
    {name:'Б. Болд',username:'bold123',links:8,clicks:891,sales:34,earned:215000,status:'active'},
    {name:'Э. Нарантуяа',username:'narantuya',links:12,clicks:2341,sales:89,earned:780000,status:'active'},
    {name:'Г. Мөнх',username:'munkh_g',links:3,clicks:124,sales:5,earned:32000,status:'active'},
    {name:'Б. Дэлгэрмаа',username:'delger',links:15,clicks:3890,sales:156,earned:1240000,status:'top'},
  ];
  const rows = affs.map(a=>`<tr>
    <td><strong>${a.name}</strong><br><span style="font-size:11px;color:var(--t3)">@${a.username}</span></td>
    <td>${a.links}</td>
    <td>${a.clicks.toLocaleString()}</td>
    <td>${a.sales}</td>
    <td><strong style="color:var(--g)">${UI.price(a.earned)}</strong></td>
    <td>${(a.sales/a.clicks*100).toFixed(1)}%</td>
    <td><span class="badge ${a.status==='top'?'bd':'bc'}">${a.status==='top'?'⭐ Шилдэг':'✅ Идэвхтэй'}</span></td>
  </tr>`).join('');
  document.getElementById('affiliates-table').innerHTML = `
    <table><thead><tr><th>Борлуулагч</th><th>Линк</th><th>Клик</th><th>Борлуулалт</th><th>Орлого</th><th>CVR</th><th>Төлөв</th></tr></thead>
    <tbody>${rows}</tbody></table>`;
}

// ── REPORTS ──────────────────────
function renderReports() {
  const months = ['Арван нэгдүгээр','Арванхоёрдугаар','Нэгдүгээр'];
  const revenue = [8900000, 12400000, 14560000];
  document.getElementById('report-revenue').innerHTML = months.map((m,i)=>`
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;color:var(--t2)">${m} сар</span>
        <strong>${UI.price(revenue[i])}</strong>
      </div>
      <div style="height:8px;background:var(--bo);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${revenue[i]/14560000*100}%;background:var(--p);border-radius:4px"></div>
      </div>
    </div>`).join('');

  const splits = [
    {who:'🏪 Дэлгүүрүүд',pct:70,color:'var(--p)'},
    {who:'📢 Борлуулагчид',pct:15,color:'var(--g)'},
    {who:'🏢 Платформ',pct:10,color:'var(--a)'},
    {who:'🚚 Жолоочид',pct:5,color:'var(--r)'},
  ];
  document.getElementById('report-split').innerHTML = splits.map(s=>`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="width:12px;height:12px;border-radius:50%;background:${s.color};flex-shrink:0"></div>
      <span style="flex:1;font-size:13px">${s.who}</span>
      <strong style="font-size:13px">${s.pct}%</strong>
      <strong style="font-size:13px;color:${s.color}">${UI.price(14560000*s.pct/100)}</strong>
    </div>`).join('');
}

function refreshAll() {
  loadDashboard();
  document.getElementById('last-update').textContent = 'Сүүлд: ' + new Date().toLocaleTimeString('mn-MN');
  UI.toast('✅ Мэдээлэл шинэчлэгдлээ');
}

// ── INIT ─────────────────────────
loadDashboard();
