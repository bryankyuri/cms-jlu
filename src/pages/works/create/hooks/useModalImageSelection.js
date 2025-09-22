import { useState, useEffect, useCallback } from "react";
import { mediaAPI } from "../../../../api";

/**
 * Custom hook for managing image selection with search, sort, and pagination in modals
 */
export const useModalImageSelection = () => {
  const [availableImages, setAvailableImages] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loadingImages, setLoadingImages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  // Load images from API with filters
  const fetchAvailableImages = useCallback(async (page = currentPage) => {
    try {
      setLoadingImages(true);
      
      const params = {
        page: page,
        search: searchQuery,
        sort_by: sortBy,
        sort_direction: sortDirection,
        per_page: perPage,
        type: "images", // Always filter for images only
      };

      const response = await mediaAPI.getAll(params);
      if (response.success) {
        setAvailableImages(response.data.data || []);
        setPagination(response.data);
        setCurrentPage(page);
      } else {
        console.error("Failed to load images");
        setAvailableImages([]);
      }
    } catch (error) {
      console.error("Error loading images:", error);
      setAvailableImages([]);
    } finally {
      setLoadingImages(false);
    }
  }, [currentPage, searchQuery, sortBy, sortDirection, perPage]);

  // Handle pagination
  const handlePageChange = (page) => {
    if (
      page !== currentPage &&
      page >= 1 &&
      page <= (pagination.last_page || 1)
    ) {
      fetchAvailableImages(page);
    }
  };

  const handleNextPage = () => {
    if (currentPage < (pagination.last_page || 1)) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    fetchAvailableImages(1);
  };

  // Reset search and filters
  const resetFilters = () => {
    setSearchQuery("");
    setSortBy("created_at");
    setSortDirection("desc");
    setCurrentPage(1);
    setPerPage(20);
  };

  // Load images when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchAvailableImages(1);
  }, [searchQuery, sortBy, sortDirection, perPage]);

  return {
    // State
    availableImages,
    pagination,
    loadingImages,
    currentPage,
    perPage,
    searchQuery,
    sortBy,
    sortDirection,
    
    // Setters
    setSearchQuery,
    setSortBy,
    setSortDirection,
    
    // Actions
    fetchAvailableImages,
    handlePageChange,
    handleNextPage,
    handlePrevPage,
    handlePerPageChange,
    resetFilters,
  };
};