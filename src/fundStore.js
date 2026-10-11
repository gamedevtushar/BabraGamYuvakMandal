import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, runTransaction } from 'firebase/firestore'
import { fundConfig } from './fundConfig.js'

export const fundDb = getFirestore(initializeApp(fundConfig, 'family-fund'))
const accessRef = doc(fundDb, 'settings', 'fundAccess')
const hex = bytes => Array.from(new Uint8Array(bytes), n => n.toString(16).padStart(2, '0')).join('')
export async function passwordHash(password, salt, iterations = 600000) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations, hash: 'SHA-256' }, key, 256))
}
export async function verifyPassword(password) {
  const snap = await getDoc(accessRef)
  if (!snap.exists()) throw new Error('The app password has not been configured yet.')
  const access = snap.data()
  if (access.algorithm !== 'PBKDF2-SHA256' || !access.salt || !access.hash) throw new Error('Password settings need updating.')
  return (await passwordHash(password, access.salt, access.iterations)) === access.hash
}
export async function changeFundPassword(current, next) {
  if (next.length < 4) throw new Error('Use at least 4 characters.')
  const snapshot = await getDoc(accessRef)
  if (!snapshot.exists()) throw new Error('Password is not configured.')
  const before = snapshot.data()
  if ((await passwordHash(current, before.salt, before.iterations)) !== before.hash) throw new Error('Current password is incorrect.')
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)))
  const hash = await passwordHash(next, salt)
  await runTransaction(fundDb, async transaction => {
    const latest = await transaction.get(accessRef)
    if (latest.data()?.hash !== before.hash) throw new Error('Password changed elsewhere. Please try again.')
    transaction.set(accessRef, { algorithm: 'PBKDF2-SHA256', iterations: 600000, salt, hash })
  })
}
