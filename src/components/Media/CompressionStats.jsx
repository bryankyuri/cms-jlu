import React from 'react';

const CompressionStats = ({ stats, className = "" }) => {
  if (!stats || stats.compressionRatio < 0.05) {
    return null; // Don't show if compression is minimal
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const compressionPercentage = (stats.compressionRatio * 100).toFixed(1);

  return (
    <div className={`flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md ${className}`}>
      <span>
        Optimized: {compressionPercentage}% smaller
      </span>
      <span className="text-gray-500">
        ({formatFileSize(stats.originalSize)} → {formatFileSize(stats.compressedSize)})
      </span>
    </div>
  );
};

export default CompressionStats;