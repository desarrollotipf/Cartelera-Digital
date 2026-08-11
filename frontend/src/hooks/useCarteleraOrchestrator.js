import { useState, useEffect, useRef } from 'react';

export function useCarteleraOrchestrator(
  data, 
  isEditorOpen, 
  isTVMode, 
  isLivePreview, 
  overrideStep, 
  selectedElementId, 
  birthdays, 
  weeklyBirthdays,
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

  useEffect(() => {
    if (overrideStep !== null && overrideStep !== undefined) {
      setCurrentStep(overrideStep);
      setTransitioningToStep(null);
    }
  }, [overrideStep]);

  const goToStep = (nextStep) => {
    if (isEditorOpen) return;

    let targetStep = nextStep;
    let attempts = 0;
    while (attempts < 6) {
      if (targetStep > 6) targetStep = 0;

      let isValid = true;
      if (targetStep === 0) isValid = (data?.events?.length || 0) > 0;
      else if (targetStep === 1) isValid = (data?.hrModule?.length || 0) > 0;
      else if (targetStep === 2) isValid = birthdays.length > 0 || weeklyBirthdays.length > 0;
      else if (targetStep === 3) isValid = (data?.hseq?.length || 0) > 0;
      else if (targetStep === 4) isValid = true; // Always valid
      else if (targetStep === 5) isValid = (data?.videos?.length || 0) > 0;
      else if (targetStep === 6) isValid = true; // Always valid para ver la data por defecto

      if (isValid) break;
      targetStep++;
      attempts++;
    }
    if (attempts >= 7) targetStep = 4; // Fallback

    if (targetStep === currentStep && transitioningToStep === null) return;

    setTransitioningToStep(targetStep);
    setFlowingActiveIdx(currentStep);
    setMenuHighlightIdx(currentStep);

    if (flowingTimeoutRef.current) clearTimeout(flowingTimeoutRef.current);
    flowingTimeoutRef.current = setTimeout(() => {
      setFlowingActiveIdx(targetStep);

      // Background cambia exactamente en el impacto del clic (1350ms de animación)
      setTimeout(() => {
        setMenuHighlightIdx(targetStep);
        setCurrentStep(targetStep);
      }, 1350);

      // El menú desaparece cuando la onda ya se ha expandido (1950ms)
      setTimeout(() => {
        setTransitioningToStep(null);
      }, 1950);

    }, 800);
  };

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
    if (isEditorOpen || transitioningToStep !== null || isLivePreview || !isTVMode) return;

    let timeoutId;
    let intervalId;

    const rotationMs = (data?.topBar?.rotationSpeed || 15) * 1000;

    if (currentStep === 0) { // PASO 0: EVENTOS CORPORATIVOS
      const eventsCount = data?.events?.length || 0;
      if (eventsCount === 0 && overrideStep !== 0) {
        goToStep(1); // saltar a Módulo RRHH si no hay eventos
        return;
      }

      if (eventsCount === 0) {
        timeoutId = setTimeout(() => goToStep(1), 5000);
      } else {
        let count = 0;
        const limit = Math.max(1, Math.min(eventsCount, 4));
        const intervalTime = rotationMs / limit;

        intervalId = setInterval(() => {
          setGlobalEventIndex(prev => prev + 1);
          count++;
          if (count >= limit) {
            clearInterval(intervalId);
            goToStep(1); // avanzar a Módulo RRHH tras rotar eventos con FlowingMenu
          }
        }, intervalTime); // Cada evento toma una fracción del tiempo total
      }

    } else if (currentStep === 1) { // PASO 1: MÓDULO RRHH
      const hrCount = data?.hrModule?.length || 0;
      if (hrCount === 0 && overrideStep !== 1) {
        goToStep(2); // saltar a cumpleaños si no hay avisos
        return;
      }

      if (hrCount === 0) {
        timeoutId = setTimeout(() => {
          goToStep(2); // avanzar a cumpleaños tras rotacion completa
        }, 5000);
      }
      // Fake navigation will handle goToStep(2) when done

    } else if (currentStep === 2) { // PASO 2: CUMPLEAÑOS Y CELEBRACIÓN SEMANAL
      const noBirthdays = birthdays.length === 0 && weeklyBirthdays.length === 0;
      if (noBirthdays && overrideStep !== 2) {
        goToStep(3); // saltar a HSEQ si no hay cumpleaños
        return;
      }

      timeoutId = setTimeout(() => {
        goToStep(3); // avanzar a HSEQ
      }, noBirthdays ? 5000 : rotationMs);

    } else if (currentStep === 3) { // PASO 3: MÓDULO HSEQ
      const hseqCount = data?.hseq?.length || 0;
      if (hseqCount === 0 && overrideStep !== 3) {
        goToStep(4); // saltar a Clima y Noticias
        return;
      }

      if (hseqCount === 0) {
        timeoutId = setTimeout(() => {
          goToStep(4);
        }, 5000);
      }
      // Fake navigation will handle goToStep(4) when done

    } else if (currentStep === 4) { // PASO 4: CLIMA, NOTICIAS
      const newsTimer = setTimeout(() => {
        setNewsIndex && setNewsIndex(prev => prev + 1);
      }, rotationMs / 2);

      timeoutId = setTimeout(() => {
        clearTimeout(newsTimer);
        goToStep(5); // avanzar a sala de video
      }, rotationMs);

    } else if (currentStep === 5) { // PASO 5: VIDEOS CORPORATIVOS
      const vids = data?.videos || [];
      if (vids.length === 0 && overrideStep !== 5) {
        goToStep(6); // volver a eventos corporativos si no hay videos
        return;
      }

      if (vids.length === 0) {
        timeoutId = setTimeout(() => goToStep(6), 5000);
      }
      // Si hay videos, el evento onEnded de la etiqueta <video> avanzará el ciclo.
    } else if (currentStep === 6) { // PASO 6: CONVENIOS
      // No hacemos validacion restrictiva aqui para que puedan ver los defaults
      // El autoplay dentro de ConveniosCompensarPage llamara a onComplete() para avanzar a goToStep(0)
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
