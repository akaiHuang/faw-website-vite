import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Admin from './Admin.tsx'
import ShaderEditor from './pages/ShaderEditor.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/fawentro" element={<Admin />} />
        <Route path="/shader-editor" element={<ShaderEditor />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
