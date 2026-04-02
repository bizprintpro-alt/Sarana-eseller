if (!requireAuth('delivery', 'admin')) {}

const user = Auth.getUser();
document.getElementById('nav-name').textContent = '👤 ' + (user?.name || 'Жолооч');

let isOnline = false, allOrders = [], curFilter = 'all';

function toggleOnline() {
  isOnline = !isOnline;
  const track = document.getElementById('toggle-track');
  const bar   = document.getElementById('status-bar');
  track.classList.toggle('on', isOnline);
  bar.classList.toggle('online', isOnline);
  document.getElementById('toggle-label').textContent  = isOnline ? 'Онлайн' : 'Офлайн';
  document.getElementById('status-text').textContent   = isOnline ? 'Захиалга хүлээн авч байна — Идэвхтэй!' : 'Ажлын өдрийн мэнд! Онлайн болж захиалга хүлээн аваарай.';
  document.getElementById('online-pill').style.display = isOnline ? 'inline-flex' : 'none';
  if (isOnline) {
    UI.toast('✅ Та онлайн боллоо! Захиалга хүлээн авч байна 🚚');
    loadOrders();
  }
}

const smap = {
  confirmed: ['bp','⏳ Хүлээгдэж буй'],
  shipped:   ['bc','🚚 Явааны'],
  delivered: ['bd','✅ Хүргэсэн'],
  pending:   ['bp','📋 Хүлээгдэж буй'],
  cancelled: ['bx','❌ Цуцлагдсан']
};

function filterOrders(el, f) {
  document.querySelectorAll('.fb').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  curFilter = f;
  renderOrders();
}

function renderOrders() {
  const filtered = curFilter === 'all' ? allOrders : allOrders.filter(o => o.status === curFilter);
  if (!filtered.length) {
    document.getElementById('olist').innerHTML = `
      <div class="empty-state">
        <div class="ei">📭</div>
        <h3>Захиалга байхгүй байна</h3>
        <p>${isOnline ? 'Шинэ захиалга хүлээж байна...' : 'Онлайн болж захиалга хүлээн аваарай'}</p>
      </div>`;
    return;
  }
  document.getElementById('olist').innerHTML = filtered.map(o => {
    const [cls, lbl] = smap[o.status] || ['bp', o.status];
    const city = o.delivery?.address?.city || 'Улаанбаатар';
    const dist = o.delivery?.address?.district || '';
    const addr = [city, dist].filter(Boolean).join(', ');
    const phone = o.user?.phone ? `📞 ${o.user.phone}` : '';
    const earn  = (o.total || 0) * 0.08;
    const items = o.items?.map(i => i.product?.name || i.name || '').filter(Boolean).slice(0, 2).join(', ') || '';

    const actions = o.status === 'confirmed'
      ? `<button class="action-btn btn-pick" onclick="changeStatus('${o._id}','shipped')">🚚 Авлаа</button>`
      : o.status === 'shipped'
      ? `<button class="action-btn btn-done" onclick="changeStatus('${o._id}','delivered')">✅ Хүргэлээ</button>`
      : '';

    return `
      <div class="ocard ${o.status}">
        <div class="oc-info">
          <div class="oc-num">
            #${o.orderNumber || o._id?.slice(-6) || '—'}
            <span class="oc-badge ${cls}">${lbl}</span>
          </div>
          <div class="oc-addr">📍 ${addr || 'Хаяг байхгүй'}</div>
          ${phone ? `<div class="oc-meta">${phone}</div>` : ''}
          <div class="oc-meta">${o.user?.name || '—'} · ${new Date(o.createdAt).toLocaleString('mn-MN')}</div>
          ${items ? `<div class="oc-items">📦 ${items}</div>` : ''}
        </div>
        <div class="oc-right">
          <div>
            <div class="oc-price">${UI.price(o.total || 0)}</div>
            <div class="oc-earn">+${UI.price(earn)} орлого</div>
          </div>
          ${actions}
        </div>
      </div>`;
  }).join('');
}

async function changeStatus(id, status) {
  try {
    await OrdersAPI.updateStatus(id, status);
    UI.toast(status === 'shipped' ? '🚚 Захиалга авлаа!' : '✅ Хүргэлт амжилттай бүртгэгдлээ!');
    loadOrders();
  } catch (e) {
    UI.toast('Алдаа: ' + e.message, 'error');
  }
}

async function loadOrders() {
  try {
    const d = await OrdersAPI.list();
    allOrders = d.orders || d || [];
    const active = allOrders.filter(o => o.status === 'shipped').length;
    const done   = allOrders.filter(o => o.status === 'delivered').length;
    const earn   = allOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0) * 0.08, 0);
    document.getElementById('s-total').textContent  = allOrders.length;
    document.getElementById('s-active').textContent = active;
    document.getElementById('s-done').textContent   = done;
    document.getElementById('s-earn').textContent   = UI.price(earn);
    renderOrders();
  } catch (e) {
    document.getElementById('olist').innerHTML = `
      <div class="empty-state">
        <div class="ei">⚠️</div>
        <h3>Алдаа гарлаа</h3>
        <p>${e.message}</p>
      </div>`;
  }
}

loadOrders();
