import React from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { mediaAPI } from "../../../api";

const MediaPreviewer = ({ 
  isPreviewerOpen, 
  setIsPreviewerOpen, 
  previewMediaList, 
  currentPreviewIndex, 
  handlePreviousMedia, 
  handleNextMedia 
}) => {
  if (!isPreviewerOpen || previewMediaList.length === 0) return null;

  const currentFile = previewMediaList[currentPreviewIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={() => setIsPreviewerOpen(false)}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
      >
        <FiX size={24} />
      </button>

      {/* Navigation buttons */}
      {previewMediaList.length > 1 && (
        <>
          <button
            onClick={handlePreviousMedia}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-50 bg-black bg-opacity-50 rounded-full p-2"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={handleNextMedia}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-50 bg-black bg-opacity-50 rounded-full p-2"
          >
            <FiChevronRight size={24} />
          </button>
        </>
      )}

      {/* Media content */}
      <div className="max-w-full max-h-full flex items-center justify-center p-8">
        {currentFile.is_image ? (
          <img
            src={mediaAPI.getDirectUrl(currentFile.path)}
            alt={currentFile.alt_text || currentFile.original_name}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              console.error(
                "Failed to load image:",
                currentFile.original_name
              );
              e.target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDE0IDI1LjMxMzcgMTQgMjJDMTQgMTguNjg2MyAxNi42ODYzIDE2IDIwIDE2QzIzLjMxMzcgMTYgMjYgMTguNjg2MyAyNiAyMkMyNiAyNS4zMTM3IDIzLjMxMzcgMjggMjAgMjhaIiBmaWxsPSIjOUI5QjlCIi8+Cjwvc3ZnPgo=";
            }}
          />
        ) : currentFile.mime_type.includes("video") ? (
          <video
            src={mediaAPI.getDirectUrl(currentFile.path)}
            controls
            className="max-w-full max-h-full"
            onError={(e) => {
              console.error(
                "Failed to load video:",
                currentFile.original_name
              );
              // Replace with a fallback message
              const errorDiv = document.createElement("div");
              errorDiv.className =
                "flex flex-col items-center justify-center text-white text-center p-8";
              errorDiv.innerHTML = `
                <div class="text-4xl mb-4">🎥</div>
                <div class="text-lg font-medium mb-2">Unable to play video</div>
                <div class="text-sm text-gray-300">CORS or network error prevented video loading</div>
                <div class="text-sm text-gray-300 mt-2">${currentFile.original_name}</div>
              `;
              e.target.parentNode.replaceChild(errorDiv, e.target);
            }}
          />
        ) : null}
      </div>

      {/* Media info */}
      <div className="absolute top-0 left-0 right-0 text-white text-center">
        <div className="bg-black bg-opacity-50 rounded p-4">
          <div className="font-medium">{currentFile.original_name}</div>
        </div>
      </div>
    </div>
  );
};

export default MediaPreviewer;