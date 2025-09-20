import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/Main.module.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
