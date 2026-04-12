import { redirect } from 'next/navigation';

export default function StorefrontEditorRedirect() {
  redirect('/dashboard/store/store-settings');
}
