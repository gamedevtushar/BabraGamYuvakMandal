const layers = new Map()
let sequence = 0
export function registerBackLayer(dismiss, priority = 10) {
  const id = ++sequence
  layers.set(id, { dismiss, priority, id })
  return () => layers.delete(id)
}
export function dismissBackLayer() {
  const top = [...layers.values()].sort((a, b) => b.priority - a.priority || b.id - a.id)[0]
  if (!top) return false
  top.dismiss()
  return true
}
