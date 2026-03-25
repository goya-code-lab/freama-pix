import React, { useMemo } from 'react';

const SunflowerField = () => {
  // 後景（遠くの景色：小さくて遅い）
  const bgItemsBack = useMemo(() => Array.from({ length: 45 }).map((_, i) => {
    const isFlower = Math.random() > 0.4;
    const type = isFlower ? '🌻' : (Math.random() > 0.6 ? '🌿' : '🌾');
    const yOffset = -15 + Math.random() * 20; // 縦のランダム配置
    const scale = 0.35 + Math.random() * 0.25; // 遠景なので小さめ
    return (
      <div 
        key={`b${i}`} 
        className="opacity-50 absolute text-4xl" 
        style={{ 
            bottom: `${15 - yOffset}px`, 
            left: `${Math.random() * 100}%`, 
            transform: `scale(${scale})`,
            filter: 'blur(0.5px)' // 遠くは少しぼかす
        }}
      >
        {type}
      </div>
    );
  }), []);

  // 前景（近くの景色：大きくて速い）
  const bgItemsFront = useMemo(() => Array.from({ length: 30 }).map((_, i) => {
    const isFlower = Math.random() > 0.5;
    const type = isFlower ? '🌻' : (Math.random() > 0.5 ? '🌿' : '🌾');
    const yOffset = -5 + Math.random() * 10;
    const scale = 0.7 + Math.random() * 0.4; // 近景なので大きめ
    return (
      <div 
        key={`f${i}`} 
        className="opacity-90 absolute text-4xl" 
        style={{ 
            bottom: `${yOffset}px`, 
            left: `${Math.random() * 100}%`, 
            transform: `scale(${scale})`,
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))'
        }}
      >
        {type}
      </div>
    );
  }), []);

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden h-32 z-0">
      <div className="absolute inset-0 bg-gradient-to-t from-green-50/30 to-transparent"></div>
      
      {/* Back Layer - ゆっくり（遠景） */}
      <div className="absolute bottom-6 flex w-[200vw] h-full animate-bg-scroll" style={{ animationDuration: '90s' }}>
        <div className="relative w-1/2 h-full">{bgItemsBack}</div>
        <div className="relative w-1/2 h-full">{bgItemsBack}</div>
      </div>
      
      {/* Front Layer - 標準の速さ（近景） */}
      <div className="absolute bottom-[-10px] flex w-[200vw] h-full animate-bg-scroll" style={{ animationDuration: '45s' }}>
        <div className="relative w-1/2 h-full">{bgItemsFront}</div>
        <div className="relative w-1/2 h-full">{bgItemsFront}</div>
      </div>
    </div>
  );
};

export default SunflowerField;
