import test from 'node:test'
import assert from 'node:assert/strict'
import { FUND_SESSION_KEY, readFundSession, writeFundSession } from '../src/fund/session.js'

test('fund login survives a new reader and logout clears only the fund session',()=>{
  const data=new Map([['lang','gu']])
  const storage={getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)}
  assert.equal(readFundSession(storage),false)
  writeFundSession(storage,true)
  assert.equal(readFundSession({...storage}),true)
  assert.equal(data.get(FUND_SESSION_KEY),'admin')
  writeFundSession(storage,false)
  assert.equal(readFundSession({...storage}),false)
  assert.equal(data.get('lang'),'gu')
})

test('unavailable or unrecognized saved sessions do not grant editing access',()=>{
  assert.equal(readFundSession({getItem:()=> 'invalid'}),false)
  assert.equal(readFundSession({getItem:()=>{throw new Error('blocked')}}),false)
})
