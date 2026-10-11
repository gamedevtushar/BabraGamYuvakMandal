import { createContext, useContext, useState } from 'react'
import { verifyPassword, changeFundPassword } from '../fundStore'
import { t } from '../i18n'
const AuthContext = createContext(null)
export const roleLabel = role => role === 'public' ? t('public.viewing') : t('fund.admin')
export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false)
  return <AuthContext.Provider value={{
    isLoggedIn: loggedIn, isAdmin: loggedIn, isSuper: false, loading: false,
    profile: loggedIn ? { name: t('fund.admin'), role: 'admin' } : null,
    signIn: async password => { if (!await verifyPassword(password)) throw new Error(t('fund.wrongPassword')); setLoggedIn(true) },
    signOut: () => setLoggedIn(false), changePassword: changeFundPassword, canEdit: () => loggedIn,
  }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
