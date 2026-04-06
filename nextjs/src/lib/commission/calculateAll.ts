/**
 * Бүрэн commission тооцоо — Store, Listing, Partner
 * НӨАТ, ХХОАТ, хотын татвар бүгд оруулсан
 */

export interface FullCommissionResult {
  saleAmount: number
  vatAmount: number
  cityTax: number
  netAmount: number
  platformFee: number
  sellerGross?: number
  agentGross?: number
  companyAmount?: number
  incomeTax: number
  netSeller?: number
  netAgent?: number
  ownerAmount: number
}

export type CommissionType = 'STORE' | 'LISTING' | 'PARTNER'

export function calculateFullCommission(params: {
  saleAmount: number
  type: CommissionType
  sellerRate?: number
  agentRate?: number
  companyRate?: number
  vatRegistered?: boolean
  platformRate?: number
}): FullCommissionResult {
  const {
    saleAmount,
    type,
    sellerRate = 0,
    agentRate = 0,
    companyRate = 95,
    vatRegistered = false,
    platformRate = 2,
  } = params

  // НӨАТ тооцоо
  const vatAmount = vatRegistered ? Math.round(saleAmount * 10 / 110) : 0
  const cityTax = vatRegistered ? Math.round(saleAmount * 2 / 110) : 0
  const netAmount = saleAmount - vatAmount - cityTax
  const platformFee = Math.round(netAmount * platformRate / 100)

  if (type === 'STORE' || type === 'LISTING') {
    const sellerGross = Math.round(netAmount * sellerRate / 100)
    const incomeTax = Math.round(sellerGross * 0.10)
    const netSeller = sellerGross - incomeTax
    const ownerAmount = netAmount - platformFee - sellerGross
    return {
      saleAmount, vatAmount, cityTax, netAmount,
      platformFee, sellerGross, incomeTax, netSeller, ownerAmount,
    }
  }

  if (type === 'PARTNER') {
    const agentGross = Math.round(netAmount * agentRate / 100)
    const incomeTax = Math.round(agentGross * 0.10)
    const netAgent = agentGross - incomeTax
    const companyAmount = Math.round(netAmount * companyRate / 100)
    const ownerAmount = netAmount - platformFee - agentGross
    return {
      saleAmount, vatAmount, cityTax, netAmount,
      platformFee, agentGross, companyAmount,
      incomeTax, netAgent, ownerAmount,
    }
  }

  return {
    saleAmount, vatAmount, cityTax, netAmount,
    platformFee, incomeTax: 0,
    ownerAmount: netAmount - platformFee,
  }
}
