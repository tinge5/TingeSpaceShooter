import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

const PLAYER_WIDTH = 54;
const PLAYER_HEIGHT = 30;

const shipPalette = ['#FF9F43', '#6EE7FF', '#A78BFA', '#F87171', '#7EF29A', '#FDE68A'];
const backgroundThemes = [
  { sky: '#020817', glow: '#1d4ed8', stars: ['#F5F8FF', '#7dd3fc', '#fbbf24'] },
  { sky: '#090313', glow: '#a855f7', stars: ['#f9a8d4', '#e9d5ff', '#fef3c7'] },
  { sky: '#02131d', glow: '#10b981', stars: ['#ecfeff', '#a7f3d0', '#fef08a'] },
  { sky: '#140b2c', glow: '#f43f5e', stars: ['#f5d0fe', '#f8fafc', '#fbbf24'] },
  { sky: '#171717', glow: '#f97316', stars: ['#fef3c7', '#fde68a', '#f5f5f5'] },
];

type Bullet = {
  id: number;
  x: number;
  y: number;
  from: 'player' | 'enemy';
};

type Enemy = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
};

type Explosion = {
  id: number;
  x: number;
  y: number;
  ttl: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const createWave = (level: number, width: number): Enemy[] =>
  Array.from({ length: Math.min(4 + level, 12) }, (_, index) => {
    const size = 22 + (index % 3) * 8;
    const x = Math.random() * Math.max(0, width - size);
    const y = -24 - index * 28;

    return {
      id: Date.now() + index + Math.random(),
      x,
      y,
      size,
      color: shipPalette[(index + level) % shipPalette.length],
    speed: Math.max(0.8, 0.9 + level * 0.14 + (index % 2) * 0.18),
    };
  });

export default function GameScreen() {
  const { profile, updateGameStats } = useAuth();
  const shipColor = profile?.shipColor ?? '#FF9F43';
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const GAME_WIDTH = Math.max(260, screenWidth - 60);
  const GAME_HEIGHT = Math.max(440, screenHeight - 180);
  const PLAYER_Y = GAME_HEIGHT - 68;

  const [playerX, setPlayerX] = useState((GAME_WIDTH - PLAYER_WIDTH) / 2);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemyBullets, setEnemyBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>(() => createWave(1, Math.max(280, screenWidth - 26)));
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [shipDamage, setShipDamage] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);
  const [explosions, setExplosions] = useState<Explosion[]>([]);

  const playerXRef = useRef(playerX);
  const shipDamageRef = useRef(0);
  const bulletsRef = useRef<Bullet[]>([]);
  const enemyBulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>(enemies);
  const levelRef = useRef(level);
  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  const gameOverRef = useRef(isGameOver);

  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);

  useEffect(() => {
    bulletsRef.current = bullets;
  }, [bullets]);

  useEffect(() => {
    enemyBulletsRef.current = enemyBullets;
  }, [enemyBullets]);

  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    shipDamageRef.current = shipDamage;
  }, [shipDamage]);

  useEffect(() => {
    gameOverRef.current = isGameOver;
  }, [isGameOver]);

  const theme = useMemo(() => backgroundThemes[Math.floor((level - 1) / 5) % backgroundThemes.length], [level]);

  const fireBullet = useCallback(() => {
    if (gameOverRef.current) {
      return;
    }

    const nextShot: Bullet = {
      id: Date.now() + Math.random(),
      x: playerXRef.current + PLAYER_WIDTH / 2 - 3,
      y: PLAYER_Y - 10,
      from: 'player',
    };

    const nextBullets = [...bulletsRef.current, nextShot];
    bulletsRef.current = nextBullets;
    setBullets(nextBullets);
  }, []);

  useEffect(() => {
    const keyDown = (event: any) => {
      if (event.key === 'ArrowLeft') setMoveLeft(true);
      if (event.key === 'ArrowRight') setMoveRight(true);
      if (event.key === ' ' || event.code === 'Space') fireBullet();
    };

    const keyUp = (event: any) => {
      if (event.key === 'ArrowLeft') setMoveLeft(false);
      if (event.key === 'ArrowRight') setMoveRight(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', keyDown);
      window.addEventListener('keyup', keyUp);

      return () => {
        window.removeEventListener('keydown', keyDown);
        window.removeEventListener('keyup', keyUp);
      };
    }
  }, [fireBullet]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameOverRef.current) {
        return;
      }

      const nextPlayerX = clamp(
        playerXRef.current + (moveRight ? 12 : 0) - (moveLeft ? 12 : 0),
        0,
        Math.max(0, GAME_WIDTH - PLAYER_WIDTH),
      );
      playerXRef.current = nextPlayerX;
      setPlayerX(nextPlayerX);
    }, 30);

    return () => clearInterval(interval);
  }, [GAME_WIDTH, moveLeft, moveRight]);

  useEffect(() => {
    const enemyFireInterval = setInterval(() => {
      if (gameOverRef.current || enemiesRef.current.length === 0) {
        return;
      }

      const shooter = enemiesRef.current[Math.floor(Math.random() * enemiesRef.current.length)];
      const shot: Bullet = {
        id: Date.now() + Math.random(),
        x: shooter.x + shooter.size / 2 - 2,
        y: shooter.y + shooter.size + 10,
        from: 'enemy',
      };

      const nextBullets = [...enemyBulletsRef.current, shot];
      enemyBulletsRef.current = nextBullets;
      setEnemyBullets(nextBullets);
    }, Math.max(450, 1400 - levelRef.current * 70));

    return () => clearInterval(enemyFireInterval);
  }, [isGameOver, level]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameOverRef.current) {
        return;
      }

      let nextBullets = bulletsRef.current
        .map((bullet) => ({ ...bullet, y: bullet.y - 12 }))
        .filter((bullet) => bullet.y > -20);

      let nextEnemyBullets = enemyBulletsRef.current
        .map((bullet) => ({ ...bullet, y: bullet.y + 10 }))
        .filter((bullet) => bullet.y < GAME_HEIGHT + 20);

      let nextEnemies = enemiesRef.current.map((enemy) => ({ ...enemy, y: enemy.y + enemy.speed }));

      const destroyedEnemyIds = new Set<number>();
      const explosionList: Explosion[] = [];

      nextBullets = nextBullets.filter((bullet) => {
        let shouldKeep = true;

        for (const enemy of nextEnemies) {
          const collisionX = bullet.x >= enemy.x && bullet.x <= enemy.x + enemy.size;
          const collisionY = bullet.y >= enemy.y && bullet.y <= enemy.y + enemy.size;

          if (collisionX && collisionY) {
            destroyedEnemyIds.add(enemy.id);
            explosionList.push({ id: Date.now() + Math.random(), x: enemy.x, y: enemy.y, ttl: 8 });
            shouldKeep = false;
            break;
          }
        }

        return shouldKeep;
      });

      const survivingEnemies = nextEnemies.filter((enemy) => !destroyedEnemyIds.has(enemy.id));
      const destroyedCount = nextEnemies.length - survivingEnemies.length;
      if (destroyedCount > 0) {
        const nextScore = scoreRef.current + destroyedCount * 100;
        scoreRef.current = nextScore;
        setScore(nextScore);
      }

      const playerBox = {
        left: playerXRef.current,
        right: playerXRef.current + PLAYER_WIDTH,
        top: PLAYER_Y,
        bottom: PLAYER_Y + PLAYER_HEIGHT,
      };

      const remainingEnemyShots = nextEnemyBullets.filter((bullet) => {
        const hitPlayer =
          bullet.x >= playerBox.left &&
          bullet.x <= playerBox.right &&
          bullet.y >= playerBox.top &&
          bullet.y <= playerBox.bottom;

        if (hitPlayer) {
          const nextDamage = Math.min(4, shipDamageRef.current + 1);
          shipDamageRef.current = nextDamage;
          setShipDamage(nextDamage);

          const nextLives = Math.max(0, livesRef.current - 1);
          livesRef.current = nextLives;
          setLives(nextLives);

          setExplosions((current) => [
            ...current,
            {
              id: Date.now() + Math.random(),
              x: playerXRef.current + PLAYER_WIDTH / 2 - 18,
              y: PLAYER_Y + 4,
              ttl: 8,
            },
          ].slice(-12));

          if (nextLives <= 0) {
            setIsGameOver(true);
            gameOverRef.current = true;
            void updateGameStats(scoreRef.current, levelRef.current);
          }
          return false;
        }

        return true;
      });

      if (survivingEnemies.length === 0 && !gameOverRef.current) {
        const nextLevel = levelRef.current + 1;
        levelRef.current = nextLevel;
        setLevel(nextLevel);
        const wave = createWave(nextLevel, GAME_WIDTH);
        enemiesRef.current = wave;
        setEnemies(wave);
      } else {
        enemiesRef.current = survivingEnemies;
        setEnemies(survivingEnemies);
      }

      if (explosionList.length > 0) {
        setExplosions((current) => [...current, ...explosionList].slice(-12));
      }

      bulletsRef.current = nextBullets;
      enemyBulletsRef.current = remainingEnemyShots;
      setBullets(nextBullets);
      setEnemyBullets(remainingEnemyShots);

      setExplosions((current) => current.map((entry) => ({ ...entry, ttl: entry.ttl - 1 })).filter((entry) => entry.ttl > 0));

      if (survivingEnemies.some((enemy) => enemy.y + enemy.size >= GAME_HEIGHT - 40)) {
        const nextLives = Math.max(0, livesRef.current - 1);
        livesRef.current = nextLives;
        setLives(nextLives);
        setShipDamage((current) => Math.min(4, current + 1));
        shipDamageRef.current = Math.min(4, shipDamageRef.current + 1);
        enemiesRef.current = createWave(levelRef.current, GAME_WIDTH);
        setEnemies(enemiesRef.current);
        if (nextLives <= 0) {
          setIsGameOver(true);
          gameOverRef.current = true;
          void updateGameStats(scoreRef.current, levelRef.current);
        }
      }
    }, 35);

    return () => clearInterval(gameLoop);
  }, [isGameOver, level, moveLeft, moveRight, updateGameStats]);

  const stars = useMemo(
    () =>
      Array.from({ length: 32 }, (_, index) => ({
        id: index,
        left: (index * 37) % 100,
        top: (index * 53) % 100,
        size: 2 + (index % 4),
        color: theme.stars[index % theme.stars.length],
      })),
    [theme],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.sky }]}>
      <View style={styles.hud}>
        <Text style={styles.hudText}>LEVEL {level}</Text>
        <Text style={styles.hudText}>SCORE {score}</Text>
        <Text style={styles.hudText}>LIVES {lives}</Text>
      </View>

      <View style={styles.gameArea}>
        {stars.map((star) => (
          <View
            key={star.id}
            style={[
              styles.star,
              {
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: star.size,
                height: star.size,
                backgroundColor: star.color,
              },
            ]}
          />
        ))}

        {enemies.map((enemy) => (
          <View
            key={enemy.id}
            style={{
              position: 'absolute',
              left: enemy.x,
              top: enemy.y,
              width: enemy.size,
              height: enemy.size,
              backgroundColor: enemy.color,
              borderRadius: 8,
              shadowColor: enemy.color,
              shadowOpacity: 0.8,
              shadowRadius: 10,
              transform: [{ rotate: '180deg' }],
            }}
          />
        ))}

        {bullets.map((bullet) => (
          <View
            key={bullet.id}
            style={{
              position: 'absolute',
              left: bullet.x,
              top: bullet.y,
              width: 6,
              height: 14,
              backgroundColor: '#F5F8FF',
              borderRadius: 4,
            }}
          />
        ))}

        {enemyBullets.map((bullet) => (
          <View
            key={bullet.id}
            style={{
              position: 'absolute',
              left: bullet.x,
              top: bullet.y,
              width: 6,
              height: 16,
              backgroundColor: '#FF5C8A',
              borderRadius: 4,
            }}
          />
        ))}

        {explosions.map((explosion) => (
          <View
            key={explosion.id}
            style={{
              position: 'absolute',
              left: explosion.x,
              top: explosion.y,
              width: 28,
              height: 28,
              borderRadius: 14,
              borderWidth: 3,
              borderColor: '#F7D35A',
              backgroundColor: 'rgba(255, 220, 120, 0.2)',
            }}
          />
        ))}

        <View
          style={{
            position: 'absolute',
            left: playerX,
            top: PLAYER_Y,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            backgroundColor: shipColor,
            borderRadius: 12,
            shadowColor: shipColor,
            shadowOpacity: Math.max(0.25, 1 - shipDamage * 0.2),
            shadowRadius: 18 + (4 - shipDamage) * 8,
            zIndex: 12,
            borderWidth: 2,
            borderColor: '#F8FAFF',
            opacity: 1,
          }}
        >
          {shipDamage > 0 && (
            <>
              {shipDamage >= 1 && <View style={[styles.crack, styles.crack1]} />}
              {shipDamage >= 2 && <View style={[styles.crack, styles.crack2]} />}
              {shipDamage >= 3 && <View style={[styles.crack, styles.crack3]} />}
              {shipDamage >= 4 && <View style={[styles.crack, styles.crack4]} />}
            </>
          )}
        </View>

        {isGameOver && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverTitle}>MISSION FAILED</Text>
            <Text style={styles.gameOverText}>Score: {score}</Text>
            <Text style={styles.gameOverText}>Level reached: {level}</Text>
            <Pressable style={styles.restartButton} onPress={() => router.back()}>
              <Text style={styles.restartText}>RETURN HOME</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.controlRow}>
        <Pressable style={styles.controlButton} onPress={() => setMoveLeft(true)} onPressOut={() => setMoveLeft(false)}>
          <Text style={styles.controlText}>{'◀'}</Text>
        </Pressable>
        <Pressable style={styles.controlButton} onPress={fireBullet}>
          <Text style={styles.controlText}>FIRE</Text>
        </Pressable>
        <Pressable style={styles.controlButton} onPress={() => setMoveRight(true)} onPressOut={() => setMoveRight(false)}>
          <Text style={styles.controlText}>{'▶'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 12,
    paddingBottom: 18,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  hudText: {
    color: '#F8FAFF',
    fontWeight: '800',
    fontSize: 16,
  },
  gameArea: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#294972',
    backgroundColor: 'rgba(3, 10, 24, 0.75)',
    position: 'relative',
  },
  star: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.9,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(1, 7, 17, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverTitle: {
    color: '#FDE68A',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
  },
  gameOverText: {
    color: '#F8FAFF',
    fontSize: 18,
    marginBottom: 4,
  },
  restartButton: {
    marginTop: 16,
    backgroundColor: '#FF9F43',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  restartText: {
    color: '#081827',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#0E223D',
    borderWidth: 1,
    borderColor: '#2C4B73',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginHorizontal: 6,
  },
  controlText: {
    color: '#F5F8FF',
    fontWeight: '900',
    fontSize: 18,
  },
  crack: {
    position: 'absolute',
    backgroundColor: '#0D1118',
    borderRadius: 2,
  },
  crack1: {
    left: 14,
    top: 4,
    width: 2,
    height: 18,
    transform: [{ rotate: '25deg' }],
  },
  crack2: {
    left: 24,
    top: 6,
    width: 2,
    height: 16,
    transform: [{ rotate: '-26deg' }],
  },
  crack3: {
    left: 10,
    top: 14,
    width: 2,
    height: 12,
    transform: [{ rotate: '42deg' }],
  },
  crack4: {
    left: 28,
    top: 12,
    width: 2,
    height: 12,
    transform: [{ rotate: '-40deg' }],
  },
});
