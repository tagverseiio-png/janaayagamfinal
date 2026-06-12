import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from './context/LanguageContext'
import 'leaflet/dist/leaflet.css'
import './index.css'
import './i18n'
import App from './App.jsx'

// Suppress expected permission warnings in dev
if (process.env.NODE_ENV === 'development') {
  const _warn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('Camera') || args[0]?.includes?.('GPS')) return;
    _warn(...args);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
