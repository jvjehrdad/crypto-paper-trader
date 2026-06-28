import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TradingProvider } from './core/contexts/TradingContext'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TradingProvider>
      <App />
    </TradingProvider>
  </StrictMode>,
)
