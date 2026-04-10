export async function createMonPayInvoice({ amount, orderId, description }: { amount: number; orderId: string; description: string }) {
  const res = await fetch('https://api.monpay.mn/v1/invoice/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.MONPAY_TOKEN}` },
    body: JSON.stringify({
      amount, note: description,
      callback_url: `https://eseller.mn/api/payment/monpay/callback`,
      redirect_url: `https://eseller.mn/track/${orderId}`,
      invoice_id: orderId, expire_time: 300,
    }),
  });
  return res.json();
}
