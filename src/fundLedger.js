export const total = rows => rows.reduce((sum, row) => sum + Math.round(Number(row.amount || 0) * 100), 0) / 100
export const monthOf = row => row.date?.slice(0, 7) || row.month || ''
// Partition before search so filtering the cards never duplicates income below them.
export function contributionSummary(members, donations) {
  const memberIds = new Set(members.map(member => member.id))
  const amounts = new Map()
  const otherIncome = []
  for (const row of donations) {
    if (!memberIds.has(row.memberId)) { otherIncome.push(row); continue }
    amounts.set(row.memberId, (amounts.get(row.memberId) || 0) + Math.round(Number(row.amount || 0) * 100))
  }
  const people = members.filter(member => member.status !== 'inactive' || amounts.has(member.id))
  return { amounts, people, otherIncome, contributed: amounts.size, notContributed: people.filter(member => !amounts.has(member.id)).length }
}
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
