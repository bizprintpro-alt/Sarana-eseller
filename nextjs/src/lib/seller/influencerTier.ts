export type SellerType = 'REGULAR' | 'ACTIVE' | 'MICRO' | 'INFLUENCER' | 'MEGA'

export interface TierInfo {
  type: SellerType
  label: string
  emoji: string
  color: string
  minFollowers: number
  minMonthlySales: number
  bonus: number
  description: string
  requiresApproval: boolean
}

export const SELLER_TIERS: TierInfo[] = [
  {
    type: 'REGULAR',
    label: 'Шинэ борлуулагч',
    emoji: '🌱',
    color: '#94A3B8',
    minFollowers: 0,
    minMonthlySales: 0,
    bonus: 0,
    description: 'Бүртгэлтэй, дагагчийн тоо хамаагүй',
    requiresApproval: false,
  },
  {
    type: 'ACTIVE',
    label: 'Идэвхтэй',
    emoji: '⭐',
    color: '#10B981',
    minFollowers: 0,
    minMonthlySales: 10,
    bonus: 1,
    description: '10+ амжилттай борлуулалт',
    requiresApproval: false,
  },
  {
    type: 'MICRO',
    label: 'Микро инфлюэнсер',
    emoji: '📱',
    color: '#3B82F6',
    minFollowers: 1000,
    minMonthlySales: 20,
    bonus: 2,
    description: '1,000+ дагагч, сарын 20+ борлуулалт',
    requiresApproval: true,
  },
  {
    type: 'INFLUENCER',
    label: 'Инфлюэнсер',
    emoji: '🌟',
    color: '#F59E0B',
    minFollowers: 10000,
    minMonthlySales: 50,
    bonus: 3,
    description: '10,000+ дагагч, сарын 50+ борлуулалт',
    requiresApproval: true,
  },
  {
    type: 'MEGA',
    label: 'Мега инфлюэнсер',
    emoji: '👑',
    color: '#EF4444',
    minFollowers: 100000,
    minMonthlySales: 0,
    bonus: 5,
    description: '100,000+ дагагч, exclusive commission',
    requiresApproval: true,
  },
]

export function getInfluencerBonus(sellerType: string): number {
  const tier = SELLER_TIERS.find((t) => t.type === sellerType)
  return tier?.bonus || 0
}

export function getTierInfo(sellerType: string): TierInfo {
  return SELLER_TIERS.find((t) => t.type === sellerType) || SELLER_TIERS[0]
}

export function getNextTier(sellerType: string): TierInfo | null {
  const idx = SELLER_TIERS.findIndex((t) => t.type === sellerType)
  return idx >= 0 && idx < SELLER_TIERS.length - 1 ? SELLER_TIERS[idx + 1] : null
}

export function getApplicableTiers(): TierInfo[] {
  return SELLER_TIERS.filter((t) => t.requiresApproval)
}

export const MAX_COMMISSION_RATE = 30
