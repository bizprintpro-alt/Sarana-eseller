/**
 * QPay — Mongolian QR Payment Gateway
 *
 * API: https://merchant.qpay.mn/v2
 * Env: QPAY_USERNAME, QPAY_PASSWORD, QPAY_INVOICE_CODE
 *
 * Flow: authenticate → create invoice → show QR → check payment → callback
 */

const API_BASE = 'https://merchant.qpay.mn/v2';

let cachedToken: { token: string; expiresAt: number } | null = null;

interface QPayInvoice {
  invoiceId: string;
  qrImage: string;   // base64 QR image
  qrText: string;    // QR text data
  urls: { name: string; link: string }[];
}

interface QPayPaymentStatus {
  paid: boolean;
  paidAmount: number;
  paidDate: string | null;
}

export async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  // In production, call QPay auth:
  // const res = await fetch(`${API_BASE}/auth/token`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': 'Basic ' + btoa(
  //       `${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`
  //     ),
  //   },
  // });
  // const data = await res.json();

  const token = `qpay_mock_${Date.now()}`;
  cachedToken = {
    token,
    expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
  };
  return token;
}

export async function createInvoice(
  orderId: string,
  amount: number,
  description: string
): Promise<QPayInvoice> {
  const token = await getToken();

  // In production, call QPay:
  // const res = await fetch(`${API_BASE}/invoice`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     invoice_code: process.env.QPAY_INVOICE_CODE,
  //     sender_invoice_no: orderId,
  //     invoice_receiver_code: '',
  //     invoice_description: description,
  //     amount,
  //     callback_url: `${process.env.NEXT_PUBLIC_URL}/api/payment/qpay/callback?orderId=${orderId}`,
  //   }),
  // });

  const invoiceId = `QP${Date.now().toString(36).toUpperCase()}`;

  return {
    invoiceId,
    qrImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    qrText: `qpay://pay?invoice=${invoiceId}&amount=${amount}`,
    urls: [
      { name: 'Хаан банк', link: `khanbank://qpay?id=${invoiceId}` },
      { name: 'Голомт банк', link: `golomtbank://qpay?id=${invoiceId}` },
      { name: 'ХХБ', link: `statebank://qpay?id=${invoiceId}` },
      { name: 'Хас банк', link: `xacbank://qpay?id=${invoiceId}` },
      { name: 'Богд банк', link: `bogdbank://qpay?id=${invoiceId}` },
      { name: 'SocialPay', link: `socialpay://qpay?id=${invoiceId}` },
      { name: 'MonPay', link: `monpay://qpay?id=${invoiceId}` },
    ],
  };
}

export async function checkPayment(invoiceId: string): Promise<QPayPaymentStatus> {
  const token = await getToken();

  // In production, call QPay:
  // const res = await fetch(`${API_BASE}/payment/check`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ object_type: 'INVOICE', object_id: invoiceId }),
  // });

  // Mock: return unpaid status
  return {
    paid: false,
    paidAmount: 0,
    paidDate: null,
  };
}

export const qpay = { getToken, createInvoice, checkPayment };
export default qpay;
