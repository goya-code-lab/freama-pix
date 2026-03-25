import React, { useEffect, useRef } from 'react';

const WinterSantaMascot = () => {
  const sledRef = useRef(null);
  const santaRef = useRef(null);
  
  const targetX = useRef(100);
  const sledX = useRef(100);
  const santaX = useRef(100);
  
  const sledDir = useRef(-1); // Start facing left natively (Standard emoji behavior)
  const isRiding = useRef(false);

  useEffect(() => {
    targetX.current = window.innerWidth / 2;
    sledX.current = targetX.current - 150;
    santaX.current = sledX.current - 100;

    const handleMouseMove = (e) => {
      const padding = 40;
      targetX.current = Math.max(padding, Math.min(window.innerWidth - padding, e.clientX));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrameId;

    const animate = () => {
      // 1. Sled moves toward mouse
      const sledDist = targetX.current - sledX.current;
      if (Math.abs(sledDist) > 5) {
        const dir = sledDist > 0 ? 1 : -1;
        sledDir.current = dir;
        const sledSpeed = Math.max(3, Math.min(10, Math.abs(sledDist) * 0.08));
        sledX.current += dir * sledSpeed;
        if (sledRef.current) sledRef.current.classList.add('animate-pulse');
      } else {
        if (sledRef.current) sledRef.current.classList.remove('animate-pulse');
      }

      // 2. Santa logic
      if (isRiding.current) {
        // 乗っている時はソリのコンテナの後方（トナカイの逆側）に座標をオフセットする
        const rideOffset = -sledDir.current * 24; 
        santaX.current = sledX.current + rideOffset;
        
        if (Math.abs(targetX.current - sledX.current) > 200) {
            isRiding.current = false;
        }
      } else {
        const santaDist = sledX.current - santaX.current;
        // 追いつくためのターゲット座標はソリの後方
        const targetSantaX = sledX.current - sledDir.current * 30;
        const chaseDist = targetSantaX - santaX.current;
        
        if (Math.abs(chaseDist) > 10) {
            const dir = chaseDist > 0 ? 1 : -1;
            const santaSpeed = Math.max(1.5, Math.min(6, Math.abs(chaseDist) * 0.04));
            santaX.current += dir * santaSpeed;
        } else {
            isRiding.current = true;
        }
      }
      
      // Update DOM
      if (sledRef.current) {
          // ネイティブが左向きなので、右に進む時(dir=1)に反転(scaleX(-1))させる
          sledRef.current.style.transform = `translateX(${sledX.current}px) scaleX(${-sledDir.current})`;
      }
      if (santaRef.current) {
          const sDir = isRiding.current ? sledDir.current : (sledX.current - santaX.current > 0 ? 1 : -1);
          // サンタも左向きSVGなので同様に進行方向に向けて反転(-sDir)
          santaRef.current.style.transform = `translateX(${santaX.current}px) scaleX(${-sDir})`;
          
          if (isRiding.current) {
              santaRef.current.className = "absolute transition-all duration-200 bottom-4 drop-shadow-sm origin-bottom";
          } else {
              santaRef.current.className = "absolute transition-all duration-200 bottom-1 animate-bounce drop-shadow-sm origin-bottom";
          }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* 
        Sled Container. 
        Native flex order (Emojis natively face LEFT): 🦌 (Left) 🛷 (Right) -> Moves Left.
        Flipped (via scaleX(-1)): 🛷 (Left) 🦌 (Right) -> Moves Right.
      */}
      <div 
        ref={sledRef} 
        className="absolute flex items-end bottom-2 drop-shadow-md origin-bottom -translate-x-1/2"
        style={{ willChange: 'transform' }}
      >
        <div className="text-4xl relative z-10">🦌</div>
        <div className="text-4xl text-amber-800 relative z-0 -ml-2">🛷</div>
      </div>
      
      <div 
        ref={santaRef} 
        className="absolute bottom-1 animate-bounce drop-shadow-sm origin-bottom -translate-x-1/2"
        style={{ willChange: 'transform' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="20" y1="28" x2="16" y2="38" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
            <line x1="25" y1="28" x2="30" y2="38" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
            <line x1="16" y1="36" x2="12" y2="38" stroke="#1F2937" strokeWidth="5" strokeLinecap="round" />
            <line x1="30" y1="36" x2="34" y2="38" stroke="#1F2937" strokeWidth="5" strokeLinecap="round" />
            <rect x="18" y="16" width="14" height="15" rx="5" fill="#EF4444" />
            <rect x="18" y="24" width="14" height="3" fill="#1F2937" />
            <rect x="20" y="23" width="3" height="5" fill="#FBBF24" />
            <circle cx="18" cy="14" r="6" fill="#FFEDD5" />
            <circle cx="15" cy="13" r="1.5" fill="#1F2937" />
            <path d="M 12 15 A 6 6 0 0 0 24 15 A 6 8 0 0 1 12 15 Z" fill="#FFFFFF" />
            <circle cx="16" cy="19" r="4" fill="#FFFFFF" />
            <circle cx="20" cy="18" r="3" fill="#FFFFFF" />
            <circle cx="13" cy="16" r="3" fill="#FFFFFF" />
            <path d="M 12 10 Q 18 2 24 10 Z" fill="#EF4444" />
            <rect x="11" y="8" width="14" height="3" rx="1.5" fill="#FFFFFF" />
            <circle cx="10" cy="7" r="2.5" fill="#FFFFFF" />
            <line x1="24" y1="20" x2="16" y2="24" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            <circle cx="16" cy="24" r="3" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  );
};

export default WinterSantaMascot;
