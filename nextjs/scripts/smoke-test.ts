/**
 * eseller.mn — End-to-end Smoke Test
 * Usage: npx tsx scripts/smoke-test.ts
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';

interface Result {
  url: string;
  status: number;
  ok: boolean;
  label: string;
}

const ROUTES = [
  // Нийтийн хуудас
  { url: '/', label: 'Нүүр хуудас' },
  { url: '/store', label: 'Дэлгүүр' },
  { url: '/feed', label: 'Зарын булан' },
  { url: '/shops', label: 'Бүх дэлгүүр' },
  { url: '/about', label: 'Бидний тухай' },
  { url: '/privacy', label: 'Нууцлал' },
  { url: '/terms', label: 'Нөхцөл' },
  { url: '/help', label: 'Тусламж' },
  { url: '/contact', label: 'Холбоо барих' },
  { url: '/partner', label: 'Хамтрах' },
  { url: '/cart', label: 'Сагс' },
  { url: '/register', label: 'Бүртгэл' },
  { url: '/gold', label: 'Gold' },
  { url: '/search', label: 'Хайлт' },
  { url: '/compare', label: 'Харьцуулалт' },

  // Onboarding
  { url: '/open-shop', label: 'Дэлгүүр нээх' },
  { url: '/become-seller', label: 'Борлуулагч болох' },
  { url: '/become-driver', label: 'Жолооч болох' },

  // Dashboard (redirect to /login if not authed — 200 is ok)
  { url: '/dashboard', label: 'Dashboard' },
  { url: '/dashboard/admin', label: 'Admin dashboard' },
  { url: '/dashboard/admin/revenue', label: 'Admin revenue' },

  // API endpoints
  { url: '/api/stats', label: 'API stats' },
  { url: '/api/stores', label: 'API stores' },
];

async function testRoute(route: typeof ROUTES[0]): Promise<Result> {
  try {
    const res = await fetch(`${BASE}${route.url}`, {
      redirect: 'follow',
      headers: { 'User-Agent': 'eseller-smoke-test' },
    });
    return { url: route.url, status: res.status, ok: res.status < 400, label: route.label };
  } catch (e) {
    return { url: route.url, status: 0, ok: false, label: route.label };
  }
}

async function main() {
  console.log(`\n══════════════════════════════`);
  console.log(`eseller.mn SMOKE TEST — ${new Date().toISOString().split('T')[0]}`);
  console.log(`Base: ${BASE}`);
  console.log(`══════════════════════════════\n`);

  const results: Result[] = [];

  for (const route of ROUTES) {
    const result = await testRoute(route);
    results.push(result);

    const icon = result.status === 0 ? '💀' : result.ok ? '✅' : result.status >= 500 ? '⚠️' : '❌';
    console.log(`${icon} ${String(result.status).padStart(3)}  ${result.url.padEnd(35)} ${result.label}`);
  }

  const ok = results.filter(r => r.ok).length;
  const fail404 = results.filter(r => r.status >= 400 && r.status < 500).length;
  const fail500 = results.filter(r => r.status >= 500).length;
  const dead = results.filter(r => r.status === 0).length;

  console.log(`\n──────────────────────────────`);
  console.log(`Нийт: ${results.length} | ✅ ${ok} | ❌ ${fail404} | ⚠️ ${fail500} | 💀 ${dead}`);
  console.log(`──────────────────────────────`);

  // API stats check
  console.log(`\nAPI STATS шалгалт:`);
  try {
    const statsRes = await fetch(`${BASE}/api/stats`);
    const stats = await statsRes.json();
    console.log(`  products=${stats.productCount} shops=${stats.shopCount} users=${stats.userCount} orders=${stats.orderCount}`);
  } catch {
    console.log(`  ❌ /api/stats хандаж чадсангүй`);
  }

  // Failed routes
  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    console.log(`\n❌ АЛДААТАЙ ROUTE-УУД:`);
    failed.forEach(r => console.log(`  ${r.status} ${r.url} — ${r.label}`));
  } else {
    console.log(`\n✅ Бүх route амжилттай!`);
  }

  console.log(`\n══════════════════════════════\n`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main();
