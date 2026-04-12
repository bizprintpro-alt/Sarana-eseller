import { redirect } from 'next/navigation';

export default function ThemesRedirect() {
  redirect('/dashboard/store/store-settings');
}
