import { useState, useEffect } from "react";

/**
 * Custom hook for managing modal states and keyboard interactions
 */
export const useModalManager = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Handle delete file modal
  const handleDeleteFile = (id, filename) => {
    setFileToDelete({ id, filename });
    setIsDeleteModalOpen(true);
  };

  const cancelDeleteFile = () => {
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
  };

  // Handle keyboard interactions for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle delete modal
      if (isDeleteModalOpen) {
        if (e.key === "Escape") {
          cancelDeleteFile();
        }
      }

      // Handle upload modal
      if (isUploadModalOpen) {
        if (e.key === "Escape") {
          setIsUploadModalOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleteModalOpen, isUploadModalOpen]);

  return {
    // Upload Modal State
    isUploadModalOpen,
    setIsUploadModalOpen,
    
    // Delete Modal State
    isDeleteModalOpen,
    fileToDelete,
    setIsDeleteModalOpen,
    
    // Actions
    handleDeleteFile,
    cancelDeleteFile,
  };
};