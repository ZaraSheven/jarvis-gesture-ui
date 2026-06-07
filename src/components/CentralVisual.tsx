import { useEffect, useRef, useState } from 'react';
import { GestureType } from '@/types/gesture';

interface CentralVisualProps {
  activeGesture?: GestureType;
}

export function CentralVisual({ activeGesture }: CentralVisualProps) {
  const [pulse, setPulse] = useState(1);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      setPulse(prev => prev + 0.01);
      setRotation(prev => prev + 0.2);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const getGestureText = (gesture?: GestureType): string => {
    if (!gesture || gesture === 'unknown') return 'AWAITING GESTURE';
    
    const texts: Record<GestureType, string> = {
      open_palm: 'SYSTEM ACTIVE',
      point_up: 'NAVIGATING UP',
      point_left: 'NAVIGATING LEFT',
      point_right: 'NAVIGATING RIGHT',
      thumbs_up: 'ACTION CONFIRMED',
      thumbs_down: 'ACTION CANCELLED',
      peace: 'CAPTURING SCREEN',
      fist: 'STANDBY MODE',
      unknown: 'AWAITING GESTURE'
    };
    
    return texts[gesture] || 'AWAITING GESTURE';
  };

  const getRingColor = (gesture?: GestureType): string => {
    if (!gesture || gesture === 'unknown') return '#64ffda';
    
    const colors: Partial<Record<GestureType, string>> = {
      open_palm: '#64ffda',
      thumbs_up: '#22c55e',
      thumbs_down: '#ef4444',
      peace: '#f59e0b',
      fist: '#64748b'
    };
    
    return colors[gesture] || '#64ffda';
  };

  const ringColor = getRingColor(activeGesture);
  const hasGesture = activeGesture && activeGesture !== 'unknown';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="relative">
        {/* Outer pulse ring */}
        <div 
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            width: '120px',
            height: '120px',
            marginLeft: '-60px',
            marginTop: '-60px',
            left: '50%',
            top: '50%',
            border: `1.5px solid ${ringColor}`,
            opacity: 0.2
          }}
        />
        
        {/* Middle pulse ring */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            width: '100px',
            height: '100px',
            marginLeft: '-50px',
            marginTop: '-50px',
            left: '50%',
            top: '50%',
            border: `1.5px solid ${ringColor}`,
            opacity: 0.4,
            transform: `scale(${1 + Math.sin(pulse) * 0.1})`
          }}
        />
        
        {/* Rotating ring */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            width: '80px',
            height: '80px',
            marginLeft: '-40px',
            marginTop: '-40px',
            left: '50%',
            top: '50%',
            border: `2px solid ${ringColor}`,
            boxShadow: `0 0 20px ${ringColor}40, inset 0 0 20px ${ringColor}20`,
            transform: `rotate(${rotation}deg)`
          }}
        >
          <div 
            className="absolute top-0 left-1/2 w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ backgroundColor: ringColor, boxShadow: `0 0 8px ${ringColor}` }}
          />
          <div 
            className="absolute bottom-0 left-1/2 w-1.5 h-1.5 rounded-full -translate-x-1/2 translate-y-1/2"
            style={{ backgroundColor: ringColor, boxShadow: `0 0 8px ${ringColor}` }}
          />
          <div 
            className="absolute left-0 top-1/2 w-1.5 h-1.5 rounded-full -translate-y-1/2 -translate-x-1/2"
            style={{ backgroundColor: ringColor, boxShadow: `0 0 8px ${ringColor}` }}
          />
          <div 
            className="absolute right-0 top-1/2 w-1.5 h-1.5 rounded-full -translate-y-1/2 translate-x-1/2"
            style={{ backgroundColor: ringColor, boxShadow: `0 0 8px ${ringColor}` }}
          />
        </div>
        
        {/* Center core */}
        <div 
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            width: '50px',
            height: '50px',
            marginLeft: '-25px',
            marginTop: '-25px',
            left: '50%',
            top: '50%',
            border: `1.5px solid ${ringColor}`,
            background: `radial-gradient(circle, ${ringColor}10 0%, transparent 70%)`,
            boxShadow: `0 0 30px ${ringColor}30`
          }}
        >
          <div 
            className="w-2.5 h-2.5 rounded-full"
            style={{ 
              backgroundColor: ringColor,
              boxShadow: `0 0 15px ${ringColor}, 0 0 30px ${ringColor}60`,
              transform: `scale(${0.8 + Math.sin(pulse * 2) * 0.2})`
            }}
          />
        </div>
        
        {/* Text label */}
        <div 
          className="absolute top-1/2 left-1/2 text-center whitespace-nowrap"
          style={{
            transform: 'translate(-50%, 60px)'
          }}
        >
          <div 
            className="font-mono text-[10px] md:text-sm uppercase tracking-widest mb-1 md:mb-2"
            style={{ color: ringColor }}
          >
            JARVIS INTERFACE
          </div>
          <div 
            className={`font-mono text-sm md:text-xl font-bold transition-all duration-300 ${
              hasGesture ? 'animate-pulse' : ''
            }`}
            style={{ 
              color: hasGesture ? ringColor : '#8892b0',
              textShadow: hasGesture ? `0 0 15px ${ringColor}80` : 'none'
            }}
          >
            {getGestureText(activeGesture)}
          </div>
          {hasGesture && (
            <div 
              className="mt-1 font-mono text-[10px] md:text-xs"
              style={{ color: ringColor }}
            >
              GESTURE: {activeGesture.toUpperCase().replace('_', ' ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
