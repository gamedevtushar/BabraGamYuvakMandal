import { useId } from 'react'

/** BabraGamYuvakMandal mark, using the original theme colours. */
export default function LogoMark({ className = 'size-10', title }) {
  const id = useId()
  return (
    <svg viewBox="0 0 64 64" className={`clay-object ${className}`} style={{filter:'drop-shadow(2px 4px 3px var(--clay-shade))'}} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--logo-1)' }} />
          <stop offset="1" style={{ stopColor: 'var(--logo-2)' }} />
        </linearGradient>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".5"/><stop offset=".5" stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#44224e" stopOpacity=".25"/></linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="19" fill={`url(#${id}-bg)`} />
      <rect x="2" y="2" width="60" height="60" rx="19" fill={`url(#${id}-light)`} />
      <path d="M8 23Q8 8 23 8H41" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
      <path d="M21 50V14H37L45 21V26L37 32H21M37 32L46 38V43L38 50H21" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
