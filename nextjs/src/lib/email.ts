/**
 * Transactional email helpers for orders, delivery, and seller notifications.
 * Uses the existing EmailService (Resend) under the hood.
 */

import { sendEmail, buildEmailTemplate } from '@/lib/marketing/EmailService';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Хүлээгдэж байна',
  confirmed: 'Баталгаажсан',
  preparing: 'Бэлтгэж байна',
  ready: 'Бэлэн болсон',
  delivering: 'Хүргэж байна',
  delivered: 'Хүргэгдсэн',
  cancelled: 'Цуцлагдсан',
};

interface OrderEmailData {
  id: string;
  orderNumber?: string | null;
  total?: number | null;
  status: string;
  items: Array<{ name?: string; quantity?: number; price?: number }>;
  buyerEmail: string;
  buyerName: string;
  sellerEmail?: string;
  sellerName?: string;
  shopName?: string;
}

function formatMNT(amount: number): string {
  return amount.toLocaleString() + '₮';
}

function orderRef(order: OrderEmailData): string {
  return order.orderNumber || `#${order.id.slice(-6)}`;
}

/** Send order confirmation to buyer */
export async function sendOrderConfirmation(order: OrderEmailData) {
  const itemsHtml = order.items
    .map((item) => `<li>${item.name || 'Бараа'} × ${item.quantity || 1} — ${formatMNT(item.price || 0)}</li>`)
    .join('');

  const body = `
    <p>Сайн байна уу, <strong>${order.buyerName}</strong>!</p>
    <p>Таны захиалга <strong>${orderRef(order)}</strong> амжилттай баталгаажлаа.</p>
    <ul>${itemsHtml}</ul>
    <p style="font-size:18px;font-weight:700">Нийт: ${formatMNT(order.total || 0)}</p>
    <p>Захиалгынхаа явцыг хянахын тулд доорх товчийг дарна уу.</p>
  `;

  return sendEmail(
    order.buyerEmail,
    `Захиалга ${orderRef(order)} баталгаажлаа`,
    buildEmailTemplate('Захиалга баталгаажлаа ✓', body, `https://eseller.mn/dashboard/orders`, 'Захиалга харах'),
  );
}

/** Send delivery status update to buyer */
export async function sendDeliveryUpdate(order: OrderEmailData) {
  const statusLabel = STATUS_LABELS[order.status] || order.status;

  const body = `
    <p>Сайн байна уу, <strong>${order.buyerName}</strong>!</p>
    <p>Таны захиалга <strong>${orderRef(order)}</strong> — <strong>${statusLabel}</strong></p>
    <p>Дэлгэрэнгүй мэдээллийг доороос харна уу.</p>
  `;

  return sendEmail(
    order.buyerEmail,
    `Захиалга ${orderRef(order)} — ${statusLabel}`,
    buildEmailTemplate(`Захиалгын статус: ${statusLabel}`, body, `https://eseller.mn/dashboard/orders`, 'Дэлгэрэнгүй'),
  );
}

/** Notify seller of a new order */
export async function sendSellerNewOrder(order: OrderEmailData) {
  if (!order.sellerEmail) return;

  const body = `
    <p>Сайн байна уу, <strong>${order.sellerName || 'Борлуулагч'}</strong>!</p>
    <p>Шинэ захиалга ирлээ!</p>
    <p><strong>Захиалга:</strong> ${orderRef(order)}</p>
    <p><strong>Нийт дүн:</strong> ${formatMNT(order.total || 0)}</p>
    <p><strong>Бараа:</strong> ${order.items.length} төрөл</p>
    <p>Захиалгыг шалгаж, бэлтгэж эхэлнэ үү.</p>
  `;

  return sendEmail(
    order.sellerEmail,
    `Шинэ захиалга — ${formatMNT(order.total || 0)}`,
    buildEmailTemplate('Шинэ захиалга ирлээ!', body, `https://eseller.mn/dashboard/store/orders`, 'Захиалга харах'),
  );
}
