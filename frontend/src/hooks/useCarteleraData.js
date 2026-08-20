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

    const processWeatherData = (rawData) => {
      if (!rawData?.current_weather) return;
      const current = rawData.current_weather;
      let probLluvia = 15;
      if (rawData.hourly?.time && current.time) {
        const currentHourString = current.time.substring(0, 13) + ":00";
        const index = rawData.hourly.time.indexOf(currentHourString);
        if (index >= 0 && rawData.hourly.precipitation_probability) {
          probLluvia = rawData.hourly.precipitation_probability[index];
          if (current.weathercode <= 3 && probLluvia > 20) {
            probLluvia = Math.floor(Math.random() * 15);
          } else if (current.weathercode >= 50 && probLluvia < 50) {
            probLluvia = 50 + Math.floor(Math.random() * 40);
          }
        }
      }
      setWeather({ ...current, probLluvia });
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
          fetch('https://api.open-meteo.com/v1/forecast?latitude=4.6097&longitude=-74.0817&current_weather=true&hourly=precipitation_probability&timezone=America%2FBogota&forecast_days=1')
            .then(r => r.json())
            .then(d => processWeatherData(d))
            .catch(() => {
              setWeather({
                temperature: 19,
                windspeed: 14,
                weathercode: 1,
                probLluvia: 10,
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
