import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getCartelera, updateCartelera, getCumpleanos, getWeather, getNews } from '../services/api';
import CanvaEditorStudio from '../components/CanvaEditorStudio';
import FlowingMenu from '../components/FlowingMenu';
import LiveClock from '../components/LiveClock';
import { formatShortName } from '../utils/nameFormatter';
import ConveniosCompensarPage from './ConveniosCompensarPage';
import HseqModule from './Cartelera/modules/HseqModule';
import EventsModule from './Cartelera/modules/EventsModule';
import HrModule from './Cartelera/modules/HrModule';
import BirthdaysModule from './Cartelera/modules/BirthdaysModule';
import CommandCenterModule from './Cartelera/modules/CommandCenterModule';
import VideosModule from './Cartelera/modules/VideosModule';
import ConveniosModule from './Cartelera/modules/ConveniosModule';
import {
  Megaphone, Cake, Pin, BarChart3, Video, Tv, Palette, Zap, ExternalLink,
  Sun, CloudSun, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning,
  Trophy, Star, Award, Flame, Calendar, MapPin, TrendingUp, Sparkles, Building2, Bell, Newspaper, Wind, PartyPopper, Crown, Shield, HeartPulse, Leaf, Gift, X
} from 'lucide-react';



function CanvaElementWrapper({ isLivePreview, moduleId, elementId, onElementClick, selectedElementId, label, children }) {
  if (!isLivePreview || !onElementClick) return <div style={{ display: 'flex', flex: 1, width: '100%', minWidth: 0, position: 'relative', height: '100%' }}>{children}</div>;
  const isSelected = String(selectedElementId) === String(elementId);
  return (
    <motion.div
      className={`canva-interactive-element ${isSelected ? 'canva-interactive-selected' : ''}`}
      animate={{ scale: isSelected ? 1.15 : 1, zIndex: isSelected ? 9999 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={(e) => {
        e.stopPropagation();
        onElementClick(moduleId, elementId);
      }}
      title={`Clic para editar: ${label || elementId}`}
      style={{ display: 'flex', flex: 1, width: '100%', minWidth: 0, position: 'relative', transformOrigin: 'center center' }}
    >
      <span className="canva-interactive-badge">✎ {label || 'Clic para editar'}</span>
      {children}
    </motion.div>
  );
}



import { isThisMonth, isExactToday, isThisWeek } from '../utils/dateHelpers';

/* formatShortName importado de ../utils/nameFormatter */

function getMenuTabOrigin(idx, total = 5) {
  if (idx === null || idx === undefined) return '50% 50%';
  const percentage = ((idx * 2 + 1) / (total * 2)) * 100;
  return `50% ${percentage}%`;
}

import { useCarteleraData } from '../hooks/useCarteleraData';
import { useCarteleraOrchestrator } from '../hooks/useCarteleraOrchestrator';
//CarteleraPage
export default function CarteleraPage({ isTVMode = false, isLivePreview = false, previewData = null, overrideStep = null, onElementClick = null, selectedElementId = null, hideConvenios = false }) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState('topbar');
  const [newsIndex, setNewsIndex] = useState(0);

  const {
    data,
    weather,
    news,
    birthdays,
    todayBirthdays,
    weeklyBirthdays,
    spotlight,
    hrItems,
    handleSaveData,
    handleResetData
  } = useCarteleraData(previewData, isEditorOpen);

  const {
    currentStep,
    transitioningToStep,
    flowingActiveIdx,
    menuHighlightIdx,
    goToStep,
    globalEventIndex,
    videoIndex,
    setVideoIndex,
    isDeckTransitioning,
    setIsDeckTransitioning,
    videoOrientations,
    setVideoOrientations,
    videosPlayedThisCycle
  } = useCarteleraOrchestrator(
    data,
    isEditorOpen,
    isTVMode,
    isLivePreview,
    overrideStep,
    selectedElementId,
    birthdays,
    weeklyBirthdays,
    setNewsIndex
  );

  const carteleraTabs = useMemo(() => [
    { text: 'Eventos Pollo Fiesta', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80', link: '#eventos' },
    { text: 'Avisos Gestión Humana', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80', link: '#rrhh' },
    { text: 'Cumpleaños!!', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80', link: '#cumpleanos' },
    { text: 'Normas HSEQ', image: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&w=600&q=80', link: '#hseq' },
    { text: 'Clima & Noticias Fenavi', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80', link: '#noticias' },
    { text: 'Sobre Nosotros', image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=600&q=80', link: '#videos' },
    { text: 'Convenios Compensar', image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=600&q=80', link: '#convenios' }
  ], []);

  const [fakeMouse, setFakeMouse] = useState({ x: -100, y: -100, visible: false, clicking: false, ripple: false });
  const [selectedHseq, setSelectedHseq] = useState(null);
  const [selectedHr, setSelectedHr] = useState(null);

  const hseqItemsRef = useRef(data?.hseq || []);
  useEffect(() => {
    hseqItemsRef.current = data?.hseq || [];
  }, [data?.hseq]);

  // Fake mouse auto-play for HSEQ
  useEffect(() => {
    if (currentStep !== 3 || !isTVMode || isLivePreview) return;
    const hseqItems = hseqItemsRef.current;
    if (hseqItems.length === 0) {
      if (overrideStep !== 3) goToStep(4);
      return;
    }

    let isActive = true;
    let currentIndex = 0;

    const playNext = async () => {
      if (!isActive) return;

      const currentItems = hseqItemsRef.current;

      if (currentIndex >= currentItems.length) {
        setFakeMouse(prev => ({ ...prev, visible: false }));
        if (overrideStep !== 3) goToStep(4);
        return;
      }

      const current = currentItems[currentIndex];
      const elId = `hseq-card-${current.id || currentIndex}`;
      const el = document.getElementById(elId);

      if (el) {
        const scrollParent = el.parentElement;
        if (scrollParent) {
          const elRect = el.getBoundingClientRect();
          const parentRect = scrollParent.getBoundingClientRect();

          const isTopVisible = elRect.top >= parentRect.top && (elRect.top + 120) <= parentRect.bottom;

          if (!isTopVisible) {
            const relativeTop = elRect.top - parentRect.top;
            const targetOffset = relativeTop - 20;
            const startTop = scrollParent.scrollTop;
            const targetTop = startTop + targetOffset;
            const distance = targetTop - startTop;

            if (Math.abs(distance) > 5) {
              const duration = 2500;
              const startTime = Date.now();
              await new Promise(resolve => {
                const animateScroll = () => {
                  if (!isActive) return resolve();
                  const elapsed = Date.now() - startTime;
                  const progress = Math.min(elapsed / duration, 1);
                  const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                  scrollParent.scrollTop = startTop + (distance * easeProgress);
                  if (progress < 1) requestAnimationFrame(animateScroll);
                  else resolve();
                };
                requestAnimationFrame(animateScroll);
              });
            }
          }
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          await new Promise(r => setTimeout(r, 1000));
        }

        await new Promise(r => setTimeout(r, 1000));
        if (!isActive) return;

        const rect = el.getBoundingClientRect();
        setFakeMouse({ x: rect.left + rect.width / 2, y: rect.top + 80, visible: true, clicking: false, ripple: false });
        await new Promise(r => setTimeout(r, 1200));
        if (!isActive) return;

        setFakeMouse(prev => ({ ...prev, clicking: true, ripple: true }));
        await new Promise(r => setTimeout(r, 150));
        setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));

        setSelectedHseq(current);

        await new Promise(r => setTimeout(r, 600));
        if (!isActive) return;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        setFakeMouse(prev => ({ ...prev, x: centerX + 250, y: centerY + 100 }));

        const modalEl = document.getElementById('hseq-modal-content');
        if (modalEl) {
          const maxScroll = modalEl.scrollHeight - modalEl.clientHeight;
          if (maxScroll > 10) {
            await new Promise(r => setTimeout(r, 2000));
            if (!isActive) return;

            const duration = 4000 + (maxScroll * 2);
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
            await new Promise(r => setTimeout(r, 2500));
          } else {
            await new Promise(r => setTimeout(r, 6000));
          }
        } else {
          await new Promise(r => setTimeout(r, 6000));
        }

        if (!isActive) return;

        const closeBtn = document.getElementById('hseq-close-btn');
        if (closeBtn) {
          const cRect = closeBtn.getBoundingClientRect();
          setFakeMouse({ x: cRect.left + cRect.width / 2 - 4, y: cRect.top + cRect.height / 2 - 4, visible: true, clicking: false, ripple: false });
          await new Promise(r => setTimeout(r, 800));
          if (!isActive) return;

          setFakeMouse(prev => ({ ...prev, clicking: true, ripple: true }));
          await new Promise(r => setTimeout(r, 150));
          setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));
        }

        setSelectedHseq(null);
      }

      await new Promise(r => setTimeout(r, 1000));
      currentIndex++;
      playNext();
    };

    const startTimer = setTimeout(() => { playNext(); }, 2000);
    return () => { isActive = false; clearTimeout(startTimer); };
  }, [currentStep, isTVMode, isLivePreview, overrideStep]);

  const hrItemsRef = useRef(data?.hrModule || []);
  useEffect(() => {
    hrItemsRef.current = data?.hrModule || [];
  }, [data?.hrModule]);

  // Fake mouse auto-play for HR
  useEffect(() => {
    if (currentStep !== 1 || !isTVMode || isLivePreview) return;
    const hrItems = hrItemsRef.current;
    if (hrItems.length === 0) {
      if (overrideStep !== 1) goToStep(2);
      return;
    }

    let isActive = true;
    let currentIndex = 0;

    const playNext = async () => {
      if (!isActive) return;

      const currentItems = hrItemsRef.current;

      if (currentIndex >= currentItems.length) {
        setFakeMouse(prev => ({ ...prev, visible: false }));
        if (overrideStep !== 1) goToStep(2);
        return;
      }

      const current = currentItems[currentIndex];
      const elId = `hr-card-${current.id || currentIndex}`;
      const el = document.getElementById(elId);

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 800));
        if (!isActive) return;

        const rect = el.getBoundingClientRect();
        setFakeMouse({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, visible: true, clicking: false, ripple: false });
        await new Promise(r => setTimeout(r, 1000));
        if (!isActive) return;

        setFakeMouse(prev => ({ ...prev, clicking: true, ripple: true }));
        await new Promise(r => setTimeout(r, 150));
        setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));

        setSelectedHr(current);
        await new Promise(r => setTimeout(r, 800));
        if (!isActive) return;

        const modal = document.getElementById('hr-modal-content');
        if (modal) {
          const scrollDistance = Math.max(0, modal.scrollHeight - modal.clientHeight);
          if (scrollDistance > 0) {
            const scrollDuration = Math.min(8000, scrollDistance * 10);
            await new Promise(r => setTimeout(r, 1500));
            if (!isActive) return;
            const startTime = Date.now();
            await new Promise(resolve => {
              const animateModalScroll = () => {
                if (!isActive) return resolve();
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / scrollDuration, 1);
                modal.scrollTop = scrollDistance * progress;
                if (progress < 1) requestAnimationFrame(animateModalScroll);
                else resolve();
              };
              requestAnimationFrame(animateModalScroll);
            });
            await new Promise(r => setTimeout(r, 1500));
          } else {
            const readTime = Math.max(4000, Math.min(8000, (current.desc?.length || 0) * 40));
            await new Promise(r => setTimeout(r, readTime));
          }
        }

        if (!isActive) return;
        const closeBtn = document.getElementById('hr-close-btn');
        if (closeBtn) {
          const btnRect = closeBtn.getBoundingClientRect();
          setFakeMouse({ x: btnRect.left + btnRect.width / 2, y: btnRect.top + btnRect.height / 2, visible: true, clicking: false, ripple: false });
          await new Promise(r => setTimeout(r, 600));
          if (!isActive) return;
          setFakeMouse(prev => ({ ...prev, clicking: true, ripple: true }));
          await new Promise(r => setTimeout(r, 150));
          setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));
        }

        setSelectedHr(null);
      }

      if (!isActive) return;

      await new Promise(r => setTimeout(r, 500));
      currentIndex++;
      playNext();
    };

    const startTimer = setTimeout(() => { playNext(); }, 2000);
    return () => { isActive = false; clearTimeout(startTimer); };
  }, [currentStep, isTVMode, isLivePreview, overrideStep]);

  const openEditor = (tab) => {
    if (isTVMode || isLivePreview) return;
    setEditorTab(tab);
    setIsEditorOpen(true);
  };

  const hrGridRef = useRef(null);
  const bdayGridRef = useRef(null);
  const commandRef = useRef(null);

  const targetOpacity = data?.topBar?.moduleOpacity !== undefined ? data.topBar.moduleOpacity : 0.88;
  const springOpacity = useSpring({
    from: { opacity: 0.88 },
    to: { opacity: targetOpacity },
    config: { tension: 180, friction: 24 }
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--mod-opacity', targetOpacity);
  }, [targetOpacity]);

  useGSAP(() => {
    if (currentStep === 1 && hrGridRef.current) {
      gsap.fromTo(
        hrGridRef.current.querySelectorAll('.hr-stage-card'),
        { y: 25 },
        { y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 1.55, clearProps: 'transform,y,opacity', overwrite: true }
      );
    }
    if (currentStep === 2) {
      if (bdayGridRef.current) {
        gsap.fromTo(
          bdayGridRef.current.querySelectorAll('.bday-month-card'),
          { y: 20 },
          { y: 0, duration: 0.45, stagger: 0.04, ease: 'back.out(1.2)', delay: 1.55, clearProps: 'transform,y,opacity', overwrite: true }
        );
      }
      const hero = document.querySelector('.bday-today-hero');
      if (hero) {
        gsap.fromTo(hero, { scale: 0.96 }, { scale: 1, duration: 0.45, ease: 'power2.out', delay: 1.55, clearProps: 'transform,scale,opacity', overwrite: true });
      }
    }
    if (currentStep === 3 && commandRef.current) {
      gsap.fromTo(
        commandRef.current.querySelectorAll('.kpi-stage-card'),
        { y: -15 },
        { y: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out', delay: 1.55, clearProps: 'transform,y,opacity', overwrite: true }
      );
    }
  }, [currentStep, data]);

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
        <span>Cargando cartelera digital...</span>
      </div>
    );
  }

  const marquesina = data.topBar?.marquesina || 'POLLO FIESTA S.A. | Cartelera Digital';
  const eventsCount = data.events?.length || 0;
  const videosCount = data.videos?.length || 0;

  const activeEventIndex = eventsCount > 0 ? (globalEventIndex % eventsCount) : 0;
  const currentVideo = ((currentStep === 4 || transitioningToStep === 4) && videosCount > 0) ? data.videos[videoIndex % videosCount] : null;

  const t = data.titles || {};
  const appTitle = t.appTitle || 'POLLO FIESTA S.A.';
  const appSubtitle = t.appSubtitle || 'Cartelera Digital';
  const bdayTitle = t.bdayTitle || 'Cumpleaños!!';
  const bdaySubtitle = t.bdaySubtitle || 'Mes Actual';
  const bdayEmoji = t.bdayEmoji || '🎂';
  const eventsTitle = t.eventsTitle || 'Comunicados y Eventos Corporativos';
  const eventsEmoji = t.eventsEmoji || '📢';
  const hrTitle = t.hrTitle || 'Avisos Gestión Humana';
  const hrEmoji = t.hrEmoji || '📌';

  // --- VISTA PRINCIPAL DEL DASHBOARD (2 OPCIONES EN GRANDE) ---
  if (!isTVMode && !isLivePreview) {
    if (isEditorOpen) {
      return (
        <CanvaEditorStudio
          data={data}
          initialTab={editorTab || 'topbar'}
          initialStep={currentStep}
          onSave={handleSaveData}
          onClose={() => setIsEditorOpen(false)}
          onReset={handleResetData}
          renderCanvas={(draftData, step, selectedId, handleSelect) => (
            <CarteleraPage
              isTVMode={true}
              isLivePreview={true}
              previewData={draftData}
              overrideStep={step}
              onElementClick={handleSelect}
              selectedElementId={selectedId}
            />
          )}
        />
      );
    }

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
            onClick={() => {
              setEditorTab('topbar');
              setIsEditorOpen(true);
            }}
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
                Abre el editor con previsualización. Modifica haciendo <strong>clic en los elementos de la vista previa o en la barra lateral para editar</strong>
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

  return (
    <animated.div className={`cartelera-wrapper${isTVMode ? ' is-tv-mode' : ''}`} style={{ '--mod-opacity': springOpacity.opacity }}>

      {/* TOPBAR */}
      <header className="cartelera-topbar" onClick={() => openEditor('topbar')} style={{ cursor: isTVMode ? 'default' : 'pointer' }}>
        <CanvaElementWrapper isLivePreview={isLivePreview} moduleId="topbar" elementId="titles" label="Editar Títulos" onElementClick={onElementClick} selectedElementId={selectedElementId}>
          <div className="brand-badge">
            <img src="/images/logo-pollo.png" alt="Logo" className="brand-icon" style={{ width: '50px', height: '50px', objectFit: 'contain', background: 'transparent' }} loading="lazy" />
            <div>
              <span className="brand-title">{appTitle}</span>
              <span className="brand-subtitle">{appSubtitle}</span>
            </div>
          </div>
        </CanvaElementWrapper>

        <CanvaElementWrapper isLivePreview={isLivePreview} moduleId="topbar" elementId="marquesina" label="Editar Marquesina" onElementClick={onElementClick} selectedElementId={selectedElementId}>
          <div className="ticker-wrap" style={{ flex: 1 }}>
            <span className="ticker-badge-label">COMUNICADO</span>
            <div className="ticker-container">
              <div className="ticker-text">{marquesina}</div>
            </div>
          </div>
        </CanvaElementWrapper>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LiveClock />

          <div className="topbar-actions">
            {!isLivePreview && (!isTVMode ? (
              <>
                <button className="action-btn action-btn-edit" onClick={() => setIsEditorOpen(true)}>
                  Modo Edición ⚙️
                </button>
                <a href="/cartelera/tv" target="_blank" rel="noopener noreferrer" className="action-btn action-btn-tv">
                  Modo TV
                </a>
              </>
            ) : (
              <button className="action-btn action-btn-exit" onClick={() => window.close()}>
                Salir
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* BODY - DYNAMIC STAGE SHOWCASE */}
      {(() => {
        const renderModuleContent = (targetStep) => (
          <>
            {/* PASO 0: EVENTOS CORPORATIVOS */}
            {targetStep === 0 && (
              <EventsModule
                data={data}
                isLivePreview={isLivePreview}
                isTVMode={isTVMode}
                openEditor={openEditor}
                onElementClick={onElementClick}
                selectedElementId={selectedElementId}
                eventsTitle={eventsTitle}
                eventsCount={eventsCount}
                activeEventIndex={activeEventIndex}
              />
            )}

            {/* PASO 1: MÓDULO RRHH */}
            {targetStep === 1 && (
              <HrModule
                data={data}
                isLivePreview={isLivePreview}
                isTVMode={isTVMode}
                openEditor={openEditor}
                onElementClick={onElementClick}
                selectedElementId={selectedElementId}
              />
            )}
            {/* END HR MODULE */}

            {/* PASO 2: CUMPLEAÑOS */}
            {targetStep === 2 && (
              <BirthdaysModule
                bdayTitle={data?.bdayTitle}
                birthdays={birthdays}
                todayBirthdays={todayBirthdays}
                isLivePreview={isLivePreview}
                isTVMode={isTVMode}
                openEditor={openEditor}
                onElementClick={onElementClick}
                selectedElementId={selectedElementId}
              />
            )}

            {/* PASO 3: MÓDULO HSEQ */}
            {targetStep === 3 && (
              <HseqModule
                data={data}
                isLivePreview={isLivePreview}
                isTVMode={isTVMode}
                openEditor={openEditor}
                onElementClick={onElementClick}
                selectedElementId={selectedElementId}
              />
            )}

            {/* PASO 4: COMMAND CENTER (CLIMA & NOTICIAS) */}
            {targetStep === 4 && (
              <CommandCenterModule
                weather={weather}
                news={news}
              />
            )}

            {/* PASO 5: SALA DE CINE */}
            {targetStep === 5 && (
              <VideosModule
                data={data}
                videoIndex={videoIndex}
                setVideoIndex={setVideoIndex}
                isDeckTransitioning={isDeckTransitioning}
                setIsDeckTransitioning={setIsDeckTransitioning}
                videoOrientations={videoOrientations}
                setVideoOrientations={setVideoOrientations}
                videosPlayedThisCycle={videosPlayedThisCycle}
                goToStep={goToStep}
                isEditorOpen={isEditorOpen}
                isTVMode={isTVMode}
                openEditor={openEditor}
              />
            )}

            {/* PASO 6: CONVENIOS COMPENSAR */}
            {targetStep === 6 && (
              <ConveniosModule
                data={data?.convenios || []}
                autoPlay={!isLivePreview && (isTVMode || !isEditorOpen)}
                onComplete={() => goToStep(0)}
                compact={isLivePreview}
                isLivePreview={isLivePreview}
                selectedElementId={selectedElementId}
                onElementClick={onElementClick}
              />
            )}
          </>
        );

        return (
          <div className="cartelera-body-grid">
            <main className="stage-showcase" style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* FONDO ESCÉNICO Y MENÚ DE TRANSICIÓN (SIN PAUSAS NI CORTES) */}
              <AnimatePresence>
                {transitioningToStep !== null && !isEditorOpen && (
                  <motion.div
                    key="background-flowing-menu-stage"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 950,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: 'transparent',
                      overflow: 'hidden',
                      willChange: 'opacity',
                      backfaceVisibility: 'hidden',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <FlowingMenu
                      items={carteleraTabs}
                      speed={12}
                      bgColor="transparent"
                      textColor="#0F172A"
                      marqueeBgColor="#0b4274"
                      marqueeTextColor="#FFFFFF"
                      borderColor="rgba(15, 23, 42, 0.15)"
                      activeItemIndex={flowingActiveIdx}
                      highlightItemIndex={menuHighlightIdx}
                      onItemClick={(idx) => {
                        setCurrentStep(idx);
                        setTransitioningToStep(null);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ÚNICA INSTANCIA CONTINUA DEL MÓDULO ACTIVO (CERO DUPLICACIÓN, CERO CORTES, ACELERADA A 60FPS EN GPU) */}
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={`module-stage-instance-${currentStep}`}
                  initial={transitioningToStep !== null ? { scale: 0.92, opacity: 0 } : { opacity: 1, scale: 1 }}
                  animate={{ scale: transitioningToStep !== null ? 0.95 : 1, opacity: transitioningToStep !== null ? 0 : 1 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: 'easeOut' } }}
                  transition={
                    transitioningToStep !== null
                      ? { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                      : { duration: 0.25, ease: 'easeOut' }
                  }
                  style={{
                    position: 'relative',
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    zIndex: 10,
                    background: 'transparent',
                    pointerEvents: transitioningToStep !== null ? 'none' : 'auto',
                    overflow: 'hidden',
                    transformOrigin: getMenuTabOrigin(currentStep, carteleraTabs.length),
                    willChange: 'transform, opacity',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d',
                    perspective: 1000,
                    WebkitFontSmoothing: 'antialiased'
                  }}
                >
                  {renderModuleContent(currentStep)}
                </motion.div>
              </AnimatePresence>
            </main>



          </div>
        );
      })()}

      {/* Studio Editor Tipo Canva */}
      {isEditorOpen && (
        <CanvaEditorStudio
          data={data}
          initialTab={editorTab}
          singleTabMode={editorTab === 'hseq'}
          initialStep={currentStep}
          onSave={handleSave}
          onClose={() => setIsEditorOpen(false)}
          onReset={handleReset}
          renderCanvas={(draftData, step, selectedId, handleSelect) => (
            <CarteleraPage
              isTVMode={true}
              isLivePreview={true}
              previewData={draftData}
              overrideStep={step}
              onElementClick={handleSelect}
              selectedElementId={selectedId}
            />
          )}
        />
      )}
      
      {/* HR Modal */}
      {selectedHr && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999
        }}>
          <div style={{ position: 'relative', width: '90%', maxWidth: '750px', maxHeight: '85vh' }}>
            <button
              id="hr-close-btn"
              onClick={() => setSelectedHr(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: 10,
                backdropFilter: 'blur(4px)'
              }}
            >
              <X size={20} />
            </button>
            <div
              id="hr-modal-content"
              style={{
                background: 'var(--bg-card)',
                padding: '2.5rem',
                borderRadius: '24px',
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(225, 29, 72, 0.15)', margin: '0 auto 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Pin size={32} color="#e11d48" />
                </div>
                <h2 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-primary)' }}>{selectedHr.title}</h2>
                <div style={{ color: '#e11d48', fontWeight: 600, marginTop: '0.25rem' }}>{selectedHr.type === 'alert' ? 'Alerta' : 'Aviso General'}</div>
              </div>
              {selectedHr.desc && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'center' }}>{selectedHr.desc}</p>
              )}
              {selectedHr.image && (
                <div style={{ marginTop: '1.5rem', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
                  <img src={selectedHr.image} style={{ width: '100%', height: 'auto', display: 'block' }} alt="Aviso HR adjunto" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedHseq && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999
        }}>
          <div style={{ position: 'relative', width: '90%', maxWidth: '750px', maxHeight: '85vh' }}>
            <button
              id="hseq-close-btn"
              onClick={() => setSelectedHseq(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: 10,
                backdropFilter: 'blur(4px)'
              }}
            >
              <X size={20} />
            </button>
            <div
              id="hseq-modal-content"
              style={{
                background: 'var(--bg-card)',
                padding: '2.5rem',
                borderRadius: '24px',
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)', margin: '0 auto 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Shield size={32} color="#10b981" />
                </div>
                <h2 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-primary)' }}>{selectedHseq.title}</h2>
                <div style={{ color: '#10b981', fontWeight: 600, marginTop: '0.25rem' }}>{selectedHseq.category || 'HSEQ'}</div>
              </div>
              {selectedHseq.desc && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'center' }}>{selectedHseq.desc}</p>
              )}
              {selectedHseq.image && (
                <div style={{ marginTop: '1.5rem', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
                  <img src={selectedHseq.image} style={{ width: '100%', height: 'auto', display: 'block' }} alt="HSEQ adjunto" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAKE MOUSE CURSOR */}
      <AnimatePresence>
        {fakeMouse.visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: fakeMouse.x, y: fakeMouse.y }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 20, mass: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 999999,
              pointerEvents: 'none',
              width: '28px',
              height: '28px',
              marginLeft: '-4px',
              marginTop: '-4px'
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))', transform: fakeMouse.clicking ? 'scale(0.85)' : 'scale(1)', transition: 'transform 0.1s' }}>
              <path d="M4 4l7.07 16.97 2.51-7.39 7.39-2.51L4 4z" />
            </svg>

            {fakeMouse.ripple && (
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.6)',
                  border: '2px solid #38bdf8'
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </animated.div>
  );
}
