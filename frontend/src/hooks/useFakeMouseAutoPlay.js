import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Función para desplazar automáticamente el contenido del modal de arriba a abajo
 * a una velocidad ágil y constante y esperar hasta que la imagen o contenido se visualice por completo.
 */
function autoScrollModalContent(modalEl, speedFactor = 1.0) {
  return new Promise((resolve) => {
    if (!modalEl) {
      setTimeout(resolve, Math.round(2500 * speedFactor));
      return;
    }

    modalEl.scrollTop = 0;

    const executeScroll = () => {
      const maxScroll = modalEl.scrollHeight - modalEl.clientHeight;

      if (maxScroll <= 20) {
        // No hay scroll necesario (cabe completo en la ventana del modal). Esperar lectura y resolver.
        setTimeout(resolve, Math.round(2800 * speedFactor));
        return;
      }

      // Velocidad ágil y legible (~88-105px/segundo según speedFactor)
      const pxPerSec = Math.max(70, Math.min(130, 92 / speedFactor));
      const scrollDuration = Math.min(7.2, Math.max(2.2, maxScroll / pxPerSec));

      // 1. Pausa inicial para leer título y descripción superior
      setTimeout(() => {
        gsap.to(modalEl, {
          scrollTop: maxScroll,
          duration: scrollDuration,
          ease: 'power1.inOut',
          onComplete: () => {
            // 2. Pausa al final una vez que la imagen o afiche se visualiza por completo
            setTimeout(resolve, Math.round(1500 * speedFactor));
          }
        });
      }, Math.round(1000 * speedFactor));
    };

    const img = modalEl.querySelector('img');
    if (img && !img.complete) {
      img.onload = () => setTimeout(executeScroll, 100);
      setTimeout(executeScroll, 450);
    } else {
      setTimeout(executeScroll, 200);
    }
  });
}

/**
 * Hook para simular la interacción automática del cursor virtual en modo TV.
 * Las páginas con navegación automática son completamente independientes del temporizador manual:
 * completan la visualización secuencial de TODAS las tarjetas con sus modales y solo cuando
 * termina de verse la última tarjeta y su modal es cuando se avanza al siguiente módulo.
 */
export function useFakeMouseAutoPlay({
  currentStep,
  transitioningToStep = null,
  isTVMode,
  isLivePreview,
  overrideStep,
  goToStep,
  getNextAvailableStep,
  rotationSpeed = 12,
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

  const getNextAvailableStepRef = useRef(getNextAvailableStep);
  getNextAvailableStepRef.current = getNextAvailableStep;

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

  // Factor de velocidad suave derivado del temporizador para una navegación más ágil si se desea
  const speedFactor = Math.max(0.65, Math.min(1.4, (rotationSpeed || 12) / 12));

  // 1. Autoplay para Avisos de Gestión Humana (Paso 1)
  useEffect(() => {
    if (currentStep !== 1 || transitioningToStep !== null || !isTVMode || isLivePreview || (overrideStep !== null && overrideStep !== undefined)) {
      setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
      if (setHrModalRef.current) setHrModalRef.current(null);
      return;
    }

    let isMounted = true;

    const runHrSequence = async () => {
      try {
        // Esperar que la animación de entrada del paso 1 se complete
        await new Promise(r => setTimeout(r, Math.round(1000 * speedFactor)));
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
          await new Promise(r => setTimeout(r, 1200));
          if (!isMounted) return;
          if (goToStepRef.current) {
            const next = getNextAvailableStepRef.current ? getNextAvailableStepRef.current(1) : 2;
            goToStepRef.current(next);
          }
          return;
        }

        for (let i = 0; i < allCards.length; i++) {
          if (!isMounted) return;
          const el = allCards[i];

          if (el) {
            const rect = el.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + Math.min(rect.height / 2, 220);

            // 1. Mover cursor hacia la tarjeta de izquierda a derecha de forma ágil
            setFakeMouse({ x: targetX, y: targetY, visible: true, clicking: false, ripple: false });
            await new Promise(r => setTimeout(r, Math.round(650 * speedFactor)));
            if (!isMounted) return;

            // 2. Efecto de Clic (Ripple)
            setFakeMouse(prev => ({ ...prev, clicking: true, ripple: true }));
            await new Promise(r => setTimeout(r, 180));
            if (!isMounted) return;
            setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));

            // 3. Abrir Modal de detalle garantizado
            const hrId = el.getAttribute('data-hr-id');
            const hrIdx = el.getAttribute('data-hr-index');
            const hrItem = (hrRef.current || []).find(it => String(it.id) === String(hrId)) || (hrRef.current || [])[hrIdx] || (hrRef.current || [])[i];
            if (setHrModalRef.current && hrItem) {
              setHrModalRef.current(hrItem);
            }

            // Esperar que el modal monte y ejecute el scroll automático hasta visualizar la imagen completa
            await new Promise(r => setTimeout(r, 380));
            if (!isMounted) return;

            const modalEl = document.getElementById('hr-modal-content');
            await autoScrollModalContent(modalEl, speedFactor);
            if (!isMounted) return;

            // 4. Cerrar Modal
            if (setHrModalRef.current) setHrModalRef.current(null);
            await new Promise(r => setTimeout(r, Math.round(500 * speedFactor)));
            if (!isMounted) return;
          }
        }

        // --- SOLO CUANDO TERMINA DE VERSE LA ÚLTIMA TARJETA Y SU MODAL ---
        if (!isMounted) return;
        await new Promise(r => setTimeout(r, 600));
        if (!isMounted) return;
        if (goToStepRef.current) {
          const next = getNextAvailableStepRef.current ? getNextAvailableStepRef.current(1) : 2;
          goToStepRef.current(next);
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
  }, [currentStep, transitioningToStep, isTVMode, isLivePreview, overrideStep, speedFactor]);

  // 2. Autoplay para Normas HSEQ (Paso 3)
  useEffect(() => {
    if (currentStep !== 3 || transitioningToStep !== null || !isTVMode || isLivePreview || (overrideStep !== null && overrideStep !== undefined)) {
      setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
      if (setHseqModalRef.current) setHseqModalRef.current(null);
      return;
    }

    let isMounted = true;

    const runHseqSequence = async () => {
      try {
        // Esperar que la animación de entrada se complete
        await new Promise(r => setTimeout(r, Math.round(1000 * speedFactor)));
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
          await new Promise(r => setTimeout(r, 1200));
          if (!isMounted) return;
          if (goToStepRef.current) {
            const next = getNextAvailableStepRef.current ? getNextAvailableStepRef.current(3) : 4;
            goToStepRef.current(next);
          }
          return;
        }

        for (let i = 0; i < allCards.length; i++) {
          if (!isMounted) return;
          const el = allCards[i];

          if (el) {
            const rect = el.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + Math.min(rect.height / 2, 220);

            // 1. Mover cursor hacia la tarjeta
            setFakeMouse({ x: targetX, y: targetY, visible: true, clicking: false, ripple: false });
            await new Promise(r => setTimeout(r, Math.round(650 * speedFactor)));
            if (!isMounted) return;

            // 2. Efecto de Clic
            setFakeMouse(prev => ({ ...prev, clicking: true, ripple: true }));
            await new Promise(r => setTimeout(r, 180));
            if (!isMounted) return;
            setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));

            // 3. Abrir Modal HSEQ garantizado
            const hseqId = el.getAttribute('data-hseq-id');
            const hseqIdx = el.getAttribute('data-hseq-index');
            const hseqItem = (hseqRef.current || []).find(it => String(it.id) === String(hseqId)) || (hseqRef.current || [])[hseqIdx] || (hseqRef.current || [])[i];
            if (setHseqModalRef.current && hseqItem) {
              setHseqModalRef.current(hseqItem);
            }

            // Esperar que el modal monte y ejecute el scroll automático hasta visualizar la imagen completa
            await new Promise(r => setTimeout(r, 380));
            if (!isMounted) return;

            const modalEl = document.getElementById('hseq-modal-content');
            await autoScrollModalContent(modalEl, speedFactor);
            if (!isMounted) return;

            // 4. Cerrar Modal
            if (setHseqModalRef.current) setHseqModalRef.current(null);
            await new Promise(r => setTimeout(r, Math.round(500 * speedFactor)));
            if (!isMounted) return;
          }
        }

        // --- SOLO CUANDO TERMINA DE VERSE LA ÚLTIMA TARJETA Y SU MODAL ---
        if (!isMounted) return;
        await new Promise(r => setTimeout(r, 600));
        if (!isMounted) return;
        if (goToStepRef.current) {
          const next = getNextAvailableStepRef.current ? getNextAvailableStepRef.current(3) : 4;
          goToStepRef.current(next);
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
  }, [currentStep, transitioningToStep, isTVMode, isLivePreview, overrideStep, speedFactor]);

  // 3. Autoplay para Convenios Compensar (Paso 6)
  useEffect(() => {
    if (currentStep !== 6 || transitioningToStep !== null || !isTVMode || isLivePreview || (overrideStep !== null && overrideStep !== undefined)) {
      setFakeMouse(prev => ({ ...prev, visible: false, clicking: false, ripple: false }));
      if (setConvenioModalRef.current) setConvenioModalRef.current(null);
      return;
    }

    let isMounted = true;

    const runConveniosSequence = async () => {
      try {
        // Esperar que la animación de entrada se complete
        await new Promise(r => setTimeout(r, Math.round(1000 * speedFactor)));
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
          await new Promise(r => setTimeout(r, 1200));
          if (!isMounted) return;
          if (goToStepRef.current) {
            const next = getNextAvailableStepRef.current ? getNextAvailableStepRef.current(6) : 0;
            goToStepRef.current(next);
          }
          return;
        }

        for (let i = 0; i < allCards.length; i++) {
          if (!isMounted) return;
          const el = allCards[i];

          if (el) {
            const rect = el.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + Math.min(rect.height / 2, 220);

            // 1. Mover cursor hacia la tarjeta
            setFakeMouse({ x: targetX, y: targetY, visible: true, clicking: false, ripple: false });
            await new Promise(r => setTimeout(r, Math.round(650 * speedFactor)));
            if (!isMounted) return;

            // 2. Efecto de Clic
            setFakeMouse(prev => ({ ...prev, clicking: true, ripple: true }));
            await new Promise(r => setTimeout(r, 180));
            if (!isMounted) return;
            setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));

            // 3. Abrir Modal de Convenio garantizado
            const convId = el.getAttribute('data-convenio-id');
            const convIdx = el.getAttribute('data-convenio-index');
            const convItem = (conveniosRef.current || []).find(it => String(it.id) === String(convId)) || (conveniosRef.current || [])[convIdx] || (conveniosRef.current || [])[i];
            if (setConvenioModalRef.current && convItem) {
              setConvenioModalRef.current(convItem);
            }

            // Esperar que el modal monte y ejecute el scroll automático hasta visualizar la imagen completa
            await new Promise(r => setTimeout(r, 380));
            if (!isMounted) return;

            const modalEl = document.getElementById('convenio-modal-content');
            await autoScrollModalContent(modalEl, speedFactor);
            if (!isMounted) return;

            // 4. Cerrar Modal
            if (setConvenioModalRef.current) setConvenioModalRef.current(null);
            await new Promise(r => setTimeout(r, Math.round(500 * speedFactor)));
            if (!isMounted) return;
          }
        }

        // --- SOLO CUANDO TERMINA DE VERSE LA ÚLTIMA TARJETA Y SU MODAL ---
        if (!isMounted) return;
        await new Promise(r => setTimeout(r, 600));
        if (!isMounted) return;
        if (goToStepRef.current) {
          const next = getNextAvailableStepRef.current ? getNextAvailableStepRef.current(6) : 0;
          goToStepRef.current(next);
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
  }, [currentStep, transitioningToStep, isTVMode, isLivePreview, overrideStep, speedFactor]);

  return {
    fakeMouse,
    setFakeMouse
  };
}
