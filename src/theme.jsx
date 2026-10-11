import { useSyncExternalStore } from 'react'
import { motion } from 'motion/react'
import { Sun, Moon, Check } from 'lucide-react'
import { PALETTES, DEFAULT_PALETTE, paletteById, paletteVars, logoSvg } from './palettes'

/** A single clay palette with light and dark modes. */
const KEY = 'theme'
const listeners = new Set()
const media = window.matchMedia('(prefers-color-scheme: dark)')

export const getThemePref = () => {
  try { const saved=localStorage.getItem(KEY); return saved==='light'||saved==='dark'?saved:media.matches?'dark':'light' } catch { return media.matches?'dark':'light' }
}
const resolve = pref => pref

/** Colour theme (one of 10 palettes) */
const PAL_KEY = 'palette'
export const getPalette = () => {
  return DEFAULT_PALETTE
}
const clayPalette = {
  ...paletteById(DEFAULT_PALETTE),
  light: { bg:'#eee8e1', surface:'#f8f3ed', bar:'#f3ede6', fg:'#302b28', muted:'#68605b', subtle:'#817670', accent:'#b84e2d', ink:'#923b22' },
  dark: { bg:'#22212a', surface:'#33313d', bar:'#2d2b36', fg:'#f7f1eb', muted:'#c2b9b4', subtle:'#a99e9a', accent:'#b84e2d', ink:'#ffc1a4' },
}

export function applyTheme() {
  const theme = resolve(getThemePref())
  const pal = clayPalette
  const root = document.documentElement
  root.dataset.theme = theme
  for (const [k, v] of Object.entries(paletteVars(pal, theme))) root.style.setProperty(k, v)
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', pal[theme].bar)
  // Browser tab icon, iPhone home-screen icon and install manifest follow the theme
  const base = import.meta.env.BASE_URL
  document.querySelector('link[rel=icon]')?.setAttribute('href', `data:image/svg+xml,${encodeURIComponent(logoSvg(pal))}`)
  document.querySelector('link[rel=apple-touch-icon]')?.setAttribute('href', `${base}icons/${pal.id}-180.png`)
  const languageSuffix = document.documentElement.lang === 'gu' ? '.gu' : ''
  document.querySelector('link[rel=manifest]')?.setAttribute('href', `${base}icons/${pal.id}${languageSuffix}.webmanifest`)
  // The notification icon follows the theme too
  navigator.serviceWorker?.controller?.postMessage({ type: 'palette', id: pal.id })
  // Saved for the next start, so the right colours show before the app loads
  try { localStorage.setItem('themeVars', JSON.stringify({ version:'clay-1', light: paletteVars(pal, 'light'), dark: paletteVars(pal, 'dark'), bar: { light: pal.light.bar, dark: pal.dark.bar } })) } catch { /* storage unavailable */ }
}

export function setPalette(id) {
  try { localStorage.setItem(PAL_KEY, id) } catch { /* storage unavailable */ }
  applyTheme()
  listeners.forEach((l) => l())
}
export const usePalette = () => useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb) }, getPalette)

/** The 10 colour themes as tappable swatches */
export function PaletteGrid({ lang = 'en' }) {
  const current = usePalette()
  return (
    <div className="grid grid-cols-5 gap-2">
      {PALETTES.map((pal) => {
        const active = pal.id === current
        return (
          <button key={pal.id} type="button" onClick={() => setPalette(pal.id)} aria-pressed={active}
            className={`flex flex-col items-center gap-1 rounded-xl p-1.5 transition-colors cursor-pointer ${active ? 'bg-accent/12 ring-2 ring-accent' : 'hover:bg-fg/[0.06]'}`}>
            <span className="relative flex size-10 items-center justify-center rounded-xl shadow-sm" style={{ background: `linear-gradient(135deg, ${pal.logo[0]}, ${pal.logo[1]})` }}>
              {active && <Check className="size-5 text-white" strokeWidth={3} />}
            </span>
            <span className="max-w-full text-[0.6875rem] font-semibold leading-tight text-muted">{pal.name[lang] || pal.name.en}</span>
          </button>
        )
      })}
    </div>
  )
}

export function setThemePref(pref) {
  try { localStorage.setItem(KEY, pref) } catch { /* storage unavailable */ }
  applyTheme()
  listeners.forEach((l) => l())
}

media.addEventListener('change', () => { applyTheme(); listeners.forEach((l) => l()) })

export const useThemePref = () => useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb) }, getThemePref)

const OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
]

/** Text size preference: 'normal' | 'large' | 'xl'. Applied as data-text on <html>, which scales every rem. */
const TEXT_KEY = 'textSize'
const textListeners = new Set()

export const getTextSize = () => {
  try { return localStorage.getItem(TEXT_KEY) || 'normal' } catch { return 'normal' }
}

export function setTextSize(size) {
  try { localStorage.setItem(TEXT_KEY, size) } catch { /* storage unavailable */ }
  document.documentElement.dataset.text = size
  textListeners.forEach((l) => l())
}

const useTextSize = () => useSyncExternalStore((cb) => { textListeners.add(cb); return () => textListeners.delete(cb) }, getTextSize)

const SIZES = [
  { value: 'normal', label: 'Normal', className: 'text-xs' },
  { value: 'large', label: 'Large', className: 'text-sm' },
  { value: 'xl', label: 'Extra large', className: 'text-lg' },
]

/** Compact A / A / A switch for the text size */
export function TextSizeSwitch({ className = '' }) {
  const size = useTextSize()
  return (
    <div role="radiogroup" aria-label="Text size" className={`clay-inset inline-flex rounded-xl p-1 ${className}`}>
      {SIZES.map(({ value, label, className: textClass }) => {
        const active = size === value
        return (
          <button key={value} type="button" role="radio" aria-checked={active} aria-label={label} onClick={() => setTextSize(value)}
            className={`relative flex size-8 items-center justify-center rounded-lg font-bold transition-colors cursor-pointer ${textClass} ${active ? 'text-fg' : 'text-subtle hover:text-fg'}`}>
            {active && <motion.span layoutId="text-pill" className="clay-selected absolute inset-0 rounded-lg bg-surface" />}
            <span className="relative leading-none">A</span>
          </button>
        )
      })}
    </div>
  )
}

/** Compact Light / Dark switch */
export function ThemeSwitch({ className = '' }) {
  const pref = useThemePref()
  return (
    <div role="radiogroup" aria-label="Theme" className={`clay-inset inline-flex rounded-xl p-1 ${className}`}>
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const active = pref === value
        return (
          <button key={value} type="button" role="radio" aria-checked={active} aria-label={label} onClick={() => setThemePref(value)}
            className={`relative flex size-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${active ? 'text-fg' : 'text-subtle hover:text-fg'}`}>
            {active && <motion.span layoutId="theme-pill" className="clay-selected absolute inset-0 rounded-lg bg-surface" />}
            <Icon className="relative size-4" />
          </button>
        )
      })}
    </div>
  )
}
