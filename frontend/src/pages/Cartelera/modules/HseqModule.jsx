import React from 'react';
import { motion } from 'framer-motion';
import { Shield, HeartPulse, Leaf, Award } from 'lucide-react';

const HseqModule = ({ 
  data, 
  isLivePreview, 
  isTVMode, 
  openEditor, 
  onElementClick, 
  selectedElementId 
}) => {
  const hseqItems = data?.hseq || [];
  // Agrupar 'Seguridad', 'Salud' (versiones viejas) o 'SST' o sin categoría bajo SST
  const hseqSST = hseqItems.filter(item => !item.category || item.category === 'SST' || item.category === 'Seguridad' || item.category === 'Salud');
  const hseqCalidad = hseqItems.filter(item => item.category === 'Calidad');
  const hseqAmbiental = hseqItems.filter(item => item.category === 'Ambiental');

  const renderHseqCard = (item, i, colorCode) => (
    <div key={item.id || i} id={`hseq-card-${item.id || i}`} style={{ width: '100%', flexShrink: 0 }}>
      
      <motion.div
        layout
        className={`canva-interactive-element ${String(selectedElementId) === String(item.id || i) ? 'canva-interactive-selected' : ''}`}
        animate={{ 
          scale: String(selectedElementId) === String(item.id || i) ? 1.15 : 1, 
          zIndex: String(selectedElementId) === String(item.id || i) ? 9999 : 1 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        onClick={(e) => {
          if (onElementClick) {
            e.stopPropagation();
            onElementClick('hseq', item.id || i);
          }
        }}
        style={{ display: 'flex', flexDirection: 'column', cursor: onElementClick ? 'pointer' : 'default', height: 'fit-content', width: '100%' }}
      >
        <div className="hr-stage-card stagger-card-pop" style={{ '--idx': i, borderLeft: `4px solid ${colorCode}`, height: 'fit-content', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
              <div className="hr-icon-circle bday-avatar-animated" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: colorCode + '33' }}>
                {item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/') || item.icon.startsWith('data:')) ? (
                  <img src={item.icon} alt="Icono" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} loading="lazy" />
                ) : (
                  item.category === 'Ambiental' ? <Leaf size={26} color={colorCode} strokeWidth={2.3} /> :
                  item.category === 'Calidad' ? <Award size={26} color={colorCode} strokeWidth={2.3} /> :
                  <Shield size={26} color={colorCode} strokeWidth={2.3} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{item.title}</div>
                <div style={{ fontSize: '0.85rem', color: colorCode, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '4px 0 8px 0' }}>
                  {item.category === 'Ambiental' ? 'Medio Ambiente' : item.category === 'Calidad' ? 'Calidad e Inocuidad' : 'SST'} • POLLO FIESTA S.A.
                </div>
                {item.desc && <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, margin: '0', whiteSpace: 'pre-wrap' }}>{item.desc}</p>}
              </div>
            </div>
            {item.image && (
              <div style={{ marginTop: '0.85rem', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                <img src={item.image} alt="HSEQ Adjunto" style={{ maxWidth: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} loading="lazy" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
    </div>
  );

  const activeColumns = [hseqSST.length > 0, hseqCalidad.length > 0, hseqAmbiental.length > 0].filter(Boolean).length;

  return (
    <motion.div
      key="stage-hseq-motion"
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      className="block-section"
      onClick={() => openEditor && openEditor('hseq')}
      style={{ cursor: isTVMode ? 'default' : 'pointer', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1rem', width: '100%', willChange: 'transform' }}
    >
      <div className="block-header" style={{ zIndex: 20 }}>
        <div className="block-title-group">
          <span className="block-icon" style={{ display: 'flex', alignItems: 'center' }}><Shield size={38} color="#10b981" strokeWidth={2.5} /></span>
          <div>
            <div className="block-title" style={{ fontSize: '1.75rem', color: '#10b981' }}>Seguridad, Salud & Medio Ambiente (HSEQ)</div>
            <div className="block-subtitle">Protocolos de bioseguridad, prevención y calidad en tiempo real</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeColumns > 0 ? `repeat(${activeColumns}, 1fr)` : '1fr', gap: '1.5rem', width: '100%', flex: 1, minHeight: 0 }}>
        {hseqSST.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0, overflowY: 'auto', paddingRight: '0.5rem', flexShrink: 0 }}>
            <div className="hseq-column-header" style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px', color: '#10b981', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)', position: 'sticky', top: 0, zIndex: 10 }}>
              <Shield size={20} /> Seguridad y Salud (SST)
            </div>
            {hseqSST.map((item) => renderHseqCard(item, hseqItems.indexOf(item), '#10b981'))}
          </div>
        )}

        {hseqCalidad.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0, overflowY: 'auto', paddingRight: '0.5rem', flexShrink: 0 }}>
            <div className="hseq-column-header" style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px', color: '#38bdf8', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(56, 189, 248, 0.2)', position: 'sticky', top: 0, zIndex: 10 }}>
              <Award size={20} /> Calidad e Inocuidad
            </div>
            {hseqCalidad.map((item) => renderHseqCard(item, hseqItems.indexOf(item), '#38bdf8'))}
          </div>
        )}

        {hseqAmbiental.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0, overflowY: 'auto', paddingRight: '0.5rem', flexShrink: 0 }}>
            <div className="hseq-column-header" style={{ background: 'rgba(132, 204, 22, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px', color: '#84cc16', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(132, 204, 22, 0.2)', position: 'sticky', top: 0, zIndex: 10 }}>
              <Leaf size={20} /> Medio Ambiente
            </div>
            {hseqAmbiental.map((item) => renderHseqCard(item, hseqItems.indexOf(item), '#84cc16'))}
          </div>
        )}

        {activeColumns === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.3rem', width: '100%', height: '100%' }}>
            Sin normativas HSEQ registradas en el momento.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HseqModule;
