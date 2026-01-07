
import React from 'react';

interface HUDProps {
  score: number;
  level: number;
  lives: number;
  combo: number;
}

const HUD: React.FC<HUDProps> = ({ score, level, lives, combo }) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-3 xs:p-4 sm:p-6 md:p-8 z-30 flex flex-col">
      <div className="flex justify-between items-start w-full">
        {/* Top Left: Score and Level */}
        <div className="flex flex-col">
          <div className="text-[#ffd700] text-lg xs:text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter drop-shadow-lg leading-none">
            {score.toString().padStart(5, '0')}
          </div>
          <div className="text-white text-[8px] xs:text-[10px] sm:text-sm md:text-base tracking-widest font-bold uppercase opacity-80 mt-1">
            LEVEL {level}
          </div>
          {/* Combo below score */}
          <div 
            className={`text-[#ff00ff] text-[10px] xs:text-sm sm:text-lg md:text-2xl font-bold transition-all duration-200 drop-shadow-[0_0_10px_#ff00ff] mt-1 sm:mt-2 ${combo > 1 ? 'opacity-100' : 'opacity-0'}`}
          >
            COMBO X{combo}
          </div>
        </div>

        {/* Top Right: Lives triangles */}
        <div className="flex gap-1 xs:gap-1.5 sm:gap-2">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className={`w-2.5 h-2.5 xs:w-3.5 xs:h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-[#ff4444] transition-all duration-300 shadow-[0_0_6px_rgba(255,68,68,0.5)] ${i < lives ? 'opacity-100 scale-100' : 'opacity-20 scale-75'}`}
              style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HUD;
