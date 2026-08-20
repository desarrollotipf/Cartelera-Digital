import { useState, useEffect } from 'react';

const PORTAL_BACKEND = import.meta.env.VITE_PORTAL_BACKEND_URL || 'https://portal-login-backend-d9hhdshme0hsagdc.brazilsouth-01.azurewebsites.net';
const PORTAL_FRONTEND = import.meta.env.VITE_PORTAL_FRONTEND_URL || 'https://portal.pollo-fiesta.com';

export function usePortalAuth() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // 1. Canjear OTT si viene en la URL (?userId=...&ott=...)
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const ott = params.get('ott');

    if (userId && ott) {
      setIsAuthenticating(true);
      fetch(`${PORTAL_BACKEND}/api/auth/ott/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(userId), ott }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error en canje OTT: HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.accessToken) {
            localStorage.setItem('token', data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken);
            }
            if (data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
              setUser(data.user);
            }
            // Limpiar los parámetros de la URL sin recargar la página
            const newUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, newUrl);
          }
        })
        .catch((err) => {
          console.error('No se pudo validar el OTT del Portal FIA:', err);
        })
        .finally(() => {
          setIsAuthenticating(false);
        });
    }

    // 2. Escuchar cierre de sesión sincronizado del Portal FIA
    let bc;
    try {
      bc = new BroadcastChannel('fia_auth');
      bc.onmessage = (e) => {
        if (e.data?.type === 'LOGOUT') {
          localStorage.clear();
          sessionStorage.clear();
          setUser(null);
          window.location.href = PORTAL_FRONTEND;
        }
      };
    } catch {
      // Si BroadcastChannel no está soportado en navegadores antiguos
    }

    return () => {
      try {
        bc?.close();
      } catch {
        // Ignorar
      }
    };
  }, []);

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    window.location.href = PORTAL_FRONTEND;
  };

  return {
    user,
    isAuthenticated: !!user || !!localStorage.getItem('token'),
    isAuthenticating,
    logout,
  };
}
