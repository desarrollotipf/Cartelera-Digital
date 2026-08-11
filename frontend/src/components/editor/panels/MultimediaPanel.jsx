import { FileVideo, Video, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

export default function MultimediaPanel({ form, handleVideoUpload, isUploading, moveItem, removeVideo, itemRefs, selectedElementId, setSelectedElementId }) {
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
          {isUploading ? 'Cargando Video...' : 'Seleccionar Archivo de Video'}
          <input type="file" accept="video/mp4,video/webm" style={{ display: 'none' }} onChange={handleVideoUpload} disabled={isUploading} />
        </label>
      </div>

      {(form.videos || []).map((v, i) => (
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
          <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
            <button className="canva-icon-btn" onClick={() => moveItem('videos', i, -1)} title="Mover arriba"><ChevronUp size={18} /></button>
            <button className="canva-icon-btn" onClick={() => moveItem('videos', i, 1)} title="Mover abajo"><ChevronDown size={18} /></button>
            <button className="canva-icon-btn" style={{ color: '#f43f5e' }} onClick={() => removeVideo(i)} title="Eliminar video"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
    </>
  );
}
