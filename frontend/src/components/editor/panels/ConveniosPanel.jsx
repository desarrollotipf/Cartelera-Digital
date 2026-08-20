import { Plus, Gift, Image, X, ChevronUp, ChevronDown, Copy, Trash2 } from 'lucide-react';

export default function ConveniosPanel({ form, addConvenio, updateConvenio, handleItemImageUpload, isUploading, moveItem, duplicateItem, removeConvenio, itemRefs, selectedElementId, setSelectedElementId }) {
  return (
    <>
      <button className="canva-btn canva-btn-primary" onClick={addConvenio} style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
        <Plus size={18} style={{ marginRight: '4px' }} /> Nuevo Convenio
      </button>
      {(form.convenios || []).map((conv, i) => (
        <div 
          key={conv.id || i}
          ref={el => itemRefs.current[`convenios_${conv.id || i}`] = el}
          className={`canva-form-card ${selectedElementId === (conv.id || i) ? 'highlighted canva-card-active-edit' : ''}`}
          style={{ borderLeft: `4px solid ${conv.color || '#E11D48'}` }}
          onClick={() => setSelectedElementId(conv.id || i)}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 1fr 40px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: conv.color + '30', width: '38px', height: '38px', borderRadius: '8px' }}>
              <Gift size={20} color={conv.color} />
            </div>
            <input className="canva-input" style={{ fontWeight: 'bold', color: conv.color }} value={conv.title || ''} onChange={e => updateConvenio(i, 'title', e.target.value)} placeholder="Título del Convenio" />
            <input className="canva-input" value={conv.category || ''} onChange={e => updateConvenio(i, 'category', e.target.value)} placeholder="Categoría (Ej: Salud, Educación)" />
            <input type="color" value={conv.color || '#E11D48'} onChange={e => updateConvenio(i, 'color', e.target.value)} style={{ width: '100%', height: '38px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent' }} title="Color Representativo" />
          </div>
          
          <div style={{ marginBottom: '0.5rem' }}>
            <input className="canva-input" value={conv.discount || ''} onChange={e => updateConvenio(i, 'discount', e.target.value)} placeholder="Descuento (Ej: 15% dto)" style={{ width: '100%' }} />
          </div>

          <textarea className="canva-textarea" rows={2} value={conv.description || ''} onChange={e => updateConvenio(i, 'description', e.target.value)} placeholder="Descripción..." style={{ resize: 'vertical' }} />
          
          <textarea className="canva-textarea" rows={2} value={conv.details || ''} onChange={e => updateConvenio(i, 'details', e.target.value)} placeholder="Detalles y condiciones..." style={{ resize: 'vertical', marginTop: '0.5rem' }} />

          {/* Imagen del convenio */}
          <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {conv.image && <img src={conv.image} alt="Convenio" style={{ width: 42, height: 42, borderRadius: 6, objectFit: 'cover', border: `1px solid ${conv.color}` }} />}
            <label className="canva-btn canva-btn-secondary" style={{ flex: 1, fontSize: '0.78rem', height: 32, justifyContent: 'center' }}>
              <Image size={15} style={{ marginRight: 6 }} />
              {isUploading === `convenio_${i}` ? 'Subiendo...' : (conv.image ? 'Cambiar Imagen' : 'Subir Imagen')}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleItemImageUpload(e, 'convenio', i)} />
            </label>
            {conv.image && <button className="canva-icon-btn" onClick={() => updateConvenio(i, 'image', null)} title="Quitar imagen"><X size={16} /></button>}
          </div>

          <div className="canva-action-strip">
            <div className="canva-tool-icons">
              <button className="canva-icon-btn" onClick={() => moveItem('convenios', i, -1)} title="Mover arriba"><ChevronUp size={18} /></button>
              <button className="canva-icon-btn" onClick={() => moveItem('convenios', i, 1)} title="Mover abajo"><ChevronDown size={18} /></button>
              <button className="canva-icon-btn" onClick={() => duplicateItem('convenios', i, 'c_')} title="Duplicar tarjeta"><Copy size={16} /></button>
            </div>
            <button className="canva-icon-btn" style={{ color: '#f43f5e' }} onClick={() => removeConvenio(i)} title="Eliminar convenio"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
    </>
  );
}
