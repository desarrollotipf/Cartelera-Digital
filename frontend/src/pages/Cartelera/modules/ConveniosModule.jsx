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
  selectedElementId,
  onCardClick
}) => {
  const convenios = Array.isArray(data) ? data : (data?.convenios || []);
  const totalCount = convenios.length;

  // Distribuir todos los convenios secuencialmente en columnas según cantidad
  let columnCount = 3;
  if (totalCount === 1) columnCount = 1;
  else if (totalCount === 2 || totalCount === 4) columnCount = 2;

  const cols = Array.from({ length: columnCount }, () => []);
  convenios.forEach((item, i) => {
    cols[i % columnCount].push(item);
  });

  const columns = cols.filter(col => col.length > 0);

  const getConvenioMetrics = (colItemCount) => {
    const effectiveCount = totalCount === 1 ? 1 : colItemCount;

    if (effectiveCount === 1) {
      return {
        padding: totalCount === 1 ? '2.5rem 3rem' : '2rem 2.25rem',
        iconBoxSize: totalCount === 1 ? '68px' : '56px',
        iconSize: totalCount === 1 ? 36 : 30,
        titleSize: totalCount === 1 ? 'clamp(1.75rem, 2.3vw, 2.4rem)' : 'clamp(1.45rem, 1.8vw, 1.8rem)',
        badgeSize: totalCount === 1 ? '0.95rem' : '0.85rem',
        descSize: totalCount === 1 ? 'clamp(1.2rem, 1.6vw, 1.55rem)' : 'clamp(1.1rem, 1.3vw, 1.25rem)',
        descLineHeight: 1.65,
        gap: '1.25rem',
        flex: 1,
        justify: totalCount === 1 ? 'center' : 'flex-start',
        imageMaxHeight: totalCount === 1 ? '44vh' : '28vh'
      };
    }

    if (effectiveCount === 2) {
      return {
        padding: '1.6rem 1.85rem',
        iconBoxSize: '48px',
        iconSize: 26,
        titleSize: 'clamp(1.35rem, 1.6vw, 1.65rem)',
        badgeSize: '0.8rem',
        descSize: 'clamp(1.05rem, 1.2vw, 1.18rem)',
        descLineHeight: 1.55,
        gap: '0.9rem',
        flex: 1,
        justify: 'flex-start',
        imageMaxHeight: '22vh'
      };
    }

    return {
      padding: '1.2rem 1.4rem',
      iconBoxSize: '40px',
      iconSize: 22,
      titleSize: '1.25rem',
      badgeSize: '0.75rem',
      descSize: '1rem',
      descLineHeight: 1.45,
      gap: '0.75rem',
      flex: 1,
      justify: 'flex-start',
      imageMaxHeight: '16vh'
    };
  };

  const renderConvenioCard = (item, i, colItemCount) => {
    const colorCode = getItemColor(item);
    const metrics = getConvenioMetrics(colItemCount);

    return (
      <div 
        key={item.id || i} 
        id={`convenio-card-${item.id || i}`} 
        className="convenio-stage-card-wrapper"
        data-convenio-id={item.id}
        data-convenio-index={i}
        style={{ 
          width: '100%', 
          flex: metrics.flex, 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: colItemCount <= 3 ? 0 : '160px'
        }}
      >
        <motion.div
          layout
          className={`canva-interactive-element ${String(selectedElementId) === String(item.id || i) ? 'canva-interactive-selected' : ''}`}
          animate={{ 
            scale: String(selectedElementId) === String(item.id || i) ? 1.05 : 1, 
            zIndex: String(selectedElementId) === String(item.id || i) ? 9999 : 1 
          }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          onClick={(e) => {
            if (onElementClick) {
              e.stopPropagation();
              onElementClick('convenios', item.id || i);
            }
            if (onCardClick) {
              e.stopPropagation();
              onCardClick(item);
            }
          }}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            cursor: 'pointer', 
            height: '100%', 
            width: '100%',
            flex: 1
          }}
        >
          <div 
            className="hr-stage-card convenio-stage-card stagger-card-pop" 
            style={{ 
              '--idx': i, 
              borderLeft: `5px solid ${colorCode}`, 
              height: '100%', 
              width: '100%',
              flex: 1,
              padding: metrics.padding,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: metrics.justify,
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1, justifyContent: metrics.justify }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: metrics.gap, marginBottom: item.image ? '0.75rem' : '0' }}>
                <div 
                  className="hr-icon-circle bday-avatar-animated" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: colorCode + '25', 
                    width: metrics.iconBoxSize,
                    height: metrics.iconBoxSize,
                    minWidth: metrics.iconBoxSize,
                    minHeight: metrics.iconBoxSize,
                    borderRadius: '16px',
                    flexShrink: 0 
                  }}
                >
                  {item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/') || item.icon.startsWith('data:')) ? (
                    <img src={item.icon} alt="Icono" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} loading="lazy" />
                  ) : (
                    getItemIcon(item, colorCode)
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: metrics.titleSize, fontWeight: 800, color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: 1.25 }}>
                      {item.title}
                    </div>
                    {item.discount && (
                      <span style={{ fontSize: metrics.badgeSize, background: colorCode, color: '#fff', padding: '3px 12px', borderRadius: '14px', fontWeight: 900, boxShadow: `0 2px 8px ${colorCode}66` }}>
                        {item.discount}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: metrics.badgeSize, color: colorCode, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '6px 0 8px 0' }}>
                    <span style={{ background: colorCode + '20', padding: '0.2rem 0.65rem', borderRadius: '20px', border: `1px solid ${colorCode}40` }}>
                      {item.category || 'Compensar'} • POLLO FIESTA S.A.
                    </span>
                  </div>
                  {(item.description || item.desc || item.details) && (
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: metrics.descSize, 
                      lineHeight: metrics.descLineHeight, 
                      margin: '0', 
                      whiteSpace: 'pre-wrap' 
                    }}>
                      {item.description || item.desc || item.details}
                    </p>
                  )}
                </div>
              </div>
              {item.image && (
                <div style={{ marginTop: '0.85rem', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', flex: 1, maxHeight: metrics.imageMaxHeight }}>
                  <img src={item.image} alt="Convenio Adjunto" style={{ maxWidth: '100%', maxHeight: '100%', display: 'block', objectFit: 'contain' }} loading="lazy" />
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
      style={{ 
        cursor: isTVMode ? 'default' : 'pointer', 
        flex: 1, 
        height: '100%',
        minHeight: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden', 
        padding: '1.25rem 1.5rem', 
        width: '100%', 
        willChange: 'transform' 
      }}
    >
      <div className="block-header" style={{ zIndex: 20, flexShrink: 0, marginBottom: '1rem' }}>
        <div className="block-title-group">
          <span className="block-icon" style={{ display: 'flex', alignItems: 'center' }}><Gift size={38} color="#E11D48" strokeWidth={2.5} /></span>
          <div>
            <div className="block-title" style={{ fontSize: '1.75rem', color: '#E11D48' }}>Convenios & Beneficios Compensar</div>
            <div className="block-subtitle">Alianzas estratégicas, descuentos y bienestar para colaboradores Pollo Fiesta</div>
          </div>
        </div>
      </div>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: columns.length > 0 ? `repeat(${columns.length}, 1fr)` : '1fr', 
          gap: '1.75rem', 
          width: '100%', 
          flex: 1, 
          height: '100%',
          minHeight: 0 
        }}
      >
        {columns.map((colItems, colIdx) => (
          <div 
            key={colIdx} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: colItems.length <= 2 ? '1.5rem' : '1rem', 
              minHeight: 0, 
              height: '100%',
              flex: 1,
              overflowY: colItems.length > 3 ? 'auto' : 'hidden', 
              paddingRight: '0.5rem' 
            }}
          >
            {colItems.map((item) => renderConvenioCard(item, convenios.indexOf(item), colItems.length))}
          </div>
        ))}

        {columns.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.3rem', width: '100%', height: '100%' }}>
            Sin convenios o beneficios registrados en el momento.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ConveniosModule;
