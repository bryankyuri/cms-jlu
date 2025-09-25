import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { worksAPI, mediaAPI, videoBannerAPI } from '../../../api';

export const useVideoBannerData = () => {
  // Main data states
  const [banners, setBanners] = useState([]);
  const [publishedWorks, setPublishedWorks] = useState([]);
  const [videoLibrary, setVideoLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Works pagination and filtering states
  const [worksLoading, setWorksLoading] = useState(false);
  const [worksError, setWorksError] = useState(null);
  const [worksCurrentPage, setWorksCurrentPage] = useState(1);
  const [worksTotalPages, setWorksTotalPages] = useState(1);
  const [worksTotalWorks, setWorksTotalWorks] = useState(0);
  const [worksPerPage, setWorksPerPage] = useState(10);
  const [worksSearchQuery, setWorksSearchQuery] = useState("");
  const [worksCategoryFilter, setWorksCategoryFilter] = useState("all");
  const [worksTagsFilter, setWorksTagsFilter] = useState([]);
  
  // Video library pagination and filtering states
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosCurrentPage, setVideosCurrentPage] = useState(1);
  const [videosTotalPages, setVideosTotalPages] = useState(1);
  const [videosTotalVideos, setVideosTotalVideos] = useState(0);
  const [videosPerPage, setVideosPerPage] = useState(12);
  const [videosSearchQuery, setVideosSearchQuery] = useState("");
  const [videosSortBy, setVideosSortBy] = useState("created_at");
  const [videosSortOrder, setVideosSortOrder] = useState("desc");
  
  // Track if videos have been initially loaded (when modal first opens)
  const [videosInitialized, setVideosInitialized] = useState(false);

  // Load works with pagination and filtering
  const loadWorksWithFilters = async (params = {}) => {
    try {
      setWorksLoading(true);
      setWorksError(null);
      
      const requestParams = {
        status: 'published',
        page: worksCurrentPage,
        per_page: worksPerPage,
        sort_by: 'created_at',
        sort_direction: 'desc',
        ...params
      };

      // Only add parameters if they have actual values
      if (worksSearchQuery && worksSearchQuery.trim()) {
        requestParams.search = worksSearchQuery.trim();
      }
      
      if (worksCategoryFilter !== 'all') {
        requestParams.category = worksCategoryFilter;
      }

      if (worksTagsFilter.length > 0) {
        requestParams.tags = worksTagsFilter;
      }

      const response = await worksAPI.getAll(requestParams);
      
      setPublishedWorks(response.data || []);
      setWorksTotalPages(response.meta?.last_page || 1);
      setWorksTotalWorks(response.meta?.total || 0);
      setWorksCurrentPage(response.meta?.current_page || 1);
    } catch (error) {
      console.error('Error loading works:', error);
      setWorksError(error.response?.data?.message || 'Failed to load works');
      setPublishedWorks([]);
    } finally {
      setWorksLoading(false);
    }
  };

  // Load all required data (initial load)
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Initialize empty video library - videos will be loaded when modal opens
      setVideoLibrary([]);
      
      // Load existing banners from API
      try {
        const bannersResponse = await videoBannerAPI.getAll();
        if (bannersResponse.success) {
          setBanners(bannersResponse.data || []);
        } else {
          console.error('Error loading banners:', bannersResponse.message);
          setBanners([]);
        }
      } catch (error) {
        console.error('Error loading banners:', error);
        setBanners([]);
        // Don't show error toast here as it might be because the backend isn't set up yet
      }
      
      // Load works with initial filters
      await loadWorksWithFilters();
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
      // Ensure arrays are set even on error
      setPublishedWorks([]);
      setVideoLibrary([]);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on hook mount
  useEffect(() => {
    loadData();
  }, []);

  // Effect for works filtering
  useEffect(() => {
    if (!loading) { // Only load works after initial data load
      loadWorksWithFilters();
    }
  }, [worksCurrentPage, worksPerPage, worksSearchQuery, worksCategoryFilter, worksTagsFilter]);

  // Effect for videos filtering - only after videos have been initialized
  useEffect(() => {
    if (videosInitialized) {
      loadVideosWithFilters();
    }
  }, [videosCurrentPage, videosPerPage, videosSearchQuery, videosSortBy, videosSortOrder]);

  // Clear works filters
  const clearWorksFilters = () => {
    setWorksSearchQuery("");
    setWorksCategoryFilter("all");
    setWorksTagsFilter([]);
    setWorksCurrentPage(1);
  };

  // Handle per page change
  const handleWorksPerPageChange = (newPerPage) => {
    setWorksPerPage(newPerPage);
    setWorksCurrentPage(1); // Reset to first page when changing per page
  };

  // Load videos with pagination and filtering
  const loadVideosWithFilters = async (params = {}) => {
    try {
      console.log('🎬 Loading videos with filters...', { videosCurrentPage, videosPerPage, videosSearchQuery, videosSortBy, videosSortOrder });
      setVideosLoading(true);
      
      const requestParams = {
        page: videosCurrentPage,
        per_page: videosPerPage,
        sort_by: videosSortBy,
        sort_direction: videosSortOrder,
        type: 'video', // Filter to only get video media
        ...params
      };

      // Only add search parameter if it has actual value
      if (videosSearchQuery && videosSearchQuery.trim()) {
        requestParams.search = videosSearchQuery.trim();
      }

      const response = await mediaAPI.getAll(requestParams);
      
      // Handle the response structure properly
      if (response && response.success && response.data) {
        let videosData = [];
        if (Array.isArray(response.data)) {
          videosData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          videosData = response.data.data; // Handle paginated response
        }
        
        console.log('🎬 Videos loaded successfully:', videosData.length, 'videos');
        setVideoLibrary(videosData);
        
        // Handle pagination data
        if (response.data.pagination) {
          setVideosTotalPages(response.data.pagination.total_pages || 1);
          setVideosTotalVideos(response.data.pagination.total || 0);
        } else if (response.pagination) {
          setVideosTotalPages(response.pagination.total_pages || 1);
          setVideosTotalVideos(response.pagination.total || 0);
        } else {
          // Fallback for non-paginated response
          setVideosTotalPages(1);
          setVideosTotalVideos(videosData.length);
        }
      }
    } catch (error) {
      console.error('❌ Error loading videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setVideosLoading(false);
    }
  };

  // Initialize video library data when modal opens
  const initializeVideoLibrary = async () => {
    console.log('🚀 Initializing video library...', { videosInitialized });
    // Reset to first page and set initialized flag
    setVideosCurrentPage(1);
    setVideosInitialized(true);
    
    // Load videos immediately to avoid double call from useEffect
    await loadVideosWithFilters();
  };

  // Clear video filters
  const clearVideoFilters = () => {
    setVideosSearchQuery("");
    setVideosSortBy("created_at");
    setVideosSortOrder("desc");
    setVideosCurrentPage(1);
    // Don't reset videosInitialized here - keep it true so filters still work
  };

  // Handle video per page change
  const handleVideosPerPageChange = (newPerPage) => {
    setVideosPerPage(newPerPage);
    setVideosCurrentPage(1); // Reset to first page when changing per page
  };

  return {
    banners,
    setBanners,
    publishedWorks,
    setPublishedWorks,
    videoLibrary,
    setVideoLibrary,
    loading,
    loadData,
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
  };
};