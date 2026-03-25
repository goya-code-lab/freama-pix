import React, { useMemo } from 'react';

const FallingSnow = () => {
  const snowflakes = useMemo(() => {
    // ❄️や❅の絵文字と、シンプルな円（CSSドット）を混ぜる
    const symbols = ['❄️', '❅', 'dot', 'dot', 'dot', 'dot'];
    
    return Array.from({ length: 25 }).map((_, i) => {
      const type = symbols[Math.floor(Math.random() * symbols.length)];
      return {
        id: i,
        type,
        left: `${Math.random() * 100}%`,
        animationDuration: `${3 + Math.random() * 5}s`,   // Between 3s and 8s to fall
        animationDelay: `${-Math.random() * 8}s`,         // Start at different times
        size: type === 'dot' ? `${4 + Math.random() * 6}px` : `${0.8 + Math.random() * 0.5}rem`,
        swayDuration: `${2 + Math.random() * 2}s`,        // Sway left right at different speeds
        opacity: 0.3 + Math.random() * 0.5,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute -top-10 animate-snow-fall flex justify-center"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            opacity: flake.opacity,
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
              {flake.type === 'dot' ? (
                // ドット型の雪（明るいテーマでも見えるように薄い青みのグレー）
                <div 
                  className="bg-blue-100 rounded-full blur-[0.5px] shadow-sm"
                  style={{ width: flake.size, height: flake.size }}
                ></div>
              ) : (
                // 結晶型の雪
                <div
                  className="text-blue-100/80 drop-shadow-sm"
                  style={{ fontSize: flake.size }}
                >
                  {flake.type}
                </div>
              )}
            </div>
        </div>
      ))}
    </div>
  );
};

export default FallingSnow;
