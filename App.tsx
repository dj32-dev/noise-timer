import React, { useState, useCallback } from 'react';
import { ControlButton } from './components/ControlButton';
import { NoiseVisualizer } from './components/NoiseVisualizer';
import { StatusCard } from './components/StatusCard';
import { useNoiseDetector } from './hooks/useNoiseDetector';

const App: React.FC = () => {
  const [peepDelay, setPeepDelay] = useState(11.0);
  const [isAlerting, setIsAlerting] = useState(false);
  const NOISE_THRESHOLD = 0.2; // Sensitivity: 0 (most sensitive) to 1 (least sensitive)

  const playPeep = useCallback(() => {
    setIsAlerting(true);
    setTimeout(() => setIsAlerting(false), 500); // Flash for 500ms

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 0.01);

    oscillator.frequency.setValueAtTime(1500, audioCtx.currentTime);
    oscillator.type = 'square';
    oscillator.start(audioCtx.currentTime);
    
    oscillator.stop(audioCtx.currentTime + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);

    setTimeout(() => {
        audioCtx.close();
    }, 600);
  }, []);

  const {
    status,
    countdown,
    volume,
    isMonitoring,
    error,
    toggleMonitoring,
  } = useNoiseDetector({
    threshold: NOISE_THRESHOLD,
    delaySeconds: peepDelay,
    onPeep: playPeep,
  });

  const handleDelayChange = (newDelay: number) => {
    let finalValue = newDelay;
    if (isNaN(finalValue) || finalValue < 0.1) {
      finalValue = 0.1;
    }
    const roundedValue = Math.round(finalValue * 10) / 10;
    setPeepDelay(roundedValue);
  };

  return (
    <main className="bg-white text-gray-800 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      {isAlerting && (
        <div className="fixed inset-0 bg-red-600 z-50 animate-pulse" aria-hidden="true"></div>
      )}
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center space-y-6">
        <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-black uppercase tracking-wider">Loud Noise Detector</h1>
            <p className="text-xs text-gray-500 mt-1 tracking-wider">by Daniel Jahn</p>
            <p className="text-gray-500 mt-2">Monitors for loud sounds and alerts you after {peepDelay.toFixed(1)} seconds.</p>
        </div>
        
        <NoiseVisualizer volume={volume} isLoud={status === 'Loud noise detected!'} />

        <StatusCard status={status} countdown={countdown} error={error}/>
        
        <div className="w-full flex flex-col items-center space-y-3">
            <label htmlFor="delay-input" className="text-gray-600 text-sm uppercase tracking-wider font-semibold">
                Alert Delay (Seconds)
            </label>
            <div className="flex items-center justify-center space-x-3">
                <button
                    type="button"
                    onClick={() => handleDelayChange(peepDelay - 0.1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Decrease delay by 0.1 seconds"
                >
                    -
                </button>
                <input
                    id="delay-input"
                    type="number"
                    value={isNaN(peepDelay) ? '' : peepDelay}
                    onChange={(e) => {
                        setPeepDelay(parseFloat(e.target.value));
                    }}
                    onBlur={() => handleDelayChange(peepDelay)}
                    min="0.1"
                    step="0.1"
                    className="bg-gray-100 text-gray-800 text-center font-bold text-xl rounded-lg w-32 h-12 p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label="Alert delay in seconds"
                />
                <button
                    type="button"
                    onClick={() => handleDelayChange(peepDelay + 0.1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Increase delay by 0.1 seconds"
                >
                    +
                </button>
            </div>
        </div>

        <ControlButton isMonitoring={isMonitoring} onClick={toggleMonitoring} />
        
        <footer className="text-center text-gray-400 text-sm absolute bottom-4">
            <p>Allow microphone access to begin monitoring.</p>
        </footer>
      </div>
    </main>
  );
};

export default App;