// API client - Resuelve automáticamente a carteleragh-back en producción o usa Vite proxy en desarrollo
const isProdHost = typeof window !== 'undefined' && (
  window.location.hostname.includes('pollo-fiesta.com') || 
  window.location.hostname.includes('azurewebsites.net')
);

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` 
  : (isProdHost ? 'https://carteleragh-back.azurewebsites.net/api' : '/api');

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Auth
export const loginUser = (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const redeemOtt = (data) => request('/auth/ott/redeem', { method: 'POST', body: JSON.stringify(data) });

// Users
export const getUsers = () => request('/users');
export const createUser = (data) => request('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' });

// Cartelera
export const getCartelera = () => request('/cartelera');
export const updateCartelera = (data) => request('/cartelera', { method: 'POST', body: JSON.stringify(data) });

export const getCumpleanos = () => request('/cumpleanos');

// Health
export const getHealth = () => request('/health');

// External APIs
export const getWeather = () => request('/external/weather');
export const getDollarRate = () => request('/external/dollar');
export const getNews = () => request('/external/news');

// Upload (image or video)
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// Legacy alias
export const uploadImage = uploadFile;

// Delete an uploaded file
export const deleteFile = async (url) => {
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// Descargar y procesar video web automáticamente para reproducción local sin restricciones
export const fetchAndStoreVideo = (url) => request('/upload/fetch-video', {
  method: 'POST',
  body: JSON.stringify({ url })
});

