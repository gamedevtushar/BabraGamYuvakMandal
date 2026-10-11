import test from 'node:test'
import assert from 'node:assert/strict'
import {saveAndShareReportFile,shareReportFile} from '../src/fund/reportShare.js'

const file=new File(['report'],'BabraGamYuvakMandal-2026-10-report.png',{type:'image/png'})
test('saves the PNG and invokes the file share chooser in the same click turn',async()=>{
  const calls=[]
  const shareApi={
    canShare:data=>{assert.deepEqual(data,{files:[file]});return true},
    share:data=>{calls.push('share');assert.deepEqual(data,{files:[file],title:'Babra Gam Yuvak Mandal'});return Promise.resolve()},
  }
  const result=saveAndShareReportFile(file,'Babra Gam Yuvak Mandal',{save:saved=>{assert.equal(saved,file);calls.push('save')},shareApi})
  // No rendering, encoding, or asynchronous wait may precede navigator.share.
  assert.deepEqual(calls,['save','share'])
  assert.equal(await result,'shared')
})
test('downloads without invoking unsupported native file sharing',async()=>{
  for(const shareApi of [{},{share(){assert.fail('unsupported files must not be shared')},canShare:()=>false}]){
    let downloads=0
    assert.equal(await saveAndShareReportFile(file,'Report',{save:()=>downloads++,shareApi}),'unsupported')
    assert.equal(downloads,1)
  }
})
test('cancelling the share chooser leaves the download successful',async()=>{
  let downloads=0
  const shareApi={canShare:()=>true,share:async()=>{throw new DOMException('Cancelled','AbortError')}}
  assert.equal(await saveAndShareReportFile(file,'Report',{save:()=>downloads++,shareApi}),'cancelled')
  assert.equal(downloads,1)
})
test('a browser blocking automatic share can retry the same saved file without another download',async()=>{
  let downloads=0,shares=0
  const shareApi={canShare:()=>true,share:async()=>{shares++;if(shares===1)throw new DOMException('Tap required','NotAllowedError')}}
  await assert.rejects(saveAndShareReportFile(file,'Report',{save:()=>downloads++,shareApi}),{name:'NotAllowedError'})
  assert.equal(await shareReportFile(file,'Report',shareApi),'shared')
  assert.equal(downloads,1)
  assert.equal(shares,2)
})
