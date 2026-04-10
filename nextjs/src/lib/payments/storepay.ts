export async function createStorePayInvoice({ amount, orderId, installments = 3 }: { amount: number; orderId: string; installments?: 3 | 6 | 12 }) {
  const res = await fetch('https://service.storepay.mn/api/invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'merchant-id': process.env.STOREPAY_MERCHANT_ID!, 'secret-key': process.env.STOREPAY_SECRET! },
    body: JSON.stringify({
      amount, installment_count: installments, order_id: orderId,
      description: `Eseller.mn #${orderId}`,
      callback_url: `https://eseller.mn/api/payment/storepay/callback`,
    }),
  });
  return res.json();
}
