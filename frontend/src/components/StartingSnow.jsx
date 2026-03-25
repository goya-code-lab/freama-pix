import React, { useMemo } from 'react';

const StartingSnow = () => {
  const snowFlakes = useMemo(() => {
    const symbols = ['❅', '❆', '✧'];
    
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      left: `${Math.random() * 100}%`,
      animationDuration: `${12 + Math.random() * 18}s`,
      animationDelay: `${-Math.random() * 30}s`,
      size: `${1 + Math.random() * 1.5}rem`,
      swayDuration: `${4 + Math.random() * 6}s`,
      opacity: 0.5 + Math.random() * 0.5,
      blur: Math.random() > 0.6 ? 'blur(1px)' : 'none',
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-t from-sky-50/50 to-transparent"></div>
      
      {/* 舞い落ちる薄水色の雪の結晶 */}
      {snowFlakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute -top-10 animate-snow-fall flex justify-center"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            opacity: flake.opacity,
            filter: flake.blur,
          }}
        >
            <div 
              className="animate-snow-sway"
              style={{
                animationDuration: flake.swayDuration,
                animationDirection: 'alternate',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out'
              }}
            >
              <div 
                className="drop-shadow-sm font-sans"
                style={{ 
                    fontSize: flake.size, 
                    // 薄い水色（Tailwindの sky-300 / sky-200 相当の色味）にする
                    color: Math.random() > 0.5 ? '#7DD3FC' : '#BAE6FD' 
                }}
              >
                {flake.symbol}
              </div>
            </div>
        </div>
      ))}
    </div>
  );
};

export default StartingSnow;
