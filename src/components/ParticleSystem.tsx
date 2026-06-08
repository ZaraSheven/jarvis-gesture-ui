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
  brightness: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

interface WeaponStructure {
  bladeOutline: Array<{ x: number; y: number }>;
  bladeFill: Array<{ x: number; y: number; density: number }>;
  fuller: Array<{ x: number; y: number }>;
  guardLeft: Array<{ x: number; y: number }>;
  guardRight: Array<{ x: number; y: number }>;
  guardDetails: Array<{ x: number; y: number }>;
  handleWrap: Array<{ x: number; y: number }>;
  chainLinks: Array<{ x: number; y: number }>;
  gemPositions: Array<{ x: number; y: number; r: number }>;
  topOrnament: Array<{ x: number; y: number }>;
  edgeGlow: Array<{ x: number; y: number }>;
}

interface ParticleSystemProps {
  activeGesture?: GestureType;
}

const MAIN_PARTICLES = 600;
const WEAPON_TARGETS = 400;
const AMBIENT_DUST = 100;

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
  const weaponPointsRef = useRef<Array<{ x: number; y: number; z: number; brightness: number }>>([]);
  const weaponStructureRef = useRef<WeaponStructure | null>(null);
  const lastFrameTimeRef = useRef(0);

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

    const gestureColors: Record<GestureType, { core: string; glow: string; accent: string; gem: string }> = {
      point_up:     { core: '80,180,255', glow: '40,120,220', accent: '150,220,255', gem: '120,200,255' },
      peace:        { core: '255,100,180', glow: '200,50,130',  accent: '255,180,220', gem: '255,140,200' },
      thumbs_up:    { core: '80,255,140',  glow: '40,180,100',  accent: '150,255,200', gem: '120,255,170' },
      fist:         { core: '180,190,210', glow: '120,130,160', accent: '220,225,240', gem: '200,210,230' },
      point_left:   { core: '180,130,255', glow: '120,80,220',  accent: '220,200,255', gem: '200,160,255' },
      point_right:  { core: '255,200,80',  glow: '220,150,40',  accent: '255,240,180', gem: '255,220,120' },
      thumbs_down:  { core: '255,80,80',   glow: '200,40,40',   accent: '255,180,180', gem: '255,120,120' },
      open_palm:    { core: '100,255,218', glow: '60,180,150',  accent: '180,255,240', gem: '140,255,230' },
      unknown:      { core: '100,255,218', glow: '60,180,150',  accent: '180,255,240', gem: '140,255,230' }
    };

    const buildWeaponStructure = (gesture: GestureType): WeaponStructure => {
      const s = Math.min(canvas.width, canvas.height) / 800;
      const c = getCenter();
      const struct: WeaponStructure = {
        bladeOutline: [], bladeFill: [], fuller: [],
        guardLeft: [], guardRight: [], guardDetails: [],
        handleWrap: [], chainLinks: [], gemPositions: [],
        topOrnament: [], edgeGlow: []
      };

      const bladeTipY = c.y - 220 * s;
      const bladeBaseY = c.y + 140 * s;
      const bladeH = bladeBaseY - bladeTipY;

      const bladeWidthAt = (t: number) => {
        if (t < 0.15) return t / 0.15 * 18 * s;
        if (t < 0.6) return 18 * s + Math.sin((t - 0.15) / 0.45 * Math.PI) * 14 * s;
        return 18 * s + Math.sin((t - 0.6) / 0.4 * Math.PI) * 8 * s;
      };

      const bladeEdgeL: Array<{ x: number; y: number }> = [];
      const bladeEdgeR: Array<{ x: number; y: number }> = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const y = bladeTipY + t * bladeH;
        const w = bladeWidthAt(t);
        bladeEdgeL.push({ x: c.x - w, y });
        bladeEdgeR.push({ x: c.x + w, y });
      }
      struct.bladeOutline = [...bladeEdgeL, ...bladeEdgeR.slice().reverse()];

      for (let row = 0; row < 15; row++) {
        const t = (row + 0.5) / 15;
        const y = bladeTipY + t * bladeH;
        const w = bladeWidthAt(t);
        const cols = Math.max(3, Math.floor(w * 0.6));
        for (let col = 0; col < cols; col++) {
          const frac = (col + Math.random() * 0.5) / (cols - 1);
          const x = c.x - w + frac * w * 2;
          struct.bladeFill.push({
            x: x + (Math.random() - 0.5) * 3,
            y: y + (Math.random() - 0.5) * 3,
            density: Math.random()
          });
        }
      }

      const fullerStartY = c.y - 120 * s;
      const fullerEndY = c.y + 80 * s;
      const fullerH = fullerEndY - fullerStartY;
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const y = fullerStartY + t * fullerH;
        const w = 3 * s * Math.sin(t * Math.PI);
        struct.fuller.push({ x: c.x - w, y });
        struct.fuller.push({ x: c.x + w, y });
      }

      const guardY = c.y + 140 * s;
      const guardW = 55 * s;
      for (let i = 0; i <= 25; i++) {
        const t = i / 25;
        const curve = Math.sin(t * Math.PI) * 15 * s;
        struct.guardLeft.push({
          x: c.x - guardW + t * guardW * 0.5,
          y: guardY - curve
        });
        struct.guardRight.push({
          x: c.x + guardW - t * guardW * 0.5,
          y: guardY - curve
        });
      }

      struct.guardDetails.push(
        { x: c.x - guardW * 0.8, y: guardY - 8 * s },
        { x: c.x - guardW * 0.6, y: guardY - 12 * s },
        { x: c.x - guardW * 0.3, y: guardY - 10 * s },
        { x: c.x + guardW * 0.8, y: guardY - 8 * s },
        { x: c.x + guardW * 0.6, y: guardY - 12 * s },
        { x: c.x + guardW * 0.3, y: guardY - 10 * s }
      );

      const handleStartY = guardY + 10 * s;
      const handleEndY = guardY + 80 * s;
      for (let i = 0; i < 12; i++) {
        const t = i / 12;
        const y = handleStartY + t * (handleEndY - handleStartY);
        const wrapAngle = t * Math.PI * 6;
        const wrapR = 8 * s;
        struct.handleWrap.push({
          x: c.x + Math.cos(wrapAngle) * wrapR,
          y: y + Math.sin(wrapAngle) * 3
        });
      }

      for (let link = 0; link < 8; link++) {
        const linkT = 0.2 + link * 0.08;
        const linkY = handleStartY + linkT * (handleEndY - handleStartY);
        const linkX = c.x + Math.sin(linkT * Math.PI * 4) * 12 * s;
        for (let p = 0; p < 8; p++) {
          const a = (p / 8) * Math.PI * 2;
          struct.chainLinks.push({
            x: linkX + Math.cos(a) * 4 * s,
            y: linkY + Math.sin(a) * 4 * s
          });
        }
      }

      struct.gemPositions.push(
        { x: c.x, y: bladeTipY + 30 * s, r: 6 * s },
        { x: c.x - guardW * 0.5, y: guardY - 6 * s, r: 4 * s },
        { x: c.x + guardW * 0.5, y: guardY - 6 * s, r: 4 * s }
      );

      const topY = guardY + 90 * s;
      const ringR = 14 * s;
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * Math.PI * 2;
        struct.topOrnament.push({
          x: c.x + Math.cos(a) * ringR,
          y: topY + Math.sin(a) * ringR * 0.6
        });
      }
      for (let ray = 0; ray < 8; ray++) {
        const a = (ray / 8) * Math.PI * 2;
        for (let i = 0; i < 5; i++) {
          const t = i / 5;
          struct.topOrnament.push({
            x: c.x + Math.cos(a) * (ringR + t * 10 * s),
            y: topY + Math.sin(a) * (ringR * 0.6 + t * 6 * s)
          });
        }
      }

      for (let i = 0; i < bladeEdgeL.length; i++) {
        struct.edgeGlow.push({ ...bladeEdgeL[i] });
        struct.edgeGlow.push({ ...bladeEdgeR[i] });
      }

      return struct;
    };

    const generateWeaponTargets3D = (gesture: GestureType, count: number) => {
      const pts: Array<{ x: number; y: number; z: number; brightness: number }> = [];
      const s = Math.min(canvas.width, canvas.height) / 800;
      const c = getCenter();

      const addPoint = (x: number, y: number, z = 0, brightness = 1) => pts.push({ x, y, z, brightness });

      const struct = buildWeaponStructure(gesture);

      if (gesture === 'point_up') {
        struct.bladeOutline.forEach((p, i) => {
          addPoint(p.x, p.y, (Math.random() - 0.5) * 30 * s, 1.0);
        });
        struct.bladeFill.forEach((p, i) => {
          addPoint(p.x, p.y, (Math.random() - 0.5) * 20 * s, 0.4 + p.density * 0.6);
        });
        struct.fuller.forEach(p => addPoint(p.x, p.y, (Math.random() - 0.5) * 15 * s, 0.7));
        struct.guardLeft.forEach(p => addPoint(p.x, p.y, (Math.random() - 0.5) * 20 * s, 0.9));
        struct.guardRight.forEach(p => addPoint(p.x, p.y, (Math.random() - 0.5) * 20 * s, 0.9));
        struct.guardDetails.forEach(p => addPoint(p.x, p.y, (Math.random() - 0.5) * 15 * s, 1.0));
        struct.handleWrap.forEach(p => addPoint(p.x, p.y, (Math.random() - 0.5) * 10 * s, 0.6));
        struct.chainLinks.forEach(p => addPoint(p.x, p.y, (Math.random() - 0.5) * 25 * s, 0.8));
        struct.gemPositions.forEach(g => {
          for (let i = 0; i < 15; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = Math.random() * g.r;
            addPoint(g.x + Math.cos(a) * r, g.y + Math.sin(a) * r,
                     (Math.random() - 0.5) * 10 * s, 1.2);
          }
        });
        struct.topOrnament.forEach(p => addPoint(p.x, p.y, (Math.random() - 0.5) * 20 * s, 0.9));
        struct.edgeGlow.forEach(p => addPoint(p.x, p.y, 0, 0.3));
      } else if (gesture === 'peace') {
        const dualOffset = 35 * s;
        for (let side = -1; side <= 1; side += 2) {
          const ox = side * dualOffset;
          for (let i = 0; i < 30; i++) {
            const t = i / 30;
            const y = c.y - 200 * s + t * 340 * s;
            const w = (3 + Math.sin(t * Math.PI) * 8) * s;
            addPoint(c.x + ox - w, y, (Math.random() - 0.5) * 20 * s, 0.9);
            addPoint(c.x + ox + w, y, (Math.random() - 0.5) * 20 * s, 0.9);
          }
          for (let row = 0; row < 12; row++) {
            const t = (row + 0.5) / 12;
            const y = c.y - 200 * s + t * 340 * s;
            const w = (3 + Math.sin(t * Math.PI) * 8) * s;
            for (let col = 0; col < 4; col++) {
              const frac = (col + Math.random()) / 4;
              addPoint(c.x + ox - w + frac * w * 2, y + (Math.random() - 0.5) * 2,
                       (Math.random() - 0.5) * 15 * s, 0.4 + Math.random() * 0.3);
            }
          }
          for (let i = 0; i < 10; i++) {
            const t = Math.random();
            addPoint(c.x + ox - 12 * s + t * 24 * s, c.y + 140 * s,
                     (Math.random() - 0.5) * 10 * s, 0.7);
          }
        }
        for (let i = 0; i < 20; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = 15 * s + Math.random() * 20 * s;
          addPoint(c.x + Math.cos(a) * r, c.y + 170 * s + Math.sin(a) * r * 0.4,
                   (Math.random() - 0.5) * 30 * s, 0.5);
        }
      } else if (gesture === 'thumbs_up') {
        const shieldR = 90 * s;
        for (let layer = 0; layer < 5; layer++) {
          const r = shieldR * (0.2 + layer * 0.2);
          const ptsForLayer = 30 + layer * 10;
          for (let i = 0; i < ptsForLayer; i++) {
            const a = Math.random() * Math.PI * 2;
            addPoint(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r,
                     (layer - 2) * 30 * s + (Math.random() - 0.5) * 15 * s, 0.6);
          }
        }
        const sides = 8;
        for (let i = 0; i < 60; i++) {
          const side = Math.floor(Math.random() * sides);
          const t = Math.random();
          const a1 = (side / sides) * Math.PI * 2 - Math.PI / 2;
          const a2 = ((side + 1) / sides) * Math.PI * 2 - Math.PI / 2;
          const x1 = c.x + Math.cos(a1) * shieldR;
          const y1 = c.y + Math.sin(a1) * shieldR;
          const x2 = c.x + Math.cos(a2) * shieldR;
          const y2 = c.y + Math.sin(a2) * shieldR;
          addPoint(x1 + (x2 - x1) * t + (Math.random() - 0.5) * 4,
                   y1 + (y2 - y1) * t + (Math.random() - 0.5) * 4,
                   (Math.random() - 0.5) * 20 * s, 1.0);
        }
        for (let i = 0; i < 20; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = shieldR * 1.3;
          addPoint(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r,
                   (Math.random() - 0.5) * 50 * s, 0.4);
        }
      } else if (gesture === 'fist') {
        const R = 70 * s;
        for (let i = 0; i < count; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = R * (0.2 + Math.random() * 0.8);
          addPoint(c.x + r * Math.sin(phi) * Math.cos(theta),
                   c.y + r * Math.sin(phi) * Math.sin(theta),
                   r * Math.cos(phi), 0.3 + Math.random() * 0.7);
        }
        for (let i = 0; i < count * 0.3; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = R * 1.2 + Math.random() * 40 * s;
          addPoint(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r,
                   (Math.random() - 0.5) * 80 * s, 0.3);
        }
      } else if (gesture === 'point_left' || gesture === 'point_right') {
        const dir = gesture === 'point_left' ? -1 : 1;
        const len = 200 * s;
        for (let i = 0; i < 30; i++) {
          const t = i / 30;
          const x = c.x - dir * len * 0.5 + t * len;
          const w = (3 + Math.sin(t * Math.PI) * 6) * s;
          addPoint(x, c.y - w, (Math.random() - 0.5) * 15 * s, 0.9);
          addPoint(x, c.y + w, (Math.random() - 0.5) * 15 * s, 0.9);
        }
        for (let row = 0; row < 10; row++) {
          const t = (row + 0.5) / 10;
          const x = c.x - dir * len * 0.5 + t * len;
          const w = (3 + Math.sin(t * Math.PI) * 6) * s;
          for (let col = 0; col < 3; col++) {
            const frac = (col + Math.random()) / 3;
            addPoint(x, c.y - w + frac * w * 2 + (Math.random() - 0.5) * 2,
                     (Math.random() - 0.5) * 10 * s, 0.4);
          }
        }
        for (let i = 0; i < 15; i++) {
          const t = Math.random();
          const x = c.x + dir * len * 0.5 - t * 50 * s;
          const w = 30 * s * t;
          addPoint(x, c.y + (Math.random() - 0.5) * w,
                   (Math.random() - 0.5) * 15 * s, 0.8);
        }
      } else {
        for (let i = 0; i < count; i++) {
          addPoint(Math.random() * canvas.width, Math.random() * canvas.height,
                   (Math.random() - 0.5) * 200, 0.5);
        }
      }

      weaponStructureRef.current = struct;
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
      energy: Math.random(),
      brightness: 1
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
      energy: 0,
      brightness: 0
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

    const drawConnectedStructure = (points: Array<{ x: number; y: number }>, color: string, alpha: number) => {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = `rgba(${color},${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const animate = (timestamp: number) => {
      const deltaTime = lastFrameTimeRef.current ? (timestamp - lastFrameTimeRef.current) / 16.67 : 1;
      lastFrameTimeRef.current = timestamp;
      const clampedDelta = Math.min(deltaTime, 3);
      timeRef.current += clampedDelta;
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

      ctx.fillStyle = 'rgba(5,10,20,0.12)';
      ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);

      ctx.globalCompositeOperation = 'lighter';

      const targets = weaponPointsRef.current;
      const weaponDepth = Math.sin(timeRef.current * 0.02) * 30;
      const struct = weaponStructureRef.current;

      if (isWeapon && struct) {
        drawConnectedStructure(struct.bladeOutline, colors.glow, 0.15);
        drawConnectedStructure(struct.fuller, colors.accent, 0.1);
        drawConnectedStructure(struct.guardLeft, colors.core, 0.25);
        drawConnectedStructure(struct.guardRight, colors.core, 0.25);
        drawConnectedStructure(struct.handleWrap, colors.glow, 0.2);
        drawConnectedStructure(struct.chainLinks, colors.accent, 0.2);
        drawConnectedStructure(struct.topOrnament, colors.accent, 0.15);
        drawConnectedStructure(struct.edgeGlow, colors.accent, 0.08);
      }

      particlesRef.current.forEach((p, i) => {
        const targetZ = isWeapon ? weaponDepth : 0;
        const speed = isTransitioning.current ? 0.12 : 0.04;

        if (isWeapon && i < targets.length) {
          const tgt = targets[i];
          const tx = tgt.x + Math.sin(timeRef.current * 0.03 + i * 0.08) * 2;
          const ty = tgt.y + Math.cos(timeRef.current * 0.03 + i * 0.08) * 2;
          p.vx += (tx - p.x) * speed;
          p.vy += (ty - p.y) * speed;
          p.vz += (tgt.z - p.z) * speed * 0.5;
          p.vx *= 0.82; p.vy *= 0.82; p.vz *= 0.82;
          p.brightness = tgt.brightness;
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
        if (p.trail.length > 5) p.trail.pop();

        const proj = projectZ(p.z);
        const screenX = c.x + (p.x - c.x) * proj;
        const screenY = c.y + (p.y - c.y) * proj;
        const screenR = Math.max(0.3, p.size * proj);

        const depthFade = Math.max(0.1, Math.min(1, (p.z + 200) / 400));
        const baseAlpha = isWeapon ? 0.3 + p.brightness * 0.7 : 0.2 + p.energy * 0.3;
        const a = baseAlpha * depthFade;

        if (p.trail.length > 1 && vel > 0.5) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.strokeStyle = `rgba(${colors.core},${a * 0.2})`;
          ctx.lineWidth = screenR * 0.4;
          ctx.stroke();
        }

        ctx.fillStyle = `rgba(${colors.core},${a})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, screenR, 0, Math.PI * 2);
        ctx.fill();

        if (isWeapon && p.brightness > 0.8) {
          ctx.fillStyle = `rgba(${colors.glow},${a * 0.2})`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, screenR * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if (isWeapon && struct) {
        struct.gemPositions.forEach(gem => {
          const gemPulse = Math.sin(timeRef.current * 0.06) * 0.3 + 0.7;
          const gemGrad = ctx.createRadialGradient(gem.x, gem.y, 0, gem.x, gem.y, gem.r * 1.5);
          gemGrad.addColorStop(0, `rgba(${colors.gem},${0.7 * gemPulse})`);
          gemGrad.addColorStop(0.4, `rgba(${colors.gem},${0.2 * gemPulse})`);
          gemGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gemGrad;
          ctx.beginPath();
          ctx.arc(gem.x, gem.y, gem.r * 1.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255,255,255,${0.5 * gemPulse})`;
          ctx.beginPath();
          ctx.arc(gem.x, gem.y, gem.r * 0.3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

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
        const coreSize = 100 * Math.min(canvas.width, canvas.height) / 800 * corePulse;

        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, coreSize);
        grad.addColorStop(0, `rgba(${colors.core},${0.04 * corePulse})`);
        grad.addColorStop(0.3, `rgba(${colors.glow},${0.02 * corePulse})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(c.x - coreSize, c.y - coreSize, coreSize * 2, coreSize * 2);

        for (let ray = 0; ray < 6; ray++) {
          const angle = (ray / 6) * Math.PI * 2 + timeRef.current * 0.003;
          const rayLen = coreSize * (1.3 + Math.sin(timeRef.current * 0.08 + ray) * 0.3);
          const rx = c.x + Math.cos(angle) * rayLen;
          const ry = c.y + Math.sin(angle) * rayLen;
          const rayGrad = ctx.createLinearGradient(c.x, c.y, rx, ry);
          rayGrad.addColorStop(0, `rgba(${colors.accent},${0.025 * corePulse})`);
          rayGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = 1 + Math.sin(timeRef.current * 0.12 + ray * 0.7) * 0.5;
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

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#0a192f' }}
    />
  );
}
