import { redirect } from 'next/navigation';

export default function StorefrontConfigRedirect() {
  redirect('/dashboard/store/store-settings');
}
