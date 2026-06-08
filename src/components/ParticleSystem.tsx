import { useEffect, useRef } from 'react';
import { GestureType } from '@/types/gesture';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  targetX: number;
  targetY: number;
  originX: number;
  originY: number;
  trail: { x: number; y: number }[];
}

interface ParticleSystemProps {
  activeGesture?: GestureType;
}

const PARTICLE_COUNT = 300;
const WEAPON_PARTICLES = 200;

export function ParticleSystem({ activeGesture }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const gestureRef = useRef<GestureType>('unknown');
  const prevGestureRef = useRef<GestureType>('unknown');
  const timeRef = useRef(0);
  const transitionRef = useRef(0);
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (activeGesture && activeGesture !== gestureRef.current) {
      prevGestureRef.current = gestureRef.current;
      gestureRef.current = activeGesture;
      isTransitioning.current = true;
      transitionRef.current = 0;
    }
  }, [activeGesture]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      updateWeaponTargets();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 2 + 1,
      life: Math.random() * 100,
      maxLife: Math.random() * 200 + 100,
      targetX: Math.random() * canvas.width,
      targetY: Math.random() * canvas.height,
      originX: Math.random() * canvas.width,
      originY: Math.random() * canvas.height,
      trail: []
    });

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push(createParticle());
    }

    const getGestureColor = (gesture: GestureType): string => {
      const colors: Record<GestureType, string> = {
        open_palm: '100, 255, 218',
        point_up: '59, 130, 246',
        point_left: '139, 92, 246',
        point_right: '245, 158, 11',
        thumbs_up: '34, 197, 94',
        thumbs_down: '239, 68, 68',
        peace: '236, 72, 153',
        fist: '100, 116, 139',
        unknown: '100, 255, 218'
      };
      return colors[gesture] || colors.unknown;
    };

    const generateWeaponPoints = (gesture: GestureType, count: number): Array<{x: number, y: number}> => {
      const points: Array<{x: number, y: number}> = [];
      const scale = Math.min(canvas.width, canvas.height) / 800;

      switch (gesture) {
        case 'point_up': {
          // 光剑形状
          for (let i = 0; i < count; i++) {
            const t = i / count;
            // 剑身
            const bladeX = centerX + (Math.random() - 0.5) * 8 * scale;
            const bladeY = centerY - 150 * scale + t * 300 * scale;
            points.push({ x: bladeX, y: bladeY });
          }
          // 剑柄
          for (let i = 0; i < count * 0.2; i++) {
            const t = Math.random();
            const handleX = centerX + (Math.random() - 0.5) * 12 * scale;
            const handleY = centerY + 150 * scale + t * 50 * scale;
            points.push({ x: handleX, y: handleY });
          }
          // 护手
          for (let i = 0; i < count * 0.15; i++) {
            const t = Math.random();
            const guardX = centerX - 30 * scale + t * 60 * scale;
            const guardY = centerY + 150 * scale + (Math.random() - 0.5) * 8 * scale;
            points.push({ x: guardX, y: guardY });
          }
          break;
        }

        case 'peace': {
          // 双能量刃
          for (let blade = 0; blade < 2; blade++) {
            const offsetX = blade === 0 ? -20 * scale : 20 * scale;
            for (let i = 0; i < count * 0.5; i++) {
              const t = i / (count * 0.5);
              const bladeX = centerX + offsetX + (Math.random() - 0.5) * 6 * scale;
              const bladeY = centerY - 120 * scale + t * 240 * scale;
              points.push({ x: bladeX, y: bladeY });
            }
          }
          // 刀柄连接
          for (let i = 0; i < count * 0.1; i++) {
            const t = Math.random();
            const handleX = centerX - 20 * scale + t * 40 * scale;
            const handleY = centerY + 120 * scale + (Math.random() - 0.5) * 10 * scale;
            points.push({ x: handleX, y: handleY });
          }
          break;
        }

        case 'thumbs_up': {
          // 能量盾 - 六边形
          const shieldRadius = 80 * scale;
          const sides = 6;
          for (let i = 0; i < count; i++) {
            const side = Math.floor(Math.random() * sides);
            const t = Math.random();
            const angle1 = (side / sides) * Math.PI * 2 - Math.PI / 2;
            const angle2 = ((side + 1) / sides) * Math.PI * 2 - Math.PI / 2;
            const x1 = centerX + Math.cos(angle1) * shieldRadius;
            const y1 = centerY + Math.sin(angle1) * shieldRadius;
            const x2 = centerX + Math.cos(angle2) * shieldRadius;
            const y2 = centerY + Math.sin(angle2) * shieldRadius;
            points.push({
              x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * 6 * scale,
              y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * 6 * scale
            });
          }
          // 内部六边形
          const innerRadius = shieldRadius * 0.6;
          for (let i = 0; i < count * 0.3; i++) {
            const side = Math.floor(Math.random() * sides);
            const t = Math.random();
            const angle1 = (side / sides) * Math.PI * 2 - Math.PI / 2;
            const angle2 = ((side + 1) / sides) * Math.PI * 2 - Math.PI / 2;
            const x1 = centerX + Math.cos(angle1) * innerRadius;
            const y1 = centerY + Math.sin(angle1) * innerRadius;
            const x2 = centerX + Math.cos(angle2) * innerRadius;
            const y2 = centerY + Math.sin(angle2) * innerRadius;
            points.push({
              x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * 4 * scale,
              y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * 4 * scale
            });
          }
          break;
        }

        case 'fist': {
          // 能量球
          const ballRadius = 60 * scale;
          for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = ballRadius * Math.sin(phi);
            points.push({
              x: centerX + r * Math.cos(theta) + (Math.random() - 0.5) * 5 * scale,
              y: centerY + ballRadius * Math.cos(phi) + (Math.random() - 0.5) * 5 * scale
            });
          }
          // 环绕电弧
          for (let i = 0; i < count * 0.4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = ballRadius * 1.3 + Math.random() * 20 * scale;
            points.push({
              x: centerX + Math.cos(angle) * r,
              y: centerY + Math.sin(angle) * r
            });
          }
          break;
        }

        case 'point_left':
        case 'point_right': {
          // 箭矢/飞镖
          const direction = gesture === 'point_left' ? -1 : 1;
          const arrowLength = 150 * scale;
          const arrowWidth = 40 * scale;
          
          // 箭身
          for (let i = 0; i < count * 0.5; i++) {
            const t = Math.random();
            const x = centerX - direction * arrowLength * 0.5 + t * arrowLength;
            const y = centerY + (Math.random() - 0.5) * 10 * scale;
            points.push({ x, y });
          }
          // 箭头
          for (let i = 0; i < count * 0.3; i++) {
            const t = Math.random();
            const x = centerX + direction * arrowLength * 0.5 - t * 40 * scale;
            const y = centerY + (Math.random() - 0.5) * arrowWidth * t;
            points.push({ x, y });
          }
          // 箭尾翼
          for (let i = 0; i < count * 0.2; i++) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const t = Math.random();
            const x = centerX - direction * arrowLength * 0.5 + t * 30 * scale;
            const y = centerY + side * (15 * scale + t * 15 * scale);
            points.push({ x, y });
          }
          break;
        }

        case 'thumbs_down': {
          // 爆炸效果 - 散射粒子
          for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 20 * scale + Math.random() * 100 * scale;
            points.push({
              x: centerX + Math.cos(angle) * r,
              y: centerY + Math.sin(angle) * r
            });
          }
          break;
        }

        default: {
          // open_palm / unknown - 自由漂浮
          for (let i = 0; i < count; i++) {
            points.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height
            });
          }
          break;
        }
      }

      return points;
    };

    let weaponPointsLocal: Array<{x: number, y: number}> = [];

    const updateWeaponTargets = () => {
      weaponPointsLocal = generateWeaponPoints(gestureRef.current, WEAPON_PARTICLES);
    };

    updateWeaponTargets();

    const animate = () => {
      timeRef.current++;
      const gesture = gestureRef.current;
      const color = getGestureColor(gesture);

      if (isTransitioning.current) {
        transitionRef.current += 0.02;
        if (transitionRef.current >= 1) {
          isTransitioning.current = false;
          transitionRef.current = 1;
        }
        weaponPointsLocal = generateWeaponPoints(gesture, WEAPON_PARTICLES);
      }

      ctx.fillStyle = 'rgba(10, 25, 47, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const isWeapon = ['point_up', 'peace', 'thumbs_up', 'fist', 'point_left', 'point_right'].includes(gesture);

      particlesRef.current.forEach((particle, index) => {
        if (isWeapon && index < weaponPointsLocal.length) {
          // 向武器形状目标移动
          const target = weaponPointsLocal[index];
          const weaponPointX = target.x + Math.sin(timeRef.current * 0.05 + index * 0.1) * 2;
          const weaponPointY = target.y + Math.cos(timeRef.current * 0.05 + index * 0.1) * 2;
          
          const dx = weaponPointX - particle.x;
          const dy = weaponPointY - particle.y;
          const speed = isTransitioning.current ? 0.1 : 0.05;
          
          particle.vx += dx * speed;
          particle.vy += dy * speed;
          particle.vx *= 0.85;
          particle.vy *= 0.85;
        } else if (gesture === 'thumbs_down') {
          // 爆炸扩散
          const dx = particle.x - centerX;
          const dy = particle.y - centerY;
          particle.vx += dx * 0.002;
          particle.vy += dy * 0.002;
        } else if (gesture === 'open_palm' || gesture === 'unknown') {
          // 自由漂浮
          particle.vx += (Math.random() - 0.5) * 0.2;
          particle.vy += (Math.random() - 0.5) * 0.2;
          particle.vx *= 0.95;
          particle.vy *= 0.95;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) { particle.x = 0; particle.vx *= -0.5; }
        if (particle.x > canvas.width) { particle.x = canvas.width; particle.vx *= -0.5; }
        if (particle.y < 0) { particle.y = 0; particle.vy *= -0.5; }
        if (particle.y > canvas.height) { particle.y = canvas.height; particle.vy *= -0.5; }

        const alpha = isWeapon ? 0.8 + Math.sin(timeRef.current * 0.1 + index * 0.05) * 0.2 : 0.6;
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // 发光效果
        if (isWeapon) {
          ctx.fillStyle = `rgba(${color}, ${alpha * 0.3})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // 粒子连线
        if (isWeapon && index < weaponPointsLocal.length) {
          const maxDist = 30;
          for (let j = index + 1; j < Math.min(index + 10, weaponPointsLocal.length); j++) {
            const other = particlesRef.current[j];
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDist) {
              const lineAlpha = (1 - distance / maxDist) * 0.5;
              ctx.strokeStyle = `rgba(${color}, ${lineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}
