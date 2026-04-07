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
  influencerBonus: number
  netSeller?: number
  netAgent?: number
  ownerAmount: number
}

export interface TaxSettings {
  vatEnabled: boolean
  incomeTaxEnabled: boolean
  cityTaxEnabled: boolean
  vatRate: number
  cityTaxRate: number
  incomeTaxRate: number
}

const DEFAULT_TAX: TaxSettings = {
  vatEnabled: false,
  incomeTaxEnabled: false,
  cityTaxEnabled: false,
  vatRate: 10,
  cityTaxRate: 2,
  incomeTaxRate: 10,
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
  influencerBonus?: number
  taxSettings?: Partial<TaxSettings>
}): FullCommissionResult {
  const {
    saleAmount,
    type,
    sellerRate = 0,
    agentRate = 0,
    companyRate = 95,
    vatRegistered = false,
    platformRate = 2,
    influencerBonus = 0,
  } = params

  const tax = { ...DEFAULT_TAX, ...params.taxSettings }

  // НӨАТ — toggle-оос хамаарна
  const vatAmount = (tax.vatEnabled && vatRegistered)
    ? Math.round(saleAmount * tax.vatRate / (100 + tax.vatRate))
    : 0
  const cityTax = (tax.cityTaxEnabled && vatRegistered)
    ? Math.round(saleAmount * tax.cityTaxRate / (100 + tax.vatRate))
    : 0
  const netAmount = saleAmount - vatAmount - cityTax
  const platformFee = Math.round(netAmount * platformRate / 100)

  if (type === 'STORE' || type === 'LISTING') {
    const effectiveRate = sellerRate + influencerBonus
    const sellerGross = Math.round(netAmount * effectiveRate / 100)
    const incomeTax = tax.incomeTaxEnabled ? Math.round(sellerGross * tax.incomeTaxRate / 100) : 0
    const netSeller = sellerGross - incomeTax
    const ownerAmount = netAmount - platformFee - sellerGross
    return {
      saleAmount, vatAmount, cityTax, netAmount,
      platformFee, sellerGross, incomeTax, influencerBonus,
      netSeller, ownerAmount,
    }
  }

  if (type === 'PARTNER') {
    const agentGross = Math.round(netAmount * agentRate / 100)
    const incomeTax = tax.incomeTaxEnabled ? Math.round(agentGross * tax.incomeTaxRate / 100) : 0
    const netAgent = agentGross - incomeTax
    const companyAmount = Math.round(netAmount * companyRate / 100)
    const ownerAmount = netAmount - platformFee - agentGross
    return {
      saleAmount, vatAmount, cityTax, netAmount,
      platformFee, agentGross, companyAmount,
      incomeTax, influencerBonus, netAgent, ownerAmount,
    }
  }

  return {
    saleAmount, vatAmount, cityTax, netAmount,
    platformFee, incomeTax: 0, influencerBonus: 0,
    ownerAmount: netAmount - platformFee,
  }
}
