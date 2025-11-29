import React from 'react';

interface StatusCardProps {
  status: string;
  timer: number | null;
  error: string | null;
}

export const StatusCard: React.FC<StatusCardProps> = ({ status, timer, error }) => {
  return (
    <div className="w-full h-28 bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-inner">
      {error ? (
        <p className="text-red-500 text-lg font-semibold">{error}</p>
      ) : (
        <>
          <p className="text-xl font-medium text-gray-800">{status}</p>
          {timer !== null && (
            <p className="text-5xl font-bold text-orange-500 mt-1 animate-pulse">
              {timer.toFixed(1)}s
            </p>
          )}
        </>
      )}
    </div>
  );
};