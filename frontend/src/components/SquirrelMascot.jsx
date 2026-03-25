import React, { useEffect, useRef } from 'react';

const SquirrelMascot = () => {
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
    // Sync starting position with typical initial cursor position visually
    targetX.current = window.innerWidth / 2;
    currentX.current = window.innerWidth / 2;
    
    if (containerRef.current) {
        containerRef.current.style.transform = `translateX(${currentX.current}px)`;
    }

    const handleMouseMove = (e) => {
      // Offset slightly so it follows the cursor center but stays at the bottom border
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
          // Start bounce animation
          if (iconRef.current) iconRef.current.classList.add('animate-bounce');
          if (dustRef.current) dustRef.current.style.display = 'block';
        }
        
        // Determine direction
        const dir = distance > 0 ? 1 : -1;
        if (dir !== currentDirection.current) {
            currentDirection.current = dir;
            if (flipContainerRef.current) {
                // 🐿️ faces left naturally.
                // Moving right (dir = 1), scaleX = -1 (flip to face right)
                // Moving left (dir = -1), scaleX = 1 (normal, face left)
                flipContainerRef.current.style.transform = `scaleX(${-dir})`;
            }
        }
        
        // Speed scaling based on distance (closer = slower)
        const speed = Math.max(1, Math.min(3, Math.abs(distance) * 0.03));
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
      className="absolute top-1/2 -translate-y-[50%] left-0 z-0 pointer-events-none drop-shadow-sm opacity-60"
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
          transition: 'transform 0.1s ease-in-out' // Smooth flipping
        }}
      >
        {/* Squirrel Emoji */}
        <div 
          ref={iconRef}
          className="text-6xl origin-bottom"
          style={{
            animationDuration: '0.25s', // slightly faster bounce
            filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))'
          }}
        >
          🐿️
        </div>
        
        {/* Dust Effect Container */}
        <div 
          ref={dustRef} 
          className="absolute bottom-0 -left-4 w-6 h-2 bg-gray-300 rounded-full opacity-40 animate-ping hidden"
          style={{ animationDuration: '0.4s' }}
        ></div>
      </div>
    </div>
  );
};

export default SquirrelMascot;
