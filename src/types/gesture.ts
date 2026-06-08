export type GestureType = 
  | 'open_palm'      // 张开手掌
  | 'point_up'       // 指向上方
  | 'point_left'     // 指向左
  | 'point_right'    // 指向右
  | 'thumbs_up'      // 大拇指向上
  | 'thumbs_down'    // 大拇指向下
  | 'peace'          // 剪刀手
  | 'fist'           // 拳头
  | 'unknown';       // 未知

export interface GestureResult {
  gesture: GestureType;
  confidence: number;
  landmarks: number[][];
  timestamp?: number;
}

export interface SystemStatus {
  time: string;
  network: 'online' | 'offline';
  cpu: number;
  memory: number;
}

export const GESTURE_THRESHOLD = 0.1;

export const FINGER_CONNECTIONS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];
