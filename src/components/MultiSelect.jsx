import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';

const MultiSelect = ({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Select options...",
  className = "",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOption = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeOption = (optionValue, e) => {
    e.stopPropagation();
    const newValue = value.filter(v => v !== optionValue);
    onChange(newValue);
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const getOptionLabel = (optionValue) => {
    const option = options.find(opt => opt.value === optionValue);
    return option ? option.label : optionValue;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`
          min-h-[42px] px-3 py-2 border border-gray-300 rounded-md cursor-pointer
          focus:outline-none focus:border-black transition-colors
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
          ${isOpen ? 'border-black' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 flex flex-wrap gap-1">
            {value.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              value.map((optionValue) => (
                <span
                  key={optionValue}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded"
                >
                  {getOptionLabel(optionValue)}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => removeOption(optionValue, e)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={12} />
                    </button>
                  )}
                </span>
              ))
            )}
          </div>
          <div className="flex items-center gap-1">
            {value.length > 0 && !disabled && (
              <button
                type="button"
                onClick={clearAll}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={16} />
              </button>
            )}
            <FiChevronDown 
              className={`text-gray-500 transform transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`} 
              size={16}
            />
          </div>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">No options available</div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                className={`
                  px-3 py-2 cursor-pointer text-sm transition-colors
                  ${value.includes(option.value) 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                onClick={() => toggleOption(option.value)}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {value.includes(option.value) && (
                    <span className="text-blue-600">✓</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;