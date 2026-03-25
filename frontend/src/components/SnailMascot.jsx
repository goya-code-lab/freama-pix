import React, { useEffect, useRef } from 'react';

const SnailMascot = () => {
  const containerRef = useRef(null);
  const flipContainerRef = useRef(null);
  const iconRef = useRef(null);
  
  // Refs for tracking without re-rendering
  const targetX = useRef(100);
  const currentX = useRef(100);
  const isMoving = useRef(false);
  const currentDirection = useRef(1); // 1 = right, -1 = left

  useEffect(() => {
    // Sync starting position visually
    targetX.current = window.innerWidth / 2;
    currentX.current = window.innerWidth / 2;
    
    if (containerRef.current) {
        containerRef.current.style.transform = `translateX(${currentX.current}px)`;
    }

    const handleMouseMove = (e) => {
      const padding = 30;
      targetX.current = Math.max(padding, Math.min(window.innerWidth - padding, e.clientX));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrameId;

    const animate = () => {
      const distance = targetX.current - currentX.current;
      
      if (Math.abs(distance) > 5) { // Needs to move
        if (!isMoving.current) {
          isMoving.current = true;
          // no animate-pulse, we handle stretch manually
        }
        
        // Determine direction
        const dir = distance > 0 ? 1 : -1;
        if (dir !== currentDirection.current) {
            currentDirection.current = dir;
            if (flipContainerRef.current) {
                // SVGは右向きなので、進行方向(dir)をそのままスケールにする
                flipContainerRef.current.style.transform = `scaleX(${dir})`;
            }
        }
        
        // 「ビュー、ビュー」というカタツムリ固有の動き（伸び縮み）の計算
        // 波（サインカーブ）を使って、休止と移動を繰り返す
        const timePhase = Date.now() / 350; 
        const rawPulse = Math.sin(timePhase);
        // 波の底（負の値）の時は0.1まで減速してじわじわ動き、頂上の時は一気に進む
        const movementPulse = rawPulse < 0 ? 0.1 : rawPulse;
        
        // 移動に伴う体の伸縮表現 (進行方向への伸び縮み)
        if (iconRef.current) {
            const stretchX = 0.95 + (movementPulse * 0.15); // 横に伸びる
            const stretchY = 1.05 - (movementPulse * 0.1);  // 縦には低くなる
            // SVGは右を向いているので、dirに関わらずそのままX方向スケールで良い
            iconRef.current.style.transform = `scale(${stretchX}, ${stretchY})`;
        }

        // 移動にこの脈動を掛け合わせる
        const baseSpeed = Math.max(0.5, Math.min(2.5, Math.abs(distance) * 0.02));
        currentX.current += dir * baseSpeed * movementPulse;
        
        // Apply position
        if (containerRef.current) {
            containerRef.current.style.transform = `translateX(${currentX.current}px)`;
        }
      } else {
        if (isMoving.current) {
            isMoving.current = false;
            if (iconRef.current) {
               // 止まったら元のスケールに戻る
               iconRef.current.style.transform = `scale(1, 1)`;
               // 止まった直後に少し反動をつけるトランジション
               iconRef.current.style.transition = `transform 0.3s ease`;
            }
        } else {
             if (iconRef.current) {
                 iconRef.current.style.transition = `none`;
             }
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute top-1/2 -translate-y-[50%] left-0 z-0 pointer-events-none drop-shadow-sm opacity-95"
      style={{
        willChange: 'transform'
      }}
    >
      <div 
        ref={flipContainerRef}
        className="relative flex justify-center items-center"
        style={{
          transform: 'scaleX(1)',
          transformOrigin: 'center center',
          transition: 'transform 0.5s ease-in-out' // 振り返るのもゆっくり
        }}
      >
        {/* Cute Custom SVG Snail instead of Emoji */}
        <div 
          ref={iconRef}
          className="origin-bottom"
          style={{
            animationDuration: '3s', // 呼吸するようなゆっくりパルス
          }}
        >
          <svg width="60" height="50" viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
            {/* Antennae */}
            <line x1="42" y1="36" x2="38" y2="18" stroke="#D6D3D1" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="46" y1="36" x2="52" y2="18" stroke="#D6D3D1" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Eyes */}
            <circle cx="38" cy="18" r="2.5" fill="#27272A" />
            <circle cx="52" cy="18" r="2.5" fill="#27272A" />

            {/* Snail Body (Realistic Warm Gray/Stone color) */}
            <path d="M 10 42 L 46 42 A 5 5 0 0 0 46 32 L 20 32 A 10 10 0 0 0 10 42 Z" fill="#E7E5E4" />

            {/* Snail Shell (Realistic Amber/Brown) */}
            <circle cx="26" cy="24" r="16" fill="#D97706" />
            
            {/* Shell Spiral Details (Darker Brown) */}
            <path d="M 26 24 a 4 4 0 0 0 -8 0 a 8 8 0 0 0 16 0 a 12 12 0 0 0 -24 0" stroke="#92400E" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SnailMascot;
