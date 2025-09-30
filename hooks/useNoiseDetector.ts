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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  // Fix: Replace `NodeJS.Timeout` with `number` for browser compatibility, as `setTimeout` and `setInterval` in the browser return a numeric ID.
  const timerRefs = useRef<{ peepTimeout: number | null; countdownInterval: number | null }>({
    peepTimeout: null,
    countdownInterval: null,
  });

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
    
    if (timerRefs.current.peepTimeout) clearTimeout(timerRefs.current.peepTimeout);
    if (timerRefs.current.countdownInterval) clearInterval(timerRefs.current.countdownInterval);

    audioContextRef.current = null;
    streamRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    animationFrameIdRef.current = null;
    timerRefs.current = { peepTimeout: null, countdownInterval: null };

    setIsMonitoring(false);
    setVolume(0);
    setStatus('Idle');
    setCountdown(null);
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

    // Condition to START or RESUME the timer:
    // Loud noise is detected, and no timers are currently running.
    if (volume > threshold && timerRefs.current.peepTimeout === null) {
      // If countdown is null, it's a fresh start. Otherwise, it's a resume.
      const startTime = countdown === null ? delaySeconds : countdown;
      setCountdown(startTime);
      setStatus('Loud noise detected!');

      // Set the visual countdown interval
      timerRefs.current.countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 0.1) {
            if (timerRefs.current.countdownInterval) clearInterval(timerRefs.current.countdownInterval);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);

      // Set the final timeout for the peep sound
      timerRefs.current.peepTimeout = setTimeout(() => {
        onPeep();
        // Reset state after the peep has played
        setStatus('Listening...');
        setCountdown(null);
        if (timerRefs.current.countdownInterval) clearInterval(timerRefs.current.countdownInterval);
        timerRefs.current = { peepTimeout: null, countdownInterval: null };
      }, startTime * 1000);
    }
    // Condition to PAUSE the timer:
    // Noise has subsided, and timers were running.
    else if (volume <= threshold && timerRefs.current.peepTimeout !== null) {
      // Clear the timers to pause them. The current countdown value is preserved in state.
      if (timerRefs.current.peepTimeout) clearTimeout(timerRefs.current.peepTimeout);
      if (timerRefs.current.countdownInterval) clearInterval(timerRefs.current.countdownInterval);
      
      timerRefs.current = { peepTimeout: null, countdownInterval: null };
      setStatus('Listening...'); // Indicates it's quiet now, waiting for noise to resume.
    }
  }, [volume, isMonitoring, threshold, delaySeconds, onPeep, countdown]);


  useEffect(() => {
    return () => {
      stopMonitoring();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, countdown, volume, isMonitoring, error, toggleMonitoring };
};
