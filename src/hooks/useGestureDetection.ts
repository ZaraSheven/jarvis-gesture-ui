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
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastResultRef = useRef<GestureResult | null>(null);
  const lastDetectionRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const callbackRef = useRef(onGestureDetected);

  useEffect(() => {
    callbackRef.current = onGestureDetected;
  }, [onGestureDetected]);

  const initHands = useCallback(async () => {
    if (handsRef.current) return;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    });

    handsRef.current = hands;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      await initHands();

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
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      setIsLoading(false);
      startDetection();
    } catch (error) {
      console.error('Camera access error:', error);
      setIsLoading(false);
    }
  }, [initHands]);

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsCameraActive(false);
    setCurrentGesture(null);
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

  const startDetection = useCallback(() => {
    if (!handsRef.current || !videoRef.current) return;

    handsRef.current.onResults(processResults);

    const renderFrame = async () => {
      if (videoRef.current && handsRef.current) {
        const now = Date.now();
        if (now - lastDetectionRef.current >= DETECTION_INTERVAL) {
          await handsRef.current.send({ image: videoRef.current });
          lastDetectionRef.current = now;
        }
      }
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }, [processResults]);

  useEffect(() => {
    return () => {
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
    currentGesture,
    startCamera,
    stopCamera
  };
}
