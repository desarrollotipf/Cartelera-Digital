import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CarteleraPage from './pages/CarteleraPage';
import TvKioskPage from './pages/TvKioskPage';
import ConveniosCompensarPage from './pages/ConveniosCompensarPage';
import HseqPage from './pages/HseqPage';
import HseqTvKioskPage from './pages/HseqTvKioskPage';
import { usePortalAuth } from './hooks/usePortalAuth';

const PORTAL_FRONTEND = import.meta.env.VITE_PORTAL_FRONTEND_URL || 'https://portal.pollo-fiesta.com';

const PAGE_TITLES = {
  '/cartelera': 'Cartelera Digital',
  '/cartelera/tv': 'Modo TV Kiosk',
  '/hseq/tv': 'Modo TV HSEQ',
  '/convenios': 'Convenios Compensar',
  '/hseq': 'Normativas HSEQ',
};

function AuthGuard({ children }) {
  const { isAuthenticated, isAuthenticating, authError } = usePortalAuth();

  if (isAuthenticating) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #0b4274 0%, #031326 100%)',
        color: '#ffffff',
        fontFamily: "'Outfit', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '28px'
        }}>
          <img src="/images/logo-pollo.png" alt="Pollo Fiesta" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{
          width: '46px',
          height: '46px',
          border: '3px solid rgba(255,255,255,0.15)',
          borderTopColor: '#38bdf8',
          borderRadius: '50%',
          animation: 'authSpin 0.8s linear infinite',
          marginBottom: '20px'
        }} />
        <style>{`@keyframes authSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>Validando sesión con Portal FIA...</h2>
        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.75)', margin: 0 }}>Verificando credenciales y permisos de área.</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0f1d',
        color: '#ffffff',
        fontFamily: "'Outfit', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{
          padding: '36px 44px',
          backgroundColor: '#1e293b',
          borderRadius: '24px',
          border: '1px solid #ef4444',
          textAlign: 'center',
          maxWidth: '480px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f87171', margin: '0 0 10px 0' }}>Acceso No Autorizado</h2>
          <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '20px' }}>{authError}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.replace(PORTAL_FRONTEND);
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0f1d',
        color: '#ffffff',
        fontFamily: "'Outfit', system-ui, -apple-system, sans-serif"
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0' }}>Acceso Restringido</h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Redirigiendo al Portal FIA para iniciar sesión...</p>
      </div>
    );
  }

  return children;
}

function AppRoutes() {
  const location = useLocation();
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
      <AuthGuard>
        <AppRoutes />
      </AuthGuard>
    </BrowserRouter>
  );
}
