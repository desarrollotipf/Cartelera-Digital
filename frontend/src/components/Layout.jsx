import { Outlet, Link, useLocation } from 'react-router-dom';
import { Tv, Shield, LogOut } from 'lucide-react';
import { usePortalAuth } from '../hooks/usePortalAuth';
import { isHseqScope, isAdminScope } from '../utils/authUtils';
import LiveClock from './LiveClock';

export default function Layout({ title, onLogout }) {
  const location = useLocation();
  const { user } = usePortalAuth();

  const isHseq = isHseqScope(user);
  const isAdmin = isAdminScope(user);

  const accentColor = isHseq && !isAdmin ? '#059669' : '#0B4274';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', background: "#F0F4FA url('/images/fondo-pantalla.png') center/100% 100% fixed no-repeat" }}>
      {/* Top Header Institucional sin barra lateral */}
      <header style={{
        padding: '0.85rem 2rem',
        background: '#ffffff',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Identidad Institucional */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img src="/images/logo-pollo.png" alt="Pollo Fiesta" style={{ height: '42px', objectFit: 'contain' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              POLLO FIESTA S.A.
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                padding: '0.15rem 0.6rem',
                borderRadius: '6px',
                background: isHseq && !isAdmin ? '#ecfdf5' : '#e0f2fe',
                color: isHseq && !isAdmin ? '#059669' : '#0284c7',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {isHseq && !isAdmin ? <Shield size={12} /> : <Tv size={12} />}
                {isHseq && !isAdmin ? 'Normativas HSEQ' : 'Gestión Humana — Cartelera Digital'}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones y reloj */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Si es Admin, permitir conmutar entre ambas áreas */}
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px' }}>
              <Link
                to="/cartelera"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  background: location.pathname === '/cartelera' ? '#0b4274' : 'transparent',
                  color: location.pathname === '/cartelera' ? '#ffffff' : '#64748b'
                }}
              >
                <Tv size={15} /> Cartelera Digital
              </Link>
              <Link
                to="/hseq"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  background: location.pathname === '/hseq' ? '#059669' : 'transparent',
                  color: location.pathname === '/hseq' ? '#ffffff' : '#64748b'
                }}
              >
                <Shield size={15} /> Normativas HSEQ
              </Link>
            </div>
          )}

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.45rem 1rem',
            fontSize: '0.95rem',
            fontWeight: 800,
            color: '#334155',
            fontFamily: 'monospace'
          }}>
            <LiveClock />
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                padding: '0.4rem',
                borderRadius: '8px'
              }}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Contenedor principal a ancho completo */}
      <main style={{ flex: 1, padding: '1.5rem', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }}>
        <Outlet />
      </main>
    </div>
  );
}
