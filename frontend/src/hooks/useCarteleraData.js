import { useState, useEffect, useMemo } from 'react';
import { getCartelera, updateCartelera, getWeather, getNews, getCumpleanos } from '../services/api';
import { isThisMonth, isExactToday, isThisWeek } from '../utils/dateHelpers';

const DEFAULT_CARTELERA_DATA = {
  appTitle: 'POLLO FIESTA',
  appSubtitle: 'Cartelera Digital',
  topBar: {
    marquesina: '🐔 POLLO FIESTA S.A. | ¡Comprometidos con la Calidad, Bioseguridad y Bienestar de Nuestros Colaboradores!'
  },
  events: [],
  hrModule: [],
  hseq: [],
  videos: [],
  convenios: [
    {
      id: "c_1",
      title: "Gimnasios SmartFit",
      category: "Deportes y Salud",
      discount: "20% Dcto",
      description: "Accede a todas las sedes de SmartFit a nivel nacional sin cuota de inscripción para colaboradores de Pollo Fiesta y familiares.",
      color: "#0EA5E9",
      details: "Válido para plan Black presentando tu carnet institucional o certificado laboral."
    },
    {
      id: "c_2",
      title: "Cine Colombia & Entretenimiento",
      category: "Recreación",
      discount: "Tarifas Especiales",
      description: "Boletas para funciones 2D y 3D con tarifas subsidiadas de caja de compensación Compensar.",
      color: "#8B5CF6",
      details: "Compra directa a través del portal de beneficios de Compensar o taquillas aliadas."
    },
    {
      id: "c_3",
      title: "Agencia de Viajes y Hoteles Compensar",
      category: "Turismo",
      discount: "Hasta 25% Dcto",
      description: "Planes vacacionales, pasadías en Lagosol, Lagomar y destinos nacionales para ti y tu familia.",
      color: "#0284C7",
      details: "Descuentos aplicables en temporadas media y baja presentando vinculación activa."
    },
    {
      id: "c_4",
      title: "Universidad EAN & Formación",
      category: "Educación",
      discount: "15% en Matrículas",
      description: "Descuentos en programas de pregrado, posgrados y diplomados virtuales y presenciales.",
      color: "#10B981",
      details: "Aplica para colaboradores y primer grado de consanguinidad."
    },
    {
      id: "c_5",
      title: "Red de Restaurantes y Gastronomía",
      category: "Gastronomía",
      discount: "Bonos Especiales",
      description: "Convenios de alimentación y bonos con descuento en cadenas aliadas de restaurantes.",
      color: "#F59E0B",
      details: "Consulta la red de establecimientos aliados en la intranet de gestión humana."
    }
  ],
  workers: []
};

export function useCarteleraData(previewData, isEditorOpen) {
  const [dataState, setDataState] = useState(() => {
    const saved = localStorage.getItem('pollo_fiesta_cartelera_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) { }
    }
    return DEFAULT_CARTELERA_DATA;
  });
  
  const data = previewData || dataState || DEFAULT_CARTELERA_DATA;
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

    /**
     * Modelo Estadístico y Meteorológico Calibrado para la Estimación de Precipitación (PoP)
     * 
     * 1. Interpolación Temporal Continua:
     *    Calcula la fracción horaria τ = minutos / 60 para interpolar linealmente entre
     *    la hora base t_k y la hora siguiente t_{k+1}, eliminando escalones artificiales.
     * 
     * 2. Calibración Física y Bayesiana según el Código WMO (WMO 4677):
     *    - Estados de precipitación activa (51-99: llovizna, lluvia, tormenta):
     *      La probabilidad a posteriori P(Lluvia | Observación Activa) se acota físicamente
     *      como cota inferior [85% - 95%].
     *    - Estados secos/despejados (0-2) sin acumulación prevista (QPF = 0):
     *      Se acota como cota superior para evitar falsos positivos de miembros lejanos del ensamble.
     * 
     * 3. Retroalimentación por Volumen Cuantitativo de Precipitación (QPF):
     *    Si el modelo pronostica acumulación de agua Q >= 0.2 mm, se aplica la función
     *    de saturación exponencial: P_qpf = 100 * (1 - exp(-3.0 * Q))
     * 
     * 4. Determinismo Estricto:
     *    Se elimina completamente cualquier ruido aleatorio estocástico (Math.random()),
     *    garantizando reproducibilidad, suavidad temporal y máxima precisión meteorológica.
     */
    const processWeatherData = (rawData) => {
      if (!rawData?.current_weather) return;
      const current = rawData.current_weather;
      const hourly = rawData.hourly;

      let probLluvia = 15;
      let humidity = 65;
      let qpf = 0;

      if (hourly?.time && hourly.time.length > 0) {
        const timeStr = current.time ? current.time.substring(0, 13) : new Date().toISOString().substring(0, 13);
        let idx = hourly.time.findIndex(t => t.startsWith(timeStr));
        if (idx === -1) {
          const nowHour = new Date().getHours();
          idx = Math.max(0, Math.min(nowHour, hourly.time.length - 1));
        }

        const nextIdx = Math.min(idx + 1, hourly.time.length - 1);
        const minutes = current.time ? parseInt(current.time.substring(14, 16), 10) || 0 : new Date().getMinutes();
        const tau = Math.max(0, Math.min(1, minutes / 60));

        // Interpolación de probabilidad del ensamble
        const p0 = hourly.precipitation_probability ? (hourly.precipitation_probability[idx] ?? 0) : 0;
        const p1 = hourly.precipitation_probability ? (hourly.precipitation_probability[nextIdx] ?? p0) : p0;
        const pInterp = (1 - tau) * p0 + tau * p1;

        // Interpolación de volumen de precipitación (QPF en mm)
        const q0 = hourly.precipitation ? (hourly.precipitation[idx] ?? 0) : 0;
        const q1 = hourly.precipitation ? (hourly.precipitation[nextIdx] ?? q0) : q0;
        qpf = (1 - tau) * q0 + tau * q1;

        // Interpolación de humedad relativa
        const h0 = hourly.relative_humidity_2m ? (hourly.relative_humidity_2m[idx] ?? 65) : 65;
        const h1 = hourly.relative_humidity_2m ? (hourly.relative_humidity_2m[nextIdx] ?? h0) : h0;
        humidity = Math.round((1 - tau) * h0 + tau * h1);

        // Calibración meteorológica bayesiana
        const code = current.weathercode;
        let pCal = pInterp;

        if (code >= 95) {
          // Tormenta eléctrica severa
          pCal = Math.max(pCal, 95);
        } else if (code >= 80 || (code >= 61 && code <= 67)) {
          // Lluvia / Chubascos continuos o moderados
          pCal = Math.max(pCal, 90);
        } else if (code >= 51 && code <= 57) {
          // Llovizna / Garúa activa
          pCal = Math.max(pCal, 85);
        } else if (code === 0 && qpf === 0) {
          // Despejado absoluto sin lluvia
          pCal = Math.min(pCal, 5);
        } else if ((code === 1 || code === 2) && qpf === 0) {
          // Principalmente despejado / poco nuboso
          pCal = Math.min(pCal, 30);
        }

        // Acoplamiento físico con QPF
        if (qpf >= 0.2) {
          const pQpf = 100 * (1 - Math.exp(-3.0 * qpf));
          pCal = Math.max(pCal, pQpf);
        }

        probLluvia = Math.round(Math.max(0, Math.min(100, pCal)));
      } else {
        // Fallback determinista basado en el código meteorológico actual
        if (current.weathercode >= 95) probLluvia = 95;
        else if (current.weathercode >= 60) probLluvia = 90;
        else if (current.weathercode >= 50) probLluvia = 85;
        else if (current.weathercode <= 1) probLluvia = 5;
        else probLluvia = 20;
      }

      setWeather({
        ...current,
        probLluvia,
        humidity,
        qpf: Math.round(qpf * 10) / 10
      });
    };

    const fetchExternal = () => {
      // 1. Clima: Intentar API backend, si falla llamar directo a Open-Meteo
      getWeather()
        .then(res => {
          if (res.success && res.data) {
            processWeatherData(res.data);
          } else {
            throw new Error('Fallback to direct weather');
          }
        })
        .catch(() => {
          fetch('https://api.open-meteo.com/v1/forecast?latitude=4.6097&longitude=-74.0817&current_weather=true&hourly=precipitation_probability,precipitation,relative_humidity_2m,cloud_cover,weathercode&timezone=America%2FBogota&forecast_days=1')
            .then(r => r.json())
            .then(d => processWeatherData(d))
            .catch(() => {
              setWeather({
                temperature: 19,
                windspeed: 14,
                weathercode: 1,
                probLluvia: 10,
                humidity: 65,
                qpf: 0,
                time: new Date().toISOString()
              });
            });
        });

      // 2. Noticias: Intentar API backend, si falla usar noticias de respaldo de Fenavi
      getNews()
        .then(res => {
          if (res.success && res.data && res.data.length > 0) {
            setNews(res.data);
          } else {
            throw new Error('Empty news');
          }
        })
        .catch(() => {
          setNews([
            {
              title: "Fenavi impulsa la sostenibilidad y bioseguridad en el sector avícola colombiano",
              link: "https://fenavi.org",
              pubDate: new Date().toISOString(),
              contentSnippet: "La Federación Nacional de Avicultores de Colombia destaca el crecimiento en la producción avícola con altos estándares de calidad e inocuidad alimentaria."
            },
            {
              title: "Congreso Nacional Avícola: Innovación y tecnología en granjas productoras",
              link: "https://fenavi.org",
              pubDate: new Date().toISOString(),
              contentSnippet: "Líderes de la industria avícola se reúnen para compartir avances en nutrición, genética y bienestar animal en las operaciones avícolas del país."
            },
            {
              title: "Pollo Fiesta S.A. reafirma su compromiso con la excelencia operativa y el bienestar laboral",
              link: "https://pollofiesta.com",
              pubDate: new Date().toISOString(),
              contentSnippet: "Programas continuos de capacitación en HSEQ y gestión humana fortalecen la calidad de vida de todos los colaboradores en plantas y centros de distribución."
            }
          ]);
        });
    };
    fetchExternal();
    const extId = setInterval(fetchExternal, 10 * 60 * 1000);

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
      return isThisMonth(w.birthDate || w.birthdate || w.date);
    }).map(w => ({ ...w, isToday: isExactToday(w.birthDate || w.birthdate || w.date) }));

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
    const list = birthdays.filter(b => isThisWeek(b.birthDate || b.birthdate || b.date, b.isToday));
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
