import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Gift, Tv, Shield } from 'lucide-react';

export default function Layout({ title, onLogout }) {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: "#F0F4FA url('/images/fondo-pantalla.png') center/100% 100% fixed no-repeat" }}>
      <Sidebar onLogout={onLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1rem', background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#333' }}>{title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {location.pathname !== '/cartelera' && (
              <Link to="/cartelera" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '8px', color: '#334155', fontWeight: 'bold' }}>
                <Tv size={18} /> Cartelera
              </Link>
            )}
            {location.pathname !== '/hseq' && (
              <Link to="/hseq" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', padding: '0.5rem 1rem', borderRadius: '8px', color: '#10b981', fontWeight: 'bold' }}>
                <Shield size={18} /> HSEQ
              </Link>
            )}
          </div>
        </header>
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
