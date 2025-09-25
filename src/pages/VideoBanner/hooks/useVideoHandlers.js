import { useState } from 'react';
import { toast } from 'react-toastify';
import { mediaAPI } from '../../../api';

export const useVideoHandlers = () => {
  // Upload states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle work selection
  const handleWorkSelection = (work, setSelectedWork, setUseCustomVideo, setSelectedVideo) => {
    setSelectedWork(work);
    setUseCustomVideo(false);
    
    // Set default video from work's video_project_src and video_project_poster
    if (work.video_project_src) {
      setSelectedVideo({
        id: `work_${work.id}`,
        name: `${work.title} - Default Video`,
        url: work.video_project_src,
        thumbnail: work.video_project_poster,
        type: 'work_default',
        isDefault: true
      });
    } else {
      setSelectedVideo(null);
    }
  };

  // Handle custom video selection toggle
  const handleCustomVideoToggle = (useCustomVideo, setUseCustomVideo, selectedWork, setSelectedVideo) => {
    setUseCustomVideo(!useCustomVideo);
    if (!useCustomVideo) {
      // Reset to default work video when enabling custom video
      if (selectedWork?.video_project_src) {
        setSelectedVideo({
          id: `work_${selectedWork.id}`,
          name: `${selectedWork.title} - Default Video`,
          url: selectedWork.video_project_src,
          thumbnail: selectedWork.video_project_poster || selectedWork.hero_banner_image,
          type: 'work_default',
          isDefault: true
        });
      }
    }
  };

  // Handle video selection from library
  const handleVideoSelection = (video, setSelectedVideo, setIsVideoLibraryOpen) => {
    // Ensure the video object has the required properties
    console.log('Video selected from library:', video);
    const formattedVideo = {
      id: video.id,
      name: video.original_name || video.filename || 'Selected Video',
      url: video.url, // API response includes full URL
      thumbnail: video.poster_url, // API response includes poster_url
      type: video.extension || 'video',
      isDefault: false
    };
    
    console.log('Selecting video:', formattedVideo);
    setSelectedVideo(formattedVideo);
    setIsVideoLibraryOpen(false);
  };

  // Handle video upload
  const handleVideoUpload = async (file, setVideoLibrary, handleVideoSelection, setSelectedVideo, setIsVideoLibraryOpen, posterFile = null) => {
    try {
      setUploadingVideo(true);
      setUploadProgress(0);

      const metadata = {
        alt_text: file.name,
        description: `Uploaded for video banner - ${new Date().toLocaleDateString()}`
      };

      const response = await mediaAPI.uploadVideo(file, posterFile, metadata);
      
      if (response.success) {
        // Add to video library - ensure it's always an array
        setVideoLibrary(prev => {
          const currentLibrary = Array.isArray(prev) ? prev : [];
          return [response.data, ...currentLibrary];
        });
        
        // Auto-select the uploaded video
        handleVideoSelection(response.data, setSelectedVideo, setIsVideoLibraryOpen);
        
        toast.success('Video uploaded successfully');
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Video upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadingVideo,
    uploadProgress,
    handleWorkSelection,
    handleCustomVideoToggle,
    handleVideoSelection,
    handleVideoUpload
  };
};