/**
 * ДАН (Дижитал Аюулгүй Нэвтрэлт) — E-Mongolia SSO
 *
 * Auth:     https://sso.gov.mn/oauth2/authorize
 * Token:    https://sso.gov.mn/oauth2/token
 * UserInfo: https://sso.gov.mn/oauth2/userinfo
 *
 * Env: DAN_CLIENT_ID, DAN_CLIENT_SECRET, DAN_REDIRECT_URI
 */

const AUTH_URL = 'https://sso.gov.mn/oauth2/authorize';
const TOKEN_URL = 'https://sso.gov.mn/oauth2/token';
const USERINFO_URL = 'https://sso.gov.mn/oauth2/userinfo';

interface DANTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface DANUser {
  register_number: string;   // Регистрийн дугаар
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
}

export function getAuthURL(state?: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.DAN_CLIENT_ID || '',
    redirect_uri: process.env.DAN_REDIRECT_URI || '',
    scope: 'openid profile phone email',
    ...(state ? { state } : {}),
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<DANTokens> {
  // In production, call ДАН token endpoint:
  // const res = await fetch(TOKEN_URL, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //   body: new URLSearchParams({
  //     grant_type: 'authorization_code',
  //     code,
  //     client_id: process.env.DAN_CLIENT_ID || '',
  //     client_secret: process.env.DAN_CLIENT_SECRET || '',
  //     redirect_uri: process.env.DAN_REDIRECT_URI || '',
  //   }),
  // });

  // Mock response
  return {
    access_token: `dan_mock_${code}_${Date.now()}`,
    refresh_token: `dan_refresh_${Date.now()}`,
    token_type: 'Bearer',
    expires_in: 3600,
  };
}

export async function getUserInfo(accessToken: string): Promise<DANUser> {
  // In production, call ДАН userinfo:
  // const res = await fetch(USERINFO_URL, {
  //   headers: { 'Authorization': `Bearer ${accessToken}` },
  // });

  // Mock response
  return {
    register_number: 'УА90112233',
    first_name: 'Бат',
    last_name: 'Дорж',
    phone: '99112233',
    email: 'bat.dorj@example.mn',
  };
}

export const dan = { getAuthURL, exchangeCode, getUserInfo };
export default dan;
