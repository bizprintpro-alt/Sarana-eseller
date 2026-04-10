import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FeedDetailClient from '@/components/product/FeedDetailClient';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isValidObjectId(id)) return { title: 'Олдсонгүй' };
  let post;
  try {
    post = await prisma.feedItem.findUnique({ where: { id }, select: { title: true, description: true, images: true } });
  } catch { return { title: 'Олдсонгүй' }; }
  if (!post) return { title: 'Олдсонгүй' };
  return {
    title: `${post.title} — eseller.mn`,
    description: post.description?.slice(0, 160) || post.title,
    openGraph: {
      title: post.title,
      description: post.description?.slice(0, 160) || post.title,
      images: post.images?.[0] ? [post.images[0]] : [],
    },
  };
}

export default async function FeedDetailPage({ params }: Props) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  let post;
  try {
    post = await prisma.feedItem.findUnique({
      where: { id },
    include: {
      media: { orderBy: { sortOrder: 'asc' } },
      agent: { select: { id: true, name: true, phone: true } },
      company: { select: { id: true, name: true, phone: true } },
      autoDealer: { select: { id: true, name: true, phone: true } },
      serviceProvider: { select: { id: true, name: true, phone: true } },
    },
  });
  } catch { notFound(); }

  if (!post) notFound();

  // Determine owner info
  const owner = post.agent || post.company || post.autoDealer || post.serviceProvider;

  const clientPost = {
    ...post,
    _id: post.id,
    media: post.media.map(m => ({
      id: m.id,
      type: m.type as 'IMAGE' | 'VIDEO' | 'VIRTUAL_TOUR' | 'FLOOR_PLAN',
      url: m.url,
      thumbnail: m.thumbnail,
      caption: m.caption,
      sortOrder: m.sortOrder,
    })),
    owner: owner ? { name: (owner as any).name, phone: (owner as any).phone } : null,
  };

  return <FeedDetailClient post={clientPost as any} />;
}
