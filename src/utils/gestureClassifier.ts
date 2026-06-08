import { GestureType, GESTURE_THRESHOLD } from '@/types/gesture';

const FINGER_TIPS = [8, 12, 16, 20];
const FINGER_PIP_JOINTS = [6, 10, 14, 18];
const THUMB_MCP_JOINT = 2;
const THUMB_TIP = 4;
const WRIST = 0;

function isFingerExtended(landmarks: number[][], tipIdx: number, pipJointIdx: number): boolean {
  const tip = landmarks[tipIdx];
  const pipJoint = landmarks[pipJointIdx];
  const wrist = landmarks[WRIST];
  return tip[1] < pipJoint[1] && tip[1] < wrist[1];
}

function getExtendedFingers(landmarks: number[][]): boolean[] {
  return FINGER_TIPS.map((tip, i) => isFingerExtended(landmarks, tip, FINGER_PIP_JOINTS[i]));
}

function classifyGesture(landmarks: number[][]): GestureType {
  if (landmarks.length !== 21) return 'unknown';

  const extendedFingers = getExtendedFingers(landmarks);
  const numExtended = extendedFingers.filter(Boolean).length;
  const wrist = landmarks[WRIST];
  
  const thumbTip = landmarks[THUMB_TIP];
  const thumbMcp = landmarks[THUMB_MCP_JOINT];
  const isThumbExtended = thumbTip[0] < thumbMcp[0];
  
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];

  if (numExtended === 4 && isThumbExtended) {
    return 'open_palm';
  }

  if (numExtended === 0 && !isThumbExtended) {
    return 'fist';
  }

  if (extendedFingers[0] && extendedFingers[1] && !extendedFingers[2] && !extendedFingers[3]) {
    const tipDistance = Math.sqrt(
      Math.pow(indexTip[0] - middleTip[0], 2) + 
      Math.pow(indexTip[1] - middleTip[1], 2)
    );
    if (tipDistance < 0.15) {
      return 'peace';
    }
  }

  if (extendedFingers[0] && !extendedFingers[1] && !extendedFingers[2] && !extendedFingers[3]) {
    if (indexTip[1] < wrist[1] - GESTURE_THRESHOLD) {
      return 'point_up';
    }
    if (indexTip[0] < wrist[0] - GESTURE_THRESHOLD) {
      return 'point_left';
    }
    if (indexTip[0] > wrist[0] + GESTURE_THRESHOLD) {
      return 'point_right';
    }
  }

  if (numExtended === 0 && isThumbExtended) {
    if (thumbTip[1] < wrist[1] - GESTURE_THRESHOLD) {
      return 'thumbs_up';
    }
    if (thumbTip[1] > wrist[1] + GESTURE_THRESHOLD) {
      return 'thumbs_down';
    }
  }

  return 'unknown';
}

export { classifyGesture };
