/**
 * Transactional SMS helpers for orders, delivery, and payouts.
 * Uses the existing SMSService (Unitel/MobiCom) under the hood.
 */

import { sendSMS } from '@/lib/marketing/SMSService';

interface OrderSMSData {
  id: string;
  orderNumber?: string | null;
  total?: number | null;
  status?: string;
}

function orderRef(order: OrderSMSData): string {
  return order.orderNumber || `#${order.id.slice(-6)}`;
}

function formatMNT(amount: number): string {
  return amount.toLocaleString() + '₮';
}

/** Notify buyer: order confirmed */
export async function smsOrderConfirmed(phone: string, order: OrderSMSData) {
  return sendSMS(
    phone,
    `eseller.mn: Захиалга ${orderRef(order)} баталгаажлаа. Нийт: ${formatMNT(order.total || 0)}. Дэлгэрэнгүй: eseller.mn/dashboard/orders`,
  );
}

/** Notify seller: new order received */
export async function smsSellerNewOrder(phone: string, order: OrderSMSData) {
  return sendSMS(
    phone,
    `eseller.mn: Шинэ захиалга ${orderRef(order)} ирлээ! Дүн: ${formatMNT(order.total || 0)}. eseller.mn/dashboard/store/orders`,
  );
}

/** Notify buyer: delivery started */
export async function smsDeliveryStarted(phone: string, order: OrderSMSData) {
  return sendSMS(
    phone,
    `eseller.mn: Таны захиалга ${orderRef(order)} хүргэлтэд гарлаа. eseller.mn/dashboard/orders`,
  );
}

/** Notify buyer: delivered */
export async function smsDelivered(phone: string, order: OrderSMSData) {
  return sendSMS(
    phone,
    `eseller.mn: Захиалга ${orderRef(order)} амжилттай хүргэгдлээ. Баярлалаа!`,
  );
}

/** Notify seller: payout sent */
export async function smsPayoutSent(phone: string, amount: number) {
  return sendSMS(
    phone,
    `eseller.mn: Таны ${formatMNT(amount)} орлого данс руу шилжүүллээ. eseller.mn/dashboard/store/wallet`,
  );
}
