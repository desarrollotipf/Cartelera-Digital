import React from 'react';
import { motion } from 'framer-motion';
import { Shield, HeartPulse, Leaf, Award } from 'lucide-react';

const HseqModule = ({ 
  data, 
  isLivePreview, 
  isTVMode, 
  openEditor, 
  onElementClick, 
  selectedElementId,
  onSelectHseq
}) => {
  const hseqItems = data?.hseq || [];
  const totalCount = hseqItems.length;

  // Agrupar 'Seguridad', 'Salud' (versiones viejas) o 'SST' o sin categoría bajo SST
  const hseqSST = hseqItems.filter(item => !item.category || item.category === 'SST' || item.category === 'Seguridad' || item.category === 'Salud');
  const hseqCalidad = hseqItems.filter(item => item.category === 'Calidad');
  const hseqAmbiental = hseqItems.filter(item => item.category === 'Ambiental');

  const activeColumns = [hseqSST.length > 0, hseqCalidad.length > 0, hseqAmbiental.length > 0].filter(Boolean).length;

  const getCardMetrics = (colItemCount) => {
    // Escalamiento responsive dinámico según la cantidad de tarjetas en el módulo o columna
    const effectiveCount = totalCount === 1 ? 1 : colItemCount;

    if (effectiveCount === 1) {
      return {
        padding: totalCount === 1 ? '2.5rem 3rem' : '2rem 2.25rem',
        iconBoxSize: totalCount === 1 ? '68px' : '56px',
        iconSize: totalCount === 1 ? 36 : 30,
        titleSize: totalCount === 1 ? 'clamp(1.75rem, 2.3vw, 2.4rem)' : 'clamp(1.5rem, 1.8vw, 1.85rem)',
        badgeSize: totalCount === 1 ? '0.95rem' : '0.85rem',
        badgePadding: totalCount === 1 ? '0.3rem 0.85rem' : '0.2rem 0.65rem',
        descSize: totalCount === 1 ? 'clamp(1.2rem, 1.6vw, 1.55rem)' : 'clamp(1.1rem, 1.3vw, 1.25rem)',
        descLineHeight: 1.7,
        gap: '1.25rem',
        flex: 1,
        justify: totalCount === 1 ? 'center' : 'flex-start',
        imageMaxHeight: totalCount === 1 ? '42vh' : '28vh'
      };
    }

    if (effectiveCount === 2) {
      return {
        padding: '1.6rem 1.85rem',
        iconBoxSize: '48px',
        iconSize: 26,
        titleSize: 'clamp(1.35rem, 1.6vw, 1.65rem)',
        badgeSize: '0.8rem',
        badgePadding: '0.2rem 0.6rem',
        descSize: 'clamp(1.05rem, 1.2vw, 1.18rem)',
        descLineHeight: 1.55,
        gap: '0.9rem',
        flex: 1,
        justify: 'flex-start',
        imageMaxHeight: '22vh'
      };
    }

    if (effectiveCount === 3) {
      return {
        padding: '1.2rem 1.4rem',
        iconBoxSize: '40px',
        iconSize: 22,
        titleSize: '1.25rem',
        badgeSize: '0.75rem',
        badgePadding: '0.15rem 0.5rem',
        descSize: '1rem',
        descLineHeight: 1.45,
        gap: '0.75rem',
        flex: 1,
        justify: 'flex-start',
        imageMaxHeight: '16vh'
      };
    }

    // 4 o más tarjetas
    return {
      padding: '0.95rem 1.15rem',
      iconBoxSize: '34px',
      iconSize: 18,
      titleSize: '1.1rem',
      badgeSize: '0.7rem',
      badgePadding: '0.1rem 0.45rem',
      descSize: '0.9rem',
      descLineHeight: 1.4,
      gap: '0.6rem',
      flex: 'initial',
      justify: 'flex-start',
      imageMaxHeight: '13vh'
    };
  };

  const renderHseqCard = (item, i, colorCode, colItemCount) => {
    const metrics = getCardMetrics(colItemCount);

    return (
      <div 
        key={item.id || i} 
        id={`hseq-card-${item.id || i}`} 
        data-hseq-id={item.id || i} 
        data-hseq-index={i} 
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
              onElementClick('hseq', item.id || i);
            } else if (onSelectHseq) {
              e.stopPropagation();
              onSelectHseq(item);
            }
          }}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            cursor: (onElementClick || onSelectHseq) ? 'pointer' : 'default', 
            height: '100%', 
            width: '100%',
            flex: 1
          }}
        >
          <div 
            className="hr-stage-card kpi-stage-card stagger-card-pop" 
            data-hseq-id={item.id || i} 
            data-hseq-index={i}
            onClick={(e) => {
              if (onElementClick) {
                e.stopPropagation();
                onElementClick('hseq', item.id || i);
              } else if (onSelectHseq) {
                e.stopPropagation();
                onSelectHseq(item);
              }
            }}
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
              cursor: (onElementClick || onSelectHseq) ? 'pointer' : 'default',
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
                    background: colorCode + '33',
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
                    item.category === 'Ambiental' ? <Leaf size={metrics.iconSize} color={colorCode} strokeWidth={2.3} /> : 
                    item.category === 'Calidad' ? <Award size={metrics.iconSize} color={colorCode} strokeWidth={2.3} /> : 
                    <Shield size={metrics.iconSize} color={colorCode} strokeWidth={2.3} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: metrics.titleSize, fontWeight: 800, color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: 1.25 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: metrics.badgeSize, color: colorCode, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '6px 0 10px 0' }}>
                    <span style={{ background: colorCode + '20', padding: metrics.badgePadding, borderRadius: '20px', border: `1px solid ${colorCode}40` }}>
                      {item.category === 'Ambiental' ? 'Medio Ambiente' : item.category === 'Calidad' ? 'Calidad e Inocuidad' : 'SST'} • POLLO FIESTA S.A.
                    </span>
                  </div>
                  {item.desc && (
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: metrics.descSize, 
                      lineHeight: metrics.descLineHeight, 
                      margin: '0', 
                      whiteSpace: 'pre-wrap' 
                    }}>
                      {item.desc}
                    </p>
                  )}
                </div>
              </div>

              {item.image && (
                <div style={{ marginTop: '0.85rem', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', flex: 1, maxHeight: metrics.imageMaxHeight }}>
                  <img src={item.image} alt="HSEQ Adjunto" style={{ maxWidth: '100%', maxHeight: '100%', display: 'block', objectFit: 'contain' }} loading="lazy" />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderColumn = (items, categoryTitle, categoryIcon, colorCode) => {
    const count = items.length;
    if (count === 0) return null;

    return (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: count <= 2 ? '1.5rem' : '1rem', 
          minHeight: 0, 
          height: '100%', 
          flex: 1, 
          overflowY: count > 3 ? 'auto' : 'hidden', 
          paddingRight: '0.5rem' 
        }}
      >
        <div className="hseq-column-header" style={{ background: colorCode + '18', padding: '0.85rem 1.2rem', borderRadius: '14px', color: colorCode, fontWeight: 800, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.6rem', border: `1px solid ${colorCode}35`, position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
          {categoryIcon} {categoryTitle}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: count <= 2 ? '1.5rem' : '1rem', flex: 1, height: '100%', minHeight: 0 }}>
          {items.map((item) => renderHseqCard(item, hseqItems.indexOf(item), colorCode, count))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      key="stage-hseq-motion"
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      className="block-section"
      onClick={() => openEditor && openEditor('hseq')}
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
          <span className="block-icon" style={{ display: 'flex', alignItems: 'center' }}><Shield size={38} color="#10b981" strokeWidth={2.5} /></span>
          <div>
            <div className="block-title" style={{ fontSize: '1.75rem', color: '#10b981' }}>Seguridad, Salud & Medio Ambiente (HSEQ)</div>
            <div className="block-subtitle">Protocolos de bioseguridad, prevención y calidad en tiempo real</div>
          </div>
        </div>
      </div>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: activeColumns > 0 ? `repeat(${activeColumns}, 1fr)` : '1fr', 
          gap: '1.75rem', 
          width: '100%', 
          flex: 1, 
          height: '100%',
          minHeight: 0 
        }}
      >
        {renderColumn(hseqSST, 'Seguridad y Salud (SST)', <Shield size={22} />, '#10b981')}
        {renderColumn(hseqCalidad, 'Calidad e Inocuidad', <Award size={22} />, '#38bdf8')}
        {renderColumn(hseqAmbiental, 'Medio Ambiente', <Leaf size={22} />, '#84cc16')}

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
