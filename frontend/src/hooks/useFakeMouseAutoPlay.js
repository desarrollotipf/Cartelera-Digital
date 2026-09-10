import { useState, useEffect, useRef } from 'react';

/**
 * Hook para simular la interacción automática del cursor virtual en modo TV
 */
export function useFakeMouseAutoPlay({
  currentStep,
  transitioningToStep = null,
  isTVMode,
  isLivePreview,
  overrideStep,
  goToStep,
  hseqItems = [],
  hrItems = [],
  convenioItems = [],
  setSelectedHseq,
  setSelectedHr,
  setSelectedConvenio
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

  const setConvenioModalRef = useRef(setSelectedConvenio);
  setConvenioModalRef.current = setSelectedConvenio;

  const hseqRef = useRef(hseqItems);
  hseqRef.current = hseqItems;

  const hrRef = useRef(hrItems);
  hrRef.current = hrItems;

  const conveniosRef = useRef(convenioItems);
  conveniosRef.current = convenioItems;

  // 1. Autoplay para Avisos de Gestión Humana (Paso 1)
  useEffect(() => {
    if (currentStep !== 1 || transitioningToStep !== null || !isTVMode || isLivePreview) {
      setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
      if (setHrModalRef.current) setHrModalRef.current(null);
      return;
    }

    let isMounted = true;

    const runHrSequence = async () => {
      try {
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
          setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
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

            // 3. Abrir Modal de detalle garantizado
            const hrId = el.getAttribute('data-hr-id');
            const hrIdx = el.getAttribute('data-hr-index');
            const hrItem = (hrRef.current || []).find(it => String(it.id) === String(hrId)) || (hrRef.current || [])[hrIdx] || (hrRef.current || [])[i];
            if (setHrModalRef.current && hrItem) {
              setHrModalRef.current(hrItem);
            }

            // Esperar 4.2 segundos para lectura cómoda del aviso en el modal
            await new Promise(r => setTimeout(r, 4200));
            if (!isMounted) return;

            // 4. Cerrar Modal
            if (setHrModalRef.current) setHrModalRef.current(null);
            await new Promise(r => setTimeout(r, 800));
            if (!isMounted) return;
          }
        }
      } finally {
        if (setHrModalRef.current) setHrModalRef.current(null);
        setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
      }
    };

    runHrSequence();

    return () => {
      isMounted = false;
      if (setHrModalRef.current) setHrModalRef.current(null);
      setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
    };
  }, [currentStep, transitioningToStep, isTVMode, isLivePreview, overrideStep]);

  // 2. Autoplay para Normas HSEQ (Paso 3)
  useEffect(() => {
    if (currentStep !== 3 || transitioningToStep !== null || !isTVMode || isLivePreview) {
      setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
      if (setHseqModalRef.current) setHseqModalRef.current(null);
      return;
    }

    let isMounted = true;

    const runHseqSequence = async () => {
      try {
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
          setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
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

            // Esperar 4.2 segundos para lectura de la normativa
            await new Promise(r => setTimeout(r, 4200));
            if (!isMounted) return;

            // 4. Cerrar Modal
            if (setHseqModalRef.current) setHseqModalRef.current(null);
            await new Promise(r => setTimeout(r, 800));
            if (!isMounted) return;
          }
        }
      } finally {
        if (setHseqModalRef.current) setHseqModalRef.current(null);
        setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
      }
    };

    runHseqSequence();

    return () => {
      isMounted = false;
      if (setHseqModalRef.current) setHseqModalRef.current(null);
      setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
    };
  }, [currentStep, transitioningToStep, isTVMode, isLivePreview, overrideStep]);

  // 3. Autoplay para Convenios Compensar (Paso 6)
  useEffect(() => {
    if (currentStep !== 6 || transitioningToStep !== null || !isTVMode || isLivePreview) {
      setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
      if (setConvenioModalRef.current) setConvenioModalRef.current(null);
      return;
    }

    let isMounted = true;

    const runConveniosSequence = async () => {
      try {
        // Esperar que la animación de entrada se complete
        await new Promise(r => setTimeout(r, 1200));
        if (!isMounted) return;

        // Obtener las tarjetas renderizadas y ordenarlas estrictamente de izquierda a derecha (y arriba hacia abajo)
        const allCards = Array.from(document.querySelectorAll('.convenio-stage-card-wrapper, [id^="convenio-card-"]'));
        allCards.sort((a, b) => {
          const rA = a.getBoundingClientRect();
          const rB = b.getBoundingClientRect();
          if (Math.abs(rA.top - rB.top) > 60) return rA.top - rB.top;
          return rA.left - rB.left;
        });

        if (allCards.length === 0) {
          setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
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

            // 3. Abrir Modal de Convenio garantizado
            const convId = el.getAttribute('data-convenio-id');
            const convIdx = el.getAttribute('data-convenio-index');
            const convItem = (conveniosRef.current || []).find(it => String(it.id) === String(convId)) || (conveniosRef.current || [])[convIdx] || (conveniosRef.current || [])[i];
            if (setConvenioModalRef.current && convItem) {
              setConvenioModalRef.current(convItem);
            }

            // Esperar 4.2 segundos para lectura del convenio
            await new Promise(r => setTimeout(r, 4200));
            if (!isMounted) return;

            // 4. Cerrar Modal
            if (setConvenioModalRef.current) setConvenioModalRef.current(null);
            await new Promise(r => setTimeout(r, 800));
            if (!isMounted) return;
          }
        }
      } finally {
        if (setConvenioModalRef.current) setConvenioModalRef.current(null);
        setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
      }
    };

    runConveniosSequence();

    return () => {
      isMounted = false;
      if (setConvenioModalRef.current) setConvenioModalRef.current(null);
      setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
    };
  }, [currentStep, transitioningToStep, isTVMode, isLivePreview, overrideStep]);

  return {
    fakeMouse,
    setFakeMouse
  };
}
