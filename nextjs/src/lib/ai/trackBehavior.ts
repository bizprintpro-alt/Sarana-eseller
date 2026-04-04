// ══════════════════════════════════════════════════════════════
// Хэрэглэгчийн давтамжтай үйлдлийг бүртгэх
// Cart abandon, search no results, checkout drop зэрэг
// ══════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';

export async function trackUserBehavior(
  pattern: string,
  metadata?: Record<string, string | number>
) {
  try {
    await prisma.userBehaviorPattern.upsert({
      where: { pattern },
      create: { pattern, frequency: 1, userCount: 1, data: metadata ?? null },
      update: {
        frequency: { increment: 1 },
        lastSeen: new Date(),
        ...(metadata ? { data: metadata } : {}),
        userCount: { increment: 1 },
      },
    });
  } catch {
    // Silent fail — tracking should never break the app
  }
}

// Хэрэглэх газрууд:
// cart page:     trackUserBehavior('cart_abandon_checkout', { totalAmount })
// search page:   trackUserBehavior('search_no_results', { query })
// checkout page:  trackUserBehavior('checkout_drop_at_payment')
// product page:   trackUserBehavior('product_view_no_purchase', { productId })
// seller wizard:  trackUserBehavior('seller_wizard_abandoned', { step })
