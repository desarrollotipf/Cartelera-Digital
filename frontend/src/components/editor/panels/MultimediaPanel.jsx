import { useState } from 'react';
import { FileVideo, Video, ChevronUp, ChevronDown, Trash2, Download, Loader2 } from 'lucide-react';
import { fetchAndStoreVideo } from '../../../services/api';

export default function MultimediaPanel({ form, setForm, handleAddVideoUrl, handleVideoUpload, isUploading, moveItem, removeVideo, itemRefs, selectedElementId, setSelectedElementId }) {
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadVideo = async (e, video, index) => {
    e.stopPropagation();
    if (!video?.url) return;
    const vidKey = video.id || index;
    setDownloadingId(vidKey);

    const videoUrl = video.url;
    const cleanName = (video.name || `video_corporativo_${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');

    const triggerBrowserDownload = (downloadPath, fileName) => {
      const link = document.createElement('a');
      link.href = downloadPath;
      link.setAttribute('download', `${fileName}.mp4`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    try {
      // 1. Si ya es un archivo local en el backend (/uploads/...)
      if (videoUrl.includes('/uploads/')) {
        const downloadEndpoint = `/api/upload/download?url=${encodeURIComponent(videoUrl)}&name=${encodeURIComponent(cleanName)}`;
        triggerBrowserDownload(downloadEndpoint, cleanName);
        return;
      }

      // 2. Si es un enlace web externo (YouTube, Shorts, TikTok), descargarlo vía servidor como MP4
      const res = await fetchAndStoreVideo(videoUrl);
      if (res.success && res.data?.url && res.data.url.startsWith('/uploads/')) {
        const downloadEndpoint = `/api/upload/download?url=${encodeURIComponent(res.data.url)}&name=${encodeURIComponent(cleanName)}`;
        triggerBrowserDownload(downloadEndpoint, cleanName);

        // Actualizar el estado local para que quede guardado el video descargado
        if (setForm) {
          setForm(prev => {
            const updatedVideos = [...(prev.videos || [])];
            if (updatedVideos[index]) {
              updatedVideos[index] = {
                ...updatedVideos[index],
                url: res.data.url,
                name: res.data.name || updatedVideos[index].name
              };
            }
            return { ...prev, videos: updatedVideos };
          });
        }
        return;
      } else {
        alert('No se pudo procesar la descarga del video en el servidor.');
      }
    } catch (err) {
      console.error('Fallo en descarga automática de video:', err);
      alert('Error al descargar el video del servidor: ' + (err.message || 'Error desconocido'));
    } finally {
      setTimeout(() => setDownloadingId(null), 1500);
    }
  };

  return (
    <>
      <div className="canva-form-card" style={{ background: 'rgba(37, 99, 235, 0.1)', border: '1px dashed #3b82f6', textAlign: 'center', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <FileVideo size={48} color="#3b82f6" strokeWidth={1.5} />
        </div>
        <h4 style={{ margin: '0 0 0.4rem', color: '#fff' }}>Cargar Nuevo Video Corporativo</h4>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 1rem' }}>Sube archivos MP4 / WebM locales para proyección automática sin pausas.</p>
        <label className="canva-btn canva-btn-primary" style={{ display: 'inline-flex', cursor: 'pointer', alignItems: 'center', gap: '6px' }}>
          <Video size={16} />
          {isUploading ? '⚡ Comprimiendo y optimizando video...' : 'Subir Archivo (.mp4, .mkv, .avi, etc)'}
          <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoUpload} disabled={isUploading} />
        </label>
        
        {isUploading && (
          <div style={{ marginTop: '0.85rem', padding: '0.6rem 1rem', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700 }}>
              🚀 Comprimiendo video con códec H.264 FastStart...
            </span>
            <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
              Reduciendo peso en ~80% para que inicie al instante sin pausas en Smart TVs.
            </small>
          </div>
        )}
        
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.5rem' }}>O añade un enlace de TikTok, YouTube, Shorts o MP4 directo:</p>
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '420px' }}>
            <input 
              type="text" 
              id="video-url-input"
              className="canva-input" 
              placeholder="https://tiktok.com/@... o https://youtube.com/..." 
              style={{ flex: 1 }}
              disabled={isUploading}
            />
            <button 
              className="canva-btn canva-btn-primary" 
              disabled={isUploading}
              onClick={(e) => {
                e.preventDefault();
                const input = document.getElementById('video-url-input');
                if (input && input.value.trim() && handleAddVideoUrl) {
                  handleAddVideoUrl(input.value.trim());
                  input.value = '';
                }
              }}
            >
              {isUploading ? 'Procesando...' : 'Añadir Link'}
            </button>
          </div>
        </div>
      </div>

      {(form.videos || []).map((v, i) => {
        const isDownloadingThis = downloadingId === (v.id || i);
        return (
          <div 
            key={v.id || i}
            ref={el => itemRefs.current[`videos_${v.id || i}`] = el}
            className={`canva-form-card ${selectedElementId === (v.id || i) ? 'highlighted canva-card-active-edit' : ''}`}
            onClick={() => setSelectedElementId(v.id || i)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <div style={{ width: 40, height: 40, background: '#0b4274', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileVideo size={20} color="#38bdf8" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name || `Video Corporativo #${i + 1}`}</div>
                <small style={{ color: '#94a3b8' }}>{v.url}</small>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0, alignItems: 'center' }}>
              <button 
                className="canva-icon-btn" 
                style={{ color: '#38bdf8', opacity: isDownloadingThis ? 0.6 : 1 }} 
                onClick={(e) => handleDownloadVideo(e, v, i)} 
                disabled={isDownloadingThis}
                title="Descargar archivo de video (.mp4)"
              >
                {isDownloadingThis ? <Loader2 size={16} className="spinning" /> : <Download size={16} />}
              </button>
              <button className="canva-icon-btn" onClick={() => moveItem('videos', i, -1)} title="Mover arriba"><ChevronUp size={18} /></button>
              <button className="canva-icon-btn" onClick={() => moveItem('videos', i, 1)} title="Mover abajo"><ChevronDown size={18} /></button>
              <button className="canva-icon-btn" style={{ color: '#f43f5e' }} onClick={() => removeVideo(i)} title="Eliminar video"><Trash2 size={16} /></button>
            </div>
          </div>
        );
      })}
    </>
  );
}
