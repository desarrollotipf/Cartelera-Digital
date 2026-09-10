import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Pin } from 'lucide-react';

const HrModule = ({
  data,
  isLivePreview,
  isTVMode,
  openEditor,
  onElementClick,
  selectedElementId,
  onSelectHr
}) => {
  const hrGridRef = useRef(null);
  
  return (
    <motion.div
      key="stage-hr-motion"
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      className="block-section"
      onClick={() => openEditor && openEditor('hrModule')}
      style={{ cursor: isTVMode ? 'default' : 'pointer', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1rem', width: '100%', willChange: 'transform' }}
    >
      <div className="block-header" style={{ zIndex: 20 }}>
        <div className="block-title-group">
          <span className="block-icon" style={{ display: 'flex', alignItems: 'center' }}><Pin size={38} color="#e11d48" strokeWidth={2.5} /></span>
          <div>
            <div className="block-title" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Avisos Gestión Humana</div>
            <div className="block-subtitle">Comunicados importantes</div>
          </div>
        </div>
      </div>

      {(() => {
        const hrCount = (data?.hrModule || []).length;

        let gCols = 'repeat(3, 1fr)';
        if (hrCount === 1) gCols = '1fr';
        else if (hrCount === 2) gCols = 'repeat(2, 1fr)';

        const getHrMetrics = (count) => {
          if (count === 1) {
            return {
              padding: '2.5rem 3rem',
              titleSize: 'clamp(1.75rem, 2.3vw, 2.4rem)',
              badgeSize: '0.85rem',
              descSize: 'clamp(1.2rem, 1.6vw, 1.55rem)',
              descLineHeight: 1.7,
              iconBoxSize: '64px',
              iconSize: 34,
              gap: '1.25rem',
              justify: 'center'
            };
          }
          if (count === 2) {
            return {
              padding: '1.75rem 2rem',
              titleSize: 'clamp(1.4rem, 1.7vw, 1.75rem)',
              badgeSize: '0.78rem',
              descSize: 'clamp(1.05rem, 1.25vw, 1.2rem)',
              descLineHeight: 1.6,
              iconBoxSize: '50px',
              iconSize: 26,
              gap: '0.9rem',
              justify: 'flex-start'
            };
          }
          return {
            padding: '1.25rem 1.5rem',
            titleSize: '1.3rem',
            badgeSize: '0.72rem',
            descSize: '1.05rem',
            descLineHeight: 1.5,
            iconBoxSize: '42px',
            iconSize: 22,
            gap: '0.75rem',
            justify: 'flex-start'
          };
        };

        const metrics = getHrMetrics(hrCount);

        return (
          <div className="hr-stage-grid" ref={hrGridRef} style={{
            gridTemplateColumns: gCols,
            alignItems: 'stretch',
            gap: hrCount <= 2 ? '1.75rem' : '1.25rem',
            width: '100%',
            height: '100%',
            flex: 1,
            minHeight: 0,
            overflowY: hrCount > 3 ? 'auto' : 'hidden'
          }}>
            {[...(data?.hrModule || [])]
              .sort((a, b) => (b.type === 'alert' ? 1 : 0) - (a.type === 'alert' ? 1 : 0))
              .map((item, i) => {
              const isAlert = item.type === 'alert';
              const hasImage = Boolean(item.image);

              return (
                <div 
                  key={item.id || i} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    flex: 1,
                    minHeight: hrCount <= 3 ? 0 : '180px'
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
                        onElementClick('hr', item.id || i);
                      } else if (onSelectHr) {
                        e.stopPropagation();
                        onSelectHr(item);
                      }
                    }}
                    style={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      cursor: (onElementClick || onSelectHr) ? 'pointer' : 'default', 
                      height: '100%',
                      width: '100%' 
                    }}
                  >
                    <div 
                      id={`hr-card-${item.id || i}`} 
                      data-hr-id={item.id || i}
                      data-hr-index={i}
                      onClick={(e) => {
                        if (onElementClick) {
                          e.stopPropagation();
                          onElementClick('hr', item.id || i);
                        } else if (onSelectHr) {
                          e.stopPropagation();
                          onSelectHr(item);
                        }
                      }}
                      className={`hr-stage-card stagger-card-pop ${hasImage ? 'hr-card-with-image' : 'hr-card-text-only'}`} 
                      style={{ 
                        '--idx': i, 
                        height: '100%', 
                        width: '100%', 
                        flex: 1,
                        padding: metrics.padding,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: metrics.justify,
                        cursor: (onElementClick || onSelectHr) ? 'pointer' : 'default',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', flex: 1, justifyContent: metrics.justify }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: metrics.gap, marginBottom: hasImage ? '0.75rem' : '0' }}>
                          <div 
                            className="hr-icon-circle" 
                            style={{ 
                              width: metrics.iconBoxSize, 
                              height: metrics.iconBoxSize, 
                              minWidth: metrics.iconBoxSize, 
                              minHeight: metrics.iconBoxSize, 
                              borderRadius: '14px', 
                              background: 'rgba(225, 29, 72, 0.1)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              flexShrink: 0 
                            }}
                          >
                            <Pin size={metrics.iconSize} color="#e11d48" strokeWidth={2.3} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: metrics.titleSize, fontWeight: 800, color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: 1.25 }}>
                              {item.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: metrics.badgeSize, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Comunicado HR</span>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                fontSize: metrics.badgeSize, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px',
                                padding: '0.2rem 0.65rem', borderRadius: '999px',
                                background: item.type === 'alert' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                                color: item.type === 'alert' ? '#ef4444' : '#22c55e',
                                border: `1px solid ${item.type === 'alert' ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
                              }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
                                {item.type === 'alert' ? 'Alerta' : 'General'}
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
                        {hasImage && (
                          <div style={{ marginTop: '0.85rem', width: '100%', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', flex: 1, minHeight: '180px', maxHeight: hrCount === 1 ? '44vh' : '26vh' }}>
                            <img src={item.image} alt="HR Adjunto" style={{ maxWidth: '100%', maxHeight: '100%', display: 'block', objectFit: 'contain' }} loading="lazy" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
            {(data?.hrModule || []).length === 0 && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.3rem' }}>
                Sin avisos de Gestión Humana registrados por el momento.
              </div>
            )}
          </div>
        );
      })()}
    </motion.div>
  );
};

export default HrModule;
