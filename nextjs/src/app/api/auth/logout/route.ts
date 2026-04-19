import { ok } from '@/lib/api-envelope';

// Clear the httpOnly auth-token cookie used by Edge middleware role
// enforcement. Client-side localStorage is cleared separately in
// AuthProvider.logout(). Kept POST-only so CSRF-style GET navigations
// don't accidentally sign the user out.
export async function POST() {
  const res = ok({ ok: true });
  res.cookies.delete('auth-token');
  return res;
}
