import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import './index.css'
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
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </StrictMode>,
)
