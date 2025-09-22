import React from 'react';
import { FiSettings } from 'react-icons/fi';

const OptimizationSettings = ({ 
  optimizationLevel, 
  onOptimizationLevelChange,
  className = "" 
}) => {
  const presets = [
    { 
      value: 'thumbnail', 
      label: 'Thumbnail', 
      description: 'Max 400x300, ~80% quality - smallest size',
      icon: '🖼️'
    },
    { 
      value: 'low', 
      label: 'Low Quality', 
      description: 'Max 1280x720, ~75% quality - fast uploads',
      icon: '⚡'
    },
    { 
      value: 'medium', 
      label: 'Medium Quality', 
      description: 'Max 1920x1080, ~85% quality - balanced',
      icon: '⚖️'
    },
    { 
      value: 'high', 
      label: 'High Quality', 
      description: 'Max 2560x1440, ~92% quality - best for display',
      icon: '⭐'
    }
  ];

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <FiSettings className="w-4 h-4 text-gray-600" />
        <h3 className="font-medium text-gray-900">Image Optimization</h3>
      </div>
      
      <div className="space-y-2">
        {presets.map((preset) => (
          <label
            key={preset.value}
            className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
              optimizationLevel === preset.value
                ? 'bg-blue-50 border-2 border-blue-200'
                : 'bg-white border-2 border-transparent hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="optimizationLevel"
              value={preset.value}
              checked={optimizationLevel === preset.value}
              onChange={(e) => onOptimizationLevelChange(e.target.value)}
              className="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{preset.icon}</span>
                <span className="font-medium text-sm text-gray-900">
                  {preset.label}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {preset.description}
              </p>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
        💡 Images are automatically optimized before upload to reduce file size and improve performance.
      </div>
    </div>
  );
};

export default OptimizationSettings;