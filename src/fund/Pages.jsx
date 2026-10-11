import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { motion } from 'motion/react'
import { Wallet, Users, Plus, ChevronRight, ArrowDownCircle, ArrowUpCircle, Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useFund } from './Context'
import { forms } from './Forms'
import { t, tv, displayName, locale } from '../i18n'
import { inr, inrShort, periodLabel, shiftPeriod, shortDate, monthName } from '../lib/format'
import { localDate, monthOf, total, contributionSummary } from '../fundLedger'
import SnapScroller from '../components/SnapScroller'
import { Button, Card, ScrollCard, IconButton, IconTile, Input, EmptyState, Spinner, PageHeader, cx, toast } from '../components/ui'
import { saveReportImage } from './reportImage'

function LoadState({ children }) {
  const { loading, error } = useFund()
  return error ? <p role="alert" className="rounded-xl bg-bad/10 p-4 text-bad">{t('fund.permission')}</p> : loading ? <Spinner /> : children
}
const rowsFor = (donations, expenses) => [...donations.map(r => ({...r,kind:'donations',title:r.memberName})), ...expenses.map(r => ({...r,kind:'expenses',title:r.description}))].sort((a,b)=>(b.date||'').localeCompare(a.date||'') || a.id.localeCompare(b.id))
function Figure({ label, value, tone='text-fg', amount=true }) {
  return <div className="min-w-0 px-1 text-center leading-tight"><p className="text-[0.6875rem] font-semibold text-muted">{label}</p><p className={cx('text-[0.8125rem] font-bold whitespace-nowrap tabular-nums',tone)}>{amount?inrShort(value):value}</p></div>
}
export function EntryList({ rows, emptyTitle=t('fund.empty') }) {
  const { isAdmin }=useAuth()
  return !rows.length ? <EmptyState icon={Wallet} title={emptyTitle} /> : <div className="divide-y divide-fg/[0.06]">{rows.map((r,i)=>{
    const incoming=r.kind==='donations'
    return <motion.button key={`${r.kind}-${r.id}`} type="button" disabled={!isAdmin} onClick={()=>forms.open('entry',{kind:r.kind,row:r})} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:Math.min(i,14)*.02}} className={cx('flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors',isAdmin&&'cursor-pointer hover:bg-fg/[0.06]')}>
      <IconTile icon={incoming?ArrowDownCircle:ArrowUpCircle} tone={incoming?'green':'red'} className="size-9" iconClass="size-[1.125rem]" />
      <div className="min-w-0 flex-1"><p className="font-semibold break-words text-fg">{incoming?displayName(r.memberName||r.title):r.title}</p><p className="text-xs break-words text-muted">{[shortDate(r.date),incoming?tv(({cash:'Cash',upi:'UPI',bank:'Bank Transfer'})[r.paymentMode]||r.paymentMode):displayName(r.paidTo||'')].filter(Boolean).join(' · ')}</p></div><p className={cx('shrink-0 pt-0.5 font-bold whitespace-nowrap',incoming?'text-ok':'text-bad')}>{incoming?'+':'−'}{inr(r.amount)}</p></motion.button>
  })}</div>
}
export function Accounts() {
  const { members,donations,expenses,loading,error }=useFund(),{isAdmin}=useAuth()
  const [period,setPeriod]=useState(localDate().slice(0,7)),[kind,setKind]=useState('all')
  const [slots,setSlots]=useState(null)
  useEffect(()=>setSlots({right:document.getElementById('topbar-right')}),[])
  const current=localDate().slice(0,7)
  const months=useMemo(()=>{
    const dates=[...donations,...expenses].map(monthOf).filter(Boolean).sort()
    const start=dates[0]&&dates[0]<shiftPeriod(current,-35)?dates[0]:shiftPeriod(current,-35)
    const end=dates.at(-1)>current?dates.at(-1):current
    const out=[]; for(let m=start;m<=end;m=shiftPeriod(m,1))out.push({value:m,label:periodLabel(m,true)})
    return out
  },[donations,expenses,current])
  const inMonth=donations.filter(r=>monthOf(r)===period),outMonth=expenses.filter(r=>monthOf(r)===period)
  const summary=contributionSummary(members,inMonth),{amounts}=summary
  const people=[...summary.people].sort((a,b)=>displayName(a).localeCompare(displayName(b),locale(),{sensitivity:'base'}))
  const MemberCard=isAdmin?motion.button:motion.div
  const balance=total(donations)-total(expenses)
  const rows=rowsFor(summary.otherIncome,outMonth).filter(r=>kind==='all'||r.kind===kind)
  return <LoadState>{slots?.right&&createPortal(<div className="rounded-lg bg-accent/12 px-2.5 py-1 text-right leading-none"><p className="text-[0.625rem] font-semibold text-muted">{t('r.balance')}</p><p className="mt-0.5 text-base font-bold whitespace-nowrap tabular-nums text-accent-ink">{loading||error?'—':inr(balance)}</p></div>,slots.right)}
    <div className="sticky top-0 z-20 -mx-4 -mt-4 mb-3 shrink-0 space-y-2 bg-bg/95 px-4 pb-2 pt-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mt-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:backdrop-blur-none">
      <div className="clay-button hidden items-center gap-3 rounded-2xl bg-accent px-4 py-3 text-white lg:flex"><Wallet className="size-5"/><p className="flex-1 text-xs font-semibold">{t('appName')} · {t('fund.allTime')}</p><p className="text-xl font-bold">{inr(balance)}</p></div>
      <div className="clay-inset grid grid-cols-4 divide-x divide-fg/10 rounded-2xl py-2"><Figure label={t('fund.received')} value={summary.contributed} amount={false} tone="text-ok"/><Figure label={t('fund.notContributed')} value={summary.notContributed} amount={false}/><Figure label={t('income')} value={total(inMonth)} tone="text-ok"/><Figure label={t('expense')} value={total(outMonth)} tone="text-bad"/></div>
    </div>
    <div className="mb-3 grid gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-5 lg:gap-4">
      <ScrollCard className="!min-h-0 lg:col-span-3" bodyClass="p-3 sm:p-4" header={isAdmin&&<div className="flex justify-end px-3 pt-3"><Button size="sm" variant="success" icon={Plus} onClick={()=>forms.open('entry',{kind:'donations',period})}>{t('fund.addIn')}</Button></div>}>
        {!people.length?<EmptyState icon={Users} title={t('fund.noMembers')}/>:<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{people.map((m,i)=>{
          const paid=amounts.has(m.id),amount=(amounts.get(m.id)||0)/100
          return <MemberCard key={m.id} type={isAdmin?'button':undefined} role={isAdmin?undefined:'group'} aria-label={`${displayName(m)}, ${t(paid?'fund.received':'fund.notContributed')}${paid?`, ${inr(amount)}`:''}`} onClick={isAdmin?()=>forms.open('memberHistory',{member:m,period}):undefined} whileTap={isAdmin?{scale:.98}:undefined} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{type:'spring',stiffness:300,damping:28,delay:Math.min(i,18)*.012}} className={cx('clay-member flex min-h-12 min-w-0 items-center gap-2 rounded-2xl px-3.5 py-2.5 text-left',isAdmin?'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent':'cursor-default',paid&&'clay-member-paid')}>
            <span className="min-w-0 flex-1 text-sm font-semibold leading-snug break-words text-fg">{displayName(m)}</span>
            {paid&&<span className="shrink-0 text-sm font-bold tabular-nums text-ok">{inr(amount)}</span>}{isAdmin&&<ChevronRight className="size-3.5 shrink-0 text-subtle"/>}
          </MemberCard>
        })}</div>}
      </ScrollCard>
      <ScrollCard className="lg:col-span-2" header={<div className="space-y-2 px-3 pt-3"><div className="flex items-center gap-2"><h2 className="flex-1 text-sm font-semibold text-muted">{t('fund.otherEntries')}</h2>{isAdmin&&<Button size="sm" icon={Plus} onClick={()=>forms.open('entry',{kind:'expenses',period})}>{t('add')}</Button>}</div><div className="flex gap-1">{[['all','all'],['donations','fund.otherIncome'],['expenses','expense']].map(([v,k])=><button key={v} onClick={()=>setKind(v)} aria-pressed={kind===v} className={cx('flex-1 rounded-lg px-2 py-1 text-xs cursor-pointer',kind===v?'bg-accent/12 text-accent-ink font-semibold':'text-muted')}>{t(k)}</button>)}</div></div>}><EntryList rows={rows} emptyTitle={kind==='all'?t('fund.otherEmpty'):t('fund.empty')}/></ScrollCard>
    </div>
    <div className="clay-bar sticky bottom-0 z-20 -mx-4 -mb-6 mt-auto flex shrink-0 items-center gap-1 bg-bar px-2 py-2 sm:-mx-6 sm:px-4 lg:static lg:mx-0 lg:mb-0 lg:mt-4 lg:rounded-2xl lg:px-2"><SnapScroller items={months} value={period} onChange={setPeriod} className="min-w-0 flex-1" itemWidth="7.5rem"/></div>
  </LoadState>
}
export function Members(){
 const {members,donations}=useFund(),{isAdmin}=useAuth();const [search,setSearch]=useState('')
 const filtered=members.filter(m=>`${m.name} ${displayName(m)} ${m.occupation||''}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>displayName(a).localeCompare(displayName(b),locale(),{sensitivity:'base'}))
 const NameTag=isAdmin?'button':'div'
 return <LoadState><PageHeader title={t('fund.members')} subtitle={t('fund.count',{n:members.length})} actions={isAdmin&&<Button icon={Plus} onClick={()=>forms.open('member')}>{t('fund.addMember')}</Button>}/><Input className="mb-2 shrink-0" aria-label={t('searchPh')} placeholder={t('searchPh')} value={search} onChange={e=>setSearch(e.target.value)}/><div className="no-scrollbar min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto space-y-3 p-3">{!filtered.length?<EmptyState icon={Users} title={t('fund.noMembers')}/>:filtered.map(m=><Card key={m.id} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 p-3"><IconTile icon={Users}/><NameTag type={isAdmin?'button':undefined} className={cx('min-w-0 text-left',isAdmin&&'cursor-pointer')} onClick={isAdmin?()=>forms.open('memberHistory',{member:m}):undefined}><p className="font-semibold break-words text-fg">{displayName(m)}</p><p className="text-xs break-words text-muted">{[m.occupation,t(m.status==='inactive'?'fund.inactive':'fund.active')].filter(Boolean).join(' · ')}</p>{isAdmin&&m.phone&&<p className="text-xs break-all text-muted">{m.phone}</p>}</NameTag><div className="shrink-0 text-right"><p className="text-sm font-semibold whitespace-nowrap tabular-nums text-ok">{inr(total(donations.filter(r=>r.memberId===m.id)))}</p>{isAdmin&&<Button size="sm" variant="ghost" onClick={()=>forms.open('member',{row:m})}>{t('edit')}</Button>}</div></Card>)}</div></LoadState>
}
export function Reports(){
 const {donations,expenses}=useFund(); const current=localDate().slice(0,4);const [year,setYear]=useState(current),[saving,setSaving]=useState(false)
 const all=rowsFor(donations,expenses),years=[...new Set([current,...all.map(r=>r.date?.slice(0,4)).filter(Boolean)])].sort()
 const opening=total(donations.filter(r=>monthOf(r)<`${year}-01`))-total(expenses.filter(r=>monthOf(r)<`${year}-01`))
 let balance=opening
 const months=Array.from({length:12},(_,i)=>`${year}-${String(i+1).padStart(2,'0')}`).map(month=>{const income=total(donations.filter(r=>monthOf(r)===month)),out=total(expenses.filter(r=>monthOf(r)===month));balance=Math.round((balance+income-out)*100)/100;return {month,income,out,balance}})
 const entries=all.filter(r=>r.date?.startsWith(year))
 const income=total(entries.filter(r=>r.kind==='donations')),expense=total(entries.filter(r=>r.kind==='expenses'))
 const download=async()=>{
   setSaving(true)
   try{await saveReportImage({year,opening,months:months.map(row=>({...row,label:monthName(row.month)})),income,expense,balance,formatAmount:inr,labels:{name:t('appName'),report:t('nav.reports'),opening:t('fund.opening'),closing:t('fund.closing'),total:t('r.total'),columns:['r.month','r.in','r.out','r.balance'].map(key=>t(key)),failed:t('fund.imageFailed')}})}catch(error){toast.error(error)}finally{setSaving(false)}
 }
 return <LoadState><Card className="mb-3 min-h-0 min-w-0 flex-1 overflow-hidden lg:overflow-auto"><div className="flex justify-between border-b border-fg/10 px-4 py-3 text-sm"><span className="text-muted">{t('fund.opening')}</span><strong className="text-fg">{inr(opening)}</strong></div><table className="w-full text-sm tabular-nums"><thead><tr className="bg-fg/[0.03] text-muted">{['r.month','r.in','r.out','r.balance'].map(k=><th key={k} className="px-2 py-3 text-right first:text-left">{t(k)}</th>)}</tr></thead><tbody>{months.map(r=><tr key={r.month} className="border-t border-fg/[0.06]"><td className="px-2 py-3 text-fg">{monthName(r.month)}</td><td className="px-2 py-3 text-right text-ok">{inr(r.income)}</td><td className="px-2 py-3 text-right text-bad">{inr(r.out)}</td><td className="px-2 py-3 text-right font-semibold text-fg">{inr(r.balance)}</td></tr>)}</tbody><tfoot><tr className="border-t border-fg/15 bg-accent/10 font-bold"><td className="px-2 py-3 text-fg">{t('r.total')}</td><td className="px-2 py-3 text-right text-ok">{inr(income)}</td><td className="px-2 py-3 text-right text-bad">{inr(expense)}</td><td className="px-2 py-3 text-right text-fg">{inr(balance)}</td></tr></tfoot></table></Card><div className="clay-bar sticky bottom-0 z-20 -mx-4 -mb-6 mt-auto flex shrink-0 items-center gap-1 bg-bar px-2 py-2 sm:-mx-6 sm:px-4 lg:static lg:mx-0 lg:mb-0 lg:mt-4 lg:rounded-2xl lg:px-2"><SnapScroller items={years.map(y=>({value:y,label:y}))} value={year} onChange={setYear} className="min-w-0 flex-1" itemWidth="7.5rem"/><IconButton icon={Download} label={t('fund.saveImage')} variant="secondary" className="size-10" loading={saving} onClick={download}/></div></LoadState>
}


