import React, { useMemo } from 'react';

const FallingSakura = () => {
  const sakuraPetals = useMemo(() => {
    // CSSで描いた花びらのみを使用する
    // ピンクの濃淡を表現するためのクラスカラー
    const petalColors = ['bg-pink-300', 'bg-pink-200', 'bg-pink-400/80', 'bg-rose-300'];
    
    return Array.from({ length: 25 }).map((_, i) => {
      const colorClass = petalColors[Math.floor(Math.random() * petalColors.length)];
      return {
        id: i,
        colorClass,
        left: `${Math.random() * 100}%`,
        animationDuration: `${4 + Math.random() * 6}s`,   // Between 4s and 10s to fall
        animationDelay: `${-Math.random() * 10}s`,        // Start at different times
        size: `${6 + Math.random() * 6}px`,               // Smaller pieces just like real petals
        swayDuration: `${2.5 + Math.random() * 3}s`,      // Sway left right at different speeds
        opacity: 0.5 + Math.random() * 0.4,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-80">
      {sakuraPetals.map((petal) => (
        <div
          key={petal.id}
          className="absolute -top-10 animate-sakura-fall flex justify-center"
          style={{
            left: petal.left,
            animationDuration: petal.animationDuration,
            animationDelay: petal.animationDelay,
            opacity: petal.opacity,
          }}
        >
            <div 
              className="animate-sakura-sway"
              style={{
                animationDuration: petal.swayDuration,
                animationDirection: 'alternate',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out'
              }}
            >
              {/* 花びら型のドット（ピンクの楕円） */}
              <div 
                className={`${petal.colorClass} rounded-full rounded-tl-none transform rotate-45 shadow-sm`}
                style={{ width: petal.size, height: `calc(${petal.size} * 1.6)` }}
              ></div>
            </div>
        </div>
      ))}
    </div>
  );
};

export default FallingSakura;
