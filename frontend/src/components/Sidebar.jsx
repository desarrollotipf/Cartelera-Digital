import { Link, useLocation } from 'react-router-dom';
import { Tv, Shield } from 'lucide-react';
import { usePortalAuth } from '../hooks/usePortalAuth';
import { isHseqScope, isAdminScope } from '../utils/authUtils';

export default function Sidebar({ onLogout }) {
  const location = useLocation();
  const { user } = usePortalAuth();

  const isHseq = isHseqScope(user);
  const isAdmin = isAdminScope(user);

  const allLinks = [
    { to: '/cartelera', label: 'Cartelera Digital', icon: <Tv size={20} />, scope: 'RRHH' },
    { to: '/hseq', label: 'Normativas HSEQ', icon: <Shield size={20} />, scope: 'HSEQ' },
  ];

  const links = allLinks.filter((link) => {
    if (isAdmin) return true;
    if (isHseq) return link.scope === 'HSEQ';
    return link.scope === 'RRHH';
  });

  const accentColor = isHseq && !isAdmin ? '#059669' : '#E11D48';
  const activeBg = isHseq && !isAdmin ? '#ECFDF5' : '#FFF1F2';
  const subtitle = isHseq && !isAdmin ? 'Área HSEQ' : 'Gestión Humana';

  return (
    <aside style={{ width: '250px', background: '#fff', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="/images/logo-pollo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: accentColor }}>Pollo Fiesta</h2>
          <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600 }}>{subtitle}</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                color: isActive ? accentColor : '#444',
                background: isActive ? activeBg : 'transparent',
                fontWeight: isActive ? 'bold' : 'normal',
                borderRight: isActive ? `4px solid ${accentColor}` : '4px solid transparent'
              }}
            >
              <span style={{ marginRight: '0.75rem' }}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
