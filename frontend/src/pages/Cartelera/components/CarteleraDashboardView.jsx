import React from 'react';
import { motion } from 'framer-motion';
import LiveClock from '../../../components/LiveClock';
import {
  Tv, Palette, ExternalLink, Sparkles, Zap, Megaphone, Cake, Pin, Video
} from 'lucide-react';

export default function CarteleraDashboardView({
  data,
  birthdays,
  onOpenEditor
}) {
  const totalEvents = data?.events?.length || 0;
  const totalHR = data?.hrModule?.length || 0;
  const totalBirthdays = birthdays?.length || 0;
  const totalVideos = data?.videos?.length || 0;

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
          background: 'radial-gradient(circle, rgba(225, 29, 72, 0.22) 0%, transparent 70%)',
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
            <img src="/images/logo-pollo.png" alt="Pollo Fiesta" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.3rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>
              {data?.appTitle || 'POLLO FIESTA'}
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.8)', margin: '0.25rem 0 0 0' }}>
              {data?.appSubtitle || 'Control de cartelera digital'}
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
          onClick={() => window.open('/cartelera/tv', '_blank')}
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
              Proyecta la cartelera rotativa en pantalla completa
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
              <span>INICIAR PROYECCIÓN PANTALLA COMPLETA</span>
              <ExternalLink size={22} color="#071c33" />
            </div>
          </div>
        </motion.div>

        {/* OPCIÓN 2: MODO EDITOR CANVA STUDIO */}
        <motion.div
          whileHover={{ scale: 1.025, translateY: -6 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={() => onOpenEditor('topbar')}
          style={{
            background: 'linear-gradient(145deg, #be123c 0%, #881337 100%)',
            borderRadius: '28px',
            padding: '3rem 2.5rem',
            cursor: 'pointer',
            border: '2px solid rgba(254, 205, 211, 0.35)',
            boxShadow: '0 25px 50px -12px rgba(190, 18, 60, 0.5)',
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
                <Sparkles size={16} color="#ffffff" /> Editor GH
              </span>
            </div>

            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '1rem', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>
              MODO EDITOR
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, margin: 0 }}>
              Abre el editor con previsualización para modificar anuncios, eventos y colores.
            </p>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <div style={{
              background: '#ffffff',
              color: '#881337',
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Palette size={22} color="#881337" /> ABRIR EDICIÓN</span>
              <Zap size={22} color="#881337" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* BARRA SUPERIOR DE INDICADORES RÁPIDOS (RESUMEN EJECUTIVO) */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderRight: '1px solid #e2e8f0', paddingRight: '1rem' }}>
          <span style={{ background: '#e0f2fe', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={30} color="#0284c7" strokeWidth={2.3} />
          </span>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{totalEvents}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Comunicados / Eventos</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderRight: '1px solid #e2e8f0', paddingRight: '1rem' }}>
          <span style={{ background: '#fef3c7', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cake size={30} color="#d97706" strokeWidth={2.3} />
          </span>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{totalBirthdays}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Cumpleañeros del Mes</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderRight: '1px solid #e2e8f0', paddingRight: '1rem' }}>
          <span style={{ background: '#dcfce7', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pin size={30} color="#16a34a" strokeWidth={2.3} />
          </span>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{totalHR}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Avisos Gestión Humana</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ background: '#f3e8ff', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={30} color="#9333ea" strokeWidth={2.3} />
          </span>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{totalVideos}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Videos Corporativos</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
