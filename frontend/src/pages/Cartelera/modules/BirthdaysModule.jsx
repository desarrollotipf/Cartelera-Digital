import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Cake, PartyPopper, Crown, Calendar, Sparkles, Flame } from 'lucide-react';
import { formatShortName } from '../../../utils/nameFormatter';

const BirthdaysModule = ({
  bdayTitle,
  birthdays,
  todayBirthdays,
  isLivePreview,
  isTVMode,
  openEditor,
  onElementClick,
  selectedElementId
}) => {
  const bdayGridRef = useRef(null);

  // Determinar si mostramos diseño de 3 columnas (cuando no hay cumpleaños hoy)
  const isGrid3 = todayBirthdays.length === 0;
  // Si es 3 columnas, caben 2 filas (6 tarjetas). Si es 1 columna en sidebar, caben 3 tarjetas.
  const overflowLimit = isGrid3 ? 6 : 3;
  const shouldScroll = birthdays.length > overflowLimit;

  // Preparar lista de elementos
  let displayItems = [];
  if (shouldScroll) {
    if (isGrid3) {
      // Rellenar con placeholders para que la cantidad sea múltiplo de 3
      // y evitar saltos visuales de columnas durante el scroll vertical infinito
      const padded = [...birthdays];
      const remainder = padded.length % 3;
      if (remainder !== 0) {
        const fillCount = 3 - remainder;
        for (let i = 0; i < fillCount; i++) {
          padded.push({ isPlaceholder: true });
        }
      }
      displayItems = [...padded, ...padded];
    } else {
      displayItems = [...birthdays, ...birthdays];
    }
  } else {
    displayItems = birthdays;
  }

  // Velocidad de scroll ágil y fluida
  const speed = isGrid3 
    ? Math.max(18, Math.ceil(birthdays.length / 3) * 4)
    : Math.max(18, birthdays.length * 3.5);

  return (
    <motion.div
      key="stage-bday-motion"
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      className="block-section"
      onClick={() => openEditor && openEditor('workers')}
      style={{ cursor: isTVMode ? 'default' : 'pointer', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1rem 1.5rem', width: '100%', willChange: 'transform' }}
    >
      <div className="block-header" style={{ marginBottom: '1.25rem' }}>
        <div className="block-title-group">
          <span className="block-icon" style={{ display: 'flex', alignItems: 'center' }}><Cake size={38} color="#d97706" strokeWidth={2.5} /></span>
          <div>
            <div className="block-title" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>{bdayTitle || '¡Cumpleaños y Celebraciones!'}</div>
            <div className="block-subtitle"> Pollo Fiesta S.A.</div>
          </div>
        </div>
        <span className="month-badge" style={{ fontSize: '1rem', padding: '0.5rem 1.5rem', background: 'linear-gradient(135deg, var(--primary) 0%, #be123c 100%)', color: '#fff', border: 'none', boxShadow: '0 4px 18px rgba(225, 29, 72, 0.45)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PartyPopper size={20} /> Este Mes
        </span>
      </div>

      <div className="bday-stage-container" style={todayBirthdays.length === 0 ? { gridTemplateColumns: '1fr' } : {}}>
        {/* COLUMNA LATERAL (30% / 100%): Cumpleaños del Mes */}
        <div className="bday-weekly-sidebar" ref={bdayGridRef}>
          <div className="bday-weekly-header">
            <span style={{ fontWeight: 900, fontSize: '1.35rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cake size={24} color="#d97706" /> En el mes ({birthdays.length})
            </span>
            <span style={{ fontSize: '0.85rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '14px', fontWeight: 800 }}>
              MENSUAL
            </span>
          </div>

          <div className="bday-escalator-container">
            {birthdays.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.15rem', fontStyle: 'italic' }}>
                Sin celebrantes este mes.
              </div>
            ) : (
              <div 
                className="bday-escalator-track" 
                style={{ 
                  display: isGrid3 ? 'grid' : 'flex',
                  flexDirection: isGrid3 ? undefined : 'column',
                  gridTemplateColumns: isGrid3 ? 'repeat(3, 1fr)' : undefined,
                  gap: '1.25rem',
                  width: '100%',
                  animation: shouldScroll ? `bday-escalator-scroll ${speed}s linear 2s infinite` : 'none'
                }}
              >
                {displayItems.map((w, i) => {
                  if (w.isPlaceholder) {
                    return (
                      <div 
                        key={`placeholder-${i}`} 
                        className="bday-month-card" 
                        style={{ opacity: 0, pointerEvents: 'none', flexShrink: 0 }} 
                      />
                    );
                  }
                  
                  const shortName = formatShortName(w.name);
                  return (
                    <div key={`${w.id || w.personId || i}-${i}`} className="bday-month-card stagger-card-pop" style={{ '--idx': i, position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start', flexShrink: 0 }}>

                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0.3rem' }}>
                        {w.isToday && (
                          <span style={{ position: 'absolute', top: '-8px', right: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontSize: '0.75rem', fontWeight: 900, padding: '2px 9px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ¡HOY! <PartyPopper size={13} />
                          </span>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.85rem' }}>
                          {w.image && (
                            <img src={w.image} alt={shortName} style={{ width: 48, height: 48, borderRadius: '10px', objectFit: 'cover', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} loading="lazy" />
                          )}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {shortName}
                            </div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Calendar size={15} /> {
                                (() => {
                                  const d = w.birthdate || w.date || w.birthDate;
                                  if (!d) return 'Sin fecha';
                                  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
                                    const parts = d.split('T')[0].split('-');
                                    const day = parseInt(parts[2], 10);
                                    const month = parseInt(parts[1], 10) - 1;
                                    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                                    return `${day < 10 ? '0' + day : day} de ${months[month]}`;
                                  }
                                  return d;
                                })()
                              }
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', borderTop: '1px solid var(--border)', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                          {w.department ? `${w.role || ''} • ${w.department}` : (w.role || 'Familia Pollo Fiesta')}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA CENTRAL (70%): Gran Sala de Felicitación y Celebración */}
        {todayBirthdays.length > 0 && (
          <div className="bday-congratulations-stage">

            {/* Homenajeados centrales */}
            <div style={{ margin: '0.75rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.25rem', width: '100%' }}>
                {todayBirthdays.map((star, idx) => {
                  const shortName = formatShortName(star.name);
                  return (
                    <div key={idx} className="bday-congrats-card">
                      {star.image ? (
                        <img src={star.image} alt={shortName} style={{ width: 62, height: 62, borderRadius: '14px', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} loading="lazy" />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.45))' }}>
                          <Cake size={36} color="#fde047" />
                          <Crown size={36} color="#fbbf24" />
                        </div>
                      )}
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.6)', lineHeight: 1.15, fontFamily: "'Outfit', sans-serif" }}>
                          {shortName}
                        </div>
                        <div style={{ fontSize: '0.92rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.2rem' }}>
                          ★ ¡CUMPLE AÑOS HOY! ★
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Texto y Mensaje Dedicatorio Impactante */}
            <div style={{ position: 'relative', zIndex: 2, width: '100%', padding: '0 0.5rem' }}>
              <h2 className="bday-congrats-title">
                ¡FELIZ CUMPLEAÑOS!
              </h2>
              <p className="bday-congrats-text">
                De parte de toda la familia <strong>Pollo Fiesta S.A.</strong>,'Hoy queremos reconocer y agradecer tu compromiso, dedicación y valiosa contribución a nuestro equipo. Esperamos que disfrutes de un día lleno de alegría, bienestar y momentos especiales junto a tus seres queridos.

                Te deseamos mucho éxito, salud y prosperidad en este nuevo año de vida.' <Sparkles size={22} color="#fbbf24" style={{ display: 'inline', verticalAlign: 'middle' }} />
              </p>
            </div>

            {/* Pie con firma institucional */}
            <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', justifyContent: 'center', marginTop: '0.6rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', padding: '0.45rem 1.8rem', borderRadius: '30px', color: '#fff', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Flame size={20} color="#fbbf24" fill="#fbbf24" /> ¡Orgullosamente Familia Pollo Fiesta S.A.! <Flame size={20} color="#fbbf24" fill="#fbbf24" /></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BirthdaysModule;
