import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCarteleraData } from '../hooks/useCarteleraData';
import { useCarteleraOrchestrator } from '../hooks/useCarteleraOrchestrator';
import { useFakeMouseAutoPlay } from '../hooks/useFakeMouseAutoPlay';
import { usePortalAuth } from '../hooks/usePortalAuth';

import CanvaEditorStudio from '../components/CanvaEditorStudio';
import FlowingMenu from '../components/FlowingMenu';

import CanvaElementWrapper from './Cartelera/components/CanvaElementWrapper';
import CarteleraDashboardView from './Cartelera/components/CarteleraDashboardView';
import CarteleraTopbar from './Cartelera/components/CarteleraTopbar';
import FakeMouseCursor from './Cartelera/components/FakeMouseCursor';

import EventsModule from './Cartelera/modules/EventsModule';
import HrModule from './Cartelera/modules/HrModule';
import BirthdaysModule from './Cartelera/modules/BirthdaysModule';
import HseqModule from './Cartelera/modules/HseqModule';
import CommandCenterModule from './Cartelera/modules/CommandCenterModule';
import VideosModule from './Cartelera/modules/VideosModule';
import ConveniosModule from './Cartelera/modules/ConveniosModule';

import { Pin, Leaf, Award, Shield, X } from 'lucide-react';

function getMenuTabOrigin(idx, total = 5) {
  if (idx === null || idx === undefined) return '50% 50%';
  const percentage = ((idx * 2 + 1) / (total * 2)) * 100;
  return `50% ${percentage}%`;
}

export default function CarteleraPage({
  isTVMode = false,
  isLivePreview = false,
  previewData = null,
  overrideStep = null,
  onElementClick = null,
  selectedElementId = null,
  hideConvenios = false
}) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState('topbar');
  const [newsIndex, setNewsIndex] = useState(0);
  const [selectedHseq, setSelectedHseq] = useState(null);
  const [selectedHr, setSelectedHr] = useState(null);

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
    videosPlayedThisCycle,
    setCurrentStep,
    setTransitioningToStep
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

  const { fakeMouse } = useFakeMouseAutoPlay({
    currentStep,
    isTVMode,
    isLivePreview,
    overrideStep,
    goToStep,
    hseqItems: data?.hseq || [],
    hrItems: data?.hrModule || [],
    setSelectedHseq,
    setSelectedHr
  });

  const carteleraTabs = useMemo(() => [
    { text: 'Eventos Pollo Fiesta', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80', link: '#eventos' },
    { text: 'Avisos Gestión Humana', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80', link: '#rrhh' },
    { text: 'Cumpleaños!!', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80', link: '#cumpleanos' },
    { text: 'Normas HSEQ', image: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&w=600&q=80', link: '#hseq' },
    { text: 'Clima & Noticias Fenavi', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80', link: '#noticias' },
    { text: 'Sobre Nosotros', image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=600&q=80', link: '#videos' },
    { text: 'Convenios Compensar', image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=600&q=80', link: '#convenios' }
  ], []);

  const { user } = usePortalAuth();
  const userScope = user?.userScope || 'RRHH';
  const isHseqUser = userScope === 'HSEQ';

  const openEditor = (tab) => {
    if (isTVMode || isLivePreview) return;
    setEditorTab(isHseqUser ? 'hseq' : tab);
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
  const activeEventIndex = eventsCount > 0 ? (globalEventIndex % eventsCount) : 0;

  const t = data.titles || {};
  const appTitle = t.appTitle || 'POLLO FIESTA S.A.';
  const appSubtitle = t.appSubtitle || 'Cartelera Digital';
  const eventsTitle = t.eventsTitle || 'Comunicados y Eventos Corporativos';

  // --- 1. VISTA PRINCIPAL DEL DASHBOARD ADMINISTRATIVO ---
  if (!isTVMode && !isLivePreview) {
    if (isEditorOpen) {
      return (
        <CanvaEditorStudio
          data={data}
          initialTab={isHseqUser ? 'hseq' : (editorTab || 'topbar')}
          initialStep={isHseqUser ? 3 : currentStep}
          singleTabMode={isHseqUser}
          allowedTabs={isHseqUser ? ['hseq'] : null}
          userScope={userScope}
          onSave={handleSaveData}
          onClose={() => setIsEditorOpen(false)}
          onReset={handleResetData}
          renderCanvas={(draftData, step, selectedId, handleSelect) => (
            <CarteleraPage
              isTVMode={true}
              isLivePreview={true}
              previewData={draftData}
              overrideStep={isHseqUser ? 3 : step}
              onElementClick={handleSelect}
              selectedElementId={selectedId}
            />
          )}
        />
      );
    }

    return (
      <CarteleraDashboardView
        data={data}
        birthdays={birthdays}
        onOpenEditor={openEditor}
        user={user}
      />
    );
  }

  // --- 2. VISTA DE LA CARTELERA ROTATIVA / MODO TV ---
  const renderModuleContent = (targetStep) => (
    <>
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

      {targetStep === 4 && (
        <CommandCenterModule
          weather={weather}
          news={news}
        />
      )}

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
          isLivePreview={isLivePreview}
          overrideStep={overrideStep}
          isTVMode={isTVMode}
          openEditor={openEditor}
        />
      )}

      {targetStep === 6 && (
        <ConveniosModule
          data={data?.convenios || []}
          isLivePreview={isLivePreview}
          isTVMode={isTVMode}
          openEditor={openEditor}
          selectedElementId={selectedElementId}
          onElementClick={onElementClick}
        />
      )}
    </>
  );

  return (
    <animated.div className={`cartelera-wrapper${isTVMode ? ' is-tv-mode' : ''}`} style={{ '--mod-opacity': springOpacity.opacity }}>
      {/* Topbar Institucional Desacoplado */}
      <CarteleraTopbar
        appTitle={appTitle}
        appSubtitle={appSubtitle}
        marquesina={marquesina}
        isTVMode={isTVMode}
        isLivePreview={isLivePreview}
        selectedElementId={selectedElementId}
        onElementClick={onElementClick}
        onOpenEditor={openEditor}
      />

      {/* Grid del Escenario Dinámico */}
      <div className="cartelera-body-grid">
        <main className="stage-showcase" style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
                    if (setCurrentStep) setCurrentStep(idx);
                    if (setTransitioningToStep) setTransitioningToStep(null);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

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
                transformStyle: 'preserve-3d',
                perspective: 1000
              }}
            >
              {renderModuleContent(currentStep)}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Editor Canva Studio */}
      {isEditorOpen && (
        <CanvaEditorStudio
          data={data}
          initialTab={editorTab}
          singleTabMode={editorTab === 'hseq'}
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
      )}

      {/* Modal Detalle HR */}
      {selectedHr && (
        <div style={{
          position: 'fixed',
          inset: 0,
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
                zIndex: 10
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
              }}
            >
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

      {/* Modal Detalle HSEQ */}
      {selectedHseq && (
        <div style={{
          position: 'fixed',
          inset: 0,
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
                zIndex: 10
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
              }}
            >
              {(() => {
                const category = selectedHseq.category || 'SST';
                const isAmbiental = category === 'Ambiental';
                const isCalidad = category === 'Calidad';
                const colorCode = isAmbiental ? '#84cc16' : isCalidad ? '#38bdf8' : '#10b981';
                const bgCode = isAmbiental ? 'rgba(132, 204, 22, 0.15)' : isCalidad ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)';
                const label = isAmbiental ? 'Medio Ambiente' : isCalidad ? 'Calidad e Inocuidad' : 'Seguridad y Salud (SST)';

                return (
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: bgCode, margin: '0 auto 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                      {selectedHseq.icon && (selectedHseq.icon.startsWith('http') || selectedHseq.icon.startsWith('/') || selectedHseq.icon.startsWith('data:')) ? (
                        <img src={selectedHseq.icon} alt="Icono" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : isAmbiental ? (
                        <Leaf size={32} color={colorCode} strokeWidth={2.3} />
                      ) : isCalidad ? (
                        <Award size={32} color={colorCode} strokeWidth={2.3} />
                      ) : (
                        <Shield size={32} color={colorCode} strokeWidth={2.3} />
                      )}
                    </div>
                    <h2 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-primary)' }}>{selectedHseq.title}</h2>
                    <div style={{ color: colorCode, fontWeight: 700, marginTop: '0.35rem', letterSpacing: '0.5px' }}>{label} • POLLO FIESTA S.A.</div>
                  </div>
                );
              })()}
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

      {/* Cursor Virtual Simulado */}
      <FakeMouseCursor fakeMouse={fakeMouse} />
    </animated.div>
  );
}
