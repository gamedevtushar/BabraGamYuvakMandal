import test from 'node:test'
import assert from 'node:assert/strict'
import { total, monthlyLedger, monthOf } from '../src/fundLedger.js'
test('amounts use integer paise to avoid floating point balance errors',()=>{assert.equal(total([{amount:.1},{amount:.2}]),.3);assert.equal(total([{amount:'200'},{amount:150}]),350)})
test('closing balances carry across gaps and expense-only months',()=>{assert.deepEqual(monthlyLedger([{date:'2025-01-01',amount:200},{date:'2025-03-01',amount:50}],[{date:'2025-02-01',amount:75},{date:'2025-03-02',amount:10}]),[{month:'2025-03',income:50,out:10,balance:165},{month:'2025-02',income:0,out:75,balance:125},{month:'2025-01',income:200,out:0,balance:200}])})
test('legacy month fallback and empty ledger',()=>{assert.equal(monthOf({month:'2024-01'}),'2024-01');assert.deepEqual(monthlyLedger([],[]),[])})
