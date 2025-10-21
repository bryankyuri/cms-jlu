import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { mediaAPI, worksAPI } from "../../../../api/index";

export const useWorkEdit = () => {
  const { id } = useParams(); // Get work ID from URL params
  // Animation states
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);

  // Edit functionality states
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [tempImagesOrder, setTempImagesOrder] = useState([]);
  const [galleryModalAnimated, setGalleryModalAnimated] = useState(false);

  // Image popup states
  const [popupImage, setPopupImage] = useState(null);
  const [popupImageIndex, setPopupImageIndex] = useState(0);

  // Gallery item states
  const [isAddGalleryModalOpen, setIsAddGalleryModalOpen] = useState(false);
  const [availableImages, setAvailableImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImageType, setSelectedImageType] = useState("full-width");
  const [selectedImages, setSelectedImages] = useState([]);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [removeItemIndex, setRemoveItemIndex] = useState(null);

  // Credit removal confirmation states
  const [isCreditRemoveConfirmOpen, setIsCreditRemoveConfirmOpen] = useState(false);
  const [removeCreditIndex, setRemoveCreditIndex] = useState(null);

  // Hero banner image editor states
  const [isHeroBannerModalOpen, setIsHeroBannerModalOpen] = useState(false);
  const [selectedHeroBannerImage, setSelectedHeroBannerImage] = useState(null);
  const [backgroundPosX, setBackgroundPosX] = useState('center');
  const [backgroundPosY, setBackgroundPosY] = useState('top');

  // Video project editor states
  const [isVideoProjectModalOpen, setIsVideoProjectModalOpen] = useState(false);
  const [selectedVideoProject, setSelectedVideoProject] = useState(null);
  const [availableVideos, setAvailableVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Save states
  const [isSaving, setIsSaving] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Upload modal states
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [isVideoUploadModalOpen, setIsVideoUploadModalOpen] = useState(false);

  // Hero banner button states
  const [heroBannerButtonBg, setHeroBannerButtonBg] = useState("bg-black bg-opacity-70");
  const [isHeroBannerVisible, setIsHeroBannerVisible] = useState(true);

  // Video player tab state
  const [activeVideoTab, setActiveVideoTab] = useState("uploaded");

  // Work data state
  const [workData, setWorkData] = useState({
    heroBannerImage: "",
    heroBannerPositionX: "center",
    heroBannerPositionY: "top",
    title: "",
    client: "",
    category: "film/series",
    year: new Date().getFullYear().toString(),
    tag: [],
    description: "",
    slug: "",
    videoProjectSrc: "",
    videoProjectPosterUrl: "",
    videoVimeoUrl: "",
    videoYoutubeUrl: "",
    videoCloudflareUrl: "",
    credits: [
      { role: "Director", name: ["Your Name"] },
      { role: "Producer", name: ["Your Name"] },
      { role: "DOP", name: ["Your Name"] },
      { role: "Colorist", name: ["Your Name"] },
      { role: "Visual Effect", name: ["Your Name"] },
      { role: "Motion Graphic", name: ["Your Name"] },
    ],
    images: [
      
    ],
  });

  const [tempWorkData, setTempWorkData] = useState();

  // Auto-select first available video tab
  useEffect(() => {
    if (workData.videoProjectSrc) {
      setActiveVideoTab("uploaded");
    } else if (workData.videoVimeoUrl) {
      setActiveVideoTab("vimeo");
    } else if (workData.videoYoutubeUrl) {
      setActiveVideoTab("youtube");
    } else if (workData.videoCloudflareUrl) {
      setActiveVideoTab("cloudflare");
    }
  }, [workData.videoProjectSrc, workData.videoVimeoUrl, workData.videoYoutubeUrl, workData.videoCloudflareUrl]);

  // Animation function for smooth slider transitions
  const animateSlider = (targetPosition) => {
    setIsAnimating(true);
    const startPosition = sliderPosition;
    const duration = 600;
    const startTime = performance.now();

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeInOutCubic = (progress) =>
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const newPosition = startPosition + (targetPosition - startPosition) * easeInOutCubic(progress);
      setSliderPosition(newPosition);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setSliderPosition(targetPosition);
        setIsAnimating(false);
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Function to get average brightness of image
  const getImageBrightness = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const sampleSize = 100;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        try {
          const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
          const data = imageData.data;
          let totalBrightness = 0;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            totalBrightness += brightness;
          }

          const avgBrightness = totalBrightness / (data.length / 4);
          resolve(avgBrightness);
        } catch (error) {
          resolve(128);
        }
      };

      img.onerror = () => {
        resolve(128);
      };

      img.src = imageSrc;
    });
  };

  // Update hero banner button background based on image brightness
  useEffect(() => {
    const updateButtonBackground = async () => {
      try {
        const brightness = await getImageBrightness(workData.heroBannerImage);
        if (brightness > 128) {
          setHeroBannerButtonBg("bg-black bg-opacity-80 text-white");
        } else {
          setHeroBannerButtonBg("bg-white bg-opacity-90 text-black");
        }
      } catch (error) {
        setHeroBannerButtonBg("bg-black bg-opacity-70 text-white");
      }
    };

    updateButtonBackground();
  }, [workData.heroBannerImage]);

  // Track hero banner visibility for sticky button
  useEffect(() => {
    const handleScroll = () => {
      const heroBannerElement = document.querySelector(".hero-banner-section");
      if (heroBannerElement) {
        const rect = heroBannerElement.getBoundingClientRect();
        const isVisible = rect.bottom - 200 > 0;
        setIsHeroBannerVisible(isVisible);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Image popup functions
  const handleImageClick = (imageUrl, index = 0) => {
    setPopupImage(imageUrl);
    setPopupImageIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closePopup = () => {
    setPopupImage(null);
    setPopupImageIndex(0);
    document.body.style.overflow = "";
  };

  // Keyboard navigation for popup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!popupImage) return;

      if (e.key === "Escape") {
        closePopup();
      } else if (e.key === "ArrowLeft" && Array.isArray(popupImage) && popupImageIndex > 0) {
        setPopupImageIndex(popupImageIndex - 1);
      } else if (e.key === "ArrowRight" && Array.isArray(popupImage) && popupImageIndex < popupImage.length - 1) {
        setPopupImageIndex(popupImageIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [popupImage, popupImageIndex]);

  // API fetch functions
  const fetchAvailableImages = async () => {
    setLoadingImages(true);
    try {
      const response = await mediaAPI.getAll({
        type: "image",
        per_page: 50,
      });

      if (response.success) {
        setAvailableImages(response.data.data || []);
      } else {
        toast.error("Failed to load images");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load images");
    } finally {
      setLoadingImages(false);
    }
  };

  const fetchAvailableVideos = async () => {
    setLoadingVideos(true);
    try {
      const response = await mediaAPI.getAll({
        type: "video",
        per_page: 50,
      });

      if (response.success) {
        setAvailableVideos(response.data.data || []);
      } else {
        toast.error("Failed to load videos");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load videos");
    } finally {
      setLoadingVideos(false);
    }
  };

  // Transform API work data to component format
  const transformApiDataToWorkData = (apiData) => {
    return {
      heroBannerImage: apiData.hero_banner_image || "",
      heroBannerPositionX: apiData.hero_banner_position_x || "center",
      heroBannerPositionY: apiData.hero_banner_position_y || "top",
      title: apiData.title || "",
      client: apiData.client || "",
      category: apiData.category || "film/series",
      year: apiData.year || new Date().getFullYear().toString(),
      tag: apiData.tags || [],
      description: apiData.description || "",
      slug: apiData.slug || "",
      videoProjectSrc: apiData.video_project_src || "",
      videoProjectPosterUrl: apiData.video_project_poster || "",
      videoVimeoUrl: apiData.video_vimeo_url || "",
      videoYoutubeUrl: apiData.video_youtube_url || "",
      videoCloudflareUrl: apiData.video_cloudflare_url || "",
      credits: apiData.credits && apiData.credits.length > 0 
        ? apiData.credits.map(credit => ({
            role: credit.role || "",
            name: credit.names || []
          }))
        : [
            { role: "Director", name: ["Your Name"] },
            { role: "Producer", name: ["Your Name"] },
            { role: "DOP", name: ["Your Name"] },
            { role: "Colorist", name: ["Your Name"] },
            { role: "Visual Effect", name: ["Your Name"] },
            { role: "Motion Graphic", name: ["Your Name"] },
          ],
      images: apiData.gallery_items && apiData.gallery_items.length > 0
        ? apiData.gallery_items.map(item => ({
            id: item.id,
            type: item.type,
            imageUrl: item.images
          }))
        : [],
      status: apiData.status || "draft",
      // Store the original ID for updates
      id: apiData.id,
    };
  };

  // Fetch work data for editing
  const fetchWorkData = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    
    try {
      const response = await worksAPI.get(id);
      
      if (response.success) {
        const transformedData = transformApiDataToWorkData(response.data);
        setWorkData(transformedData);
      } else {
        setLoadError(response.message || "Failed to load work data");
        toast.error("Failed to load work data");
      }
    } catch (error) {
      console.error("Error fetching work:", error);
      setLoadError("Failed to load work data");
      toast.error("Failed to load work data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch work data on component mount
  useEffect(() => {
    fetchWorkData();
  }, [id]);

  return {
    // States
    sliderPosition,
    setSliderPosition,
    isAnimating,
    isGalleryModalOpen,
    setIsGalleryModalOpen,
    tempImagesOrder,
    setTempImagesOrder,
    galleryModalAnimated,
    setGalleryModalAnimated,
    popupImage,
    setPopupImage,
    popupImageIndex,
    setPopupImageIndex,
    isAddGalleryModalOpen,
    setIsAddGalleryModalOpen,
    availableImages,
    loadingImages,
    selectedImageType,
    setSelectedImageType,
    selectedImages,
    setSelectedImages,
    editingGalleryItem,
    setEditingGalleryItem,
    isRemoveConfirmOpen,
    setIsRemoveConfirmOpen,
    removeItemIndex,
    setRemoveItemIndex,
    isCreditRemoveConfirmOpen,
    setIsCreditRemoveConfirmOpen,
    removeCreditIndex,
    setRemoveCreditIndex,
    isHeroBannerModalOpen,
    setIsHeroBannerModalOpen,
    selectedHeroBannerImage,
    setSelectedHeroBannerImage,
    backgroundPosX,
    setBackgroundPosX,
    backgroundPosY,
    setBackgroundPosY,
    isVideoProjectModalOpen,
    setIsVideoProjectModalOpen,
    selectedVideoProject,
    setSelectedVideoProject,
    availableVideos,
    loadingVideos,
    isUploading,
    setIsUploading,
    uploadProgress,
    setUploadProgress,
    isSaving,
    setIsSaving,
    // Loading states
    isLoading,
    loadError,
    // Upload modal states
    isImageUploadModalOpen,
    setIsImageUploadModalOpen,
    isVideoUploadModalOpen,
    setIsVideoUploadModalOpen,
    heroBannerButtonBg,
    isHeroBannerVisible,
    activeVideoTab,
    setActiveVideoTab,
    workData,
    setWorkData,
    tempWorkData,
    setTempWorkData,

    // Functions
    animateSlider,
    handleImageClick,
    closePopup,
    fetchAvailableImages,
    fetchAvailableVideos,
  };
};