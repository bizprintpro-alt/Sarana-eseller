/**
 * AliExpress / CJDropshipping API integration
 */

const ALIEXPRESS_APP_KEY = process.env.ALIEXPRESS_APP_KEY || '';
const ALIEXPRESS_APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || '';
const CJ_ACCESS_TOKEN = process.env.CJ_ACCESS_TOKEN || '';

interface ShippingAddress {
  name: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  address: string;
  zip: string;
}

/** Search products on AliExpress via Affiliate API */
export async function searchAliExpress(keyword: string, page = 1) {
  if (!ALIEXPRESS_APP_KEY) {
    console.log(`[ALIEXPRESS DEMO] Search: ${keyword}, page ${page}`);
    return { products: [], total: 0 };
  }

  try {
    const params = new URLSearchParams({
      method: 'aliexpress.affiliate.product.query',
      app_key: ALIEXPRESS_APP_KEY,
      keywords: keyword,
      page_no: String(page),
      page_size: '20',
      target_currency: 'USD',
      sort: 'SALE_PRICE_ASC',
    });

    const res = await fetch(`https://api-sg.aliexpress.com/sync?${params}`);
    return res.json();
  } catch (err) {
    console.error('[AliExpress] Search error:', err);
    return { products: [], total: 0 };
  }
}

/** Place order via CJDropshipping */
export async function placeCJOrder(data: {
  supplierSku: string;
  quantity: number;
  address: ShippingAddress;
  orderNumber: string;
}) {
  if (!CJ_ACCESS_TOKEN) {
    console.log(`[CJ DEMO] Order: ${data.supplierSku} x${data.quantity}`);
    return { success: true, orderId: `CJ-DEMO-${Date.now()}`, trackingNumber: null };
  }

  try {
    const res = await fetch('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrder', {
      method: 'POST',
      headers: {
        'CJ-Access-Token': CJ_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderNumber: data.orderNumber,
        shippingCountryCode: data.address.country || 'MN',
        shippingProvince: data.address.province,
        shippingCity: data.address.city,
        shippingAddress: data.address.address,
        shippingCustomerName: data.address.name,
        shippingPhone: data.address.phone,
        shippingZip: data.address.zip,
        products: [{ vid: data.supplierSku, quantity: data.quantity }],
      }),
    });

    const result = await res.json();
    return {
      success: result.result,
      orderId: result.data?.orderId || null,
      trackingNumber: result.data?.trackingNumber || null,
    };
  } catch (err) {
    console.error('[CJ] Order error:', err);
    return { success: false, orderId: null, trackingNumber: null };
  }
}

/** Check CJ order tracking */
export async function getCJTracking(orderId: string) {
  if (!CJ_ACCESS_TOKEN) return { status: 'DEMO', events: [] };

  try {
    const res = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/shopping/order/getOrderDetail?orderId=${orderId}`, {
      headers: { 'CJ-Access-Token': CJ_ACCESS_TOKEN },
    });
    return res.json();
  } catch {
    return { status: 'ERROR', events: [] };
  }
}
