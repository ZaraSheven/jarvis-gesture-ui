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
}

export interface SystemStatus {
  time: string;
  network: 'online' | 'offline';
  cpu: number;
  memory: number;
}
