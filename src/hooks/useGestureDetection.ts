import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands } from '@mediapipe/hands';
import { GestureResult, GestureType } from '@/types/gesture';
import { classifyGesture } from '@/utils/gestureClassifier';

interface UseGestureDetectionProps {
  onGestureDetected?: (result: GestureResult) => void;
}

export function useGestureDetection({ onGestureDetected }: UseGestureDetectionProps = {}) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<GestureResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const lastResultRef = useRef<GestureResult | null>(null);

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

  const startDetection = useCallback(() => {
    if (!handsRef.current || !videoRef.current || !canvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    const onResults = (results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const gesture = classifyGesture(landmarks);
        
        const result: GestureResult = {
          gesture,
          confidence: 0.85,
          landmarks
        };

        if (gesture !== lastResultRef.current?.gesture) {
          setCurrentGesture(result);
          onGestureDetected?.(result);
          lastResultRef.current = result;
        }
      } else {
        setCurrentGesture(null);
        lastResultRef.current = null;
      }
    };

    handsRef.current?.onResults(onResults);

    const renderFrame = async () => {
      if (videoRef.current && handsRef.current) {
        await handsRef.current.send({ image: videoRef.current });
      }
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }, [onGestureDetected]);

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
    canvasRef,
    isCameraActive,
    isLoading,
    currentGesture,
    startCamera,
    stopCamera
  };
}
