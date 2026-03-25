import React, { useEffect, useRef } from 'react';

const ButterflyMascot = () => {
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
          // 蝶なのでヒラヒラと速めに揺れる
          if (iconRef.current) iconRef.current.classList.add('animate-bounce');
          if (dustRef.current) dustRef.current.style.display = 'block';
        }
        
        // Determine direction
        const dir = distance > 0 ? 1 : -1;
        if (dir !== currentDirection.current) {
            currentDirection.current = dir;
            if (flipContainerRef.current) {
                // 🦋は左向きなので、右へ行く時は反転させる
                flipContainerRef.current.style.transform = `scaleX(${-dir})`;
            }
        }
        
        // 蝶なのでふんわり素早く移動
        const speed = Math.max(1.5, Math.min(4.0, Math.abs(distance) * 0.035));
        currentX.current += dir * speed;
        
        // Apply position
        if (containerRef.current) {
            containerRef.current.style.transform = `translateX(${currentX.current}px)`;
        }
      } else {
        if (isMoving.current) {
            isMoving.current = false;
            // 止まっている時も羽ばたきを表現するためにゆっくりバウンスさせる等の工夫もできますが
            // ここでは他のマスコットと合わせます
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
      className="absolute top-1/2 -translate-y-[50%] left-0 z-0 pointer-events-none drop-shadow-sm opacity-90"
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
          transition: 'transform 0.2s ease-in-out'
        }}
      >
        {/* Butterfly Emoji */}
        <div 
          ref={iconRef}
          className="text-6xl origin-bottom"
          style={{
            animationDuration: '0.35s', // ヒラヒラ
            // モンシロチョウっぽくするために、青いチョウの絵文字を白黒にして明るくする
            filter: 'grayscale(100%) brightness(180%) drop-shadow(0px 2px 3px rgba(0,0,0,0.15))'
          }}
        >
          🦋
        </div>
        
        {/* りんぷん（鱗粉）のエフェクト */}
        <div 
          ref={dustRef} 
          className="absolute bottom-1 -left-3 w-5 h-5 border-2 border-dashed border-white/50 rounded-full opacity-60 animate-spin hidden"
          style={{ animationDuration: '2s' }}
        ></div>
      </div>
    </div>
  );
};

export default ButterflyMascot;
