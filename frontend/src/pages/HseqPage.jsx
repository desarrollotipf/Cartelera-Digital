import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, Tv, Palette, Zap, ExternalLink, Sparkles } from 'lucide-react';
import { getCartelera, updateCartelera } from '../services/api';
import CanvaEditorStudio from '../components/CanvaEditorStudio';
import CarteleraPage from './CarteleraPage';
import LiveClock from '../components/LiveClock';
import { getDefaultForm } from '../components/editor/editorConfig';

export default function HseqPage() {
  const [data, setData] = useState(() => {
    const draft = localStorage.getItem('pollo_fiesta_canva_editor_draft');
    if (draft) {
      try { return JSON.parse(draft); } catch (e) {}
    }
    return getDefaultForm();
  });
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    getCartelera()
      .then(res => { 
        const raw = res?.data || res;
        if (raw && (raw.hseq || raw.topBar)) setData(raw);
      })
      .catch((err) => {
        console.warn('Cargando HSEQ con datos locales:', err);
      });
  }, []);

  const handleSave = async (draftData) => {
    try {
      const res = await updateCartelera(draftData);
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
        <span>Cargando cartelera digital...</span>
      </div>
    );
  }

  if (isEditorOpen) {
    return (
      <CanvaEditorStudio
        data={data}
        initialTab={'hseq'}
        singleTabMode={true}
        initialStep={3}
        onSave={handleSave}
        onClose={() => setIsEditorOpen(false)}
        renderCanvas={(draftData, step, selectedId, handleSelect) => (
          <CarteleraPage
            isTVMode={true}
            isLivePreview={true}
            previewData={draftData}
            overrideStep={3}
            onElementClick={handleSelect}
            selectedElementId={selectedId}
            hideConvenios={true}
          />
        )}
      />
    );
  }

  const totalHSEQ = data?.hseq?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{
        width: '100%',
        maxWidth: '1350px',
        margin: '0 auto',
        padding: '0.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}
    >
      {/* BANNER INSTITUCIONAL EJECUTIVO */}
      <div style={{
        background: 'linear-gradient(135deg, #0b4274 0%, #07223e 100%)',
        borderRadius: '24px',
        padding: '2rem 2.5rem',
        boxShadow: '0 20px 40px -15px rgba(11, 66, 116, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          right: '-10%',
          top: '-50%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 1 }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(10px)',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Shield size={48} color="#10b981" strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, background: '#10b981', color: '#fff', padding: '0.25rem 0.85rem', borderRadius: '20px', letterSpacing: '0.5px', textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.5)' }}>
                ★ GESTIÓN HSEQ
              </span>
              <span style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="pulse-dot" style={{ background: '#10b981' }} /> Sincronizado en Tiempo Real
              </span>
            </div>
            <h1 style={{ fontSize: '2.3rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>
              HSEQ
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.8)', margin: '0.25rem 0 0 0' }}>
              SST, ASEGURAMIENTO DE CALIDAD Y MEDIO AMBIENTE
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', zIndex: 1 }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '0.85rem 1.5rem',
            textAlign: 'right',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'monospace' }}>
              <LiveClock />
            </div>
          </div>
        </div>
      </div>

      {/* LAS 2 OPCIONES MONUMENTALES EN GRANDE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '2.5rem',
        alignItems: 'stretch'
      }}>
        {/* OPCIÓN 1: MODO TV KIOSK */}
        <motion.div
          whileHover={{ scale: 1.025, translateY: -6 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={() => window.open('/hseq/tv', '_blank')}
          style={{
            background: 'linear-gradient(145deg, #0b4274 0%, #061c33 100%)',
            borderRadius: '28px',
            padding: '3rem 2.5rem',
            cursor: 'pointer',
            border: '2px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 25px 50px -12px rgba(11, 66, 116, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '380px'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '24px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '2px solid #38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 28px rgba(56, 189, 248, 0.3)'
              }}>
                <Tv size={52} color="#38bdf8" strokeWidth={2.2} />
              </div>
            </div>

            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '1rem', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>
              MODO TV
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, margin: 0 }}>
              Proyecta la cartelera de <strong>Normativas HSEQ</strong> en pantalla completa para televisores de planta.
            </p>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <div style={{
              background: '#38bdf8',
              color: '#071c33',
              fontSize: '1.25rem',
              fontWeight: 900,
              padding: '1.1rem 2rem',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.85rem',
              boxShadow: '0 10px 25px rgba(56, 189, 248, 0.4)',
              transition: 'all 0.2s ease'
            }}>
              <span>INICIAR PROYECCIÓN HSEQ</span>
              <ExternalLink size={22} color="#071c33" />
            </div>
          </div>
        </motion.div>

        {/* OPCIÓN 2: MODO EDITOR CANVA STUDIO */}
        <motion.div
          whileHover={{ scale: 1.025, translateY: -6 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={() => setIsEditorOpen(true)}
          style={{
            background: 'linear-gradient(145deg, #059669 0%, #064e3b 100%)',
            borderRadius: '28px',
            padding: '3rem 2.5rem',
            cursor: 'pointer',
            border: '2px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 25px 50px -12px rgba(5, 150, 105, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '380px'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)'
              }}>
                <Palette size={52} color="#ffffff" strokeWidth={2.2} />
              </div>
              <span style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 900,
                padding: '0.5rem 1.2rem',
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                letterSpacing: '0.5px'
              }}>
                <Sparkles size={16} color="#ffffff" /> ESTILO CANVA STUDIO
              </span>
            </div>

            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '1rem', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>
              MODO EDITOR HSEQ
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, margin: 0 }}>
              Abre el estudio de diseño de <strong>HSEQ</strong>. Modifica los protocolos y normativas en tiempo real.
            </p>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <div style={{
              background: '#ffffff',
              color: '#064e3b',
              fontSize: '1.25rem',
              fontWeight: 900,
              padding: '1.1rem 2rem',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.85rem',
              boxShadow: '0 10px 25px rgba(255, 255, 255, 0.35)',
              transition: 'all 0.2s ease'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Palette size={22} color="#064e3b" /> ABRIR EDICIÓN</span>
              <Zap size={22} color="#064e3b" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* BARRA SUPERIOR DE INDICADORES RÁPIDOS */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '1.5rem 2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingRight: '1rem' }}>
          <span style={{ background: '#dcfce7', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={30} color="#16a34a" strokeWidth={2.3} />
          </span>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{totalHSEQ}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Normativas / Protocolos HSEQ</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
