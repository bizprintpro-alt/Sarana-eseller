/**
 * Системийн дүрэм — бүх тогтмол утгууд нэг газраас
 */

export const SYSTEM_RULES = {
  COMMISSION: {
    PLATFORM_FEE: 2,
    STORE_MIN: 5,
    STORE_MAX: 30,
    LISTING_MIN: 0,
    LISTING_MAX: 15,
    PARTNER_PLATFORM_FEE: 2,
    PARTNER_AGENT_MIN: 1,
    PARTNER_AGENT_MAX: 5,
  },
  VAT: {
    RATE: 10,
    CITY_TAX_RATE: 2,
    REGISTRATION_THRESHOLD: 50_000_000,
    WARNING_THRESHOLD: 40_000_000,
    INCOME_TAX_RATE: 10,
  },
  VERIFICATION: {
    CODE_EXPIRY_HOURS: 48,
    MAX_RETRY: 3,
  },
  TIER: {
    SELLER: [
      { name: 'Шинэ', min: 0, max: 5, bonus: 0 },
      { name: 'Идэвхтэй', min: 6, max: 20, bonus: 1 },
      { name: 'Гүйцэтгэгч', min: 21, max: 50, bonus: 2 },
      { name: 'Элит', min: 51, max: 100, bonus: 3 },
      { name: 'Легенд', min: 101, max: Infinity, bonus: 5 },
    ],
    AGENT: [
      { name: 'Junior', min: 0, max: 5, bonus: 0 },
      { name: 'Senior', min: 6, max: 20, bonus: 1 },
      { name: 'Expert', min: 21, max: 50, bonus: 2 },
      { name: 'Master', min: 51, max: Infinity, bonus: 3 },
    ],
  },
  STORE: {
    FREE_PRODUCTS: 20,
    PRO_PRICE_MONTHLY: 29_900,
    MAX_SELLERS_FREE: 3,
  },
  LISTING: {
    FREE_PER_MONTH: 5,
    MAX_IMAGES: 20,
    MAX_VIDEO_SEC: 120,
  },
  DISPUTE: {
    RESPONSE_HOURS: 48,
    AUTO_RESOLVE_DAYS: 7,
  },
} as const
