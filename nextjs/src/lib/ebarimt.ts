/**
 * еБаримт — МТА DDTD API integration
 * Mongolian Tax Receipt System
 *
 * API: https://api.ebarimt.mn/api/v1
 * Env: EBARIMT_API_KEY, EBARIMT_MERCHANT_ID, EBARIMT_POS_NO
 *
 * НӨАТ (VAT) = 10%, Хотын татвар (City Tax) = 2%
 */

const API_BASE = 'https://api.ebarimt.mn/api/v1';
const VAT_RATE = 0.10;
const CITY_TAX_RATE = 0.02;

interface TaxBreakdown {
  subtotal: number;
  vat: number;
  cityTax: number;
  total: number;
}

interface ReceiptItem {
  name: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  barCode?: string;
}

interface ReceiptResult {
  billId: string;
  qrData: string;
  lottery: string;
  date: string;
  amount: number;
  vatAmount: number;
  cityTax: number;
  items: ReceiptItem[];
  buyerTIN: string | null;
  status: string;
}

interface ReceiptStatus {
  billId: string;
  status: 'SUCCESS' | 'PENDING' | 'ERROR';
  message?: string;
}

function generateBillId(): string {
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return `ТБ${num}`;
}

function generateLottery(): string {
  const letters = 'АБВГДЕЖЗИЙ';
  const a = letters[Math.floor(Math.random() * letters.length)];
  const b = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return `${a}${b} ${num}`;
}

function generateQRData(billId: string, amount: number): string {
  return JSON.stringify({
    billId,
    amount,
    merchantId: process.env.EBARIMT_MERCHANT_ID || 'DEMO',
    posNo: process.env.EBARIMT_POS_NO || '001',
    url: `https://ebarimt.mn/check/${billId}`,
  });
}

export function calculateTax(amount: number): TaxBreakdown {
  const subtotal = amount / (1 + VAT_RATE + CITY_TAX_RATE);
  const vat = Math.round(subtotal * VAT_RATE * 100) / 100;
  const cityTax = Math.round(subtotal * CITY_TAX_RATE * 100) / 100;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vat,
    cityTax,
    total: amount,
  };
}

export async function createReceipt(
  orderId: string,
  buyerTIN: string | null,
  items: ReceiptItem[]
): Promise<ReceiptResult> {
  const totalAmount = items.reduce((s, i) => s + i.totalPrice, 0);
  const tax = calculateTax(totalAmount);

  // In production, call МТА API:
  // const res = await fetch(`${API_BASE}/receipt`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.EBARIMT_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     merchantId: process.env.EBARIMT_MERCHANT_ID,
  //     posNo: process.env.EBARIMT_POS_NO,
  //     billType: buyerTIN ? '3' : '1',
  //     buyerTIN,
  //     amount: totalAmount,
  //     vat: tax.vat,
  //     cityTax: tax.cityTax,
  //     items,
  //   }),
  // });

  const billId = generateBillId();
  const lottery = generateLottery();
  const qrData = generateQRData(billId, totalAmount);

  return {
    billId,
    qrData,
    lottery,
    date: new Date().toISOString(),
    amount: totalAmount,
    vatAmount: tax.vat,
    cityTax: tax.cityTax,
    items,
    buyerTIN,
    status: 'SUCCESS',
  };
}

export async function getReceipt(billId: string): Promise<ReceiptStatus> {
  // In production, call МТА API:
  // const res = await fetch(`${API_BASE}/receipt/${billId}`, {
  //   headers: { 'Authorization': `Bearer ${process.env.EBARIMT_API_KEY}` },
  // });

  return {
    billId,
    status: 'SUCCESS',
    message: 'Баримт амжилттай бүртгэгдсэн',
  };
}

export const ebarimt = { calculateTax, createReceipt, getReceipt };
export default ebarimt;
