import React, { useState, useCallback } from 'react';
import { ControlButton } from './components/ControlButton';
import { NoiseVisualizer } from './components/NoiseVisualizer';
import { StatusCard } from './components/StatusCard';
import { useNoiseDetector } from './hooks/useNoiseDetector';

const App: React.FC = () => {
  const [peepDelay, setPeepDelay] = useState(11.0);
  const [noiseThreshold, setNoiseThreshold] = useState(0.2);
  const [isAlerting, setIsAlerting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const playPeep = useCallback(() => {
    setIsAlerting(true);
    setTimeout(() => setIsAlerting(false), 1000); // Pulse border for 1s

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
    threshold: noiseThreshold,
    delaySeconds: peepDelay,
    onPeep: playPeep,
  });

  const handleToggleMonitoring = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    toggleMonitoring();
  };

  const handleDelayChange = (newDelay: number) => {
    let finalValue = newDelay;
    if (isNaN(finalValue) || finalValue < 0.1) {
      finalValue = 0.1;
    }
    const roundedValue = Math.round(finalValue * 10) / 10;
    setPeepDelay(roundedValue);
  };

  const handleThresholdChange = (newThreshold: number) => {
    let finalValue = newThreshold;
    if (isNaN(finalValue)) {
      finalValue = 0.2;
    } else if (finalValue < 0) {
      finalValue = 0;
    } else if (finalValue > 1) {
      finalValue = 1;
    }
    const roundedValue = Math.round(finalValue * 100) / 100;
    setNoiseThreshold(roundedValue);
  };

  return (
    <main className="bg-gray-50 text-black h-screen overflow-hidden flex flex-col items-center justify-center p-4 font-sans">
      <div className={`w-full max-w-md mx-auto flex flex-col items-center space-y-6 bg-white border rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-300 ${isAlerting ? 'border-red-500 shadow-red-500/50 animate-pulse' : 'border-gray-200'}`}>
        <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-black uppercase tracking-wider">Loud Noise Detector</h1>
            <p className="text-xs text-gray-400 mt-1 tracking-wider">by Daniel Jahn</p>
            <p className="text-gray-600 mt-2">Monitors for loud sounds and alerts you after {peepDelay.toFixed(1)} seconds.</p>
            {!hasInteracted && <p className="text-gray-500 text-sm mt-2">Allow microphone access to begin monitoring.</p>}
        </div>
        
        <NoiseVisualizer volume={volume} isLoud={status === 'Loud noise detected!'} isMonitoring={isMonitoring} />

        <StatusCard status={status} countdown={countdown} error={error}/>
        
        <div className="w-full flex flex-col items-center space-y-3">
            <label htmlFor="delay-input" className="text-gray-600 text-sm uppercase tracking-wider font-semibold">
                Alert Delay (Seconds)
            </label>
            <div className="flex items-center justify-center space-x-3">
                <button
                    type="button"
                    onClick={() => handleDelayChange(peepDelay - 0.1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="bg-white text-black text-center font-bold text-xl rounded-lg w-32 h-12 p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label="Alert delay in seconds"
                />
                <button
                    type="button"
                    onClick={() => handleDelayChange(peepDelay + 0.1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Increase delay by 0.1 seconds"
                >
                    +
                </button>
            </div>
        </div>

        <div className="w-full flex flex-col items-center">
            <label htmlFor="threshold-input" className="text-gray-600 text-sm uppercase tracking-wider font-semibold mb-3">
                Noise Sensitivity
            </label>
            <div className="flex items-center justify-center space-x-3">
                <button
                    type="button"
                    onClick={() => handleThresholdChange(noiseThreshold - 0.05)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Increase sensitivity (decrease threshold)"
                >
                    -
                </button>
                <input
                    id="threshold-input"
                    type="number"
                    value={isNaN(noiseThreshold) ? '' : noiseThreshold}
                    onChange={(e) => setNoiseThreshold(parseFloat(e.target.value))}
                    onBlur={() => handleThresholdChange(noiseThreshold)}
                    min="0"
                    max="1"
                    step="0.05"
                    className="bg-white text-black text-center font-bold text-xl rounded-lg w-32 h-12 p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label="Noise sensitivity threshold"
                />
                <button
                    type="button"
                    onClick={() => handleThresholdChange(noiseThreshold + 0.05)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Decrease sensitivity (increase threshold)"
                >
                    +
                </button>
            </div>
            <div className="flex justify-between w-full max-w-[248px] text-xs text-gray-500 px-1 mt-1.5">
                <span>More Sensitive</span>
                <span>Less Sensitive</span>
            </div>
        </div>

        <ControlButton isMonitoring={isMonitoring} onClick={handleToggleMonitoring} />
      </div>
      
      {/* Accessibility: Announce status changes to screen readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {error ? error : (countdown !== null ? `${status} ${countdown.toFixed(1)}` : status)}
      </div>
    </main>
  );
};

export default App;