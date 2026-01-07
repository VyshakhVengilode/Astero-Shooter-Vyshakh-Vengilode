
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

const GameOver: React.FC<GameOverProps> = ({ score, level, combo, leaderboard, onRestart, onSaveScore }) => {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [debrief, setDebrief] = useState<string | null>(null);
  const [loadingDebrief, setLoadingDebrief] = useState(false);

  const isHighScore = leaderboard.length < 5 || score > (leaderboard[leaderboard.length - 1]?.score || 0);

  useEffect(() => {
    const fetchDebrief = async () => {
      setLoadingDebrief(true);
      const msg = await getMissionDebrief(score, level, combo);
      setDebrief(msg);
      setLoadingDebrief(false);
    };
    fetchDebrief();
  }, [score, level, combo]);

  const handleSave = () => {
    if (name.trim()) {
      onSaveScore(name.toUpperCase(), score);
      setSaved(true);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-[100] text-white p-6 overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <h2 className="text-red-500 text-3xl sm:text-5xl md:text-7xl font-black mb-6 md:mb-10 drop-shadow-[0_0_20px_#ff0000] text-center animate-pulse leading-tight">
          MISSION FAILED
        </h2>

        {debrief && (
          <div className="w-full mb-6 md:mb-10 p-4 border border-cyan-500/30 bg-cyan-950/20 rounded-lg text-center backdrop-blur-sm">
            <p className="text-cyan-400 text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-2 font-bold italic opacity-70">
              — Intelligence Report —
            </p>
            <p className="text-white text-xs sm:text-sm md:text-base italic font-['Anek_Malayalam'] leading-relaxed">
              "{debrief}"
            </p>
          </div>
        )}

        {isHighScore && !saved && (
          <div className="flex flex-col items-center gap-3 sm:gap-4 mb-8 w-full">
            <p className="text-cyan-400 text-[10px] sm:text-xs md:text-sm tracking-widest text-center uppercase font-bold">
              New Record Detected! Enter Pilot Name:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs sm:max-w-md justify-center">
              <input 
                type="text" 
                maxLength={10}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="PILOT NAME"
                className="bg-transparent border border-cyan-400/50 p-2 text-center focus:outline-none focus:ring-1 focus:ring-cyan-400 uppercase text-sm sm:text-base w-full"
              />
              <button 
                onClick={handleSave}
                className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2 font-black transition-colors text-xs sm:text-sm uppercase tracking-widest active:scale-95"
              >
                SAVE
              </button>
            </div>
          </div>
        )}

        <div className="w-full max-w-sm border-t border-gray-800 pt-6">
          <div className="flex justify-between text-cyan-400 text-[10px] sm:text-xs tracking-widest mb-3 px-2 font-bold uppercase">
            <span>PILOT</span>
            <span>SCORE</span>
          </div>
          <div className="space-y-1.5">
            {leaderboard.map((entry, i) => (
              <div key={i} className="flex justify-between text-gray-400 text-xs sm:text-sm border-b border-gray-900/50 py-1.5 px-2 hover:bg-white/5 transition-colors">
                <span className="font-bold">{entry.name}</span>
                <span className="text-yellow-500 font-mono font-bold tracking-tight">{entry.score.toLocaleString()}</span>
              </div>
            ))}
            {leaderboard.length === 0 && <p className="text-center text-gray-600 italic py-4 text-xs">Scanning for past records...</p>}
          </div>
        </div>

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
