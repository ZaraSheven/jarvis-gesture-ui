import { Video, VideoOff, Loader2, Zap } from 'lucide-react';

interface GestureCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isCameraActive: boolean;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function GestureCamera({ 
  videoRef, 
  isCameraActive, 
  isLoading, 
  onStart, 
  onStop 
}: GestureCameraProps) {
  return (
    <div className="fixed right-3 md:right-6 bottom-3 md:bottom-6 z-20">
      <div className="bg-[#0a192f]/90 backdrop-blur-md border border-[#64ffda]/30 rounded-xl p-3 md:p-4 shadow-lg shadow-[#64ffda]/10">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
              isCameraActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
            }`} />
            <span className="text-[#64ffda] text-[10px] md:text-xs font-mono uppercase tracking-wider">
              Gesture Camera
            </span>
          </div>
          {!isCameraActive ? (
            <button
              onClick={onStart}
              disabled={isLoading}
              className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 bg-[#64ffda]/10 border border-[#64ffda]/50 rounded-lg text-[#64ffda] hover:bg-[#64ffda]/20 transition-all text-[10px] md:text-xs font-mono"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <Video className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              {isLoading ? 'LOADING' : 'START'}
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-[10px] md:text-xs font-mono"
            >
              <VideoOff className="w-3.5 h-3.5 md:w-4 md:h-4" />
              STOP
            </button>
          )}
        </div>
        
        <div className="relative w-48 h-36 md:w-64 md:h-48 bg-[#0a192f] rounded-lg overflow-hidden border border-[#64ffda]/20">
          <video
            ref={videoRef}
            className="w-full h-full object-cover transform scale-x-[-1]"
            playsInline
            muted
          />
          
          {!isCameraActive && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a192f]/90">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-[#64ffda]/50 mb-2" />
              <span className="text-[#8892b0] text-[10px] md:text-xs font-mono">
                Camera Disabled
              </span>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a192f]/90">
              <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-[#64ffda] animate-spin mb-2" />
              <span className="text-[#8892b0] text-[10px] md:text-xs font-mono">
                Initializing Camera...
              </span>
            </div>
          )}
          
          <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 right-1.5 md:right-2 flex justify-between items-center pointer-events-none">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-[8px] md:text-xs font-mono">REC</span>
            </div>
            <div className="bg-black/50 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[#64ffda] text-[8px] md:text-xs font-mono">
              HD
            </div>
          </div>
          
          <div className="absolute bottom-1.5 md:bottom-2 left-1.5 md:left-2 right-1.5 md:right-2 flex justify-between items-center pointer-events-none">
            <div className="bg-black/50 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-white text-[8px] md:text-xs font-mono">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="w-5 h-5 md:w-8 md:h-8 border-2 border-[#64ffda] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
