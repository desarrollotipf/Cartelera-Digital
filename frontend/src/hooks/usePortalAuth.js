import { useState, useEffect, useRef } from 'react';
import { redeemOtt } from '../services/api';

const PORTAL_FRONTEND = import.meta.env.VITE_PORTAL_FRONTEND_URL || 'https://portal.pollo-fiesta.com';

export function usePortalAuth() {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');
  const ott = params.get('ott');

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticating, setIsAuthenticating] = useState(() => Boolean(userId && ott));
  const [authError, setAuthError] = useState(null);
  const hasRedeemedRef = useRef(false);

  useEffect(() => {
    // 1. Si viene con OTT en la URL (?userId=...&ott=...), canjearlo con el Backend
    if (userId && ott && !hasRedeemedRef.current) {
      hasRedeemedRef.current = true;
      setIsAuthenticating(true);

      redeemOtt({ userId: Number(userId), ott })
        .then((data) => {
          if (data.accessToken && data.user) {
            localStorage.setItem('token', data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken);
            }
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);

            // Limpiar los parámetros de la URL sin recargar la página
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
          } else {
            throw new Error('Respuesta inválida del servidor de autenticación');
          }
        })
        .catch((err) => {
          console.error(' [Auth] Token OTT inválido o expirado:', err);
          setAuthError('Token OTT no válido o sesión expirada. Redirigiendo al Portal FIA...');
          localStorage.clear();
          sessionStorage.clear();
          setUser(null);
          setTimeout(() => {
            window.location.replace(PORTAL_FRONTEND);
          }, 1200);
        })
        .finally(() => {
          setIsAuthenticating(false);
        });
      return;
    }

    // 2. Si NO hay OTT y NO hay sesión activa, REDIRIGIR INMEDIATAMENTE al Portal FIA
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!userId && !ott && (!token || !savedUser)) {
      window.location.replace(PORTAL_FRONTEND);
      return;
    }

    // 3. Escuchar evento de cierre de sesión sincronizado desde el Portal FIA
    let bc;
    try {
      bc = new BroadcastChannel('fia_auth');
      bc.onmessage = (e) => {
        if (e.data?.type === 'LOGOUT') {
          localStorage.clear();
          sessionStorage.clear();
          setUser(null);
          window.location.replace(PORTAL_FRONTEND);
        }
      };
    } catch (_) {}

    return () => {
      try {
        bc?.close();
      } catch (_) {}
    };
  }, [userId, ott]);

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    window.location.replace(PORTAL_FRONTEND);
  };

  const isAuthenticated = Boolean(user && localStorage.getItem('token'));

  return {
    user,
    isAuthenticated,
    isAuthenticating,
    authError,
    logout,
  };
}
