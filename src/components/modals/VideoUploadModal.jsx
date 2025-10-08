import React, { useState, useRef } from "react";
import { FiX, FiUpload, FiVideo, FiImage, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { mediaAPI } from "../../api";
import { generateVideoThumbnail } from "../../utils/videoThumbnailGenerator";
import { optimizeImage, getCompressionStats } from "../../utils/imageOptimizer";
import CompressionStats from "../Media/CompressionStats";

const VideoUploadModal = ({
  isOpen,
  onClose,
  onUploadSuccess,
  title = "Upload Video"
}) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [autoThumbnail, setAutoThumbnail] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const videoInputRef = useRef(null);
  const posterInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle video file selection
  const handleVideoSelection = async (files) => {
    const videoFile = Array.from(files).find(file => 
      file.type.startsWith('video/')
    );
    
    if (videoFile) {
      setSelectedVideo({
        file: videoFile,
        name: videoFile.name,
        size: videoFile.size,
        previewUrl: URL.createObjectURL(videoFile)
      });

      // Generate auto thumbnail
      setIsGeneratingThumbnail(true);
      try {
        const thumbnailBlob = await generateVideoThumbnail(videoFile);
        
        // Convert blob to File object with proper name
        const thumbnailFileName = `${videoFile.name.split('.')[0]}_thumbnail.jpg`;
        const thumbnailFile = new File([thumbnailBlob], thumbnailFileName, { 
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        // Optimize the auto-generated thumbnail
        let optimizedThumbnail = thumbnailFile;
        let compressionStats = null;
        
        try {
          const optimizationResult = await optimizeImage(thumbnailFile, { preset: 'medium' });
          optimizedThumbnail = optimizationResult.file;
          compressionStats = getCompressionStats(thumbnailFile, optimizationResult.file);
        } catch (error) {
          console.error("Failed to optimize auto thumbnail:", error);
        }
        
        setAutoThumbnail({
          file: optimizedThumbnail,
          originalFile: thumbnailFile,
          name: optimizedThumbnail.name || thumbnailFileName,
          size: optimizedThumbnail.size,
          originalSize: thumbnailFile.size,
          compressionStats,
          previewUrl: URL.createObjectURL(optimizedThumbnail)
        });
      } catch (error) {
        console.warn('Failed to generate auto thumbnail:', error);
      } finally {
        setIsGeneratingThumbnail(false);
      }
    }
  };

  // Handle poster image selection
  const handlePosterSelection = async (files) => {
    const imageFile = Array.from(files).find(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFile) {
      // Clean up previous poster
      if (posterFile) {
        URL.revokeObjectURL(posterFile.previewUrl);
      }
      
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
      
      setPosterFile({
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

  // Handle video input change
  const handleVideoInputChange = (e) => {
    handleVideoSelection(e.target.files);
    e.target.value = ''; // Reset input
  };

  // Handle poster input change
  const handlePosterInputChange = (e) => {
    handlePosterSelection(e.target.files);
    e.target.value = ''; // Reset input
  };

  // Remove video
  const removeVideo = () => {
    if (selectedVideo) {
      URL.revokeObjectURL(selectedVideo.previewUrl);
      setSelectedVideo(null);
    }
    if (autoThumbnail) {
      URL.revokeObjectURL(autoThumbnail.previewUrl);
      setAutoThumbnail(null);
    }
  };

  // Remove poster
  const removePoster = () => {
    if (posterFile) {
      URL.revokeObjectURL(posterFile.previewUrl);
      setPosterFile(null);
    }
  };

  // Handle upload using new API
  const handleUpload = async () => {
    if (!selectedVideo) return;
    
    setIsUploading(true);
    
    try {
      // Use custom poster if provided, otherwise use auto-generated thumbnail
      const posterToUse = posterFile || autoThumbnail;
      
      const result = await mediaAPI.uploadVideo(
        selectedVideo.file,
        posterToUse?.file,
        {
          description: `Video uploaded ${new Date().toLocaleDateString()}`
        }
      );
      
      if (result.success && onUploadSuccess) {
        toast.success('Video uploaded successfully!');
        onUploadSuccess();
      } else if (result.success) {
        toast.success('Video uploaded successfully!');
      } else {
        toast.error('Failed to upload video. Please try again.');
      }
      
      console.log('Video upload result:', result);
      
      // Clean up and close
      cleanup();
      onClose();
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup function
  const cleanup = () => {
    if (selectedVideo) {
      URL.revokeObjectURL(selectedVideo.previewUrl);
    }
    if (posterFile) {
      URL.revokeObjectURL(posterFile.previewUrl);
    }
    if (autoThumbnail) {
      URL.revokeObjectURL(autoThumbnail.previewUrl);
    }
    setSelectedVideo(null);
    setPosterFile(null);
    setAutoThumbnail(null);
  };

  // Close modal and cleanup
  const handleClose = () => {
    cleanup();
    onClose();
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleVideoSelection(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Video Upload Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Video File</h3>
            {!selectedVideo ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => videoInputRef.current?.click()}
              >
                <FiVideo className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Drop video here or click to browse
                </h3>
                <p className="text-gray-500 mb-4">
                  Support for MP4, WebM, AVI, MOV files (max 120MB)
                </p>
                <button
                  type="button"
                  className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  <FiUpload className="inline mr-2" size={16} />
                  Choose Video
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-800">{selectedVideo.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedVideo.size)}
                    </p>
                  </div>
                  <button
                    onClick={removeVideo}
                    disabled={isUploading}
                    className="text-red-500 hover:text-red-600 disabled:opacity-50"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
                <video
                  src={selectedVideo.previewUrl}
                  className="w-full h-48 rounded-lg object-cover bg-black"
                  controls
                />
              </div>
            )}
          </div>

          {/* Poster Upload Section */}
          {selectedVideo && (
            <div>
              <h3 className="text-lg font-medium mb-3">Poster Image (Optional)</h3>
              
              {/* Auto-generated thumbnail preview */}
              {isGeneratingThumbnail && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-blue-700">Generating auto thumbnail...</span>
                  </div>
                </div>
              )}

              {autoThumbnail && !posterFile && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <img
                      src={autoThumbnail.previewUrl}
                      alt="Auto thumbnail"
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-green-700 font-medium">Auto thumbnail generated</p>
                      <p className="text-green-600 text-sm mb-1">
                        This will be used as the poster if you don't upload a custom one.
                      </p>
                      {/* {autoThumbnail.originalSize && autoThumbnail.size !== autoThumbnail.originalSize && (
                        <p className="text-green-600 text-xs">
                          Optimized: -{((autoThumbnail.originalSize - autoThumbnail.size) / autoThumbnail.originalSize * 100).toFixed(0)}% smaller
                        </p>
                      )}
                      {autoThumbnail.compressionStats && (
                        <CompressionStats stats={autoThumbnail.compressionStats} className="mt-1" />
                      )} */}
                    </div>
                  </div>
                </div>
              )}

              {!posterFile ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => posterInputRef.current?.click()}
                >
                  <FiImage className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-gray-600 mb-2">Upload custom poster image</p>
                  <p className="text-sm text-gray-500">
                    JPG, PNG, WebP (max 5MB) - Optional
                  </p>
                  <input
                    ref={posterInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePosterInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-800">Custom Poster</p>
                      <p className="text-sm text-gray-500">
                        {posterFile.name} ({formatFileSize(posterFile.size)})
                      </p>
                      {/* {posterFile.originalSize && posterFile.size !== posterFile.originalSize && (
                        <p className="text-green-600 text-xs ml-2">
                          -{((posterFile.originalSize - posterFile.size) / posterFile.originalSize * 100).toFixed(0)}%
                        </p>
                      )}
                      {posterFile.compressionStats && (
                        <CompressionStats stats={posterFile.compressionStats} className="mt-1" />
                      )} */}
                    </div>
                    <button
                      onClick={removePoster}
                      disabled={isUploading}
                      className="text-red-500 hover:text-red-600 disabled:opacity-50"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                  <img
                    src={posterFile.previewUrl}
                    alt="Custom poster"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedVideo && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              <p>Video: {selectedVideo.name}</p>
              {posterFile ? (
                <p>Custom poster: {posterFile.name}</p>
              ) : autoThumbnail ? (
                <p>Using auto-generated thumbnail</p>
              ) : (
                <p>No poster image</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || !selectedVideo || isGeneratingThumbnail}
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {isUploading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload className="inline mr-2" size={16} />
                    Upload Video
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploadModal;