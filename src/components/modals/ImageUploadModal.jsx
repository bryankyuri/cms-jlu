import React, { useState, useRef } from "react";
import { FiX, FiUpload, FiImage, FiTrash2 } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { toast } from "react-toastify";
import { mediaAPI } from "../../api";
import { optimizeImage, getCompressionStats } from "../../utils/imageOptimizer";
import CompressionStats from "../Media/CompressionStats";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ImageUploadModal = ({
  isOpen,
  onClose,
  onUploadSuccess,
  title = "Upload Images"
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [optimizationLevel, setOptimizationLevel] = useState('high');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle file selection from input or drag & drop
  const handleFileSelection = async (files) => {
    const fileArray = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    
    const newFiles = [];
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      let processedFile = file;
      let compressionStats = null;
      
      try {
        // Optimize image before adding to selection
        const optimizationResult = await optimizeImage(file, { preset: optimizationLevel });
        processedFile = optimizationResult.file;
        compressionStats = getCompressionStats(file, optimizationResult.file);
        
        // Show compression info
        // const savingPercentage = ((file.size - processedFile.size) / file.size * 100).toFixed(1);
        // if (savingPercentage > 5) {
        //   toast.success(
        //     `${file.name} optimized: ${savingPercentage}% smaller (${(processedFile.size / 1024 / 1024).toFixed(1)}MB)`
        //   );
        // }
      } catch (error) {
        console.error("Failed to optimize image:", error);
        // Continue with original file if optimization fails
      }
      
      newFiles.push({
        id: Date.now() + i,
        file: processedFile,
        originalFile: file,
        name: processedFile.name || file.name,
        size: processedFile.size,
        originalSize: file.size,
        compressionStats,
        previewUrl: URL.createObjectURL(processedFile)
      });
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  // Handle file input change
  const handleInputChange = (e) => {
    handleFileSelection(e.target.files);
    e.target.value = ''; // Reset input
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelection(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Remove file from selection
  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Handle upload using new API
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const files = selectedFiles.map(f => f.file);
      const results = await mediaAPI.uploadImages(files, {
        description: `Uploaded ${new Date().toLocaleDateString()}`
      });
      
      // Check results
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;
      
      if (successCount > 0 && onUploadSuccess) {
        onUploadSuccess();
      }
      
      // Show toast notifications
      if (errorCount === 0) {
        toast.success(`Successfully uploaded ${successCount} image${successCount !== 1 ? 's' : ''}!`);
      } else if (successCount > 0) {
        toast.warning(`Uploaded ${successCount} images successfully, ${errorCount} failed`);
      } else {
        toast.error(`Failed to upload all ${errorCount} images`);
      }
      
      // Clean up and close
      selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
      setSelectedFiles([]);
      onClose();
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Close modal and cleanup
  const handleClose = () => {
    selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setSelectedFiles([]);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
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
        <div className="p-6 flex-1 overflow-y-auto">
          {selectedFiles.length === 0 ? (
            // Upload area
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <FiImage className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Drop images here or click to browse
              </h3>
              <p className="text-gray-500 mb-4">
                Support for JPG, PNG, GIF, WebP, SVG files
              </p>
              <button
                type="button"
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                <FiUpload className="inline mr-2" size={16} />
                Choose Images
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          ) : (
            // File preview area
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Selected Images ({selectedFiles.length})
                </h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-black hover:text-gray-700 text-sm flex items-center gap-2"
                  disabled={isUploading}
                >
                  <FiUpload size={16} />
                  Add More Images
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>

              {/* Image previews with Swiper */}
              <div className="relative">
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={16}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 }
                  }}
                  className="image-upload-swiper"
                >
                  {selectedFiles.map((fileData) => (
                    <SwiperSlide key={fileData.id}>
                      <div className="relative group bg-gray-50 rounded-lg overflow-hidden">
                        <img
                          src={fileData.previewUrl}
                          alt={fileData.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => removeFile(fileData.id)}
                            disabled={isUploading}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {fileData.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(fileData.size)}
                          </p>
                          {/* {fileData.originalSize && fileData.size !== fileData.originalSize && (
                            <p className="text-green-600 text-xs">
                              -{((fileData.originalSize - fileData.size) / fileData.originalSize * 100).toFixed(0)}%
                            </p>
                          )}
                          {fileData.compressionStats && (
                            <CompressionStats stats={fileData.compressionStats} className="mt-1" />
                          )} */}
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} selected
            </p>
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
                disabled={isUploading || selectedFiles.length === 0}
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
                    Upload Images
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

export default ImageUploadModal;