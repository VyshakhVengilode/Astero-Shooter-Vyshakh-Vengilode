import React, { memo } from 'react';

interface HUDProps {
  score: number;
  level: number;
  lives: number;
  combo: number;
}

// Using memo prevents the HUD from re-rendering unless one of these props actually changes
const HUD: React.FC<HUDProps> = memo(({ score, level, lives, combo }) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-3 xs:p-4 sm:p-6 md:p-8 z-30 flex flex-col select-none">
      <div className="flex justify-between items-start w-full">
        
        {/* Top Left: Score, Level, and Combo */}
        <div className="flex flex-col">
          <div className="text-[#ffd700] text-lg xs:text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] leading-none tabular-nums">
            {score.toString().padStart(6, '0')}
          </div>
          
          <div className="text-white text-[8px] xs:text-[10px] sm:text-sm md:text-base tracking-[0.2em] font-bold uppercase opacity-80 mt-1">
            SECTOR {level}
          </div>

          {/* Combo Meter - Added a slight bounce animation when combo increases */}
          <div 
            className={`text-[#ff00ff] text-[10px] xs:text-sm sm:text-lg md:text-2xl font-black transition-all duration-300 drop-shadow-[0_0_15px_#ff00ff] mt-1 sm:mt-2 uppercase italic
            ${combo > 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
          >
            Combo x{combo}
          </div>
        </div>

        {/* Top Right: Lives Display (Dynamic) */}
        <div className="flex gap-1 xs:gap-1.5 sm:gap-2">
          {/* We use Math.max to handle potential edge cases where lives might drop below 0 */}
          {[...Array(Math.max(0, lives > 3 ? lives : 3))].map((_, i) => (
            <div 
              key={i}
              className={`w-2.5 h-2.5 xs:w-3.5 xs:h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-all duration-500 shadow-[0_0_10px_rgba(255,68,68,0.6)]
              ${i < lives ? 'bg-[#ff4444] opacity-100 scale-100' : 'bg-gray-800 opacity-20 scale-75'}`}
              style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
            />
          ))}
        </div>
      </div>

      {/* Optional: Add a subtle vignette or scanline effect overlay here if desired */}
    </div>
  );
});

// Set display name for debugging since we used memo
HUD.displayName = 'HUD';

export default HUD;
