/**
 * QPay API Client — eseller.mn
 * Docs: https://developer.qpay.mn
 */

const QPAY_URL = process.env.QPAY_URL || 'https://merchant.qpay.mn/v2';
const QPAY_USERNAME = process.env.QPAY_USERNAME || '';
const QPAY_PASSWORD = process.env.QPAY_PASSWORD || '';
const QPAY_INVOICE_CODE = process.env.QPAY_INVOICE_CODE || 'ESELLER_MN';

interface QPaYToken {
  token_type: string;
  refresh_expires_in: number;
  refresh_token: string;
  access_token: string;
  expires_in: number;
  scope: string;
  obtainedAt?: number;
}

let cachedToken: QPaYToken | null = null;

async function getToken(): Promise<string> {
  // Check if cached token is still valid (with 60s buffer)
  if (cachedToken && cachedToken.obtainedAt) {
    const elapsed = (Date.now() - cachedToken.obtainedAt) / 1000;
    if (elapsed < cachedToken.expires_in - 60) {
      return cachedToken.access_token;
    }
  }

  const res = await fetch(`${QPAY_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${QPAY_USERNAME}:${QPAY_PASSWORD}`).toString('base64')}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`QPay auth failed: ${res.status} ${error}`);
  }

  cachedToken = { ...(await res.json()), obtainedAt: Date.now() };
  return cachedToken!.access_token;
}

export interface CreateInvoiceParams {
  orderId: string;
  amount: number;
  description: string;
  callbackUrl?: string;
}

export interface QPaYInvoice {
  invoice_id: string;
  qr_text: string;
  qr_image: string;       // base64 QR image
  qPay_shortUrl: string;
  urls: { name: string; description: string; logo: string; link: string }[];
}

export interface QPaYPaymentStatus {
  count: number;
  paid_amount: number;
  rows: {
    payment_id: string;
    payment_status: string;
    payment_date: string;
    payment_amount: number;
  }[];
}

/**
 * Create a QPay invoice
 */
export async function createInvoice(params: CreateInvoiceParams): Promise<QPaYInvoice> {
  const token = await getToken();
  const callbackUrl = params.callbackUrl || `${process.env.NEXT_PUBLIC_URL || 'https://eseller.mn'}/api/webhooks/qpay`;

  const res = await fetch(`${QPAY_URL}/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      invoice_code: QPAY_INVOICE_CODE,
      sender_invoice_no: params.orderId,
      invoice_receiver_code: params.orderId,
      invoice_description: params.description,
      amount: params.amount,
      callback_url: `${callbackUrl}?orderId=${params.orderId}`,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`QPay create invoice failed: ${res.status} ${error}`);
  }

  return res.json();
}

/**
 * Check payment status of an invoice
 */
export async function checkPayment(invoiceId: string): Promise<QPaYPaymentStatus> {
  const token = await getToken();

  const res = await fetch(`${QPAY_URL}/payment/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      object_type: 'INVOICE',
      object_id: invoiceId,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`QPay check payment failed: ${res.status} ${error}`);
  }

  return res.json();
}

/**
 * Cancel an invoice
 */
export async function cancelInvoice(invoiceId: string): Promise<void> {
  const token = await getToken();

  await fetch(`${QPAY_URL}/invoice/${invoiceId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Demo mode — for development without real QPay credentials
 */
export function isDemoMode(): boolean {
  return !QPAY_USERNAME || !QPAY_PASSWORD;
}

export function createDemoInvoice(params: CreateInvoiceParams): QPaYInvoice {
  return {
    invoice_id: `DEMO_${params.orderId}_${Date.now()}`,
    qr_text: `https://eseller.mn/pay/${params.orderId}`,
    qr_image: '', // Will use QR code library instead
    qPay_shortUrl: `https://qpay.mn/shorturl/${params.orderId}`,
    urls: [
      { name: 'Khan bank', description: 'Хаан банк', logo: 'https://qpay.mn/q/logo/khan.png', link: `khanbank://q?${params.orderId}` },
      { name: 'Golomt bank', description: 'Голомт банк', logo: 'https://qpay.mn/q/logo/golomt.png', link: `golomtbank://q?${params.orderId}` },
      { name: 'TDB', description: 'ХХБ', logo: 'https://qpay.mn/q/logo/tdb.png', link: `tdbm://q?${params.orderId}` },
      { name: 'Xac bank', description: 'Хас банк', logo: 'https://qpay.mn/q/logo/xac.png', link: `xacbank://q?${params.orderId}` },
      { name: 'Capitron', description: 'Капитрон', logo: 'https://qpay.mn/q/logo/capitron.png', link: `capitronbank://q?${params.orderId}` },
    ],
  };
}
