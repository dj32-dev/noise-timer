import React from 'react';

interface NoiseVisualizerProps {
  volume: number;
  isLoud: boolean;
  isMonitoring: boolean;
}

export const NoiseVisualizer: React.FC<NoiseVisualizerProps> = ({ volume, isLoud, isMonitoring }) => {
  const size = 60 + volume * 150;
  
  const idleColor = '#d1d5db'; // gray-300
  const idleShadowColor = 'rgba(156, 163, 175, 0.5)'; // gray-400 with opacity

  const listeningColor = `rgba(59, 130, 246, ${0.2 + volume * 1.5})`; // blue-500 with variable opacity
  const listeningShadowColor = 'rgba(59, 130, 246, 0.5)'; // blue-500 with opacity
  
  const loudColor = '#f97316'; // orange-500
  const loudShadowColor = 'rgba(251, 146, 60, 0.7)'; // orange-400 with opacity

  const getColorsAndAnimation = () => {
    if (!isMonitoring) {
        return {
            style: {
              backgroundColor: idleColor,
              boxShadow: `0 0 10px ${idleShadowColor}`
            },
            animationClass: 'animate-pulse' // Subtle pulse for idle state
        };
    }
    if (isLoud) {
        return {
            style: {
              backgroundColor: loudColor,
              boxShadow: `0 0 ${volume * 50}px ${loudShadowColor}`
            },
            animationClass: ''
        };
    }
    return {
        style: {
          backgroundColor: listeningColor,
          boxShadow: `0 0 ${volume * 50}px ${listeningShadowColor}`
        },
        animationClass: ''
    };
  };

  const { style, animationClass } = getColorsAndAnimation();

  return (
    <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
      <div
        className={`rounded-full transition-all duration-100 ease-linear ${animationClass}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          ...style
        }}
      />
    </div>
  );
};
