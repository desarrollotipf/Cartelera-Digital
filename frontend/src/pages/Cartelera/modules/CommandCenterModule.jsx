import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  CloudSun, Sun, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning,
  MapPin, Wind, Newspaper, Droplets 
} from 'lucide-react';

function getWeatherDetails(code) {
  // WMO Weather interpretation codes
  if (code === 0) return { label: 'Despejado / Soleado', icon: <Sun size={80} color="#fbbf24" strokeWidth={2} />, color: '#38bdf8' };
  if (code === 1 || code === 2 || code === 3) return { label: 'Parcialmente Nublado', icon: <CloudSun size={80} color="#38bdf8" strokeWidth={2} />, color: '#94a3b8' };
  if (code === 45 || code === 48) return { label: 'Niebla', icon: <CloudFog size={80} color="#94a3b8" strokeWidth={2} />, color: '#64748b' };
  if (code === 51 || code === 53 || code === 55) return { label: 'Llovizna', icon: <CloudDrizzle size={80} color="#60a5fa" strokeWidth={2} />, color: '#60a5fa' };
  if (code === 61 || code === 63 || code === 65) return { label: 'Lluvia', icon: <CloudRain size={80} color="#3b82f6" strokeWidth={2} />, color: '#3b82f6' };
  if (code === 71 || code === 73 || code === 75) return { label: 'Nieve', icon: <CloudSnow size={80} color="#e0f2fe" strokeWidth={2} />, color: '#e0f2fe' };
  if (code === 80 || code === 81 || code === 82) return { label: 'Chubascos', icon: <CloudRain size={80} color="#2563eb" strokeWidth={2} />, color: '#2563eb' };
  if (code === 95 || code === 96 || code === 99) return { label: 'Tormenta Eléctrica', icon: <CloudLightning size={80} color="#818cf8" strokeWidth={2} />, color: '#4f46e5' };
  return { label: 'Despejado', icon: <Sun size={80} color="#fbbf24" strokeWidth={2} />, color: '#38bdf8' };
}

const CommandCenterModule = ({
  weather,
  news
}) => {
  const commandRef = useRef(null);

  return (
    <motion.div
      key="stage-command-motion"
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      className="block-section"
      style={{ cursor: 'default', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.5rem', width: '100%', willChange: 'transform' }}
    >
      <div className="block-header" style={{ zIndex: 20, marginBottom: '1.5rem' }}>
        <div className="block-title-group">
          <span className="block-icon" style={{ display: 'flex', alignItems: 'center' }}><CloudSun size={38} color="#0ea5e9" strokeWidth={2.4} /></span>
          <div>
            <div className="block-title" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Clima & Noticias</div>
            <div className="block-subtitle">Noticias del sector avícola colombiano vía FENAVI y actualidad meteorológica</div>
          </div>
        </div>
      </div>

      <div className="command-center-stage" ref={commandRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* DIVISIÓN DE ESCENARIO (30% Clima en Vivo / 70% Noticias Última Hora) */}
        <div className="command-center-body-grid" style={{ flex: 1, minHeight: 0, marginTop: 0 }}>
          {/* COLUMNA LATERAL (30%): Clima Laboral y Meteorológico en Vivo */}
          <div className="kpi-stage-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
            {weather ? (() => {
              const details = getWeatherDetails(weather.weathercode);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', position: 'relative' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sun size={22} color="#fbbf24" strokeWidth={2.2} /> Clima Actual
                    </span>
                  </div>
                  <div className="weather-icon-float" style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.25))' }}>
                    {details.icon}
                  </div>
                  <h2 style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.5rem 0 0 0', fontFamily: "'Outfit', sans-serif", textShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                    {Math.round(weather.temperature)}°C
                  </h2>
                  <p style={{ fontSize: '1.7rem', color: 'var(--text-primary)', fontWeight: 800, margin: '0.3rem 0 1.5rem 0' }}>
                    {details.label}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: 'auto' }}>
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '0.8rem 1.2rem', borderRadius: 'var(--radius-lg)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                      <MapPin size={18} color="#f43f5e" /> Bogotá, Colombia
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '0.8rem 1.2rem', borderRadius: 'var(--radius-lg)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Wind size={18} color="#38bdf8" /> {weather.windspeed} km/h</span>
                      <span style={{ margin: '0 0.3rem', color: 'var(--border)' }}>|</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><CloudRain size={18} color="#38bdf8" /> Prob. Lluvia: {weather.probLluvia !== undefined ? `${weather.probLluvia}%` : 'N/A'}</span>
                      {weather.humidity !== undefined && (
                        <>
                          <span style={{ margin: '0 0.3rem', color: 'var(--border)' }}>|</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Droplets size={18} color="#38bdf8" /> Humedad: {weather.humidity}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', fontSize: '1.3rem', fontStyle: 'italic' }}>
                Cargando clima en vivo...
              </div>
            )}
          </div>

          {/* COLUMNA PRINCIPAL (70%): Última Hora Colombia Live Feed */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '1.75rem 2rem', overflow: 'hidden', boxShadow: '0 12px 35px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}><Newspaper size={32} color="#38bdf8" strokeWidth={2.2} /></span>
                <h3 style={{ fontSize: '1.65rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Noticias & Actualidad del Sector Avícola</h3>
              </div>
            </div>
            <div className="news-escalator-container">
              {news && news.length > 0 ? (
                <div className="news-escalator-track" style={{ '--escalator-speed': `${Math.max(30, news.length * 6)}s` }}>
                  {[...news, ...news].map((item, i) => (
                    <div
                      key={i}
                      className="broadcast-news-item"
                      style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', borderLeft: '6px solid var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', flexShrink: 0 }}
                    >
                      <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.5px' }}>FENAVI • SECTOR AVÍCOLA</div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0', lineHeight: 1.35 }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                        {item.contentSnippet}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '1.2rem', fontStyle: 'italic' }}>
                  Cargando titulares en vivo...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommandCenterModule;
