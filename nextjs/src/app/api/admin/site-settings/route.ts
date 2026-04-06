import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CONFIG_KEY = 'site_settings';

export interface SiteSettings {
  announcementBar: { text: string; bgColor: string; textColor: string; link: string; isVisible: boolean };
  statsBar: { icon: string; number: string; label: string }[];
  footerColumns: { title: string; links: { label: string; href: string }[] }[];
  paymentIcons: { qpay: boolean; visa: boolean; mastercard: boolean; socialpay: boolean };
  copyrightText: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  announcementBar: {
    text: '🎉 Бүх барааг үнэгүй хүргэнэ — 50,000₮-с дээш захиалгад!',
    bgColor: '#E8242C',
    textColor: '#FFFFFF',
    link: '/store',
    isVisible: true,
  },
  statsBar: [
    { icon: '🚚', number: '50,000+', label: 'Хүргэлт хийгдсэн' },
    { icon: '🏪', number: '500+', label: 'Дэлгүүр' },
    { icon: '⭐', number: '4.8', label: 'Үнэлгээ' },
  ],
  footerColumns: [
    { title: 'Дэлгүүр', links: [{ label: 'Бүх бараа', href: '/store' }, { label: 'Зарын булан', href: '/feed' }, { label: 'Дэлгүүрүүд', href: '/shops' }] },
    { title: 'Компани', links: [{ label: 'Бидний тухай', href: '/about' }, { label: 'Холбоо барих', href: '/contact' }] },
    { title: 'Тусламж', links: [{ label: 'Буцаалт', href: '/returns' }, { label: 'Хүргэлт', href: '/delivery' }] },
    { title: 'Хууль', links: [{ label: 'Үйлчилгээний нөхцөл', href: '/terms' }, { label: 'Нууцлал', href: '/privacy' }] },
  ],
  paymentIcons: { qpay: true, visa: true, mastercard: true, socialpay: true },
  copyrightText: `© ${new Date().getFullYear()} eseller.mn — Борлуулагчтай л борлуулалт байна`,
};

// GET
export async function GET() {
  try {
    const record = await prisma.platformConfig.findUnique({ where: { key: CONFIG_KEY } });
    if (record) {
      return NextResponse.json(JSON.parse(record.value));
    }
    return NextResponse.json(DEFAULT_SETTINGS);
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

// PUT
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    await prisma.platformConfig.upsert({
      where: { key: CONFIG_KEY },
      create: { key: CONFIG_KEY, value: JSON.stringify(body) },
      update: { value: JSON.stringify(body) },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
