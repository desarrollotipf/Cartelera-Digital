import { useState, useEffect } from 'react';
import { redeemOtt } from '../services/api';

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
    // 1. Canjear OTT enviándolo a NUESTRO Backend (?userId=...&ott=...)
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const ott = params.get('ott');

    if (userId && ott) {
      setIsAuthenticating(true);
      redeemOtt({ userId: Number(userId), ott })
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
          console.error('No se pudo validar el OTT a través de nuestro Backend:', err);
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
