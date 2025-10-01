import React from 'react';

interface ControlButtonProps {
  isMonitoring: boolean;
  onClick: () => void;
}

export const ControlButton: React.FC<ControlButtonProps> = ({ isMonitoring, onClick }) => {
  // Define classes for the "Stop Monitoring" (active) state, using red
  const stopClasses = 'bg-red-500 hover:bg-red-600 focus:ring-red-400';
  
  // Define classes for the "Start Monitoring" (inactive) state, using green
  const startClasses = 'bg-green-500 hover:bg-green-600 focus:ring-green-400';

  return (
    <button
      onClick={onClick}
      aria-pressed={isMonitoring}
      className={`w-48 h-16 text-white font-bold py-2 px-4 rounded-full shadow-lg transform transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white ${
        isMonitoring ? stopClasses : startClasses
      }`}
    >
      {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
    </button>
  );
};