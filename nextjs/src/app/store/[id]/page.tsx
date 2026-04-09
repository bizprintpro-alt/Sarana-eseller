import { redirect } from 'next/navigation';

// Legacy route — redirect to new product detail page
export default async function StoreProductRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/product/${id}`);
}
