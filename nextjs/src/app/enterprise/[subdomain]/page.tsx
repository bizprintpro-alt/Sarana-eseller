import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ subdomain: string }>;
}

/**
 * Legacy route — redirects to /shop-sub/[slug] which is the new
 * subdomain-powered enterprise shop system.
 */
export default async function EnterpriseRedirect({ params }: Props) {
  const { subdomain } = await params;
  redirect(`/shop-sub/${subdomain}`);
}
