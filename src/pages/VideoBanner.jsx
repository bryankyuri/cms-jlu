import React, { useState, useEffect } from "react";
import { FiEdit, FiX, FiCheck } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VideoBanner = () => {
  // Initial banner data - this would typically come from an API
  const [banners, setBanners] = useState([
    {
      id: 1,
      workName: "PILLOW WALK - ALDO",
      workCategories: ["COLOR GRADING", "MOTION GRAPHIC"],
      workId: "WORK-001",
      thumbnailUrl: "/assets/works/work1.jpg",
      videoUrl: "https://cdn.jasonbradley.co/pic/6e1d7d78%20(1).mp4"
    },
    {
      id: 2,
      workName: "TOKOPEDIA - RAMADAN 2024",
      workCategories: ["MOTION GRAPHIC"],
      workId: "WORK-002",
      thumbnailUrl: "/assets/works/work2.jpg",
      videoUrl: "https://cdn.jasonbradley.co/pic/cafd3e4d.mp4"
    },
    {
      id: 3,
      workName: "TRUST IN GOLD - UBS GOLD",
      workCategories: ["COLOR GRADING", "CGI"],
      workId: "WORK-003",
      thumbnailUrl: "/assets/works/work3.jpg",
      videoUrl: "https://cdn.jasonbradley.co/pic/1e50e423-e10aee53.mp4"
    },
    {
      id: 4,
      workName: "SPEAK TO ME - SOCIOLLA",
      workCategories: ["MOTION GRAPHIC", "CGI"],
      workId: "WORK-004",
      thumbnailUrl: "/assets/works/work4.jpg",
      videoUrl: "https://cdn.jasonbradley.co/pic/3253312293.mp4"
    },
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Sample works and videos data (in a real application, this would come from an API)
  const [availableWorks, setAvailableWorks] = useState([
    { id: "WORK-001", name: "PILLOW WALK", client: "ALDO", category: "COLOR GRADING" },
    { id: "WORK-002", name: "RAMADAN 2024", client: "TOKOPEDIA", category: "MOTION GRAPHIC, COLOR GRADING" },
    { id: "WORK-003", name: "TRUST IN GOLD", client: "UBS GOLD", category: "CGI" },
    { id: "WORK-004", name: "SPEAK TO ME", client: "SOCIOLLA", category: "MOTION GRAPHIC, CGI" },
  ]);
  
  const [availableVideos, setAvailableVideos] = useState([
    {
      id: 1,
      name: "Banner Video",
      url: "https://cdn.jasonbradley.co/pic/ff41675d.mp4",
      thumbnail: "/assets/works/work1.jpg",
      dateCreated: "2023-01-05",
      type: "MP4"
    },
    {
      id: 2,
      name: "PILLOW WALK - ALDO",
      url: "https://cdn.jasonbradley.co/pic/6e1d7d78%20(1).mp4",
      thumbnail: "/assets/works/work2.jpg",
      dateCreated: "2023-02-10",
      type: "MP4"
    },
    {
      id: 3,
      name: "TOKOPEDIA - RAMADAN 2024",
      url: "https://cdn.jasonbradley.co/pic/cafd3e4d.mp4",
      thumbnail: "/assets/works/work3.jpg",
      dateCreated: "2023-03-01",
      type: "MP4"
    },
    {
      id: 4,
      name: "TRUST IN GOLD - UBS GOLD",
      url: "https://cdn.jasonbradley.co/pic/1e50e423-e10aee53.mp4",
      thumbnail: "/assets/works/work4.jpg",
      dateCreated: "2023-04-15",
      type: "MP4"
    },
    {
      id: 5,
      name: "SPEAK TO ME - SOCIOLLA",
      url: "https://cdn.jasonbradley.co/pic/3253312293.mp4",
      thumbnail: "/assets/works/work5.jpg",
      dateCreated: "2023-05-10",
      type: "MP4"
    }
  ]);
  
  // Categories for filtering
  const categories = ["ALL PROJECT", "COLOR GRADING", "MOTION GRAPHIC", "CGI"];

  const openEditModal = (banner) => {
    setCurrentBanner({ ...banner });
    setIsEditModalOpen(true);
    
    // Find the corresponding video in availableVideos
    const video = availableVideos.find(v => v.url === banner.videoUrl);
    setSelectedVideo(video || null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentBanner(null);
    setSelectedVideo(null);
  };
  
  const openMediaSelector = () => {
    setIsMediaSelectorOpen(true);
  };
  
  const closeMediaSelector = () => {
    setIsMediaSelectorOpen(false);
  };
  
  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    setCurrentBanner({
      ...currentBanner,
      videoUrl: video.url,
      thumbnailUrl: video.thumbnail
    });
    closeMediaSelector();
  };

  const handleWorkChange = (e) => {
    const workId = e.target.value;
    const work = availableWorks.find(w => w.id === workId);
    
    // Parse categories from the work's category string
    const workCategories = work.category.split(", ");
    
    setCurrentBanner({
      ...currentBanner,
      workId: workId,
      workName: `${work.name} - ${work.client}`, // Include client in work name
      workCategories: workCategories // Set categories from work data
    });
    
    // If a video with matching name exists, auto-select it
    const matchingVideo = availableVideos.find(v => 
      v.name.toLowerCase().includes(work.name.toLowerCase()) && 
      v.name.toLowerCase().includes(work.client.toLowerCase())
    );
    
    if (matchingVideo) {
      setSelectedVideo(matchingVideo);
      setCurrentBanner(prev => ({
        ...prev,
        videoUrl: matchingVideo.url,
        thumbnailUrl: matchingVideo.thumbnail
      }));
    }
  };
  
  const handleCategoryToggle = (category) => {
    const updatedCategories = [...currentBanner.workCategories];
    
    if (category === "ALL PROJECT") {
      // If ALL PROJECT is selected, make it the only category
      setCurrentBanner({
        ...currentBanner,
        workCategories: ["ALL PROJECT"]
      });
      return;
    }
    
    // Remove "ALL PROJECT" if any other category is selected
    const filteredCategories = updatedCategories.filter(cat => cat !== "ALL PROJECT");
    
    const categoryIndex = filteredCategories.indexOf(category);
    if (categoryIndex >= 0) {
      filteredCategories.splice(categoryIndex, 1);
    } else {
      filteredCategories.push(category);
    }
    
    setCurrentBanner({
      ...currentBanner,
      workCategories: filteredCategories
    });
  };

  const handleSave = () => {
    if (!currentBanner.workName || !currentBanner.videoUrl) {
      toast.error("Work name and video are required");
      return;
    }
    
    const updatedBanners = banners.map(banner => 
      banner.id === currentBanner.id ? currentBanner : banner
    );
    
    setBanners(updatedBanners);
    toast.success("Banner updated successfully");
    closeEditModal();
  };

  return (
    <div className="w-full px-4 py-8">
      <ToastContainer position="bottom-right" autoClose={3000} />
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="lg:text-[40px] text-[36px] text-black font-bold text-center w-full sm:text-left sm:w-auto">
          VIDEO BANNERS
        </h1>
        
        {/* Here you could add an "ADD BANNER" button if needed */}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banner
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categories
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work ID
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-24 relative">
                        <img 
                          className="h-16 w-24 object-cover" 
                          src={banner.thumbnailUrl} 
                          alt={banner.workName} 
                        />
                        {banner.videoUrl && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-50 rounded-full p-1">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {banner.workName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {banner.workCategories.map((category, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {category}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {banner.workId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="bg-[#F0F0F0] text-[#787878] px-4 py-1 rounded hover:bg-black hover:text-white transition-colors"
                    >
                      <FiEdit className="inline mr-1" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Edit Banner #{currentBanner.id}
              </h3>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: Form fields */}
                <div>
                  {/* Work Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Work
                    </label>
                    <select
                      value={currentBanner.workId}
                      onChange={handleWorkChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      {availableWorks.map(work => (
                        <option key={work.id} value={work.id}>
                          {work.name} - {work.client}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Client Information */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client
                    </label>
                    <input
                      type="text"
                      value={availableWorks.find(w => w.id === currentBanner.workId)?.client || ""}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none"
                    />
                  </div>

                  {/* Categories (now display-only) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {currentBanner.workCategories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm font-medium bg-black text-white"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Categories are determined by the selected work and cannot be changed.
                    </p>
                  </div>

                  {/* Work ID (Read-only) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work ID
                    </label>
                    <input
                      type="text"
                      value={currentBanner.workId}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none"
                    />
                  </div>

                  {/* Video Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video
                    </label>
                    <button
                      onClick={openMediaSelector}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-left flex items-center justify-between hover:bg-gray-50"
                    >
                      <span className="truncate">{selectedVideo ? selectedVideo.name : "Select video from Media Library"}</span>
                      <span className="bg-[#F0F0F0] text-[#787878] px-2 py-1 rounded text-xs">
                        Browse
                      </span>
                    </button>
                  </div>
                </div>

                {/* Right column: Preview */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    {selectedVideo ? (
                      <div className="relative">
                        <img
                          src={currentBanner.thumbnailUrl}
                          alt={currentBanner.workName}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black bg-opacity-50 rounded-full p-2">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-100 flex items-center justify-center h-48">
                        <p className="text-gray-400">No video selected</p>
                      </div>
                    )}
                    <div className="p-4 border-t border-gray-200">
                      <h3 className="font-medium">{currentBanner.workName}</h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {currentBanner.workCategories.map((category, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 mr-2"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-md font-semibold
                  ${currentBanner.workName && currentBanner.videoUrl
                    ? "bg-[#F0F0F0] text-[#787878] hover:bg-black hover:text-white transition-colors"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                onClick={handleSave}
                disabled={!currentBanner.workName || !currentBanner.videoUrl}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Selector Modal */}
      {isMediaSelectorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 h-3/4 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Select Video from Media Library
              </h3>
              <button
                onClick={closeMediaSelector}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableVideos.map((video) => (
                  <div 
                    key={video.id} 
                    className="border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-black transition-colors"
                    onClick={() => handleSelectVideo(video)}
                  >
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 rounded-full p-1">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{video.name}</p>
                      <p className="text-xs text-gray-500">{video.dateCreated}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                onClick={closeMediaSelector}
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