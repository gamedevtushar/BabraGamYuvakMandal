import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { setPageBack } from '../lib/appBack'
import { t } from '../i18n'
import { Button, confirmDialog } from '../components/ui'

export default function AppNavigation({ children }) {
  const location = useLocation(), navigate = useNavigate()
  const [exited, setExited] = useState(false)
  const pending = useRef(false)
  useLayoutEffect(() => setPageBack(async () => {
    if (exited || pending.current) return
    if (location.pathname !== '/') { navigate('/', { replace: true }); return }
    pending.current = true
    try {
      if (await confirmDialog({ title:t('fund.exitTitle'), message:t('fund.exitQuestion'), confirmText:t('fund.exit'), tone:'primary' })) {
        setExited(true)
        // Installed windows may close; normal browser tabs keep the closed-app screen.
        window.close()
      }
    } finally { pending.current = false }
  }), [location, navigate, exited])
  return exited ? <div className="flex min-h-dvh items-center justify-center bg-bg p-6"><div className="glass max-w-sm rounded-3xl p-8 text-center"><LogOut className="mx-auto mb-4 size-10 text-accent-ink"/><h1 className="text-xl font-bold text-fg">{t('fund.closed')}</h1><p className="mt-3 text-sm text-muted">{t('fund.closeHint')}</p><Button className="mt-6 w-full" onClick={()=>setExited(false)}>{t('fund.reopen')}</Button></div></div> : children
}
