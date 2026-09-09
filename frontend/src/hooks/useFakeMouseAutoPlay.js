import { useState, useEffect, useRef } from 'react';

/**
 * Hook para simular la interacción automática del cursor virtual en modo TV
 */
export function useFakeMouseAutoPlay({
  currentStep,
  isTVMode,
  isLivePreview,
  overrideStep,
  goToStep,
  hseqItems = [],
  hrItems = [],
  setSelectedHseq,
  setSelectedHr
}) {
  const [fakeMouse, setFakeMouse] = useState({
    x: -100,
    y: -100,
    visible: false,
    clicking: false,
    ripple: false
  });

  // Guardar callbacks y referencias en refs estables para evitar re-ejecuciones y cancelaciones indeseadas
  const goToStepRef = useRef(goToStep);
  goToStepRef.current = goToStep;

  const setHrModalRef = useRef(setSelectedHr);
  setHrModalRef.current = setSelectedHr;

  const setHseqModalRef = useRef(setSelectedHseq);
  setHseqModalRef.current = setSelectedHseq;

  const hseqRef = useRef(hseqItems);
  hseqRef.current = hseqItems;

  const hrRef = useRef(hrItems);
  hrRef.current = hrItems;

  // 1. Autoplay para Avisos de Gestión Humana (Paso 1)
  useEffect(() => {
    if (currentStep !== 1 || !isTVMode || isLivePreview) {
      setFakeMouse(prev => ({ ...prev, visible: false }));
      return;
    }

    let isMounted = true;

    const runHrSequence = async () => {
      // Esperar que la animación de entrada del paso 1 se complete
      await new Promise(r => setTimeout(r, 1200));
      if (!isMounted) return;

      // Obtener las tarjetas renderizadas y ordenarlas estrictamente de izquierda a derecha (y de arriba a abajo por filas)
      const allCards = Array.from(document.querySelectorAll('.hr-stage-card'));
      allCards.sort((a, b) => {
        const rA = a.getBoundingClientRect();
        const rB = b.getBoundingClientRect();
        if (Math.abs(rA.top - rB.top) > 60) return rA.top - rB.top;
        return rA.left - rB.left;
      });

      if (allCards.length === 0) {
        if (overrideStep !== 1) goToStepRef.current(2);
        return;
      }

      for (let i = 0; i < allCards.length; i++) {
        if (!isMounted) return;
        const el = allCards[i];

        if (el) {
          const rect = el.getBoundingClientRect();
          const targetX = rect.left + rect.width / 2;
          const targetY = rect.top + Math.min(rect.height / 2, 220);

          // 1. Mover cursor hacia la tarjeta de izquierda a derecha
          setFakeMouse({ x: targetX, y: targetY, visible: true, clicking: false, ripple: false });
          await new Promise(r => setTimeout(r, 900));
          if (!isMounted) return;

          // 2. Efecto de Clic (Ripple)
          setFakeMouse(prev => ({ ...prev, clicking: true, ripple: true }));
          await new Promise(r => setTimeout(r, 180));
          if (!isMounted) return;
          setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));

          // 3. Abrir Modal de detalle interactuando con el elemento
          el.click();
          await new Promise(r => setTimeout(r, 3800));
          if (!isMounted) return;

          // 4. Cerrar Modal
          if (setHrModalRef.current) setHrModalRef.current(null);
          await new Promise(r => setTimeout(r, 700));
          if (!isMounted) return;
        }
      }

      // Ocultar cursor y avanzar al Paso 2 (Cumpleaños)
      setFakeMouse(prev => ({ ...prev, visible: false }));
      await new Promise(r => setTimeout(r, 400));
      if (!isMounted) return;

      if (overrideStep !== 1) {
        goToStepRef.current(2);
      }
    };

    runHrSequence();

    return () => {
      isMounted = false;
      if (setHrModalRef.current) setHrModalRef.current(null);
    };
  }, [currentStep, isTVMode, isLivePreview, overrideStep]);

  // 2. Autoplay para Normas HSEQ (Paso 3)
  useEffect(() => {
    if (currentStep !== 3 || !isTVMode || isLivePreview) {
      return;
    }

    let isMounted = true;

    const runHseqSequence = async () => {
      // Esperar que la animación de entrada se complete
      await new Promise(r => setTimeout(r, 1200));
      if (!isMounted) return;

      // Obtener las tarjetas renderizadas y ordenarlas estrictamente de izquierda a derecha
      const allCards = Array.from(document.querySelectorAll('.kpi-stage-card'));
      allCards.sort((a, b) => {
        const rA = a.getBoundingClientRect();
        const rB = b.getBoundingClientRect();
        if (Math.abs(rA.top - rB.top) > 60) return rA.top - rB.top;
        return rA.left - rB.left;
      });

      if (allCards.length === 0) {
        if (overrideStep !== 3) goToStepRef.current(4);
        return;
      }

      for (let i = 0; i < allCards.length; i++) {
        if (!isMounted) return;
        const el = allCards[i];

        if (el) {
          const rect = el.getBoundingClientRect();
          const targetX = rect.left + rect.width / 2;
          const targetY = rect.top + Math.min(rect.height / 2, 220);

          // 1. Mover cursor hacia la tarjeta de izquierda a derecha
          setFakeMouse({ x: targetX, y: targetY, visible: true, clicking: false, ripple: false });
          await new Promise(r => setTimeout(r, 900));
          if (!isMounted) return;

          // 2. Efecto de Clic
          setFakeMouse(prev => ({ ...prev, clicking: true, ripple: true }));
          await new Promise(r => setTimeout(r, 180));
          if (!isMounted) return;
          setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));

          // 3. Abrir Modal HSEQ interactuando con el elemento
          el.click();
          await new Promise(r => setTimeout(r, 3800));
          if (!isMounted) return;

          // 4. Cerrar Modal
          if (setHseqModalRef.current) setHseqModalRef.current(null);
          await new Promise(r => setTimeout(r, 700));
          if (!isMounted) return;
        }
      }

      // Ocultar cursor y avanzar al Paso 4 (Clima y Noticias)
      setFakeMouse(prev => ({ ...prev, visible: false }));
      await new Promise(r => setTimeout(r, 400));
      if (!isMounted) return;

      if (overrideStep !== 3) {
        goToStepRef.current(4);
      }
    };

    runHseqSequence();

    return () => {
      isMounted = false;
      if (setHseqModalRef.current) setHseqModalRef.current(null);
    };
  }, [currentStep, isTVMode, isLivePreview, overrideStep]);

  return {
    fakeMouse,
    setFakeMouse
  };
}
