import { redirect } from 'next/navigation';

export default function DomainRedirect() {
  redirect('/dashboard/store/settings');
}
