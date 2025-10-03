import React, { useState, useRef } from "react";
import { FiX, FiUpload, FiImage } from "react-icons/fi";
import { toast } from "react-toastify";
import { mediaAPI } from "../../api";
import { optimizeImage, getCompressionStats } from "../../utils/imageOptimizer";
import CompressionStats from "../Media/CompressionStats";

const UpdatePosterModal = ({
  isOpen,
  onClose,
  videoFile,
  onUpdateSuccess,
  onRefetchMedia, // Add this prop for refetching media
  title = "Update Video Poster"
}) => {
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !videoFile) {
    return null;
  }

  // Handle poster file selection
  const handlePosterSelection = async (files) => {
    const imageFile = Array.from(files).find(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFile) {
      let processedFile = imageFile;
      let compressionStats = null;
      
      try {
        // Optimize poster image
        const optimizationResult = await optimizeImage(imageFile, { preset: 'medium' });
        processedFile = optimizationResult.file;
        compressionStats = getCompressionStats(imageFile, optimizationResult.file);
        
        // Show compression info
        // const savingPercentage = ((imageFile.size - processedFile.size) / imageFile.size * 100).toFixed(1);
        // if (savingPercentage > 5) {
        //   toast.success(
        //     `Poster optimized: ${savingPercentage}% smaller (${(processedFile.size / 1024 / 1024).toFixed(1)}MB)`
        //   );
        // }
      } catch (error) {
        console.error("Failed to optimize poster image:", error);
        // Continue with original file if optimization fails
      }
      
      setSelectedPoster({
        file: processedFile,
        originalFile: imageFile,
        name: processedFile.name || imageFile.name,
        size: processedFile.size,
        originalSize: imageFile.size,
        compressionStats,
        previewUrl: URL.createObjectURL(processedFile)
      });
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handlePosterSelection(e.target.files);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handlePosterSelection(e.dataTransfer.files);
    }
  };

  // Remove selected poster
  const removePoster = () => {
    if (selectedPoster) {
      URL.revokeObjectURL(selectedPoster.previewUrl);
      setSelectedPoster(null);
    }
  };

  // Handle poster update
  const handleUpdatePoster = async () => {
    if (!selectedPoster) {
      toast.error("Please select a poster image");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const result = await mediaAPI.updateVideoPoster(videoFile.id, selectedPoster.file);
      
      if (result.success) {
        toast.success("Video poster updated successfully!");
        onUpdateSuccess(result.data);
        
        // Refetch media data if callback is provided
        if (onRefetchMedia) {
          onRefetchMedia();
        }
        
        handleClose();
      } else {
        toast.error(result.message || "Failed to update poster");
      }
    } catch (error) {
      console.error("Poster update error:", error);
      toast.error("Failed to update poster. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (selectedPoster) {
      URL.revokeObjectURL(selectedPoster.previewUrl);
      setSelectedPoster(null);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Video Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Video:</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {videoFile.poster_url && (
                <img
                  src={videoFile.poster_url}
                  alt="Current poster"
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{videoFile.original_name}</p>
                <p className="text-xs text-gray-500">Current poster will be replaced</p>
              </div>
            </div>
          </div>

          {/* Poster Upload Area */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">New Poster Image:</h3>
            {!selectedPoster ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FiImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Upload new poster image
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Drag and drop an image here, or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supports: JPG, PNG, WebP (Max: 5MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected Poster Preview */}
                <div className="relative">
                  <img
                    src={selectedPoster.previewUrl}
                    alt="New poster preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={removePoster}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                  >
                    <FiX size={16} />
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{selectedPoster.name}</p>
                  <p className="text-xs text-gray-500">Ready to upload</p>
                  {/* {selectedPoster.originalSize && selectedPoster.size !== selectedPoster.originalSize && (
                    <p className="text-green-600 text-xs">
                      -{((selectedPoster.originalSize - selectedPoster.size) / selectedPoster.originalSize * 100).toFixed(0)}%
                    </p>
                  )}
                  {selectedPoster.compressionStats && (
                    <CompressionStats stats={selectedPoster.compressionStats} className="mt-2" />
                  )} */}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdatePoster}
            disabled={!selectedPoster || isUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              <>
                <FiUpload size={16} />
                Update Poster
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePosterModal;