import { useState, useEffect, useRef, useCallback } from 'react';

export function useCarteleraOrchestrator(
  data, 
  isEditorOpen, 
  isTVMode, 
  isLivePreview, 
  overrideStep, 
  selectedElementId, 
  birthdays = [], 
  weeklyBirthdays = [],
  setNewsIndex
) {
  const [currentStep, setCurrentStep] = useState(overrideStep !== null && overrideStep !== undefined ? overrideStep : 0);
  const [transitioningToStep, setTransitioningToStep] = useState(null);
  const [flowingActiveIdx, setFlowingActiveIdx] = useState(null);
  const [menuHighlightIdx, setMenuHighlightIdx] = useState(null);
  
  const [globalEventIndex, setGlobalEventIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [isDeckTransitioning, setIsDeckTransitioning] = useState(false);
  const [videoOrientations, setVideoOrientations] = useState({});
  const videosPlayedThisCycle = useRef(0);

  const flowingTimeoutRef = useRef(null);

  const dataRef = useRef(data);
  dataRef.current = data;

  const birthdaysRef = useRef(birthdays);
  birthdaysRef.current = birthdays;

  const weeklyBirthdaysRef = useRef(weeklyBirthdays);
  weeklyBirthdaysRef.current = weeklyBirthdays;

  const isEditorOpenRef = useRef(isEditorOpen);
  isEditorOpenRef.current = isEditorOpen;

  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  useEffect(() => {
    if (overrideStep !== null && overrideStep !== undefined) {
      setCurrentStep(overrideStep);
      setTransitioningToStep(null);
    }
  }, [overrideStep]);

  const goToStep = useCallback((nextStep) => {
    // En modo editor o previsualización en vivo, la rotación está 100% bloqueada
    if (isEditorOpenRef.current || isLivePreview || (overrideStep !== null && overrideStep !== undefined)) return;

    let targetStep = nextStep;
    if (targetStep > 6) targetStep = 0;
    if (targetStep < 0) targetStep = 6;

    const fromStep = currentStepRef.current;
    if (targetStep === fromStep) return;

    setTransitioningToStep(targetStep);
    setFlowingActiveIdx(fromStep);
    setMenuHighlightIdx(fromStep);

    if (flowingTimeoutRef.current) clearTimeout(flowingTimeoutRef.current);
    flowingTimeoutRef.current = setTimeout(() => {
      setFlowingActiveIdx(targetStep);

      // Background cambia al impacto del clic (1350ms)
      setTimeout(() => {
        setMenuHighlightIdx(targetStep);
        setCurrentStep(targetStep);
      }, 1350);

      // El menú de transición concluye
      setTimeout(() => {
        setTransitioningToStep(null);
      }, 1950);

    }, 800);
  }, [isLivePreview, overrideStep]);

  useEffect(() => {
    if (isEditorOpen) {
      setTransitioningToStep(null);
    }
  }, [isEditorOpen]);

  // Auto-rotar el carrusel de eventos cuando se selecciona un evento en el editor
  useEffect(() => {
    if (selectedElementId && data?.events) {
      const idx = data.events.findIndex((ev, i) => selectedElementId === (ev.id || i));
      if (idx !== -1) {
        setGlobalEventIndex(idx);
      }
    }
  }, [selectedElementId, data?.events]);

  // Sincronizar el video actual con la selección en el editor
  useEffect(() => {
    if (selectedElementId && data?.videos) {
      const idx = data.videos.findIndex((v, i) => selectedElementId === (v.id || i));
      if (idx !== -1) {
        setVideoIndex(idx);
        // Force reset the cycle count so it plays fully when previewed
        videosPlayedThisCycle.current = 0;
        setIsDeckTransitioning(true);
      }
    }
  }, [selectedElementId, data?.videos]);

  useEffect(() => {
    if (currentStep === 5) {
      videosPlayedThisCycle.current = 0;
      setVideoIndex(0); // Siempre arrancar desde el primer video al entrar a la sala de cine
    }
  }, [currentStep]);

  // Coreografía Orbital (Formato TikTok 9:16)
  useEffect(() => {
    if (currentStep === 5 || transitioningToStep === 5) {
      setIsDeckTransitioning(true);
      const timer = setTimeout(() => {
        setIsDeckTransitioning(false); // Completa rotación y expande el video activo al frente en modo TikTok
      }, 1300);
      return () => clearTimeout(timer);
    } else {
      setIsDeckTransitioning(false);
    }
  }, [currentStep, videoIndex, transitioningToStep]);

  // Determinar qué módulos tienen contenido activo para rotar ("si no hay nada, no debe mostrarse")
  const isStepAvailable = useCallback((step) => {
    if (step === 0) { // Eventos
      return (data?.events?.length || 0) > 0;
    }
    if (step === 1) { // Avisos Gestión Humana
      return (data?.hrModule?.length || 0) > 0;
    }
    if (step === 2) { // Cumpleaños
      return (birthdays?.length || 0) > 0 || (weeklyBirthdays?.length || 0) > 0;
    }
    if (step === 3) { // Normas HSEQ
      return (data?.hseq?.length || 0) > 0;
    }
    if (step === 4) { // Clima y Noticias (Siempre disponible con tiempo real y noticias)
      return true;
    }
    if (step === 5) { // Sobre Nosotros / Videos
      const vids = (data?.videos || []).filter(v => v?.url && !v.url.includes('mov_bbb.mp4') && !v.url.includes('w3schools'));
      return vids.length > 0;
    }
    if (step === 6) { // Convenios Compensar
      return (data?.convenios?.length || 0) > 0;
    }
    return false;
  }, [data, birthdays, weeklyBirthdays]);

  // Siguiente paso disponible en orden estricto 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 0
  const getNextAvailableStep = useCallback((fromStep) => {
    for (let offset = 1; offset <= 7; offset++) {
      const candidate = (fromStep + offset) % 7;
      if (isStepAvailable(candidate)) {
        return candidate;
      }
    }
    return 4; // Fallback garantizado a Clima y Noticias
  }, [isStepAvailable]);

  // Si el paso actual no tiene contenido (p.ej. valores limpios de fábrica), saltar al primer paso con contenido
  useEffect(() => {
    if (overrideStep !== null && overrideStep !== undefined) return;
    if (isEditorOpen || isLivePreview) return;

    if (!isStepAvailable(currentStep)) {
      const firstAvailable = [0, 1, 2, 3, 4, 5, 6].find(s => isStepAvailable(s)) ?? 4;
      if (firstAvailable !== currentStep) {
        setCurrentStep(firstAvailable);
      }
    }
  }, [currentStep, isStepAvailable, overrideStep, isEditorOpen, isLivePreview]);

  // --- MÁQUINA DE ESTADOS ESCÉNICA: ROTACIÓN ESTRICTA EN ORDEN CON OMISIÓN DE MÓDULOS VACÍOS ---
  useEffect(() => {
    if (isEditorOpen || transitioningToStep !== null || isLivePreview || !isTVMode || (overrideStep !== null && overrideStep !== undefined)) return;

    let timeoutId;
    let intervalId;

    const rotationMs = (data?.topBar?.rotationSpeed || 12) * 1000;

    if (currentStep === 0) { // PASO 0: EVENTOS CORPORATIVOS
      const eventsCount = data?.events?.length || 0;
      if (eventsCount <= 1) {
        timeoutId = setTimeout(() => goToStep(getNextAvailableStep(0)), rotationMs);
      } else {
        let count = 0;
        const limit = Math.max(1, Math.min(eventsCount, 4));
        const intervalTime = rotationMs / limit;

        intervalId = setInterval(() => {
          setGlobalEventIndex(prev => prev + 1);
          count++;
          if (count >= limit) {
            clearInterval(intervalId);
            goToStep(getNextAvailableStep(0));
          }
        }, intervalTime);
      }

    } else if (currentStep === 1) { // PASO 1: AVISOS GESTIÓN HUMANA
      const hrCount = data?.hrModule?.length || 0;
      const hrDuration = Math.max(14000, (hrCount * 6500) + 1500);
      timeoutId = setTimeout(() => {
        goToStep(getNextAvailableStep(1));
      }, hrDuration);

    } else if (currentStep === 2) { // PASO 2: CUMPLEAÑOS
      timeoutId = setTimeout(() => {
        goToStep(getNextAvailableStep(2));
      }, rotationMs);

    } else if (currentStep === 3) { // PASO 3: NORMAS HSEQ
      const hseqCount = data?.hseq?.length || 0;
      const hseqDuration = Math.max(14000, (hseqCount * 6500) + 1500);
      timeoutId = setTimeout(() => {
        goToStep(getNextAvailableStep(3));
      }, hseqDuration);

    } else if (currentStep === 4) { // PASO 4: CLIMA Y NOTICIAS
      const newsTimer = setTimeout(() => {
        setNewsIndex && setNewsIndex(prev => prev + 1);
      }, rotationMs / 2);

      timeoutId = setTimeout(() => {
        clearTimeout(newsTimer);
        const next = getNextAvailableStep(4);
        if (next !== 4) {
          goToStep(next);
        }
      }, rotationMs);

    } else if (currentStep === 5) { // PASO 5: SOBRE NOSOTROS / VIDEOS CORPORATIVOS
      const videoDuration = rotationMs * 1.5;
      timeoutId = setTimeout(() => {
        goToStep(getNextAvailableStep(5));
      }, videoDuration);

    } else if (currentStep === 6) { // PASO 6: CONVENIOS COMPENSAR
      const convenios = data?.convenios || [];
      const conveniosDuration = Math.max(14000, Math.min(25000, convenios.length * 3500));
      timeoutId = setTimeout(() => {
        goToStep(getNextAvailableStep(6));
      }, conveniosDuration);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentStep, data, isEditorOpen, birthdays, weeklyBirthdays, transitioningToStep, isLivePreview, isTVMode, overrideStep, getNextAvailableStep, goToStep]);

  return {
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
    isStepAvailable,
    getNextAvailableStep
  };
}
