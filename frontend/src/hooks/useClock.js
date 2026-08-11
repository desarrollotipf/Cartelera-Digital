import { useState, useEffect } from 'react';

export function useClock() {
  const [clock, setClock] = useState({ time: '--:--:-- --', date: 'Cargando fecha...' });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const timeStr = now
        .toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
        .toUpperCase();
      let dateStr = now.toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
      setClock({ time: timeStr, date: dateStr });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return clock;
}
