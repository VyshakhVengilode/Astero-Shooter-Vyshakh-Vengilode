import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GameState, Asteroid, Particle } from '../types';

interface GameProps {
  gameState: GameState;
  onUpdate: (updates: Partial<GameState>) => void;
  onGameOver: (finalScore: number) => void;
}

const CONFIG = {
  baseSpeed: 0.6,
  bulletSpeed: 2.5,
  spawnRate: 0.08,
  diamondSpawnRate: 0.006,
  comboExpiry: 1500,
  starCount: 3000,
  starScatterArea: 1000,
  starDepth: 1000
};

const Game: React.FC<GameProps> = ({ gameState, onUpdate, onGameOver }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    ship: THREE.Group;
    asteroids: Asteroid[];
    bullets: THREE.Mesh[];
    diamonds: THREE.Mesh[];
    particles: Particle[];
    starField: THREE.Points;
    audioCtx: AudioContext | null;
  } | null>(null);

  const stateRef = useRef(gameState);
  useEffect(() => { stateRef.current = gameState; }, [gameState]);

  const playSound = (freq: number, type: OscillatorType, dur: number, vol = 0.1) => {
    const engine = engineRef.current;
    if (!engine?.audioCtx) return;
    try {
        const ctx = engine.audioCtx;
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
    } catch (e) { /* Audio fails silently to prevent crash */ }
  };

  const spawnExplosion = (pos: THREE.Vector3, color: number, count = 10) => {
    const engine = engineRef.current;
    if (!engine) return;
    const { scene, particles } = engine;
    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.2),
        new THREE.MeshBasicMaterial({ color })
      ) as Particle;
      p.position.copy(pos);
      p.userData = {
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5, 
          (Math.random() - 0.5) * 1.5, 
          (Math.random() - 0.5) * 1.5
        ),
        life: 1.0
      };
      scene.add(p);
      particles.push(p);
    }
    playSound(120, 'sawtooth', 0.2);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1500);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0x4444ff, 0.4));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 15, 10);
    scene.add(sun);

    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(CONFIG.starCount * 3);
    for (let i = 0; i < CONFIG.starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * CONFIG.starScatterArea;
      starPos[i + 1] = (Math.random() - 0.5) * CONFIG.starScatterArea;
      starPos[i + 2] = Math.random() * -CONFIG.starDepth;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starField = new THREE.Points(starGeo, new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.12, 
      transparent: true, 
      opacity: 0.15 
    }));
    scene.add(starField);

    // Ship
    const ship = new THREE.Group();
    const shipMat = new THREE.MeshStandardMaterial({ color: 0x00d2ff, metalness: 0.8, roughness: 0.2 });
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.4, 2.5, 8), shipMat);
    fuselage.rotation.x = Math.PI / 2;
    const wings = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 0.8), shipMat);
    wings.position.z = 0.3;
    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8), 
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
    );
    cockpit.position.set(0, 0.2, -0.2);
    cockpit.scale.set(1, 0.6, 1.5);
    ship.add(fuselage, wings, cockpit);
    scene.add(ship);

    // Engine Reference Setup
    engineRef.current = {
      scene, camera, renderer, ship, starField,
      asteroids: [], bullets: [], diamonds: [], particles: [],
      audioCtx: new (window.AudioContext || (window as any).webkitAudioContext)()
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    const onMouseDown = () => {
      const engine = engineRef.current;
      if (!stateRef.current.active || !engine) return;
      
      const fireBullet = (offset: number) => {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.18), new THREE.MeshBasicMaterial({ color: 0xff3300 }));
        b.position.copy(engine.ship.position);
        b.position.x += offset;
        engine.scene.add(b);
        engine.bullets.push(b);
      };

      if (stateRef.current.powerup > 0) { fireBullet(-0.6); fireBullet(0.6); } 
      else { fireBullet(0); }
      playSound(500, 'sine', 0.1, 0.05);
    };
    window.addEventListener('mousedown', onMouseDown);

    const onMouseMove = (e: MouseEvent) => {
      onUpdate({
        mouse: new THREE.Vector2(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
        )
      });
    };
    window.addEventListener('mousemove', onMouseMove);

    let frameId: number;
    const animate = () => {
      const engine = engineRef.current;
      if (!engine) return;
      
      const { scene, camera, renderer, ship, asteroids, bullets, diamonds, particles, starField } = engine;
      const s = stateRef.current;

      if (s.active) {
        // Responsiveness calculation
        const vFOV = THREE.MathUtils.degToRad(camera.fov);
        const visibleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
        const visibleWidth = visibleHeight * camera.aspect;
        
        const targetX = s.mouse.x * (visibleWidth / 2 - 2);
        const targetY = s.mouse.y * (visibleHeight / 2 - 2);
        const targetPos = new THREE.Vector3(targetX, targetY, 0);
        
        ship.position.lerp(targetPos, 0.15);
        ship.rotation.z = (ship.position.x - targetPos.x) * 0.1;
        ship.rotation.x = (targetPos.y - ship.position.y) * 0.08;

        const currentSpeed = CONFIG.baseSpeed * (s.level >= 30 ? 4.5 : s.level >= 20 ? 4 : s.level >= 10 ? 2 : 1);

        // Update Stars
        const starPosArr = starField.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < CONFIG.starCount; i++) {
          let zIdx = i * 3 + 2;
          starPosArr[zIdx] += currentSpeed * 3;
          if (starPosArr[zIdx] > 15) {
            starPosArr[zIdx] = -CONFIG.starDepth + 15;
            starPosArr[zIdx - 1] = (Math.random() - 0.5) * CONFIG.starScatterArea;
            starPosArr[zIdx - 2] = (Math.random() - 0.5) * CONFIG.starScatterArea;
          }
        }
        starField.geometry.attributes.position.needsUpdate = true;

        if (s.combo > 0 && Date.now() - s.lastHitTime > CONFIG.comboExpiry) onUpdate({ combo: 0 });
        if (s.powerup > 0) onUpdate({ powerup: Math.max(0, s.powerup - 0.016) });

        // Spawning
        if (Math.random() < CONFIG.diamondSpawnRate) {
          const d = new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, metalness: 1 }));
          d.position.set((Math.random() - 0.5) * (visibleWidth + 10), (Math.random() - 0.5) * (visibleHeight + 10), -120);
          scene.add(d);
          diamonds.push(d);
        }

        if (Math.random() < CONFIG.spawnRate) {
          const isGold = Math.random() < 0.12;
          const size = 0.8 + Math.random() * 1.7;
          const a = new THREE.Mesh(
            new THREE.DodecahedronGeometry(size),
            new THREE.MeshStandardMaterial({ color: isGold ? 0xffd700 : 0x777777, flatShading: true })
          ) as Asteroid;
          a.position.set((Math.random() - 0.5) * (visibleWidth + 20), (Math.random() - 0.5) * (visibleHeight + 15), -120);
          a.userData = { type: isGold ? 'gold' : 'std', radius: size, rotSpeed: { x: Math.random()*0.02, y: Math.random()*0.02, z: Math.random()*0.02 } };
          scene.add(a);
          asteroids.push(a);
        }

        // --- FIXED COLLISION LOOPS (Using reverse iteration to avoid index skipping) ---

        for (let i = diamonds.length - 1; i >= 0; i--) {
          const d = diamonds[i];
          d.position.z += currentSpeed;
          d.rotation.y += 0.05;
          if (d.position.distanceTo(ship.position) < 2.0) {
            onUpdate({ powerup: 10, score: s.score + 200 });
            spawnExplosion(d.position, 0x00ffff, 15);
            scene.remove(d); diamonds.splice(i, 1);
            playSound(900, 'sine', 0.4);
          } else if (d.position.z > 20) {
            scene.remove(d); diamonds.splice(i, 1);
          }
        }

        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.position.z -= CONFIG.bulletSpeed;
          if (b.position.z < -130) {
            scene.remove(b); bullets.splice(i, 1);
          }
        }

        for (let i = asteroids.length - 1; i >= 0; i--) {
          const a = asteroids[i];
          a.position.z += currentSpeed;
          
          // Collision with Ship
          if (a.position.distanceTo(ship.position) < a.userData.radius + 0.6) {
            if (a.userData.type === 'gold') {
              onUpdate({ score: s.score + 500, combo: s.combo + 1, lastHitTime: Date.now() });
              spawnExplosion(a.position, 0xffd700, 20);
            } else {
              const newLives = s.lives - 1;
              onUpdate({ lives: newLives });
              spawnExplosion(a.position, 0xff4444, 25);
              if (newLives <= 0) onGameOver(s.score);
            }
            scene.remove(a); asteroids.splice(i, 1);
            continue;
          }

          // Collision with Bullets
          for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (a.position.distanceTo(b.position) < a.userData.radius + 0.4) {
              const currentCombo = s.combo + 1;
              const hitScore = (a.userData.type === 'gold' ? 500 : 100) * Math.max(1, currentCombo);
              onUpdate({ score: s.score + hitScore, combo: currentCombo, lastHitTime: Date.now(), level: Math.floor((s.score + hitScore) / 1000) + 1 });
              spawnExplosion(a.position, a.userData.type === 'gold' ? 0xffd700 : 0xcccccc);
              scene.remove(a); asteroids.splice(i, 1);
              scene.remove(b); bullets.splice(j, 1);
              break; 
            }
          }

          if (a && a.position.z > 20) {
            scene.remove(a); asteroids.splice(i, 1);
          }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.position.add(p.userData.vel);
          p.userData.life -= 0.03;
          p.scale.setScalar(Math.max(0.001, p.userData.life));
          if (p.userData.life <= 0) { scene.remove(p); particles.splice(i, 1); }
        }
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      if (engineRef.current?.renderer) {
        engineRef.current.renderer.dispose();
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full cursor-crosshair overflow-hidden touch-none" />;
};

export default Game;
