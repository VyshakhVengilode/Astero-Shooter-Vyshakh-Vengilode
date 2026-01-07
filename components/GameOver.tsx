import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { getMissionDebrief } from '../services/geminiService';

interface GameOverProps {
  score: number;
  level: number;
  combo: number;
  leaderboard: LeaderboardEntry[];
  onRestart: () => void;
  onSaveScore: (name: string, score: number) => void;
}

const GameOver: React.FC<GameOverProps> = ({ 
  score, 
  level, 
  combo, 
  leaderboard, 
  onRestart, 
  onSaveScore 
}) => {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [debrief, setDebrief] = useState<string | null>(null);
  const [loadingDebrief, setLoadingDebrief] = useState(false);

  const isHighScore = leaderboard.length < 10 || score > (leaderboard[leaderboard.length - 1]?.score || 0);

  useEffect(() => {
    let isMounted = true; // Fix: Prevent state updates on unmounted component

    const fetchDebrief = async () => {
      setLoadingDebrief(true);
      try {
        const msg = await getMissionDebrief(score, level, combo);
        if (isMounted) {
          setDebrief(msg);
        }
      } catch (error) {
        console.error("AI Debrief failed:", error);
        if (isMounted) setDebrief("Communications disrupted. Mission data logged.");
      } finally {
        if (isMounted) setLoadingDebrief(false);
      }
    };

    fetchDebrief();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [score, level, combo]);

  const handleSave = () => {
    if (name.trim()) {
      onSaveScore(name.toUpperCase().slice(0, 10), score);
      setSaved(true);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-[100] text-white p-6 overflow-y-auto backdrop-blur-md">
      <div className="w-full max-w-2xl flex flex-col items-center">
        
        {/* Header */}
        <h2 className="text-red-600 text-3xl sm:text-5xl md:text-7xl font-black mb-6 md:mb-10 drop-shadow-[0_0_20px_#ff0000] text-center animate-pulse leading-tight tracking-tighter">
          MISSION FAILED
        </h2>

        {/* AI Debrief Section */}
        <div className="w-full mb-6 md:mb-10 p-4 border border-cyan-500/30 bg-cyan-950/20 rounded-lg text-center backdrop-blur-sm min-h-[80px] flex flex-col justify-center">
          <p className="text-cyan-400 text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-2 font-bold italic opacity-70">
            — Intelligence Report —
          </p>
          {loadingDebrief ? (
            <div className="flex justify-center items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          ) : (
            <p className="text-white text-xs sm:text-sm md:text-base italic font-['Anek_Malayalam'] leading-relaxed">
              "{debrief || "No intelligence data available for this sector."}"
            </p>
          )}
        </div>

        {/* High Score Input */}
        {isHighScore && !saved && (
          <div className="flex flex-col items-center gap-3 sm:gap-4 mb-8 w-full animate-in fade-in zoom-in duration-500">
            <p className="text-yellow-400 text-[10px] sm:text-xs md:text-sm tracking-widest text-center uppercase font-bold">
              NEW RECORD DETECTED! ENTER PILOT TAG:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs sm:max-w-md justify-center">
              <input 
                type="text" 
                maxLength={10}
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="PILOT NAME"
                className="bg-black/50 border border-cyan-400/50 p-2 text-center focus:outline-none focus:border-cyan-400 uppercase text-sm sm:text-base w-full text-cyan-300 font-mono"
              />
              <button 
                onClick={handleSave}
                className="bg-cyan-600 hover:bg-cyan-400 text-black px-8 py-2 font-black transition-all text-xs sm:text-sm uppercase tracking-widest active:scale-95"
              >
                LOG DATA
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="w-full max-w-sm border-t border-gray-800 pt-6">
          <div className="flex justify-between text-cyan-500 text-[10px] sm:text-xs tracking-widest mb-4 px-2 font-black uppercase">
            <span>OPERATIVE</span>
            <span>RANK SCORE</span>
          </div>
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <div 
                key={`${entry.name}-${entry.score}-${i}`} 
                className={`flex justify-between text-xs sm:text-sm py-1.5 px-2 transition-colors ${
                  i === 0 ? 'bg-yellow-500/10 text-yellow-500' : 'text-gray-400'
                }`}
              >
                <span className="font-bold">
                  <span className="opacity-50 mr-2">{i + 1}.</span>
                  {entry.name}
                </span>
                <span className="font-mono font-bold tracking-tight">
                  {entry.score.toLocaleString()}
                </span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="text-center text-gray-600 italic py-4 text-xs">No records found in this sector.</p>
            )}
          </div>
        </div>

        {/* Restart Button */}
        <button 
          onClick={onRestart}
          className="mt-10 md:mt-14 text-cyan-400 animate-bounce tracking-[0.4em] font-black text-xs sm:text-sm uppercase hover:text-white transition-colors active:scale-90"
        >
          RESTART MISSION
        </button>
      </div>
    </div>
  );
};

export default GameOver;
