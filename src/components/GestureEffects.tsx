import { useEffect, useState } from 'react';

interface RippleEffect {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface GestureRippleProps {
  active: boolean;
  color?: string;
}

let rippleId = 0;

export function GestureRipple({ active, color = '#64ffda' }: GestureRippleProps) {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);

  useEffect(() => {
    if (active) {
      const newRipple: RippleEffect = {
        id: rippleId++,
        x: 50,
        y: 50,
        color,
        size: 100
      };

      setRipples(prev => [...prev.slice(-2), newRipple]);

      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 1500);
    }
  }, [active, color]);

  return (
    <div className="fixed inset-0 pointer-events-none z-15 flex items-center justify-center">
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute rounded-full"
          style={{
            left: `${ripple.x}%`,
            top: `${ripple.y}%`,
            width: `${ripple.size}px`,
            height: `${ripple.size}px`,
            transform: 'translate(-50%, -50%)',
            border: `3px solid ${ripple.color}`,
            animation: 'ripple-expand 1.5s ease-out forwards',
            boxShadow: `0 0 20px ${ripple.color}40, inset 0 0 20px ${ripple.color}20`
          }}
        />
      ))}
    </div>
  );
}

// Flash effect for gesture detection
export function GestureFlash({ active, color = '#64ffda' }: GestureRippleProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [active, color]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)`,
        animation: 'flash-fade 0.3s ease-out forwards'
      }}
    />
  );
}

// Scanning line effect when gesture is detected
export function GestureScanLine({ active, color = '#64ffda' }: GestureRippleProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [active, color]);

  if (!visible) return null;

  return (
    <div
      className="fixed left-0 right-0 h-1 pointer-events-none z-40"
      style={{
        background: `linear-gradient(90deg, transparent 0%, ${color} 20%, ${color} 80%, transparent 100%)`,
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}40`,
        animation: 'scan-down 1s ease-in-out forwards'
      }}
    />
  );
}
