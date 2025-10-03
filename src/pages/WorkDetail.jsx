import React, { useContext, useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "../styles/WorkDetail.module.scss";
import { AppContext } from "../context/AppContext";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { FadeInSection } from "../components/FadeInSection";
import {
  FiEdit,
  FiSave,
  FiX,
  FiPlusCircle,
  FiTrash2,
  FiMove,
  FiImage,
  FiCheck,
  FiUpload,
} from "react-icons/fi"; // Add icon imports
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { mediaAPI } from "../api/index";

const WorkDetail = () => {
  const { workId } = useParams();
  const { deviceType } = useContext(AppContext);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);

  // New states for edit functionality
  const [editMode, setEditMode] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [tempImagesOrder, setTempImagesOrder] = useState([]);
  const [galleryModalAnimated, setGalleryModalAnimated] = useState(false);

  // Image popup states (same as frontsite-client)
  const [popupImage, setPopupImage] = useState(null);
  const [popupImageIndex, setPopupImageIndex] = useState(0);

  // Add gallery item states
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

  // Video project editor states
  const [isVideoProjectModalOpen, setIsVideoProjectModalOpen] = useState(false);
  const [selectedVideoProject, setSelectedVideoProject] = useState(null);
  const [availableVideos, setAvailableVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Available tag options (predefined)
  const AVAILABLE_TAGS = ["MOTION GRAPHIC", "COLOR GRADING", "VFX", "CGI"];

  // Available image types for gallery
  const IMAGE_TYPES = [
    { value: "full-width", label: "Full Width Image", imageCount: 1 },
    { value: "2col-full", label: "Two Column Layout", imageCount: 2 },
    { value: "2col-4:5", label: "Two Column 4:5 Layout", imageCount: 2 },
    { value: "compare-full", label: "Before/After Comparison", imageCount: 2 },
  ];

  // Convert work data to state
  const [workData, setWorkData] = useState({
    id: workId,
    heroBannerImage: "/hero-banner-detailwork.jpg",
    title: "Video Title",
    client: "Client Name",
    category: "film/series", // film/series, commercial
    year: "2024",
    tag: ["MOTION GRAPHIC", "COLOR GRADING", "VFX", "CGI"],
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisi.",
    videoProjectSrc: "https://videos.virtual-app.my.id/tokpedia_ramadhan.mp4",
    credits: [
      { role: "Director", name: ["Your Name"] },
      { role: "Producer", name: ["Your Name", "Your Name"] },
      { role: "DOP", name: ["Your Name", "Your Name"] },
      { role: "Colorist", name: ["Your Name", "Your Name"] },
      { role: "Visual Effect", name: ["Your Name", "Your Name", "Your Name"] },
      { role: "Motion Graphic", name: ["Your Name", "Your Name"] },
    ],
    images: [
      {
        id: "01",
        type: "full-width",
        imageUrl: "/assets/workDetail/work1.jpg",
      },
      {
        id: "02",
        type: "2col-full",
        imageUrl: [
          "/assets/workDetail/work2.jpg",
          "/assets/workDetail/work3.jpg",
        ],
      },
      {
        id: "03",
        type: "2col-full",
        imageUrl: [
          "/assets/workDetail/work4.jpg",
          "/assets/workDetail/work5.jpg",
        ],
      },
      {
        id: "04",
        type: "compare-full",
        imageUrl: [
          "/assets/workDetail/work6B.jpg",
          "/assets/workDetail/work6.jpg",
        ],
      },
      {
        id: "05",
        type: "2col-4:5",
        imageUrl: [
          "/assets/workDetail/work7.jpg",
          "/assets/workDetail/work8.jpg",
        ],
      },
      {
        id: "06",
        type: "full-width",
        imageUrl: "/assets/workDetail/work9.jpg",
      },
    ],
  });

  // Animation function for smooth slider transitions
  const animateSlider = (targetPosition) => {
    setIsAnimating(true);
    const startPosition = sliderPosition;
    const duration = 600; // animation duration in milliseconds
    const startTime = performance.now();

    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Animation function
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smoother animation
      const easeInOutCubic = (progress) =>
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const newPosition =
        startPosition +
        (targetPosition - startPosition) * easeInOutCubic(progress);

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

  // State for hero banner button background
  const [heroBannerButtonBg, setHeroBannerButtonBg] = useState(
    "bg-black bg-opacity-70"
  );

  // Function to get average brightness of image
  const getImageBrightness = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas size to a smaller sample for performance
        const sampleSize = 100;
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        try {
          const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
          const data = imageData.data;
          let totalBrightness = 0;

          // Calculate average brightness using luminance formula
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Using relative luminance formula: 0.299*R + 0.587*G + 0.114*B
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            totalBrightness += brightness;
          }

          const avgBrightness = totalBrightness / (data.length / 4);
          resolve(avgBrightness);
        } catch (error) {
          // If canvas operations fail (CORS, etc.), default to medium brightness
          resolve(128);
        }
      };

      img.onerror = () => {
        // If image fails to load, default to medium brightness
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

        // If image is bright (>128), use dark button; if dark (<=128), use light button
        if (brightness > 128) {
          setHeroBannerButtonBg("bg-black bg-opacity-80 text-white");
        } else {
          setHeroBannerButtonBg("bg-white bg-opacity-90 text-black");
        }
      } catch (error) {
        // Fallback to default dark button
        setHeroBannerButtonBg("bg-black bg-opacity-70 text-white");
      }
    };

    updateButtonBackground();
  }, [workData.heroBannerImage]);

  // State for sticky hero banner button visibility
  const [isHeroBannerVisible, setIsHeroBannerVisible] = useState(true);

  // Track hero banner visibility for sticky button
  useEffect(() => {
    const handleScroll = () => {
      const heroBannerElement = document.querySelector(".hero-banner-section");

      if (heroBannerElement) {
        const rect = heroBannerElement.getBoundingClientRect();
        const isVisible = rect.bottom - 200 > 0; // Button visible while any part of hero banner is visible
        setIsHeroBannerVisible(isVisible);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Image popup functions (same as frontsite-client)
  const handleImageClick = (imageUrl, index = 0) => {
    setPopupImage(imageUrl);
    setPopupImageIndex(index);
    // Prevent body scroll when popup is open
    document.body.style.overflow = "hidden";
  };

  const closePopup = () => {
    setPopupImage(null);
    setPopupImageIndex(0);
    // Restore body scroll
    document.body.style.overflow = "";
  };

  // Keyboard navigation for popup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!popupImage) return;

      if (e.key === "Escape") {
        closePopup();
      } else if (
        e.key === "ArrowLeft" &&
        Array.isArray(popupImage) &&
        popupImageIndex > 0
      ) {
        setPopupImageIndex(popupImageIndex - 1);
      } else if (
        e.key === "ArrowRight" &&
        Array.isArray(popupImage) &&
        popupImageIndex < popupImage.length - 1
      ) {
        setPopupImageIndex(popupImageIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [popupImage, popupImageIndex]);

  // Function to handle field changes
  const handleFieldChange = (field, value) => {
    setWorkData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Function to handle tag selection
  const handleTagToggle = (tag, isSelected) => {
    if (isSelected) {
      setWorkData((prevData) => ({
        ...prevData,
        tag: [...prevData.tag, tag],
      }));
    } else {
      setWorkData((prevData) => ({
        ...prevData,
        tag: prevData.tag.filter((t) => t !== tag),
      }));
    }
  };

  // Function to handle credit changes (updated for array names)
  const handleCreditChange = (creditIndex, field, value) => {
    const updatedCredits = [...workData.credits];
    updatedCredits[creditIndex][field] = value;
    setWorkData((prevData) => ({
      ...prevData,
      credits: updatedCredits,
    }));
  };

  // Function to handle individual name changes within a credit
  const handleCreditNameChange = (creditIndex, nameIndex, value) => {
    const updatedCredits = [...workData.credits];
    updatedCredits[creditIndex].name[nameIndex] = value;
    setWorkData((prevData) => ({
      ...prevData,
      credits: updatedCredits,
    }));
  };

  // Function to add new name to a credit role
  const addCreditName = (creditIndex) => {
    const updatedCredits = [...workData.credits];
    updatedCredits[creditIndex].name.push("");
    setWorkData((prevData) => ({
      ...prevData,
      credits: updatedCredits,
    }));
  };

  // Function to remove a name from a credit role
  const removeCreditName = (creditIndex, nameIndex) => {
    const updatedCredits = [...workData.credits];
    updatedCredits[creditIndex].name.splice(nameIndex, 1);
    setWorkData((prevData) => ({
      ...prevData,
      credits: updatedCredits,
    }));
  };

  // Function to add new credit
  const addCredit = () => {
    setWorkData((prevData) => ({
      ...prevData,
      credits: [...prevData.credits, { role: "", name: [""] }],
    }));
  };

  // Function to remove credit (shows confirmation)
  const removeCredit = (index) => {
    showCreditRemoveConfirmation(index);
  };

  // Function to save changes
  const saveChanges = () => {
    // Basic validation
    if (!workData.title.trim()) {
      toast.error("Title is required!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (!workData.client.trim()) {
      toast.error("Client is required!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (!workData.year.trim()) {
      toast.error("Year is required!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    // Here you would typically send data to the backend
    console.log("Saving work data:", workData);

    // For now, we'll just exit edit mode
    setEditMode(false);

    // Show a success message with toast
    toast.success("Work details saved successfully!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const cancelEdit = () => {
    // Reload original data if needed
    // For simplicity, we're just exiting edit mode
    setEditMode(false);
  };

  // New functions for gallery editing
  const openGalleryModal = () => {
    // Initialize the temporary order with current images
    setTempImagesOrder([...workData.images]);
    setIsGalleryModalOpen(true);
    setGalleryModalAnimated(false); // Reset animation state
  };

  const closeGalleryModal = () => {
    setIsGalleryModalOpen(false);
    setGalleryModalAnimated(false); // Reset animation state
  };

  const applyGalleryChanges = () => {
    // Update the work data with the new image order
    setWorkData((prevData) => ({
      ...prevData,
      images: tempImagesOrder,
    }));

    // Close the modal
    closeGalleryModal();

    // Show confirmation toast
    toast.info("Gallery order updated", {
      position: "top-center",
      autoClose: 2000,
    });
  };

  // Handle drag end for the gallery items
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tempImagesOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTempImagesOrder(items);
  };

  // Fetch available images from API
  const fetchAvailableImages = async () => {
    setLoadingImages(true);
    try {
      const response = await mediaAPI.getAll({
        type: "image",
        per_page: 50, // Adjust as needed
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

  // Open add gallery item modal
  const openAddGalleryModal = () => {
    setIsAddGalleryModalOpen(true);
    setSelectedImageType("full-width");
    setSelectedImages([]);
    setEditingGalleryItem(null);
    fetchAvailableImages();
  };

  // Close add gallery item modal
  const closeAddGalleryModal = () => {
    setIsAddGalleryModalOpen(false);
    setSelectedImages([]);
    setEditingGalleryItem(null);
  };

  // Handle image selection for gallery item
  const handleImageSelection = (image) => {
    const currentType = IMAGE_TYPES.find(
      (type) => type.value === selectedImageType
    );
    const maxImages = currentType.imageCount;

    if (selectedImages.find((img) => img.id === image.id)) {
      // Remove image if already selected
      setSelectedImages(selectedImages.filter((img) => img.id !== image.id));
    } else if (selectedImages.length < maxImages) {
      // Add image if under limit
      setSelectedImages([...selectedImages, image]);
    } else {
      toast.warn(`You can only select ${maxImages} image(s) for this type`);
    }
  };

  // Handle image type change
  const handleImageTypeChange = (newType) => {
    const newTypeConfig = IMAGE_TYPES.find((type) => type.value === newType);
    setSelectedImageType(newType);

    // Trim selected images if new type requires fewer images
    if (selectedImages.length > newTypeConfig.imageCount) {
      setSelectedImages(selectedImages.slice(0, newTypeConfig.imageCount));
    }
  };

  // Add new gallery item
  const addGalleryItem = () => {
    const currentType = IMAGE_TYPES.find(
      (type) => type.value === selectedImageType
    );

    if (selectedImages.length !== currentType.imageCount) {
      toast.error(
        `Please select exactly ${currentType.imageCount} image(s) for ${currentType.label}`
      );
      return;
    }

    const newItem = {
      id: `new-${Date.now()}`,
      type: selectedImageType,
      imageUrl:
        currentType.imageCount === 1
          ? mediaAPI.getDirectUrl(selectedImages[0].path)
          : selectedImages.map((img) => mediaAPI.getDirectUrl(img.path)),
    };

    setTempImagesOrder([...tempImagesOrder, newItem]);
    closeAddGalleryModal();

    toast.success("Gallery item added successfully");
  };

  // Edit existing gallery item
  const editGalleryItem = (item, index) => {
    setEditingGalleryItem({ ...item, index });
    setSelectedImageType(item.type);
    setIsAddGalleryModalOpen(true);

    // Clear selected images initially - they will be populated by useEffect
    setSelectedImages([]);

    fetchAvailableImages();
  };

  // Update existing gallery item
  const updateGalleryItem = () => {
    if (!editingGalleryItem) return;

    const currentType = IMAGE_TYPES.find(
      (type) => type.value === selectedImageType
    );

    if (selectedImages.length !== currentType.imageCount) {
      toast.error(
        `Please select exactly ${currentType.imageCount} image(s) for ${currentType.label}`
      );
      return;
    }

    const updatedItem = {
      ...editingGalleryItem,
      type: selectedImageType,
      imageUrl:
        currentType.imageCount === 1
          ? mediaAPI.getDirectUrl(selectedImages[0].path)
          : selectedImages.map((img) => mediaAPI.getDirectUrl(img.path)),
    };

    const newTempOrder = [...tempImagesOrder];
    newTempOrder[editingGalleryItem.index] = updatedItem;
    setTempImagesOrder(newTempOrder);

    closeAddGalleryModal();
    toast.success("Gallery item updated successfully");
  };

  // Remove gallery item
  const removeGalleryItem = (index) => {
    const newTempOrder = tempImagesOrder.filter((_, i) => i !== index);
    setTempImagesOrder(newTempOrder);
    setIsRemoveConfirmOpen(false);
    setRemoveItemIndex(null);
    toast.info("Gallery item removed");
  };

  // Show remove confirmation
  const showRemoveConfirmation = (index) => {
    setRemoveItemIndex(index);
    setIsRemoveConfirmOpen(true);
  };

  // Cancel remove confirmation
  const cancelRemoveConfirmation = () => {
    setIsRemoveConfirmOpen(false);
    setRemoveItemIndex(null);
  };

  // Credit removal confirmation functions
  const showCreditRemoveConfirmation = (index) => {
    setRemoveCreditIndex(index);
    setIsCreditRemoveConfirmOpen(true);
  };

  const cancelCreditRemoveConfirmation = () => {
    setIsCreditRemoveConfirmOpen(false);
    setRemoveCreditIndex(null);
  };

  const confirmCreditRemoval = (index) => {
    const updatedCredits = workData.credits.filter((_, i) => i !== index);
    setWorkData((prevData) => ({
      ...prevData,
      credits: updatedCredits,
    }));
    setIsCreditRemoveConfirmOpen(false);
    setRemoveCreditIndex(null);
    toast.info("Credit removed successfully");
  };

  // Hero banner image editing functions
  const openHeroBannerModal = () => {
    setIsHeroBannerModalOpen(true);
    setSelectedHeroBannerImage(null);
    fetchAvailableImages();
  };

  const closeHeroBannerModal = () => {
    setIsHeroBannerModalOpen(false);
    setSelectedHeroBannerImage(null);
  };

  const handleHeroBannerImageSelection = (image) => {
    setSelectedHeroBannerImage(image);
  };

  const updateHeroBannerImage = () => {
    if (!selectedHeroBannerImage) {
      toast.error("Please select an image for the hero banner");
      return;
    }

    const imageUrl = mediaAPI.getDirectUrl(selectedHeroBannerImage.path);

    setWorkData((prevData) => ({
      ...prevData,
      heroBannerImage: imageUrl,
    }));

    closeHeroBannerModal();
    toast.success("Hero banner image updated successfully");
  };

  // Video project editing functions
  const openVideoProjectModal = () => {
    setIsVideoProjectModalOpen(true);
    setSelectedVideoProject(null);
    fetchAvailableVideos();
  };

  const closeVideoProjectModal = () => {
    setIsVideoProjectModalOpen(false);
    setSelectedVideoProject(null);
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
    }));

    closeVideoProjectModal();
    toast.success("Video project updated successfully");
  };

  // Fetch available videos from API
  const fetchAvailableVideos = async () => {
    setLoadingVideos(true);
    try {
      const response = await mediaAPI.getAll({
        type: "video",
        per_page: 50, // Adjust as needed
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

  // Function to render images based on their type
  const renderImage = (type, imageUrl) => {
    switch (type) {
      case "full-width":
        return (
          <div className="w-full">
            <img
              src={imageUrl}
              alt={workData.title}
              className="w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleImageClick(imageUrl)}
            />
          </div>
        );
      case "2col-full":
        return (
          <div className="grid grid-cols-2 lg:gap-5 gap-[10px]">
            {imageUrl.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={workData.title}
                className="w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(imageUrl, index)}
              />
            ))}
          </div>
        );
      case "compare-full":
        return (
          <div className="w-full relative">
            {/* Create a proper sticky container with background */}
            <div className="sticky top-[62px] z-20 w-full bg-opacity-10 pt-4 px-4">
              <div className="flex justify-between items-center">
                {sliderPosition !== 0 && (
                  <button
                    onClick={() => !isAnimating && animateSlider(100)}
                    className="bg-black bg-opacity-70 text-white lg:px-3 px-2 py-1 lg:text-sm text-xs font-medium rounded transition-opacity duration-300"
                    disabled={isAnimating}
                  >
                    BEFORE
                  </button>
                )}

                {sliderPosition < 99 && (
                  <button
                    onClick={() => !isAnimating && animateSlider(0)}
                    className="bg-black bg-opacity-70 text-white lg:px-3 px-2 py-1 lg:text-sm text-xs font-medium rounded transition-opacity duration-300 ml-auto"
                    disabled={isAnimating}
                  >
                    AFTER
                  </button>
                )}
              </div>
            </div>

            {/* The compare slider below the sticky header */}
            <div className="mt-[-40px]">
              <div
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(imageUrl)}
              >
                <ReactCompareSlider
                  itemOne={
                    <ReactCompareSliderImage
                      src={imageUrl[0]}
                      alt="Before"
                      className="w-full object-cover"
                    />
                  }
                  itemTwo={
                    <ReactCompareSliderImage
                      src={imageUrl[1]}
                      alt="After"
                      className="w-full object-cover"
                    />
                  }
                  position={sliderPosition}
                  onPositionChange={(position) => {
                    if (!isAnimating) {
                      setSliderPosition(position);
                    }
                  }}
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                  onlyHandleDraggable={true}
                />
              </div>
            </div>
          </div>
        );
      case "2col-4:5":
        return (
          <div className="grid grid-cols-2 lg:gap-5 gap-[10px]">
            {imageUrl.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={workData.title}
                className="w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(imageUrl, index)}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  // Function to get a preview thumbnail for any image type
  const getImageThumbnail = (image) => {
    if (typeof image.imageUrl === "string") {
      return image.imageUrl;
    } else if (Array.isArray(image.imageUrl) && image.imageUrl.length > 0) {
      return image.imageUrl[0];
    }
    return "/placeholder.jpg"; // Fallback
  };

  // Function to render thumbnails for gallery items in editor
  const renderGalleryThumbnails = (image) => {
    if (image.type === "full-width") {
      console.log(image)
      // Single thumbnail for full-width
      return (
        <div className="w-24 h-24 overflow-hidden rounded-lg flex-shrink-0">
          <img
            src={getImageThumbnail(image)}
            alt="Gallery item"
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else {
      // Multiple thumbnails for other types
      const imageUrls = Array.isArray(image.imageUrl) ? image.imageUrl : [image.imageUrl];
      return (
        <div className="flex gap-2 flex-shrink-0">
          {imageUrls.slice(0, 2).map((url, index) => (
            <div key={index} className="w-12 h-12 overflow-hidden rounded-lg">
              <img
                src={url}
                alt={`Gallery item ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {imageUrls.length > 2 && (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                +{imageUrls.length - 2}
              </span>
            </div>
          )}
        </div>
      );
    }
  };

  // Function to get a human-readable gallery type
  const getGalleryTypeLabel = (type) => {
    switch (type) {
      case "full-width":
        return "Full Width Image";
      case "2col-full":
        return "Two Column Layout";
      case "compare-full":
        return "Before/After Comparison";
      case "2col-4:5":
        return "Two Column 4:5 Layout";
      default:
        return type;
    }
  };

  // Add this gallery editor modal component
  const GalleryEditorModal = () => {
    if (!isGalleryModalOpen) return null;

    // Trigger animation only once when modal opens
    useEffect(() => {
      if (isGalleryModalOpen && !galleryModalAnimated) {
        setGalleryModalAnimated(true);
      }
    }, [isGalleryModalOpen, galleryModalAnimated]);

    return (
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
          !galleryModalAnimated ? "animate-fadeIn" : ""
        }`}
      >
        <div
          className={`bg-white w-full h-full flex flex-col ${
            !galleryModalAnimated ? "animate-slideUpFromBottom" : ""
          }`}
        >
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-medium">Edit Project Gallery</h3>
            <button
              onClick={closeGalleryModal}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="overflow-y-auto p-6 flex-grow">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500">
                Drag items to reorder your project gallery.
              </p>
              <button
                onClick={openAddGalleryModal}
                className="bg-black text-white px-4 py-3 rounded-md flex items-center hover:bg-gray-800 transition-colors"
              >
                <FiPlusCircle className="mr-2" size={18} />
                Add Gallery Item
              </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="gallery-items">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4"
                  >
                    {tempImagesOrder.map((image, index) => (
                      <Draggable
                        key={image.id}
                        draggableId={image.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center bg-white border rounded-lg p-4 ${
                              snapshot.isDragging ? "shadow-lg" : ""
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="mr-4 text-gray-500 cursor-move"
                            >
                              <FiMove size={24} />
                            </div>

                            {renderGalleryThumbnails(image)}

                            <div className="ml-4 flex-grow">
                              <div className="font-medium text-lg">
                                {getGalleryTypeLabel(image.type)}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                                Position {index + 1}
                              </div>
                              <button
                                onClick={() => editGalleryItem(image, index)}
                                className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                title="Edit"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                onClick={() => showRemoveConfirmation(index)}
                                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="Remove"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 mr-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              onClick={closeGalleryModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-3 text-sm font-semibold rounded-md bg-black text-white hover:bg-gray-800 transition-colors"
              onClick={applyGalleryChanges}
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Remove Confirmation Modal Component
  const RemoveConfirmationModal = () => {
    if (!isRemoveConfirmOpen || removeItemIndex === null) return null;

    const itemToRemove = tempImagesOrder[removeItemIndex];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70]">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-fadeIn">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <FiTrash2 className="text-red-600" size={24} />
            </div>

            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Remove Gallery Item
            </h3>

            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to remove this gallery item?
            </p>

            {/* Preview of item being removed */}
            {itemToRemove && (
              <div className="flex items-center bg-gray-50 rounded-lg p-3 mb-6">
                {renderGalleryThumbnails(itemToRemove)}
                <div className="ml-3 flex-grow">
                  <div className="font-medium text-sm">
                    {getGalleryTypeLabel(itemToRemove.type)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Position {removeItemIndex + 1}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={cancelRemoveConfirmation}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                onClick={() => removeGalleryItem(removeItemIndex)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Credit Remove Confirmation Modal Component
  const CreditRemoveConfirmationModal = () => {
    if (!isCreditRemoveConfirmOpen || removeCreditIndex === null) return null;

    const creditToRemove = workData.credits[removeCreditIndex];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70]">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-fadeIn">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <FiTrash2 className="text-red-600" size={24} />
            </div>

            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Remove Credit
            </h3>

            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to remove this credit?
            </p>

            {/* Preview of credit being removed */}
            {creditToRemove && (
              <div className="flex items-center bg-gray-50 rounded-lg p-3 mb-6">
                <div className="ml-3 flex-grow">
                  <div className="font-medium text-sm">
                    {creditToRemove.role || 'Unnamed Role'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {creditToRemove.name.join(', ') || 'No names'}
                  </div>
                  <div className="text-xs text-gray-400">
                    Position {removeCreditIndex + 1}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={cancelCreditRemoveConfirmation}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                onClick={() => confirmCreditRemoval(removeCreditIndex)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add Gallery Item Modal Component
  const AddGalleryItemModal = () => {
    if (!isAddGalleryModalOpen) return null;

    const currentTypeConfig = IMAGE_TYPES.find(
      (type) => type.value === selectedImageType
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="bg-white w-full h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-medium">
              {editingGalleryItem ? "Edit Gallery Item" : "Add Gallery Item"}
            </h3>
            <button
              onClick={closeAddGalleryModal}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="overflow-y-auto p-6 flex-grow">
            {/* Image Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Type
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {IMAGE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleImageTypeChange(type.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedImageType === type.value
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {type.imageCount} image{type.imageCount > 1 ? "s" : ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Existing Images Section (only shown when editing) */}
            {editingGalleryItem && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Images
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  {editingGalleryItem.type === "full-width" ? (
                    // Single image display
                    <div className="w-32 h-32 overflow-hidden rounded-lg">
                      <img
                        src={editingGalleryItem.imageUrl}
                        alt="Current image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    // Multiple images display
                    <div className="flex gap-3 flex-wrap">
                      {Array.isArray(editingGalleryItem.imageUrl) 
                        ? editingGalleryItem.imageUrl.map((url, index) => (
                            <div key={index} className="w-24 h-24 overflow-hidden rounded-lg">
                              <img
                                src={url}
                                alt={`Current image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))
                        : (
                            <div className="w-24 h-24 overflow-hidden rounded-lg">
                              <img
                                src={editingGalleryItem.imageUrl}
                                alt="Current image"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )
                      }
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    These are the current images. Select new images below to replace them.
                  </p>
                </div>
              </div>
            )}

            {/* Upload New Images Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload New Images
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
              >
                <FiUpload className="mx-auto text-3xl text-gray-400 mb-3" />
                <p className="text-gray-600 mb-2">Drag and drop images here, or</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="gallery-upload"
                />
                <label
                  htmlFor="gallery-upload"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer inline-block"
                >
                  Browse Images
                </label>
                <p className="text-xs text-gray-500 mt-2">Only image files are allowed</p>
                
                {isUploading && (
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Images ({selectedImages.length}/
                  {currentTypeConfig.imageCount})
                </label>
                <div className="flex gap-3 flex-wrap">
                  {selectedImages.map((image, index) => (
                    <div key={image.id} className="relative">
                      <img
                        src={mediaAPI.getDirectUrl(image.path)}
                        alt={image.alt_text || image.original_name}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => handleImageSelection(image)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Selection Grid */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Images from Gallery
                {currentTypeConfig && (
                  <span className="text-gray-500 text-xs ml-2">
                    (Select {currentTypeConfig.imageCount} image
                    {currentTypeConfig.imageCount > 1 ? "s" : ""})
                  </span>
                )}
              </label>

              {loadingImages ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  <p className="mt-2 text-gray-500">Loading images...</p>
                </div>
              ) : availableImages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiImage size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No images found in your media gallery.</p>
                  <p className="text-sm">
                    Upload some images first to use them in your project
                    gallery.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto">
                  {availableImages.map((image) => {
                    const isSelected = selectedImages.find(
                      (img) => img.id === image.id
                    );
                    const canSelect =
                      selectedImages.length < currentTypeConfig.imageCount ||
                      isSelected;

                    return (
                      <div
                        key={image.id}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected
                            ? "border-black ring-2 ring-black ring-opacity-50"
                            : canSelect
                            ? "border-gray-200 hover:border-gray-400"
                            : "border-gray-200 opacity-50 cursor-not-allowed"
                        }`}
                        onClick={() => canSelect && handleImageSelection(image)}
                      >
                        <img
                          src={mediaAPI.getDirectUrl(image.path)}
                          alt={image.alt_text || image.original_name}
                          className="w-full h-20 object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <FiCheck className="text-white" size={20} />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                          <div className="text-white text-xs truncate">
                            {image.original_name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 mr-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              onClick={closeAddGalleryModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-3 text-sm font-semibold rounded-md bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={editingGalleryItem ? updateGalleryItem : addGalleryItem}
              disabled={
                !currentTypeConfig ||
                selectedImages.length !== currentTypeConfig.imageCount
              }
            >
              {editingGalleryItem ? "Update Item" : "Add Item"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Hero Banner Image Editor Modal Component
  const HeroBannerEditorModal = () => {
    if (!isHeroBannerModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="bg-white w-full h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-medium">Edit Hero Banner Image</h3>
            <button
              onClick={closeHeroBannerModal}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="overflow-y-auto p-6 flex-grow">
            {/* Current Hero Banner Preview */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Hero Banner
              </label>
              <div className="w-full h-48 overflow-hidden rounded-lg border">
                <img
                  src={workData.heroBannerImage}
                  alt="Current hero banner"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Upload New Image Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload New Image
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
              >
                <FiUpload className="mx-auto text-3xl text-gray-400 mb-3" />
                <p className="text-gray-600 mb-2">Drag and drop images here, or</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="hero-banner-upload"
                />
                <label
                  htmlFor="hero-banner-upload"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer inline-block"
                >
                  Browse Images
                </label>
                <p className="text-xs text-gray-500 mt-2">Only image files are allowed</p>
                
                {isUploading && (
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Image Preview */}
            {selectedHeroBannerImage && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Image
                </label>
                <div className="flex items-center bg-gray-50 rounded-lg p-3">
                  <div className="w-20 h-20 overflow-hidden rounded-md flex-shrink-0">
                    <img
                      src={mediaAPI.getDirectUrl(
                        selectedHeroBannerImage.path
                      )}
                      alt={
                        selectedHeroBannerImage.alt_text ||
                        selectedHeroBannerImage.original_name
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-grow">
                    <div className="font-medium text-sm">
                      {selectedHeroBannerImage.original_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedHeroBannerImage.alt_text && (
                        <span>{selectedHeroBannerImage.alt_text}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedHeroBannerImage(null)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Image Selection Grid */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Hero Banner Image from Gallery
              </label>

              {loadingImages ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  <p className="mt-2 text-gray-500">Loading images...</p>
                </div>
              ) : availableImages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiImage size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No images found in your media gallery.</p>
                  <p className="text-sm">
                    Upload some images first to use as hero banner.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
                  {availableImages.map((image) => {
                    const isSelected = selectedHeroBannerImage?.id === image.id;

                    return (
                      <div
                        key={image.id}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected
                            ? "border-black ring-2 ring-black ring-opacity-50"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        onClick={() => handleHeroBannerImageSelection(image)}
                      >
                        <img
                          src={mediaAPI.getDirectUrl(image.path)}
                          alt={image.alt_text || image.original_name}
                          className="w-full h-24 object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <FiCheck className="text-white" size={20} />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                          <div className="text-white text-xs truncate">
                            {image.original_name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 mr-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              onClick={closeHeroBannerModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-3 text-sm font-semibold rounded-md bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={updateHeroBannerImage}
              disabled={!selectedHeroBannerImage}
            >
              Update Hero Banner
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Video Project Editor Modal Component
  const VideoProjectEditorModal = () => {
    if (!isVideoProjectModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="bg-white w-full h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-medium">Select Project Video</h3>
            <button
              onClick={closeVideoProjectModal}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="overflow-y-auto p-6 flex-grow">
            {/* Current Video Preview */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Project Video
              </label>
              <div className="w-full h-48 overflow-hidden rounded-lg border bg-black flex items-center justify-center">
                {workData.videoProjectSrc ? (
                  <video
                    src={workData.videoProjectSrc}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <div className="text-white text-center">
                    <FiUpload className="mx-auto mb-2" size={32} />
                    <p>No video selected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload New Video Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload New Video
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleVideoDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
              >
                <FiUpload className="mx-auto text-3xl text-gray-400 mb-3" />
                <p className="text-gray-600 mb-2">Drag and drop videos here, or</p>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleVideoUpload(e.target.files)}
                  className="hidden"
                  id="video-project-upload"
                />
                <label
                  htmlFor="video-project-upload"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer inline-block"
                >
                  Browse Videos
                </label>
                <p className="text-xs text-gray-500 mt-2">Only video files are allowed</p>
                
                {isUploading && (
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Video Preview */}
            {selectedVideoProject && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Video
                </label>
                <div className="flex items-center bg-gray-50 rounded-lg p-3">
                  <div className="w-20 h-20 overflow-hidden rounded-md flex-shrink-0 bg-black flex items-center justify-center">
                    {selectedVideoProject.poster_url ? (
                      // Display poster image if available
                      <img
                        src={selectedVideoProject.poster_url}
                        alt={selectedVideoProject.original_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Fall back to video preview
                      <video
                        src={mediaAPI.getDirectUrl(selectedVideoProject.path)}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    )}
                  </div>
                  <div className="ml-3 flex-grow">
                    <div className="font-medium text-sm">
                      {selectedVideoProject.original_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedVideoProject.alt_text && (
                        <span>{selectedVideoProject.alt_text}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVideoProject(null)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Video Selection Grid */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project Video from Gallery
              </label>

              {loadingVideos ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  <p className="mt-2 text-gray-500">Loading videos...</p>
                </div>
              ) : availableVideos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiUpload size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No videos found in your media gallery.</p>
                  <p className="text-sm">
                    Upload some videos first to use as project video.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
                  {availableVideos.map((video) => {
                    const isSelected = selectedVideoProject?.id === video.id;

                    return (
                      <div
                        key={video.id}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected
                            ? "border-black ring-2 ring-black ring-opacity-50"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        onClick={() => handleVideoProjectSelection(video)}
                      >
                        <div className="w-full h-24 bg-black flex items-center justify-center relative">
                          {video.poster_url ? (
                            // Display poster image if available
                            <img
                              src={video.poster_url}
                              alt={video.original_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            // Fall back to video preview
                            <video
                              src={mediaAPI.getDirectUrl(video.path)}
                              className="w-full h-full object-cover"
                              preload="metadata"
                              muted
                            />
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <FiUpload className="text-white" size={20} />
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <FiCheck className="text-white" size={20} />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                          <div className="text-white text-xs truncate">
                            {video.original_name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 mr-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              onClick={closeVideoProjectModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-3 text-sm font-semibold rounded-md bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={updateVideoProject}
              disabled={!selectedVideoProject}
            >
              Update Project Video
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ImagePopup component (same as frontsite-client)
  const ImagePopup = () => {
    if (!popupImage) return null;

    const isArrayImage = Array.isArray(popupImage);
    const currentImage = isArrayImage
      ? popupImage[popupImageIndex]
      : popupImage;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={closePopup}
      >
        <div className="relative max-w-full max-h-full">
          {/* Close button */}
          <button
            onClick={closePopup}
            className="absolute top-4 right-4 text-white text-2xl z-10 hover:opacity-70 transition-opacity"
          >
            ✕
          </button>

          {/* Navigation arrows for array images */}
          {isArrayImage && popupImage.length > 1 && (
            <>
              {popupImageIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopupImageIndex(popupImageIndex - 1);
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:opacity-70 transition-opacity z-10"
                >
                  ‹
                </button>
              )}
              {popupImageIndex < popupImage.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopupImageIndex(popupImageIndex + 1);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:opacity-70 transition-opacity z-10"
                >
                  ›
                </button>
              )}
            </>
          )}

          {/* Image counter for array images */}
          {isArrayImage && popupImage.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {popupImageIndex + 1} / {popupImage.length}
            </div>
          )}

          {/* Main image */}
          <img
            src={currentImage}
            alt={workData.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={styles.workDetail}>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="w-full mx-auto">
        <div
          className={`hero-banner-section w-full bg-black text-white relative ${styles.heroBanner} lg:mb-5 mb-[10px]`}
          style={{
            height:
              deviceType === "desktop"
                ? "calc(100vh - 62px)"
                : "calc(100vh - 66px)",
            backgroundImage: `url(${workData.heroBannerImage})`,
            backgroundSize:
              deviceType === "desktop" ? "100% auto" : "auto 100%",
            backgroundPosition:
              deviceType === "desktop" ? `center 0px` : "center 0px",
            backgroundRepeat: "no-repeat",
          }}
        ></div>

        {/* Sticky Hero Banner Edit Button */}
        {editMode && isHeroBannerVisible && (
          <button
            onClick={openHeroBannerModal}
            className={`fixed ${heroBannerButtonBg} px-4 py-3 rounded-lg flex items-center hover:opacity-90 transition-all shadow-lg backdrop-blur-sm z-50`}
            style={{
              top: deviceType === "desktop" ? "120px" : "90px", // 62px nav + 24px padding for desktop, 66px nav + 24px padding for mobile
              right: "20px",
            }}
          >
            <FiEdit className="mr-2" size={16} />
            Edit Hero Banner
          </button>
        )}

        {/* Tags Section */}
        <div className="w-full px-5">
          <div className="flex gap-2 flex-wrap">
            <div className="font-semibold text-white bg-black px-2 py-1 rounded-[4px]">
              #
            </div>
            {editMode ? (
              <>
                {AVAILABLE_TAGS.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      handleTagToggle(tag, !workData.tag.includes(tag))
                    }
                    className={`font-semibold px-2 py-1 rounded-[4px] transition-colors ${
                      workData.tag.includes(tag)
                        ? "text-white bg-black"
                        : "text-black bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                <div className="text-xs text-gray-500 flex items-center ml-2">
                  Click tag to select or unselect
                </div>
              </>
            ) : (
              workData.tag.map((item, index) => (
                <div
                  key={index}
                  className="font-semibold text-white bg-black px-2 py-1 rounded-[4px]"
                >
                  {item}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-full lg:text-[20px] text-[14px] text-black mx-auto px-5 flex my-[20px] lg:justify-end lg:flex-row flex-col-reverse border-b">
          <div className="w-full border-t lg:border-t-0 border-b border-black">
            <FadeInSection delay={0.3}>
              <div className="w-full flex border-b border-black py-2 lg:py-5">
                <div className="w-[68px] lg:mr-[60px] mr-[24px]">CLIENT</div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] font-medium">
                  {editMode ? (
                    <input
                      type="text"
                      value={workData.client}
                      onChange={(e) =>
                        handleFieldChange("client", e.target.value)
                      }
                      className="w-full p-1 focus:outline-none bg-gray-50"
                    />
                  ) : (
                    workData.client
                  )}
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.3}>
              <div className="w-full flex border-b border-black py-2 lg:py-5">
                <div className="w-[68px] lg:mr-[60px] mr-[24px]">TITLE</div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] font-medium">
                  {editMode ? (
                    <input
                      type="text"
                      value={workData.title}
                      onChange={(e) =>
                        handleFieldChange("title", e.target.value)
                      }
                      className="w-full p-1 focus:outline-none bg-gray-50"
                    />
                  ) : (
                    workData.title
                  )}
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.3}>
              <div className="w-full flex border-b border-black py-2 lg:py-5">
                <div className="w-[68px] lg:mr-[60px] mr-[24px]">CATEGORY</div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] font-medium capitalize">
                  {editMode ? (
                    <select
                      value={workData.category}
                      onChange={(e) =>
                        handleFieldChange("category", e.target.value)
                      }
                      className="w-full p-1 focus:outline-none bg-gray-50"
                    >
                      <option value="film/series">film/series</option>
                      <option value="commercial">commercial</option>
                    </select>
                  ) : (
                    workData.category
                  )}
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.3}>
              <div className="w-full flex border-b border-black py-2 lg:py-5">
                <div className="w-[68px] lg:mr-[60px] mr-[24px]">DESC.</div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] text-justify font-medium">
                  {editMode ? (
                    <textarea
                      value={workData.description}
                      onChange={(e) =>
                        handleFieldChange("description", e.target.value)
                      }
                      className="w-full p-1 focus:outline-none bg-gray-50 min-h-[100px] resize-vertical"
                      placeholder="Project description..."
                    />
                  ) : (
                    workData.description
                  )}
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.3}>
              <div className="w-full flex pt-2 lg:pt-5">
                <div className="w-[68px] lg:mr-[60px] mr-[24px]">CREDITS</div>
                <div className="w-full font-medium">
                  {workData.credits.map((creditsItem, index) => (
                    <div
                      key={index}
                      className={`w-full ${
                        workData.credits.length - 1 !== index
                          ? "pb-2 border-b border-black lg:pb-5 mb-2 lg:mb-5"
                          : "pb-2 border-b border-black lg:pb-5"
                      }`}
                    >
                      <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] grid grid-cols-2 gap-2">
                        <div className="w-full">
                          {editMode ? (
                            <input
                              type="text"
                              value={creditsItem.role}
                              onChange={(e) =>
                                handleCreditChange(
                                  index,
                                  "role",
                                  e.target.value
                                )
                              }
                              className="w-full p-1 focus:outline-none bg-gray-50"
                              placeholder="Role"
                            />
                          ) : (
                            creditsItem.role
                          )}
                        </div>
                        <div className="w-full grid grid-cols-1 gap-y-4">
                          {creditsItem.name.map((item, nameIndex) => (
                            <div
                              key={nameIndex}
                              className="flex items-center gap-2"
                            >
                              {editMode ? (
                                <>
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) =>
                                      handleCreditNameChange(
                                        index,
                                        nameIndex,
                                        e.target.value
                                      )
                                    }
                                    className="flex-1 p-1 focus:outline-none bg-gray-50"
                                    placeholder="Name"
                                  />
                                  <button
                                    onClick={() =>
                                      removeCreditName(index, nameIndex)
                                    }
                                    className="text-red-500 hover:text-red-700"
                                    disabled={creditsItem.name.length === 1}
                                    style={{
                                      display: workData.credits.length === 1 ? 'none' : 'block'
                                    }}
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </>
                              ) : (
                                item
                              )}
                            </div>
                          ))}
                          {editMode && (
                            <button
                              onClick={() => addCreditName(index)}
                              className="text-xs text-gray-500 hover:text-gray-700 text-left"
                            >
                              + Add name
                            </button>
                          )}
                        </div>
                        {editMode && (
                          <div className="col-span-2 mt-2">
                            <button
                              onClick={() => removeCredit(index)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove this credit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {editMode && (
                    <button
                      onClick={addCredit}
                      className="mt-4 flex items-center text-black hover:text-gray-700"
                    >
                      <FiPlusCircle className="mr-2" />
                      <span>Add Credit</span>
                    </button>
                  )}
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.3}>
              <div className="w-full flex border-b border-black py-2 lg:py-5">
                <div className="w-[68px] lg:mr-[52px] mr-[24px]">©</div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] font-medium">
                  {editMode ? (
                    <input
                      type="text"
                      value={workData.year}
                      onChange={(e) =>
                        handleFieldChange("year", e.target.value)
                      }
                      className="w-full p-1 focus:outline-none bg-gray-50"
                      placeholder="Year"
                    />
                  ) : (
                    workData.year
                  )}
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>

        {/* Video Project Section */}
        <FadeInSection delay={0.3}>
          <div id="Video Project" className="lg:mb-[10px] mb-[10px]">
            {editMode && (
              <div className="px-5 mb-8 mt-16 lg:max-w-[50%]">
                <label className="text-lg font-medium text-black mb-2 block">
                  Project Video:
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={openVideoProjectModal}
                    className="bg-black text-white px-4 py-2 rounded flex items-center hover:bg-gray-800 transition-colors"
                  >
                    <FiUpload className="mr-2" size={16} />
                    Select Video from Gallery
                  </button>
                  {workData.videoProjectSrc && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span>Current: </span>
                      <span className="ml-1 max-w-xs truncate">
                        {workData.videoProjectSrc.split('/').pop() || 'Selected video'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div
              className="relative w-full"
              style={{
                paddingBottom:
                  deviceType === "desktop"
                    ? "calc(56.25% - 62px)"
                    : "calc(86.25% - 62px)",
              }}
            >
              <video
                className="absolute top-0 left-0 w-full h-full object-cover"
                src={workData.videoProjectSrc}
                controls
                controlsList="nodownload noplaybackrate"
                playsInline
                preload="metadata"
                style={{ borderRadius: "0px" }}
                onError={(e) => {
                  console.log("Showreel video failed to load:", e);
                }}
                onLoadedData={() => {
                  console.log("Showreel video loaded successfully");
                }}
                onPlay={(e) => {
                  // Auto fullscreen when video starts playing
                  if (e.target.requestFullscreen) {
                    e.target.requestFullscreen().catch((err) => {
                      console.log("Fullscreen request failed:", err);
                    });
                  } else if (e.target.webkitRequestFullscreen) {
                    e.target.webkitRequestFullscreen();
                  } else if (e.target.msRequestFullscreen) {
                    e.target.msRequestFullscreen();
                  }
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </FadeInSection>

        {/* Project Details */}
        <div className="w-full mx-auto lg:px-5" id="project-images-showcase">
          {workData.images.map((image) => (
            <div key={image.id} className="lg:mb-5 mb-[10px]">
              <FadeInSection delay={0.3}>
                {renderImage(image.type, image.imageUrl)}
              </FadeInSection>
            </div>
          ))}
        </div>
      </div>

      {/* Floating edit button bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white z-50 shadow-lg border-t border-gray-200 transition-transform duration-300`}
      >
        <div className=" mx-auto px-5 py-3 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {editMode ? (
              <div>
                <div className="font-medium">Editing work details</div>
                <div className="text-xs">
                  Edit: Title, Client, Category, Description, Tags, Video URL,
                  Credits & Gallery
                </div>
              </div>
            ) : (
              "View mode - Click 'Edit Work' to modify content"
            )}
          </div>
          <div className="flex gap-3">
            {editMode ? (
              <>
                <button
                  onClick={openGalleryModal}
                  className="px-4 py-2 bg-gray-100 rounded-md text-gray-800 hover:bg-gray-200 flex items-center"
                >
                  <FiImage className="mr-2" />
                  Edit Project Gallery
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-200 rounded-md text-gray-800 flex items-center"
                >
                  <FiX className="mr-2" />
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  className="px-4 py-2 bg-black text-white rounded-md flex items-center"
                >
                  <FiSave className="mr-2" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-black hover:text-white transition-colors rounded-md flex items-center"
              >
                <FiEdit className="mr-2" />
                Edit Work
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add the gallery editor modal component */}
      <GalleryEditorModal />

      {/* Add gallery item modal component */}
      <AddGalleryItemModal />

      {/* Remove confirmation modal component */}
      <RemoveConfirmationModal />

      {/* Credit removal confirmation modal component */}
      <CreditRemoveConfirmationModal />

      {/* Hero banner editor modal component */}
      <HeroBannerEditorModal />

      {/* Video project editor modal component */}
      <VideoProjectEditorModal />

      {/* Image popup modal */}
      <ImagePopup />
    </div>
  );
};

export default WorkDetail;
