import test from 'node:test'
import assert from 'node:assert/strict'
import { monthlyAmountFrom, initialEntryAmount, validAmount } from '../src/fund/preferences.js'
test('monthly setup defaults to 200 and accepts only positive amounts with two decimals', () => {
  assert.equal(monthlyAmountFrom(),200)
  assert.equal(monthlyAmountFrom({monthlyAmount:250.5}),250.5)
  for(const amount of [0,-50,Infinity,'bad',1.234]) {
    assert.equal(validAmount(amount),false)
    assert.equal(monthlyAmountFrom({monthlyAmount:amount}),200)
  }
})
test('defaults fill only new contributions and never replace existing records or expense values', () => {
  assert.equal(initialEntryAmount('donations',undefined,200),'200')
  assert.equal(initialEntryAmount('donations',undefined,250),'250')
  assert.equal(initialEntryAmount('donations',{amount:150},250),'150')
  assert.equal(initialEntryAmount('expenses',undefined,250),'')
  assert.equal(initialEntryAmount('expenses',{amount:850},250),'850')
})
