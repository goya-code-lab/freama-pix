import React, { useMemo } from 'react';

const FallingRain = () => {
  const rainDrops = useMemo(() => {
    // 雨粒（縦長の細い線）を生成
    return Array.from({ length: 30 }).map((_, i) => {
      // 細い雨粒か、ほんの少し太めの雨粒か
      const isThick = Math.random() > 0.8;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${0.6 + Math.random() * 0.6}s`,   // ポツポツなので少し速めに落ちる（0.6〜1.2秒）
        animationDelay: `${-Math.random() * 2}s`,             // Start at different times
        width: isThick ? '2px' : '1px',
        height: `${10 + Math.random() * 15}px`,               // 長さ
        opacity: 0.2 + Math.random() * 0.4,                   // 透明度で遠近感
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {rainDrops.map((drop) => (
        <div
          key={drop.id}
          className="absolute -top-10 animate-rain-fall"
          style={{
            left: drop.left,
            width: drop.width,
            height: drop.height,
            backgroundColor: 'currentColor', // CSSクラスで色をつける
            animationDuration: drop.animationDuration,
            animationDelay: drop.animationDelay,
            opacity: drop.opacity,
          }}
        >
          <div className="w-full h-full bg-blue-400 rounded-full"></div>
        </div>
      ))}
    </div>
  );
};

export default FallingRain;
