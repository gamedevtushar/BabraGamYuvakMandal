import { registerServiceWorker } from './pwa'
import { applyTheme, getTextSize } from './theme'
import { installTapFeedback } from './lib/feedback'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LangProvider } from './i18n'
import FundApp from './FundApp'
import { installAppBack } from './lib/appBack'
import './index.css'
registerServiceWorker()
applyTheme()
document.documentElement.dataset.text = getTextSize()
installTapFeedback()
installAppBack()
createRoot(document.getElementById('root')).render(
  <StrictMode><HashRouter><LangProvider><AuthProvider><FundApp /></AuthProvider></LangProvider></HashRouter></StrictMode>
)
