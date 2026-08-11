import { Plus, Megaphone, Image, X, ChevronUp, ChevronDown, Copy, Trash2 } from 'lucide-react';

export default function EventsPanel({ form, addEvent, updateEvent, handleItemImageUpload, isUploading, moveItem, duplicateItem, removeEvent, itemRefs, selectedElementId, setSelectedElementId }) {
  return (
    <>
      <button className="canva-btn canva-btn-primary" onClick={addEvent} style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
        <Plus size={18} style={{ marginRight: '4px' }} /> Crear Nuevo Evento
      </button>
      {(form.events || []).map((ev, i) => (
        <div 
          key={ev.id || i}
          ref={el => itemRefs.current[`events_${ev.id || i}`] = el}
          className={`canva-form-card ${selectedElementId === (ev.id || i) ? 'highlighted canva-card-active-edit' : ''}`}
          onClick={() => setSelectedElementId(ev.id || i)}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b4274', width: '38px', height: '38px', borderRadius: '8px' }}>
              <Megaphone size={20} color="#38bdf8" />
            </div>
            <input className="canva-input" style={{ fontWeight: 'bold', color: '#38bdf8' }} value={ev.title || ''} onFocus={() => setSelectedElementId(ev.id || i)} onChange={e => updateEvent(i, 'title', e.target.value)} placeholder="Título del comunicado" />
          </div>

          <textarea className="canva-textarea" rows={2} value={ev.desc || ''} onFocus={() => setSelectedElementId(ev.id || i)} onChange={e => updateEvent(i, 'desc', e.target.value)} placeholder="Descripción detallada del evento..." style={{ resize: 'vertical' }} />

          {/* Afiche / Banner Subida Rápida */}
          <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {ev.image && <img src={ev.image} alt="Afiche" style={{ width: 42, height: 42, borderRadius: 6, objectFit: 'cover', border: '1px solid #0b4274' }} />}
            <label className="canva-btn canva-btn-secondary" style={{ flex: 1, fontSize: '0.78rem', height: 32, justifyContent: 'center' }}>
              <Image size={15} style={{ marginRight: 6 }} />
              {isUploading ? 'Subiendo...' : (ev.image ? 'Cambiar Afiche / Imagen' : 'Subir Afiche Corporativo')}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleItemImageUpload(e, 'event', i)} />
            </label>
            {ev.image && <button className="canva-icon-btn" onClick={() => updateEvent(i, 'image', null)} title="Quitar afiche"><X size={16} /></button>}
          </div>

          <div className="canva-action-strip">
            <div className="canva-tool-icons">
              <button className="canva-icon-btn" onClick={() => moveItem('events', i, -1)} title="Mover arriba"><ChevronUp size={18} /></button>
              <button className="canva-icon-btn" onClick={() => moveItem('events', i, 1)} title="Mover abajo"><ChevronDown size={18} /></button>
              <button className="canva-icon-btn" onClick={() => duplicateItem('events', i, 'e_')} title="Duplicar tarjeta"><Copy size={16} /></button>
            </div>
            <button className="canva-icon-btn" style={{ color: '#f43f5e' }} onClick={() => removeEvent(i)} title="Eliminar evento"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
    </>
  );
}
