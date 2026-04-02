/* ══════════════════════════════════════════════════════════════
   eseller.mn — API Client v4
   Backend: https://sarana-backend.onrender.com/api

   Modules: Auth, ProductsAPI, OrdersAPI, PaymentAPI,
            AffiliateAPI, WalletAPI, AdminAPI, Cart, Ref, UI
   ══════════════════════════════════════════════════════════════ */

const API_BASE = 'https://sarana-backend.onrender.com/api';

/* ── HTTP Helper ─────────────────────────────────────────────── */
async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, message: data.message || 'Алдаа гарлаа', data };
  return data;
}

/* ══════════════════════════════════════════════════════════════
   AUTH
   ══════════════════════════════════════════════════════════════ */
const Auth = {
  async register(name, email, password, role) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
    if (data.token) { this._save(data); }
    return data;
  },

  async login(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) { this._save(data); }
    return data;
  },

  async me() { return apiFetch('/auth/me'); },

  _save(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user || data));
  },

  getUser() {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  },

  getToken()    { return localStorage.getItem('token'); },
  isLoggedIn()  { return !!localStorage.getItem('token'); },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
  }
};

/* ══════════════════════════════════════════════════════════════
   PRODUCTS API
   ══════════════════════════════════════════════════════════════ */
const ProductsAPI = {
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch('/products' + (qs ? '?' + qs : ''));
  },
  async get(id)              { return apiFetch('/products/' + id); },
  async create(data)         { return apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }); },
  async update(id, data)     { return apiFetch('/products/' + id, { method: 'PUT', body: JSON.stringify(data) }); },
  async delete(id)           { return apiFetch('/products/' + id, { method: 'DELETE' }); },
};
// Alias for backward compat
const Products = ProductsAPI;

/* ══════════════════════════════════════════════════════════════
   ORDERS API
   ══════════════════════════════════════════════════════════════ */
const OrdersAPI = {
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch('/orders' + (qs ? '?' + qs : ''));
  },
  async create(data) {
    // Автоматаар referral code оруулах
    const ref = Ref.get();
    if (ref && !data.referralCode) data.referralCode = ref;
    return apiFetch('/orders', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateStatus(id, status) {
    return apiFetch('/orders/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status }) });
  }
};
const Orders = OrdersAPI;

/* ══════════════════════════════════════════════════════════════
   PAYMENT API
   ══════════════════════════════════════════════════════════════ */
const PaymentAPI = {
  async createQPay(data) {
    return apiFetch('/payment/qpay/create', { method: 'POST', body: JSON.stringify(data) });
  },
  async checkQPay(invoiceId) {
    return apiFetch('/payment/qpay/check/' + invoiceId);
  }
};
const Payment = PaymentAPI;

/* ══════════════════════════════════════════════════════════════
   AFFILIATE API — Борлуулагчийн систем
   ══════════════════════════════════════════════════════════════ */
const AffiliateAPI = {
  // ✅ Бэлэн
  async getLinks()           { return apiFetch('/affiliate/links'); },
  async getEarnings()        { return apiFetch('/affiliate/earnings'); },
  async createLink(productId){ return apiFetch('/affiliate/link', { method: 'POST', body: JSON.stringify({ productId }) }); },

  // ❌ Backend хүлээгдэж буй
  async trackClick(linkId)   { return apiFetch('/affiliate/click', { method: 'POST', body: JSON.stringify({ linkId }) }); },
  async getProfile(username) { return apiFetch('/affiliate/profile/' + username); },
  async updateProfile(data)  { return apiFetch('/affiliate/profile', { method: 'PUT', body: JSON.stringify(data) }); },
};
const Affiliate = AffiliateAPI;

/* ══════════════════════════════════════════════════════════════
   WALLET API
   ══════════════════════════════════════════════════════════════ */
const WalletAPI = {
  async get()                     { return apiFetch('/wallet'); },
  async withdraw(amount, method)  { return apiFetch('/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount, method }) }); },
};
const Wallet = WalletAPI;

/* ══════════════════════════════════════════════════════════════
   ADMIN API
   ══════════════════════════════════════════════════════════════ */
const AdminAPI = {
  async getStats()       { return apiFetch('/admin/stats'); },
  async getUsers(p = {}) { const qs = new URLSearchParams(p).toString(); return apiFetch('/admin/users' + (qs ? '?' + qs : '')); },
  async getCommission()  { return apiFetch('/admin/commission'); },
  async updateCommission(data) { return apiFetch('/admin/commission', { method: 'PUT', body: JSON.stringify(data) }); },
  // ❌ Backend хүлээгдэж буй
  async getCommissionCategories()          { return apiFetch('/admin/commission/categories'); },
  async updateCommissionCategories(data)   { return apiFetch('/admin/commission/categories', { method: 'PUT', body: JSON.stringify(data) }); },
};
const Admin = AdminAPI;

/* ══════════════════════════════════════════════════════════════
   CART — Local Storage сагс
   ══════════════════════════════════════════════════════════════ */
const Cart = {
  _key: 'eseller_cart',

  get()      { try { return JSON.parse(localStorage.getItem(this._key)) || []; } catch { return []; } },
  getItems() { return this.get(); },

  save(items) {
    localStorage.setItem(this._key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cart:updated'));
    window.dispatchEvent(new CustomEvent('cart-updated'));
  },

  add(product, qty = 1) {
    const items = this.get();
    const idx = items.findIndex(i => i._id === product._id);
    if (idx >= 0) items[idx].qty += qty;
    else items.push({ ...product, qty });
    this.save(items);
  },

  updateQty(id, qty) {
    const items = this.get();
    const idx = items.findIndex(i => i._id === id);
    if (idx >= 0) {
      if (qty <= 0) items.splice(idx, 1);
      else items[idx].qty = qty;
    }
    this.save(items);
  },

  remove(id) { this.save(this.get().filter(i => i._id !== id)); },
  clear()    { localStorage.removeItem(this._key); this.save([]); },

  count()    { return this.get().reduce((s, i) => s + (i.qty || 1), 0); },
  getCount() { return this.count(); },

  total()    { return this.get().reduce((s, i) => s + ((i.salePrice || i.price) * (i.qty || 1)), 0); },
  getTotal() { return this.total(); },
};

/* ══════════════════════════════════════════════════════════════
   REF — Referral / Affiliate Tracking System

   Урсгал:
   1. Борлуулагч линк үүсгэнэ: storefront.html?ref=USERNAME
   2. Хэрэглэгч линкээр орно → ref cookie + sessionStorage-д хадгалагдана
   3. Захиалга хийхэд ref автоматаар илгээгдэнэ (OrdersAPI.create)
   4. Backend комисс тооцоолно
   ══════════════════════════════════════════════════════════════ */
const Ref = {
  _skey: 'eseller_ref',
  _cname: 'eseller_ref',
  _ttl: 30 * 24 * 60 * 60, // 30 хоног

  // URL-с ref параметр шалгаж хадгалах
  capture() {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (!ref) return;

    // Session + Cookie + localStorage
    sessionStorage.setItem(this._skey, ref);
    localStorage.setItem(this._skey, ref);
    document.cookie = `${this._cname}=${encodeURIComponent(ref)};path=/;max-age=${this._ttl};SameSite=Lax`;

    // Backend-д click бүртгэх (async, алдааг дуугүйгээр алгасна)
    this._trackClick(ref);

    // URL-с ref параметр арилгах (цэвэрхэн харагдахын тулд)
    if (params.has('ref')) {
      params.delete('ref');
      const clean = params.toString();
      const newUrl = location.pathname + (clean ? '?' + clean : '') + location.hash;
      history.replaceState(null, '', newUrl);
    }
  },

  // Одоо хадгалагдсан ref авах
  get() {
    return sessionStorage.getItem(this._skey)
      || localStorage.getItem(this._skey)
      || this._getCookie();
  },

  // Ref байгаа эсэх
  has() { return !!this.get(); },

  // Ref цэвэрлэх (захиалга дууссаны дараа)
  clear() {
    sessionStorage.removeItem(this._skey);
    localStorage.removeItem(this._skey);
    document.cookie = `${this._cname}=;path=/;max-age=0`;
  },

  // Cookie-с унших
  _getCookie() {
    const match = document.cookie.match(new RegExp('(?:^|; )' + this._cname + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  },

  // Backend-д click бүртгэх
  async _trackClick(ref) {
    try {
      await apiFetch('/affiliate/click', {
        method: 'POST',
        body: JSON.stringify({
          referralCode: ref,
          page: location.pathname,
          timestamp: new Date().toISOString()
        })
      });
    } catch { /* Алдааг дуугүйгээр алгасна — tracking чухал биш */ }
  }
};

/* ══════════════════════════════════════════════════════════════
   UI — Helpers
   ══════════════════════════════════════════════════════════════ */
const UI = {
  // Үнэ форматлах: 35000 → "35,000₮"
  price(n) {
    return Number(n || 0).toLocaleString('mn-MN') + '₮';
  },

  // Toast мэдэгдэл
  toast(msg, type = 'ok') {
    const old = document.getElementById('_toast');
    if (old) old.remove();

    const el = document.createElement('div');
    el.id = '_toast';
    el.textContent = msg;
    Object.assign(el.style, {
      position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
      background: type === 'ok' ? '#059669' : type === 'warn' ? '#D97706' : '#DC2626',
      color: '#fff', padding: '10px 22px', borderRadius: '12px',
      fontSize: '13px', fontWeight: '700', zIndex: '99999',
      boxShadow: '0 6px 24px rgba(0,0,0,.2)',
      animation: 'toastIn .3s ease'
    });
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 2500);
  },

  // Loading state товч дээр
  loading(btn, on = true) {
    if (!btn) return;
    if (on) {
      btn._origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Уншиж байна...';
    } else {
      btn.disabled = false;
      btn.textContent = btn._origText || 'Илгээх';
    }
  },

  // Confirm dialog
  confirm(msg) {
    return window.confirm(msg);
  },

  // Цаг форматлах
  timeAgo(date) {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'Дөнгөж сая';
    if (s < 3600) return Math.floor(s / 60) + ' мин өмнө';
    if (s < 86400) return Math.floor(s / 3600) + ' цагийн өмнө';
    return Math.floor(s / 86400) + ' өдрийн өмнө';
  }
};

// Toast animation
if (!document.getElementById('_toast_style')) {
  const s = document.createElement('style');
  s.id = '_toast_style';
  s.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%)}}';
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════════════════════════
   HELPERS — Auth guard, role redirect
   ══════════════════════════════════════════════════════════════ */
function requireAuth(...roles) {
  if (!Auth.isLoggedIn()) {
    location.href = (location.pathname.includes('/pages/') ? '' : 'pages/') + 'login.html';
    return false;
  }
  if (roles.length) {
    const r = Auth.getUser()?.role;
    if (!roles.includes(r)) { location.href = 'dashboard.html'; return false; }
  }
  return true;
}

function goHome(role) {
  const base = location.pathname.includes('/pages/') ? '' : 'pages/';
  const map = { seller: 'seller.html', affiliate: 'affiliate.html', delivery: 'delivery.html', admin: 'admin.html' };
  location.href = base + (map[role] || 'dashboard.html');
}

function roleHome(role) {
  const base = location.pathname.includes('/pages/') ? '' : 'pages/';
  const map = { seller: 'seller.html', affiliate: 'affiliate.html', delivery: 'delivery.html', admin: 'admin.html' };
  return base + (map[role] || 'dashboard.html');
}

function formatPrice(n) { return UI.price(n); }

function syncBadge() {
  document.querySelectorAll('.m-badge, .cbadge').forEach(b => {
    const n = Cart.count();
    b.textContent = n;
    b.style.display = n > 0 ? 'flex' : 'none';
  });
}
