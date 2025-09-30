import React from 'react';

interface ControlButtonProps {
  isMonitoring: boolean;
  onClick: () => void;
}

export const ControlButton: React.FC<ControlButtonProps> = ({ isMonitoring, onClick }) => {
  const buttonClass = isMonitoring
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-green-600 hover:bg-green-700';

  return (
    <button
      onClick={onClick}
      className={`w-48 h-16 text-white font-bold py-2 px-4 rounded-full shadow-lg transform transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-75 ${
        isMonitoring ? 'focus:ring-red-400' : 'focus:ring-green-400'
      } ${buttonClass}`}
    >
      {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
    </button>
  );
};