import { Routes, Route, Navigate } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import Backdrop from './components/Backdrop'
import Layout from './components/Layout'
import { Toaster, ConfirmHost, OfflineBanner } from './components/ui'
import { FundProvider } from './fund/Context'
import { FormHost } from './fund/Forms'
import { Accounts, Reports, Members } from './fund/Pages'
import Login from './fund/Login'
export default function FundApp() {
  return <MotionConfig reducedMotion="user"><Backdrop /><FundProvider>
    <Routes><Route path="login" element={<Login />} /><Route element={<Layout />}>
      <Route index element={<Accounts />} /><Route path="reports" element={<Reports />} />
      <Route path="members" element={<Members />} /><Route path="*" element={<Navigate to="/" replace />} />
    </Route></Routes><FormHost />
  </FundProvider><Toaster /><ConfirmHost /><OfflineBanner /></MotionConfig>
}
