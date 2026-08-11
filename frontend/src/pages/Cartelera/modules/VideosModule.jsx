import React from 'react';
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
  isTVMode,
  openEditor
}) => {

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
            const rawVideos = data?.videos || [];
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
              const isExpanded = !isDeckTransitioning && isSelected;

              // Cálculo trigonométrico orbital en abanico (alineado a formato vertical de TikTok 9:16)
              const angle = isSymmetricHidden ? 0 : offset * 15;
              const translateX = isSymmetricHidden ? 0 : offset * 255;
              const translateY = isSymmetricHidden ? 50 : Math.abs(offset) * 25;
              const translateZ = isSymmetricHidden ? -300 : -Math.abs(offset) * 140;
              const scale = isSymmetricHidden ? 0.5 : Math.max(0.74, 1 - Math.abs(offset) * 0.12);
              const opacity = isSymmetricHidden ? 0 : Math.max(0.55, 1 - Math.abs(offset) * 0.22);

              // El video activo en reproducción toma la clase .is-max-expanded en formato vertical TikTok (9:16, 94% de altura, z-index: 100). Las tarjetas siguientes ("los que siguen") quedan en el fondo bien alineadas a los laterales sin desenfoques de CPU.
              const cardStyle = !isExpanded ? {
                transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotate(${angle}deg) scale(${scale})`,
                opacity,
                filter: offset !== 0 ? 'brightness(0.65)' : 'none',
                willChange: 'transform, opacity',
                zIndex: 50 - Math.abs(offset)
              } : { zIndex: 100 };

              const vidId = vid.id || idx;
              const isLandscape = videoOrientations[vidId] === 'landscape';
              const expandedClass = isExpanded
                ? (isLandscape ? ' is-max-expanded-landscape' : ' is-max-expanded')
                : '';

              return (
                <div
                  key={vidId}
                  className={`orbital-card-item${expandedClass}`}
                  style={cardStyle}
                >
                  {vid.url && !vid.isPromo ? (
                    <div className="cinema-ambilight-container" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                      <video
                        ref={el => {
                          if (el) {
                            if (isExpanded) {
                              if (el.paused) {
                                const playPromise = el.play();
                                if (playPromise !== undefined) {
                                  playPromise.catch(() => { });
                                }
                              }
                            } else {
                              if (!el.paused) {
                                el.pause();
                                el.currentTime = 0;
                              }
                            }
                          }
                        }}
                        src={vid.url}
                        autoPlay
                        muted
                        playsInline
                        onLoadedMetadata={e => {
                          const { videoWidth, videoHeight } = e.target;
                          if (videoWidth && videoHeight) {
                            const orientation = videoWidth > videoHeight ? 'landscape' : 'portrait';
                            setVideoOrientations(prev => ({ ...prev, [vidId]: orientation }));
                          }
                        }}
                        onEnded={() => {
                          if (!isSelected) return;
                          if (isEditorOpen) return;
                          const vids = data?.videos || [];
                          videosPlayedThisCycle.current += 1;
                          const nextIndex = (videoIndex + 1) % vids.length;

                          if (videosPlayedThisCycle.current >= 4 || videosPlayedThisCycle.current >= vids.length) {
                            setVideoIndex(nextIndex);
                            goToStep(6);
                          } else {
                            setIsDeckTransitioning(true);
                            setVideoIndex(nextIndex);
                          }
                        }}
                        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
                      />
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0F172A' }}>
                      <img src={vid.img || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} loading="lazy" />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85), transparent)' }} />
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
