import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FakeMouseCursor({ fakeMouse }) {
  return (
    <AnimatePresence>
      {fakeMouse.visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: fakeMouse.clicking ? 0.85 : 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            left: fakeMouse.x,
            top: fakeMouse.y,
            pointerEvents: 'none',
            zIndex: 999999,
            transition: 'left 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
            transform: 'translate(-4px, -4px)',
          }}
        >
          {/* Cursor SVG */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
              transform: fakeMouse.clicking ? 'scale(0.9)' : 'scale(1)',
              transition: 'transform 0.15s ease'
            }}
          >
            <path
              d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>

          {/* Efecto Ripple de Clic */}
          {fakeMouse.ripple && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '2px solid #38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.3)',
                pointerEvents: 'none'
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
