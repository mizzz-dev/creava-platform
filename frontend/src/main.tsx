import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './lib/i18n'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

if (!PUBLISHABLE_KEY && import.meta.env.DEV) {
  console.warn(
    '[Clerk] VITE_CLERK_PUBLISHABLE_KEY が設定されていません。' +
    'frontend/.env.local に VITE_CLERK_PUBLISHABLE_KEY=pk_test_... を設定してください。' +
    '認証機能は無効化された状態で起動します。',
  )
}

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  PUBLISHABLE_KEY ? (
    <React.StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <App />
          </ClerkProvider>
        </BrowserRouter>
      </HelmetProvider>
    </React.StrictMode>
  ) : app,
)
