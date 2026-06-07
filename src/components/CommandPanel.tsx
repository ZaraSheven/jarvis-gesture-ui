import { GestureType } from '@/types/gesture';
import { Hand, ArrowUp, ArrowLeft, ArrowRight, ThumbsUp, ThumbsDown, Scissors, Circle } from 'lucide-react';

interface Command {
  gesture: GestureType;
  icon: React.ReactNode;
  name: string;
  description: string;
}

const commands: Command[] = [
  {
    gesture: 'open_palm',
    icon: <Hand className="w-5 h-5" />,
    name: 'Open Palm',
    description: 'Activate system'
  },
  {
    gesture: 'fist',
    icon: <Circle className="w-5 h-5" />,
    name: 'Fist',
    description: 'Stand by mode'
  },
  {
    gesture: 'point_up',
    icon: <ArrowUp className="w-5 h-5" />,
    name: 'Point Up',
    description: 'Navigate up'
  },
  {
    gesture: 'point_left',
    icon: <ArrowLeft className="w-5 h-5" />,
    name: 'Point Left',
    description: 'Navigate left'
  },
  {
    gesture: 'point_right',
    icon: <ArrowRight className="w-5 h-5" />,
    name: 'Point Right',
    description: 'Navigate right'
  },
  {
    gesture: 'thumbs_up',
    icon: <ThumbsUp className="w-5 h-5" />,
    name: 'Thumbs Up',
    description: 'Confirm'
  },
  {
    gesture: 'thumbs_down',
    icon: <ThumbsDown className="w-5 h-5" />,
    name: 'Thumbs Down',
    description: 'Cancel'
  },
  {
    gesture: 'peace',
    icon: <Scissors className="w-5 h-5" />,
    name: 'Peace',
    description: 'Take screenshot'
  }
];

interface CommandPanelProps {
  activeGesture?: GestureType;
}

export function CommandPanel({ activeGesture }: CommandPanelProps) {
  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-20">
      <div className="bg-[#0a192f]/90 backdrop-blur-md border border-[#64ffda]/30 rounded-xl p-4 shadow-lg shadow-[#64ffda]/10 max-h-[70vh] overflow-y-auto">
        <div className="text-[#64ffda] text-xs font-mono uppercase tracking-wider mb-4 border-b border-[#64ffda]/30 pb-2">
          Gesture Commands
        </div>
        <div className="space-y-2">
          {commands.map((cmd) => (
            <div
              key={cmd.gesture}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                activeGesture === cmd.gesture
                  ? 'bg-[#64ffda]/20 border border-[#64ffda]/50'
                  : 'border border-transparent hover:bg-[#64ffda]/10'
              }`}
            >
              <div className={`p-2 rounded-full ${
                activeGesture === cmd.gesture 
                  ? 'text-[#64ffda] bg-[#64ffda]/20' 
                  : 'text-[#64ffda]/60'
              }`}>
                {cmd.icon}
              </div>
              <div>
                <div className={`font-mono text-sm ${
                  activeGesture === cmd.gesture ? 'text-white' : 'text-[#8892b0]'
                }`}>
                  {cmd.name}
                </div>
                <div className="text-[#64ffda]/50 text-xs font-mono">
                  {cmd.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
