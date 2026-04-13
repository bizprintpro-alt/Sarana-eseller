/**
 * eseller.mn — Design System Constants
 */

export const C = {
  brand: '#E8242C',
  bg: '#0A0A0A',
  card: '#141414',
  section: '#1A1A1A',
  border: '#222',
  text: '#EFEFEF',
  sub: '#999',
  muted: '#555',
  success: '#34A853',
  gold: '#F9A825',
  buyer: '#1A73E8',
  store: '#0D9E5C',
  seller: '#E37400',
  driver: '#C62828',
  white: '#fff',
  black: '#000',
};

export const R = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };

export function roleColor(role: string) {
  return (
    { BUYER: C.buyer, STORE: C.store, SELLER: C.seller, DRIVER: C.driver } as Record<string, string>
  )[role] ?? C.brand;
}
