import { useState } from 'react';
import { ParticleSystem } from './ParticleSystem';
import { StatusPanel } from './StatusPanel';
import { CentralVisual } from './CentralVisual';
import { CommandPanel } from './CommandPanel';
import { GestureCamera } from './GestureCamera';
import { useGestureDetection } from '../hooks/useGestureDetection';
import { GestureResult } from '../types/gesture';
import { gestureCommands } from '../config/gestureCommands';
import { Menu, X } from 'lucide-react';

export function JarvisUI() {
  const [gestureHistory, setGestureHistory] = useState<GestureResult[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const {
    videoRef,
    isCameraActive,
    isLoading,
    error,
    currentGesture,
    startCamera,
    stopCamera
  } = useGestureDetection({
    onGestureDetected: (gesture) => {
      setGestureHistory(prev => [...prev.slice(-9), gesture]);
    },
  });

  return (
    <div className="fixed inset-0 bg-[#0a192f] overflow-hidden">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100, 255, 218, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 255, 218, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Scanline effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-50"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 2px)'
        }}
      />
      
      {/* Particle system */}
      <ParticleSystem />
      
      {/* Status panel */}
      <StatusPanel />
      
      {/* Central visual */}
      <CentralVisual activeGesture={currentGesture?.gesture} />
      
      {/* Desktop command panel */}
      <CommandPanel activeGesture={currentGesture?.gesture} />
      
      {/* Gesture camera */}
      <GestureCamera
        videoRef={videoRef}
        isCameraActive={isCameraActive}
        isLoading={isLoading}
        error={error}
        onStart={startCamera}
        onStop={stopCamera}
      />
      
      {/* Mobile menu button */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="fixed left-3 top-20 z-30 lg:hidden bg-[#0a192f]/80 backdrop-blur-md border border-[#64ffda]/30 rounded-lg p-2.5 text-[#64ffda] shadow-lg shadow-[#64ffda]/10"
      >
        {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      
      {/* Mobile command menu */}
      {showMobileMenu && (
        <div className="fixed left-3 top-32 z-30 lg:hidden">
          <div className="bg-[#0a192f]/95 backdrop-blur-md border border-[#64ffda]/30 rounded-xl p-3 shadow-lg shadow-[#64ffda]/10 max-h-[50vh] overflow-y-auto w-48">
            <div className="text-[#64ffda] text-[10px] font-mono uppercase tracking-wider mb-2 border-b border-[#64ffda]/30 pb-1">
              Gesture Commands
            </div>
            <div className="space-y-1.5">
              {gestureCommands.map((cmd) => (
                <div
                  key={cmd.gesture}
                  className={`flex items-center gap-2 p-1.5 rounded-lg transition-all duration-300 ${
                    currentGesture?.gesture === cmd.gesture
                      ? 'bg-[#64ffda]/20 border border-[#64ffda]/50'
                      : 'border border-transparent hover:bg-[#64ffda]/10'
                  }`}
                >
                  <div className={`p-1.5 rounded-full ${
                    currentGesture?.gesture === cmd.gesture 
                      ? 'text-[#64ffda] bg-[#64ffda]/20' 
                      : 'text-[#64ffda]/60'
                  }`}>
                    {cmd.icon}
                  </div>
                  <div>
                    <div className={`font-mono text-[10px] ${
                      currentGesture?.gesture === cmd.gesture ? 'text-white' : 'text-[#8892b0]'
                    }`}>
                      {cmd.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Gesture history - desktop only */}
      {gestureHistory.length > 0 && (
        <div className="fixed left-3 md:left-6 bottom-3 md:bottom-6 z-20 hidden md:block">
          <div className="bg-[#0a192f]/90 backdrop-blur-md border border-[#64ffda]/30 rounded-xl p-3 md:p-4 shadow-lg shadow-[#64ffda]/10">
            <div className="text-[#64ffda] text-[10px] md:text-xs font-mono uppercase tracking-wider mb-2 md:mb-3 border-b border-[#64ffda]/30 pb-1 md:pb-2">
              Recent Gestures
            </div>
            <div className="space-y-1 max-h-24 md:max-h-32 overflow-y-auto">
              {[...gestureHistory].reverse().map((gesture, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-xs font-mono text-[#8892b0]"
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
      
      {/* Help hint */}
      <div className="fixed bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-[#0a192f]/60 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 rounded-full border border-[#64ffda]/20">
          <p className="text-[#8892b0] text-[10px] md:text-sm font-mono">
            Press <span className="text-[#64ffda]">START</span> on camera to begin gesture detection
          </p>
        </div>
      </div>
    </div>
  );
}
