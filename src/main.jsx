import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Adventures from './pages/Adventures'
import Info from './pages/Info'
import Faq from './pages/Faq'
import WineRide from './pages/tours/WineRide'
import ThreeDayAdventure from './pages/tours/ThreeDayAdventure'
import FiveDayGrand from './pages/tours/FiveDayGrand'
import MoldovaGuide from './pages/blog/MoldovaGuide'
import OrheiulVechi from './pages/blog/OrheiulVechi'
import HomeDe from './pages/de/Home'

// On route change, scroll to the top — unless the URL has a #hash,
// in which case let the browser handle the anchor.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Routes>
        <Route path="/"       element={<Home />} />
        <Route path="/de"     element={<HomeDe />} />
        <Route path="/admin"  element={<Admin />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/adventures" element={<Adventures />} />
        <Route path="/info" element={<Info />} />
        <Route path="/info/:section" element={<Info />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/tours/1-day-wine-ride" element={<WineRide />} />
        <Route path="/tours/3-day-moldova-adventure" element={<ThreeDayAdventure />} />
        <Route path="/tours/5-day-grand-moldova" element={<FiveDayGrand />} />
        <Route path="/blog/moldova-motorcycle-tour-guide" element={<MoldovaGuide />} />
        <Route path="/blog/orheiul-vechi-motorcycle-guide" element={<OrheiulVechi />} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
