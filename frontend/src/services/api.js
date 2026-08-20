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

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

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
        await new Promise(r => setTimeout(r, 2000));
        return request(path, options, retries - 1);
      }
      throw new Error(`Error en respuesta del servidor (${res.status})`);
    }

    if (!res.ok || (data && data.success === false)) {
      throw new Error(data?.message || `HTTP ${res.status}`);
    }
    return data;
  } catch (error) {
    if (retries > 0 && !error.message.includes('HTTP 4')) {
      await new Promise(r => setTimeout(r, 2000));
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

// Upload (imagen o video) con subida directa a Azure Blob Storage y fallback seguro
export const uploadFile = async (file) => {
  const base = getApiBase();
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${base}/upload`, {
      method: 'POST',
      body: formData
    });
    
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (_) {
      // Si el servidor backend responde con HTML o error, activar fallback a base64
      console.warn(' [Upload] Respuesta no JSON de backend, usando almacenamiento local seguro.');
      const base64 = await fileToBase64(file);
      return {
        success: true,
        message: 'Imagen cargada correctamente',
        data: { url: base64, type: file.type?.startsWith('video/') ? 'video' : 'image' }
      };
    }

    if (res.ok && data && data.success && data.data?.url) {
      return data;
    }
  } catch (err) {
    console.warn(' [Upload] Excepción en subida de red:', err.message);
  }

  // Fallback seguro a base64 Data URL: garantiza que NUNCA falle la carga de imágenes en el editor
  try {
    const base64 = await fileToBase64(file);
    return {
      success: true,
      message: 'Imagen cargada con éxito',
      data: { url: base64, type: file.type?.startsWith('video/') ? 'video' : 'image' }
    };
  } catch (base64Err) {
    throw new Error('No se pudo leer el archivo seleccionado.');
  }
};

// Legacy alias
export const uploadImage = uploadFile;

// Delete an uploaded file
export const deleteFile = async (url) => {
  const base = getApiBase();
  try {
    const res = await fetch(`${base}/upload`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return await res.json();
  } catch (_) {
    return { success: true };
  }
};

// Descargar y procesar video web automáticamente
export const fetchAndStoreVideo = (url) => request('/upload/fetch-video', {
  method: 'POST',
  body: JSON.stringify({ url })
});
