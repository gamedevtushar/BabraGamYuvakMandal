import test from 'node:test'
import assert from 'node:assert/strict'
import { total, monthlyLedger, monthOf, contributionSummary } from '../src/fundLedger.js'
test('amounts use integer paise to avoid floating point balance errors',()=>{assert.equal(total([{amount:.1},{amount:.2}]),.3);assert.equal(total([{amount:'200'},{amount:150}]),350)})
test('closing balances carry across gaps and expense-only months',()=>{assert.deepEqual(monthlyLedger([{date:'2025-01-01',amount:200},{date:'2025-03-01',amount:50}],[{date:'2025-02-01',amount:75},{date:'2025-03-02',amount:10}]),[{month:'2025-03',income:50,out:10,balance:165},{month:'2025-02',income:0,out:75,balance:125},{month:'2025-01',income:200,out:0,balance:200}])})
test('legacy month fallback and empty ledger',()=>{assert.equal(monthOf({month:'2024-01'}),'2024-01');assert.deepEqual(monthlyLedger([],[]),[])})
test('member cards exclude their income from other entries without losing unmatched income', () => {
  const members = [{id:'a'}, {id:'b'}, {id:'c',status:'inactive'}, {id:'d',status:'inactive'}]
  const donations = [{memberId:'a',amount:100.1}, {memberId:'a',amount:100.2}, {memberId:'c',amount:50}, {memberId:'deleted',amount:75}, {amount:25}]
  const summary = contributionSummary(members, donations)
  assert.equal(summary.amounts.get('a'),20030)
  assert.deepEqual(summary.people.map(member => member.id),['a','b','c'])
  assert.equal(summary.contributed,2)
  assert.equal(summary.notContributed,1)
  assert.deepEqual(summary.otherIncome,donations.slice(3))
  assert.equal(total(summary.otherIncome),100)
  assert.equal(total(donations),350.3)
  // A card search does not change the other income partition.
  assert.equal(summary.people.filter(member => member.id === 'b').length,1)
  assert.deepEqual(summary.otherIncome,donations.slice(3))
})
