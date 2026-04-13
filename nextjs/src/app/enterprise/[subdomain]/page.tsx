import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ subdomain: string }>;
}

/**
 * Legacy route — redirects to /_shop/[slug] which is the new
 * subdomain-powered enterprise shop system.
 */
export default async function EnterpriseRedirect({ params }: Props) {
  const { subdomain } = await params;
  redirect(`/_shop/${subdomain}`);
}
