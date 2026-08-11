import { Plus, Shield, HeartPulse, Leaf, Award, Image, X, ChevronUp, ChevronDown, Copy, Trash2 } from 'lucide-react';

export default function HseqPanel({ form, addHseqItem, updateHseq, handleItemImageUpload, isUploading, moveItem, duplicateItem, removeHseqItem, itemRefs, selectedElementId, setSelectedElementId }) {
  return (
    <>
      <button className="canva-btn canva-btn-primary" onClick={addHseqItem} style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
        <Plus size={18} style={{ marginRight: '4px' }} /> Nuevo Comunicado / Normativa HSEQ
      </button>
      {(form.hseq || []).map((hs, i) => (
        <div 
          key={hs.id || i}
          ref={el => itemRefs.current[`hseq_${hs.id || i}`] = el}
          className={`canva-form-card ${selectedElementId === (hs.id || i) ? 'highlighted canva-card-active-edit' : ''}`}
          onClick={() => setSelectedElementId(hs.id || i)}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 160px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#047857', width: '38px', height: '38px', borderRadius: '8px' }}>
              {hs.category === 'Ambiental' ? <Leaf size={20} color="#34d399" /> : 
               hs.category === 'Calidad' ? <Award size={20} color="#34d399" /> : 
               <Shield size={20} color="#34d399" />}
            </div>
            <input className="canva-input" style={{ fontWeight: 'bold', color: '#34d399' }} value={hs.title || ''} onChange={e => updateHseq(i, 'title', e.target.value)} placeholder="Título de la Norma o Comunicado" />
            <select className="canva-select" value={hs.category || 'SST'} onChange={e => updateHseq(i, 'category', e.target.value)}>
              <option value="SST">Seguridad y Salud (SST)</option>
              <option value="Ambiental">Medio Ambiente</option>
              <option value="Calidad">Calidad & Inocuidad</option>
            </select>
          </div>
          <textarea className="canva-textarea" rows={3} value={hs.desc || ''} onChange={e => updateHseq(i, 'desc', e.target.value)} placeholder="Instrucciones, normativas de bioseguridad o recomendaciones..." />

          {/* Afiche / Imagen HSEQ */}
          <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {hs.image && <img src={hs.image} alt="Afiche HSEQ" style={{ width: 42, height: 42, borderRadius: 6, objectFit: 'cover', border: '1px solid #10b981' }} />}
            <label className="canva-btn canva-btn-secondary" style={{ flex: 1, fontSize: '0.78rem', height: 32, justifyContent: 'center' }}>
              <Image size={15} style={{ marginRight: 6 }} />
              {isUploading ? 'Subiendo...' : (hs.image ? 'Cambiar Imagen' : 'Subir Imagen (Opcional)')}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleItemImageUpload(e, 'hseq', i)} />
            </label>
            {hs.image && <button className="canva-icon-btn" onClick={() => updateHseq(i, 'image', null)} title="Quitar imagen"><X size={16} /></button>}
          </div>

          <div className="canva-action-strip">
            <div className="canva-tool-icons">
              <button className="canva-icon-btn" onClick={() => moveItem('hseq', i, -1)} title="Mover arriba"><ChevronUp size={18} /></button>
              <button className="canva-icon-btn" onClick={() => moveItem('hseq', i, 1)} title="Mover abajo"><ChevronDown size={18} /></button>
              <button className="canva-icon-btn" onClick={() => duplicateItem('hseq', i, 'hs_')} title="Duplicar tarjeta"><Copy size={16} /></button>
            </div>
            <button className="canva-icon-btn" style={{ color: '#f43f5e' }} onClick={() => removeHseqItem(i)} title="Eliminar comunicado"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
    </>
  );
}
