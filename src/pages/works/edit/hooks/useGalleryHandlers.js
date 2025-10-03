import { toast } from "react-toastify";
import { mediaAPI } from "../../../../api";

// Utility functions to manage body scroll
const disableBodyScroll = () => {
  document.body.style.overflow = 'hidden';
};

const enableBodyScroll = () => {
  document.body.style.overflow = 'unset';
};

// Gallery handling functions
export const useGalleryHandlers = (
  IMAGE_TYPES,
  workData,
  setWorkData,
  tempImagesOrder,
  setTempImagesOrder,
  selectedImages,
  setSelectedImages,
  selectedImageType,
  setSelectedImageType,
  setIsGalleryModalOpen,
  setGalleryModalAnimated,
  setIsAddGalleryModalOpen,
  setEditingGalleryItem,
  setIsRemoveConfirmOpen,
  setRemoveItemIndex,
  fetchAvailableImages,
  // Upload modal state
  setIsImageUploadModalOpen
) => {
  // Gallery editing functions
  const openGalleryModal = () => {
    setTempImagesOrder([...workData.images]);
    setIsGalleryModalOpen(true);
    setGalleryModalAnimated(false);
    disableBodyScroll();
  };

  const closeGalleryModal = () => {
    setIsGalleryModalOpen(false);
    setGalleryModalAnimated(false);
    enableBodyScroll();
  };

  const applyGalleryChanges = () => {
    setWorkData((prevData) => ({
      ...prevData,
      images: tempImagesOrder,
    }));

    closeGalleryModal();

    toast.info("Gallery order updated", {
      position: "top-center",
      autoClose: 2000,
    });
  };

  // Open add gallery item modal
  const openAddGalleryModal = () => {
    setIsAddGalleryModalOpen(true);
    setSelectedImageType("full-width");
    setSelectedImages([]);
    setEditingGalleryItem(null);
    // Don't disable body scroll here since Gallery Editor Modal is already handling it
    fetchAvailableImages();
  };

  // Close add gallery item modal
  const closeAddGalleryModal = () => {
    setIsAddGalleryModalOpen(false);
    setSelectedImages([]);
    setEditingGalleryItem(null);
    // Don't enable body scroll here since Gallery Editor Modal might still be open
    // Body scroll will be managed by the Gallery Editor Modal
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
    const editingItem = tempImagesOrder.find((_, index) => index === tempImagesOrder.findIndex(item => item.id === tempImagesOrder[0].id)); // This needs to be passed from the component
    if (!editingItem) return;

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
      ...editingItem,
      type: selectedImageType,
      imageUrl:
        currentType.imageCount === 1
          ? mediaAPI.getDirectUrl(selectedImages[0].path)
          : selectedImages.map((img) => mediaAPI.getDirectUrl(img.path)),
    };

    const newTempOrder = [...tempImagesOrder];
    const editingIndex = newTempOrder.findIndex(item => item.id === editingItem.id);
    newTempOrder[editingIndex] = updatedItem;
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
    enableBodyScroll();
    toast.info("Gallery item removed");
  };

  // Show remove confirmation
  const showRemoveConfirmation = (index) => {
    setRemoveItemIndex(index);
    setIsRemoveConfirmOpen(true);
    disableBodyScroll();
  };

  // Cancel remove confirmation
  const cancelRemoveConfirmation = () => {
    setIsRemoveConfirmOpen(false);
    setRemoveItemIndex(null);
    enableBodyScroll();
  };

  // Upload modal functions for gallery
  const openImageUploadModal = () => {
    setIsImageUploadModalOpen(true);
    disableBodyScroll();
  };

  const closeImageUploadModal = () => {
    setIsImageUploadModalOpen(false);
    enableBodyScroll();
  };

  return {
    openGalleryModal,
    closeGalleryModal,
    applyGalleryChanges,
    openAddGalleryModal,
    closeAddGalleryModal,
    handleImageSelection,
    handleImageTypeChange,
    addGalleryItem,
    editGalleryItem,
    updateGalleryItem,
    removeGalleryItem,
    showRemoveConfirmation,
    cancelRemoveConfirmation,
    // Upload modal functions
    openImageUploadModal,
    closeImageUploadModal,
  };
};