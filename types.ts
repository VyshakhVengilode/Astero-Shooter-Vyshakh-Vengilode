import * as THREE from 'three';

/**
 * Global State for the React Application
 */
export interface GameState {
  score: number;
  level: number;
  lives: number;
  active: boolean;
  mouse: THREE.Vector2;
  speedMult: number;
  powerup: number;
  combo: number;
  lastHitTime: number;
  keys: { [key: string]: boolean };
}

/**
 * Persistence data for the leaderboard
 */
export interface LeaderboardEntry {
  name: string;
  score: number;
}

/**
 * Custom Particles
 * We extend the THREE.Mesh type to ensure 'userData' is strictly typed
 */
export interface Particle extends THREE.Mesh {
  userData: {
    vel: THREE.Vector3;
    life: number;
  };
}

/**
 * Custom Asteroids
 * We add rotSpeed and radius to the userData for physics calculations
 */
export interface Asteroid extends THREE.Mesh {
  userData: {
    type: 'gold' | 'std';
    radius: number;
    rotSpeed: {
      x: number;
      y: number;
      z: number;
    };
  };
}
