const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');
const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
  timeout: 5000
});

// Simple in-memory cache
const cache = {
  weather: { data: null, lastFetch: 0 },
  dollar: { data: null, lastFetch: 0 },
  news: { data: null, lastFetch: 0 }
};

const WEATHER_CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const DOLLAR_CACHE_TIME = 60 * 60 * 1000; // 1 hour
const NEWS_CACHE_TIME = 30 * 60 * 1000; // 30 minutes

// Open-Meteo API for Bogota (Latitude: 4.6097, Longitude: -74.0817)
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=4.6097&longitude=-74.0817&current_weather=true';
// ExchangeRate-API for USD to COP
const DOLLAR_API_URL = 'https://open.er-api.com/v6/latest/USD';
// RSS Feed for Fenavi Colombia News
const NEWS_RSS_URL = 'https://news.google.com/rss/search?q=fenavi+colombia&hl=es-419&gl=CO&ceid=CO:es-419';

router.get('/weather', async (req, res) => {
  try {
    const now = Date.now();
    if (cache.weather.data && (now - cache.weather.lastFetch < WEATHER_CACHE_TIME)) {
      return res.json({ success: true, fromCache: true, data: cache.weather.data });
    }

    const response = await fetch(WEATHER_API_URL);
    if (!response.ok) throw new Error('Failed to fetch weather');
    
    const data = await response.json();
    cache.weather.data = data;
    cache.weather.lastFetch = now;

    res.json({ success: true, fromCache: false, data });
  } catch (error) {
    console.error('Weather API Error:', error.message);
    // Return stale cache if available, else error
    if (cache.weather.data) {
      return res.json({ success: true, fromCache: true, stale: true, data: cache.weather.data });
    }
    res.status(500).json({ success: false, message: 'Error fetching weather' });
  }
});

router.get('/dollar', async (req, res) => {
  try {
    const now = Date.now();
    if (cache.dollar.data && (now - cache.dollar.lastFetch < DOLLAR_CACHE_TIME)) {
      return res.json({ success: true, fromCache: true, data: cache.dollar.data });
    }

    const response = await fetch(DOLLAR_API_URL);
    if (!response.ok) throw new Error('Failed to fetch dollar rate');
    
    const data = await response.json();
    cache.dollar.data = data;
    cache.dollar.lastFetch = now;

    res.json({ success: true, fromCache: false, data });
  } catch (error) {
    console.error('Dollar API Error:', error.message);
    if (cache.dollar.data) {
      return res.json({ success: true, fromCache: true, stale: true, data: cache.dollar.data });
    }
    res.status(500).json({ success: false, message: 'Error fetching dollar rate' });
  }
});

router.get('/news', async (req, res) => {
  try {
    const now = Date.now();
    if (cache.news.data && (now - cache.news.lastFetch < NEWS_CACHE_TIME)) {
      return res.json({ success: true, fromCache: true, data: cache.news.data });
    }

    const feedResponse = await fetch(NEWS_RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!feedResponse.ok) throw new Error('Failed to fetch RSS');
    const xml = await feedResponse.text();
    const feed = await parser.parseString(xml);

    // Filter only items that mention 'fenavi' in title or snippet
    const FENAVI_KEYWORDS = ['fenavi'];
    const filtered = feed.items.filter(item => {
      const text = ((item.title || '') + ' ' + (item.contentSnippet || '')).toLowerCase();
      return FENAVI_KEYWORDS.some(kw => text.includes(kw));
    });

    // Take up to 20 fenavi news items
    const data = filtered.slice(0, 20).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet
    }));

    cache.news.data = data;
    cache.news.lastFetch = now;

    res.json({ success: true, fromCache: false, data });
  } catch (error) {
    console.error('News API Error:', error.message);
    if (cache.news.data) {
      return res.json({ success: true, fromCache: true, stale: true, data: cache.news.data });
    }
    res.status(500).json({ success: false, message: 'Error fetching news' });
  }
});

module.exports = router;
