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

    const curData = dataRef.current;
    const curBirthdays = birthdaysRef.current;
    const curWeekly = weeklyBirthdaysRef.current;
    const validVideosCount = (curData?.videos || []).filter(v => v?.url && !v.url.includes('mov_bbb.mp4') && !v.url.includes('w3schools')).length;

    let targetStep = nextStep;
    let attempts = 0;
    while (attempts < 7) {
      if (targetStep > 6) targetStep = 0;

      let isValid = true;
      if (targetStep === 0) isValid = (curData?.events?.length || 0) > 0;
      else if (targetStep === 1) isValid = (curData?.hrModule?.length || 0) > 0;
      else if (targetStep === 2) isValid = curBirthdays.length > 0 || curWeekly.length > 0;
      else if (targetStep === 3) isValid = (curData?.hseq?.length || 0) > 0;
      else if (targetStep === 4) isValid = true; // Clima / Noticias
      else if (targetStep === 5) isValid = validVideosCount > 0;
      else if (targetStep === 6) isValid = (curData?.convenios?.length || 0) > 0;

      if (isValid) break;
      targetStep++;
      attempts++;
    }
    if (attempts >= 7) targetStep = 4; // Fallback seguro

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
  }, []);

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

  // --- MÁQUINA DE ESTADOS ESCÉNICA (5 MÓDULOS PROTAGONISTAS CON FLOWING MENU) ---
  useEffect(() => {
    if (isEditorOpen || transitioningToStep !== null || isLivePreview || !isTVMode || (overrideStep !== null && overrideStep !== undefined)) return;

    let timeoutId;
    let intervalId;

    const rotationMs = (data?.topBar?.rotationSpeed || 15) * 1000;

    if (currentStep === 0) { // PASO 0: EVENTOS CORPORATIVOS
      const eventsCount = data?.events?.length || 0;
      if (eventsCount === 0 && overrideStep !== 0) {
        goToStep(1);
        return;
      }

      if (eventsCount <= 1) {
        timeoutId = setTimeout(() => goToStep(1), rotationMs);
      } else {
        let count = 0;
        const limit = Math.max(1, Math.min(eventsCount, 4));
        const intervalTime = rotationMs / limit;

        intervalId = setInterval(() => {
          setGlobalEventIndex(prev => prev + 1);
          count++;
          if (count >= limit) {
            clearInterval(intervalId);
            goToStep(1);
          }
        }, intervalTime);
      }

    } else if (currentStep === 1) { // PASO 1: MÓDULO RRHH
      const hrCount = data?.hrModule?.length || 0;
      if (hrCount === 0 && overrideStep !== 1) {
        goToStep(2);
        return;
      }
      // Temporizador maestro de seguridad para avanzar a Cumpleaños
      const hrDuration = Math.max(14000, Math.min(28000, hrCount * 6000));
      timeoutId = setTimeout(() => {
        goToStep(2);
      }, hrDuration);

    } else if (currentStep === 2) { // PASO 2: CUMPLEAÑOS
      const noBirthdays = birthdays.length === 0 && weeklyBirthdays.length === 0;
      if (noBirthdays && overrideStep !== 2) {
        goToStep(3);
        return;
      }

      timeoutId = setTimeout(() => {
        goToStep(3);
      }, noBirthdays ? 4000 : rotationMs);

    } else if (currentStep === 3) { // PASO 3: MÓDULO HSEQ
      const hseqCount = data?.hseq?.length || 0;
      if (hseqCount === 0 && overrideStep !== 3) {
        goToStep(4);
        return;
      }
      // Temporizador maestro de seguridad para avanzar a Clima y Noticias
      const hseqDuration = Math.max(14000, Math.min(28000, hseqCount * 6000));
      timeoutId = setTimeout(() => {
        goToStep(4);
      }, hseqDuration);

    } else if (currentStep === 4) { // PASO 4: CLIMA, NOTICIAS
      const newsTimer = setTimeout(() => {
        setNewsIndex && setNewsIndex(prev => prev + 1);
      }, rotationMs / 2);

      timeoutId = setTimeout(() => {
        clearTimeout(newsTimer);
        goToStep(5);
      }, rotationMs);

    } else if (currentStep === 5) { // PASO 5: VIDEOS CORPORATIVOS
      const vids = (data?.videos || []).filter(v => v?.url && !v.url.includes('mov_bbb.mp4') && !v.url.includes('w3schools'));
      if (vids.length === 0 && overrideStep !== 5) {
        goToStep(6);
        return;
      }

      timeoutId = setTimeout(() => {
        goToStep(6);
      }, rotationMs * 1.5);

    } else if (currentStep === 6) { // PASO 6: CONVENIOS COMPENSAR
      const convenios = data?.convenios || [];
      if (convenios.length === 0 && overrideStep !== 6) {
        goToStep(0);
        return;
      }

      const conveniosDuration = Math.max(15000, Math.min(25000, convenios.length * 3500));
      timeoutId = setTimeout(() => {
        goToStep(0); // Reiniciar ciclo completo de la cartelera
      }, conveniosDuration);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentStep, data, isEditorOpen, birthdays, weeklyBirthdays, transitioningToStep, isLivePreview, isTVMode, overrideStep]);

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
    videosPlayedThisCycle
  };
}
