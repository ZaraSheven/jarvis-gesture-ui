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
  trail: { x: number; y: number }[];
}

interface ParticleSystemProps {
  activeGesture?: GestureType;
}

const PARTICLE_COUNT = 150;
const CONNECTION_DISTANCE = 120;

export function ParticleSystem({ activeGesture }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const gestureRef = useRef<GestureType>('unknown');
  const timeRef = useRef(0);
  const weaponAngleRef = useRef(0);

  useEffect(() => {
    gestureRef.current = activeGesture || 'unknown';
  }, [activeGesture]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const createParticle = (index: number): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 2 + 1,
      life: Math.random() * 100,
      maxLife: Math.random() * 200 + 100,
      targetX: centerX,
      targetY: centerY,
      trail: []
    });

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push(createParticle(i));
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

    const updateParticles = (gesture: GestureType) => {
      const particles = particlesRef.current;
      
      switch (gesture) {
        case 'open_palm':
          particles.forEach(p => {
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.vx += (Math.random() - 0.5) * 0.3;
            p.vy += (Math.random() - 0.5) * 0.3;
          });
          break;

        case 'point_up':
          particles.forEach(p => {
            p.vy -= 0.3;
            p.vx *= 0.98;
          });
          break;

        case 'point_left':
          particles.forEach(p => {
            p.vx -= 0.3;
          });
          break;

        case 'point_right':
          particles.forEach(p => {
            p.vx += 0.3;
          });
          break;

        case 'thumbs_up':
          particles.forEach(p => {
            const dx = centerX - p.x;
            const dy = centerY - p.y;
            p.vx += dx * 0.001;
            p.vy += dy * 0.001;
          });
          break;

        case 'thumbs_down':
          particles.forEach(p => {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            p.vx += dx * 0.002;
            p.vy += dy * 0.002;
          });
          break;

        case 'peace':
          weaponAngleRef.current += 0.05;
          particles.forEach((p, i) => {
            const angle = (i / particles.length) * Math.PI * 2 + weaponAngleRef.current;
            p.vx += Math.cos(angle) * 0.2;
            p.vy += Math.sin(angle) * 0.2;
          });
          break;

        case 'fist':
          particles.forEach(p => {
            p.vx *= 0.8;
            p.vy *= 0.8;
            p.vx += (centerX - p.x) * 0.005;
            p.vy += (centerY - p.y) * 0.005;
          });
          break;

        default:
          particles.forEach(p => {
            p.vx += (Math.random() - 0.5) * 0.1;
            p.vy += (Math.random() - 0.5) * 0.1;
          });
          break;
      }
    };

    const drawWeaponEffects = (gesture: GestureType, color: string) => {
      ctx.save();
      ctx.strokeStyle = `rgba(${color}, 0.8)`;
      ctx.lineWidth = 2;
      ctx.shadowColor = `rgba(${color}, 0.5)`;
      ctx.shadowBlur = 10;

      switch (gesture) {
        case 'point_up':
          drawSword(centerX, centerY, color);
          break;
        case 'peace':
          drawEnergyBlades(centerX, centerY, color);
          break;
        case 'thumbs_up':
          drawShield(centerX, centerY, color);
          break;
        case 'fist':
          drawEnergyBall(centerX, centerY, color);
          break;
      }

      ctx.restore();
    };

    const drawSword = (cx: number, cy: number, color: string) => {
      const angle = -Math.PI / 4;
      const length = 150;
      const handleLength = 40;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, -handleLength);
      ctx.lineTo(0, length);
      ctx.strokeStyle = `rgba(${color}, 0.9)`;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-15, -handleLength + 10);
      ctx.lineTo(15, -handleLength + 10);
      ctx.lineWidth = 6;
      ctx.stroke();

      const particles = particlesRef.current;
      for (let i = 0; i < 30; i++) {
        const t = i / 30;
        const x = Math.sin(timeRef.current * 0.1 + i) * 5;
        const y = -handleLength + t * (length + handleLength);
        ctx.fillStyle = `rgba(${color}, ${0.5 + Math.sin(timeRef.current * 0.2 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const drawEnergyBlades = (cx: number, cy: number, color: string) => {
      const angle1 = -Math.PI / 3 + Math.sin(timeRef.current * 0.05) * 0.2;
      const angle2 = -Math.PI / 6 + Math.cos(timeRef.current * 0.05) * 0.2;
      const bladeLength = 120;

      for (let blade = 0; blade < 2; blade++) {
        const angle = blade === 0 ? angle1 : angle2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        const gradient = ctx.createLinearGradient(0, 0, 0, -bladeLength);
        gradient.addColorStop(0, `rgba(${color}, 0)`);
        gradient.addColorStop(0.5, `rgba(${color}, 0.8)`);
        gradient.addColorStop(1, `rgba(${color}, 0.2)`);

        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.quadraticCurveTo(-10, -bladeLength / 2, 0, -bladeLength);
        ctx.quadraticCurveTo(10, -bladeLength / 2, 5, 0);
        ctx.fillStyle = gradient;
        ctx.fill();

        for (let i = 0; i < 15; i++) {
          const t = i / 15;
          const x = Math.sin(timeRef.current * 0.2 + i * 2) * 3;
          const y = -t * bladeLength;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(timeRef.current * 0.3 + i) * 0.2})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    };

    const drawShield = (cx: number, cy: number, color: string) => {
      const radius = 60;
      const segments = 8;

      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${color}, 0.8)`;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2 + Math.PI / segments;
        const x = cx + Math.cos(angle) * radius * 0.6;
        const y = cy + Math.sin(angle) * radius * 0.6;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2 + timeRef.current * 0.05;
        const r = radius + Math.sin(timeRef.current * 0.1 + i) * 10;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        ctx.fillStyle = `rgba(${color}, ${0.3 + Math.sin(timeRef.current * 0.2 + i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawEnergyBall = (cx: number, cy: number, color: string) => {
      const baseRadius = 40;
      const pulseRadius = baseRadius + Math.sin(timeRef.current * 0.1) * 10;

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius);
      gradient.addColorStop(0, `rgba(255, 255, 255, 0.8)`);
      gradient.addColorStop(0.3, `rgba(${color}, 0.6)`);
      gradient.addColorStop(0.7, `rgba(${color}, 0.2)`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);

      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2 + timeRef.current * 0.1;
        const dist = pulseRadius + Math.sin(timeRef.current * 0.2 + i * 3) * 15;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        ctx.fillStyle = `rgba(${color}, ${0.4 + Math.sin(timeRef.current * 0.3 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 - timeRef.current * 0.15;
        const innerR = pulseRadius * 0.5;
        const outerR = pulseRadius * 1.3;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle + 0.2) * outerR, cy + Math.sin(angle + 0.2) * outerR);
        ctx.strokeStyle = `rgba(${color}, 0.5)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    const animate = () => {
      timeRef.current++;
      const gesture = gestureRef.current;
      const color = getGestureColor(gesture);

      ctx.fillStyle = 'rgba(10, 25, 47, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      updateParticles(gesture);

      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        if (particle.x < 0) { particle.x = 0; particle.vx *= -0.5; }
        if (particle.x > canvas.width) { particle.x = canvas.width; particle.vx *= -0.5; }
        if (particle.y < 0) { particle.y = 0; particle.vy *= -0.5; }
        if (particle.y > canvas.height) { particle.y = canvas.height; particle.vy *= -0.5; }

        if (particle.life > particle.maxLife) {
          particle.life = 0;
          particle.maxLife = Math.random() * 200 + 100;
        }

        const alpha = Math.min(1, 1 - (particle.life / particle.maxLife));
        ctx.fillStyle = `rgba(${color}, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        if (gesture === 'peace' || gesture === 'point_up' || gesture === 'fist') {
          particle.trail.push({ x: particle.x, y: particle.y });
          if (particle.trail.length > 5) particle.trail.shift();

          if (particle.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
            for (let i = 1; i < particle.trail.length; i++) {
              ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
            }
            ctx.strokeStyle = `rgba(${color}, ${alpha * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        particlesRef.current.forEach((other, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const maxDist = gesture === 'fist' ? 80 : gesture === 'open_palm' ? 180 : CONNECTION_DISTANCE;

            if (distance < maxDist) {
              const lineAlpha = (1 - distance / maxDist) * alpha * 0.4;
              ctx.strokeStyle = `rgba(${color}, ${lineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }
        });
      });

      if (gesture !== 'unknown' && gesture !== 'open_palm') {
        drawWeaponEffects(gesture, color);
      }

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
