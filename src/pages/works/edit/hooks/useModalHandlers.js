import { toast } from "react-toastify";
import { mediaAPI } from "../../../../api";

// Utility functions to manage body scroll
const disableBodyScroll = () => {
  document.body.style.overflow = 'hidden';
};

const enableBodyScroll = () => {
  document.body.style.overflow = 'unset';
};

// Modal handling functions
export const useModalHandlers = (
  workData,
  setWorkData,
  setIsCreditRemoveConfirmOpen,
  setRemoveCreditIndex,
  setIsHeroBannerModalOpen,
  selectedHeroBannerImage,
  setSelectedHeroBannerImage,
  setIsVideoProjectModalOpen,
  selectedVideoProject,
  setSelectedVideoProject,
  fetchAvailableImages,
  fetchAvailableVideos,
  // Upload modal states
  setIsImageUploadModalOpen,
  setIsVideoUploadModalOpen
) => {
  // Credit removal confirmation functions
  const showCreditRemoveConfirmation = (index) => {
    setRemoveCreditIndex(index);
    setIsCreditRemoveConfirmOpen(true);
    disableBodyScroll();
  };

  const cancelCreditRemoveConfirmation = () => {
    setIsCreditRemoveConfirmOpen(false);
    setRemoveCreditIndex(null);
    enableBodyScroll();
  };

  const confirmCreditRemoval = (index) => {
    const updatedCredits = workData.credits.filter((_, i) => i !== index);
    setWorkData((prevData) => ({
      ...prevData,
      credits: updatedCredits,
    }));
    setIsCreditRemoveConfirmOpen(false);
    setRemoveCreditIndex(null);
    enableBodyScroll();
    toast.info("Credit removed successfully");
  };

  // Hero banner image editing functions
  const openHeroBannerModal = () => {
    setIsHeroBannerModalOpen(true);
    setSelectedHeroBannerImage(null);
    disableBodyScroll();
    fetchAvailableImages();
  };

  const closeHeroBannerModal = () => {
    setIsHeroBannerModalOpen(false);
    setSelectedHeroBannerImage(null);
    enableBodyScroll();
  };

  const handleHeroBannerImageSelection = (image) => {
    setSelectedHeroBannerImage(image);
  };

  const updateHeroBannerImage = (posX, posY) => {
    // Allow updating position if there's an existing image, even without selecting a new one
    const hasExistingImage = workData.heroBannerImage;
    const hasNewImage = selectedHeroBannerImage;

    if (!hasExistingImage && !hasNewImage) {
      toast.error("Please select an image for the hero banner");
      return;
    }

    // Use new image if selected, otherwise keep the existing one
    const imageUrl = hasNewImage 
      ? mediaAPI.getDirectUrl(selectedHeroBannerImage.path)
      : workData.heroBannerImage;

    setWorkData((prevData) => ({
      ...prevData,
      heroBannerImage: imageUrl,
      heroBannerPositionX: posX || 'center',
      heroBannerPositionY: posY || 'top',
    }));

    closeHeroBannerModal();
    
    // Show appropriate success message
    if (hasNewImage) {
      toast.success("Hero banner image updated successfully");
    } else {
      toast.success("Hero banner position updated successfully");
    }
  };

  // Video project editing functions
  const openVideoProjectModal = () => {
    setIsVideoProjectModalOpen(true);
    setSelectedVideoProject(null);
    disableBodyScroll();
    fetchAvailableVideos();
  };

  const closeVideoProjectModal = () => {
    setIsVideoProjectModalOpen(false);
    setSelectedVideoProject(null);
    enableBodyScroll();
  };

  const handleVideoProjectSelection = (video) => {
    setSelectedVideoProject(video);
  };

  const updateVideoProject = () => {
    if (!selectedVideoProject) {
      toast.error("Please select a video for the project");
      return;
    }

    const videoUrl = mediaAPI.getDirectUrl(selectedVideoProject.path);

    setWorkData((prevData) => ({
      ...prevData,
      videoProjectSrc: videoUrl,
      videoProjectPosterUrl: selectedVideoProject.poster_url,
    }));

    closeVideoProjectModal();
    toast.success("Video project updated successfully");
  };

  // Function to remove credit (shows confirmation)
  const removeCredit = (index) => {
    showCreditRemoveConfirmation(index);
  };

  // Upload modal functions
  const openImageUploadModal = () => {
    setIsImageUploadModalOpen(true);
    disableBodyScroll();
  };

  const closeImageUploadModal = () => {
    setIsImageUploadModalOpen(false);
    enableBodyScroll();
  };

  const openVideoUploadModal = () => {
    setIsVideoUploadModalOpen(true);
    disableBodyScroll();
  };

  const closeVideoUploadModal = () => {
    setIsVideoUploadModalOpen(false);
    enableBodyScroll();
  };

  return {
    showCreditRemoveConfirmation,
    cancelCreditRemoveConfirmation,
    confirmCreditRemoval,
    openHeroBannerModal,
    closeHeroBannerModal,
    handleHeroBannerImageSelection,
    updateHeroBannerImage,
    openVideoProjectModal,
    closeVideoProjectModal,
    handleVideoProjectSelection,
    updateVideoProject,
    removeCredit,
    // Upload modal functions
    openImageUploadModal,
    closeImageUploadModal,
    openVideoUploadModal,
    closeVideoUploadModal,
  };
};