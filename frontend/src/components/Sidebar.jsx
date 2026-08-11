import { Link, useLocation } from 'react-router-dom';
import { Tv, Shield } from 'lucide-react';

export default function Sidebar({ onLogout }) {
  const location = useLocation();

  const links = [
    { to: '/cartelera', label: 'Cartelera Digital', icon: <Tv size={20} /> },
    { to: '/hseq', label: 'Normativas HSEQ', icon: <Shield size={20} /> },
  ];

  return (
    <aside style={{ width: '250px', background: '#fff', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="/images/logo-pollo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#E11D48' }}>Pollo Fiesta</h2>
          <span style={{ fontSize: '0.8rem', color: '#666' }}></span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem 1.5rem',
              textDecoration: 'none',
              color: location.pathname === link.to ? '#E11D48' : '#444',
              background: location.pathname === link.to ? '#FFF1F2' : 'transparent',
              fontWeight: location.pathname === link.to ? 'bold' : 'normal',
              borderRight: location.pathname === link.to ? '4px solid #E11D48' : '4px solid transparent'
            }}
          >
            <span style={{ marginRight: '0.75rem' }}>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

    </aside>
  );
}
