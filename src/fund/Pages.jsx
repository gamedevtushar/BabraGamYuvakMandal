import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { motion } from 'motion/react'
import { Wallet, Users, Plus, Check, Minus, ChevronRight, ArrowDownCircle, ArrowUpCircle, Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useFund } from './Context'
import { forms } from './Forms'
import { t, tv, displayName } from '../i18n'
import { inr, inrShort, periodLabel, shiftPeriod, shortDate, monthName } from '../lib/format'
import { localDate, monthOf, total, contributionSummary } from '../fundLedger'
import SnapScroller from '../components/SnapScroller'
import { Button, Card, ScrollCard, IconButton, IconTile, Input, EmptyState, Spinner, PageHeader, cx } from '../components/ui'

function LoadState({ children }) {
  const { loading, error } = useFund()
  return error ? <p role="alert" className="rounded-xl bg-bad/10 p-4 text-bad">{t('fund.permission')}</p> : loading ? <Spinner /> : children
}
const rowsFor = (donations, expenses) => [...donations.map(r => ({...r,kind:'donations',title:r.memberName})), ...expenses.map(r => ({...r,kind:'expenses',title:r.description}))].sort((a,b)=>(b.date||'').localeCompare(a.date||'') || a.id.localeCompare(b.id))
export function exportRows(rows, period) {
  const values = [['Date','Type','Member / Description','Amount','Payment / Paid to'], ...rows.map(r => [r.date,r.kind==='donations'?'In':'Out',r.title,r.amount,r.paymentMode||r.paidTo||''])]
  const csv = values.map(row => row.map(v => { const s=String(v??''); return '"'+(/^[=+@\-\t\r]/.test(s)?"'":'')+s.replaceAll('"','""')+'"' }).join(',')).join('\r\n')
  const url=URL.createObjectURL(new Blob(['\uFEFF',csv],{type:'text/csv;charset=utf-8'}))
  const a=document.createElement('a'); a.href=url; a.download=`BabraGamYuvakMandal-${period}.csv`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000)
}
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
  const [period,setPeriod]=useState(localDate().slice(0,7)),[search,setSearch]=useState(''),[kind,setKind]=useState('all')
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
  const people=summary.people.filter(m=>`${m.name} ${displayName(m)} ${m.occupation||''}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>(a.name||'').localeCompare(b.name||''))
  const balance=total(donations)-total(expenses)
  const rows=rowsFor(summary.otherIncome,outMonth).filter(r=>kind==='all'||r.kind===kind)
  return <LoadState>{slots?.right&&createPortal(<div className="rounded-lg bg-accent/12 px-2.5 py-1 text-right leading-none"><p className="text-[0.625rem] font-semibold text-muted">{t('r.balance')}</p><p className="mt-0.5 text-base font-bold whitespace-nowrap tabular-nums text-accent-ink">{loading||error?'—':inr(balance)}</p></div>,slots.right)}
    <div className="sticky top-0 z-20 -mx-4 -mt-4 mb-3 shrink-0 space-y-2 bg-bg/95 px-4 pb-2 pt-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mt-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:backdrop-blur-none">
      <div className="hidden items-center gap-3 rounded-xl bg-[linear-gradient(90deg,var(--logo-1),var(--logo-2))] px-3.5 py-2 text-white shadow-sm lg:flex"><Wallet className="size-5"/><p className="flex-1 text-xs font-semibold">{t('appName')} · {t('fund.allTime')}</p><p className="text-xl font-bold">{inr(balance)}</p></div>
      <div className="grid grid-cols-4 divide-x divide-fg/10 rounded-lg border border-fg/10 bg-surface py-1"><Figure label={t('fund.received')} value={summary.contributed} amount={false} tone="text-ok"/><Figure label={t('fund.notContributed')} value={summary.notContributed} amount={false}/><Figure label={t('income')} value={total(inMonth)} tone="text-ok"/><Figure label={t('expense')} value={total(outMonth)} tone="text-bad"/></div>
    </div>
    <div className="mb-3 grid gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-5 lg:gap-4">
      <ScrollCard className="!min-h-0 lg:col-span-3" bodyClass="p-2.5 sm:p-3" header={<div className="space-y-2 px-3 pt-3"><div className="flex items-center gap-2"><h2 className="flex-1 text-sm font-semibold text-muted">{t('fund.monthlyMembers')}</h2>{isAdmin&&<Button size="sm" variant="success" icon={Plus} onClick={()=>forms.open('entry',{kind:'donations',period})}>{t('fund.addIn')}</Button>}</div><Input aria-label={t('searchPh')} placeholder={t('searchPh')} value={search} onChange={e=>setSearch(e.target.value)} className="!h-9 !text-sm"/></div>}>
        {!people.length?<EmptyState icon={Users} title={t('fund.noMembers')}/>:<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{people.map((m,i)=>{
          const paid=amounts.has(m.id),amount=(amounts.get(m.id)||0)/100,StatusIcon=paid?Check:Minus
          return <motion.button key={m.id} type="button" onClick={()=>forms.open('memberHistory',{member:m,period})} whileTap={{scale:.98}} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:Math.min(i,18)*.015}} className={cx('group flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',paid?'border-ok/20 bg-ok/[0.06] hover:bg-ok/10':'border-fg/10 bg-fg/[0.02] hover:bg-fg/[0.05]')}>
            <span className={cx('flex size-9 shrink-0 items-center justify-center rounded-full',paid?'bg-ok/15 text-ok':'bg-fg/[0.06] text-subtle')}><StatusIcon className="size-4" strokeWidth={2.5}/></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold leading-snug break-words text-fg">{displayName(m)}</span><span className={cx('mt-1 block text-[0.6875rem] font-medium',paid?'text-ok':'text-muted')}>{t(paid?'fund.received':'fund.notContributed')}</span></span>
            <span className={cx('shrink-0 text-sm font-bold tabular-nums',paid?'text-ok':'text-subtle')}>{paid?inr(amount):'—'}</span><ChevronRight className="size-3.5 shrink-0 text-subtle"/>
          </motion.button>
        })}</div>}
      </ScrollCard>
      <ScrollCard className="lg:col-span-2" header={<div className="space-y-2 px-3 pt-3"><div className="flex items-center gap-2"><h2 className="flex-1 text-sm font-semibold text-muted">{t('fund.otherEntries')}</h2>{isAdmin&&<Button size="sm" icon={Plus} onClick={()=>forms.open('entry',{kind:'expenses',period})}>{t('add')}</Button>}</div><div className="flex gap-1">{[['all','all'],['donations','fund.otherIncome'],['expenses','expense']].map(([v,k])=><button key={v} onClick={()=>setKind(v)} aria-pressed={kind===v} className={cx('flex-1 rounded-lg px-2 py-1 text-xs cursor-pointer',kind===v?'bg-accent/12 text-accent-ink font-semibold':'text-muted')}>{t(k)}</button>)}</div></div>}><EntryList rows={rows} emptyTitle={kind==='all'?t('fund.otherEmpty'):t('fund.empty')}/></ScrollCard>
    </div>
    <div className="sticky bottom-0 z-20 -mx-4 -mb-6 mt-auto flex shrink-0 items-center gap-1 border-t border-bar-line bg-bar px-2 py-1 sm:-mx-6 sm:px-4 lg:static lg:mx-0 lg:mb-0 lg:mt-4 lg:rounded-xl lg:border lg:px-2"><SnapScroller items={months} value={period} onChange={setPeriod} className="min-w-0 flex-1" itemWidth="7.5rem"/><IconButton icon={Download} label={t('fund.export')} variant="secondary" className="size-10" onClick={()=>exportRows(rowsFor(inMonth,outMonth),period)}/></div>
  </LoadState>
}
export function Members(){
 const {members,donations}=useFund(),{isAdmin}=useAuth();const [search,setSearch]=useState('')
 const filtered=members.filter(m=>`${m.name} ${displayName(m)} ${m.occupation||''}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>(a.name||'').localeCompare(b.name||''))
 return <LoadState><PageHeader title={t('fund.members')} subtitle={t('fund.count',{n:members.length})} actions={isAdmin&&<Button icon={Plus} onClick={()=>forms.open('member')}>{t('fund.addMember')}</Button>}/><Input className="mb-4 shrink-0" aria-label={t('searchPh')} placeholder={t('searchPh')} value={search} onChange={e=>setSearch(e.target.value)}/><div className="no-scrollbar min-h-0 overflow-y-auto space-y-2">{!filtered.length?<EmptyState icon={Users} title={t('fund.noMembers')}/>:filtered.map(m=><Card key={m.id} className="flex items-center gap-3 p-3"><IconTile icon={Users}/><button className="min-w-0 flex-1 text-left cursor-pointer" onClick={()=>forms.open('memberHistory',{member:m})}><p className="font-semibold text-fg">{displayName(m)}</p><p className="text-xs text-muted">{[m.occupation,t(m.status==='inactive'?'fund.inactive':'fund.active')].filter(Boolean).join(' · ')}</p>{isAdmin&&m.phone&&<p className="text-xs text-muted">{m.phone}</p>}</button><div className="text-right"><p className="font-semibold text-ok">{inr(total(donations.filter(r=>r.memberId===m.id)))}</p>{isAdmin&&<Button size="sm" variant="ghost" onClick={()=>forms.open('member',{row:m})}>{t('edit')}</Button>}</div></Card>)}</div></LoadState>
}
export function Reports(){
 const {donations,expenses}=useFund(); const current=localDate().slice(0,4);const [year,setYear]=useState(current)
 const all=rowsFor(donations,expenses),years=[...new Set([current,...all.map(r=>r.date?.slice(0,4)).filter(Boolean)])].sort()
 const opening=total(donations.filter(r=>monthOf(r)<`${year}-01`))-total(expenses.filter(r=>monthOf(r)<`${year}-01`))
 let balance=opening
 const months=Array.from({length:12},(_,i)=>`${year}-${String(i+1).padStart(2,'0')}`).map(month=>{const income=total(donations.filter(r=>monthOf(r)===month)),out=total(expenses.filter(r=>monthOf(r)===month));balance=Math.round((balance+income-out)*100)/100;return {month,income,out,balance}})
 const entries=all.filter(r=>r.date?.startsWith(year))
 return <LoadState><PageHeader title={t('nav.reports')} subtitle={t('fund.summary')} actions={<Button variant="secondary" icon={Download} onClick={()=>exportRows(entries,year)}>{t('fund.export')}</Button>}/><Card className="min-h-0 flex-1 overflow-auto"><div className="flex justify-between border-b border-fg/10 px-4 py-3 text-sm"><span className="text-muted">{t('fund.opening')}</span><strong className="text-fg">{inr(opening)}</strong></div><table className="w-full text-sm tabular-nums"><thead><tr className="bg-fg/[0.03] text-muted">{['r.month','r.in','r.out','r.balance'].map(k=><th key={k} className="px-2 py-3 text-right first:text-left">{t(k)}</th>)}</tr></thead><tbody>{months.map(r=><tr key={r.month} className="border-t border-fg/[0.06]"><td className="px-2 py-3 text-fg">{monthName(r.month)}</td><td className="px-2 py-3 text-right text-ok">{inr(r.income)}</td><td className="px-2 py-3 text-right text-bad">{inr(r.out)}</td><td className="px-2 py-3 text-right font-semibold text-fg">{inr(r.balance)}</td></tr>)}</tbody><tfoot><tr className="border-t border-fg/15 bg-accent/10 font-bold"><td className="px-2 py-3 text-fg">{t('r.total')}</td><td className="px-2 py-3 text-right text-ok">{inr(total(entries.filter(r=>r.kind==='donations')))}</td><td className="px-2 py-3 text-right text-bad">{inr(total(entries.filter(r=>r.kind==='expenses')))}</td><td className="px-2 py-3 text-right text-fg">{inr(balance)}</td></tr></tfoot></table></Card><div className="mt-4 shrink-0 rounded-xl border border-bar-line bg-bar px-2 py-1"><SnapScroller items={years.map(y=>({value:y,label:y}))} value={year} onChange={setYear}/></div></LoadState>
}


