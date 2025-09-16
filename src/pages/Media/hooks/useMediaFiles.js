import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { mediaAPI } from "../../../api";

/**
 * Custom hook for managing media files data and API operations
 */
export const useMediaFiles = () => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");

  // Load media files from API
  const loadMediaFiles = async (page = currentPage) => {
    try {
      setIsLoading(true);
      
      const params = {
        page: page,
        search: searchQuery,
        sort_by: sortBy,
        sort_direction: sortDirection,
        per_page: perPage,
      };

      // Add type filter based on media type (backend supports 'type' parameter)
      if (mediaTypeFilter !== "all") {
        params.type = mediaTypeFilter;
      }

      const response = await mediaAPI.getAll(params);
      if (response.success) {
        setMediaFiles(response.data.data || []);
        setPagination(response.data);
        setCurrentPage(page);
      } else {
        toast.error("Failed to load media files");
      }
    } catch (error) {
      console.error("Error loading media files:", error);
      toast.error("Failed to load media files");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (
      page !== currentPage &&
      page >= 1 &&
      page <= (pagination.last_page || 1)
    ) {
      loadMediaFiles(page);
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
    loadMediaFiles(1);
  };

  // Handle file deletion
  const deleteMediaFile = async (id) => {
    try {
      const response = await mediaAPI.delete(id);
      if (response.success) {
        toast.success("File deleted successfully");
        loadMediaFiles(); // Reload the media list
        return true;
      } else {
        toast.error("Failed to delete file");
        return false;
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
      return false;
    }
  };

  // Load media files when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    loadMediaFiles(1);
  }, [searchQuery, sortBy, sortDirection, perPage, mediaTypeFilter]);

  return {
    // State
    mediaFiles,
    pagination,
    isLoading,
    currentPage,
    perPage,
    searchQuery,
    sortBy,
    sortDirection,
    mediaTypeFilter,
    
    // Setters
    setSearchQuery,
    setSortBy,
    setSortDirection,
    setMediaTypeFilter,
    
    // Actions
    loadMediaFiles,
    handlePageChange,
    handleNextPage,
    handlePrevPage,
    handlePerPageChange,
    deleteMediaFile,
  };
};