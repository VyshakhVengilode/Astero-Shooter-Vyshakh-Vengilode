
import React, { useState, useEffect, useCallback } from 'react';
import Game from './components/Game';
import HUD from './components/HUD';
import GameOver from './components/GameOver';
import { GameState, LeaderboardEntry } from './types';
import * as THREE_LIB from 'three';

const INITIAL_GAME_STATE: GameState = {
  score: 0,
  level: 1,
  lives: 3,
  active: true,
  mouse: new THREE_LIB.Vector2(),
  speedMult: 1,
  powerup: 0,
  combo: 0,
  lastHitTime: 0,
  keys: {}
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('astero_leaderboard');
    if (saved) setLeaderboard(JSON.parse(saved));
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setGameState(prev => ({ ...prev, active: false }));
  }, []);

  const restartGame = useCallback(() => {
    setGameState({ ...INITIAL_GAME_STATE, active: true });
  }, []);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Branding: Centered and responsive font sizes */}
      <div className="absolute top-3 sm:top-6 left-0 w-full text-center z-20 pointer-events-none px-2 flex flex-col items-center">
        <h1 className="text-white text-lg xs:text-xl sm:text-3xl md:text-4xl lg:text-6xl font-black tracking-[0.1em] xs:tracking-[0.2em] drop-shadow-[0_0_15px_#00d2ff] uppercase leading-tight max-w-[80vw]">
          Astero Shooter
        </h1>
        <p className="text-[#00d2ff] text-[7px] xs:text-[9px] sm:text-xs md:text-sm font-['Anek_Malayalam'] tracking-widest opacity-90 mt-0.5 sm:mt-1">
          Developed by Vyshakh Vengilode
        </p>
      </div>

      {/* Game Engine */}
      <Game 
        gameState={gameState} 
        onUpdate={updateGameState}
        onGameOver={handleGameOver}
      />

      {/* Responsive HUD */}
      <HUD 
        score={gameState.score}
        level={gameState.level}
        lives={gameState.lives}
        combo={gameState.combo}
      />

      {/* Game Over Screen */}
      {!gameState.active && (
        <GameOver 
          score={gameState.score} 
          level={gameState.level}
          combo={gameState.combo}
          leaderboard={leaderboard}
          onRestart={restartGame}
          onSaveScore={(name, score) => {
            const newLB = [...leaderboard, { name, score }]
              .sort((a, b) => b.score - a.score)
              .slice(0, 10);
            setLeaderboard(newLB);
            localStorage.setItem('astero_leaderboard', JSON.stringify(newLB));
          }}
        />
      )}
    </div>
  );
}
