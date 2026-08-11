import { Palette, Megaphone, Pin } from 'lucide-react';

export default function TopBarPanel({ form, setForm, updateTitle, selectedElementId, itemRefs }) {
  return (
    <>
      <div 
        ref={el => itemRefs.current['topbar_titles'] = el}
        className={`canva-form-card ${selectedElementId === 'titles' ? 'highlighted' : ''}`}
      >
        <label className="canva-form-label">Títulos de la Cartelera</label>
        <input className="canva-input" style={{ marginBottom: '0.6rem' }} value={form.titles?.appTitle || ''} onChange={e => updateTitle('appTitle', e.target.value)} placeholder="Título Principal" />
        <input className="canva-input" value={form.titles?.appSubtitle || ''} onChange={e => updateTitle('appSubtitle', e.target.value)} placeholder="Subtítulo Corporativo" />
      </div>

      <div 
        ref={el => itemRefs.current['topbar_marquesina'] = el}
        className={`canva-form-card ${selectedElementId === 'marquesina' ? 'highlighted' : ''}`}
      >
        <label className="canva-form-label">Cinta de Comunicados (Marquesina)</label>
        <input className="canva-input" style={{ marginBottom: '0.8rem' }} value={form.topBar?.marquesina || ''} onChange={(e) => setForm({ ...form, topBar: { ...form.topBar, marquesina: e.target.value } })} placeholder="Ej: Bienvenidos a la planta..." />
        <label className="canva-form-label">Velocidad de Rotación General de Pantallas (Segundos)</label>
        <input className="canva-input" type="number" min="5" max="60" value={form.topBar?.rotationSpeed !== undefined ? form.topBar.rotationSpeed : 10} onChange={(e) => setForm({ ...form, topBar: { ...form.topBar, rotationSpeed: e.target.value === '' ? '' : Number(e.target.value) } })} />
      </div>

      <div className="canva-form-card" style={{ background: 'rgba(11, 66, 116, 0.15)', borderColor: '#0b4274' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span className="canva-form-label" style={{ color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><Palette size={16} /> Opacidad Glassmorphism</span>
          <span style={{ fontWeight: 800, color: '#38bdf8' }}>{Math.round((form.topBar?.moduleOpacity !== undefined ? form.topBar.moduleOpacity : 0.68) * 100)}%</span>
        </div>
        <input 
          type="range" min="0.10" max="1.00" step="0.05" 
          value={form.topBar?.moduleOpacity !== undefined ? form.topBar.moduleOpacity : 0.68}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setForm({ ...form, topBar: { ...form.topBar, moduleOpacity: val } });
            document.documentElement.style.setProperty('--mod-opacity', val);
          }}
          style={{ width: '100%', accentColor: '#0b4274', cursor: 'pointer', height: '6px' }}
        />
        <small style={{ display: 'block', marginTop: '0.6rem', color: '#94a3b8', fontSize: '0.78rem' }}>
          Controla la transparencia de las tarjetas y paneles para resaltar el fondo.
        </small>
      </div>

      <div className="canva-form-card">
        <label className="canva-form-label">Nombres Oficiales de Módulos (Con Iconografía SVG)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem', background: 'rgba(56, 189, 248, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
          <Megaphone size={22} color="#38bdf8" />
          <input className="canva-input" value={form.titles?.eventsTitle || ''} onChange={e => updateTitle('eventsTitle', e.target.value)} placeholder="Título Eventos" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(225, 29, 72, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
          <Pin size={22} color="#f43f5e" />
          <input className="canva-input" value={form.titles?.hrTitle || ''} onChange={e => updateTitle('hrTitle', e.target.value)} placeholder="Título RRHH" />
        </div>
      </div>
    </>
  );
}
