export const FUND_SESSION_KEY = 'bgym.fundSession'
export function readFundSession(storage) {
  try { return (storage ?? window.localStorage).getItem(FUND_SESSION_KEY) === 'admin' } catch { return false }
}
export function writeFundSession(storage, loggedIn) {
  try { const saved=storage ?? window.localStorage; if(loggedIn)saved.setItem(FUND_SESSION_KEY,'admin');else saved.removeItem(FUND_SESSION_KEY) } catch { /* Keep the current session usable if storage is unavailable. */ }
}
