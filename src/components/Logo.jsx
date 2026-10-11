import { useId } from 'react'

/** BabraGamYuvakMandal mark, using the original theme colours. */
export default function LogoMark({ className = 'size-10', title }) {
  const id = useId()
  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--logo-1)' }} />
          <stop offset="1" style={{ stopColor: 'var(--logo-2)' }} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${id}-bg)`} />
      <path d="M21 50V14H37L45 21V26L37 32H21M37 32L46 38V43L38 50H21" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
