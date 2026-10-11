import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui'
import { t, LangSwitch } from '../i18n'
import { ThemeSwitch } from '../theme'
import LogoMark from '../components/Logo'
export default function Login(){
 const {isLoggedIn,signIn}=useAuth(),[password,setPassword]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('')
 if(isLoggedIn)return <Navigate to="/" replace/>
 const submit=async e=>{e.preventDefault();setError('');setBusy(true);try{await signIn(password)}catch(err){setError(err.message)}finally{setBusy(false)}}
 return <div className="relative flex min-h-dvh flex-col"><header className="flex items-center justify-between gap-2 p-4 sm:p-6"><Link to="/" className="flex items-center gap-2 text-sm font-semibold text-muted"><ArrowLeft className="size-4"/>{t('nav.monthShort')}</Link><div className="flex gap-2"><LangSwitch/><ThemeSwitch/></div></header><div className="flex flex-1 items-center justify-center px-5 pb-12"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass w-full max-w-md rounded-3xl p-6 sm:p-9"><LogoMark className="mx-auto mb-5 size-16"/><h1 className="text-center text-xl font-bold break-words text-fg">{t('appName')}</h1><p className="mt-2 text-center text-sm text-muted">{t('fund.loginHint')}</p><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-semibold text-muted" htmlFor="fund-login-password">{t('fund.password')}</label><div className="relative"><Input id="fund-login-password" type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" autoFocus className="pr-12"/><button type="button" aria-label={show?t('login.hidePassword'):t('login.showPassword')} onClick={()=>setShow(!show)} className="absolute inset-y-0 right-3 text-muted">{show?<EyeOff className="size-5"/>:<Eye className="size-5"/>}</button></div>{error&&<p role="alert" className="rounded-xl bg-bad/10 p-3 text-sm text-bad">{error}</p>}<Button type="submit" icon={Lock} size="lg" loading={busy} className="w-full">{t('login.signIn')}</Button></form></motion.div></div></div>
}
