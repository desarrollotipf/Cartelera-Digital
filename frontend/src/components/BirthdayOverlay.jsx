import React, { useEffect, useRef } from 'react';
import { formatFirstName } from '../utils/nameFormatter';

export default function BirthdayOverlay({ birthday, onClose, duration = 15000 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Auto close after duration
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    let w = c.width = window.innerWidth;
    let h = c.height = window.innerHeight;
    const ctx = c.getContext('2d');
    
    let hw = w / 2;
    let hh = h * 0.25; // Shift fireworks higher up to avoid overlapping with the card

    const bdayName = formatFirstName(birthday?.name || '').toUpperCase() || '';
    
    const opts = {
      strings: ['FELIZ', 'CUMPLEAÑOS', bdayName],
      charSize: window.innerWidth < 800 ? 30 : 60,
      charSpacing: window.innerWidth < 800 ? 35 : 65,
      lineHeight: window.innerWidth < 800 ? 40 : 80,
      cx: w / 2,
      cy: h / 2,
      fireworkPrevPoints: 10,
      fireworkBaseLineWidth: 5,
      fireworkAddedLineWidth: 8,
      fireworkSpawnTime: 200,
      fireworkBaseReachTime: 30,
      fireworkAddedReachTime: 30,
      fireworkCircleBaseSize: 20,
      fireworkCircleAddedSize: 10,
      fireworkCircleBaseTime: 30,
      fireworkCircleAddedTime: 30,
      fireworkCircleFadeBaseTime: 10,
      fireworkCircleFadeAddedTime: 5,
      fireworkBaseShards: 5,
      fireworkAddedShards: 5,
      fireworkShardPrevPoints: 3,
      fireworkShardBaseVel: 4,
      fireworkShardAddedVel: 2,
      fireworkShardBaseSize: 3,
      fireworkShardAddedSize: 3,
      gravity: .1,
      upFlow: -.1,
      letterContemplatingWaitTime: 360,
      balloonSpawnTime: 20,
      balloonBaseInflateTime: 10,
      balloonAddedInflateTime: 10,
      balloonBaseSize: 20,
      balloonAddedSize: 20,
      balloonBaseVel: .4,
      balloonAddedVel: .4,
      balloonBaseRadian: -(Math.PI / 2 - .5),
      balloonAddedRadian: -1,
    };

    const calc = {
      totalWidth: opts.charSpacing * Math.max(...opts.strings.map(s => s.length))
    };
    
    const Tau = Math.PI * 2;
    const TauQuarter = Tau / 4;
    const letters = [];

    ctx.font = opts.charSize + 'px Verdana';

    function Letter(char, x, y) {
      this.char = char;
      this.x = x;
      this.y = y;
      this.dx = -ctx.measureText(char).width / 2;
      this.dy = +opts.charSize / 2;
      this.fireworkDy = this.y - hh;
      
      let hue = x / calc.totalWidth * 360;
      this.color = 'hsl(hue,80%,50%)'.replace('hue', hue);
      this.lightAlphaColor = 'hsla(hue,80%,light%,alp)'.replace('hue', hue);
      this.lightColor = 'hsl(hue,80%,light%)'.replace('hue', hue);
      this.alphaColor = 'hsla(hue,80%,50%,alp)'.replace('hue', hue);
      this.reset();
    }

    Letter.prototype.reset = function() {
      this.phase = 'firework';
      this.tick = 0;
      this.spawned = false;
      this.spawningTime = opts.fireworkSpawnTime * Math.random() | 0;
      this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() | 0;
      this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
      this.prevPoints = [[0, hh, 0]];
    };

    Letter.prototype.step = function() {
      if(this.phase === 'firework') {
        if(!this.spawned) {
          ++this.tick;
          if(this.tick >= this.spawningTime) {
            this.tick = 0;
            this.spawned = true;
          }
        } else {
          ++this.tick;
          let linearProportion = this.tick / this.reachTime,
              armonicProportion = Math.sin(linearProportion * TauQuarter),
              x = linearProportion * this.x,
              y = hh + armonicProportion * this.fireworkDy;
          
          if(this.prevPoints.length > opts.fireworkPrevPoints)
            this.prevPoints.shift();
          
          this.prevPoints.push([x, y, linearProportion * this.lineWidth]);
          
          let lineWidthProportion = 1 / (this.prevPoints.length - 1);
          
          for(let i = 1; i < this.prevPoints.length; ++i) {
            let point = this.prevPoints[i],
                point2 = this.prevPoints[i - 1];
            ctx.strokeStyle = this.alphaColor.replace('alp', i / this.prevPoints.length);
            ctx.lineWidth = point[2] * lineWidthProportion * i;
            ctx.beginPath();
            ctx.moveTo(point[0], point[1]);
            ctx.lineTo(point2[0], point2[1]);
            ctx.stroke();
          }
          
          if(this.tick >= this.reachTime) {
            this.phase = 'contemplate';
            this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
            this.circleCompleteTime = opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random() | 0;
            this.circleCreating = true;
            this.circleFading = false;
            this.circleFadeTime = opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random() | 0;
            this.tick = 0;
            this.tick2 = 0;
            this.shards = [];
            
            let shardCount = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() | 0,
                angle = Tau / shardCount,
                cos = Math.cos(angle),
                sin = Math.sin(angle),
                sx = 1,
                sy = 0;
            
            for(let i = 0; i < shardCount; ++i) {
              let x1 = sx;
              sx = sx * cos - sy * sin;
              sy = sy * cos + x1 * sin;
              this.shards.push(new Shard(this.x, this.y, sx, sy, this.alphaColor));
            }
          }
        }
      } else if(this.phase === 'contemplate') {
        ++this.tick;
        if(this.circleCreating) {
          ++this.tick2;
          let proportion = this.tick2 / this.circleCompleteTime,
              armonic = -Math.cos(proportion * Math.PI) / 2 + .5;
          ctx.beginPath();
          ctx.fillStyle = this.lightAlphaColor.replace('light', 50 + 50 * proportion).replace('alp', proportion);
          ctx.beginPath();
          ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
          ctx.fill();
          
          if(this.tick2 > this.circleCompleteTime) {
            this.tick2 = 0;
            this.circleCreating = false;
            this.circleFading = true;
          }
        } else if(this.circleFading) {
          ctx.fillStyle = this.lightColor.replace('light', 70);
          ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
          ++this.tick2;
          let proportion = this.tick2 / this.circleFadeTime,
              armonic = -Math.cos(proportion * Math.PI) / 2 + .5;
          ctx.beginPath();
          ctx.fillStyle = this.lightAlphaColor.replace('light', 100).replace('alp', 1 - armonic);
          ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
          ctx.fill();
          if(this.tick2 >= this.circleFadeTime)
            this.circleFading = false;
        } else {
          ctx.fillStyle = this.lightColor.replace('light', 70);
          ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
        }
        
        for(let i = 0; i < this.shards.length; ++i) {
          this.shards[i].step();
          if(!this.shards[i].alive) {
            this.shards.splice(i, 1);
            --i;
          }
        }
        
        if(this.tick > opts.letterContemplatingWaitTime) {
          this.phase = 'balloon';
          this.tick = 0;
          this.spawning = true;
          this.spawnTime = opts.balloonSpawnTime * Math.random() | 0;
          this.inflating = false;
          this.inflateTime = opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random() | 0;
          this.size = opts.balloonBaseSize + opts.balloonAddedSize * Math.random() | 0;
          
          let rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
              vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
          this.vx = Math.cos(rad) * vel;
          this.vy = Math.sin(rad) * vel;
        }
      } else if(this.phase === 'balloon') {
        ctx.strokeStyle = this.lightColor.replace('light', 80);
        if(this.spawning) {
          ++this.tick;
          ctx.fillStyle = this.lightColor.replace('light', 70);
          ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
          if(this.tick >= this.spawnTime) {
            this.tick = 0;
            this.spawning = false;
            this.inflating = true;	
          }
        } else if(this.inflating) {
          ++this.tick;
          let proportion = this.tick / this.inflateTime,
              x = this.cx = this.x,
              y = this.cy = this.y - this.size * proportion;
          ctx.fillStyle = this.alphaColor.replace('alp', proportion);
          ctx.beginPath();
          generateBalloonPath(x, y, this.size * proportion);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, this.y);
          ctx.stroke();
          ctx.fillStyle = this.lightColor.replace('light', 70);
          ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
          if(this.tick >= this.inflateTime) {
            this.tick = 0;
            this.inflating = false;
          }
        } else {
          this.cx += this.vx;
          this.cy += this.vy += opts.upFlow;
          ctx.fillStyle = this.color;
          ctx.beginPath();
          generateBalloonPath(this.cx, this.cy, this.size);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(this.cx, this.cy);
          ctx.lineTo(this.cx, this.cy + this.size);
          ctx.stroke();
          ctx.fillStyle = this.lightColor.replace('light', 70);
          ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);
          if(this.cy + this.size < -hh || this.cx < -hw || this.cy > hw)
            this.phase = 'done';
        }
      }
    }

    function Shard(x, y, vx, vy, color) {
      let vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();
      this.vx = vx * vel;
      this.vy = vy * vel;
      this.x = x;
      this.y = y;
      this.prevPoints = [[x, y]];
      this.color = color;
      this.alive = true;
      this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
    }
    Shard.prototype.step = function() {
      this.x += this.vx;
      this.y += this.vy += opts.gravity;
      if(this.prevPoints.length > opts.fireworkShardPrevPoints)
        this.prevPoints.shift();
      this.prevPoints.push([this.x, this.y]);
      let lineWidthProportion = this.size / this.prevPoints.length;
      for(let k = 0; k < this.prevPoints.length - 1; ++k) {
        let point = this.prevPoints[k],
            point2 = this.prevPoints[k + 1];
        ctx.strokeStyle = this.color.replace('alp', k / this.prevPoints.length);
        ctx.lineWidth = k * lineWidthProportion;
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
      }
      if(this.prevPoints[0][1] > hh)
        this.alive = false;
    };

    function generateBalloonPath(x, y, size) {
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size / 4, y - size, x, y - size);
      ctx.bezierCurveTo(x + size / 4, y - size, x + size / 2, y - size / 2, x, y);
    }

    let reqId;
    function anim() {
      reqId = window.requestAnimationFrame(anim);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, w, h);
      ctx.translate(hw, hh);
      let done = true;
      for(let l = 0; l < letters.length; ++l) {
        letters[l].step();
        if(letters[l].phase !== 'done') done = false;
      }
      ctx.translate(-hw, -hh);
      if(done) {
        for(let l = 0; l < letters.length; ++l) letters[l].reset();
      }
    }

    for(let i = 0; i < opts.strings.length; ++i) {
      for(let j = 0; j < opts.strings[i].length; ++j) {
        letters.push(new Letter(
          opts.strings[i][j], 
          j * opts.charSpacing + opts.charSpacing / 2 - opts.strings[i].length * opts.charSize / 2,
          i * opts.lineHeight + opts.lineHeight / 2 - opts.strings.length * opts.lineHeight / 2
        ));
      }
    }

    anim();

    const handleResize = () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
      hw = w / 2;
      hh = h * 0.25;
      ctx.font = opts.charSize + 'px Verdana';
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if(reqId) window.cancelAnimationFrame(reqId);
    };
  }, [birthday?.name]);

  if (!birthday) return null;

  return (
    <div className="block-section fade-transition" style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'flex-end',
      paddingBottom: '5vh',
      justifyContent: 'center',
      background: '#111',
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      />
      
      {/* Main Glassmorphism Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(5px)',
        borderRadius: '24px',
        padding: '3rem 4rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        maxWidth: '80%',
        textAlign: 'center',
        opacity: 0,
        animation: 'popIn 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 3.5s' // Wait for fireworks
      }}>
        <style>{`
          @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            60% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
        `}</style>
        
        <div style={{ animation: 'float 4s ease-in-out infinite', marginBottom: '1.5rem' }}>
          <img 
            src="/images/logo-pollo.png" 
            alt="Pollo Fiesta Logo" 
            style={{ width: '150px', height: '150px', objectFit: 'contain', filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.5))' }} 
          />
        </div>

        <h2 style={{
          color: '#FACC15',
          fontSize: '3.5rem',
          margin: '0 0 1rem 0',
          fontWeight: 700,
          textShadow: '0 2px 4px rgba(0,0,0,0.8)'
        }}>
          {birthday.name}
        </h2>
        
        {birthday.cargo && (
          <p style={{
            color: '#fff',
            fontSize: '1.8rem',
            margin: '0 0 0.5rem 0',
            fontWeight: 500,
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}>
            {birthday.cargo}
          </p>
        )}
        
        <div style={{
          marginTop: '2rem',
          padding: '0.75rem 2rem',
          background: 'rgba(250, 204, 21, 0.8)', 
          color: '#111',
          borderRadius: '50px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          display: 'inline-block'
        }}>
          {birthday.date || 'Hoy'} 
        </div>
      </div>
    </div>
  );
}
