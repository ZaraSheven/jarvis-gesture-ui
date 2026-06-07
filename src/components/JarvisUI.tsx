import { useState } from 'react';
import { ParticleSystem } from './ParticleSystem';
import { StatusPanel } from './StatusPanel';
import { CentralVisual } from './CentralVisual';
import { CommandPanel } from './CommandPanel';
import { GestureCamera } from './GestureCamera';
import { useGestureDetection } from '../hooks/useGestureDetection';
import { GestureResult } from '../types/gesture';

export function JarvisUI() {
  const [gestureHistory, setGestureHistory] = useState<GestureResult[]>([]);

  const {
    videoRef,
    canvasRef,
    isCameraActive,
    isLoading,
    currentGesture,
    startCamera,
    stopCamera
  } = useGestureDetection({
    onGestureDetected: (gesture) => {
      setGestureHistory(prev => [...prev.slice(-9), gesture]);
    }
  });

  return (
    <div className="fixed inset-0 bg-[#0a192f] overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100, 255, 218, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 255, 218, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      <div 
        className="absolute inset-0 pointer-events-none z-50"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 2px)'
        }}
      />
      
      <ParticleSystem />
      
      <StatusPanel />
      
      <CentralVisual activeGesture={currentGesture?.gesture} />
      
      <CommandPanel activeGesture={currentGesture?.gesture} />
      
      <GestureCamera
        videoRef={videoRef}
        canvasRef={canvasRef}
        isCameraActive={isCameraActive}
        isLoading={isLoading}
        onStart={startCamera}
        onStop={stopCamera}
      />
      
      {gestureHistory.length > 0 && (
        <div className="fixed left-6 bottom-6 z-20">
          <div className="bg-[#0a192f]/90 backdrop-blur-md border border-[#64ffda]/30 rounded-xl p-4 shadow-lg shadow-[#64ffda]/10">
            <div className="text-[#64ffda] text-xs font-mono uppercase tracking-wider mb-3 border-b border-[#64ffda]/30 pb-2">
              Recent Gestures
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {[...gestureHistory].reverse().map((gesture, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-xs font-mono text-[#8892b0]"
                >
                  <span className="text-[#64ffda]/60">
                    {new Date().toLocaleTimeString('en-US', { 
                      hour12: false, 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    })}
                  </span>
                  <span className="text-[#64ffda]">
                    {gesture.gesture.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-[#0a192f]/60 backdrop-blur-sm px-6 py-3 rounded-full border border-[#64ffda]/20">
          <p className="text-[#8892b0] text-sm font-mono">
            Press <span className="text-[#64ffda]">START</span> on camera to begin gesture detection
          </p>
        </div>
      </div>
    </div>
  );
}
