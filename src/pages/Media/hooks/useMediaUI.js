import { useState } from "react";

/**
 * Custom hook for managing UI state and view preferences
 */
export const useMediaUI = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Handle tab change and update media type filter
  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
    
    // Map tab index to media type filter
    const filterMap = {
      0: "all",     // All tab
      1: "image",   // Images tab
      2: "video"    // Videos tab
    };
    
    return filterMap[tabIndex] || "all";
  };

  // Toggle view mode between grid and list
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // Handle file selection (for future multi-select functionality)
  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const clearSelection = () => {
    setSelectedFiles([]);
  };

  const selectAll = (fileIds) => {
    setSelectedFiles(fileIds);
  };

  // Utility functions
  const getFileIcon = (mimeType) => {
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("video")) return "🎥";
    if (mimeType.includes("audio")) return "🎵";
    if (mimeType.includes("pdf")) return "📄";
    return "📁";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return {
    // State
    activeTab,
    viewMode,
    selectedFiles,
    
    // Setters
    setActiveTab,
    setViewMode,
    
    // Actions
    handleTabChange,
    toggleViewMode,
    toggleFileSelection,
    clearSelection,
    selectAll,
    
    // Utilities
    getFileIcon,
    formatFileSize,
    handleDragOver,
    handleDrop,
  };
};