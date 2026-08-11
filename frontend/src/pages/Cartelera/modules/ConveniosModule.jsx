import React from 'react';
import { motion } from 'framer-motion';
import ConveniosCompensarPage from '../../ConveniosCompensarPage';

const ConveniosModule = ({
  data,
  autoPlay,
  onComplete,
  compact,
  isLivePreview,
  selectedElementId,
  onElementClick
}) => {
  return (
    <motion.div
      key="stage-convenios-motion"
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      className="block-section"
      style={{ cursor: 'default', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.5rem', width: '100%', willChange: 'transform' }}
    >
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', flex: 1, minHeight: 0, height: '100%', overflowY: 'auto', padding: '1rem', boxShadow: '0 12px 35px rgba(0,0,0,0.25)' }}>
        <ConveniosCompensarPage
          data={data}
          autoPlay={autoPlay}
          onComplete={onComplete}
          compact={compact}
          isLivePreview={isLivePreview}
          selectedElementId={selectedElementId}
          onElementClick={onElementClick}
        />
      </div>
    </motion.div>
  );
};

export default ConveniosModule;
