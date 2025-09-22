import { toast } from "react-toastify";
import { mediaAPI } from "../../../../api";

// Upload and media handling functions
export const useMediaHandlers = (
  setIsUploading,
  setUploadProgress,
  fetchAvailableImages,
  fetchAvailableVideos
) => {
  // Upload functions
  const handleImageUpload = async (files) => {
    const fileArray = Array.from(files);
    
    // Filter to only allow image files
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please select only image files');
      return;
    }
    
    setIsUploading(true);
    
    for (const file of imageFiles) {
      try {
        setUploadProgress(0);
        const response = await mediaAPI.upload(file, {
          alt_text: file.name,
          description: `Uploaded ${new Date().toLocaleDateString()}`
        });
        
        if (response.success) {
          toast.success(`${file.name} uploaded successfully!`);
          // Refresh the available images
          fetchAvailableImages();
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setIsUploading(false);
    setUploadProgress(0);
  };

  // Handle video upload for video project modal
  const handleVideoUpload = async (files) => {
    const fileArray = Array.from(files);
    
    // Filter to only allow video files
    const videoFiles = fileArray.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      toast.error('Please select only video files');
      return;
    }
    
    setIsUploading(true);
    
    for (const file of videoFiles) {
      try {
        setUploadProgress(0);
        const response = await mediaAPI.upload(file, {
          alt_text: file.name,
          description: `Uploaded ${new Date().toLocaleDateString()}`
        });
        
        if (response.success) {
          toast.success(`${file.name} uploaded successfully!`);
          // Refresh the available videos
          fetchAvailableVideos();
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setIsUploading(false);
    setUploadProgress(0);
  };

  // Handle drag and drop for upload
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleVideoDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleVideoUpload(files);
    }
  };

  return {
    handleImageUpload,
    handleVideoUpload,
    handleDragOver,
    handleDrop,
    handleVideoDrop,
  };
};