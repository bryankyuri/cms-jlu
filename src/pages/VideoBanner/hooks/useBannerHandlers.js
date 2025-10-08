import { toast } from 'react-toastify';
import { videoBannerAPI } from '../../../api';

export const useBannerHandlers = () => {
  // Banner creation
  const handleCreateBanner = async (selectedWork, selectedVideo, setBanners, closeCreateModal) => {
    if (!selectedWork || !selectedVideo) {
      toast.error("Please select a work and video");
      return;
    }

    try {
      // Prepare banner data for API
      const bannerData = {
        work_id: selectedWork.id,
        video_url: selectedVideo.url,
        video_thumbnail: selectedVideo.thumbnail,
        is_custom_video: !selectedVideo.isDefault,
      };

      // Call API to create banner
      const response = await videoBannerAPI.create(bannerData);
      
      if (response.success) {
        // Add the new banner to the state
        setBanners(prev => [response.data, ...prev]);
        toast.success("Banner created successfully");
        closeCreateModal();
      } else {
        throw new Error(response.message || 'Failed to create banner');
      }
      
    } catch (error) {
      console.error('Error creating banner:', error);
      
      // Handle specific error cases
      if (error.message?.includes('BANNER_LIMIT_EXCEEDED')) {
        toast.error('Maximum 4 video banners allowed');
      } else {
        toast.error(error.message || 'Failed to create banner');
      }
    }
  };

  // Banner editing
  const handleEditBanner = async (banner, selectedWork, selectedVideo, setBanners, closeEditModal) => {
    if (!selectedWork || !selectedVideo) {
      toast.error("Please select a work and video");
      return;
    }

    try {
      // Prepare banner data for API
      const bannerData = {
        work_id: selectedWork.id,
        video_url: selectedVideo.url,
        video_thumbnail: selectedVideo.thumbnail,
        is_custom_video: selectedVideo.type !== 'work_default' && !selectedVideo.isDefault,
      };

      console.log('🔄 Updating banner with data:', { 
        bannerId: banner.id, 
        bannerData,
        selectedVideo: {
          type: selectedVideo.type,
          isDefault: selectedVideo.isDefault,
          url: selectedVideo.url
        }
      });

      // Call API to update banner
      const response = await videoBannerAPI.update(banner.id, bannerData);
      
      if (response.success) {
        // Update the banner in state
        setBanners(prev => 
          prev.map(b => b.id === banner.id ? response.data : b)
        );
        toast.success("Banner updated successfully");
        closeEditModal();
      } else {
        throw new Error(response.message || 'Failed to update banner');
      }
      
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error(error.message || 'Failed to update banner');
    }
  };

    // Banner deletion
  const handleDeleteBanner = async (banner, setBanners) => {
    try {
      // Call API to delete banner
      const response = await videoBannerAPI.delete(banner.id);
      
      if (response.success) {
        setBanners(prev => prev.filter(b => b.id !== banner.id));
        toast.success("Banner deleted successfully");
      } else {
        throw new Error(response.message || 'Failed to delete banner');
      }
      
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error(error.message || 'Failed to delete banner');
    }
  };

  // Handle banner video update (for edit modal)
  const handleBannerVideoUpdate = async (
    selectedVideo, 
    useCustomVideo, 
    currentBanner, 
    publishedWorks, 
    setBanners, 
    closeEditModal
  ) => {
    let videoToUpdate = selectedVideo;
    
    // If no video selected but using default, create default video object
    if (!selectedVideo && !useCustomVideo) {
      const work = publishedWorks.find(w => w.id === currentBanner.work_id);
      if (work?.video_project_src) {
        videoToUpdate = {
          url: work.video_project_src,
          thumbnail: work.video_project_poster || work.hero_banner_image,
          isDefault: true
        };
      }
    }
    
    if (videoToUpdate) {
      try {
        // Prepare banner data for API
        const bannerData = {
          work_id: currentBanner.work_id,
          video_url: videoToUpdate.url,
          video_thumbnail: videoToUpdate.thumbnail,
          is_custom_video: useCustomVideo,
        };

        // Call API to update banner
        const response = await videoBannerAPI.update(currentBanner.id, bannerData);
        
        if (response.success) {
          // Update the banner in state
          setBanners(prev => 
            prev.map(banner => 
              banner.id === currentBanner.id ? response.data : banner
            )
          );
          toast.success("Banner video updated successfully");
          closeEditModal();
        } else {
          throw new Error(response.message || 'Failed to update banner');
        }
        
      } catch (error) {
        console.error('Error updating banner video:', error);
        toast.error(error.message || 'Failed to update banner video');
      }
    }
  };

  return {
    handleCreateBanner,
    handleEditBanner,
    handleDeleteBanner,
    handleBannerVideoUpdate
  };
};