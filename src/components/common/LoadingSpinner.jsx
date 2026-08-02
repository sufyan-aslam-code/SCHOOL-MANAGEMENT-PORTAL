import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'medium', label = 'Loading...' }) => {
  const sizeMap = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={`${sizeMap[size] || sizeMap.medium} animate-spin text-teal-700`} />
      {label && <p className="text-xs sm:text-sm font-medium text-slate-500 animate-pulse">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;