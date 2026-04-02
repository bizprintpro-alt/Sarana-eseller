// ── AUTH ─────────────────────────
if (!requireAuth()) {}

const user = Auth.getUser();

// ── STATE ─────────────────────────────────────────────────────
let currentStep = 1;
let selectedTime = 'asap';
let selectedPay  = 'qpay';
let createdOrder = null;
let qpayTimer    = null;

// ── RENDER SUMMARY ────────────────────────────────────────────
function renderSummary() {
  const items = Cart.get();
  if (!items.length) {
    // Empty cart — redirect back
    UI.toast('Сагс хоосон байна', 'warn');
    setTimeout(() => location.href = 'storefront.html', 800);
    return;
  }
  document.getElementById('item-count').textContent = `(${Cart.count()} бараа)`;

  document.getElementById('sum-items-list').innerHTML = items.map(i => `
    <div class="si">
      <div class="si-img">
        ${i.images?.[0] ? `<img src="${i.images[0]}">` : (i.emoji || '📦')}
      </div>
      <div class="si-info">
        <div class="si-name">${i.name}</div>
        <div class="si-qty">${i.qty || 1} ширхэг</div>
      </div>
      <div class="si-price">${UI.price((i.salePrice || i.price) * (i.qty || 1))}</div>
    </div>`).join('');

  const sub = Cart.total();
  const delivery = sub >= 50000 ? 0 : 3000; // free delivery over ₮50k
  document.getElementById('subtotal').textContent    = UI.price(sub);
  document.getElementById('delivery-fee').textContent = delivery === 0 ? '🎉 Үнэгүй' : UI.price(delivery);
  document.getElementById('grand-total').textContent  = UI.price(sub + delivery);

  // Check ref cookie for affiliate discount
  const ref = sessionStorage.getItem('sarana_ref');
  if (ref) {
    const disc = Math.round(sub * 0.02); // 2% affiliate discount for buyer
    document.getElementById('discount').textContent = `−${UI.price(disc)}`;
    document.getElementById('grand-total').textContent = UI.price(sub + delivery - disc);
  }

  // Load wallet balance
  const wallet = parseFloat(localStorage.getItem('sarana_wallet') || '0');
  document.getElementById('wallet-bal-lbl').textContent = `Үлдэгдэл: ${UI.price(wallet)}`;
}

// ── STEP PROGRESS UPDATE ──────────────────────────────────────
function setStep(n) {
  currentStep = n;
  [1,2,3].forEach(i => {
    const numEl   = document.getElementById(`sn${i}`);
    const lblEl   = document.getElementById(`sl${i}`);
    const lineEl  = document.getElementById(`line${i}`);
    const cls     = i < n ? 'done' : i === n ? 'active' : 'waiting';
    numEl.className = `step-num ${cls}`;
    lblEl.className = `step-label ${cls}`;
    if (lineEl) lineEl.className = `step-line${i < n ? ' done' : ''}`;
    if (i < n) numEl.textContent = '✓';
    else numEl.textContent = i === 3 ? '✓' : i;
  });
  document.getElementById('pane-address').style.display  = n === 1 ? '' : 'none';
  document.getElementById('pane-payment').style.display  = n === 2 ? '' : 'none';
  document.getElementById('pane-success').style.display  = n === 3 ? '' : 'none';
}

// ── TIME & PAY SELECTION ──────────────────────────────────────
function selTime(el, val) {
  document.querySelectorAll('.time-opt').forEach(e => e.classList.remove('on'));
  el.classList.add('on');
  selectedTime = val;
}

function selPay(method) {
  selectedPay = method;
  ['qpay','card','cash','wallet'].forEach(m => {
    document.getElementById(`pay-${m}`).classList.toggle('on', m === method);
    document.getElementById(`${m}-info`).style.display = m === method ? '' : 'none';
  });
}

// ── VALIDATION ───────────────────────────────────────────────
function validateAddress() {
  let ok = true;
  const checks = [
    { id:'d-name',     fg:'fg-name',     test: v => v.trim().length >= 2,   msg:'Нэр оруулна уу' },
    { id:'d-phone',    fg:'fg-phone',    test: v => /^[0-9]{8}$/.test(v.replace(/\s/g,'')), msg:'8 оронтой дугаар оруулна уу' },
    { id:'d-district', fg:'fg-district', test: v => !!v,                    msg:'Дүүрэг сонгоно уу' },
    { id:'d-khoroo',   fg:'fg-khoroo',   test: v => v.trim().length >= 2,   msg:'Хороо/гудамж оруулна уу' },
  ];
  checks.forEach(c => {
    const el = document.getElementById(c.id);
    const fg = document.getElementById(c.fg);
    if (!c.test(el.value)) {
      fg.classList.add('has-err');
      ok = false;
    } else {
      fg.classList.remove('has-err');
    }
  });
  return ok;
}

// ── NAVIGATION ────────────────────────────────────────────────
function goToAddress() { setStep(1); }

function goToPayment() {
  if (!validateAddress()) {
    UI.toast('Бүх талбарыг бөглөнө үү', 'warn');
    return;
  }
  setStep(2);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── PLACE ORDER ───────────────────────────────────────────────
async function placeOrder() {
  const btn = document.getElementById('place-order-btn');
  UI.loading(btn);

  const items = Cart.get();
  if (!items.length) { UI.toast('Сагс хоосон байна', 'warn'); UI.loading(btn, false); return; }

  const address = {
    city:     document.getElementById('d-city').value,
    district: document.getElementById('d-district').value,
    street:   document.getElementById('d-khoroo').value,
    building: document.getElementById('d-apt').value,
    note:     document.getElementById('d-note').value,
  };
  const phone    = document.getElementById('d-phone').value.replace(/\s/g, '');
  const receiver = document.getElementById('d-name').value;

  // Capture affiliate referral (Ref module-с)
  const ref = Ref.get();

  try {
    const order = await OrdersAPI.create({
      items:    items.map(i => ({ product: i._id, quantity: i.qty || 1 })),
      payment:  { method: selectedPay },
      delivery: { address, phone, receiver, preferredTime: selectedTime },
      referral: ref || undefined,
    });

    createdOrder = order.order || order;
    Cart.clear();
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (selectedPay === 'qpay') {
      document.getElementById('qpay-step').style.display    = '';
      document.getElementById('success-step').style.display = 'none';
      document.getElementById('s3-title').textContent = 'QPay-р төлнө үү';
      try {
        const qpay = await PaymentAPI.createQPay(createdOrder._id);
        if (qpay.qr_image) {
          document.getElementById('qr-container').innerHTML =
            `<img src="data:image/png;base64,${qpay.qr_image}" alt="QPay QR">`;
        }
        if (qpay.qr_url) {
          document.getElementById('qr-container').onclick = () => window.open(qpay.qr_url);
        }
        startTimer(10 * 60); // 10 minute timer
      } catch {
        // QPay failed — show success anyway (cash fallback)
        showFinalSuccess();
      }
    } else {
      showFinalSuccess();
    }

  } catch (e) {
    // Demo mode — simulate success
    if (e.message?.includes('fetch') || e.message?.includes('network') || e.message?.includes('Failed')) {
      const fakeNum = 'DS' + Math.floor(Math.random() * 90000 + 10000);
      Cart.clear();
      setStep(3);
      if (selectedPay === 'qpay') {
        document.getElementById('qpay-step').style.display    = '';
        document.getElementById('success-step').style.display = 'none';
        document.getElementById('s3-title').textContent = 'QPay-р төлнө үү';
        startTimer(10 * 60);
        createdOrder = { _id: fakeNum, orderNumber: fakeNum };
      } else {
        showFinalSuccess(fakeNum);
      }
    } else {
      UI.toast('Алдаа: ' + e.message, 'error');
      UI.loading(btn, false);
    }
  }
}

// ── QPAY TIMER ───────────────────────────────────────────────
function startTimer(secs) {
  let remaining = secs;
  clearInterval(qpayTimer);
  qpayTimer = setInterval(() => {
    remaining--;
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');
    document.getElementById('qpay-timer').innerHTML = `⏱ ${m}:${s} хүлээгдэж байна`;
    if (remaining <= 0) {
      clearInterval(qpayTimer);
      document.getElementById('qpay-timer').innerHTML = '❌ Хугацаа дууслаа. Дахин оролдоно уу.';
    }
  }, 1000);
}

async function checkPayment() {
  if (!createdOrder) return;
  const btn = document.getElementById('check-pay-btn');
  UI.loading(btn);
  try {
    const res = await PaymentAPI.checkQPay(createdOrder._id);
    if (res.paid || res.status === 'paid') {
      clearInterval(qpayTimer);
      showFinalSuccess(createdOrder.orderNumber || createdOrder._id);
    } else {
      UI.toast('Төлбөр хүлээгдэж байна...', 'info');
      UI.loading(btn, false);
    }
  } catch {
    // Demo: simulate paid
    clearInterval(qpayTimer);
    showFinalSuccess(createdOrder?.orderNumber || 'DS' + Math.floor(Math.random() * 90000 + 10000));
  }
}

function showFinalSuccess(num) {
  clearInterval(qpayTimer);
  document.getElementById('qpay-step').style.display    = 'none';
  document.getElementById('success-step').style.display = '';
  document.getElementById('s3-title').textContent = 'Захиалга баталгаажлаа!';
  document.getElementById('final-order-num').textContent =
    '#' + (num || createdOrder?.orderNumber || createdOrder?._id || 'DS00000');

  // Update step 3 visual to "done"
  const sn3 = document.getElementById('sn3');
  const sl3 = document.getElementById('sl3');
  sn3.className = 'step-num done';
  sl3.className = 'step-label done';
  document.getElementById('line2').className = 'step-line done';
}

function openBank(bank) {
  const urls = {
    khanbank: 'https://www.khanbank.com',
    golomt:   'https://www.golomtbank.com',
    tdb:      'https://www.tdbm.mn',
    khas:     'https://www.xacbank.mn',
    state:    'https://www.statebank.mn',
    bogd:     'https://www.bogdbank.mn',
    most:     'https://www.mostmoney.mn',
    arig:     'https://www.arigbank.mn',
  };
  if (urls[bank]) window.open(urls[bank], '_blank');
}

// ── COOKIE HELPER ────────────────────────────────────────────
function getCookie(name) {
  const val = `; ${document.cookie}`;
  const parts = val.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// ── INIT ─────────────────────────────────────────────────────
renderSummary();

// Pre-fill name/phone from user profile
if (user?.name)  document.getElementById('d-name').value  = user.name;
if (user?.phone) document.getElementById('d-phone').value = user.phone;
