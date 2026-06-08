import { GestureType } from '@/types/gesture';
import { Hand, ArrowUp, ArrowLeft, ArrowRight, ThumbsUp, ThumbsDown, Scissors, Circle } from 'lucide-react';

export interface GestureCommand {
  gesture: GestureType;
  icon: React.ReactNode;
  name: string;
  description: string;
}

export const gestureCommands: GestureCommand[] = [
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
