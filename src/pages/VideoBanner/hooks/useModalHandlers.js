import { useState } from 'react';

export const useModalHandlers = () => {
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVideoLibraryOpen, setIsVideoLibraryOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states
  const [selectedWork, setSelectedWork] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [useCustomVideo, setUseCustomVideo] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);

  // Modal management functions
  const openCreateModal = () => {
    setIsCreateModalOpen(true);
    setSelectedWork(null);
    setSelectedVideo(null);
    setUseCustomVideo(false);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedWork(null);
    setSelectedVideo(null);
    setUseCustomVideo(false);
  };

  const openVideoLibrary = () => {
    setIsVideoLibraryOpen(true);
  };

  const closeVideoLibrary = () => {
    setIsVideoLibraryOpen(false);
  };

  const openEditModal = (banner) => {
    setCurrentBanner(banner);
    setSelectedVideo(null); // Reset video selection for editing
    setUseCustomVideo(banner.is_custom_video); // Set initial toggle state based on banner data
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentBanner(null);
    setSelectedVideo(null);
    setUseCustomVideo(false);
  };

  return {
    // Modal states
    isCreateModalOpen,
    isVideoLibraryOpen,
    isEditModalOpen,
    
    // Form states
    selectedWork,
    setSelectedWork,
    selectedVideo,
    setSelectedVideo,
    useCustomVideo,
    setUseCustomVideo,
    currentBanner,
    setCurrentBanner,
    
    // Modal handlers
    openCreateModal,
    closeCreateModal,
    openVideoLibrary,
    closeVideoLibrary,
    openEditModal,
    closeEditModal
  };
};