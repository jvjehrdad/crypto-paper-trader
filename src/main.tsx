import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TradingProvider } from './context/TradingContext'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TradingProvider>
      <App />
    </TradingProvider>
  </StrictMode>,
)
