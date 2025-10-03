import React, { useState, useEffect } from "react";
import { FiEdit, FiX, FiCheck, FiPlus, FiVideo, FiUpload } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { worksAPI, mediaAPI } from '../api';

const VideoBanner = () => {
  // Main state management
  const [banners, setBanners] = useState([]);
  const [publishedWorks, setPublishedWorks] = useState([]);
  const [videoLibrary, setVideoLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVideoLibraryOpen, setIsVideoLibraryOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form states
  const [selectedWork, setSelectedWork] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [useCustomVideo, setUseCustomVideo] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  
  // Upload states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load all required data
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load published works
      const worksResponse = await worksAPI.getAll({ status: 'published' });
      console.log('Works response:', worksResponse);
      setPublishedWorks(worksResponse.data || []);
      
      // Load video library - handle paginated response
      const mediaResponse = await mediaAPI.getAll({ type: 'video' });
      console.log('Media response:', mediaResponse);
      
      // Extract videos from nested response structure
      let videosData = [];
      if (mediaResponse.success && mediaResponse.data) {
        if (Array.isArray(mediaResponse.data)) {
          videosData = mediaResponse.data;
        } else if (mediaResponse.data.data && Array.isArray(mediaResponse.data.data)) {
          videosData = mediaResponse.data.data; // Handle paginated response
        }
      }
      console.log('Processed videos data:', videosData);
      setVideoLibrary(videosData);
      
      // Load existing banners (you might want to create a banners API endpoint)
      // For now, using empty array - implement banner API as needed
      setBanners([]);
      
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

  // Handle work selection
  const handleWorkSelection = (work) => {
    setSelectedWork(work);
    setUseCustomVideo(false);
    
    // Set default video from work's video_project_src and video_project_poster
    if (work.video_project_src) {
      setSelectedVideo({
        id: `work_${work.id}`,
        name: `${work.title} - Default Video`,
        url: work.video_project_src,
        thumbnail: work.video_project_poster || work.hero_banner_image,
        type: 'work_default',
        isDefault: true
      });
    } else {
      setSelectedVideo(null);
    }
  };

  // Handle custom video selection
  const handleCustomVideoToggle = () => {
    setUseCustomVideo(!useCustomVideo);
    if (!useCustomVideo) {
      // Reset to default work video when enabling custom video
      if (selectedWork?.video_project_src) {
        setSelectedVideo({
          id: `work_${selectedWork.id}`,
          name: `${selectedWork.title} - Default Video`,
          url: selectedWork.video_project_src,
          thumbnail: selectedWork.video_project_poster || selectedWork.hero_banner_image,
          type: 'work_default',
          isDefault: true
        });
      }
    }
  };

  // Handle video selection from library
  const handleVideoSelection = (video) => {
    // Ensure the video object has the required properties
    const formattedVideo = {
      id: video.id,
      name: video.original_name || video.filename || 'Selected Video',
      url: video.url, // API response includes full URL
      thumbnail: video.poster_url, // API response includes poster_url
      type: video.extension || 'video',
      isDefault: false
    };
    
    console.log('Selecting video:', formattedVideo);
    setSelectedVideo(formattedVideo);
    setIsVideoLibraryOpen(false);
  };

  // Handle video upload
  const handleVideoUpload = async (file, posterFile = null) => {
    try {
      setUploadingVideo(true);
      setUploadProgress(0);

      const metadata = {
        alt_text: file.name,
        description: `Uploaded for video banner - ${new Date().toLocaleDateString()}`
      };

      const response = await mediaAPI.uploadVideo(file, posterFile, metadata);
      
      if (response.success) {
        // Add to video library - ensure it's always an array
        setVideoLibrary(prev => {
          const currentLibrary = Array.isArray(prev) ? prev : [];
          return [response.data, ...currentLibrary];
        });
        
        // Auto-select the uploaded video
        handleVideoSelection(response.data);
        
        toast.success('Video uploaded successfully');
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Video upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  // Modal management functions
  const openCreateModal = () => {
    setIsCreateModalOpen(true);
    setSelectedWork(null);
    setSelectedVideo(null);
    setUseCustomVideo(false);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedWork(null);
    setSelectedVideo(null);
    setUseCustomVideo(false);
  };

  const openVideoLibrary = () => {
    setIsVideoLibraryOpen(true);
  };

  const closeVideoLibrary = () => {
    setIsVideoLibraryOpen(false);
  };

  const openEditModal = (banner) => {
    setCurrentBanner(banner);
    setSelectedVideo(null); // Reset video selection for editing
    setUseCustomVideo(banner.is_custom_video); // Set initial toggle state based on banner data
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentBanner(null);
    setSelectedVideo(null);
    setUseCustomVideo(false);
  };

  // Banner creation and editing
  const handleCreateBanner = async () => {
    if (!selectedWork || !selectedVideo) {
      toast.error("Please select a work and video");
      return;
    }

    try {
      const newBanner = {
        id: Date.now(), // Temporary ID - replace with API call
        work_id: selectedWork.id,
        work_title: selectedWork.title,
        work_client: selectedWork.client,
        work_categories: Array.isArray(selectedWork.tags) ? selectedWork.tags : [],
        video_url: selectedVideo.url,
        video_thumbnail: selectedVideo.thumbnail,
        is_custom_video: !selectedVideo.isDefault,
        created_at: new Date().toISOString()
      };

      setBanners(prev => [newBanner, ...prev]);
      toast.success("Banner created successfully");
      closeCreateModal();
      
      // In a real app, you'd make an API call here:
      // const response = await bannersAPI.create(newBanner);
      
    } catch (error) {
      console.error('Error creating banner:', error);
      toast.error('Failed to create banner');
    }
  };

  const handleUpdateBanner = async () => {
    if (!currentBanner) return;

    try {
      // Update banner logic here
      // const response = await bannersAPI.update(currentBanner.id, currentBanner);
      
      setBanners(prev => 
        prev.map(banner => 
          banner.id === currentBanner.id ? currentBanner : banner
        )
      );
      
      toast.success("Banner updated successfully");
      closeEditModal();
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Failed to update banner');
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      setBanners(prev => prev.filter(banner => banner.id !== bannerId));
      toast.success("Banner deleted successfully");
      
      // In a real app, you'd make an API call here:
      // await bannersAPI.delete(bannerId);
      
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="lg:text-[40px] text-[36px] text-black font-bold text-center w-full sm:text-left sm:w-auto">
          VIDEO BANNERS
        </h1>
        
        <button
          onClick={openCreateModal}
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <FiPlus className="h-4 w-4" />
          Add Banner
        </button>
      </div>

      {/* Banners List */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FiVideo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No video banners yet</h3>
          <p className="text-gray-500 mb-4">Create your first video banner by selecting from published works.</p>
          <button
            onClick={openCreateModal}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Create First Banner
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preview
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categories
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-16 w-28 relative">
                        <img 
                          className="h-16 w-28 object-cover rounded" 
                          src={banner.video_thumbnail} 
                          alt={banner.work_title} 
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black bg-opacity-50 rounded-full p-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {banner.work_title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {banner.work_client}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {banner.work_categories && banner.work_categories.map((category, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {category}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        banner.is_custom_video 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {banner.is_custom_video ? 'Custom Video' : 'Work Default'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(banner)}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        <FiEdit className="inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                      >
                        <FiX className="inline mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Banner Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full h-full m-4 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Create Video Banner</h3>
              <button
                onClick={closeCreateModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 flex-grow overflow-y-auto">
              {/* Step 1: Select Work */}
              <div className="mb-8">
                <h4 className="text-md font-medium mb-4">1. Select Published Work</h4>
                {publishedWorks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No published works available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                    {publishedWorks.map((work) => (
                      <div
                        key={work.id}
                        onClick={() => handleWorkSelection(work)}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedWork?.id === work.id
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                          {work.hero_banner_image ? (
                            <img
                              src={work.hero_banner_image}
                              alt={work.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400 text-sm">No image</span>
                            </div>
                          )}
                        </div>
                        <h5 className="font-medium text-sm truncate">{work.title}</h5>
                        <p className="text-xs text-gray-500 truncate">{work.client}</p>
                        {work.tags && work.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {work.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="text-xs bg-gray-100 px-1 rounded">
                                {tag}
                              </span>
                            ))}
                            {work.tags.length > 2 && (
                              <span className="text-xs text-gray-400">+{work.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Video Selection */}
              {selectedWork && (
                <div className="mb-8">
                  <h4 className="text-md font-medium mb-4">2. Select Video</h4>
                  
                  {/* Video Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Preview</h5>
                        <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                          {selectedVideo ? (
                            <div className="relative w-full h-full">
                              <img
                                src={selectedVideo.thumbnail}
                                alt={selectedVideo.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black bg-opacity-50 rounded-full p-3">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <p className="text-gray-400">No video selected</p>
                            </div>
                          )}
                        </div>
                        {selectedVideo && (
                          <div className="mt-2 p-3 bg-gray-50 rounded">
                            <p className="font-medium text-sm">{selectedVideo.name}</p>
                            <p className="text-xs text-gray-500">
                              {selectedVideo.isDefault ? 'Default work video' : 'Custom video from library'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Video Options</h5>
                      
                      {/* Default Video Option */}
                      <div className={`border-2 rounded-lg p-4 mb-3 cursor-pointer ${
                        !useCustomVideo ? 'border-black bg-gray-50' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        setUseCustomVideo(false);
                        if (selectedWork.video_project_src) {
                          setSelectedVideo({
                            id: `work_${selectedWork.id}`,
                            name: `${selectedWork.title} - Default Video`,
                            url: selectedWork.video_project_src,
                            thumbnail: selectedWork.video_project_poster || selectedWork.hero_banner_image,
                            type: 'work_default',
                            isDefault: true
                          });
                        }
                      }}
                      >
                        <div className="flex items-center mb-2">
                          <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                            !useCustomVideo ? 'border-black bg-black' : 'border-gray-300'
                          }`}>
                            {!useCustomVideo && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                          </div>
                          <span className="font-medium">Use Work's Default Video</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          {selectedWork.video_project_src 
                            ? 'Video from work\'s video_project_src field'
                            : 'No default video available for this work'
                          }
                        </p>
                      </div>

                      {/* Custom Video Option */}
                      <div className={`border-2 rounded-lg p-4 cursor-pointer ${
                        useCustomVideo ? 'border-black bg-gray-50' : 'border-gray-200'
                      }`}
                      onClick={() => setUseCustomVideo(true)}
                      >
                        <div className="flex items-center mb-2">
                          <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                            useCustomVideo ? 'border-black bg-black' : 'border-gray-300'
                          }`}>
                            {useCustomVideo && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                          </div>
                          <span className="font-medium">Use Custom Video</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-6 mb-3">
                          Select from video library or upload new video
                        </p>
                        
                        {useCustomVideo && (
                          <div className="ml-6">
                            <button
                              onClick={openVideoLibrary}
                              className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors text-sm"
                            >
                              <FiVideo className="inline mr-1" />
                              Select from Library
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                onClick={closeCreateModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedWork && selectedVideo
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                onClick={handleCreateBanner}
                disabled={!selectedWork || !selectedVideo}
              >
                Create Banner
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Edit Banner Modal */}
      {isEditModalOpen && currentBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full h-full m-4 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Edit Banner - {currentBanner.work_title}
              </h3>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 flex-grow overflow-y-auto">
              {/* Current Banner Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Current Banner</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Work:</span>
                    <p>{currentBanner.work_title}</p>
                  </div>
                  <div>
                    <span className="font-medium">Client:</span>
                    <p>{currentBanner.work_client}</p>
                  </div>
                </div>
              </div>

              {/* Video Source Selection */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-4">Select Video Source</h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Video Preview */}
                  <div>
                    <h5 className="font-medium mb-2">Current Video</h5>
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                      <img
                        src={currentBanner.video_thumbnail}
                        alt={currentBanner.work_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2 p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">
                        Current: {currentBanner.is_custom_video ? 'Custom Video' : 'Work Default Video'}
                      </p>
                    </div>
                  </div>

                  {/* Video Options */}
                  <div>
                    <h5 className="font-medium mb-2">Change Video Source</h5>
                    
                    {/* Find the work from publishedWorks */}
                    {(() => {
                      const work = publishedWorks.find(w => w.id === currentBanner.work_id);
                      return (
                        <>
                          {/* Default Video Option */}
                          <div className={`border-2 rounded-lg p-4 mb-3 cursor-pointer ${
                            !useCustomVideo ? 'border-black bg-gray-50' : 'border-gray-200'
                          }`}
                          onClick={() => {
                            setUseCustomVideo(false);
                            if (work?.video_project_src) {
                              setSelectedVideo({
                                id: `work_${work.id}`,
                                name: `${work.title} - Default Video`,
                                url: work.video_project_src,
                                thumbnail: work.video_project_poster || work.hero_banner_image,
                                type: 'work_default',
                                isDefault: true
                              });
                            }
                          }}
                          >
                            <div className="flex items-center mb-2">
                              <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                                !useCustomVideo ? 'border-black bg-black' : 'border-gray-300'
                              }`}>
                                {!useCustomVideo && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                              </div>
                              <span className="font-medium">Use Work's Default Video</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">
                              {work?.video_project_src 
                                ? 'Video from work\'s video_project_src field'
                                : 'No default video available for this work'
                              }
                            </p>
                          </div>

                          {/* Custom Video Option */}
                          <div className={`border-2 rounded-lg p-4 cursor-pointer ${
                            useCustomVideo ? 'border-black bg-gray-50' : 'border-gray-200'
                          }`}
                          onClick={() => {
                            setUseCustomVideo(true);
                          }}
                          >
                            <div className="flex items-center mb-2">
                              <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                                useCustomVideo ? 'border-black bg-black' : 'border-gray-300'
                              }`}>
                                {useCustomVideo && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                              </div>
                              <span className="font-medium">Use Custom Video</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6 mb-3">
                              Select from video library
                            </p>
                            
                            {useCustomVideo && (
                              <div className="ml-6">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openVideoLibrary();
                                  }}
                                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors text-sm"
                                >
                                  <FiVideo className="inline mr-1" />
                                  Select from Library
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Selected Video Preview */}
              {selectedVideo && (
                <div className="mb-6">
                  <h5 className="font-medium mb-2">New Video Selection</h5>
                  <div className="aspect-video bg-gray-100 rounded overflow-hidden max-w-md">
                    <img
                      src={selectedVideo.thumbnail}
                      alt={selectedVideo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-2 p-3 bg-blue-50 rounded max-w-md">
                    <p className="font-medium text-sm">{selectedVideo.name}</p>
                    <p className="text-xs text-blue-600">
                      {selectedVideo.isDefault ? 'Work default video' : 'Custom video from library'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => handleDeleteBanner(currentBanner.id)}
                className="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Delete Banner
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`px-6 py-2 text-sm font-medium rounded transition-colors ${
                    selectedVideo || (!useCustomVideo && publishedWorks.find(w => w.id === currentBanner.work_id)?.video_project_src)
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={() => {
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
                      // Update the banner with new video
                      const updatedBanner = {
                        ...currentBanner,
                        video_url: videoToUpdate.url,
                        video_thumbnail: videoToUpdate.thumbnail,
                        is_custom_video: useCustomVideo
                      };
                      setBanners(prev => 
                        prev.map(banner => 
                          banner.id === currentBanner.id ? updatedBanner : banner
                        )
                      );
                      toast.success("Banner video updated successfully");
                      closeEditModal();
                    }
                  }}
                  disabled={!selectedVideo && (useCustomVideo || !publishedWorks.find(w => w.id === currentBanner.work_id)?.video_project_src)}
                >
                  Update Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* Video Library Modal */}
      {isVideoLibraryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl w-full h-full m-4 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Select Video from Library</h3>
                <p className="text-sm text-gray-500 mt-1">Choose from existing videos or upload a new one</p>
              </div>
              <button
                onClick={closeVideoLibrary}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Upload Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium">Upload New Video</h4>
                <label className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors cursor-pointer inline-flex items-center gap-2">
                  <FiUpload className="h-4 w-4" />
                  Upload Video
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleVideoUpload(file);
                      }
                    }}
                  />
                </label>
              </div>
              
              {uploadingVideo && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-blue-800">Uploading video... {uploadProgress}%</span>
                  </div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: `${uploadProgress}%`}}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Library Grid */}
            <div className="p-4 flex-grow overflow-y-auto">
              <h4 className="text-md font-medium mb-4">Existing Videos</h4>
              
              {/* Video Library Grid */}
              {(!Array.isArray(videoLibrary) || videoLibrary.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                  <FiVideo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>No videos in library yet</p>
                  <p className="text-sm">Upload your first video to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {videoLibrary.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => handleVideoSelection(video)}
                      className="border-2 border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-black transition-colors group"
                    >
                      <div className="relative aspect-video">
                        <img
                          src={video.poster_url}
                          alt={video.original_name || video.filename}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04IDEwLjVWMTMuNUwxMSAxMkw4IDEwLjVaIiBmaWxsPSIjOTdBM0IzIi8+Cjwvc3ZnPgo=';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black bg-opacity-50 rounded-full p-2">
                            <FiCheck className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <div className="bg-black bg-opacity-50 rounded-full p-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm truncate">
                          {video.original_name || video.filename || 'Untitled Video'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {video.created_at && new Date(video.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {video.extension?.toUpperCase() || 'MP4'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {video.size && `${Math.round(video.size / (1024 * 1024))}MB`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                onClick={closeVideoLibrary}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoBanner;