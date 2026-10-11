import test from 'node:test'
import assert from 'node:assert/strict'
import { createAppHistory } from '../src/lib/appHistory.js'
import { registerBackLayer, dismissBackLayer } from '../src/lib/backLayers.js'
import { memberName } from '../src/fund/memberNames.js'

test('native Back retains the current route until the app handles it, including direct launches and reloads', () => {
  const pushes = [], handlers = new Map()
  const win = {
    location:{href:'https://example.com/fund/#/members'},
    history:{state:{idx:0},pushState(state,_,url){this.state=state;win.location.href=url;pushes.push(url)}},
    addEventListener(name,fn){handlers.set(name,fn)}, removeEventListener(name){handlers.delete(name)},
  }
  let backs=0
  const guard=createAppHistory(win,()=>backs++)
  assert.equal(pushes.length,1)
  win.location.href='https://example.com/fund/#/reports'
  win.history.state={idx:1}
  guard.remember()
  // The browser first travels to an older route; the guard restores Reports before dispatch.
  win.location.href='https://example.com/fund/#/members'
  let stopped=false
  handlers.get('popstate')({stopImmediatePropagation(){stopped=true}})
  assert.equal(stopped,true)
  assert.equal(win.location.href,'https://example.com/fund/#/reports')
  assert.equal(win.history.state.idx,1)
  assert.equal(backs,1)
  guard.dispose()
  const before=pushes.length
  createAppHistory(win,()=>{}).dispose()
  assert.equal(pushes.length,before) // Reloading an already guarded entry adds no extra guard.
})
test('Back dismisses confirmation, then dropdown, then underlying popup', () => {
  const closed=[]
  const removeModal=registerBackLayer(()=>closed.push('modal'),10)
  const removeSelect=registerBackLayer(()=>closed.push('select'),30)
  const removeConfirm=registerBackLayer(()=>closed.push('confirm'),40)
  assert.equal(dismissBackLayer(),true);removeConfirm()
  dismissBackLayer();removeSelect()
  dismissBackLayer();removeModal()
  assert.deepEqual(closed,['confirm','select','modal'])
  assert.equal(dismissBackLayer(),false)
})
test('Gujarati member names preserve English originals and allow corrected spellings', () => {
  const member={name:'Ajay Rameshbhai'}
  assert.equal(memberName(member,'gu'),'અજય રમેશભાઈ')
  assert.equal(memberName(member,'en'),'Ajay Rameshbhai')
  assert.equal(member.name,'Ajay Rameshbhai')
  assert.equal(memberName({name:'New Member',nameGu:'નવા સભ્ય'},'gu'),'નવા સભ્ય')
  assert.equal(memberName('તુષાર કાળુભાઈ','gu'),'તુષાર કાળુભાઈ')
  assert.equal(memberName(undefined,'gu'),'')
})
