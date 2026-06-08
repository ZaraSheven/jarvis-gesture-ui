import { useEffect, useRef } from 'react';
import { GestureType } from '@/types/gesture';

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  depthBlur: number;
  alpha: number;
  trail: { x: number; y: number; alpha: number }[];
  energy: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

interface ParticleSystemProps {
  activeGesture?: GestureType;
}

const MAIN_PARTICLES = 400;
const WEAPON_TARGETS = 250;
const AMBIENT_DUST = 80;

export function ParticleSystem({ activeGesture }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle3D[]>([]);
  const ambientRef = useRef<Particle3D[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const animationRef = useRef<number>();
  const gestureRef = useRef<GestureType>('unknown');
  const prevGestureRef = useRef<GestureType>('unknown');
  const timeRef = useRef(0);
  const transitionRef = useRef(0);
  const isTransitioning = useRef(false);
  const cameraShakeRef = useRef({ x: 0, y: 0, intensity: 0 });
  const energyPulseRef = useRef(0);
  const weaponPointsRef = useRef<Array<{ x: number; y: number; z: number }>>([]);

  useEffect(() => {
    if (activeGesture && activeGesture !== gestureRef.current) {
      prevGestureRef.current = gestureRef.current;
      gestureRef.current = activeGesture;
      isTransitioning.current = true;
      transitionRef.current = 0;
      cameraShakeRef.current.intensity = 8;
      energyPulseRef.current = 1;

      shockwavesRef.current.push({
        x: 0, y: 0, radius: 0, maxRadius: 300,
        alpha: 0.6, speed: 8
      });
    }
  }, [activeGesture]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const getCenter = () => ({ x: canvas.width / 2, y: canvas.height / 2 });

    const gestureColors: Record<GestureType, { core: string; glow: string; accent: string }> = {
      point_up:     { core: '80,180,255', glow: '40,120,220', accent: '150,220,255' },
      peace:        { core: '255,100,180', glow: '200,50,130',  accent: '255,180,220' },
      thumbs_up:    { core: '80,255,140',  glow: '40,180,100',  accent: '150,255,200' },
      fist:         { core: '180,190,210', glow: '120,130,160', accent: '220,225,240' },
      point_left:   { core: '180,130,255', glow: '120,80,220',  accent: '220,200,255' },
      point_right:  { core: '255,200,80',  glow: '220,150,40',  accent: '255,240,180' },
      thumbs_down:  { core: '255,80,80',   glow: '200,40,40',   accent: '255,180,180' },
      open_palm:    { core: '100,255,218', glow: '60,180,150',  accent: '180,255,240' },
      unknown:      { core: '100,255,218', glow: '60,180,150',  accent: '180,255,240' }
    };

    const generateWeaponTargets3D = (gesture: GestureType, count: number) => {
      const pts: Array<{ x: number; y: number; z: number }> = [];
      const s = Math.min(canvas.width, canvas.height) / 800;
      const c = getCenter();

      const addPoint = (x: number, y: number, z = 0) => pts.push({ x, y, z });

      switch (gesture) {
        case 'point_up': {
          for (let i = 0; i < count; i++) {
            const t = i / count;
            const bladeWidth = 4 + Math.sin(t * Math.PI) * 3;
            addPoint(c.x + (Math.random() - 0.5) * bladeWidth * s,
                     c.y - 180 * s + t * 360 * s,
                     (Math.random() - 0.5) * 40 * s);
          }
          for (let i = 0; i < count * 0.25; i++) {
            addPoint(c.x + (Math.random() - 0.5) * 10 * s,
                     c.y + 180 * s + Math.random() * 60 * s,
                     (Math.random() - 0.5) * 20 * s);
          }
          for (let i = 0; i < count * 0.2; i++) {
            const t = Math.random();
            addPoint(c.x - 35 * s + t * 70 * s,
                     c.y + 180 * s + (Math.random() - 0.5) * 6 * s,
                     (Math.random() - 0.5) * 15 * s);
          }
          break;
        }
        case 'peace': {
          for (let blade = 0; blade < 2; blade++) {
            const ox = blade === 0 ? -18 * s : 18 * s;
            for (let i = 0; i < count * 0.5; i++) {
              const t = i / (count * 0.5);
              addPoint(c.x + ox + (Math.random() - 0.5) * 5 * s,
                       c.y - 150 * s + t * 300 * s,
                       (Math.random() - 0.5) * 30 * s);
            }
          }
          break;
        }
        case 'thumbs_up': {
          const R = 90 * s;
          for (let layer = 0; layer < 3; layer++) {
            const r = R * (0.5 + layer * 0.25);
            const ptsForLayer = Math.floor(count / 3);
            for (let i = 0; i < ptsForLayer; i++) {
              const angle = Math.random() * Math.PI * 2;
              addPoint(c.x + Math.cos(angle) * r + (Math.random() - 0.5) * 8 * s,
                       c.y + Math.sin(angle) * r + (Math.random() - 0.5) * 8 * s,
                       (layer - 1) * 40 * s + (Math.random() - 0.5) * 20 * s);
            }
          }
          for (let i = 0; i < count * 0.3; i++) {
            const a = Math.random() * Math.PI * 2;
            addPoint(c.x + Math.cos(a) * R * 1.2,
                     c.y + Math.sin(a) * R * 1.2,
                     (Math.random() - 0.5) * 80 * s);
          }
          break;
        }
        case 'fist': {
          const R = 70 * s;
          for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = R * (0.3 + Math.random() * 0.7);
            addPoint(c.x + r * Math.sin(phi) * Math.cos(theta),
                     c.y + r * Math.sin(phi) * Math.sin(theta),
                     r * Math.cos(phi));
          }
          for (let i = 0; i < count * 0.5; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = R * 1.4 + Math.random() * 30 * s;
            addPoint(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r,
                     (Math.random() - 0.5) * 100 * s);
          }
          break;
        }
        case 'point_left':
        case 'point_right': {
          const dir = gesture === 'point_left' ? -1 : 1;
          const len = 180 * s;
          for (let i = 0; i < count * 0.5; i++) {
            const t = Math.random();
            addPoint(c.x - dir * len * 0.5 + t * len,
                     c.y + (Math.random() - 0.5) * 8 * s,
                     (Math.random() - 0.5) * 20 * s);
          }
          for (let i = 0; i < count * 0.3; i++) {
            const t = Math.random();
            addPoint(c.x + dir * len * 0.5 - t * 50 * s,
                     c.y + (Math.random() - 0.5) * 40 * s * t,
                     (Math.random() - 0.5) * 30 * s);
          }
          for (let i = 0; i < count * 0.2; i++) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const t = Math.random();
            addPoint(c.x - dir * len * 0.5 + t * 35 * s,
                     c.y + side * (20 * s + t * 25 * s),
                     (Math.random() - 0.5) * 25 * s);
          }
          break;
        }
        default: {
          for (let i = 0; i < count; i++) {
            addPoint(Math.random() * canvas.width, Math.random() * canvas.height,
                     (Math.random() - 0.5) * 200);
          }
        }
      }
      return pts;
    };

    const createParticle3D = (): Particle3D => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: (Math.random() - 0.5) * 200,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      vz: (Math.random() - 0.5) * 2,
      size: Math.random() * 2.5 + 0.5,
      depthBlur: Math.random(),
      alpha: 0.8,
      trail: [],
      energy: Math.random()
    });

    const createAmbientDust = (): Particle3D => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: (Math.random() - 0.5) * 300,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.1,
      vz: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 1.2 + 0.3,
      depthBlur: Math.random(),
      alpha: Math.random() * 0.3 + 0.05,
      trail: [],
      energy: 0
    });

    for (let i = 0; i < MAIN_PARTICLES; i++) particlesRef.current.push(createParticle3D());
    for (let i = 0; i < AMBIENT_DUST; i++) ambientRef.current.push(createAmbientDust());

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      weaponPointsRef.current = generateWeaponTargets3D(gestureRef.current, WEAPON_TARGETS);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const projectZ = (z: number, focalLen = 500) => focalLen / (focalLen + z);

    const animate = () => {
      timeRef.current++;
      const gesture = gestureRef.current;
      const colors = gestureColors[gesture];
      const c = getCenter();
      const isWeapon = ['point_up', 'peace', 'thumbs_up', 'fist', 'point_left', 'point_right'].includes(gesture);

      if (isTransitioning.current) {
        transitionRef.current += 0.015;
        if (transitionRef.current >= 1) { isTransitioning.current = false; transitionRef.current = 1; }
        weaponPointsRef.current = generateWeaponTargets3D(gesture, WEAPON_TARGETS);
      }

      const shake = cameraShakeRef.current;
      if (shake.intensity > 0) {
        shake.x = (Math.random() - 0.5) * shake.intensity;
        shake.y = (Math.random() - 0.5) * shake.intensity;
        shake.intensity *= 0.92;
        if (shake.intensity < 0.5) shake.intensity = 0;
      } else { shake.x = 0; shake.y = 0; }

      const energyPulse = energyPulseRef.current;
      if (energyPulse > 0) energyPulseRef.current *= 0.95;

      ctx.save();
      ctx.translate(shake.x, shake.y);

      ctx.fillStyle = 'rgba(5,10,20,0.15)';
      ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);

      ctx.globalCompositeOperation = 'lighter';

      const targets = weaponPointsRef.current;
      const weaponDepth = Math.sin(timeRef.current * 0.02) * 30;

      particlesRef.current.forEach((p, i) => {
        const targetZ = isWeapon ? weaponDepth : 0;
        const speed = isTransitioning.current ? 0.12 : 0.04;

        if (isWeapon && i < targets.length) {
          const tgt = targets[i];
          const tx = tgt.x + Math.sin(timeRef.current * 0.03 + i * 0.08) * 3;
          const ty = tgt.y + Math.cos(timeRef.current * 0.03 + i * 0.08) * 3;
          p.vx += (tx - p.x) * speed;
          p.vy += (ty - p.y) * speed;
          p.vz += (tgt.z - p.z) * speed * 0.5;
          p.vx *= 0.82; p.vy *= 0.82; p.vz *= 0.82;
        } else if (gesture === 'thumbs_down') {
          const dx = p.x - c.x, dy = p.y - c.y;
          p.vx += dx * 0.003; p.vy += dy * 0.003; p.vz += (Math.random() - 0.5) * 3;
        } else {
          p.vx += (Math.random() - 0.5) * 0.15;
          p.vy += (Math.random() - 0.5) * 0.15;
          p.vx *= 0.96; p.vy *= 0.96; p.vz *= 0.96;
        }

        p.x += p.vx; p.y += p.vy; p.z += p.vz;

        const vel = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        p.energy = Math.min(1, vel / 5);

        p.trail.unshift({ x: p.x, y: p.y, alpha: 1 });
        if (p.trail.length > 6) p.trail.pop();

        const proj = projectZ(p.z);
        const screenX = c.x + (p.x - c.x) * proj;
        const screenY = c.y + (p.y - c.y) * proj;
        const screenR = Math.max(0.3, p.size * proj);

        const trailAlpha = isWeapon ? 0.4 + p.energy * 0.6 : 0.2 + p.energy * 0.3;
        const depthFade = Math.max(0.1, Math.min(1, (p.z + 200) / 400));

        if (p.trail.length > 1 && vel > 0.5) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.strokeStyle = `rgba(${colors.core},${trailAlpha * depthFade * 0.3})`;
          ctx.lineWidth = screenR * 0.5;
          ctx.stroke();
        }

        const a = trailAlpha * depthFade;
        ctx.fillStyle = `rgba(${colors.core},${a})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, screenR, 0, Math.PI * 2);
        ctx.fill();

        if (isWeapon && p.energy > 0.3) {
          ctx.fillStyle = `rgba(${colors.glow},${a * 0.4})`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, screenR * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ambientRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const proj = projectZ(p.z);
        const sx = c.x + (p.x - c.x) * proj;
        const sy = c.y + (p.y - c.y) * proj;
        const sr = Math.max(0.2, p.size * proj);

        const pulse = 0.5 + Math.sin(timeRef.current * 0.02 + p.x * 0.01) * 0.3;
        ctx.fillStyle = `rgba(${colors.accent},${p.alpha * pulse * proj})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      });

      if (isWeapon) {
        const corePulse = Math.sin(timeRef.current * 0.08) * 0.15 + 0.85;
        const coreSize = 120 * Math.min(canvas.width, canvas.height) / 800 * corePulse;

        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, coreSize);
        grad.addColorStop(0, `rgba(${colors.core},${0.08 * corePulse})`);
        grad.addColorStop(0.3, `rgba(${colors.glow},${0.04 * corePulse})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(c.x - coreSize, c.y - coreSize, coreSize * 2, coreSize * 2);

        for (let ray = 0; ray < 8; ray++) {
          const angle = (ray / 8) * Math.PI * 2 + timeRef.current * 0.005;
          const rayLen = coreSize * (1.2 + Math.sin(timeRef.current * 0.1 + ray) * 0.3);
          const rx = c.x + Math.cos(angle) * rayLen;
          const ry = c.y + Math.sin(angle) * rayLen;
          const rayGrad = ctx.createLinearGradient(c.x, c.y, rx, ry);
          rayGrad.addColorStop(0, `rgba(${colors.accent},${0.06 * corePulse})`);
          rayGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = 2 + Math.sin(timeRef.current * 0.15 + ray * 0.5) * 1.5;
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(rx, ry);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = 'source-over';

      shockwavesRef.current.forEach(sw => {
        sw.radius += sw.speed;
        sw.alpha *= 0.96;
        if (sw.alpha < 0.01) { sw.alpha = 0; return; }
        ctx.beginPath();
        ctx.arc(sw.x + c.x, sw.y + c.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${colors.accent},${sw.alpha})`;
        ctx.lineWidth = 3 - sw.radius / sw.maxRadius * 2;
        ctx.stroke();
      });
      shockwavesRef.current = shockwavesRef.current.filter(sw => sw.alpha > 0.01);

      if (energyPulse > 0.05) {
        const flashGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 200);
        flashGrad.addColorStop(0, `rgba(255,255,255,${energyPulse * 0.3})`);
        flashGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = flashGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'rgba(5,10,20,1)' }}
    />
  );
}
