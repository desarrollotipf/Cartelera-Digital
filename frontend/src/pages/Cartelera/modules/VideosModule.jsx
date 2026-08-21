import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video } from 'lucide-react';

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
  isEditorOpen,
  isLivePreview,
  overrideStep,
  isTVMode,
  openEditor
}) => {
  // Registro de URLs de videos con fallos, bloqueos o errores de embed para excluirlos automáticamente
  const [failedUrls, setFailedUrls] = React.useState(new Set());

  // Lista de videos limpios y 100% funcionales (excluyendo cualquier video de demostración o caído)
  const validVideos = React.useMemo(() => {
    return (data?.videos || []).filter(v => v?.url && !v.url.includes('mov_bbb.mp4') && !v.url.includes('w3schools') && !failedUrls.has(v.url.trim()));
  }, [data?.videos, failedUrls]);

  const handleVideoEnded = React.useCallback(() => {
    // Si el editor está abierto o en modo vista previa, rotar solo dentro de videos sin salir
    if (isEditorOpen || isLivePreview || (overrideStep !== null && overrideStep !== undefined)) {
      if (validVideos.length > 1) {
        setIsDeckTransitioning(true);
        setVideoIndex((videoIndex + 1) % validVideos.length);
      }
      return;
    }
    
    if (validVideos.length === 0) {
      goToStep(6);
      return;
    }
    
    videosPlayedThisCycle.current += 1;
    const nextIndex = (videoIndex + 1) % validVideos.length;

    // En Modo TV / Cartelera normal:
    // Si hay más videos, rota hasta completar el ciclo (máximo 3 videos por ciclo)
    if (validVideos.length > 1 && videosPlayedThisCycle.current < Math.min(validVideos.length, 3)) {
      setIsDeckTransitioning(true);
      setVideoIndex(nextIndex);
    } else {
      // Al terminar los videos del ciclo en TV, avanza inmediatamente a Convenios (Paso 6)
      videosPlayedThisCycle.current = 0; // Reiniciar contador para el próximo ciclo
      setVideoIndex(nextIndex);
      goToStep(6);
    }
  }, [validVideos, isEditorOpen, isLivePreview, videoIndex, videosPlayedThisCycle, setVideoIndex, setIsDeckTransitioning, goToStep]);

  // Función para descartar de inmediato videos caídos o bloqueados
  const markVideoAsFailed = React.useCallback((url) => {
    if (!url) return;
    console.warn('[VideosModule] Video con error o bloqueo detectado, descartando:', url);
    setFailedUrls(prev => {
      const next = new Set(prev);
      next.add(url.trim());
      return next;
    });
    // Avanzar inmediatamente al siguiente video válido
    handleVideoEnded();
  }, [handleVideoEnded]);

  // Escuchar cuando el video de YouTube o Vimeo termina o falla mediante postMessage
  useEffect(() => {
    const handleMessage = (e) => {
      try {
        const raw = e.data;
        if (!raw) return;

        // Detección directa por texto crudo
        if (typeof raw === 'string') {
          // Errores de YouTube o bloqueo de servidor
          if (raw.includes('"event":"onError"') || raw.includes('"error"') || raw.includes('overload-protect')) {
            const activeVid = validVideos[videoIndex % Math.max(validVideos.length, 1)];
            if (activeVid?.url) markVideoAsFailed(activeVid.url);
            return;
          }

          if (raw.includes('"playerState":0') || raw.includes('"info":0') || (raw.includes('onStateChange') && raw.includes(':0'))) {
            handleVideoEnded();
            return;
          }
          if (raw.includes('"event":"finish"') || raw.includes('"event":"ended"')) {
            handleVideoEnded();
            return;
          }
        }
        
        let msg = raw;
        if (typeof raw === 'string') {
          try { msg = JSON.parse(raw); } catch (_) {}
        }
        
        if (msg && typeof msg === 'object') {
          // YouTube Error (código 100, 101, 150 - video no disponible o no embebible)
          if (msg.event === 'onError' || msg.info === 100 || msg.info === 101 || msg.info === 150) {
            const activeVid = validVideos[videoIndex % Math.max(validVideos.length, 1)];
            if (activeVid?.url) markVideoAsFailed(activeVid.url);
            return;
          }

          // YouTube: YT.PlayerState.ENDED (0)
          const isYTEnded = (msg.event === 'onStateChange' && msg.info === 0) ||
                            (msg.info?.playerState === 0) ||
                            (msg.event === 'infoDelivery' && msg.info?.playerState === 0);
          
          // Vimeo: event === 'finish' o 'ended'
          const isVimeoEnded = msg.event === 'finish' || msg.event === 'ended';

          if (isYTEnded || isVimeoEnded) {
            handleVideoEnded();
          }
        }
      } catch (err) {
        // Ignorar mensajes no relacionados
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleVideoEnded, markVideoAsFailed, validVideos, videoIndex]);

  useEffect(() => {
    if (isEditorOpen || isLivePreview || (overrideStep !== null && overrideStep !== undefined)) return;
    if (validVideos.length === 0) {
      if (isTVMode) {
        goToStep(6);
      }
      return;
    }
    
    const activeIdx = (videoIndex % validVideos.length);
    const activeVid = validVideos[activeIdx];
    
    if (!activeVid?.url) {
      handleVideoEnded();
      return;
    } else if (activeVid.url.includes('tiktok.com') && !activeVid.url.startsWith('/uploads')) {
      // Las URLs directas de TikTok son bloqueadas por TikTok ('overload-protect'). Descartar de inmediato para no congelar la pantalla.
      console.warn('[VideosModule] Descartando embed crudo de TikTok bloqueado:', activeVid.url);
      markVideoAsFailed(activeVid.url);
      return;
    }
  }, [videoIndex, validVideos, isEditorOpen, isTVMode, handleVideoEnded, markVideoAsFailed, goToStep]);

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
            // Garantizar al menos 3 tarjetas para que el arco 3D y el abanico siempre luzcan espectaculares
            const orbitalDeck = rawVideos.length >= 3 ? rawVideos : [
              ...rawVideos,
              { id: 'promo_1', name: 'Sala de Cine Pollo Fiesta', isPromo: true, img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80', title: 'Experiencia Cinemática' },
              { id: 'promo_2', name: 'Comunicados y Cultura', isPromo: true, img: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80', title: 'Gestión Humana y Operaciones' },
            ].slice(0, Math.max(rawVideos.length + 2, 3));

            const activeIdx = (videoIndex % rawVideos.length);

            return orbitalDeck.map((vid, idx) => {
              // Calcular distancia al video activo en el anillo orbital
              let offset = idx - activeIdx;
              if (offset > orbitalDeck.length / 2) offset -= orbitalDeck.length;
              if (offset < -orbitalDeck.length / 2) offset += orbitalDeck.length;

              // Si la cantidad de tarjetas es par, ocultar la que queda exactamente opuesta para mantener simetría
              const isSymmetricHidden = (orbitalDeck.length % 2 === 0 && Math.abs(offset) === orbitalDeck.length / 2);

              const isSelected = (offset === 0 && !vid.isPromo);

              // --- ARQUITECTURA MULTIPLATAFORMA & ORIENTACIÓN ---
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
              
              // Detección automática de orientación:
              // - Si es TikTok, YouTube Short o marcado portrait: 9:16 (TikTok Vertical)
              // - Si es YouTube normal, Vimeo o video horizontal: 16:9 (Landscape)
              let isLandscape = true;
              if (isTikTok || isShort || vid.orientation === 'portrait' || videoOrientations[vidId] === 'portrait') {
                isLandscape = false;
              } else if (videoOrientations[vidId] === 'landscape') {
                isLandscape = true;
              }

              // Cálculo trigonométrico orbital en abanico
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
                        /* OPCIÓN B1: YouTube Iframe Oficial Nocookie */
                        <iframe
                          key={`yt-active-${vidId}-${activeIdx}`}
                          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&autoplay=1&mute=1&controls=1&rel=0&playsinline=1&modestbranding=1`}
                          title={vid.name || `Video ${vidId}`}
                          onLoad={(e) => {
                            try {
                              e.target.contentWindow?.postMessage('{"event":"listening","id":1,"channel":"widget"}', '*');
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
                          onError={() => markVideoAsFailed(safeUrl)}
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                        />
                      ) : isTikTok && tiktokId ? (
                        /* OPCIÓN B3: TikTok Embed Directo (Sin Zoom) */
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
