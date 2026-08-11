import { Plus, Pin, ChevronUp, ChevronDown, Copy, Trash2, Image, X } from 'lucide-react';

export default function HrPanel({ form, addHrItem, updateHr, handleItemImageUpload, isUploading, moveItem, duplicateItem, removeHrItem, itemRefs, selectedElementId, setSelectedElementId }) {
  return (
    <>
      <button className="canva-btn canva-btn-primary" onClick={addHrItem} style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
        <Plus size={18} style={{ marginRight: '4px' }} /> Nuevo Aviso de Gestión Humana
      </button>
      {(form.hrModule || []).map((hr, i) => (
        <div 
          key={hr.id || i}
          ref={el => itemRefs.current[`hr_${hr.id || i}`] = el}
          className={`canva-form-card ${selectedElementId === (hr.id || i) ? 'highlighted canva-card-active-edit' : ''}`}
          onClick={() => setSelectedElementId(hr.id || i)}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 150px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#881337', width: '38px', height: '38px', borderRadius: '8px' }}>
              <Pin size={20} color="#fda4af" />
            </div>
            <input className="canva-input" style={{ fontWeight: 'bold', color: '#38bdf8' }} value={hr.title || ''} onChange={e => updateHr(i, 'title', e.target.value)} placeholder="Título del Aviso" />
            <select className="canva-select" value={hr.type || 'info'} onChange={e => updateHr(i, 'type', e.target.value)}>
              <option value="info">General (Informativo)</option>
              <option value="alert">Alerta (Atención)</option>
            </select>
          </div>
          <textarea className="canva-textarea" rows={3} value={hr.desc || ''} onChange={e => updateHr(i, 'desc', e.target.value)} placeholder="Contenido o comunicado para el personal..." />

          {/* Afiche / Imagen RRHH */}
          <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {hr.image && <img src={hr.image} alt="Afiche HR" style={{ width: 42, height: 42, borderRadius: 6, objectFit: 'cover', border: '1px solid #fda4af' }} />}
            <label className="canva-btn canva-btn-secondary" style={{ flex: 1, fontSize: '0.78rem', height: 32, justifyContent: 'center' }}>
              <Image size={15} style={{ marginRight: 6 }} />
              {isUploading ? 'Subiendo...' : (hr.image ? 'Cambiar Imagen' : 'Subir Imagen (Opcional)')}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleItemImageUpload(e, 'hrModule', i)} />
            </label>
            {hr.image && <button className="canva-icon-btn" onClick={() => updateHr(i, 'image', null)} title="Quitar imagen"><X size={16} /></button>}
          </div>

          <div className="canva-action-strip">
            <div className="canva-tool-icons">
              <button className="canva-icon-btn" onClick={() => moveItem('hrModule', i, -1)} title="Mover arriba"><ChevronUp size={18} /></button>
              <button className="canva-icon-btn" onClick={() => moveItem('hrModule', i, 1)} title="Mover abajo"><ChevronDown size={18} /></button>
              <button className="canva-icon-btn" onClick={() => duplicateItem('hrModule', i, 'hr_')} title="Duplicar tarjeta"><Copy size={16} /></button>
            </div>
            <button className="canva-icon-btn" style={{ color: '#f43f5e' }} onClick={() => removeHrItem(i)} title="Eliminar aviso"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
    </>
  );
}
