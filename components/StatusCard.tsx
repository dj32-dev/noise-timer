import React from 'react';

interface StatusCardProps {
  status: string;
  countdown: number | null;
  error: string | null;
}

export const StatusCard: React.FC<StatusCardProps> = ({ status, countdown, error }) => {
  return (
    <div className="w-full h-28 bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-inner">
      {error ? (
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      ) : (
        <>
          <p className="text-xl font-medium text-gray-700">{status}</p>
          {countdown !== null && (
            <p className="text-5xl font-bold text-amber-500 mt-1 animate-pulse">
              {countdown.toFixed(1)}
            </p>
          )}
        </>
      )}
    </div>
  );
};