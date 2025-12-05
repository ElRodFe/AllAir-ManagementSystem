import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from "./utils/useToast";
import './styles/fonts.css';
import './styles/global.css';
import "./styles/utilities.css";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
