import React, { useMemo } from 'react';

const AutumnLeaves = () => {
  // Create an array of leaves with random properties so they fall organically
  const leaves = useMemo(() => {
    const leafEmojis = ['🍁', '🍂', '🍁'];
    
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      emoji: leafEmojis[Math.floor(Math.random() * leafEmojis.length)],
      left: `${Math.random() * 100}%`,
      animationDuration: `${5 + Math.random() * 5}s`,   // Between 5s and 10s to fall
      animationDelay: `${-Math.random() * 8}s`,         // Start at different times (negative so they are already mid-air)
      size: `${1 + Math.random() * 0.8}rem`,            // Differing sizes
      swayDuration: `${2 + Math.random() * 2}s`,        // Sway left right at different speeds
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute -top-10 animate-leaf-fall flex justify-center w-8"
          style={{
            left: leaf.left,
            animationDuration: leaf.animationDuration,
            animationDelay: leaf.animationDelay,
          }}
        >
            <div 
              className="animate-leaf-sway"
              style={{
                fontSize: leaf.size,
                animationDuration: leaf.swayDuration,
                animationDirection: 'alternate',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out'
              }}
            >
              {leaf.emoji}
            </div>
        </div>
      ))}
    </div>
  );
};

export default AutumnLeaves;
