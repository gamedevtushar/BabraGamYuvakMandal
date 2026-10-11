import { useId } from 'react'
import { Wallet, BarChart3, Users, Menu, Plus, Coins, Download, ArrowDownCircle, ArrowUpCircle, KeyRound, SunMoon, Languages, LogIn, LogOut } from 'lucide-react'

const shapes = new Map([[Wallet,'wallet'],[BarChart3,'chart'],[Users,'users'],[Menu,'menu'],[Plus,'plus'],[Coins,'coins'],[Download,'download'],[ArrowDownCircle,'income'],[ArrowUpCircle,'expense'],[KeyRound,'key'],[SunMoon,'moon'],[Languages,'language'],[LogIn,'login'],[LogOut,'logout']])

/** Small sculpted SVG objects: one light source, soft cast shadows and rounded edges. */
export default function ClayIcon({ icon: Icon, className = 'size-8' }) {
  const id=useId().replaceAll(':',''), shape=shapes.get(Icon)
  if(!shape)return <Icon aria-hidden="true" className={`clay-line-icon ${className}`} strokeWidth={2.5}/>
  const fill = name => `url(#${id}-${name})`
  return <svg aria-hidden="true" viewBox="0 0 64 64" className={`clay-object ${className}`}>
    <defs>
      {[['purple','#d3c8f7','#8c82ca','#6962ad'],['mint','#c0e9dc','#72bbb0','#45958d'],['pink','#ffcfda','#ed96af','#c87598'],['cream','#fffaf0','#e9dfd5','#c4b6b6'],['gold','#ffe8ad','#e5c16e','#b6914f']].map(([name,top,mid,bottom])=><linearGradient key={name} id={`${id}-${name}`} x1="0" y1="0" x2=".85" y2="1"><stop stopColor={top}/><stop offset=".5" stopColor={mid}/><stop offset="1" stopColor={bottom}/></linearGradient>)}
      <filter id={`${id}-shadow`} x="-40%" y="-40%" width="190%" height="200%" colorInterpolationFilters="sRGB"><feDropShadow dx="1.5" dy="3.5" stdDeviation="2" floodColor="#34263f" floodOpacity=".28"/></filter>
      <filter id={`${id}-relief`} x="-30%" y="-30%" width="170%" height="180%" colorInterpolationFilters="sRGB"><feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#514060" floodOpacity=".28"/></filter>
    </defs>
    <g filter={fill('shadow')}>
      {shape==='wallet'&&<><rect x="9" y="13" width="45" height="40" rx="11" fill={fill('purple')}/><path d="M13 23H51" stroke="#efe8ff" strokeOpacity=".65" strokeWidth="4" strokeLinecap="round"/><g filter={fill('relief')}><rect x="11" y="10" width="35" height="10" rx="4" fill={fill('cream')}/><rect x="34" y="30" width="23" height="15" rx="6" fill={fill('cream')}/><circle cx="42" cy="37.5" r="3" fill={fill('gold')}/></g></>}
      {shape==='chart'&&<><rect x="7" y="50" width="51" height="8" rx="4" fill={fill('cream')}/><g filter={fill('relief')}><rect x="12" y="28" width="11" height="25" rx="4" fill={fill('purple')}/><rect x="27" y="10" width="11" height="43" rx="4" fill={fill('purple')}/><rect x="42" y="21" width="11" height="32" rx="4" fill={fill('mint')}/></g></>}
      {shape==='users'&&<><circle cx="32" cy="31" r="26" fill={fill('purple')}/><g filter={fill('relief')}><circle cx="32" cy="23" r="10" fill={fill('cream')}/><path d="M16 46C16 36 23 33 32 33S48 36 48 46C48 53 16 53 16 46Z" fill={fill('cream')}/></g></>}
      {shape==='menu'&&<><path d="M10 12H42A10 10 0 0 1 52 22V34A10 10 0 0 1 42 44H24L12 51V43A9 9 0 0 1 4 34V22A10 10 0 0 1 10 12Z" fill={fill('purple')}/><path d="M29 28H49A10 10 0 0 1 59 38V46A9 9 0 0 1 52 55V60L43 55H29A10 10 0 0 1 19 45V38A10 10 0 0 1 29 28Z" fill={fill('cream')} filter={fill('relief')}/><g fill={fill('purple')}><circle cx="30" cy="41" r="3"/><circle cx="39" cy="41" r="3"/><circle cx="48" cy="41" r="3"/></g></>}
      {shape==='plus'&&<path d="M27 13Q27 8 32 8T37 13V27H51Q56 27 56 32T51 37H37V51Q37 56 32 56T27 51V37H13Q8 37 8 32T13 27H27Z" fill={fill('cream')}/>}
      {shape==='coins'&&<><g fill={fill('gold')}><rect x="9" y="32" width="31" height="18" rx="7"/><ellipse cx="24.5" cy="33" rx="15.5" ry="6" fill="#fae3a2"/><rect x="25" y="20" width="31" height="18" rx="7"/><ellipse cx="40.5" cy="21" rx="15.5" ry="6" fill="#fff0bf"/></g><path d="M15 42Q25 47 34 42M31 30Q41 35 50 30" fill="none" stroke="#c09e61" strokeWidth="2" strokeLinecap="round"/></>}
      {shape==='download'&&<><path d="M17 47C3 47 3 30 15 28C11 8 40 5 43 23C59 21 66 45 49 47Z" fill={fill('cream')}/><path d="M32 30V55M22 44L32 55L42 44" fill="none" stroke={fill('purple')} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" filter={fill('relief')}/></>}
      {(shape==='income'||shape==='expense')&&<><circle cx="32" cy="31" r="25" fill={fill(shape==='income'?'mint':'pink')}/><path d={shape==='income'?'M32 18V44M21 33L32 44L43 33':'M32 44V18M21 29L32 18L43 29'} stroke={fill('cream')} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" filter={fill('relief')}/></>}
      {shape==='key'&&<><circle cx="22" cy="23" r="13" fill={fill('pink')}/><circle cx="22" cy="23" r="5" fill="#9e6587"/><path d="M30 32L49 51M39 41L46 34M46 48L53 41" fill="none" stroke={fill('cream')} strokeWidth="9" strokeLinecap="round" filter={fill('relief')}/></>}
      {shape==='moon'&&<><path d="M40 9C16 4 3 29 17 46C31 63 55 52 56 35C37 43 22 23 40 9Z" fill={fill('cream')}/><circle cx="48" cy="15" r="5" fill={fill('gold')}/></>}
      {shape==='language'&&<><rect x="9" y="8" width="39" height="45" rx="9" fill={fill('purple')}/><rect x="23" y="22" width="33" height="35" rx="8" fill={fill('cream')} filter={fill('relief')}/><path d="M31 45L39 29L47 45M34 40H44" fill="none" stroke={fill('purple')} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></>}
      {(shape==='login'||shape==='logout')&&<><rect x="23" y="10" width="29" height="45" rx="9" fill={fill('purple')}/><path d="M29 21V44" stroke={fill('cream')} strokeWidth="3" strokeLinecap="round"/><path d={shape==='login'?'M8 33H37M27 23L37 33L27 43':'M38 33H9M19 23L9 33L19 43'} fill="none" stroke={fill('cream')} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" filter={fill('relief')}/></>}
    </g>
  </svg>
}
