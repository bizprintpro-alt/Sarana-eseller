/**
 * Enterprise role-based permission system
 */

export type EnterpriseRole = 'OWNER' | 'MANAGER' | 'WAREHOUSE' | 'MARKETER' | 'ACCOUNTANT';

export const ROLE_LABELS: Record<EnterpriseRole, string> = {
  OWNER: 'Эзэмшигч',
  MANAGER: 'Менежер',
  WAREHOUSE: 'Агуулахын ажилтан',
  MARKETER: 'Маркетер',
  ACCOUNTANT: 'Нягтлан бодогч',
};

export const PERMISSIONS: Record<EnterpriseRole, string[]> = {
  OWNER: ['*'],
  MANAGER: ['products.*', 'orders.*', 'analytics.view', 'customers.view'],
  WAREHOUSE: ['products.stock', 'orders.view', 'inventory.*'],
  MARKETER: ['products.view', 'banners.*', 'homepage.*', 'content.*', 'analytics.view'],
  ACCOUNTANT: ['analytics.*', 'revenue.*', 'payout.*', 'orders.view'],
};

export const PLAN_LIMITS: Record<string, { maxUsers: number; price: number }> = {
  STARTER: { maxUsers: 5, price: 500000 },
  BUSINESS: { maxUsers: 20, price: 1500000 },
  CORPORATE: { maxUsers: 999, price: 0 },
};

export function hasPermission(role: EnterpriseRole, permission: string): boolean {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes('*')) return true;
  return perms.some(
    (p) => p === permission || (p.endsWith('.*') && permission.startsWith(p.slice(0, -2)))
  );
}

export function getAllPermissions(role: EnterpriseRole): string[] {
  return PERMISSIONS[role] || [];
}
