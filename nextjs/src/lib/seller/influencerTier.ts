export type SellerType = 'REGULAR' | 'ACTIVE' | 'MICRO' | 'INFLUENCER' | 'MEGA'

export interface TierInfo {
  type: SellerType
  label: string
  emoji: string
  color: string
  minFollowers: number
  bonus: number
  description: string
}

export const SELLER_TIERS: TierInfo[] = [
  {
    type: 'REGULAR',
    label: 'Шинэ борлуулагч',
    emoji: '🌱',
    color: '#94A3B8',
    minFollowers: 0,
    bonus: 0,
    description: 'Бүртгэлтэй, дагагчийн тоо хамаагүй',
  },
  {
    type: 'ACTIVE',
    label: 'Идэвхтэй',
    emoji: '⭐',
    color: '#10B981',
    minFollowers: 0,
    bonus: 1,
    description: '10+ амжилттай борлуулалт',
  },
  {
    type: 'MICRO',
    label: 'Микро инфлюэнсер',
    emoji: '🏅',
    color: '#3B82F6',
    minFollowers: 1000,
    bonus: 2,
    description: '1,000+ дагагч, сарын 20+ борлуулалт',
  },
  {
    type: 'INFLUENCER',
    label: 'Инфлюэнсер',
    emoji: '🌟',
    color: '#F59E0B',
    minFollowers: 10000,
    bonus: 3,
    description: '10,000+ дагагч, гэрээт хамтын ажиллагаа',
  },
  {
    type: 'MEGA',
    label: 'Мега инфлюэнсер',
    emoji: '👑',
    color: '#EF4444',
    minFollowers: 100000,
    bonus: 5,
    description: '100,000+ дагагч, exclusive commission',
  },
]

export function getInfluencerBonus(sellerType: string): number {
  const tier = SELLER_TIERS.find((t) => t.type === sellerType)
  return tier?.bonus || 0
}

export function getTierInfo(sellerType: string): TierInfo {
  return SELLER_TIERS.find((t) => t.type === sellerType) || SELLER_TIERS[0]
}
