/* ══════════════════════════════════════
   eseller.mn — Login / Register Page JS
   ══════════════════════════════════════ */

if (Auth.isLoggedIn()) goHome(Auth.getUser()?.role);
if (location.hash === '#register') show('reg');

function show(p) {
  document.getElementById('pane-login').style.display = p === 'login' ? '' : 'none';
  document.getElementById('pane-reg').style.display   = p === 'reg'   ? '' : 'none';
  document.getElementById('t-in').classList.toggle('on', p === 'login');
  document.getElementById('t-reg').classList.toggle('on', p === 'reg');
  ['l-alert', 'r-alert'].forEach(id => {
    const el = document.getElementById(id);
    el.className = 'alert'; el.textContent = '';
  });
}

function alert2(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = type === 'ok' ? '✅ ' + msg : '⚠️ ' + msg;
  el.className = 'alert ' + type;
}

function togglePw(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function selectRole(el, colorClass) {
  document.querySelectorAll('.rs-card').forEach(c => {
    c.classList.remove('on', 'sel-seller', 'sel-affiliate', 'sel-buyer', 'sel-delivery');
  });
  el.classList.add('on', colorClass);
  document.getElementById('r-role').value = el.dataset.role;
}

function checkPw(v) {
  const fill = document.getElementById('pw-fill');
  const hint = document.getElementById('pw-hint');
  if (!v) { fill.style.width = '0'; hint.textContent = ''; return; }
  const strong = v.length >= 10 && /[A-Z]/.test(v) && /\d/.test(v);
  const med    = v.length >= 6 && (/[A-Z]/.test(v) || /\d/.test(v));
  const score  = strong ? 3 : med ? 2 : 1;
  const colors = ['', '#EF4444', '#F59E0B', '#059669'];
  const labels = ['', '— Сул', '— Дунд', '— Хүчтэй'];
  fill.style.width = ['0', '33%', '66%', '100%'][score];
  fill.style.background = colors[score];
  hint.textContent = labels[score];
  hint.style.color = colors[score];
}

async function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  const btn   = document.getElementById('l-btn');
  if (!email || !pass) { alert2('l-alert', 'Бүх талбарыг бөглөнө үү', 'err'); return; }
  btn.disabled = true; btn.textContent = 'Нэвтрэх...';
  try {
    const data = await Auth.login(email, pass);
    if (data.token) {
      alert2('l-alert', 'Амжилттай нэвтэрлээ!', 'ok');
      setTimeout(() => goHome(data.user?.role || data.role), 700);
    } else {
      alert2('l-alert', data.message || 'Нэвтрэх алдаа', 'err');
      btn.disabled = false; btn.textContent = 'Нэвтрэх';
    }
  } catch(e) {
    alert2('l-alert', 'Холболтын алдаа. Дахин оролдоно уу.', 'err');
    btn.disabled = false; btn.textContent = 'Нэвтрэх';
  }
}

async function doReg() {
  const name  = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const pass  = document.getElementById('r-pass').value;
  const role  = document.getElementById('r-role').value;
  const btn   = document.getElementById('r-btn');
  if (!name || !email || !pass) { alert2('r-alert', 'Бүх талбарыг бөглөнө үү', 'err'); return; }
  if (pass.length < 6) { alert2('r-alert', 'Нууц үг дор хаяж 6 тэмдэгт байх ёстой', 'err'); return; }
  btn.disabled = true; btn.textContent = 'Бүртгүүлж байна...';
  try {
    const data = await Auth.register(name, email, pass, role);
    if (data.token) {
      alert2('r-alert', 'Бүртгэл амжилттай!', 'ok');
      setTimeout(() => goHome(data.user?.role || role), 700);
    } else {
      alert2('r-alert', data.message || 'Бүртгэлийн алдаа', 'err');
      btn.disabled = false; btn.textContent = 'Бүртгүүлэх →';
    }
  } catch(e) {
    alert2('r-alert', 'Холболтын алдаа. Дахин оролдоно уу.', 'err');
    btn.disabled = false; btn.textContent = 'Бүртгүүлэх →';
  }
}
