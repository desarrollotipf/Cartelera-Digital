import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Pin } from 'lucide-react';

const HrModule = ({
  data,
  isLivePreview,
  isTVMode,
  openEditor,
  onElementClick,
  selectedElementId
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

        if (hrCount === 1) {
          gCols = '1fr';
        } else if (hrCount === 2) {
          gCols = 'repeat(2, 1fr)';
        }

        return (
          <div className="hr-stage-grid" ref={hrGridRef} style={{
            gridTemplateColumns: gCols,
            alignItems: 'start',
            gap: '1.5rem',
            width: '100%',
            overflowY: 'auto'
          }}>
            {[...(data?.hrModule || [])]
              .sort((a, b) => (b.type === 'alert' ? 1 : 0) - (a.type === 'alert' ? 1 : 0))
              .map((item, i) => {
              const isAlert = item.type === 'alert';
              const isFeatured = isAlert;
              const hasImage = Boolean(item.image);

              return (
                <div 
                  key={item.id || i} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: hasImage ? '100%' : 'fit-content',
                    minHeight: hasImage ? '420px' : 'auto'
                  }}
                >
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
                        onElementClick('hr', item.id || i);
                      }
                    }}
                    style={{ 
                      flex: hasImage ? 1 : 'initial', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      cursor: onElementClick ? 'pointer' : 'default', 
                      height: hasImage ? '100%' : 'fit-content' 
                    }}
                  >
                    <div 
                      id={`hr-card-${item.id || i}`} 
                      className={`hr-stage-card stagger-card-pop ${hasImage ? 'hr-card-with-image' : 'hr-card-text-only'}`} 
                      style={{ 
                        '--idx': i, 
                        height: hasImage ? '100%' : 'fit-content', 
                        width: '100%', 
                        flex: hasImage ? 1 : 'initial',
                        padding: hasImage ? '1.75rem' : '1.35rem 1.6rem'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: hasImage ? '100%' : 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: hasImage ? '0.75rem' : '0.4rem' }}>
                          <div className="hr-icon-circle" style={{ width: '44px', height: '44px', minWidth: '44px', minHeight: '44px', borderRadius: '12px', background: 'rgba(225, 29, 72, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Pin size={24} color="#e11d48" strokeWidth={2.3} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: isFeatured ? '1.5rem' : (hasImage ? '1.35rem' : '1.25rem'), fontWeight: 800, color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: 1.25 }}>
                              {item.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Comunicado HR</span>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px',
                                padding: '0.15rem 0.55rem', borderRadius: '999px',
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
                                fontSize: hasImage ? '1.05rem' : '1.15rem', 
                                lineHeight: 1.55, 
                                margin: '0', 
                                whiteSpace: 'pre-wrap' 
                              }}>
                                {item.desc}
                              </p>
                            )}
                          </div>
                        </div>
                        {hasImage && (
                          <div style={{ marginTop: '0.85rem', width: '100%', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', backgroundColor: 'transparent', flex: 1, minHeight: '180px' }}>
                            <img src={item.image} alt="HR Adjunto" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top' }} loading="lazy" />
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
