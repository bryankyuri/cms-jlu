import { useState, useEffect } from "react";

/**
 * Custom hook for managing media previewer functionality
 */
export const useMediaPreviewer = () => {
  const [isPreviewerOpen, setIsPreviewerOpen] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewMediaList, setPreviewMediaList] = useState([]);

  // Handle media click to open previewer
  const handleMediaClick = (file, mediaFiles) => {
    const filteredFiles = mediaFiles.filter(
      (file) => file.is_image || file.mime_type.includes("video")
    );
    setPreviewMediaList(filteredFiles);

    const fileIndex = filteredFiles.findIndex((f) => f.id === file.id);
    if (fileIndex !== -1) {
      setCurrentPreviewIndex(fileIndex);
      setIsPreviewerOpen(true);
    }
  };

  // Navigate to previous media
  const handlePreviousMedia = () => {
    if (currentPreviewIndex > 0) {
      setCurrentPreviewIndex(currentPreviewIndex - 1);
    } else {
      setCurrentPreviewIndex(previewMediaList.length - 1);
    }
  };

  // Navigate to next media
  const handleNextMedia = () => {
    if (currentPreviewIndex < previewMediaList.length - 1) {
      setCurrentPreviewIndex(currentPreviewIndex + 1);
    } else {
      setCurrentPreviewIndex(0);
    }
  };

  // Close previewer
  const closePreviewer = () => {
    setIsPreviewerOpen(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPreviewerOpen) {
        if (e.key === "ArrowLeft") {
          handlePreviousMedia();
        } else if (e.key === "ArrowRight") {
          handleNextMedia();
        } else if (e.key === "Escape") {
          setIsPreviewerOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewerOpen, previewMediaList.length, currentPreviewIndex]);

  return {
    // State
    isPreviewerOpen,
    currentPreviewIndex,
    previewMediaList,
    
    // Setters
    setIsPreviewerOpen,
    
    // Actions
    handleMediaClick,
    handlePreviousMedia,
    handleNextMedia,
    closePreviewer,
  };
};