import { useState, useEffect, useCallback } from "react";
import { mediaAPI } from "../../../../api";

/**
 * Custom hook for managing video selection with search, sort, and pagination in modals
 */
export const useModalVideoSelection = () => {
  const [availableVideos, setAvailableVideos] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  // Load videos from API with filters
  const fetchAvailableVideos = useCallback(async (page = currentPage) => {
    try {
      setLoadingVideos(true);
      
      const params = {
        page: page,
        search: searchQuery,
        sort_by: sortBy,
        sort_direction: sortDirection,
        per_page: perPage,
        type: "videos", // Backend now properly handles 'videos' type
      };

      // Remove empty parameters to keep the request clean
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await mediaAPI.getAll(params);
      
      if (response.success) {
        // Backend should now return videos only, no need for frontend filtering
        const videoData = response.data.data || [];
        
        // Debug logging to verify API filtering
        console.log('API Response - Videos found:', videoData.length);
        console.log('Video data:', videoData);
        
        setAvailableVideos(videoData);
        
        // Use pagination info directly from API response
        const paginationData = {
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || perPage,
          total: response.data.total || 0,
          from: response.data.from || 0,
          to: response.data.to || 0,
        };
        
        setPagination(paginationData);
        setCurrentPage(paginationData.current_page);
      } else {
        console.error("Failed to fetch videos:", response.error);
        setAvailableVideos([]);
        setPagination({});
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setAvailableVideos([]);
      setPagination({});
    } finally {
      setLoadingVideos(false);
    }
  }, [currentPage, searchQuery, sortBy, sortDirection, perPage]);

  // Page navigation handlers
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    fetchAvailableVideos(page);
  }, [fetchAvailableVideos]);

  const handleNextPage = useCallback(() => {
    if (currentPage < pagination.last_page) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchAvailableVideos(nextPage);
    }
  }, [currentPage, pagination.last_page, fetchAvailableVideos]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchAvailableVideos(prevPage);
    }
  }, [currentPage, fetchAvailableVideos]);

  const handlePerPageChange = useCallback((newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    // Fetch will be triggered by useEffect when perPage changes
  }, []);

  // Effect to refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchAvailableVideos(1);
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, sortBy, sortDirection, perPage, fetchAvailableVideos]);

  // Initial fetch
  useEffect(() => {
    fetchAvailableVideos(1);
  }, []);

  return {
    availableVideos,
    pagination,
    loadingVideos,
    currentPage,
    perPage,
    searchQuery,
    sortBy,
    sortDirection,
    setSearchQuery,
    setSortBy,
    setSortDirection,
    fetchAvailableVideos,
    handlePageChange,
    handleNextPage,
    handlePrevPage,
    handlePerPageChange,
  };
};