import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { ArrowDownCircle, ArrowUpCircle, Users, KeyRound, LogIn, LogOut, Languages, SunMoon, ALargeSmall, Vibrate, ChevronRight, Download, Plus, Check, Coins } from 'lucide-react'
import { useAuth, roleLabel } from '../context/AuthContext'
import { useFund } from './Context'
import { fundDb } from '../fundStore'
import { localDate } from '../fundLedger'
import { t, displayName, locale, LangSwitch } from '../i18n'
import { ThemeSwitch, TextSizeSwitch } from '../theme'
import { useFeedback, setFeedback } from '../lib/feedback'
import { useInstall, promptInstall } from '../pwa'
import { inr } from '../lib/format'
import { Modal, Button, Field, Input, AmountInput, DateField, Select, Chips, IconTile, cx, toast, confirmDialog } from '../components/ui'
import LogoMark from '../components/Logo'
import { memberName } from './memberNames'
import { initialEntryAmount, validAmount } from './preferences'
let setCurrent=()=>{}
export const forms={open:(type,props={})=>setCurrent({type,props,key:Math.random()}),close:()=>setCurrent(null)}
export function FormHost(){
 const [current,set]=useState(null)
 useEffect(()=>{setCurrent=set;return()=>{setCurrent=()=>{}}},[])
 const Component=current&&({quickAdd:QuickAdd,more:More,password:Password,monthlyAmount:MonthlyAmount,entry:Entry,member:Member,memberHistory:MemberHistory})[current.type]
 return <AnimatePresence mode="wait">{Component&&<Component key={current.key} {...current.props} onClose={()=>set(null)}/>}</AnimatePresence>
}
export async function startInstall(canPrompt){if(canPrompt&&await promptInstall())return;toast.info(t('fund.installHint'),{duration:10000})}
function QuickAdd({onClose}){
 const {isAdmin}=useAuth()
 const actions=[['entry','donations',ArrowDownCircle,'green','fund.addIn'],['entry','expenses',ArrowUpCircle,'red','fund.addOut'],['member',null,Users,'indigo','fund.addMember']]
 return <Modal title={t('quickAdd')} onClose={onClose}>{isAdmin?<div className="grid grid-cols-2 gap-2.5">{actions.map(([type,kind,Icon,tone,key],i)=><motion.button key={key} whileTap={{scale:.96}} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*.04}} onClick={()=>forms.open(type,{kind})} className="flex flex-col items-start gap-3 rounded-2xl border border-fg/10 bg-fg/[0.04] p-4 text-left hover:bg-fg/[0.08] cursor-pointer"><IconTile icon={Icon} tone={tone}/><p className="text-sm font-semibold text-fg">{t(key)}</p></motion.button>)}</div>:<p>{t('fund.authNeeded')}</p>}</Modal>
}
function More({onClose}){
 const {isLoggedIn,signOut}=useAuth(),{canPrompt,installed}=useInstall(),sound=useFeedback(),navigate=useNavigate()
 const {monthlyAmount}=useFund()
 const go=path=>{onClose();navigate(path)}
 const Row=({icon:Icon,label,onClick,children,danger})=><div className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-base text-fg"><IconTile icon={Icon} tone={danger?'red':'gray'} className="size-9" iconClass="size-[1.125rem]"/>{onClick?<button onClick={onClick} className={cx('flex min-w-0 flex-1 items-center justify-between py-1 text-left cursor-pointer',danger&&'text-bad')}>{label}<ChevronRight className="size-4 text-subtle"/></button>:<><span className="flex-1">{label}</span>{children}</>}</div>
 return <Modal title={isLoggedIn?t('fund.admin'):t('menu')} subtitle={roleLabel(isLoggedIn?'admin':'public')} onClose={onClose}><div className="space-y-1">
 {!installed&&<button onClick={()=>startInstall(canPrompt)} className="mb-2 flex w-full items-center gap-3 rounded-2xl border border-accent/25 bg-accent/[0.07] p-3 text-left cursor-pointer"><LogoMark className="size-10"/><span className="flex-1"><span className="block font-semibold text-fg">{t('pwa.install')}</span><span className="block text-xs text-muted">{t('pwa.installHint')}</span></span><Download className="size-5 text-accent-ink"/></button>}
 <Row icon={Users} label={t('fund.members')} onClick={()=>go('/members')}/>{isLoggedIn&&<Row icon={Coins} label={`${t('fund.monthlyAmount')} · ${inr(monthlyAmount)}`} onClick={()=>forms.open('monthlyAmount')}/>}<div className="my-2 h-px bg-fg/10"/>
 <Row icon={Languages} label={t('language')}><LangSwitch/></Row><Row icon={SunMoon} label={t('theme')}><ThemeSwitch/></Row><Row icon={ALargeSmall} label={t('textSize')}><TextSizeSwitch/></Row>
 <Row icon={Vibrate} label={t('feedback')}><button type="button" role="switch" aria-checked={sound} aria-label={t('feedback')} onClick={()=>setFeedback(!sound)} className={cx('relative h-7 w-12 shrink-0 rounded-full transition-colors cursor-pointer',sound?'bg-accent':'bg-fg/20')}><span className={cx('absolute top-0.5 size-6 rounded-full bg-white shadow transition-all',sound?'left-[1.375rem]':'left-0.5')}/></button></Row>
 <div className="my-2 h-px bg-fg/10"/>
 {isLoggedIn?<><Row icon={KeyRound} label={t('changePassword')} onClick={()=>forms.open('password')}/><Row icon={LogOut} label={t('signOut')} danger onClick={async()=>{if(await confirmDialog({title:t('signOut'),message:t('confirm.signOut'),confirmText:t('signOut'),tone:'primary'})){signOut();onClose()}}}/></>:<Button size="lg" icon={LogIn} className="mt-1 w-full" onClick={()=>go('/login')}>{t('public.login')}</Button>}
 </div></Modal>
}
const ErrorLine=({error})=>error&&<p role="alert" className="rounded-xl border border-bad/25 bg-bad/10 px-3 py-2 text-sm text-bad">{error}</p>
function useFormClose(onClose,busy){
 const [dirty,setDirty]=useState(false),[asking,setAsking]=useState(false)
 const markDirty=()=>setDirty(true)
 const close=async()=>{
  if(busy||asking)return
  if(!dirty){onClose();return}
  setAsking(true)
  try{if(await confirmDialog({title:t('fund.discardTitle'),message:t('fund.discardMessage'),confirmText:t('fund.discard')}))onClose()}finally{setAsking(false)}
 }
 return {close,markDirty}
}
const Footer=({form,busy,onClose})=><><Button variant="secondary" onClick={onClose} disabled={busy}>{t('cancel')}</Button><Button form={form} type="submit" size="lg" icon={Check} loading={busy} className="flex-1">{t('save')}</Button></>
function MonthlyAmount({onClose}){
 const {monthlyAmount,preferencesError}=useFund(),{isAdmin}=useAuth()
 const [amount,setAmount]=useState(String(monthlyAmount)),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const {close,markDirty}=useFormClose(onClose,busy)
 const submit=async event=>{
  event.preventDefault();setError('')
  if(!isAdmin){setError(t('fund.authNeeded'));return}
  if(preferencesError){setError(t('fund.preferencesLoad'));return}
  if(!navigator.onLine){setError(t('fund.offline'));return}
  if(!validAmount(amount)){setError(t('fund.amountError'));return}
  setBusy(true)
  try{await setDoc(doc(fundDb,'settings','fundPreferences'),{monthlyAmount:Number(amount),updatedAt:serverTimestamp()},{merge:true});toast.success(t('saved'));onClose()}catch(err){setError(err.message)}finally{setBusy(false)}
 }
 return <Modal title={t('fund.monthlyAmount')} icon={Coins} onClose={close} footer={<Footer form="fund-monthly-amount" busy={busy} onClose={close}/>}><form id="fund-monthly-amount" onChange={markDirty} onSubmit={submit} className="space-y-4"><p className="text-sm text-muted">{t('fund.monthlyAmountHint')}</p><Field label={t('amount')}><AmountInput value={amount} onChange={setAmount}/></Field><ErrorLine error={error||(preferencesError?t('fund.preferencesLoad'):'')}/></form></Modal>
}
function Password({onClose}){
 const {changePassword,isAdmin}=useAuth();const [busy,setBusy]=useState(false),[error,setError]=useState('')
 const {close,markDirty}=useFormClose(onClose,busy)
 const submit=async event=>{event.preventDefault();const v=new FormData(event.currentTarget);setError('');if(!isAdmin){setError(t('fund.authNeeded'));return}if(v.get('next').length<4){setError(t('fund.passwordMin'));return}if(v.get('next')!==v.get('confirm')){setError(t('fund.passwordMismatch'));return}if(!navigator.onLine){setError(t('fund.offline'));return}setBusy(true);try{await changePassword(v.get('current'),v.get('next'));toast.success(t('fund.savedPassword'));onClose()}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <Modal title={t('changePassword')} icon={KeyRound} onClose={close} footer={<Footer form="fund-password" busy={busy} onClose={close}/>}><form id="fund-password" onChange={markDirty} onSubmit={submit} className="space-y-4">{[['current','pw.current','current-password'],['next','pw.new','new-password'],['confirm','pw.confirm','new-password']].map(([name,key,complete])=><Field key={name} label={t(key)}><Input aria-label={t(key)} name={name} type="password" required autoComplete={complete}/></Field>)}<ErrorLine error={error}/></form></Modal>
}
function Entry({kind='donations',row,memberId='',period,onClose}){
 const {members,monthlyAmount}=useFund(),{isAdmin}=useAuth()
 const [amount,setAmount]=useState(initialEntryAmount(kind,row,monthlyAmount)),[date,setDate]=useState(row?.date||(period&&period!==localDate().slice(0,7)?`${period}-01`:localDate())),[member,setMember]=useState(row?.memberId||memberId),[description,setDescription]=useState(row?.description||''),[paidTo,setPaidTo]=useState(row?.paidTo||''),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const {close,markDirty}=useFormClose(onClose,busy)
 const income=kind==='donations'
 const submit=async e=>{e.preventDefault();setError('');if(!isAdmin){setError(t('fund.authNeeded'));return}if(!navigator.onLine){setError(t('fund.offline'));return}const n=Number(amount);if(!Number.isFinite(n)||n<=0||n>1e8||Math.abs(n*100-Math.round(n*100))>.00001){setError(t('fund.amountError'));return}if(!date){setError(t('required'));return}const who=members.find(m=>m.id===member);if(income&&!who){setError(t('fund.chooseMember'));return}if(!income&&!description.trim()){setError(t('required'));return}const payload=income?{amount:n,date,memberId:member,memberName:who.name,month:date.slice(0,7),paymentMode:row?.paymentMode||'cash'}:{amount:n,date,description:description.trim(),paidTo:paidTo.trim()};setBusy(true);try{if(row)await updateDoc(doc(fundDb,kind,row.id),payload);else await addDoc(collection(fundDb,kind),{...payload,createdAt:serverTimestamp()});toast.success(t('saved'));onClose()}catch(err){setError(err.message)}finally{setBusy(false)}}
 const options=members.map(m=>({value:m.id,label:displayName(m),hint:displayName(m)!==m.name?m.name:undefined})).sort((a,b)=>a.label.localeCompare(b.label,locale(),{sensitivity:'base'}))
 const selectedMember=members.find(m=>m.id===member),fixedMember=income&&!!(memberId||row)
 return <Modal title={fixedMember&&selectedMember?displayName(selectedMember):t(income?(row?'fund.editIn':'fund.addIn'):(row?'fund.editOut':'fund.addOut'))} icon={income?Users:ArrowUpCircle} iconTone={income?'green':'red'} onClose={close} footer={income?<Button form="fund-entry" type="submit" size="lg" icon={row?Check:Plus} loading={busy} className="w-full">{t(row?'save':'fund.addIn')}</Button>:<Footer form="fund-entry" busy={busy} onClose={close}/>}><form id="fund-entry" onChange={markDirty} onSubmit={submit} className="space-y-4">
 {income?(!fixedMember&&<Field label={t('fund.member')}><Select searchable options={options} value={member} onChange={value=>{markDirty();setMember(value)}} placeholder={t('fund.chooseMember')}/></Field>):<Field label={t('fund.description')}><Input aria-label={t('fund.description')} value={description} onChange={e=>setDescription(e.target.value)} maxLength={250} required autoFocus/></Field>}
 <Field label={t('amount')}><AmountInput value={amount} onChange={setAmount}/></Field><Field label={t('date')}>{income?<Input type="date" aria-label={t('date')} value={date} required onChange={event=>setDate(event.target.value)}/>:<DateField value={date} onChange={value=>{markDirty();setDate(value)}}/>}</Field>
 {!income&&<Field label={t('fund.paidTo')} optional><Input aria-label={t('fund.paidTo')} value={paidTo} onChange={e=>setPaidTo(e.target.value)} maxLength={120}/></Field>}<ErrorLine error={error}/></form></Modal>
}
function Member({row,onClose}){
 const {isAdmin}=useAuth();const [busy,setBusy]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState(row?.status||'active')
 const {close,markDirty}=useFormClose(onClose,busy)
 const submit=async e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.currentTarget));if(!isAdmin){setError(t('fund.authNeeded'));return}if(!navigator.onLine){setError(t('fund.offline'));return}const payload={name:v.name.trim(),nameGu:v.nameGu.trim(),occupation:v.occupation.trim(),phone:v.phone.trim(),status};if(!payload.name){setError(t('required'));return}setError('');setBusy(true);try{if(row)await updateDoc(doc(fundDb,'members',row.id),payload);else await addDoc(collection(fundDb,'members'),{...payload,createdAt:serverTimestamp()});toast.success(t('saved'));onClose()}catch(err){setError(err.message)}finally{setBusy(false)}}
 return <Modal title={t(row?'fund.editMember':'fund.addMember')} icon={Users} onClose={close} footer={<Footer form="fund-member" busy={busy} onClose={close}/>}><form id="fund-member" onChange={markDirty} onSubmit={submit} className="space-y-4">{[['name','fund.name'],['nameGu','fund.nameGu'],['occupation','fund.occupation'],['phone','fund.phone']].map(([name,key])=><Field key={name} label={t(key)} optional={name!=='name'}><Input name={name} aria-label={t(key)} type={name==='phone'?'tel':'text'} defaultValue={name==='nameGu'?memberName(row,'gu'):row?.[name]||''} required={name==='name'} maxLength={name==='phone'?30:120}/></Field>)}<Field label={t('fund.status')}><Chips value={status} onChange={value=>{markDirty();setStatus(value)}} options={['active','inactive'].map(value=>({value,label:t(`fund.${value}`)}))}/></Field><ErrorLine error={error}/></form></Modal>
}
function MemberHistory({member,period,onClose}){
 return <Entry memberId={member.id} period={period} onClose={onClose}/>
}
