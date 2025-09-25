import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="w-full px-4 py-8 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Loading video banners...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;