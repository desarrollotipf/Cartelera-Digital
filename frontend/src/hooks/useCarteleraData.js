import { useState, useEffect, useMemo } from 'react';
import { getCartelera, updateCartelera, getWeather, getNews, getCumpleanos } from '../services/api';
import { isThisMonth, isExactToday, isThisWeek } from '../utils/dateHelpers';

export function useCarteleraData(previewData, isEditorOpen) {
  const [dataState, setDataState] = useState(() => {
    const saved = localStorage.getItem('pollo_fiesta_cartelera_data');
    if (saved) { try { return JSON.parse(saved); } catch (_) { } }
    return null;
  });
  
  const data = previewData || dataState;
  const setData = setDataState;

  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState(null);
  const [dbBirthdays, setDbBirthdays] = useState([]);

  // Initial fetch from API
  useEffect(() => {
    getCartelera()
      .then(res => { if (res.success && res.data) setData(res.data); })
      .catch(() => { });

    getCumpleanos()
      .then(res => { if (res.success && res.data) setDbBirthdays(res.data); })
      .catch(() => { });

    const fetchExternal = () => {
      getWeather()
        .then(res => { if (res.success && res.data?.current_weather) setWeather(res.data.current_weather); })
        .catch(() => { });

      getNews()
        .then(res => { if (res.success && res.data) setNews(res.data); })
        .catch(() => { });
    };
    fetchExternal();
    const extId = setInterval(fetchExternal, 10 * 60 * 1000); // 10 minutes on frontend

    return () => clearInterval(extId);
  }, []);

  // Auto-sync every 30s when editor is closed
  useEffect(() => {
    const id = setInterval(() => {
      if (!isEditorOpen) {
        getCartelera()
          .then(res => {
            // Note: In a real app we'd want to be careful with JSON.stringify for deep equality, but keeping original logic
            if (res.success && res.data && JSON.stringify(res.data) !== JSON.stringify(dataState)) {
              setData(res.data);
            }
          })
          .catch(() => { });
        getCumpleanos()
          .then(res => {
            if (res.success && res.data) {
              // Comparación liviana: longitud o algún id distinto — evita JSON.stringify costoso
              const changed =
                res.data.length !== dbBirthdays.length ||
                res.data.some((r, i) => r.personId !== dbBirthdays[i]?.personId);
              if (changed) setDbBirthdays(res.data);
            }
          })
          .catch(() => { });
      }
    }, 30000);
    return () => clearInterval(id);
  }, [isEditorOpen, dataState, dbBirthdays]);

  const handleSaveData = async (newData) => {
    setData(newData);
    localStorage.setItem('pollo_fiesta_cartelera_data', JSON.stringify(newData));
    try { await updateCartelera(newData); } catch (_) { }
  };

  const handleResetData = () => {
    localStorage.removeItem('pollo_fiesta_cartelera_data');
    getCartelera()
      .then(res => { if (res.success && res.data) setData(res.data); })
      .catch(() => { });
  };

  // Memos for birthdays
  const birthdays = useMemo(() => {
    // Cumpleaños manuales (ingresados en el editor): filtrar por mes actual
    const manual = (data?.workers || []).filter(w => {
      if (w.type === 'spotlight') return false;
      return isThisMonth(w.birthdate || w.date);
    }).map(w => ({ ...w, isToday: isExactToday(w.birthdate || w.date) }));

    // Cumpleaños de la BD: la query SQL ya filtra por mes, no es necesario volver a filtrar.
    // Usamos el campo ISO 'birthDate' para calcular isToday de forma precisa.
    const dbFiltered = (dbBirthdays || []).map(w => ({
      ...w,
      isToday: isExactToday(w.birthDate || w.birthdate || w.date)
    }));

    return [...dbFiltered, ...manual];
  }, [data, dbBirthdays]);

  const todayBirthdays = useMemo(() => {
    return birthdays.filter(b => b.isToday);
  }, [birthdays]);

  const weeklyBirthdays = useMemo(() => {
    const list = birthdays.filter(b => isThisWeek(b.birthdate || b.date, b.isToday));
    if (list.length === 0 && birthdays.length > 0) {
      return birthdays.slice(0, 5); // Respaldo inteligente si no hay ninguno exactamente esta semana
    }
    return list;
  }, [birthdays]);

  const spotlight = useMemo(() => (data?.workers || []).find(w => w.type === 'spotlight'), [data]);
  const hrItems = data?.hrModule || [];

  return {
    data,
    setData,
    weather,
    news,
    dbBirthdays,
    birthdays,
    todayBirthdays,
    weeklyBirthdays,
    spotlight,
    hrItems,
    handleSaveData,
    handleResetData
  };
}
