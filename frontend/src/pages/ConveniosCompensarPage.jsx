import { useState, useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, HeartPulse, GraduationCap, Plane, Utensils, X, Info } from 'lucide-react';

// ============================================================================
// CONFIGURACIÓN DE CONVENIOS (AQUÍ PUEDES AGREGAR TU INFORMACIÓN Y FOTOS)
// ============================================================================
const CONVENIOS_DATA = [
  {
    id: 1,
    title: 'Gimnasios SmartFit',
    category: 'Deportes',
    discount: '20% dto',
    description: 'Accede a todas las sedes de SmartFit a nivel nacional sin cuota de inscripción.',
    color: '#0EA5E9',
    icon: <HeartPulse size={48} />,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    details: 'Válido para plan Black. Presentar carnet de Pollo Fiesta en recepción. Sin cláusula de permanencia.'
  },
  {
    id: 2,
    category: "Entretenimiento",
    discount: "Tarifas Especiales",
    description: "Entradas 2D y 3D a precio especial de afiliado. Compra tus boletas directamente en taquilla o web de Compensar.",
    icon: <Gift size={24} />,
    color: "#8B5CF6", // Morado
    image: "/images/cine-colombia.jpg",
    details: "Máximo 4 boletas por afiliado al mes. No aplica para preventas o funciones especiales."
  },
  {
    id: 3,
    title: "Agencia de Viajes Compensar",
    category: "Turismo",
    discount: "Hasta 20% dto",
    description: "Paquetes turísticos nacionales e internacionales exclusivos para afiliados.",
    icon: <Plane size={24} />,
    color: "#0EA5E9", // Azul
    image: "/images/viajes.jpg",
    details: "Sujeto a disponibilidad de cupos. Válido para el titular de la afiliación y su grupo familiar inscrito."
  },
  {
    id: 4,
    title: "Universidad EAN",
    category: "Educación",
    discount: "10% en matrículas",
    description: "Descuento en programas de pregrado y posgrado en modalidad presencial o virtual.",
    icon: <GraduationCap size={24} />,
    color: "#10B981", // Verde
    image: "/images/universidad.jpg",
    details: "Aplica para primer semestre y renovaciones manteniendo un promedio superior a 3.8."
  },
  {
    id: 5,
    title: "Restaurantes Aliados",
    category: "Gastronomía",
    discount: "Bonos de $20.000",
    description: "Adquiere bonos de alimentación con subsidio para restaurantes seleccionados.",
    icon: <Utensils size={24} />,
    color: "#F59E0B", // Naranja
    image: "/images/restaurantes.jpg",
    details: "Descarga tus bonos directamente en la app de Compensar y preséntalos antes de pagar."
  }
];
// ============================================================================


const ConveniosCompensarPage = memo(({ data, autoPlay, onComplete, compact = false, isLivePreview, selectedElementId, onElementClick }) => {
  const [selectedConvenio, setSelectedConvenio] = useState(null);
  const [filter, setFilter] = useState('Todos');
  const scrollRef = useRef(null);
  const [fakeMouse, setFakeMouse] = useState({ x: -100, y: -100, visible: false, clicking: false, ripple: false });

  const convenios = data && data.length > 0 ? data : CONVENIOS_DATA;

  // Obtener categorías únicas
  const categories = ['Todos', ...new Set(convenios.map(c => c.category))];

  // Filtrar convenios
  const filteredConvenios = filter === 'Todos'
    ? convenios
    : convenios.filter(c => c.category === filter);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Fake mouse auto-play
  useEffect(() => {
    if (!autoPlay || filteredConvenios.length === 0) return;

    let currentIndex = 0;
    let isActive = true;

    const playNext = async () => {
      if (!isActive) return;

      if (currentIndex >= filteredConvenios.length) {
        if (onCompleteRef.current) onCompleteRef.current();
        return;
      }
      const current = filteredConvenios[currentIndex];

      // Scroll into view if needed (finding the DOM element)
      const el = document.getElementById(`convenio-card-${current.id}`);
      if (el && scrollRef.current) {
        // Use scrollIntoView on the element itself, or adjust the parent container scroll
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Wait a bit for scroll
        await new Promise(r => setTimeout(r, 600));

        if (!isActive) return;

        // Move mouse to card
        const rect = el.getBoundingClientRect();
        setFakeMouse({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, visible: true, clicking: false });

        // Wait for mouse move
        await new Promise(r => setTimeout(r, 800));

        if (!isActive) return;

        // Click animation
        setFakeMouse(prev => ({ ...prev, clicking: true, ripple: true }));
        await new Promise(r => setTimeout(r, 150));
        setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));
      }

      // Select it to open modal
      setSelectedConvenio(current);

      // Move mouse away slightly so it doesn't obstruct reading, but not too far
      await new Promise(r => setTimeout(r, 300));
      if (!isActive) return;
      const modalRect = document.getElementById(`convenio-card-${current.id}`)?.getBoundingClientRect();
      const centerX = modalRect ? modalRect.left + modalRect.width / 2 : window.innerWidth / 2;
      const centerY = modalRect ? modalRect.top + modalRect.height / 2 : window.innerHeight / 2;
      // Pausa inicial para permitir leer la cabecera del convenio (+0.2 más ágil)
      await new Promise(r => setTimeout(r, 2200));
      if (!isActive) return;

      const modalEl = document.getElementById('convenio-modal-content');
      if (modalEl) {
        const maxScroll = modalEl.scrollHeight - modalEl.clientHeight;
        if (maxScroll > 10) {
          // Scroll suave +0.2 más rápido
          const duration = 8000 + (maxScroll * 11);
          const startTime = Date.now();
          await new Promise(resolve => {
            const animateScroll = () => {
              if (!isActive) return resolve();
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
              modalEl.scrollTop = maxScroll * easeProgress;
              if (progress < 1) requestAnimationFrame(animateScroll);
              else resolve();
            };
            requestAnimationFrame(animateScroll);
          });
          // Pausa al final antes de cerrar
          await new Promise(r => setTimeout(r, 2500));
        } else {
          await new Promise(r => setTimeout(r, 5200));
        }
      } else {
        await new Promise(r => setTimeout(r, 5200));
      }

      if (!isActive) return;

      // Now move mouse to close button
      const closeBtn = document.getElementById('convenio-close-btn');
      if (closeBtn) {
        const cRect = closeBtn.getBoundingClientRect();
        // Point tip exactly at the center of the button (since tip is at 4,4 in svg)
        setFakeMouse({ x: cRect.left + cRect.width / 2 - 4, y: cRect.top + cRect.height / 2 - 4, visible: true, clicking: false, ripple: false });
        await new Promise(r => setTimeout(r, 800));

        if (!isActive) return;

        // Click close
        setFakeMouse(prev => ({ ...prev, clicking: true, ripple: true }));
        await new Promise(r => setTimeout(r, 150));
        setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));
      }

      // Close modal
      setSelectedConvenio(null);

      // Wait a bit before next
      await new Promise(r => setTimeout(r, 1000));

      currentIndex++;
      playNext();
    };

    // Start after a short delay
    const startTimer = setTimeout(() => {
      playNext();
    }, 2000);

    return () => {
      isActive = false;
      clearTimeout(startTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]); // No incluir dependencias que cambian seguido para evitar que se reinicie

  return (
    <div ref={scrollRef} style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', paddingBottom: compact ? '0.5rem' : '2rem' }}>

      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: (isLivePreview && selectedElementId) ? 0.3 : 1,
          y: 0,
          filter: (isLivePreview && selectedElementId) ? 'blur(8px) grayscale(60%)' : 'blur(0px)'
        }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: compact ? '0.75rem' : '2rem', textAlign: 'center' }}
      >
        <h1 style={{ fontSize: compact ? '1.4rem' : '2.5rem', fontWeight: 'bold', color: '#1E293B', marginBottom: '0.25rem' }}>
          Beneficios y Convenios <span style={{ color: '#F97316' }}>Compensar</span>
        </h1>
        {!compact && (
          <p style={{ fontSize: '1.1rem', color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>
            Descubre todas las alianzas y descuentos exclusivos que tienes por ser afiliado.
            Aprovecha al máximo tus beneficios en salud, educación, turismo y más.
          </p>
        )}
      </motion.div>


      {/* CONVENIOS GRID */}
      <motion.div
        layout
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? 'repeat(auto-fill, minmax(220px, 1fr))' : 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: compact ? '0.85rem' : '2rem'
        }}
      >
        <AnimatePresence>
          {filteredConvenios.map((convenio, index) => {
            const isSelected = String(selectedElementId) === String(convenio.id || index);
            const isCardCompact = compact && !isSelected;
            return (
            <motion.div 
              layout
              key={convenio.id || index} 
              className={`convenio-card-wrapper canva-interactive-element ${isSelected ? 'canva-interactive-selected' : ''}`}
              animate={{ 
                scale: isSelected ? 1.15 : 1, 
                zIndex: isSelected ? 9999 : 1 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              onClick={(e) => {
                if (isLivePreview && onElementClick) {
                  e.stopPropagation();
                  onElementClick('convenios', convenio.id || index);
                }
              }}
              style={{ display: 'flex', height: '100%', cursor: isLivePreview && onElementClick ? 'pointer' : 'default' }}
            >
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                id={`convenio-card-${convenio.id}`}
                onClick={() => {
                  if (!isLivePreview) setSelectedConvenio(convenio);
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: isCardCompact ? '14px' : '24px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  height: '100%',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (isLivePreview) return;
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  if (isLivePreview) return;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{
                  backgroundColor: convenio.color + '10',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: convenio.image ? (isCardCompact ? '1rem' : '2rem') : '0',
                  minHeight: isCardCompact ? '120px' : (convenio.image ? '220px' : '180px')
                }}>
                  {convenio.image ? (
                    <img
                      src={convenio.image}
                      alt={convenio.title}
                      style={{ width: '100%', height: '100%', maxHeight: isCardCompact ? '100px' : '180px', display: 'block', objectFit: 'contain', zIndex: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{
                      color: convenio.color,
                      background: '#FFFFFF',
                      padding: isCardCompact ? '0.75rem' : '1.5rem',
                      borderRadius: '50%',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                      margin: '2rem 0'
                    }}>
                      {convenio.icon}
                    </div>
                  )}

                  {/* Badge Descuento */}
                  <div style={{
                    position: 'absolute',
                    top: isCardCompact ? '0.5rem' : '1rem',
                    right: isCardCompact ? '0.5rem' : '1rem',
                    background: '#FFFFFF',
                    color: convenio.color,
                    padding: isCardCompact ? '0.2rem 0.5rem' : '0.4rem 0.8rem',
                    borderRadius: '999px',
                    fontWeight: 'bold',
                    fontSize: isCardCompact ? '0.7rem' : '0.85rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    zIndex: 2
                  }}>
                    {convenio.discount}
                  </div>
                </div>

                {/* CARD CONTENT */}
                <div style={{ padding: isCardCompact ? '0.65rem 0.85rem' : '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: isCardCompact ? '0.68rem' : '1rem', fontWeight: 'bold', color: convenio.color, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {convenio.category}
                  </span>
                  <h3 style={{ fontSize: isCardCompact ? '0.9rem' : '1.5rem', fontWeight: 'bold', color: '#1E293B', margin: isCardCompact ? '0.2rem 0' : '0.5rem 0' }}>
                    {convenio.title}
                  </h3>
                  {convenio.description && !isCardCompact && (
                    <p style={{ color: '#64748B', fontSize: '1.1rem', lineHeight: '1.5', margin: '0 0 1rem 0', whiteSpace: 'pre-wrap' }}>
                      {convenio.description}
                    </p>
                  )}
                  {convenio.details && !isCardCompact && (
                    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #E2E8F0' }}>
                      <p style={{ margin: 0, fontSize: '1rem', color: '#475569', whiteSpace: 'pre-wrap' }}>{convenio.details}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', color: '#3B82F6', fontWeight: '600', fontSize: isCardCompact ? '0.72rem' : '1rem', marginTop: 'auto' }}>
                    <Info size={isCardCompact ? 12 : 18} style={{ marginRight: '0.4rem' }} />
                    Clic para ver detalles
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )})}
        </AnimatePresence>
      </motion.div>

      {/* MODAL DETALLES */}
      <AnimatePresence>
        {selectedConvenio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '2.5rem 1rem',
              overflowY: 'auto'
            }}
            onClick={() => setSelectedConvenio(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '1000px',
                margin: 'auto',
                maxHeight: '90vh',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              }}
            >
              <button
                id="convenio-close-btn"
                onClick={() => setSelectedConvenio(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 20,
                  color: '#1E293B'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedConvenio.image && (
                  <div id="convenio-modal-content" style={{ position: 'relative', maxHeight: '45vh', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0', zIndex: 0 }}>
                    <img
                      src={selectedConvenio.image}
                      alt={selectedConvenio.title}
                      style={{ maxWidth: '100%', height: 'auto', display: 'block', objectFit: 'contain', borderRadius: '12px 12px 0 0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                )}

                <div style={{ padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: selectedConvenio.color, textTransform: 'uppercase' }}>
                        {selectedConvenio.category}
                      </span>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1E293B', margin: '0.2rem 0' }}>
                        {selectedConvenio.title}
                      </h2>
                    </div>
                    <div style={{
                      background: selectedConvenio.color + '15',
                      color: selectedConvenio.color,
                      padding: '0.5rem 1rem',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}>
                      {selectedConvenio.discount}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                    <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                      {selectedConvenio.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ color: selectedConvenio.color, marginTop: '0.2rem' }}>
                      <Info size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', color: '#1E293B', fontSize: '1rem' }}>Condiciones y Detalles</h4>
                      <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
                        {selectedConvenio.details}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAKE MOUSE POINTER (En un portal para garantizar precisión absoluta) */}
      {typeof document !== 'undefined' && createPortal(
        <motion.div
          initial={false}
          animate={{
            x: fakeMouse.x,
            y: fakeMouse.y,
            opacity: fakeMouse.visible ? 1 : 0
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 120,
            mass: 0.5
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 999999,
          }}
        >
          <motion.div
            animate={{ scale: fakeMouse.clicking ? 0.85 : 1 }}
            transition={{ duration: 0.1 }}
            style={{ transformOrigin: '4px 4px', position: 'relative' }}
          >
            {fakeMouse.ripple && (
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '-4px', // tip is at 4,4, box is 16x16, center is 8x8. To put center at 4,4 we need top:-4, left:-4
                  left: '-4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(0, 0, 0, 0.2)'
                }}
              />
            )}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
              <path d="M4 4l7.07 16.97 2.51-7.39 7.39-2.51L4 4z" />
            </svg>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </div>
  );
});

export default ConveniosCompensarPage;
