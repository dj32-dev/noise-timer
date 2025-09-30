import React from 'react';

interface NoiseVisualizerProps {
  volume: number;
  isLoud: boolean;
}

export const NoiseVisualizer: React.FC<NoiseVisualizerProps> = ({ volume, isLoud }) => {
  // Adjusted size for better mobile fit and to prevent overflow
  const size = 60 + volume * 150;
  
  const loudColor = '#f59e0b'; // amber-500
  const listeningColor = 'rgba(59, 130, 246, 0.5)'; // blue-500 with opacity
  const loudShadowColor = 'rgba(245, 158, 11, 0.7)';
  
  return (
    <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
      <div
        className="rounded-full transition-all duration-100 ease-linear"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: isLoud ? loudColor : `rgba(59, 130, 246, ${0.2 + volume * 1.5})`, 
          boxShadow: `0 0 ${volume * 50}px ${isLoud ? loudShadowColor : listeningColor}`
        }}
      />
    </div>
  );
};