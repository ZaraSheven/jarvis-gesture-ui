import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands } from '@mediapipe/hands';
import type { Results as MediaPipeResults } from '@mediapipe/hands';
import { GestureResult } from '@/types/gesture';
import { classifyGesture } from '@/utils/gestureClassifier';

const DETECTION_FPS = 15;
const DETECTION_INTERVAL = 1000 / DETECTION_FPS;

interface UseGestureDetectionProps {
  onGestureDetected?: (result: GestureResult) => void;
}

export function useGestureDetection({ onGestureDetected }: UseGestureDetectionProps = {}) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<GestureResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastResultRef = useRef<GestureResult | null>(null);
  const lastDetectionRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const isDetectingRef = useRef(false);
  const callbackRef = useRef(onGestureDetected);

  useEffect(() => {
    callbackRef.current = onGestureDetected;
  }, [onGestureDetected]);

  const initHands = useCallback(async () => {
    if (handsRef.current) return handsRef.current;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    });

    hands.onResults(processResults);
    handsRef.current = hands;
    
    return hands;
  }, []);

  const processResults = useCallback((results: MediaPipeResults) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const rawLandmarks = results.multiHandLandmarks[0];
      const landmarks = rawLandmarks.map(lm => [lm.x, lm.y, lm.z]);
      const gesture = classifyGesture(landmarks);
      
      const confidence = gesture !== 'unknown' ? 0.85 : 0.3;
      
      const result: GestureResult = {
        gesture,
        confidence,
        landmarks
      };

      if (gesture !== lastResultRef.current?.gesture) {
        setCurrentGesture(result);
        callbackRef.current?.(result);
        lastResultRef.current = result;
      }
    } else {
      setCurrentGesture(null);
      lastResultRef.current = null;
    }
  }, []);

  const detectionLoop = useCallback(async () => {
    if (!isDetectingRef.current) return;
    
    if (videoRef.current && handsRef.current) {
      try {
        const now = Date.now();
        if (now - lastDetectionRef.current >= DETECTION_INTERVAL) {
          await handsRef.current.send({ image: videoRef.current });
          lastDetectionRef.current = now;
        }
      } catch (err) {
        console.error('Detection error:', err);
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(detectionLoop);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const hands = await initHands();
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current!.play().then(() => resolve());
            };
          } else {
            resolve();
          }
        });

        isDetectingRef.current = true;
        setIsCameraActive(true);
        setIsLoading(false);
        
        animationFrameRef.current = requestAnimationFrame(detectionLoop);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setError(error instanceof Error ? error.message : 'Failed to access camera');
      setIsLoading(false);
      setIsCameraActive(false);
    }
  }, [initHands, detectionLoop]);

  const stopCamera = useCallback(() => {
    isDetectingRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsCameraActive(false);
    setCurrentGesture(null);
  }, []);

  useEffect(() => {
    return () => {
      isDetectingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    isCameraActive,
    isLoading,
    error,
    currentGesture,
    startCamera,
    stopCamera
  };
}
