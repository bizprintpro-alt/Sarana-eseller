// ══════════════════════════════════════════════════════════════
// eseller.mn — Analytics Event Tracking (GA4 + extensible)
// ══════════════════════════════════════════════════════════════

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
}

export const analytics = {
  // Page view (auto-tracked by GA4, but useful for SPAs)
  pageView: (url: string) => gtag('config', process.env.NEXT_PUBLIC_GA_ID, { page_path: url }),

  // Product/item viewed
  viewItem: (item: { id: string; name: string; price: number; category?: string }) =>
    gtag('event', 'view_item', {
      currency: 'MNT',
      value: item.price,
      items: [{ item_id: item.id, item_name: item.name, price: item.price, item_category: item.category }],
    }),

  // Add to cart
  addToCart: (item: { id: string; name: string; price: number }, qty: number) =>
    gtag('event', 'add_to_cart', {
      currency: 'MNT',
      value: item.price * qty,
      items: [{ item_id: item.id, item_name: item.name, price: item.price, quantity: qty }],
    }),

  // Purchase
  purchase: (order: { id: string; total: number; items: { id: string; name: string; price: number; qty: number }[] }) =>
    gtag('event', 'purchase', {
      transaction_id: order.id,
      value: order.total,
      currency: 'MNT',
      items: order.items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.qty })),
    }),

  // Search
  search: (term: string) => gtag('event', 'search', { search_term: term }),

  // Entity profile viewed
  viewProfile: (type: string, slug: string) =>
    gtag('event', 'select_content', { content_type: type, item_id: slug }),

  // Sign up
  signUp: (method: string) => gtag('event', 'sign_up', { method }),

  // Login
  login: (method: string) => gtag('event', 'login', { method }),

  // Share
  share: (contentType: string, itemId: string) =>
    gtag('event', 'share', { content_type: contentType, item_id: itemId }),

  // Booking (service)
  booking: (service: { id: string; name: string; price: number }) =>
    gtag('event', 'begin_checkout', {
      currency: 'MNT',
      value: service.price,
      items: [{ item_id: service.id, item_name: service.name, price: service.price }],
    }),
};
