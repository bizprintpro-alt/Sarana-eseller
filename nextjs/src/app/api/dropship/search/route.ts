import { NextRequest, NextResponse } from 'next/server'
import { requireSeller } from '@/lib/api-auth'

// AliExpress RapidAPI хайлт
async function searchAliExpress(keyword: string, page = 1) {
  const res = await fetch(
    `https://aliexpress-datahub.p.rapidapi.com/item_search?q=${encodeURIComponent(keyword)}&page=${page}`,
    {
      headers: {
        'x-rapidapi-host': 'aliexpress-datahub.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
      },
      signal: AbortSignal.timeout(10000),
    },
  )
  if (!res.ok) throw new Error('AliExpress API алдаа')
  return res.json()
}

// CJ Dropshipping API хайлт
async function searchCJDropshipping(keyword: string) {
  const authRes = await fetch(
    'https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.CJ_EMAIL || '',
        password: process.env.CJ_PASSWORD || '',
      }),
    },
  )
  const auth = await authRes.json()
  const token = auth.data?.accessToken
  if (!token) throw new Error('CJ auth алдаа')

  const res = await fetch(
    `https://developers.cjdropshipping.com/api2.0/v1/product/list?productName=${encodeURIComponent(keyword)}&pageNum=1&pageSize=20`,
    { headers: { 'CJ-Access-Token': token } },
  )
  return res.json()
}

export async function GET(req: NextRequest) {
  const auth = requireSeller(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const source = searchParams.get('source') || 'aliexpress'
  const page = parseInt(searchParams.get('page') || '1')

  if (!q) return NextResponse.json({ error: 'Хайлтын үг оруулна уу' }, { status: 400 })

  try {
    let products: any[] = []

    if (source === 'aliexpress') {
      const data = await searchAliExpress(q, page)
      products = (data.result?.items || data.items || []).map((item: any) => ({
        supplierId: String(item.itemId || item.productId),
        supplierName: 'aliexpress',
        name: item.title || item.productTitle,
        supplierPrice: parseFloat(item.sku?.def?.promotionPrice || item.price?.minPrice || 0),
        supplierCurrency: 'USD',
        images: item.image ? [item.image] : [],
        supplierUrl: `https://www.aliexpress.com/item/${item.itemId}.html`,
        supplierStock: item.totalAvailQuantity || 999,
        rating: item.averageStar || 0,
        orders: item.totalOrders || 0,
        shipping: item.logistics?.deliveryDays || '15-30 хоног',
      }))
    } else if (source === 'cj') {
      const data = await searchCJDropshipping(q)
      products = (data.data?.list || []).map((item: any) => ({
        supplierId: item.pid,
        supplierName: 'cj',
        name: item.productName,
        supplierPrice: parseFloat(item.sellPrice || 0),
        supplierCurrency: 'USD',
        images: item.productImage ? [item.productImage] : [],
        supplierUrl: `https://cjdropshipping.com/product/${item.pid}.html`,
        supplierStock: item.inventory || 0,
        shipping: item.logisticsTime || '7-15 хоног',
      }))
    }

    return NextResponse.json({ products, source, query: q })
  } catch {
    // Fallback — demo data (API key байхгүй үед)
    const demo = Array.from({ length: 8 }, (_, i) => ({
      supplierId: `demo-${i + 1}`,
      supplierName: source,
      name: `${q} — Бараа ${i + 1}`,
      supplierPrice: Math.round(Math.random() * 50 + 5),
      supplierCurrency: 'USD',
      images: [`https://picsum.photos/300/300?random=${i}`],
      supplierUrl: `https://${source}.com/item/${i + 1}`,
      supplierStock: Math.round(Math.random() * 500 + 10),
      shipping: '15-30 хоног',
    }))
    return NextResponse.json({ products: demo, source, query: q, demo: true })
  }
}
