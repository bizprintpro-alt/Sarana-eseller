import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getShopBySlug } from '@/lib/shop-data';
import { SERVICE_INDUSTRIES } from '@/lib/types/service';
import ServiceProfileClient from '@/components/service-profile/ServiceProfileClient';

type Props = { params: Promise<{ shopSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shopSlug } = await params;
  const data = await getShopBySlug(shopSlug);

  if (!data) {
    return { title: 'Олдсонгүй — eseller.mn' };
  }

  const { shop, services } = data;
  const industryLabel = SERVICE_INDUSTRIES.find((i) => i.value === shop.industry)?.label || '';
  const serviceNames = services.slice(0, 3).map((s) => s.name).join(', ');

  const title = `${shop.name} — ${industryLabel || 'Үйлчилгээ'} | eseller.mn`;
  const description = shop.description
    || `${shop.name} — ${industryLabel}. ${serviceNames}${services.length > 3 ? ` болон бусад ${services.length - 3} үйлчилгээ` : ''}. Онлайнаар цаг захиалах.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'eseller.mn',
      url: `https://eseller.mn/s/${shop.slug}`,
      images: shop.logo ? [{ url: shop.logo, width: 400, height: 400, alt: shop.name }] : [],
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    other: {
      'business:contact_data:street_address': shop.address || '',
      'business:contact_data:phone_number': shop.phone || '',
    },
  };
}

export default async function ShopProfilePage({ params }: Props) {
  const { shopSlug } = await params;
  const data = await getShopBySlug(shopSlug);

  if (!data) notFound();

  return <ServiceProfileClient data={data} />;
}
