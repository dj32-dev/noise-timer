import { useState, useRef, useCallback, useEffect } from 'react';

interface UseNoiseDetectorProps {
  threshold: number;
  delaySeconds: number;
  onPeep: () => void;
}

export const useNoiseDetector = ({ threshold, delaySeconds, onPeep }: UseNoiseDetectorProps) => {
  const [volume, setVolume] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const hasAlertedRef = useRef<boolean>(false);

  const stopMonitoring = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }

    audioContextRef.current = null;
    streamRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    animationFrameIdRef.current = null;
    intervalRef.current = null;
    hasAlertedRef.current = false;

    setIsMonitoring(false);
    setVolume(0);
    setStatus('Idle');
    setElapsedTime(null);
  }, []);

  const startMonitoring = useCallback(async () => {
    setError(null);
    if (isMonitoring) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      const source = context.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const loop = () => {
        if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            dataArray.forEach(value => sum += value * value);
            const rms = Math.sqrt(sum / dataArray.length);
            const normalizedVolume = Math.min(rms / 128, 1); // Normalize to 0-1 range
            setVolume(normalizedVolume);
        }
        animationFrameIdRef.current = requestAnimationFrame(loop);
      };
      
      loop();
      setIsMonitoring(true);
      setStatus('Listening...');
      setElapsedTime(0);
      hasAlertedRef.current = false;

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
      stopMonitoring();
    }
  }, [isMonitoring, stopMonitoring]);

  const toggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  }, [isMonitoring, startMonitoring, stopMonitoring]);

  useEffect(() => {
    if (!isMonitoring) return;

    if (volume > threshold) {
      setStatus('Loud noise detected!');
      
      if (!intervalRef.current) {
        intervalRef.current = window.setInterval(() => {
          setElapsedTime(prev => (prev === null ? 0 : prev) + 0.1);
        }, 100);
      }
    } else {
      setStatus('Listening...');
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [volume, threshold, isMonitoring]);

  // Trigger alert when threshold is crossed
  useEffect(() => {
    if (elapsedTime !== null && elapsedTime >= delaySeconds && !hasAlertedRef.current) {
        onPeep();
        hasAlertedRef.current = true;
    }
  }, [elapsedTime, delaySeconds, onPeep]);

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, elapsedTime, volume, isMonitoring, error, toggleMonitoring };
};