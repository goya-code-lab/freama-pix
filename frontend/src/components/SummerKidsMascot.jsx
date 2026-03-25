import React, { useEffect, useRef } from 'react';

const SummerKidsMascot = () => {
  const containerRef = useRef(null);
  const flipContainerRef = useRef(null);
  const iconRef = useRef(null);
  const dustRef = useRef(null);
  
  const targetX = useRef(100);
  const currentX = useRef(100);
  const isMoving = useRef(false);
  const currentDirection = useRef(1);

  useEffect(() => {
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
          if (iconRef.current) iconRef.current.classList.add('animate-bounce');
          if (dustRef.current) dustRef.current.style.display = 'block';
        }
        
        const dir = distance > 0 ? 1 : -1;
        if (dir !== currentDirection.current) {
            currentDirection.current = dir;
            if (flipContainerRef.current) {
                // SVG is facing right
                flipContainerRef.current.style.transform = `scaleX(${dir})`;
            }
        }
        
        // 元気に虫取りに走るスピード
        const speed = Math.max(2.0, Math.min(5.5, Math.abs(distance) * 0.04));
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
      className="absolute top-1/2 -translate-y-[40%] left-0 z-10 pointer-events-none drop-shadow-md opacity-95"
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
          transition: 'transform 0.15s ease-in-out'
        }}
      >
        {/* Custom SVG: Boy with Straw Hat and Bug Net */}
        <div 
          ref={iconRef}
          className="origin-bottom"
          style={{ animationDuration: '0.4s' }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            {/* Bug Net Stick */}
            <line x1="15" y1="65" x2="68" y2="28" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
            
            {/* Net Bag (Hanging down from hoop) */}
            <path d="M 64 24 Q 72 45 76 34" fill="rgba(255,255,255,0.6)" stroke="#D1D5DB" strokeWidth="1" />
            
            {/* Net Hoop */}
            <ellipse cx="68" cy="28" rx="10" ry="3" stroke="#D1D5DB" strokeWidth="2.5" fill="none" transform="rotate(-35 68 28)" />

            {/* Back Arm */}
            <path d="M 33 42 L 25 48" stroke="#FDBA74" strokeWidth="5" strokeLinecap="round" />

            {/* Back Leg */}
            <path d="M 36 58 L 30 68" stroke="#FDBA74" strokeWidth="6" strokeLinecap="round" />

            {/* Body */}
            <rect x="29" y="38" width="14" height="14" rx="3" fill="#FFFFFF" />
            
            {/* Shorts */}
            <rect x="28" y="52" width="16" height="8" rx="2" fill="#3B82F6" />

            {/* Front Leg */}
            <path d="M 40 58 L 46 66" stroke="#FDBA74" strokeWidth="6" strokeLinecap="round" />
            
            {/* Head (Skin) */}
            <circle cx="36" cy="28" r="11" fill="#FFEDD5" />
            
            {/* Eye and Smile */}
            <circle cx="42" cy="26" r="1.5" fill="#1F2937" />
            <path d="M 42 32 Q 44 34 46 31" stroke="#1F2937" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <circle cx="44" cy="30" r="2.5" fill="#FCA5A5" opacity="0.8" /> {/* Cheek */}

            {/* Straw Hat Detail (Back rim) */}
            <ellipse cx="36" cy="20" rx="18" ry="4" fill="#FEF08A" />
            {/* Straw Hat Dome */}
            <path d="M 24 20 A 12 14 0 0 1 48 20 Z" fill="#FDE047" />
            {/* Red Ribbon on Hat */}
            <path d="M 24 20 Q 36 24 48 20 L 48 18 Q 36 22 24 18 Z" fill="#EF4444" />
            {/* Straw Hat Detail (Front rim) */}
            <path d="M 18 20 A 18 4 0 0 0 54 20" stroke="#FEF08A" strokeWidth="3" fill="none" />
            
            {/* Front Arm (Holding the stick) */}
            <path d="M 35 42 L 48 45 L 56 38" stroke="#FFEDD5" strokeWidth="5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        
        {/* Dust Effect Container */}
        <div 
          ref={dustRef} 
          className="absolute bottom-0 left-2 w-8 h-2 bg-yellow-100/80 rounded-full opacity-60 animate-ping hidden"
          style={{ animationDuration: '0.4s' }}
        ></div>
      </div>
    </div>
  );
};

export default SummerKidsMascot;
