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
        setFakeMouse(prev => ({ ...prev, visible: false }));
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
          await new Promise(r => setTimeout(r, 220));
          if (!isMounted) return;
          setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));

          // 3. Abrir Modal de detalle garantizado (llamando el setter y el click del elemento)
          const hrId = el.getAttribute('data-hr-id');
          const hrIdx = el.getAttribute('data-hr-index');
          const hrItem = (hrRef.current || []).find(it => String(it.id) === String(hrId)) || (hrRef.current || [])[hrIdx] || (hrRef.current || [])[i];
          if (setHrModalRef.current && hrItem) {
            setHrModalRef.current(hrItem);
          }
          try { el.click(); } catch (_) { }

          // Esperar 4.2 segundos para lectura cómoda del aviso en el modal
          await new Promise(r => setTimeout(r, 4200));
          if (!isMounted) return;

          // 4. Cerrar Modal
          if (setHrModalRef.current) setHrModalRef.current(null);
          await new Promise(r => setTimeout(r, 800));
          if (!isMounted) return;
        }
      }

      // Ocultar cursor al terminar la secuencia de tarjetas
      setFakeMouse(prev => ({ ...prev, visible: false }));
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
        setFakeMouse(prev => ({ ...prev, visible: false }));
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
          await new Promise(r => setTimeout(r, 220));
          if (!isMounted) return;
          setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));

          // 3. Abrir Modal HSEQ garantizado
          const hseqId = el.getAttribute('data-hseq-id');
          const hseqIdx = el.getAttribute('data-hseq-index');
          const hseqItem = (hseqRef.current || []).find(it => String(it.id) === String(hseqId)) || (hseqRef.current || [])[hseqIdx] || (hseqRef.current || [])[i];
          if (setHseqModalRef.current && hseqItem) {
            setHseqModalRef.current(hseqItem);
          }
          try { el.click(); } catch (_) { }

          // Esperar 4.2 segundos para lectura de la normativa
          await new Promise(r => setTimeout(r, 4200));
          if (!isMounted) return;

          // 4. Cerrar Modal
          if (setHseqModalRef.current) setHseqModalRef.current(null);
          await new Promise(r => setTimeout(r, 800));
          if (!isMounted) return;
        }
      }

      // Ocultar cursor al terminar la secuencia
      setFakeMouse(prev => ({ ...prev, visible: false }));
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
