import { createContext, useContext, useEffect, useState } from 'react'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { fundDb } from '../fundStore'
import { monthlyAmountFrom } from './preferences'
const Context = createContext(null)
export function FundProvider({ children }) {
  const [data, setData] = useState({ members: null, donations: null, expenses: null })
  const [errors, setErrors] = useState({})
  const [monthlyAmount, setMonthlyAmount] = useState(null)
  const [preferencesError, setPreferencesError] = useState(null)
  useEffect(() => {
    const stop = ['members','donations','expenses'].map(name => onSnapshot(collection(fundDb, name), snapshot => {
      setData(old => ({ ...old, [name]: snapshot.docs.map(d => ({ ...d.data(), id: d.id })) }))
      setErrors(old => ({ ...old, [name]: null }))
    }, error => setErrors(old => ({ ...old, [name]: error }))))
    stop.push(onSnapshot(doc(fundDb,'settings','fundPreferences'), snapshot => {
      setMonthlyAmount(monthlyAmountFrom(snapshot.data()))
      setPreferencesError(null)
    }, error => { setMonthlyAmount(monthlyAmountFrom()); setPreferencesError(error) }))
    return () => stop.forEach(fn => fn())
  }, [])
  return <Context.Provider value={{ members: data.members || [], donations: data.donations || [], expenses: data.expenses || [], monthlyAmount:monthlyAmount ?? monthlyAmountFrom(), preferencesError, loading: monthlyAmount === null || Object.values(data).some(v => v === null), error: Object.values(errors).find(Boolean) }}>{children}</Context.Provider>
}
export const useFund = () => useContext(Context)
