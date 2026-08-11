import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';

const EventsModule = ({
  data,
  isLivePreview,
  isTVMode,
  openEditor,
  onElementClick,
  selectedElementId,
  eventsTitle,
  eventsCount,
  activeEventIndex
}) => {
  return (
    <motion.div
      key="stage-events-motion"
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      className="block-section"
      onClick={() => openEditor && openEditor('events')}
      style={{ cursor: isTVMode ? 'default' : 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, padding: '1rem', width: '100%', willChange: 'transform' }}
    >
      <div className="block-header" style={{ zIndex: 20 }}>
        <div className="block-title-group">
          <span className="block-icon" style={{ display: 'flex', alignItems: 'center' }}><Megaphone size={38} color="#38bdf8" strokeWidth={2.5} /></span>
          <div>
            <div className="block-title">{eventsTitle}</div>
            <div className="block-subtitle">{eventsCount > 0 ? `Mostrando ${eventsCount} comunicados en rotación` : 'Sin comunicados'}</div>
          </div>
        </div>
      </div>

      <div className="events-carousel-container" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {(data?.events || []).map((ev, i) => {
          const N = (data?.events || []).length;
          let offset = i - activeEventIndex;
          if (N > 2) {
            const half = Math.floor(N / 2);
            if (offset > half) offset -= N;
            else if (offset < -Math.floor((N - 1) / 2)) offset += N;
          }

          let translateX = 0;
          let opacity = 1;
          let zIndex = 10;
          let transition = 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)';

          if (offset === 0) {
            translateX = 0;
            opacity = 1;
            zIndex = 10;
          } else if (offset === 1 || (offset < 0 && N === 2)) {
            translateX = 100;
            opacity = 1;
            zIndex = 9;
          } else if (offset === -1 || (offset > 0 && N === 2 && i < activeEventIndex)) {
            translateX = -100;
            opacity = 1;
            zIndex = 9;
          } else {
            translateX = 100;
            opacity = 0;
            zIndex = 1;
            transition = 'none';
          }

          return (
            <div
              key={ev.id || i}
              className="event-card"
              style={{
                position: 'absolute',
                width: 'min(1100px, 90%)',
                background: 'transparent',
                padding: 0,
                boxShadow: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transform: `translateX(${translateX}%)`,
                zIndex: zIndex,
                opacity: opacity,
                pointerEvents: offset === 0 ? 'auto' : 'none',
                transition: transition
              }}
            >
              
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '24px' }}>
                    {ev.image ? (
                      <img src={ev.image} alt="Evento" className={offset === 0 ? "ken-burns-image" : ""} style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: isTVMode ? '58vh' : '64vh', borderRadius: '24px', boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)' }} loading="lazy" />
                    ) : (
                      <div style={{ width: '100%', minHeight: '35vh', background: 'var(--bg-secondary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                        <Megaphone size={90} color="#94a3b8" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <h2 style={{ margin: '1.2rem 0 0.35rem 0', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    {ev.title}
                  </h2>
                  {ev.desc && <p style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '850px' }}>{ev.desc}</p>}
                </div>
              
            </div>
          );
        })}
        {eventsCount === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '1.3rem' }}>Sin comunicados registrados en el sistema.</p>}
      </div>
    </motion.div>
  );
};

export default EventsModule;
