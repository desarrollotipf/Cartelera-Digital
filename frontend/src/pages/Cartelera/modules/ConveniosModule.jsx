import React from 'react';
import { motion } from 'framer-motion';
import { Gift, HeartPulse, GraduationCap, Plane, Utensils, Award, Tag, Sparkles } from 'lucide-react';

const getItemColor = (item) => {
  if (item.color) return item.color;
  const cat = String(item.category || '').toUpperCase();
  if (cat.includes('BECA') || cat.includes('EDUC') || cat.includes('UNIVERSIDAD')) return '#38bdf8';
  if (cat.includes('PRIVILEG') || cat.includes('HOGAR')) return '#f59e0b';
  if (cat.includes('TURIS') || cat.includes('VIAJE')) return '#0ea5e9';
  if (cat.includes('DEPORT') || cat.includes('SALUD')) return '#10b981';
  return '#E11D48';
};

const getItemIcon = (item, colorCode) => {
  const cat = String(item.category || '').toLowerCase();
  if (cat.includes('beca') || cat.includes('educaci') || cat.includes('universidad')) return <GraduationCap size={26} color={colorCode} strokeWidth={2.3} />;
  if (cat.includes('salud') || cat.includes('deport')) return <HeartPulse size={26} color={colorCode} strokeWidth={2.3} />;
  if (cat.includes('viaje') || cat.includes('turis')) return <Plane size={26} color={colorCode} strokeWidth={2.3} />;
  if (cat.includes('restauran') || cat.includes('gastro')) return <Utensils size={26} color={colorCode} strokeWidth={2.3} />;
  if (cat.includes('privilegio') || cat.includes('premio')) return <Award size={26} color={colorCode} strokeWidth={2.3} />;
  return <Gift size={26} color={colorCode} strokeWidth={2.3} />;
};

const ConveniosModule = ({
  data,
  isLivePreview,
  isTVMode,
  openEditor,
  onElementClick,
  selectedElementId
}) => {
  const convenios = Array.isArray(data) ? data : (data?.convenios || []);

  // Distribuir todos los convenios secuencialmente en 3 columnas balanceadas
  const col1 = convenios.filter((_, i) => i % 3 === 0);
  const col2 = convenios.filter((_, i) => i % 3 === 1);
  const col3 = convenios.filter((_, i) => i % 3 === 2);

  const columns = [col1, col2, col3].filter(col => col.length > 0);
  const columnCount = columns.length;

  const renderConvenioCard = (item, i) => {
    const colorCode = getItemColor(item);
    return (
      <div key={item.id || i} id={`convenio-card-${item.id || i}`} style={{ width: '100%', flexShrink: 0 }}>
        <motion.div
          layout
          className={`canva-interactive-element ${String(selectedElementId) === String(item.id || i) ? 'canva-interactive-selected' : ''}`}
          animate={{ 
            scale: String(selectedElementId) === String(item.id || i) ? 1.08 : 1, 
            zIndex: String(selectedElementId) === String(item.id || i) ? 9999 : 1 
          }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          onClick={(e) => {
            if (onElementClick) {
              e.stopPropagation();
              onElementClick('convenios', item.id || i);
            }
          }}
          style={{ display: 'flex', flexDirection: 'column', cursor: onElementClick ? 'pointer' : 'default', height: 'fit-content', width: '100%' }}
        >
          <div className="hr-stage-card stagger-card-pop" style={{ '--idx': i, borderLeft: `4px solid ${colorCode}`, height: 'fit-content', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                <div className="hr-icon-circle bday-avatar-animated" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: colorCode + '25', flexShrink: 0 }}>
                  {item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/') || item.icon.startsWith('data:')) ? (
                    <img src={item.icon} alt="Icono" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} loading="lazy" />
                  ) : (
                    getItemIcon(item, colorCode)
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                      {item.title}
                    </div>
                    {item.discount && (
                      <span style={{ fontSize: '0.8rem', background: colorCode, color: '#fff', padding: '2px 10px', borderRadius: '12px', fontWeight: 900, boxShadow: `0 2px 8px ${colorCode}66` }}>
                        {item.discount}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: colorCode, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '4px 0 8px 0' }}>
                    {item.category || 'Compensar'} • POLLO FIESTA S.A.
                  </div>
                  {(item.description || item.desc || item.details) && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.5, margin: '0', whiteSpace: 'pre-wrap' }}>
                      {item.description || item.desc || item.details}
                    </p>
                  )}
                </div>
              </div>
              {item.image && (
                <div style={{ marginTop: '0.85rem', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                  <img src={item.image} alt="Convenio Adjunto" style={{ maxWidth: '100%', height: 'auto', maxHeight: '42vh', display: 'block', objectFit: 'contain' }} loading="lazy" />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <motion.div
      key="stage-convenios-motion"
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      className="block-section"
      onClick={() => openEditor && openEditor('convenios')}
      style={{ cursor: isTVMode ? 'default' : 'pointer', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1rem', width: '100%', willChange: 'transform' }}
    >
      <div className="block-header" style={{ zIndex: 20 }}>
        <div className="block-title-group">
          <span className="block-icon" style={{ display: 'flex', alignItems: 'center' }}><Gift size={38} color="#E11D48" strokeWidth={2.5} /></span>
          <div>
            <div className="block-title" style={{ fontSize: '1.75rem', color: '#E11D48' }}>Convenios & Beneficios Compensar</div>
            <div className="block-subtitle">Alianzas estratégicas, descuentos y bienestar para colaboradores Pollo Fiesta</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: columnCount > 0 ? `repeat(${Math.min(columnCount, 3)}, 1fr)` : '1fr', gap: '1.5rem', width: '100%', flex: 1, minHeight: 0 }}>
        {columns.map((colItems, colIdx) => (
          <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0, overflowY: 'auto', paddingRight: '0.5rem', flexShrink: 0 }}>
            {colItems.map((item) => renderConvenioCard(item, convenios.indexOf(item)))}
          </div>
        ))}

        {columnCount === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.3rem', width: '100%', height: '100%' }}>
            Sin convenios o beneficios registrados en el momento.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ConveniosModule;
