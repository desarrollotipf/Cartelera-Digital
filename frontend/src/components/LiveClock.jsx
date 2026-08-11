import { memo } from 'react';
import { useClock } from '../hooks/useClock';

const LiveClock = memo(() => {
  const clock = useClock();

  return (
    <div className="clock-card">
      <span className="clock-pulse"></span>
      <div>
        <div className="clock-time">{clock.time || '12:00:00'}</div>
        <div className="clock-date">{clock.date || 'Hoy'}</div>
      </div>
    </div>
  );
});

export default LiveClock;
