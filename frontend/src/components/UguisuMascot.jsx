import React, { useEffect, useRef } from 'react';

const UguisuMascot = () => {
  const containerRef = useRef(null);
  const flipContainerRef = useRef(null);
  const iconRef = useRef(null);
  const dustRef = useRef(null);
  
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
          // 小鳥（うぐいす）なので小刻みに早く跳ねる（animate-bounceをCSSで速くする）
          if (iconRef.current) iconRef.current.classList.add('animate-bounce');
          if (dustRef.current) dustRef.current.style.display = 'block';
        }
        
        // Determine direction
        const dir = distance > 0 ? 1 : -1;
        if (dir !== currentDirection.current) {
            currentDirection.current = dir;
            if (flipContainerRef.current) {
                // 鳥の絵文字は左向き（🐦）なので、右へ行く時（dir=1）は scaleX(-1)
                flipContainerRef.current.style.transform = `scaleX(${-dir})`;
            }
        }
        
        // 小鳥なのでリスより少し早めで身軽な動き
        const speed = Math.max(1.5, Math.min(4.5, Math.abs(distance) * 0.04));
        currentX.current += dir * speed;
        
        // Apply position
        if (containerRef.current) {
            containerRef.current.style.transform = `translateX(${currentX.current}px)`;
        }
      } else {
        if (isMoving.current) {
            isMoving.current = false;
            // Stop animations
            if (iconRef.current) iconRef.current.classList.remove('animate-bounce');
            if (dustRef.current) dustRef.current.style.display = 'none';
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
      className="absolute top-1/2 -translate-y-[50%] left-0 z-0 pointer-events-none drop-shadow-sm opacity-80"
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
          transition: 'transform 0.1s ease-in-out'
        }}
      >
        {/* Bird Emoji (Uguisu styling) */}
        <div 
          ref={iconRef}
          className="text-6xl origin-bottom"
          style={{
            animationDuration: '0.2s', // ぴょんぴょん速く跳ねる
            filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.15)) hue-rotate(60deg) saturate(0.8)' // 青い鳥を緑がかったうぐいす色っぽくする実験
          }}
        >
          🐦
        </div>
        
        {/* Dust Effect Container (風切り羽のようなエフェクト) */}
        <div 
          ref={dustRef} 
          className="absolute bottom-1 -left-4 w-4 h-1 bg-green-200/50 rounded-full opacity-60 animate-ping hidden"
          style={{ animationDuration: '0.3s' }}
        ></div>
      </div>
    </div>
  );
};

export default UguisuMascot;
