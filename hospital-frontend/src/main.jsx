import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app.css';  // or the correct path to your app.css
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
