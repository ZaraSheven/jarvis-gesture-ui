import { GestureType } from '@/types/gesture';

const fingerTips = [8, 12, 16, 20];
const fingerBases = [5, 9, 13, 17];
const thumbTip = 4;
const thumbBase = 2;

export function classifyGesture(landmarks: number[][]): GestureType {
  if (landmarks.length !== 21) return 'unknown';

  const isFingerExtended = (tipIdx: number, baseIdx: number): boolean => {
    return landmarks[tipIdx][1] < landmarks[baseIdx][1];
  };

  const isFingerLeft = (tipIdx: number, baseIdx: number): boolean => {
    return landmarks[tipIdx][0] < landmarks[baseIdx][0];
  };

  const isFingerRight = (tipIdx: number, baseIdx: number): boolean => {
    return landmarks[tipIdx][0] > landmarks[baseIdx][0];
  };

  const isFingerUp = (tipIdx: number, baseIdx: number): boolean => {
    return landmarks[tipIdx][1] < landmarks[baseIdx][1];
  };

  const isThumbExtended = (): boolean => {
    return landmarks[thumbTip][0] < landmarks[thumbBase][0];
  };

  const extendedFingers = fingerTips.map((tip, i) => 
    isFingerExtended(tip, fingerBases[i]));
  const numExtended = extendedFingers.filter(Boolean).length;
  const thumbExtended = isThumbExtended();

  if (numExtended === 4 && thumbExtended) {
    return 'open_palm';
  }

  if (numExtended === 0 && !thumbExtended) {
    return 'fist';
  }

  if (numExtended === 2 && extendedFingers[0] && extendedFingers[1]) {
    return 'peace';
  }

  if (numExtended === 1 && extendedFingers[0]) {
    const indexTip = landmarks[8];
    const indexBase = landmarks[5];
    const wrist = landmarks[0];
    
    if (indexTip[1] < wrist[1] - 0.1) {
      return 'point_up';
    } else if (indexTip[0] < wrist[0] - 0.1) {
      return 'point_left';
    } else if (indexTip[0] > wrist[0] + 0.1) {
      return 'point_right';
    }
  }

  if (numExtended === 0 && thumbExtended) {
    const thumbY = landmarks[thumbTip][1];
    const wristY = landmarks[0][1];
    
    if (thumbY < wristY - 0.1) {
      return 'thumbs_up';
    } else if (thumbY > wristY + 0.1) {
      return 'thumbs_down';
    }
  }

  return 'unknown';
}
