import { createContext, useContext, useEffect, useState } from 'react'
import { verifyPassword, changeFundPassword } from '../fundStore'
import { t } from '../i18n'
import { FUND_SESSION_KEY, readFundSession, writeFundSession } from '../fund/session'
const AuthContext = createContext(null)
export const roleLabel = role => role === 'public' ? t('public.viewing') : t('fund.admin')
export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(() => readFundSession())
  useEffect(() => {
    const sync = event => { if(event.key===FUND_SESSION_KEY||event.key===null)setLoggedIn(readFundSession()) }
    window.addEventListener('storage',sync)
    return () => window.removeEventListener('storage',sync)
  },[])
  return <AuthContext.Provider value={{
    isLoggedIn: loggedIn, isAdmin: loggedIn, isSuper: false, loading: false,
    profile: loggedIn ? { name: t('fund.admin'), role: 'admin' } : null,
    signIn: async password => { if (!await verifyPassword(password)) throw new Error(t('fund.wrongPassword')); writeFundSession(undefined,true); setLoggedIn(true) },
    signOut: () => { writeFundSession(undefined,false); setLoggedIn(false) }, changePassword: changeFundPassword, canEdit: () => loggedIn,
  }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
