// API client - Resuelve automáticamente al backend en producción o usa Vite proxy en desarrollo
export const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('pollo-fiesta.com') || hostname.includes('azurewebsites.net')) {
      return 'https://carteleragh-back-d3c9gcd6cpf3fggv.brazilsouth-01.azurewebsites.net/api';
    }
  }
  return '/api';
};

const API_BASE = getApiBase();

async function request(path, options = {}, retries = 1) {
  const base = getApiBase();
  try {
    const res = await fetch(`${base}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (_) {
      if ((text.includes('<!doctype') || text.includes('<html')) && retries > 0) {
        await new Promise(r => setTimeout(r, 2500));
        return request(path, options, retries - 1);
      }
      throw new Error(`El servidor backend se está inicializando. Por favor intenta de nuevo.`);
    }

    if (!res.ok || (data && data.success === false)) {
      throw new Error(data?.message || `HTTP ${res.status}`);
    }
    return data;
  } catch (error) {
    if (retries > 0 && error.message.includes('inicializando')) {
      await new Promise(r => setTimeout(r, 2500));
      return request(path, options, retries - 1);
    }
    throw error;
  }
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

// Upload (image or video) con reintento automático ante arranque en frío de Azure
export const uploadFile = async (file, retries = 1) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const base = getApiBase();
  try {
    const res = await fetch(`${base}/upload`, {
      method: 'POST',
      body: formData
    });
    
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (_) {
      if ((text.includes('<!doctype') || text.includes('<html')) && retries > 0) {
        console.warn('Backend en Azure iniciando, reintentando subida en 2.5s...');
        await new Promise(r => setTimeout(r, 2500));
        return uploadFile(file, retries - 1);
      }
      throw new Error(`El servidor backend está completando su inicio en Azure. Intenta de nuevo.`);
    }

    if (!res.ok || (data && data.success === false)) {
      throw new Error(data?.message || `HTTP ${res.status}`);
    }
    return data;
  } catch (error) {
    if (retries > 0 && error.message.includes('inicio')) {
      await new Promise(r => setTimeout(r, 2500));
      return uploadFile(file, retries - 1);
    }
    throw error;
  }
};

// Legacy alias
export const uploadImage = uploadFile;

// Delete an uploaded file
export const deleteFile = async (url) => {
  const base = getApiBase();
  const res = await fetch(`${base}/upload`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch (_) {
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (!res.ok || (data && data.success === false)) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
};

// Descargar y procesar video web automáticamente para reproducción local sin restricciones
export const fetchAndStoreVideo = (url) => request('/upload/fetch-video', {
  method: 'POST',
  body: JSON.stringify({ url })
});
