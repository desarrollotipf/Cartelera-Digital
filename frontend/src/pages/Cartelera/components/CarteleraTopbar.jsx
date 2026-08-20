import React from 'react';
import LiveClock from '../../../components/LiveClock';
import CanvaElementWrapper from './CanvaElementWrapper';

export default function CarteleraTopbar({
  appTitle,
  appSubtitle,
  marquesina,
  isTVMode,
  isLivePreview,
  selectedElementId,
  onElementClick,
  onOpenEditor,
}) {
  return (
    <header
      className="cartelera-topbar"
      onClick={() => onOpenEditor('topbar')}
      style={{ cursor: isTVMode ? 'default' : 'pointer' }}
    >
      <CanvaElementWrapper
        isLivePreview={isLivePreview}
        moduleId="topbar"
        elementId="titles"
        label="Editar Títulos"
        onElementClick={onElementClick}
        selectedElementId={selectedElementId}
      >
        <div className="brand-badge">
          <img
            src="/images/logo-pollo.png"
            alt="Logo"
            className="brand-icon"
            style={{ width: '50px', height: '50px', objectFit: 'contain', background: 'transparent' }}
            loading="lazy"
          />
          <div>
            <span className="brand-title">{appTitle}</span>
            <span className="brand-subtitle">{appSubtitle}</span>
          </div>
        </div>
      </CanvaElementWrapper>

      <CanvaElementWrapper
        isLivePreview={isLivePreview}
        moduleId="topbar"
        elementId="marquesina"
        label="Editar Marquesina"
        onElementClick={onElementClick}
        selectedElementId={selectedElementId}
      >
        <div className="ticker-wrap" style={{ flex: 1 }}>
          <span className="ticker-badge-label">COMUNICADO</span>
          <div className="ticker-container">
            <div className="ticker-text">{marquesina}</div>
          </div>
        </div>
      </CanvaElementWrapper>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <LiveClock />

        <div className="topbar-actions">
          {!isLivePreview && (!isTVMode ? (
            <>
              <button
                className="action-btn action-btn-edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditor('topbar');
                }}
              >
                Modo Edición ⚙️
              </button>
              <a
                href="/cartelera/tv"
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn action-btn-tv"
                onClick={(e) => e.stopPropagation()}
              >
                Modo TV
              </a>
            </>
          ) : (
            <button
              className="action-btn action-btn-exit"
              onClick={(e) => {
                e.stopPropagation();
                window.close();
              }}
            >
              Salir
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
