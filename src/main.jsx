import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Adventures from './pages/Adventures'
import Info from './pages/Info'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<Home />} />
        <Route path="/admin"  element={<Admin />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/adventures" element={<Adventures />} />
        <Route path="/info" element={<Info />} />
        <Route path="/info/:section" element={<Info />} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
