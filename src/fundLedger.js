export const total = rows => rows.reduce((sum, row) => sum + Math.round(Number(row.amount || 0) * 100), 0) / 100
export const monthOf = row => row.date?.slice(0, 7) || row.month || ''
export function monthlyLedger(donations, expenses) {
  const months = [...new Set([...donations, ...expenses].map(monthOf).filter(Boolean))].sort()
  let balance = 0
  return months.map(month => {
    const income = total(donations.filter(row => monthOf(row) === month))
    const out = total(expenses.filter(row => monthOf(row) === month))
    balance = Math.round((balance + income - out) * 100) / 100
    return { month, income, out, balance }
  }).reverse()
}
export const localDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
