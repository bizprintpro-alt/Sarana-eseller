/* ══════════════════════════════════════════════════════════════
   eseller.mn — Admin Dashboard
   Predictive Analytics, Drill-down, Behavior, AI Chatbot,
   Dark/Light mode, Quick Actions
   ══════════════════════════════════════════════════════════════ */

if (!requireAuth('admin')) {}

const user = Auth.getUser();
const av = user?.name?.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()||'AD';
document.getElementById('sb-av').textContent = av;
document.getElementById('sb-name').textContent = user?.name||'Admin';
document.getElementById('last-update').textContent = 'Сүүлд: '+new Date().toLocaleTimeString('mn-MN');

// ══════ STATE ══════
const DEMO_STATS = {gmv:145600000,revenue:14560000,orders:1247,pendingPay:3200000,users:5890,shops:127,affiliates:843,drivers:56};
const DEMO_ORDERS = [
  {id:'DS29847',user:'Б. Мөнхбат',shop:'FashionMN',items:'Цамц x2',total:70000,status:'delivered',date:'2024-01-15'},
  {id:'DS29846',user:'Д. Саран',shop:'TechUB',items:'iPhone case x1',total:18000,status:'shipped',date:'2024-01-15'},
  {id:'DS29845',user:'Э. Бат',shop:'FoodMN',items:'Пицца x3',total:114000,status:'confirmed',date:'2024-01-14'},
  {id:'DS29844',user:'Н. Дарь',shop:'BeautyMN',items:'Крем x1',total:45000,status:'pending',date:'2024-01-14'},
  {id:'DS29843',user:'С. Оюу',shop:'SportsMN',items:'Yoga mat x1',total:44000,status:'cancelled',date:'2024-01-13'},
];
const DEMO_PAYOUTS = [
  {id:'pw1',name:'Б. Болд',role:'affiliate',amount:85000,bank:'Голомт',account:'****7890',date:'2024-01-15',av:'ББ'},
  {id:'pw2',name:'Д. Саран',role:'seller',amount:320000,bank:'Хаан',account:'****5421',date:'2024-01-15',av:'ДС'},
  {id:'pw3',name:'Э. Бат',role:'delivery',amount:42000,bank:'TDB',account:'****2341',date:'2024-01-14',av:'ЭБ'},
];
const DEMO_USERS = [
  {name:'Б. Мөнхбат',email:'monkhbat@gmail.com',role:'buyer',joined:'2024-01-10',orders:12,spent:240000},
  {name:'Д. Саран',email:'saran@gmail.com',role:'seller',joined:'2024-01-05',orders:47,spent:1200000},
  {name:'Э. Бат',email:'bat@gmail.com',role:'affiliate',joined:'2024-01-08',orders:23,spent:580000},
  {name:'Н. Дарь',email:'dari@gmail.com',role:'delivery',joined:'2024-01-12',orders:89,spent:0},
  {name:'С. Оюу',email:'oyuu@gmail.com',role:'buyer',joined:'2024-01-15',orders:3,spent:67000},
];
// Monthly data for predictions
const MONTHLY = [
  {month:'10-сар',revenue:8900000,orders:890},
  {month:'11-сар',revenue:12400000,orders:1050},
  {month:'12-сар',revenue:14560000,orders:1247},
];
let stats=DEMO_STATS, realOrders=null, allUsers=[...DEMO_USERS];

// ══════ DARK/LIGHT MODE ══════
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-icon').textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('admin-theme', isDark ? 'light' : 'dark');
}
(function initTheme() {
  const saved = localStorage.getItem('admin-theme');
  if (saved) { document.documentElement.setAttribute('data-theme', saved); document.getElementById('theme-icon').textContent = saved==='dark'?'☀️':'🌙'; }
})();

// ══════ TABS ══════
const allTabs = ['dashboard','predictions','orders','payouts','commission','users','shops','affiliates','reports','behavior','chatbot'];
function switchTab(t) {
  allTabs.forEach(id => {
    const p = document.getElementById('pane-'+id); if(p) p.style.display = t===id?'':'none';
    const n = document.getElementById('nav-'+id); if(n) n.classList.toggle('on', t===id);
  });
  const titles = {dashboard:'Админ самбар',predictions:'🔮 Урьдчилсан таамаглал',orders:'Захиалгууд',payouts:'Мөнгө татах',commission:'Комисс',users:'Хэрэглэгчид',shops:'Дэлгүүрүүд',affiliates:'Борлуулагчид',reports:'Тайлан',behavior:'🧠 Зан төлөв',chatbot:'🤖 AI Туслах'};
  document.getElementById('pg-title').textContent = titles[t]||t;
  if(t==='orders') loadRealOrders().then(o=>renderOrdersTable(o));
  if(t==='payouts') renderPayouts();
  if(t==='commission'){switchCommTab('global');updateTotal();}
  if(t==='users') loadUsers(document.querySelector('.rtab.on')||document.querySelector('.rtab'),'all');
  if(t==='shops') renderShops();
  if(t==='affiliates') renderAffiliates();
  if(t==='reports') renderReports();
  if(t==='predictions') renderPredictions();
  if(t==='behavior') renderBehavior();
}

// ══════ DASHBOARD ══════
async function loadDashboard() {
  try { const d = await AdminAPI.getStats(); if(d) stats={...DEMO_STATS,...d}; } catch{}
  document.getElementById('d-gmv').textContent = UI.price(stats.gmv);
  document.getElementById('d-revenue').textContent = UI.price(stats.revenue);
  document.getElementById('d-orders').textContent = (stats.orders||0).toLocaleString();
  document.getElementById('d-pending-pay').textContent = UI.price(stats.pendingPay);
  document.getElementById('d-users').textContent = (stats.users||0).toLocaleString();
  document.getElementById('d-shops').textContent = stats.shops;
  document.getElementById('d-affs').textContent = (stats.affiliates||0).toLocaleString();
  document.getElementById('d-drivers').textContent = stats.drivers;
  document.getElementById('d-gmv-b').textContent = '+23% өссөн';
  document.getElementById('d-rev-b').textContent = '+18% өссөн';

  // Quick actions
  document.getElementById('qa-pending').textContent = DEMO_ORDERS.filter(o=>o.status==='pending').length;
  document.getElementById('qa-payouts').textContent = DEMO_PAYOUTS.length;
  document.getElementById('qa-churn').textContent = '3';
  document.getElementById('qa-new-users').textContent = '12';
  document.getElementById('pay-badge').textContent = DEMO_PAYOUTS.length;
  document.getElementById('ord-badge').textContent = DEMO_ORDERS.filter(o=>o.status==='pending').length||'';

  // Recent orders
  const rows = DEMO_ORDERS.slice(0,5).map(o=>{
    const cls={pending:'bp',confirmed:'bc',shipped:'bc',delivered:'bd',cancelled:'bx'}[o.status]||'bp';
    const lbl={pending:'⏳ Хүлээгдэж буй',confirmed:'✅ Баталгаажсан',shipped:'🚚 Явааны',delivered:'📦 Хүргэгдсэн',cancelled:'❌ Цуцлагдсан'}[o.status];
    return `<tr><td><strong style="font-family:monospace">#${o.id}</strong></td><td>${o.user}</td><td>${o.shop}</td><td><strong>${UI.price(o.total)}</strong></td><td><span class="badge ${cls}">${lbl}</span></td></tr>`;
  }).join('');
  document.getElementById('recent-orders').innerHTML = `<table><thead><tr><th>№</th><th>Хэрэглэгч</th><th>Дэлгүүр</th><th>Дүн</th><th>Төлөв</th></tr></thead><tbody>${rows}</tbody></table>`;

  // Top 5 products
  document.getElementById('top5-products').innerHTML = [
    {name:'Bluetooth чихэвч',sales:156,rev:15444000,emoji:'🎧'},
    {name:'Premium цамц',sales:98,rev:3430000,emoji:'👕'},
    {name:'Нүүрний крем SPF50',sales:87,rev:2436000,emoji:'💄'},
    {name:'Sporty гутал',sales:76,rev:5244000,emoji:'👟'},
    {name:'iPhone case',sales:67,rev:1206000,emoji:'📱'},
  ].map((p,i)=>`<div style="display:flex;align-items:center;gap:12px;padding:10px 18px;border-bottom:1px solid var(--bo-color)">
    <span style="font-size:14px;font-weight:900;color:var(--text-muted);width:20px">${i+1}</span>
    <span style="font-size:22px">${p.emoji}</span>
    <div style="flex:1"><div style="font-size:13px;font-weight:700">${p.name}</div><div style="font-size:11px;color:var(--text-muted)">${p.sales} борлуулалт</div></div>
    <strong style="color:var(--p)">${UI.price(p.rev)}</strong>
  </div>`).join('');

  // Top 5 shops
  document.getElementById('top5-shops').innerHTML = [
    {name:'FashionMN',owner:'Д. Саран',orders:234,rev:8400000},
    {name:'TechUB',owner:'Э. Бат',orders:89,rev:3200000},
    {name:'BeautyMN',owner:'Н. Дарь',orders:156,rev:5600000},
    {name:'SportsMN',owner:'О. Ган',orders:67,rev:2100000},
    {name:'PizzaMN',owner:'Б. Бат',orders:45,rev:1700000},
  ].map((s,i)=>`<div style="display:flex;align-items:center;gap:12px;padding:10px 18px;border-bottom:1px solid var(--bo-color)">
    <span style="font-size:14px;font-weight:900;color:var(--text-muted);width:20px">${i+1}</span>
    <span style="font-size:20px">🏪</span>
    <div style="flex:1"><div style="font-size:13px;font-weight:700">${s.name}</div><div style="font-size:11px;color:var(--text-muted)">${s.owner} · ${s.orders} захиалга</div></div>
    <strong style="color:var(--p)">${UI.price(s.rev)}</strong>
  </div>`).join('');
}

// ══════ DRILL-DOWN ══════
function drillDown(type) {
  const titles = {gmv:'💰 GMV дэлгэрэнгүй',revenue:'📊 Платформ орлого',orders:'🛒 Захиалгын задаргаа',payouts:'💸 Төлбөрийн задаргаа'};
  document.getElementById('drill-title').textContent = titles[type]||'Дэлгэрэнгүй';
  let html = '';
  if(type==='gmv') {
    html = `<div style="margin-bottom:16px"><div style="font-size:28px;font-weight:900;margin-bottom:4px">${UI.price(stats.gmv)}</div><div style="color:var(--text-muted);font-size:13px">Нийт борлуулалтын дүн</div></div>
    <div style="font-size:13px;font-weight:700;margin-bottom:10px">Дэлгүүр тус бүрийн хуваарилалт:</div>
    ${[{name:'FashionMN',pct:35,rev:50960000},{name:'BeautyMN',pct:25,rev:36400000},{name:'TechUB',pct:20,rev:29120000},{name:'SportsMN',pct:12,rev:17472000},{name:'Бусад',pct:8,rev:11648000}].map(s=>
      `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="flex:1"><div style="font-size:13px;font-weight:600">${s.name}</div>
        <div style="height:6px;background:var(--bo-color);border-radius:3px;margin-top:4px;overflow:hidden"><div style="height:100%;width:${s.pct}%;background:var(--p);border-radius:3px"></div></div></div>
        <div style="text-align:right;flex-shrink:0"><div style="font-size:13px;font-weight:900">${UI.price(s.rev)}</div><div style="font-size:11px;color:var(--text-muted)">${s.pct}%</div></div>
      </div>`).join('')}
    <div style="background:rgba(5,150,105,.1);border-radius:10px;padding:12px;margin-top:14px;font-size:12px;color:#059669;font-weight:600">📈 Өмнөх сартай харьцуулахад <strong>+23%</strong> өссөн</div>`;
  } else if(type==='revenue') {
    html = `<div style="margin-bottom:16px"><div style="font-size:28px;font-weight:900;margin-bottom:4px">${UI.price(stats.revenue)}</div><div style="color:var(--text-muted);font-size:13px">Платформын комисс орлого (10%)</div></div>
    <div style="font-size:13px;font-weight:700;margin-bottom:10px">Сарын орлогын хандлага:</div>
    ${MONTHLY.map(m=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bo-color)"><span style="font-size:13px">${m.month}</span><strong>${UI.price(m.revenue*0.1)}</strong></div>`).join('')}`;
  } else if(type==='orders') {
    const statuses = {pending:'⏳',confirmed:'✅',shipped:'🚚',delivered:'📦',cancelled:'❌'};
    const counts = {};
    DEMO_ORDERS.forEach(o=>{counts[o.status]=(counts[o.status]||0)+1;});
    html = `<div style="margin-bottom:16px"><div style="font-size:28px;font-weight:900">${stats.orders.toLocaleString()}</div><div style="color:var(--text-muted);font-size:13px">Нийт захиалга</div></div>
    ${Object.entries(statuses).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--bo-color)"><span>${v} ${k}</span><strong>${counts[k]||0}</strong></div>`).join('')}`;
  } else if(type==='payouts') {
    html = `<div style="margin-bottom:16px"><div style="font-size:28px;font-weight:900;color:var(--p)">${UI.price(stats.pendingPay)}</div><div style="color:var(--text-muted)">Хүлээгдэж буй</div></div>
    <button class="tbtn tbtn-p" style="width:100%;justify-content:center;margin-bottom:14px" onclick="closeDrill();switchTab('payouts')">💸 Бүгдийг харах →</button>`;
  }
  document.getElementById('drill-body').innerHTML = html;
  document.getElementById('drill-modal').classList.add('on');
}
function closeDrill(){document.getElementById('drill-modal').classList.remove('on');}

// ══════ PREDICTIONS ══════
function renderPredictions() {
  // Simple linear regression on monthly data
  const revs = MONTHLY.map(m=>m.revenue);
  const growth = revs.length>=2 ? ((revs[revs.length-1]-revs[revs.length-2])/revs[revs.length-2]*100).toFixed(1) : 0;
  const predicted = Math.round(revs[revs.length-1]*(1+growth/100));

  document.getElementById('pred-revenue').innerHTML = `
    <div class="pred-val pred-up">${UI.price(predicted)}</div>
    <span class="pred-tag pred-tag-up">↑ ${growth}% өсөлтийн хандлага</span>
    <p>Сүүлийн 3 сарын өгөгдөл дээр тулгуурлан <strong>дараагийн сард ${UI.price(predicted)}</strong> орлого орох магадлалтай.</p>
    <p style="margin-top:8px;color:var(--text-muted);font-size:12px">Тооцоо: Linear regression (${revs.map(r=>UI.price(r)).join(' → ')} → ${UI.price(predicted)})</p>`;

  const ords = MONTHLY.map(m=>m.orders);
  const oGrowth = ords.length>=2?((ords[ords.length-1]-ords[ords.length-2])/ords[ords.length-2]*100).toFixed(1):0;
  const predOrders = Math.round(ords[ords.length-1]*(1+oGrowth/100));
  document.getElementById('pred-orders').innerHTML = `
    <div class="pred-val pred-up">${predOrders.toLocaleString()}</div>
    <span class="pred-tag pred-tag-up">↑ ${oGrowth}% өсөлт</span>
    <p>Дараагийн сард <strong>~${predOrders}</strong> захиалга ирэх таамаглалтай.</p>`;

  // AI Recommendations
  const month = new Date().getMonth();
  const recommendations = [
    {ico:'🎯',title:'Хямдрал зарлах цаг боллоо',desc:`${month+1>=10?'Арван нэгдүгээр':'Энэ'} сард борлуулалт буурдаг тул 10-15% хямдрал зарлахыг зөвлөж байна.`,tag:'pred-tag-info'},
    {ico:'📢',title:'Affiliate идэвхжүүлэх',desc:'Борлуулагчдын 60% нь сүүлийн 14 хоногт идэвхгүй. Урамшуулал зарлаж идэвхжүүлэх хэрэгтэй.',tag:'pred-tag-dn'},
    {ico:'🚚',title:'Хүргэлтийн хурд сайжруулах',desc:'Дундаж хүргэлт 3.2 цаг. Жолоочийн тоог нэмэгдүүлбэл 2 цаг болгох боломжтой.',tag:'pred-tag-up'},
    {ico:'💰',title:'ТОП бараа stock нэмэх',desc:'Bluetooth чихэвч, Premium цамц хамгийн их зарагддаг — нөөц дуусахаас урьдчилан анхааруулах.',tag:'pred-tag-info'},
  ];
  document.getElementById('pred-recommendations').innerHTML = recommendations.map(r=>
    `<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--bo-color)">
      <span style="font-size:24px;flex-shrink:0">${r.ico}</span>
      <div><div style="font-size:14px;font-weight:700;margin-bottom:4px">${r.title}</div><div style="font-size:13px;color:var(--text-sub);line-height:1.6">${r.desc}</div></div>
    </div>`).join('');

  // Monthly trend chart (CSS bars)
  const maxRev = Math.max(...revs, predicted);
  document.getElementById('monthly-trend').innerHTML = `
    <div class="trend-bar">${[...MONTHLY,{month:'Дараа сар (таамаг)',revenue:predicted}].map((m,i)=>{
      const h = Math.round(m.revenue/maxRev*100);
      const isP = i===MONTHLY.length;
      return `<div style="flex:1;text-align:center">
        <div style="height:120px;display:flex;align-items:flex-end">
          <div style="width:100%;height:${h}%;background:${isP?'var(--a)':'var(--p)'};border-radius:6px 6px 0 0;${isP?'opacity:.6;border:2px dashed var(--a)':''}"></div>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px">${m.month}</div>
        <div style="font-size:12px;font-weight:700;margin-top:2px">${UI.price(m.revenue)}</div>
      </div>`;
    }).join('')}</div>`;
}

// ══════ BEHAVIOR ══════
function renderBehavior() {
  document.getElementById('bh-active').textContent = '4,230';
  document.getElementById('bh-churn').textContent = '23';
  document.getElementById('bh-top-page').textContent = 'Дэлгүүр';
  document.getElementById('bh-avg-order').textContent = '2.3';

  // Churn list
  const churns = [
    {name:'Д. Саран',role:'seller',lastActive:'14 хоногийн өмнө',reason:'Бараа нэмээгүй'},
    {name:'Б. Болд',role:'affiliate',lastActive:'21 хоногийн өмнө',reason:'Линк хуваалцаагүй'},
    {name:'О. Ган',role:'delivery',lastActive:'10 хоногийн өмнө',reason:'Хүргэлт аваагүй'},
  ];
  document.getElementById('churn-list').innerHTML = churns.map(c=>`
    <div style="display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--bo-color)">
      <div style="width:8px;height:8px;border-radius:50%;background:#D97706;flex-shrink:0"></div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700">${c.name} <span class="badge bp" style="font-size:10px">${c.role}</span></div>
        <div style="font-size:11px;color:var(--text-muted)">${c.reason} · ${c.lastActive}</div>
      </div>
      <button class="tbtn tbtn-g" style="font-size:11px;padding:5px 10px" onclick="UI.toast('📧 Мэдэгдэл илгээгдлээ')">📧 Мэдэгдэл</button>
    </div>`).join('');

  // Heatmap
  const pages = [
    {name:'Дэлгүүр',visits:4523,color:'#DC2626'},
    {name:'Бараа',visits:3210,color:'#EA580C'},
    {name:'Самбар',visits:2100,color:'#D97706'},
    {name:'Checkout',visits:1560,color:'#CA8A04'},
    {name:'Login',visits:1200,color:'#65A30D'},
    {name:'Seller',visits:890,color:'#059669'},
    {name:'Affiliate',visits:650,color:'#0891B2'},
    {name:'Creator',visits:420,color:'#2563EB'},
  ];
  document.getElementById('heatmap').innerHTML = pages.map(p=>{
    const opacity = Math.max(0.15, p.visits/4523);
    return `<div class="hm-cell" style="background:${p.color};opacity:${opacity};color:#fff">
      <div class="hm-val">${p.visits.toLocaleString()}</div>
      <div class="hm-label">${p.name}</div>
    </div>`;
  }).join('');
}

// ══════ AI CHATBOT ══════
function askAI(q) {
  if(!q||!q.trim()) return;
  const input = document.getElementById('chat-input');
  input.value = '';

  // Add user message
  const body = document.getElementById('chat-body');
  body.innerHTML += `<div class="chat-msg user"><div class="msg-av">👤</div><div class="msg-bubble">${q}</div></div>`;

  // Generate answer based on data
  setTimeout(()=>{
    const answer = generateAnswer(q);
    body.innerHTML += `<div class="chat-msg bot"><div class="msg-av">🤖</div><div class="msg-bubble">${answer}</div></div>`;
    body.scrollTop = body.scrollHeight;
  }, 800);
  body.scrollTop = body.scrollHeight;
}

function generateAnswer(q) {
  const ql = q.toLowerCase();
  if(ql.includes('орлого')||ql.includes('ашиг')||ql.includes('revenue'))
    return `📊 <strong>Нийт GMV:</strong> ${UI.price(stats.gmv)}<br><strong>Платформ орлого:</strong> ${UI.price(stats.revenue)} (10% комисс)<br><strong>Өмнөх сартай:</strong> +18% өссөн<br><br>💡 Орлого тогтвортой өсч байна. Affiliate системийг идэвхжүүлбэл нэмж 15-20% өсгөх боломжтой.`;
  if(ql.includes('бараа')||ql.includes('топ')||ql.includes('product'))
    return `🏆 <strong>ТОП 5 бараа:</strong><br>1. 🎧 Bluetooth чихэвч — 156 борлуулалт<br>2. 👕 Premium цамц — 98<br>3. 💄 Нүүрний крем — 87<br>4. 👟 Sporty гутал — 76<br>5. 📱 iPhone case — 67<br><br>💡 Электроник ангилал хамгийн их эрэлттэй. Stock нэмэхийг зөвлөж байна.`;
  if(ql.includes('affiliate')||ql.includes('борлуулагч'))
    return `📢 <strong>Affiliate систем:</strong><br>• Нийт борлуулагч: ${stats.affiliates}<br>• Идэвхтэй: ~60%<br>• Affiliate-р ирсэн захиалга: ~25%<br><br>⚠️ 40% нь идэвхгүй. Урамшуулал зарлахыг зөвлөж байна.`;
  if(ql.includes('таамаг')||ql.includes('predict')||ql.includes('дараа'))
    return `🔮 <strong>Дараагийн сарын таамаглал:</strong><br>• Орлого: ${UI.price(Math.round(stats.gmv*1.17))} (+17%)<br>• Захиалга: ~1,460<br>• Шинэ хэрэглэгч: ~280<br><br>💡 Өсөлтийн хандлага тогтвортой. Хямдрал зарлахгүй байхыг зөвлөж байна — organic өсөлт сайн.`;
  if(ql.includes('хэрэглэгч')||ql.includes('user'))
    return `👥 <strong>Хэрэглэгчид:</strong><br>• Нийт: ${stats.users.toLocaleString()}<br>• Дэлгүүр эзэн: ${stats.shops}<br>• Борлуулагч: ${stats.affiliates}<br>• Жолооч: ${stats.drivers}<br><br>📈 Сүүлийн 7 хоногт 12 шинэ бүртгэл.`;
  return `Би таны асуултыг ойлголоо. Одоогоор дараах мэдээллийг өгөх боломжтой:<br><br>
    <button class="chat-suggest" onclick="askAI('Нийт орлого')">💰 Орлого</button>
    <button class="chat-suggest" onclick="askAI('ТОП бараа')">🏆 ТОП бараа</button>
    <button class="chat-suggest" onclick="askAI('Affiliate тайлан')">📢 Affiliate</button>
    <button class="chat-suggest" onclick="askAI('Дараагийн сарын таамаглал')">🔮 Таамаглал</button>`;
}

// ══════ ORDERS ══════
async function loadRealOrders(){
  if(realOrders) return realOrders;
  try{const d=await OrdersAPI.list({limit:100});const list=d.orders||d||[];if(list.length){realOrders=list.map(o=>({id:o.orderNumber||o._id?.slice(-5),_id:o._id,user:o.user?.name||'—',shop:o.items?.[0]?.product?.store?.name||'—',items:o.items?.map(i=>`${i.product?.name||'?'} x${i.quantity||1}`).join(', ')||'—',total:o.total||0,status:o.status||'pending',date:new Date(o.createdAt).toLocaleDateString('mn-MN')}));return realOrders;}}catch{}
  return DEMO_ORDERS;
}
function renderOrdersTable(orders){
  const smap={pending:['bp','⏳ Хүлээгдэж буй'],confirmed:['bc','✅ Баталгаажсан'],shipped:['bc','🚚 Явааны'],delivered:['bd','📦 Хүргэгдсэн'],cancelled:['bx','❌ Цуцлагдсан']};
  const rows=orders.map(o=>{const [cls,lbl]=smap[o.status]||['bp',o.status];
    const opts=['pending','confirmed','shipped','delivered','cancelled'].map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${(smap[s]||['',s])[1]}</option>`).join('');
    return `<tr><td><strong style="font-family:monospace">#${o.id}</strong></td><td>${o.user}</td><td>${o.shop}</td><td>${o.items||''}</td><td><strong>${UI.price(o.total)}</strong></td><td><span class="badge ${cls}">${lbl}</span></td><td><select onchange="updateOrderStatus('${o.id}',this.value)" style="border:1.5px solid var(--bo-color);border-radius:6px;padding:4px 8px;font-size:11px;font-family:inherit;outline:none;background:var(--bg-input);color:var(--text-main)">${opts}</select></td><td style="font-size:11px;color:var(--text-muted)">${o.date}</td></tr>`;
  }).join('');
  document.getElementById('orders-table').innerHTML=`<div style="overflow-x:auto"><table><thead><tr><th>№</th><th>Хэрэглэгч</th><th>Дэлгүүр</th><th>Бараа</th><th>Дүн</th><th>Төлөв</th><th>Өөрчлөх</th><th>Огноо</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
async function filterOrdersTable(status){const o=await loadRealOrders();renderOrdersTable(status?o.filter(x=>x.status===status):o);document.querySelectorAll('.filter-bar .fbtn').forEach(b=>{b.classList.toggle('on',!status&&b.textContent.includes('Бүгд')||b.textContent.toLowerCase().includes(status))});}
async function updateOrderStatus(id,status){try{const o=realOrders?.find(x=>x.id===id||x._id===id);if(o?._id)await OrdersAPI.updateStatus(o._id,status);UI.toast(`✅ #${id} → ${status}`);}catch{UI.toast(`✅ #${id} → ${status} (demo)`);}};

// ══════ PAYOUTS ══════
function renderPayouts(){
  const rl={affiliate:'📢 Борлуулагч',seller:'🏪 Дэлгүүр',delivery:'🚚 Жолооч'};
  document.getElementById('payouts-list').innerHTML=DEMO_PAYOUTS.length?DEMO_PAYOUTS.map(p=>`<div class="payout-card"><div class="payout-av">${p.av}</div><div class="payout-info"><div class="pi-name">${p.name} <span class="badge bc" style="font-size:10px">${rl[p.role]||p.role}</span></div><div class="pi-bank">${p.bank} ${p.account}</div></div><div class="payout-amt">${UI.price(p.amount)}</div><div class="payout-actions"><button class="pabtn pa-approve" onclick="approvePayout('${p.id}')">✅ Батлах</button><button class="pabtn pa-reject" onclick="rejectPayout('${p.id}')">✕</button></div></div>`).join(''):'<div class="loading">Хүсэлт байхгүй</div>';
  document.getElementById('payout-history').innerHTML=`<table><thead><tr><th>Хэрэглэгч</th><th>Дүн</th><th>Банк</th><th>Огноо</th><th>Төлөв</th></tr></thead><tbody><tr><td>Г. Энхбаяр</td><td>${UI.price(120000)}</td><td>Голомт</td><td>2024-01-13</td><td><span class="badge bd">✅ Шилжүүлэгдсэн</span></td></tr></tbody></table>`;
}
function approvePayout(id){UI.toast(`✅ ${id} батлагдлаа`);}
function rejectPayout(id){UI.toast(`❌ ${id} цуцлагдлаа`,'error');}
function approveAll(){if(UI.confirm(`${DEMO_PAYOUTS.length} хүсэлтийг бүгдийг батлах уу?`)){UI.toast(`✅ ${DEMO_PAYOUTS.length} хүсэлт батлагдлаа`);}}

// ══════ COMMISSION ══════
const CAT_DEFAULTS={fashion:{seller:70,affiliate:10,platform:13,delivery:7,label:'👗 Хувцас'},electronics:{seller:72,affiliate:5,platform:16,delivery:7,label:'📱 Электроник'},food:{seller:65,affiliate:8,platform:17,delivery:10,label:'🍔 Хоол'},beauty:{seller:68,affiliate:12,platform:13,delivery:7,label:'💄 Гоо сайхан'},home:{seller:70,affiliate:10,platform:13,delivery:7,label:'🏡 Гэр'},sports:{seller:70,affiliate:10,platform:13,delivery:7,label:'⚽ Спорт'}};
let catRates=JSON.parse(JSON.stringify(CAT_DEFAULTS));
function switchCommTab(t){['global','category','sim'].forEach(id=>{const p=document.getElementById('cpane-'+id);if(p)p.style.display=id===t?'':'none';document.getElementById('ctab-'+id)?.classList.toggle('on',id===t)});if(t==='category')renderCatCommGrid();if(t==='sim')simulate();}
function updateTotal(){const v=['c-shop','c-affiliate','c-platform','c-delivery'].reduce((s,id)=>s+(parseFloat(document.getElementById(id).value)||0),0);const el=document.getElementById('comm-total');el.textContent=v===100?`✅ Нийт: ${v}%`:`⚠️ Нийт: ${v}% — 100% байх ёстой`;el.className='comm-total '+(v===100?'ok':'err');}
async function saveCommission(){const total=['c-shop','c-affiliate','c-platform','c-delivery'].reduce((s,id)=>s+(parseFloat(document.getElementById(id).value)||0),0);if(total!==100){UI.toast('Нийт 100% байх ёстой!','error');return;}try{await AdminAPI.updateCommission({seller:+document.getElementById('c-shop').value,affiliate:+document.getElementById('c-affiliate').value,platform:+document.getElementById('c-platform').value,delivery:+document.getElementById('c-delivery').value});UI.toast('✅ Комисс хадгалагдлаа');}catch{UI.toast('✅ Хадгалагдлаа (demo)');}}
function resetCommission(){document.getElementById('c-shop').value='70';document.getElementById('c-affiliate').value='15';document.getElementById('c-platform').value='10';document.getElementById('c-delivery').value='5';updateTotal();}
function renderCatCommGrid(){document.getElementById('cat-comm-grid').innerHTML=Object.entries(catRates).map(([cat,r])=>{const t=r.seller+r.affiliate+r.platform+r.delivery;return `<div class="cat-comm-card"><div class="cat-header"><span>${r.label.split(' ')[0]}</span><div><div class="cat-title">${r.label.split(' ').slice(1).join(' ')}</div></div></div>${['seller','affiliate','platform','delivery'].map(f=>`<div class="cat-row"><label>${{seller:'🏪 Дэлгүүр',affiliate:'📢 Affiliate',platform:'🏢 Платформ',delivery:'🚚 Жолооч'}[f]}</label><div style="display:flex;align-items:center;gap:3px"><input type="number" min="0" max="100" value="${r[f]}" id="cat-${cat}-${f}" oninput="catTotalUpdate('${cat}')">%</div></div>`).join('')}<div class="cat-total ${t===100?'ok':'err'}" id="catotal-${cat}">${t===100?'✅':'⚠️'} Нийт: ${t}%</div></div>`;}).join('');}
function catTotalUpdate(cat){const fs=['seller','affiliate','platform','delivery'];const t=fs.reduce((s,f)=>s+(parseFloat(document.getElementById(`cat-${cat}-${f}`)?.value)||0),0);const el=document.getElementById(`catotal-${cat}`);if(el){el.textContent=(t===100?'✅':'⚠️')+` Нийт: ${t}%`;el.className='cat-total '+(t===100?'ok':'err');}fs.forEach(f=>{if(catRates[cat])catRates[cat][f]=parseFloat(document.getElementById(`cat-${cat}-${f}`)?.value)||0;});}
async function saveCatCommission(){const errors=Object.keys(catRates).filter(cat=>{const t=['seller','affiliate','platform','delivery'].reduce((s,f)=>s+(parseFloat(document.getElementById(`cat-${cat}-${f}`)?.value)||0),0);return t!==100;});if(errors.length){UI.toast(`${errors.length} ангилал 100% биш!`,'error');return;}try{await AdminAPI.updateCommissionCategories(catRates);UI.toast('✅ Хадгалагдлаа');}catch{UI.toast('✅ Хадгалагдлаа (demo)');}}
function resetCatCommission(){catRates=JSON.parse(JSON.stringify(CAT_DEFAULTS));renderCatCommGrid();}
function simulate(){const price=parseFloat(document.getElementById('sim-price')?.value||100000);const sel=document.getElementById('sim-cat')?.value||'global';let rates;if(sel==='global'){rates={seller:+document.getElementById('c-shop')?.value||70,affiliate:+document.getElementById('c-affiliate')?.value||15,platform:+document.getElementById('c-platform')?.value||10,delivery:+document.getElementById('c-delivery')?.value||5};}else{rates=catRates[sel]||{seller:70,affiliate:15,platform:10,delivery:5};}
document.getElementById('sim-result').innerHTML=[{who:'🏪 Дэлгүүр',key:'seller',color:'var(--p)'},{who:'📢 Affiliate',key:'affiliate',color:'#059669'},{who:'🏢 Платформ',key:'platform',color:'#D97706'},{who:'🚚 Жолооч',key:'delivery',color:'#DC2626'}].map(p=>`<div style="background:var(--bg-card);border:1.5px solid var(--bo-color);border-radius:12px;padding:16px;text-align:center"><div style="font-size:20px;margin-bottom:4px">${p.who.split(' ')[0]}</div><div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">${p.who.split(' ').slice(1).join(' ')}</div><div style="font-size:20px;font-weight:900;color:${p.color}">${UI.price(price*rates[p.key]/100)}</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px">${rates[p.key]}%</div></div>`).join('');}

// ══════ USERS / SHOPS / AFFILIATES / REPORTS ══════
async function loadUsers(el,role){document.querySelectorAll('.rtab').forEach(b=>b.classList.remove('on'));if(el)el.classList.add('on');try{const d=await AdminAPI.getUsers({limit:100});const u=d.users||d||[];if(u.length)allUsers=u.map(x=>({name:x.name,email:x.email,role:x.role,joined:new Date(x.createdAt).toLocaleDateString('mn-MN'),orders:x.orderCount||0,spent:x.totalSpent||0}));}catch{}const filtered=role==='all'?allUsers:allUsers.filter(u=>u.role===role);renderUsers(filtered);}
function renderUsers(users){const rm={buyer:'🛍️ Худалдан авагч',seller:'🏪 Дэлгүүр',affiliate:'📢 Борлуулагч',delivery:'🚚 Жолооч',admin:'🔧 Админ'};document.getElementById('users-table').innerHTML=`<table><thead><tr><th>Хэрэглэгч</th><th>Үүрэг</th><th>Захиалга</th><th>Зарцуулалт</th><th>Нэгдсэн</th></tr></thead><tbody>${users.map(u=>`<tr><td><strong>${u.name}</strong><br><span style="font-size:11px;color:var(--text-muted)">${u.email}</span></td><td><span class="badge bc">${rm[u.role]||u.role}</span></td><td>${u.orders}</td><td>${u.spent?UI.price(u.spent):'—'}</td><td style="font-size:12px;color:var(--text-muted)">${u.joined}</td></tr>`).join('')}</tbody></table>`;document.getElementById('ut-all').textContent=`(${allUsers.length})`;}
function renderShops(){const shops=[{name:'FashionMN',owner:'Д. Саран',products:47,orders:234,revenue:8400000,status:'active'},{name:'TechUB',owner:'Э. Бат',products:23,orders:89,revenue:3200000,status:'active'},{name:'BeautyMN',owner:'Н. Дарь',products:31,orders:156,revenue:5600000,status:'active'},{name:'SportsMN',owner:'О. Ган',products:18,orders:67,revenue:2100000,status:'pending'}];document.getElementById('shops-table').innerHTML=`<table><thead><tr><th>Дэлгүүр</th><th>Эзэн</th><th>Бараа</th><th>Захиалга</th><th>Орлого</th><th>Төлөв</th></tr></thead><tbody>${shops.map(s=>`<tr><td><strong>🏪 ${s.name}</strong></td><td>${s.owner}</td><td>${s.products}</td><td>${s.orders}</td><td><strong>${UI.price(s.revenue)}</strong></td><td><span class="badge ${s.status==='active'?'bd':'bp'}">${s.status==='active'?'✅ Идэвхтэй':'⏳ Хянагдаж буй'}</span></td></tr>`).join('')}</tbody></table>`;}
function renderAffiliates(){const affs=[{name:'Б. Болд',username:'bold123',links:8,clicks:891,sales:34,earned:215000},{name:'Э. Нарантуяа',username:'narantuya',links:12,clicks:2341,sales:89,earned:780000},{name:'Б. Дэлгэрмаа',username:'delger',links:15,clicks:3890,sales:156,earned:1240000}];document.getElementById('affiliates-table').innerHTML=`<table><thead><tr><th>Борлуулагч</th><th>Линк</th><th>Клик</th><th>Борлуулалт</th><th>Орлого</th><th>CVR</th></tr></thead><tbody>${affs.map(a=>`<tr><td><strong>${a.name}</strong><br><span style="font-size:11px;color:var(--text-muted)">@${a.username}</span></td><td>${a.links}</td><td>${a.clicks.toLocaleString()}</td><td>${a.sales}</td><td><strong style="color:#059669">${UI.price(a.earned)}</strong></td><td>${(a.sales/a.clicks*100).toFixed(1)}%</td></tr>`).join('')}</tbody></table>`;}
function renderReports(){document.getElementById('report-revenue').innerHTML=[{m:'10-сар',r:8900000},{m:'11-сар',r:12400000},{m:'12-сар',r:14560000}].map(x=>`<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:13px">${x.m}</span><strong>${UI.price(x.r)}</strong></div><div style="height:8px;background:var(--bo-color);border-radius:4px;overflow:hidden"><div style="height:100%;width:${x.r/14560000*100}%;background:var(--p);border-radius:4px"></div></div></div>`).join('');
document.getElementById('report-split').innerHTML=[{who:'🏪 Дэлгүүр',pct:70,color:'var(--p)'},{who:'📢 Борлуулагч',pct:15,color:'#059669'},{who:'🏢 Платформ',pct:10,color:'#D97706'},{who:'🚚 Жолооч',pct:5,color:'#DC2626'}].map(s=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div style="width:12px;height:12px;border-radius:50%;background:${s.color}"></div><span style="flex:1;font-size:13px">${s.who}</span><strong>${s.pct}%</strong><strong style="color:${s.color}">${UI.price(14560000*s.pct/100)}</strong></div>`).join('');}

function refreshAll(){loadDashboard();document.getElementById('last-update').textContent='Сүүлд: '+new Date().toLocaleTimeString('mn-MN');UI.toast('✅ Шинэчлэгдлээ');}

// ══════ INIT ══════
loadDashboard();
