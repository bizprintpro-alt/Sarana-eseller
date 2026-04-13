import { getShopConfig, type ShopConfig } from '@/lib/shop-cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = await getShopConfig(slug);

  // Subdomain олдохгүй → eseller.mn руу redirect
  if (!config) redirect('https://eseller.mn');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Branded Header */}
      <header
        style={{
          background: config.primaryColor,
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <Link href={`/_shop/${config.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          {config.logoUrl ? (
            <img src={config.logoUrl} style={{ height: 36, borderRadius: 4 }} alt={config.name} />
          ) : null}
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>
            {config.name}
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link href={`/_shop/${config.slug}`} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none' }}>
            Нүүр
          </Link>
          <Link href={`/_shop/${config.slug}/products`} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none' }}>
            Бараа
          </Link>
          <Link href={`/_shop/${config.slug}/about`} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none' }}>
            Бидний тухай
          </Link>
          <Link href="/cart" style={{ color: '#fff', marginLeft: 8, fontSize: 18 }}>
            🛒
          </Link>
        </nav>
      </header>

      {/* Dynamic CSS variables */}
      <style>{`
        :root {
          --brand-primary: ${config.primaryColor};
          --brand-accent: ${config.accentColor};
        }
      `}</style>

      {/* Content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Footer */}
      <footer
        style={{
          background: config.primaryColor,
          color: 'rgba(255,255,255,0.6)',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: 12,
        }}
      >
        {config.name} · Powered by{' '}
        <a href="https://eseller.mn" style={{ color: '#fff', textDecoration: 'none' }}>
          eseller.mn
        </a>
        {config.phone && <span> · {config.phone}</span>}
      </footer>
    </div>
  );
}
