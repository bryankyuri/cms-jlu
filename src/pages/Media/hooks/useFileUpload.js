import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { mediaAPI } from "../../../api";
import { optimizeImage, getCompressionStats } from "../../../utils/imageOptimizer";
import { generateVideoThumbnail } from "../../../utils/videoThumbnailGenerator";

/**
 * Custom hook for managing file upload functionality
 */
export const useFileUpload = (onUploadSuccess) => {
  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [optimizationLevel, setOptimizationLevel] = useState('high');

  // Handle file selection for upload preview
  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    const newFilePreviews = [];

    for (const file of fileArray) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        toast.error(
          `${file.name} is not supported. Only images and videos are allowed.`
        );
        continue;
      }

      let previewUrl;
      let thumbnailUrl;
      let processedFile = file;
      let compressionStats = null;

      if (isImage) {
        try {
          // Optimize image before upload
          const optimizationResult = await optimizeImage(file, optimizationLevel);
          processedFile = optimizationResult.file;
          compressionStats = getCompressionStats(file, optimizationResult.file);
          
          previewUrl = URL.createObjectURL(processedFile);
          thumbnailUrl = previewUrl;
          
          // Show compression info
          const savingPercentage = ((file.size - processedFile.size) / file.size * 100).toFixed(1);
          if (savingPercentage > 5) { // Only show if meaningful compression
            toast.success(
              `${file.name} optimized: ${savingPercentage}% smaller (${(processedFile.size / 1024 / 1024).toFixed(1)}MB)`
            );
          }
        } catch (error) {
          console.error("Failed to optimize image:", error);
          previewUrl = URL.createObjectURL(file);
          thumbnailUrl = previewUrl;
        }
      } else if (isVideo) {
        try {
          const videoThumbnail = await generateVideoThumbnail(file);
          
          // Optimize the video thumbnail
          if (videoThumbnail instanceof File) {
            const optimizedThumbnail = await optimizeImage(videoThumbnail, optimizationLevel);
            thumbnailUrl = URL.createObjectURL(optimizedThumbnail.file);
          } else {
            thumbnailUrl = videoThumbnail;
          }
          
          previewUrl = thumbnailUrl;
        } catch (error) {
          console.error("Failed to generate video thumbnail:", error);
          previewUrl = null;
          thumbnailUrl = null;
        }
      }

      newFilePreviews.push({
        file: processedFile,
        originalFile: file,
        previewUrl,
        thumbnailUrl,
        type: isImage ? "image" : "video",
        name: processedFile.name || file.name,
        size: processedFile.size,
        originalSize: file.size,
        compressionStats,
        id: Date.now() + Math.random(), // Unique ID for each file
      });
    }

    setSelectedFilesForUpload((prev) => [...prev, ...newFilePreviews]);
  };

  // Remove file from upload selection
  const handleRemoveFileFromUpload = (fileId) => {
    setSelectedFilesForUpload(prev => {
      const updatedFiles = prev.filter(filePreview => filePreview.id !== fileId);
      // Clean up the object URL to prevent memory leaks
      const fileToRemove = prev.find(filePreview => filePreview.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return updatedFiles;
    });
  };

  // Handle single file upload
  const uploadSingleFile = async (file) => {
    try {
      setUploadProgress(0);
      const response = await mediaAPI.upload(file, {
        alt_text: file.name,
        description: `Uploaded ${new Date().toLocaleDateString()}`,
      });

      if (response.success) {
        toast.success(`${file.name} uploaded successfully!`);
        if (onUploadSuccess) onUploadSuccess();
        return true;
      } else {
        toast.error(`Failed to upload ${file.name}`);
        return false;
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload ${file.name}`);
      return false;
    }
  };

  // Handle batch upload of selected files
  const handleBatchUpload = async () => {
    if (selectedFilesForUpload.length === 0) {
      toast.error("No files selected for upload");
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const filePreview of selectedFilesForUpload) {
      const success = await uploadSingleFile(filePreview.file);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    // Clean up object URLs
    selectedFilesForUpload.forEach(filePreview => {
      URL.revokeObjectURL(filePreview.previewUrl);
    });

    setSelectedFilesForUpload([]);
    setIsUploading(false);
    setUploadProgress(0);

    // Show results
    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully!`);
    }
    if (failCount > 0) {
      toast.error(`Failed to upload ${failCount} file${failCount > 1 ? 's' : ''}`);
    }

    return { successCount, failCount };
  };

  // Handle direct file upload (for drag & drop)
  const handleDirectFileUpload = async (files) => {
    const fileArray = Array.from(files);

    // Filter to only allow images and videos
    const allowedFiles = fileArray.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        toast.error(
          `${file.name} is not supported. Only images and videos are allowed.`
        );
        return false;
      }
      return true;
    });

    if (allowedFiles.length === 0) {
      toast.error(
        "No valid files to upload. Only images and videos are supported."
      );
      return;
    }

    for (const file of allowedFiles) {
      let processedFile = file;

      // Optimize images before upload
      if (file.type.startsWith("image/")) {
        try {
          const optimizationResult = await optimizeImage(file, optimizationLevel);
          processedFile = optimizationResult.file;
          
          // Show compression info
          const savingPercentage = ((file.size - processedFile.size) / file.size * 100).toFixed(1);
          if (savingPercentage > 5) { // Only show if meaningful compression
            toast.success(
              `${file.name} optimized: ${savingPercentage}% smaller`
            );
          }
        } catch (error) {
          console.error("Failed to optimize image:", error);
          // Continue with original file if optimization fails
        }
      }

      await uploadSingleFile(processedFile);
    }
    setUploadProgress(0);
  };

  // Cleanup file preview URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up any remaining object URLs to prevent memory leaks
      selectedFilesForUpload.forEach(filePreview => {
        URL.revokeObjectURL(filePreview.previewUrl);
      });
    };
  }, [selectedFilesForUpload]);

  return {
    // State
    selectedFilesForUpload,
    isUploading,
    uploadProgress,
    optimizationLevel,
    
    // Setters
    setSelectedFilesForUpload,
    setOptimizationLevel,
    
    // Actions
    handleFileSelect,
    handleRemoveFileFromUpload,
    handleBatchUpload,
    handleDirectFileUpload,
    uploadSingleFile,
  };
};