import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import FundApp from './FundApp'
import './fund.css'

createRoot(document.getElementById('root')).render(<StrictMode><FundApp /></StrictMode>)
