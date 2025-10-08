import React, { useState } from "react";
import { FiPlus, FiMove } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import API
import { videoBannerAPI } from '../../api';

// Import hooks
import { useVideoBannerData } from './hooks/useVideoBannerData';
import { useModalHandlers } from './hooks/useModalHandlers';
import { useVideoHandlers } from './hooks/useVideoHandlers';
import { useBannerHandlers } from './hooks/useBannerHandlers';

// Import components
import LoadingSpinner from './components/LoadingSpinner';
import BannersTable from './components/BannersTable';
import CreateBannerModal from './components/CreateBannerModal';
import EditBannerModal from './components/EditBannerModal';
import VideoLibraryModal from './components/VideoLibraryModal';
import ReorderBannerModal from './components/ReorderBannerModal';

const VideoBanner = () => {
  // Hooks
  const {
    banners,
    setBanners,
    publishedWorks,
    videoLibrary,
    setVideoLibrary,
    loading,
    // Works pagination and filtering
    worksLoading,
    worksError,
    worksCurrentPage,
    setWorksCurrentPage,
    worksTotalPages,
    worksTotalWorks,
    worksPerPage,
    setWorksPerPage,
    worksSearchQuery,
    setWorksSearchQuery,
    worksCategoryFilter,
    setWorksCategoryFilter,
    worksTagsFilter,
    setWorksTagsFilter,
    loadWorksWithFilters,
    clearWorksFilters,
    handleWorksPerPageChange,
    // Video library pagination and filtering
    videosLoading,
    videosCurrentPage,
    setVideosCurrentPage,
    videosTotalPages,
    videosTotalVideos,
    videosPerPage,
    setVideosPerPage,
    videosSearchQuery,
    setVideosSearchQuery,
    videosSortBy,
    setVideosSortBy,
    videosSortOrder,
    setVideosSortOrder,
    loadVideosWithFilters,
    initializeVideoLibrary,
    clearVideoFilters,
    handleVideosPerPageChange
  } = useVideoBannerData();

  const {
    isCreateModalOpen,
    isVideoLibraryOpen,
    isEditModalOpen,
    selectedWork,
    setSelectedWork,
    selectedVideo,
    setSelectedVideo,
    useCustomVideo,
    setUseCustomVideo,
    currentBanner,
    openCreateModal,
    closeCreateModal,
    openVideoLibrary,
    closeVideoLibrary,
    openEditModal,
    closeEditModal
  } = useModalHandlers();

  // Reorder modal state
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderBanners, setReorderBanners] = useState([]);

  const {
    uploadingVideo,
    uploadProgress,
    handleWorkSelection,
    handleCustomVideoToggle,
    handleVideoSelection,
    handleVideoUpload
  } = useVideoHandlers();

  const {
    handleCreateBanner,
    handleDeleteBanner,
    handleBannerVideoUpdate,
    handleEditBanner: handleEditBannerAPI
  } = useBannerHandlers();

  // Enhanced handlers that use state setters
  const handleWorkSelect = (work) => {
    handleWorkSelection(work, setSelectedWork, setUseCustomVideo, setSelectedVideo);
  };

  const handleCustomVideoToggleWrapper = (useCustom, work = selectedWork) => {
    console.log('🔧 handleCustomVideoToggleWrapper called:', { useCustom, work, currentUseCustomVideo: useCustomVideo });
    setUseCustomVideo(useCustom);
    
    if (!useCustom && work?.video_project_src) {
      // When switching to default video, set the work's default video
      console.log('🎬 Setting default video for work:', work.title);
      setSelectedVideo({
        id: `work_${work.id}`,
        name: `${work.title} - Default Video`,
        url: work.video_project_src,
        thumbnail: work.video_project_poster || work.hero_banner_image,
        type: 'work_default',
        isDefault: true
      });
    } else if (useCustom) {
      // When switching to custom video, clear selection until user picks one
      console.log('📚 Switching to custom video mode, clearing selection');
      setSelectedVideo(null);
    }
  };

  const handleClearWorksFilters = () => {
    clearWorksFilters();
  };

  // Enhanced video library handlers
  const handleVideoLibraryOpen = async () => {
    console.log('📹 Opening video library modal...');
    openVideoLibrary();
    await initializeVideoLibrary();
  };  const handleVideoSelect = (video) => {
    console.log('🎬 Video selected in main component:', video);
    handleVideoSelection(video, setSelectedVideo, () => closeVideoLibrary());
  };

  const handleVideoUploadWrapper = (file, posterFile = null) => {
    handleVideoUpload(
      file,
      setVideoLibrary,
      handleVideoSelection,
      setSelectedVideo,
      () => closeVideoLibrary(),
      posterFile
    );
  };

  const handleCreateBannerWrapper = () => {
    // Compute the video to use (same logic as in CreateBannerModal)
    let videoToUse = selectedVideo;
    
    if (!useCustomVideo && selectedWork?.video_project_src) {
      videoToUse = {
        id: `work_${selectedWork.id}`,
        name: `${selectedWork.title} - Default Video`,
        url: selectedWork.video_project_src,
        thumbnail: selectedWork.video_project_poster || selectedWork.hero_banner_image,
        type: 'work_default',
        isDefault: true
      };
    }
    
    handleCreateBanner(selectedWork, videoToUse, setBanners, closeCreateModal);
  };

  const handleDeleteBannerWrapper = (bannerId) => {
    handleDeleteBanner(bannerId, setBanners);
  };

  const handleBannerVideoUpdateWrapper = () => {
    handleBannerVideoUpdate(
      selectedVideo,
      useCustomVideo,
      currentBanner,
      publishedWorks,
      setBanners,
      closeEditModal
    );
  };

  // Enhanced handler for edit modal that calls the API
  const handleEditBanner = async (selectedWorkForEdit, selectedVideoForEdit, useCustomVideoForEdit) => {
    if (!selectedVideoForEdit) {
      toast.error("Please select a video");
      return;
    }

    try {
      // Call the API function from useBannerHandlers
      await handleEditBannerAPI(
        currentBanner,
        selectedWorkForEdit,
        selectedVideoForEdit,
        setBanners,
        closeEditModal
      );
      
      // Reset selections
      setSelectedWork(null);
      setSelectedVideo(null);
      setUseCustomVideo(false);
      
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Failed to update banner');
    }
  };

  // Check if update is possible
  const canUpdateBanner = selectedVideo || (!useCustomVideo && publishedWorks.find(w => w.id === currentBanner?.work_id)?.video_project_src);

  // Reorder handlers
  const openReorderModal = () => {
    console.log('🔄 Opening reorder modal...', { bannersCount: banners.length, banners });
    setReorderBanners([...banners]); // Create a copy for editing
    setIsReorderModalOpen(true);
    console.log('🔄 Modal state set to true');
  };

  const closeReorderModal = () => {
    setIsReorderModalOpen(false);
    setReorderBanners([]);
  };

  const handleReorderSave = async () => {
    try {
      // Format the data as expected by the backend API
      const bannersData = {
        banners: reorderBanners.map((banner, index) => ({
          id: banner.id,
          position: index + 1
        }))
      };
      
      // Call API to update banner positions
      const response = await videoBannerAPI.reorder(bannersData);
      
      if (response.success) {
        // Update the banners with the new order
        setBanners(reorderBanners);
        toast.success("Banner order updated successfully");
        closeReorderModal();
      } else {
        throw new Error(response.message || 'Failed to reorder banners');
      }
      
    } catch (error) {
      console.error('Error updating banner order:', error);
      toast.error(error.message || 'Failed to update banner order');
    }
  };

  const moveBanner = (dragIndex, hoverIndex) => {
    const dragBanner = reorderBanners[dragIndex];
    const newOrder = [...reorderBanners];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragBanner);
    setReorderBanners(newOrder);
  };

  // Check if max banners reached
  const maxBannersReached = banners.length >= 4;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full px-4 py-8">
      <ToastContainer position="top-center" autoClose={3000} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="lg:text-[40px] text-[36px] text-black font-bold text-center w-full sm:text-left sm:w-auto">
          VIDEO BANNERS ({banners.length}/4)
        </h1>
        
        <div className="flex gap-2">
          {/* <button
            onClick={maxBannersReached ? null : openCreateModal}
            className={`px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${
              maxBannersReached 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            disabled={maxBannersReached}
            title={maxBannersReached ? "Maximum 4 banners allowed" : "Add new banner"}
          >
            <FiPlus className="h-4 w-4" />
            Add Banner
          </button> */}

          <button
            onClick={() => {
              console.log('🔄 Reorder button clicked!', { bannersLength: banners.length, disabled: banners.length <= 1 });
              if (banners.length > 1) {
                openReorderModal();
              }
            }}
            className={`px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${
              banners.length <= 1
                ? 'bg-black text-gray-500 cursor-not-allowed'
                : 'bg-black text-white'
            }`}
            disabled={banners.length <= 1}
            title={banners.length <= 1 ? "Need at least 2 banners to reorder" : "Reorder banners"}
          >
            <FiMove className="h-4 w-4" />
            Reorder Banners
          </button>
        </div>
      </div>

      {/* Banners Table */}
      <BannersTable
        banners={banners}
        onEditBanner={openEditModal}
        onDeleteBanner={handleDeleteBannerWrapper}
        onCreateModal={openCreateModal}
      />

      {/* Create Banner Modal */}
      <CreateBannerModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        publishedWorks={publishedWorks}
        selectedWork={selectedWork}
        onWorkSelect={handleWorkSelect}
        selectedVideo={selectedVideo}
        useCustomVideo={useCustomVideo}
        onCustomVideoToggle={handleCustomVideoToggleWrapper}
        onVideoLibraryOpen={handleVideoLibraryOpen}
        onCreateBanner={handleCreateBannerWrapper}
        // Works pagination and filtering props
        worksLoading={worksLoading}
        worksError={worksError}
        worksCurrentPage={worksCurrentPage}
        worksTotalPages={worksTotalPages}
        worksTotalWorks={worksTotalWorks}
        worksSearchQuery={worksSearchQuery}
        worksCategoryFilter={worksCategoryFilter}
        worksTagsFilter={worksTagsFilter}
        onWorksPageChange={setWorksCurrentPage}
        onWorksSearchChange={setWorksSearchQuery}
        onWorksCategoryChange={setWorksCategoryFilter}
        onWorksTagsChange={setWorksTagsFilter}
        onClearWorksFilters={clearWorksFilters}
        onRetryWorks={loadWorksWithFilters}
      />

      {/* Edit Banner Modal */}
        {isEditModalOpen && currentBanner && (
          <EditBannerModal
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            currentBanner={currentBanner}
            allowWorkChange={true}
            publishedWorks={publishedWorks}
            worksLoading={worksLoading}
            worksError={worksError}
            selectedWork={selectedWork}
            onWorkSelect={setSelectedWork}
            worksCurrentPage={worksCurrentPage}
            worksTotalPages={worksTotalPages}
            worksTotalWorks={worksTotalWorks}
            worksPerPage={worksPerPage}
            onWorksPageChange={setWorksCurrentPage}
            onWorksPerPageChange={handleWorksPerPageChange}
            worksSearchQuery={worksSearchQuery}
            onWorksSearchChange={setWorksSearchQuery}
            worksCategoryFilter={worksCategoryFilter}
            onWorksCategoryChange={setWorksCategoryFilter}
            worksTagsFilter={worksTagsFilter}
            onWorksTagsChange={setWorksTagsFilter}
            onClearWorksFilters={handleClearWorksFilters}
            onRetryWorks={loadWorksWithFilters}
            useCustomVideo={useCustomVideo}
            selectedVideo={selectedVideo}
            onCustomVideoToggle={handleCustomVideoToggleWrapper}
            onVideoLibraryOpen={handleVideoLibraryOpen}
            onSave={handleEditBanner}
            loading={loading}
          />
        )}      {/* Video Library Modal */}
      <VideoLibraryModal
        isOpen={isVideoLibraryOpen}
        onClose={closeVideoLibrary}
        videoLibrary={videoLibrary}
        onVideoSelect={handleVideoSelect}
        onVideoUpload={handleVideoUploadWrapper}
        onRefreshLibrary={loadVideosWithFilters}
        uploadingVideo={uploadingVideo}
        uploadProgress={uploadProgress}
        // Pagination props
        currentPage={videosCurrentPage}
        totalPages={videosTotalPages}
        totalVideos={videosTotalVideos}
        videosPerPage={videosPerPage}
        onPageChange={setVideosCurrentPage}
        onPerPageChange={handleVideosPerPageChange}
        // Search and filtering props
        searchQuery={videosSearchQuery}
        onSearchChange={setVideosSearchQuery}
        // Sorting props
        sortBy={videosSortBy}
        sortOrder={videosSortOrder}
        onSortByChange={setVideosSortBy}
        onSortOrderChange={setVideosSortOrder}
        // Loading state
        loading={videosLoading}
      />

      {/* Reorder Banner Modal */}
      {console.log('🎭 Rendering ReorderBannerModal:', { isReorderModalOpen, reorderBannersCount: reorderBanners.length })}
      <ReorderBannerModal
        isOpen={isReorderModalOpen}
        onClose={closeReorderModal}
        banners={reorderBanners}
        onSave={handleReorderSave}
        moveBanner={moveBanner}
        loading={loading}
      />
    </div>
  );
};

export default VideoBanner;