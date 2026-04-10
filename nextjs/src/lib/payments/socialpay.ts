import crypto from 'crypto';

const SOCIALPAY_BASE = 'https://ecommerce.golomtbank.com';

export async function createSocialPayInvoice({ amount, orderId, description }: { amount: number; orderId: string; description: string }) {
  const checksum = crypto.createHash('sha256').update(`${orderId}${amount}${process.env.SOCIALPAY_SECRET}`).digest('hex');

  const res = await fetch(`${SOCIALPAY_BASE}/api/invoice/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.SOCIALPAY_TOKEN}` },
    body: JSON.stringify({
      amount, checksum, invoice: orderId, description,
      callback_url: `https://eseller.mn/api/payment/socialpay/callback`,
      success_url: `https://eseller.mn/track/${orderId}`,
      fail_url: `https://eseller.mn/checkout?error=payment_failed`,
    }),
  });
  return res.json();
}
