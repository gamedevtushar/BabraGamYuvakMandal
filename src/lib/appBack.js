import { useEffect, useRef } from 'react'
import { createAppHistory } from './appHistory.js'
import { registerBackLayer, dismissBackLayer } from './backLayers.js'
let historyGuard
let pageBack = () => {}
export function installAppBack() {
  historyGuard ??= createAppHistory(window, () => { if (!dismissBackLayer()) pageBack() })
}
export function setPageBack(callback) {
  pageBack = callback
  historyGuard?.remember()
  return () => { if (pageBack === callback) pageBack = () => {} }
}
export function useBackDismiss(onClose, priority = 10, active = true) {
  const latest = useRef(onClose)
  latest.current = onClose
  useEffect(() => active ? registerBackLayer(() => latest.current(), priority) : undefined, [priority, active])
}
