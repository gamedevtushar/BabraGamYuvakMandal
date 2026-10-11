export const DEFAULT_MONTHLY_AMOUNT = 200
export const validAmount = value => {
  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0 && amount <= 1e8 && Math.abs(amount * 100 - Math.round(amount * 100)) < .00001
}
export const monthlyAmountFrom = data => validAmount(data?.monthlyAmount) ? Number(data.monthlyAmount) : DEFAULT_MONTHLY_AMOUNT
export const initialEntryAmount = (kind, row, monthlyAmount) => String(row?.amount ?? (kind === 'donations' ? monthlyAmount : ''))
