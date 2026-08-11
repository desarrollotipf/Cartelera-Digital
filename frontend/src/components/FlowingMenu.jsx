import { useRef, useEffect, useState, forwardRef, useImperativeHandle, memo } from 'react';
import { gsap } from 'gsap';
import { MousePointer2 } from 'lucide-react';
import './FlowingMenu.css';

const FlowingMenu = memo(({
  items = [],
  speed = 12,
  textColor = 'var(--text-primary, #ffffff)',
  bgColor = 'var(--bg-panel, #183ea888)',
  marqueeBgColor = '#0b4274',
  marqueeTextColor = '#ffffff',
  borderColor = 'var(--border, rgba(255,255,255,0.2))',
  activeItemIndex = null,
  highlightItemIndex = null,
  onItemClick = null
}) => {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const cursorRef = useRef(null);
  const rippleRef = useRef(null);
  const isInitialPosSet = useRef(false);
  const lastHoverIdxRef = useRef(null);

  useEffect(() => {
    if (activeItemIndex === null || !cursorRef.current || !itemRefs.current[activeItemIndex] || !containerRef.current) return;

    const targetRefObj = itemRefs.current[activeItemIndex];
    const targetEl = targetRefObj?.element || targetRefObj;
    if (targetEl) {
      const targetRect = targetEl.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const targetY = targetRect.top - containerRect.top + (targetRect.height / 2);
      const targetX = targetRect.left - containerRect.left + (targetRect.width / 2);

      gsap.killTweensOf(cursorRef.current);
      gsap.killTweensOf(rippleRef.current);

      if (!isInitialPosSet.current) {
        gsap.set(cursorRef.current, { y: targetY, x: targetX, opacity: 1, scale: 1 });
        gsap.set(rippleRef.current, { scale: 0, opacity: 0 });
        
        if (targetRefObj?.setHovered) {
          targetRefObj.setHovered(true);
          lastHoverIdxRef.current = activeItemIndex;
        }

        isInitialPosSet.current = true;
        return;
      }

      // Precalcular las posiciones Y de cada pestaña para el efecto hover
      const itemBounds = items.map((_, i) => {
        const refObj = itemRefs.current[i];
        const el = refObj?.element || refObj;
        if (!el) return { top: 0, bottom: 0 };
        const rect = el.getBoundingClientRect();
        return {
          top: rect.top - containerRect.top,
          bottom: rect.bottom - containerRect.top
        };
      });

      gsap.to(cursorRef.current, {
        y: targetY,
        x: targetX,
        duration: 1.2,
        ease: 'power2.inOut',
        opacity: 1,
        onUpdate: function() {
          const currentY = gsap.getProperty(cursorRef.current, "y");
          const hoverIdx = itemBounds.findIndex(b => currentY >= b.top && currentY <= b.bottom);
          if (hoverIdx !== -1 && hoverIdx !== lastHoverIdxRef.current) {
            if (lastHoverIdxRef.current !== null && itemRefs.current[lastHoverIdxRef.current]?.setHovered) {
              itemRefs.current[lastHoverIdxRef.current].setHovered(false);
            }
            if (itemRefs.current[hoverIdx]?.setHovered) {
              itemRefs.current[hoverIdx].setHovered(true);
            }
            lastHoverIdxRef.current = hoverIdx;
          }
        }
      });
      
      gsap.to(cursorRef.current, {
        scale: 0.85,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        delay: 1.2
      });
      
      gsap.fromTo(rippleRef.current,
        { scale: 0, opacity: 0.8 },
        { scale: 5.5, opacity: 0, duration: 1.0, ease: 'power2.out', delay: 1.35 }
      );
    }
  }, [activeItemIndex]);

  return (
    <div className="menu-wrap" style={{ backgroundColor: bgColor, position: 'relative' }} ref={containerRef}>
      <div 
        ref={cursorRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 100,
          opacity: 0,
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformOrigin: 'top left'
        }}
      >
        <div 
          ref={rippleRef} 
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.8)',
            border: '2px solid rgba(14, 165, 233, 0.9)',
            pointerEvents: 'none',
            opacity: 0
          }}
        />
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
          <path d="M4 4l7.07 16.97 2.51-7.39 7.39-2.51L4 4z" />
        </svg>
      </div>
      <nav className="menu">
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            index={idx}
            ref={el => itemRefs.current[idx] = el}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isActive={(highlightItemIndex !== null ? highlightItemIndex : activeItemIndex) === idx}
            onClick={() => onItemClick && onItemClick(idx)}
          />
        ))}
      </nav>
    </div>
  );
});

const MenuItem = memo(forwardRef(({
  index,
  link = '#',
  text,
  image,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  isActive = false,
  onClick
}, ref) => {
  const itemRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  useImperativeHandle(ref, () => ({
    get element() { return itemRef.current; },
    getBoundingClientRect: () => itemRef.current?.getBoundingClientRect(),
    setHovered: setIsHovered
  }));

  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const animationRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults = { duration: 0.45, ease: 'power2.out', force3D: true };

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  const distMetric = (x, y, x2, y2) => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;

      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee__part');
      if (!marqueeContent) return;

      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;

      const needed = Math.ceil(viewportWidth / (contentWidth || 300)) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [text, image]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;

      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee__part');
      if (!marqueeContent) return;

      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1,
        force3D: true
      });
    };

    const timer = setTimeout(setupMarquee, 50);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, image, repetitions, speed]);

  // Soporte para transiciones automáticas en Modo TV sin necesidad del puntero del mouse
  const isCurrentlyActive = isActive || isHovered;
  
  useEffect(() => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;

    if (isCurrentlyActive) {
      gsap
        .timeline({ defaults: animationDefaults })
        .set(marqueeRef.current, { y: '101%' }, 0)
        .set(marqueeInnerRef.current, { y: '-101%' }, 0)
        .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
    } else {
      gsap
        .timeline({ defaults: animationDefaults })
        .to(marqueeRef.current, { y: '101%' }, 0)
        .to(marqueeInnerRef.current, { y: '-101%' }, 0);
    }
  }, [isCurrentlyActive]);

  const handleMouseEnter = ev => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current || isCurrentlyActive) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };

  const handleMouseLeave = ev => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current || isCurrentlyActive) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  const handleClick = ev => {
    ev.preventDefault();
    if (onClick) onClick();
  };

  return (
    <div
      className="menu__item"
      ref={itemRef}
      style={{
        borderColor: isCurrentlyActive ? '#38bdf8' : borderColor,
        background: isCurrentlyActive ? '#0b4274' : 'transparent',
        boxShadow: isCurrentlyActive ? '0 0 20px rgba(11, 66, 116, 0.6)' : 'none',
        transition: 'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease'
      }}
    >
      <a
        className="menu__item-link"
        href={link}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ color: textColor }}
      >
        {text}
      </a>
      <div className="marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
        <div className="marquee__inner-wrap">
          <div className="marquee__inner" ref={marqueeInnerRef} aria-hidden="true">
            {[...Array(repetitions)].map((_, idx) => (
              <div className="marquee__part" key={idx} style={{ color: marqueeTextColor }}>
                <span>{text}</span>
                {image && <div className="marquee__img" style={{ backgroundImage: `url(${image})` }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}));

export default FlowingMenu;
