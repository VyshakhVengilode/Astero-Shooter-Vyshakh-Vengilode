
import * as THREE from 'three';

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

export interface LeaderboardEntry {
  name: string;
  score: number;
}

// Fix: Using intersection types ensures that all THREE.Mesh properties (including position, rotation, etc.) 
// are correctly inherited and accessible on instances of Particle.
export type Particle = THREE.Mesh & {
  userData: {
    vel: THREE.Vector3;
    life: number;
  };
};

// Fix: Using intersection types ensures that all THREE.Mesh properties (including position, rotation, etc.) 
// are correctly inherited and accessible on instances of Asteroid.
export type Asteroid = THREE.Mesh & {
  userData: {
    type: 'gold' | 'std';
    radius: number;
    rotSpeed?: {
      x: number;
      y: number;
      z: number;
    };
  };
};
