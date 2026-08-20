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

  const hseqRef = useRef(hseqItems);
  const hrRef = useRef(hrItems);

  useEffect(() => {
    hseqRef.current = hseqItems;
  }, [hseqItems]);

  useEffect(() => {
    hrRef.current = hrItems;
  }, [hrItems]);

  // Autoplay para HSEQ (Paso 3)
  useEffect(() => {
    if (currentStep !== 3 || !isTVMode || isLivePreview) return;
    const items = hseqRef.current;
    if (items.length === 0) {
      if (overrideStep !== 3) goToStep(4);
      return;
    }

    let isActive = true;
    let currentIndex = 0;

    const playNext = async () => {
      if (!isActive) return;
      const currentList = hseqRef.current;

      if (currentIndex >= currentList.length) {
        setFakeMouse(prev => ({ ...prev, visible: false }));
        if (overrideStep !== 3) goToStep(4);
        return;
      }

      const current = currentList[currentIndex];
      const elId = `hseq-card-${current.id || currentIndex}`;
      const el = document.getElementById(elId);

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 600));
        if (!isActive) return;

        const rect = el.getBoundingClientRect();
        setFakeMouse({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, visible: true, clicking: false, ripple: false });
        await new Promise(r => setTimeout(r, 600));
        if (!isActive) return;

        setFakeMouse(prev => ({ ...prev, clicking: true, ripple: true }));
        await new Promise(r => setTimeout(r, 150));
        setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));

        if (setSelectedHseq) setSelectedHseq(current);
        await new Promise(r => setTimeout(r, 4000));
        if (!isActive) return;

        if (setSelectedHseq) setSelectedHseq(null);
      }

      await new Promise(r => setTimeout(r, 600));
      currentIndex++;
      playNext();
    };

    const timer = setTimeout(() => { playNext(); }, 1500);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [currentStep, isTVMode, isLivePreview, overrideStep, goToStep, setSelectedHseq]);

  // Autoplay para HR (Paso 1)
  useEffect(() => {
    if (currentStep !== 1 || !isTVMode || isLivePreview) return;
    const items = hrRef.current;
    if (items.length === 0) {
      if (overrideStep !== 1) goToStep(2);
      return;
    }

    let isActive = true;
    let currentIndex = 0;

    const playNext = async () => {
      if (!isActive) return;
      const currentList = hrRef.current;

      if (currentIndex >= currentList.length) {
        setFakeMouse(prev => ({ ...prev, visible: false }));
        if (overrideStep !== 1) goToStep(2);
        return;
      }

      const current = currentList[currentIndex];
      const elId = `hr-card-${current.id || currentIndex}`;
      const el = document.getElementById(elId);

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 600));
        if (!isActive) return;

        const rect = el.getBoundingClientRect();
        setFakeMouse({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, visible: true, clicking: false, ripple: false });
        await new Promise(r => setTimeout(r, 600));
        if (!isActive) return;

        setFakeMouse(prev => ({ ...prev, clicking: true, ripple: true }));
        await new Promise(r => setTimeout(r, 150));
        setFakeMouse(prev => ({ ...prev, clicking: false, ripple: false }));

        if (setSelectedHr) setSelectedHr(current);
        await new Promise(r => setTimeout(r, 4500));
        if (!isActive) return;

        if (setSelectedHr) setSelectedHr(null);
      }

      await new Promise(r => setTimeout(r, 500));
      currentIndex++;
      playNext();
    };

    const timer = setTimeout(() => { playNext(); }, 1500);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [currentStep, isTVMode, isLivePreview, overrideStep, goToStep, setSelectedHr]);

  return {
    fakeMouse,
    setFakeMouse
  };
}
