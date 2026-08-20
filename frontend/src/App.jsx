import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CarteleraPage from './pages/CarteleraPage';
import TvKioskPage from './pages/TvKioskPage';
import ConveniosCompensarPage from './pages/ConveniosCompensarPage';

import HseqPage from './pages/HseqPage';
import HseqTvKioskPage from './pages/HseqTvKioskPage';
import { usePortalAuth } from './hooks/usePortalAuth';

const PAGE_TITLES = {
  '/cartelera': 'Cartelera Digital',
  '/cartelera/tv': 'Modo TV Kiosk',
  '/hseq/tv': 'Modo TV HSEQ',
  '/convenios': 'Convenios Compensar',
  '/hseq': 'Normativas HSEQ',
};

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticating } = usePortalAuth();
  const title = PAGE_TITLES[location.pathname] || 'Gestión Humana';

  // TV Kiosk: standalone page without layout
  if (location.pathname === '/cartelera/tv' || location.pathname === '/tv') {
    return (
      <div style={{ padding: 0, margin: 0, width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: "#F0F4FA url('/images/fondo-pantalla.png') center/100% 100% fixed no-repeat" }}>
        <TvKioskPage />
      </div>
    );
  }

  // HSEQ TV Kiosk
  if (location.pathname === '/hseq/tv') {
    return (
      <div style={{ padding: 0, margin: 0, width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: "#F0F4FA url('/images/fondo-pantalla.png') center/100% 100% fixed no-repeat" }}>
        <HseqTvKioskPage />
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout title={title} />}>
        <Route path="/" element={<Navigate to="/cartelera" replace />} />
        <Route path="/cartelera" element={<CarteleraPage />} />
        <Route path="/convenios" element={<ConveniosCompensarPage />} />
        <Route path="/hseq" element={<HseqPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/cartelera" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
