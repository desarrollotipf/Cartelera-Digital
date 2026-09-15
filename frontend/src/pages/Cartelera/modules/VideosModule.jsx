import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Video } from 'lucide-react';

const resolveMediaUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  const uploadIdx = trimmed.indexOf('/uploads/');
  if (uploadIdx !== -1) {
    return trimmed.substring(uploadIdx);
  }
  return trimmed;
};

const VideosModule = ({
  data,
  videoIndex,
  setVideoIndex,
  isDeckTransitioning,
  setIsDeckTransitioning,
  videoOrientations,
  setVideoOrientations,
  videosPlayedThisCycle,
  goToStep,
  getNextAvailableStep,
  isEditorOpen,
  isLivePreview,
  overrideStep,
  isTVMode,
  openEditor
}) => {
  // Registro de URLs de videos con fallos para excluirlos automáticamente
  const [failedUrls, setFailedUrls] = useState(new Set());
  const [currentVideoDuration, setCurrentVideoDuration] = useState(null);
  const [tiktokStreams, setTiktokStreams] = useState({});
  const lastEndedTimeRef = useRef(0);

  // Lista de videos limpios y funcionales
  const validVideos = useMemo(() => {
    return (data?.videos || [])
      .map(v => ({
        ...v,
        url: resolveMediaUrl(v?.url)
      }))
      .filter(v => v?.url && !v.url.includes('mov_bbb.mp4') && !v.url.includes('w3schools') && !failedUrls.has(v.url.trim()));
  }, [data?.videos, failedUrls]);

  const handleVideoEnded = useCallback(() => {
    // 1. Debounce guard: impedir ejecuciones duplicadas dentro de 2.5s (evita doble conteo por eventos superpuestos)
    const now = Date.now();
    if (now - lastEndedTimeRef.current < 2500) {
      console.log('[VideosModule] Invocación handleVideoEnded ignorada por debounce');
      return;
    }
    lastEndedTimeRef.current = now;

    // Si el editor está abierto o en modo vista previa, rotar solo dentro de videos sin salir del módulo
    if (isEditorOpen || isLivePreview || (overrideStep !== null && overrideStep !== undefined)) {
      if (validVideos.length > 1) {
        setIsDeckTransitioning(true);
        setCurrentVideoDuration(null);
        setVideoIndex(prev => (prev + 1) % validVideos.length);
      }
      return;
    }

    if (validVideos.length === 0) {
      goToStep(getNextAvailableStep ? getNextAvailableStep(5) : 6);
      return;
    }

    videosPlayedThisCycle.current += 1;
    const nextIndex = (videoIndex + 1) % validVideos.length;

    // Regla estricta:
    // Mínimo todos los que hayan si hay < 3 (ej. 1 o 2), exactamente 3 videos por ciclo si hay 3 o más
    const maxVideosThisCycle = Math.max(1, Math.min(validVideos.length, 3));
    console.log(`[VideosModule] Video finalizado con éxito. Progreso del ciclo: ${videosPlayedThisCycle.current}/${maxVideosThisCycle}`);

    if (videosPlayedThisCycle.current < maxVideosThisCycle && validVideos.length > 1) {
      // Si aún faltan videos por reproducir en este ciclo (ej: video 2 o 3), avanzar al siguiente video
      setCurrentVideoDuration(null);
      setIsDeckTransitioning(true);
      setVideoIndex(nextIndex);
    } else {
      // Cuando se completa la cuota de videos del ciclo (los 3 videos o todos los existentes), avanzar de módulo
      console.log(`[VideosModule] Cuota de ${maxVideosThisCycle} videos alcanzada en este ciclo. Pasando al siguiente módulo...`);
      videosPlayedThisCycle.current = 0;
      setCurrentVideoDuration(null);
      setVideoIndex(nextIndex);
      goToStep(getNextAvailableStep ? getNextAvailableStep(5) : 6);
    }
  }, [validVideos, isEditorOpen, isLivePreview, overrideStep, videoIndex, videosPlayedThisCycle, setVideoIndex, setIsDeckTransitioning, goToStep, getNextAvailableStep]);

  // Función para descartar videos que fallen SIN consumir cuota de videos reproducidos
  const markVideoAsFailed = useCallback((url) => {
    if (!url) return;
    console.warn('[VideosModule] Video no reproducible, omitiendo sin consumir cuota del ciclo:', url);
    setFailedUrls(prev => {
      const next = new Set(prev);
      next.add(url.trim());
      return next;
    });

    // Pasar de inmediato al siguiente video sin incrementar videosPlayedThisCycle
    if (validVideos.length > 1) {
      setCurrentVideoDuration(null);
      setIsDeckTransitioning(true);
      setVideoIndex(prev => (prev + 1) % validVideos.length);
    } else {
      goToStep(getNextAvailableStep ? getNextAvailableStep(5) : 6);
    }
  }, [validVideos, setVideoIndex, setIsDeckTransitioning, goToStep, getNextAvailableStep]);

  // Pre-resolución de stream MP4 para enlaces de TikTok
  useEffect(() => {
    if (validVideos.length === 0) return;
    const activeIdx = (videoIndex % validVideos.length);
    const activeVid = validVideos[activeIdx];
    if (!activeVid?.url) return;

    const safeUrl = activeVid.url;
    if (!safeUrl.includes('tiktok.com')) return;

    const match = safeUrl.match(/\/video\/(\d+)/) || safeUrl.match(/\/embed\/(?:v2\/)?(\d+)/) || safeUrl.match(/\/v\/(\d+)/);
    const tiktokId = match ? match[1] : '';
    if (!tiktokId || tiktokStreams[tiktokId]) return;

    let isMounted = true;
    fetch('https://www.tikwm.com/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ url: safeUrl, web: '1', hd: '1' })
    })
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data?.code === 0 && data?.data?.play) {
          const rawPlay = data.data.hdplay || data.data.play;
          const playUrl = rawPlay.startsWith('http') ? rawPlay : `https://www.tikwm.com${rawPlay}`;
          setTiktokStreams(prev => ({
            ...prev,
            [tiktokId]: { url: playUrl, duration: data.data.duration || 15 }
          }));
          if (data.data.duration) {
            setCurrentVideoDuration(data.data.duration);
          }
        }
      })
      .catch(err => {
        console.warn('[VideosModule] Fallback a iframe de TikTok:', err.message);
      });

    return () => { isMounted = false; };
  }, [videoIndex, validVideos, tiktokStreams]);

  // Watchdog de seguridad dinámico calibrado
  useEffect(() => {
    if (isEditorOpen || isLivePreview || (overrideStep !== null && overrideStep !== undefined) || !isTVMode) return;
    if (validVideos.length === 0) return;

    const activeIdx = videoIndex % validVideos.length;
    const activeVid = validVideos[activeIdx];
    const isTikTok = activeVid?.url?.includes('tiktok.com');

    // Duración máxima de espera:
    // - Si la duración es conocida (video HTML5 o reporte de API), dar duración + 12s
    // - Si es TikTok en iframe sin duración resuelta, dar 25s (duración promedio de un reel)
    // - Si es YouTube / Vimeo sin reporte, dar 90s (tiempo óptimo para video institucional)
    let timeoutMs = 90000;
    if (currentVideoDuration && currentVideoDuration > 0) {
      timeoutMs = Math.max(15000, Math.ceil(currentVideoDuration + 12) * 1000);
    } else if (isTikTok) {
      timeoutMs = 25000;
    }

    const timer = setTimeout(() => {
      console.log(`[VideosModule] Watchdog de video activado (${Math.round(timeoutMs / 1000)}s), avanzando al siguiente video...`);
      handleVideoEnded();
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [videoIndex, currentVideoDuration, validVideos.length, isEditorOpen, isLivePreview, overrideStep, isTVMode, handleVideoEnded]);

  // Escuchar eventos de YouTube y Vimeo vía postMessage
  useEffect(() => {
    const handleMessage = (e) => {
      try {
        const raw = e.data;
        if (!raw) return;

        let msg = raw;
        if (typeof raw === 'string') {
          // Errores o bloqueos
          if (raw.includes('"event":"onError"') || raw.includes('overload-protect')) {
            const activeVid = validVideos[videoIndex % Math.max(validVideos.length, 1)];
            if (activeVid?.url) markVideoAsFailed(activeVid.url);
            return;
          }

          try {
            msg = JSON.parse(raw);
          } catch (_) {
            msg = null;
          }
        }

        if (msg && typeof msg === 'object') {
          // YouTube Error (código 100, 101, 150 - video no disponible o no embebible)
          if (msg.event === 'onError' || msg.info === 100 || msg.info === 101 || msg.info === 150) {
            const activeVid = validVideos[videoIndex % Math.max(validVideos.length, 1)];
            if (activeVid?.url) markVideoAsFailed(activeVid.url);
            return;
          }

          // YouTube: YT.PlayerState.ENDED (0) o tiempo final alcanzado
          const isYTEnded = (msg.event === 'onStateChange' && msg.info === 0) ||
                            (msg.info?.playerState === 0) ||
                            (msg.event === 'infoDelivery' && msg.info?.playerState === 0) ||
                            (typeof msg.info?.currentTime === 'number' && typeof msg.info?.duration === 'number' && msg.info.duration > 0 && (msg.info.duration - msg.info.currentTime <= 0.8));

          // Vimeo: event === 'finish' o 'ended'
          const isVimeoEnded = msg.event === 'finish' || msg.event === 'ended';

          if (isYTEnded || isVimeoEnded) {
            console.log('[VideosModule] Evento ENDED recibido vía postMessage');
            handleVideoEnded();
            return;
          }

          // Capturar duración si YouTube la reporta
          if (typeof msg.info?.duration === 'number' && msg.info.duration > 0) {
            setCurrentVideoDuration(msg.info.duration);
          }
        }
      } catch (err) {
        // Ignorar mensajes no relacionados
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleVideoEnded, markVideoAsFailed, validVideos, videoIndex]);

  // Si no hay videos válidos en modo TV, saltar al siguiente paso
  useEffect(() => {
    if (isEditorOpen || isLivePreview || (overrideStep !== null && overrideStep !== undefined)) return;
    if (validVideos.length === 0 && isTVMode) {
      goToStep(getNextAvailableStep ? getNextAvailableStep(5) : 6);
    }
  }, [validVideos.length, isEditorOpen, isTVMode, overrideStep, isLivePreview, goToStep, getNextAvailableStep]);

  return (
    <motion.div
      key="stage-video-motion"
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      className="block-section"
      onClick={() => openEditor && openEditor('videos')}
      style={{ cursor: isTVMode ? 'default' : 'pointer', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', width: '100%', willChange: 'transform' }}
    >
      <div className="orbital-video-stage">
        <div className="orbital-arc-wheel">
          {(() => {
            const rawVideos = validVideos;
            if (rawVideos.length === 0) {
              return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '1.4rem', fontWeight: 700 }}>
                  <Video size={28} color="#9333ea" /> Sin videos corporativos en la cola de reproducción.
                </div>
              );
            }
            const orbitalDeck = rawVideos;
            const activeIdx = (videoIndex % rawVideos.length);

            return orbitalDeck.map((vid, idx) => {
              let offset = idx - activeIdx;
              if (offset > orbitalDeck.length / 2) offset -= orbitalDeck.length;
              if (offset < -orbitalDeck.length / 2) offset += orbitalDeck.length;

              const isSymmetricHidden = (orbitalDeck.length % 2 === 0 && Math.abs(offset) === orbitalDeck.length / 2);
              const isSelected = (offset === 0 && !vid.isPromo);

              let safeUrl = (vid.url || '').trim();
              let isYouTube = false;
              let youtubeId = '';
              let isShort = false;
              let isVimeo = false;
              let vimeoId = '';
              let isTikTok = false;
              let tiktokId = '';

              if (safeUrl.includes('youtube.com') || safeUrl.includes('youtu.be')) {
                isYouTube = true;
                isShort = safeUrl.includes('/shorts/');
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
                const match = safeUrl.match(regExp);
                if (match && match[2].length === 11) {
                  youtubeId = match[2];
                } else {
                  try {
                    const u = new URL(safeUrl.startsWith('http') ? safeUrl : 'https://' + safeUrl);
                    if (u.hostname.includes('youtu.be')) youtubeId = u.pathname.slice(1).split('/')[0].split('?')[0];
                    else if (u.pathname.includes('/shorts/')) youtubeId = u.pathname.split('/shorts/')[1].split('/')[0].split('?')[0];
                    else if (u.pathname.includes('/embed/')) youtubeId = u.pathname.split('/embed/')[1].split('/')[0].split('?')[0];
                    else youtubeId = u.searchParams.get('v') || '';
                  } catch (e) {
                    console.error('Error parseando URL de YouTube:', e);
                  }
                }
              } else if (safeUrl.includes('vimeo.com')) {
                isVimeo = true;
                const match = safeUrl.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+))/);
                vimeoId = match ? match[1] : '';
              } else if (safeUrl.includes('tiktok.com')) {
                isTikTok = true;
                const match = safeUrl.match(/\/video\/(\d+)/) || safeUrl.match(/\/embed\/(?:v2\/)?(\d+)/) || safeUrl.match(/\/v\/(\d+)/);
                tiktokId = match ? match[1] : '';
              }

              const vidId = vid.id || idx;

              let isLandscape = true;
              if (isTikTok || isShort || vid.orientation === 'portrait' || videoOrientations[vidId] === 'portrait') {
                isLandscape = false;
              } else if (videoOrientations[vidId] === 'landscape') {
                isLandscape = true;
              }

              const angle = isSymmetricHidden ? 0 : offset * 15;
              const translateX = isSymmetricHidden ? 0 : offset * (isLandscape ? 290 : 255);
              const translateY = isSymmetricHidden ? 50 : Math.abs(offset) * 25;
              const translateZ = isSymmetricHidden ? -300 : -Math.abs(offset) * 140;
              const scale = isSymmetricHidden ? 0.5 : Math.max(0.74, 1 - Math.abs(offset) * 0.12);
              const opacity = isSymmetricHidden ? 0 : Math.max(0.55, 1 - Math.abs(offset) * 0.22);

              const cardStyle = (!isSelected) ? {
                transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotate(${angle}deg) scale(${scale})`,
                opacity,
                filter: offset !== 0 ? 'brightness(0.65)' : 'none',
                willChange: 'transform, opacity',
                zIndex: 50 - Math.abs(offset)
              } : { zIndex: 100 };

              const expandedClass = isSelected
                ? (isLandscape ? ' is-max-expanded-landscape' : ' is-max-expanded')
                : '';

              return (
                <div
                  key={vidId}
                  className={`orbital-card-item${expandedClass}`}
                  style={cardStyle}
                >
                  {safeUrl && !vid.isPromo && isSelected ? (
                    <div className="cinema-ambilight-container" style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: '#000', borderRadius: '16px' }}>
                      {isYouTube && youtubeId ? (
                        /* OPCIÓN B1: YouTube Iframe Oficial con API js */
                        <iframe
                          key={`yt-active-${vidId}-${activeIdx}`}
                          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=1&mute=1&controls=1&rel=0&playsinline=1&modestbranding=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                          title={vid.name || `Video ${vidId}`}
                          onLoad={(e) => {
                            try {
                              const win = e.target.contentWindow;
                              if (win) {
                                win.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*');
                                win.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }), '*');
                                setTimeout(() => {
                                  try {
                                    win.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }), '*');
                                  } catch (_) {}
                                }, 1200);
                              }
                            } catch (_) {}
                          }}
                          onError={() => markVideoAsFailed(safeUrl)}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                        />
                      ) : isVimeo && vimeoId ? (
                        /* OPCIÓN B2: Vimeo Player Oficial */
                        <iframe
                          key={`vimeo-active-${vidId}-${activeIdx}`}
                          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=0&autopause=0`}
                          title={vid.name || `Vimeo ${vidId}`}
                          onLoad={(e) => {
                            try {
                              e.target.contentWindow?.postMessage(JSON.stringify({ method: 'addEventListener', value: 'ended' }), '*');
                            } catch (_) {}
                          }}
                          onError={() => markVideoAsFailed(safeUrl)}
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                        />
                      ) : isTikTok && tiktokStreams[tiktokId]?.url ? (
                        /* OPCIÓN B3a: TikTok Stream MP4 Directo con reproducción nativa fluida */
                        <video
                          key={`tiktok-stream-active-${vidId}-${activeIdx}-${tiktokStreams[tiktokId].url}`}
                          src={tiktokStreams[tiktokId].url}
                          autoPlay
                          muted
                          playsInline
                          controls
                          ref={(el) => {
                            if (el) {
                              el.currentTime = 0;
                              el.muted = true;
                              el.play().catch(() => {});
                            }
                          }}
                          onLoadedMetadata={(e) => {
                            const dur = e.target.duration;
                            if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
                              setCurrentVideoDuration(dur);
                            }
                            if (setVideoOrientations) {
                              setVideoOrientations(prev => ({ ...prev, [vidId]: 'portrait' }));
                            }
                            e.target.currentTime = 0;
                            e.target.muted = true;
                            e.target.play().catch(() => {});
                          }}
                          onEnded={handleVideoEnded}
                          onError={() => {
                            setTiktokStreams(prev => {
                              const copy = { ...prev };
                              delete copy[tiktokId];
                              return copy;
                            });
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />
                      ) : isTikTok && tiktokId ? (
                        /* OPCIÓN B3b: TikTok Embed Iframe Directo */
                        <iframe
                          key={`tiktok-active-${vidId}-${activeIdx}`}
                          src={`https://www.tiktok.com/embed/v2/${tiktokId}?lang=es-ES`}
                          title={vid.name || `TikTok ${vidId}`}
                          onError={() => markVideoAsFailed(safeUrl)}
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 0,
                            display: 'block'
                          }}
                        />
                      ) : (
                        /* OPCIÓN A: Archivo local HTML5 Nativo (.mp4, .webm, /uploads/...) */
                        <video
                          key={`video-native-active-${vidId}-${activeIdx}-${safeUrl}`}
                          src={safeUrl}
                          autoPlay
                          muted
                          playsInline
                          controls
                          ref={(el) => {
                            if (el) {
                              el.currentTime = 0;
                              el.muted = true;
                              el.play().catch(() => {});
                            }
                          }}
                          onLoadedMetadata={(e) => {
                            const dur = e.target.duration;
                            if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
                              setCurrentVideoDuration(dur);
                            }
                            const isWide = e.target.videoWidth >= e.target.videoHeight;
                            if (setVideoOrientations) {
                              setVideoOrientations(prev => ({ ...prev, [vidId]: isWide ? 'landscape' : 'portrait' }));
                            }
                            e.target.currentTime = 0;
                            e.target.muted = true;
                            e.target.play().catch(() => {});
                          }}
                          onEnded={handleVideoEnded}
                          onError={(e) => {
                            console.warn('Error en video local:', e);
                            markVideoAsFailed(safeUrl);
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={vid.img || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} loading="lazy" />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85), transparent)' }} />
                      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                        <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.25)', border: '2px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
                          <Video size={22} color="#38bdf8" />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{vid.name || 'Video Corporativo'}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </motion.div>
  );
};

export default VideosModule;
