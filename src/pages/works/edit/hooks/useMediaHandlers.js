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
  const handleImageUpload = async (files, abortSignal = null) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    
    // Filter to only allow image files
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please select only image files');
      return;
    }
    
    setIsUploading(true);
    
    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        
        // Check if upload was aborted
        if (abortSignal && abortSignal.aborted) {
          throw new DOMException('Upload aborted', 'AbortError');
        }
        
        try {
          const progressPercent = Math.round((i / imageFiles.length) * 100);
          setUploadProgress(progressPercent);
          
          const response = await mediaAPI.upload(file, {
            alt_text: file.name,
            description: `Uploaded ${new Date().toLocaleDateString()}`
          }, abortSignal);
          
          if (response.success) {
            toast.success(`${file.name} uploaded successfully!`);
          } else {
            toast.error(`Failed to upload ${file.name}`);
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            throw error; // Re-throw abort errors to stop the loop
          }
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      
      // Set to 100% when all uploads complete
      setUploadProgress(100);
      
      // Refresh the available images
      fetchAvailableImages();
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.info('Upload cancelled');
      } else {
        console.error('Upload process error:', error);
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset after a delay
    }
  };

  // Handle video upload for video project modal
  const handleVideoUpload = async (files, abortSignal = null) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    
    // Filter to only allow video files
    const videoFiles = fileArray.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      toast.error('Please select only video files');
      return;
    }
    
    setIsUploading(true);
    
    try {
      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i];
        
        // Check if upload was aborted
        if (abortSignal && abortSignal.aborted) {
          throw new DOMException('Upload aborted', 'AbortError');
        }
        
        try {
          const progressPercent = Math.round((i / videoFiles.length) * 100);
          setUploadProgress(progressPercent);
          
          const response = await mediaAPI.upload(file, {
            alt_text: file.name,
            description: `Uploaded ${new Date().toLocaleDateString()}`
          }, abortSignal);
          
          if (response.success) {
            toast.success(`${file.name} uploaded successfully!`);
          } else {
            toast.error(`Failed to upload ${file.name}`);
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            throw error; // Re-throw abort errors to stop the loop
          }
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      
      // Set to 100% when all uploads complete
      setUploadProgress(100);
      
      // Refresh the available videos
      fetchAvailableVideos();
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.info('Video upload cancelled');
      } else {
        console.error('Upload process error:', error);
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset after a delay
    }
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