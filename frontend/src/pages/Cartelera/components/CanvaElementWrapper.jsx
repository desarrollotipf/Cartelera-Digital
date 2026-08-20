import React from 'react';
import { motion } from 'framer-motion';

export default function CanvaElementWrapper({
  isLivePreview,
  moduleId,
  elementId,
  onElementClick,
  selectedElementId,
  label,
  children
}) {
  if (!isLivePreview || !onElementClick) {
    return (
      <div style={{ display: 'flex', flex: 1, width: '100%', minWidth: 0, position: 'relative', height: '100%' }}>
        {children}
      </div>
    );
  }

  const isSelected = String(selectedElementId) === String(elementId);

  return (
    <motion.div
      className={`canva-interactive-element ${isSelected ? 'canva-interactive-selected' : ''}`}
      animate={{ scale: isSelected ? 1.05 : 1, zIndex: isSelected ? 9999 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={(e) => {
        e.stopPropagation();
        onElementClick(moduleId, elementId);
      }}
      title={`Clic para editar: ${label || elementId}`}
      style={{ display: 'flex', flex: 1, width: '100%', minWidth: 0, position: 'relative', transformOrigin: 'center center' }}
    >
      <span className="canva-interactive-badge">✎ {label || 'Clic para editar'}</span>
      {children}
    </motion.div>
  );
}
