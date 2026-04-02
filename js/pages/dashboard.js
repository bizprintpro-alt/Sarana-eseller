if (!requireAuth()) {}

const user = Auth.getUser();
const initials = user?.name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
document.getElementById('sb-av').textContent   = initials;
document.getElementById('sb-name').textContent = user?.name || 'Хэрэглэгч';
document.getElementById('sb-role').textContent = {buyer:'Худалдан авагч', seller:'Борлуулагч', delivery:'Жолооч', admin:'Админ'}[user?.role] || user?.role || '';
document.getElementById('pg-title').textContent = `Өдрийн мэнд, ${user?.name?.split(' ')[0] || ''}! 👋`;

const roleLink = document.getElementById('role-link');
const roleIcons = { seller: '🏪', affiliate: '📢', delivery: '🚚', admin: '🔧' };
if (user?.role === 'buyer') {
  roleLink.style.display = 'none'; // buyer's home IS this dashboard
} else {
  roleLink.href = roleHome(user?.role);
  roleLink.querySelector('.sbi').textContent = roleIcons[user?.role] || '🎯';
  roleLink.querySelector('span:last-child') && (roleLink.lastChild.textContent = '');
}

const statusMap = {
  pending:   ['s-pending',   '⏳ Хүлээгдэж буй'],
  confirmed: ['s-confirmed', '✅ Баталгаажсан'],
  shipped:   ['s-shipped',   '🚚 Явааны'],
  delivered: ['s-delivered', '📦 Хүргэгдсэн'],
  cancelled: ['s-cancelled', '❌ Цуцлагдсан']
};

async function loadDash() {
  try {
    const data   = await OrdersAPI.list();
    const orders = data.orders || data || [];
    const total   = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const done    = orders.filter(o => o.status === 'delivered').length;
    const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);

    document.getElementById('s-orders').textContent  = total;
    document.getElementById('s-revenue').textContent = UI.price(revenue);
    document.getElementById('s-pending').textContent = pending;
    document.getElementById('s-done').textContent    = done;
    renderTable(orders.slice(0, 12));
  } catch (e) {
    document.getElementById('orders-wrap').innerHTML = `<div class="loading-box">Өгөгдөл ачаалахад алдаа гарлаа:<br><small>${e.message}</small></div>`;
  }
}

function renderTable(orders) {
  if (!orders.length) {
    document.getElementById('orders-wrap').innerHTML = '<div class="loading-box">📭 Захиалга байхгүй байна</div>';
    return;
  }
  const rows = orders.map(o => {
    const [cls, label] = statusMap[o.status] || ['s-pending', o.status];
    return `<tr>
      <td><strong style="font-family:monospace;font-size:12px">#${o.orderNumber || o._id?.slice(-6) || '—'}</strong></td>
      <td>${o.user?.name || o.buyer?.name || '—'}</td>
      <td><strong>${UI.price(o.total || 0)}</strong></td>
      <td><span class="status ${cls}">${label}</span></td>
      <td style="color:var(--t3)">${new Date(o.createdAt).toLocaleDateString('mn-MN')}</td>
    </tr>`;
  }).join('');
  document.getElementById('orders-wrap').innerHTML = `
    <table>
      <thead><tr><th>Дугаар</th><th>Хэрэглэгч</th><th>Дүн</th><th>Төлөв</th><th>Огноо</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

loadDash();
