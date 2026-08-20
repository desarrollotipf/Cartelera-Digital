const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  },
  timeout: 8000
});

// Noticias de respaldo oficiales del sector avícola (Fenavi / Pollo Fiesta)
const FALLBACK_NEWS = [
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
    title: "El consumo de pollo y huevo en Colombia alcanza cifras récord de preferencia",
    link: "https://fenavi.org",
    pubDate: new Date().toISOString(),
    contentSnippet: "Estudios nutricionales confirman el alto valor proteico y la preferencia de las familias colombianas por productos avícolas frescos y certificados."
  },
  {
    title: "Pollo Fiesta S.A. reafirma su compromiso con la excelencia operativa y el bienestar laboral",
    link: "https://pollofiesta.com",
    pubDate: new Date().toISOString(),
    contentSnippet: "Programas continuos de capacitación en HSEQ y gestión humana fortalecen la calidad de vida de todos los colaboradores en plantas y centros de distribución."
  }
];

const FALLBACK_WEATHER = {
  current_weather: {
    temperature: 19,
    windspeed: 12,
    weathercode: 1,
    time: new Date().toISOString(),
    is_day: 1
  },
  hourly: {
    time: [new Date().toISOString().substring(0, 13) + ":00"],
    precipitation_probability: [15]
  }
};

// In-memory cache
const cache = {
  weather: { data: null, lastFetch: 0 },
  dollar: { data: null, lastFetch: 0 },
  news: { data: null, lastFetch: 0 }
};

const WEATHER_CACHE_TIME = 15 * 60 * 1000; // 15 minutos
const DOLLAR_CACHE_TIME = 60 * 60 * 1000;  // 1 hora
const NEWS_CACHE_TIME = 20 * 60 * 1000;    // 20 minutos

// Open-Meteo API Bogotá (4.6097, -74.0817)
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=4.6097&longitude=-74.0817&current_weather=true&hourly=precipitation_probability&timezone=America%2FBogota&forecast_days=1';
const DOLLAR_API_URL = 'https://open.er-api.com/v6/latest/USD';
const NEWS_RSS_URL = 'https://news.google.com/rss/search?q=fenavi+colombia+OR+avicultura+colombia&hl=es-419&gl=CO&ceid=CO:es-419';

// GET /api/external/weather
router.get('/weather', async (req, res) => {
  try {
    const now = Date.now();
    if (cache.weather.data && (now - cache.weather.lastFetch < WEATHER_CACHE_TIME)) {
      return res.json({ success: true, fromCache: true, data: cache.weather.data });
    }

    const response = await fetch(WEATHER_API_URL, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error(`HTTP ${response.status} from weather service`);
    
    const data = await response.json();
    cache.weather.data = data;
    cache.weather.lastFetch = now;

    res.json({ success: true, fromCache: false, data });
  } catch (error) {
    console.error(' [Weather Service Notice]:', error.message);
    const data = cache.weather.data || FALLBACK_WEATHER;
    res.json({ success: true, fromCache: true, fallback: true, data });
  }
});

// GET /api/external/dollar
router.get('/dollar', async (req, res) => {
  try {
    const now = Date.now();
    if (cache.dollar.data && (now - cache.dollar.lastFetch < DOLLAR_CACHE_TIME)) {
      return res.json({ success: true, fromCache: true, data: cache.dollar.data });
    }

    const response = await fetch(DOLLAR_API_URL, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Failed to fetch dollar rate');
    
    const data = await response.json();
    cache.dollar.data = data;
    cache.dollar.lastFetch = now;

    res.json({ success: true, fromCache: false, data });
  } catch (error) {
    console.error(' [Dollar Service Notice]:', error.message);
    res.json({ success: true, rates: { COP: 4150 }, fallback: true });
  }
});

// GET /api/external/news
router.get('/news', async (req, res) => {
  try {
    const now = Date.now();
    if (cache.news.data && (now - cache.news.lastFetch < NEWS_CACHE_TIME)) {
      return res.json({ success: true, fromCache: true, data: cache.news.data });
    }

    const feed = await parser.parseURL(NEWS_RSS_URL);
    
    const items = (feed?.items || []).slice(0, 15).map(item => ({
      title: item.title?.replace(/ - [^-]+$/, '') || item.title,
      link: item.link,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet || item.content || 'Actualidad del sector avícola e institucional.'
    }));

    const resultData = items.length > 0 ? items : FALLBACK_NEWS;
    cache.news.data = resultData;
    cache.news.lastFetch = now;

    res.json({ success: true, fromCache: false, data: resultData });
  } catch (error) {
    console.error(' [News RSS Service Notice]:', error.message);
    const resultData = cache.news.data || FALLBACK_NEWS;
    res.json({ success: true, fromCache: true, fallback: true, data: resultData });
  }
});

module.exports = router;
