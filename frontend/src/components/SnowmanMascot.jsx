import React, { useEffect, useRef } from 'react';

const SnowmanMascot = () => {
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
      
      if (Math.abs(distance) > 5) {
        if (!isMoving.current) {
          isMoving.current = true;
          // 雪だるまはゆっくり揺れながら進む（waddle）
          if (iconRef.current) iconRef.current.classList.add('animate-bounce');
          if (dustRef.current) dustRef.current.style.display = 'block';
        }
        
        // Determine direction
        const dir = distance > 0 ? 1 : -1;
        if (dir !== currentDirection.current) {
            currentDirection.current = dir;
            if (flipContainerRef.current) {
                // ⛄ のデフォルトの向きに応じて反転
                flipContainerRef.current.style.transform = `scaleX(${-dir})`;
            }
        }
        
        // 雪だるまなのでリスより少しゆっくり
        const speed = Math.max(0.5, Math.min(2.5, Math.abs(distance) * 0.02));
        currentX.current += dir * speed;
        
        if (containerRef.current) {
            containerRef.current.style.transform = `translateX(${currentX.current}px)`;
        }
      } else {
        if (isMoving.current) {
            isMoving.current = false;
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
        {/* Snowman Emoji */}
        <div 
          ref={iconRef}
          className="text-6xl origin-bottom"
          style={{
            animationDuration: '0.5s', // ゆっくりバウンス
            filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.15))'
          }}
        >
          ⛄
        </div>
        
        {/* Snow dust effect (sliding on snow) */}
        <div 
          ref={dustRef} 
          className="absolute bottom-1 -left-5 w-8 h-2 bg-blue-100 rounded-full opacity-60 animate-pulse hidden"
          style={{ animationDuration: '0.6s' }}
        ></div>
      </div>
    </div>
  );
};

export default SnowmanMascot;
