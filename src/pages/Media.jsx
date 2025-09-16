import React, { useState, useEffect, useRef } from "react";
import { Tab } from "@headlessui/react";
import {
  FiGrid,
  FiList,
  FiUpload,
  FiSearch,
  FiTrash2,
  FiEdit,
  FiDownload,
  FiVideo,
  FiPlay,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { mediaAPI } from "../api";

const Media = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all"); // all, image, video

  // State for media files from API
  const [mediaFiles, setMediaFiles] = useState([]);
  const [pagination, setPagination] = useState({});

  // Media previewer state
  const [isPreviewerOpen, setIsPreviewerOpen] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewMediaList, setPreviewMediaList] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  
  // Upload preview state
  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // File input ref for upload
  const fileInputRef = useRef(null);

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

      // Add type filter based on active tab (backend supports 'type' parameter)
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

  // Load media files on component mount and when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    loadMediaFiles(1);
  }, [searchQuery, sortBy, sortDirection, perPage, mediaTypeFilter]);

  // Cleanup file preview URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up any remaining object URLs to prevent memory leaks
      selectedFilesForUpload.forEach(filePreview => {
        URL.revokeObjectURL(filePreview.previewUrl);
      });
    };
  }, [selectedFilesForUpload]);

  // Handle tab change and update media type filter
  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
    
    // Map tab index to media type filter
    const filterMap = {
      0: "all",     // All tab
      1: "image",   // Images tab
      2: "video"    // Videos tab
    };
    
    setMediaTypeFilter(filterMap[tabIndex] || "all");
  };

  // Handle file upload
  const handleFileUpload = async (files) => {
    const fileArray = Array.from(files);

    // Filter to only allow images and videos
    const allowedFiles = fileArray.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        toast.error(
          `${file.name} is not supported. Only images and videos are allowed.`
        );
        return false;
      }
      return true;
    });

    if (allowedFiles.length === 0) {
      toast.error(
        "No valid files to upload. Only images and videos are supported."
      );
      return;
    }

    for (const file of allowedFiles) {
      try {
        setUploadProgress(0);
        const response = await mediaAPI.upload(file, {
          alt_text: file.name,
          description: `Uploaded ${new Date().toLocaleDateString()}`,
        });

        if (response.success) {
          toast.success(`${file.name} uploaded successfully!`);
          loadMediaFiles(); // Reload the media list
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploadProgress(0);
  };

  // Handle file selection for upload preview
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    // Filter to only allow images and videos
    const allowedFiles = fileArray.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      return isImage || isVideo;
    });

    // Create preview objects for allowed files
    const newPreviews = allowedFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      previewUrl: URL.createObjectURL(file)
    }));

    setSelectedFilesForUpload(newPreviews);
  };

  // Remove file from upload selection
  const handleRemoveFileFromUpload = (fileId) => {
    setSelectedFilesForUpload(prev => {
      const updatedFiles = prev.filter(filePreview => filePreview.id !== fileId);
      // Clean up the object URL to prevent memory leaks
      const fileToRemove = prev.find(filePreview => filePreview.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return updatedFiles;
    });
  };

  // Handle batch upload of selected files
  const handleBatchUpload = async () => {
    if (selectedFilesForUpload.length === 0) {
      toast.error("No files selected for upload");
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const filePreview of selectedFilesForUpload) {
      try {
        setUploadProgress(0);
        const response = await mediaAPI.upload(filePreview.file, {
          alt_text: filePreview.name,
          description: `Uploaded ${new Date().toLocaleDateString()}`,
        });

        if (response.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error("Upload error:", error);
        failCount++;
      }
    }

    // Clean up object URLs
    selectedFilesForUpload.forEach(filePreview => {
      URL.revokeObjectURL(filePreview.previewUrl);
    });

    setSelectedFilesForUpload([]);
    setIsUploading(false);
    setUploadProgress(0);
    setIsUploadModalOpen(false);

    // Show results
    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully!`);
      loadMediaFiles(); // Reload the media list
    }
    if (failCount > 0) {
      toast.error(`Failed to upload ${failCount} file${failCount > 1 ? 's' : ''}`);
    }
  };

  // Handle file deletion
  const handleDeleteFile = (id, filename) => {
    setFileToDelete({ id, filename });
    setIsDeleteModalOpen(true);
  };

  // Confirm file deletion
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      const response = await mediaAPI.delete(fileToDelete.id);
      if (response.success) {
        toast.success("File deleted successfully!");
        loadMediaFiles(); // Reload the media list
      } else {
        toast.error("Failed to delete file");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    } finally {
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
    }
  };

  // Cancel file deletion
  const cancelDeleteFile = () => {
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Filter media files by type for tabs
  const getFilteredMedia = () => {
    // Filter to only show images and videos
    const imageVideoFiles = mediaFiles.filter(
      (file) => file.is_image || file.mime_type.includes("video")
    );

    let filtered = imageVideoFiles;

    switch (activeTab) {
      case 0: // All (images and videos only)
        break;
      case 1: // Images
        filtered = imageVideoFiles.filter((file) => file.is_image);
        break;
      case 2: // Videos
        filtered = imageVideoFiles.filter((file) =>
          file.mime_type.includes("video")
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  // Get current media to display
  const currentMedia = getFilteredMedia();

  // Handle media preview
  const handlePreviewMedia = (file, mediaList) => {
    const fileIndex = mediaList.findIndex((item) => item.id === file.id);
    setCurrentPreviewIndex(fileIndex);
    setPreviewMediaList(mediaList);
    setIsPreviewerOpen(true);
  };

  // Navigate preview
  const handlePreviousMedia = () => {
    setCurrentPreviewIndex((prev) =>
      prev > 0 ? prev - 1 : previewMediaList.length - 1
    );
  };

  const handleNextMedia = () => {
    setCurrentPreviewIndex((prev) =>
      prev < previewMediaList.length - 1 ? prev + 1 : 0
    );
  };

  // Handle keyboard navigation in preview and modals
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Handle delete modal
      if (isDeleteModalOpen) {
        if (e.key === "Escape") {
          cancelDeleteFile();
        } else if (e.key === "Enter") {
          confirmDeleteFile();
        }
        return;
      }

      // Handle media previewer
      if (isPreviewerOpen) {
        if (e.key === "ArrowLeft") {
          handlePreviousMedia();
        } else if (e.key === "ArrowRight") {
          handleNextMedia();
        } else if (e.key === "Escape") {
          setIsPreviewerOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPreviewerOpen, previewMediaList.length, isDeleteModalOpen]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes >= 1073741824) {
      return (bytes / 1073741824).toFixed(2) + " GB";
    } else if (bytes >= 1048576) {
      return (bytes / 1048576).toFixed(2) + " MB";
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + " KB";
    } else {
      return bytes + " bytes";
    }
  };

  // Get file icon based on type
  const getFileIcon = (mimeType) => {
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("video")) return "🎥";
    return "�"; // Generic file icon for any other type
  };

  // Video thumbnail component
  const VideoThumbnail = ({ file, size = "large" }) => {
    const [thumbnail, setThumbnail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [useDirectVideo, setUseDirectVideo] = useState(false);

    useEffect(() => {
      if (file.mime_type.includes("video")) {
        const generateThumbnail = async () => {
          try {
            const video = document.createElement("video");
            video.muted = true;
            video.preload = "metadata";
            // Don't set crossOrigin to avoid CORS issues

            const loadVideo = new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error("Video loading timeout"));
              }, 8000);

              video.onloadedmetadata = () => {
                // Only try to seek if we have duration
                if (video.duration && video.duration > 0) {
                  const seekTime = Math.min(2, video.duration * 0.1);
                  video.currentTime = seekTime;
                } else {
                  // If no duration, try to draw the first frame
                  setTimeout(() => {
                    video.onseeked();
                  }, 100);
                }
              };

              video.onseeked = () => {
                try {
                  clearTimeout(timeout);
                  // Check if video has valid dimensions
                  if (video.videoWidth === 0 || video.videoHeight === 0) {
                    reject(new Error("Video has no valid dimensions"));
                    return;
                  }

                  const canvas = document.createElement("canvas");
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;

                  const ctx = canvas.getContext("2d");
                  ctx.drawImage(video, 0, 0);

                  const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);
                  resolve(thumbnailUrl);
                } catch (err) {
                  clearTimeout(timeout);
                  reject(err);
                }
              };

              video.onerror = (e) => {
                clearTimeout(timeout);
                reject(
                  new Error(
                    `Video failed to load: ${e.message || "Unknown error"}`
                  )
                );
              };
            });

            video.src = mediaAPI.getDirectUrl(file.path);

            const thumbnailUrl = await loadVideo;
            setThumbnail(thumbnailUrl);
            setIsLoading(false);
          } catch (err) {
            console.error(
              "Error generating video thumbnail, falling back to direct video:",
              err
            );
            // Fallback to showing the video element directly
            setUseDirectVideo(true);
            setIsLoading(false);
          }
        };

        generateThumbnail();
      } else {
        setError(true);
        setIsLoading(false);
      }
    }, [file]);

    const isSmall = size === "small";

    if (error || !file.mime_type.includes("video")) {
      return isSmall ? (
        <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
          <FiVideo size={12} className="text-gray-400" />
        </div>
      ) : (
        <div className="relative group cursor-pointer">
          <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center">
            <FiVideo size={32} className="text-gray-400" />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white bg-opacity-90 rounded-full p-2">
              <FiPlay size={16} className="text-gray-700 ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
            Video
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div
          className={`bg-gray-100 rounded flex items-center justify-center ${
            isSmall ? "w-6 h-6" : "w-full aspect-square rounded"
          }`}
        >
          <div
            className={`animate-spin rounded-full border-b-2 border-blue-500 ${
              isSmall ? "h-3 w-3" : "h-6 w-6"
            }`}
          ></div>
        </div>
      );
    }

    // If we have a generated thumbnail, show it
    if (thumbnail) {
      return (
        <div
          className={`relative group cursor-pointer ${
            isSmall ? "w-6 h-6" : ""
          }`}
        >
          <img
            src={thumbnail}
            alt={file.original_name}
            className={`object-cover ${
              isSmall ? "w-6 h-6 rounded" : "w-full aspect-square rounded"
            }`}
          />
          {!isSmall && (
            <>
              <div className="absolute inset-0 bg-black bg-opacity-20 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white bg-opacity-90 rounded-full p-3">
                  <FiPlay size={20} className="text-gray-700 ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                Video
              </div>
            </>
          )}
        </div>
      );
    }

    // Fallback: show video element directly
    if (useDirectVideo && !isSmall) {
      return (
        <div className="relative group cursor-pointer">
          <video
            src={mediaAPI.getDirectUrl(file.path)}
            className="w-full aspect-square object-cover rounded"
            muted
            preload="metadata"
            onError={() => setError(true)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white bg-opacity-90 rounded-full p-3">
              <FiPlay size={20} className="text-gray-700 ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            Video
          </div>
        </div>
      );
    }

    // Final fallback
    return isSmall ? (
      <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
        <FiVideo size={12} className="text-gray-400" />
      </div>
    ) : (
      <div className="relative group cursor-pointer">
        <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center">
          <FiVideo size={32} className="text-gray-400" />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white bg-opacity-90 rounded-full p-2">
            <FiPlay size={16} className="text-gray-700 ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
          Video
        </div>
      </div>
    );
  };

  // Media Previewer Component
  const MediaPreviewer = () => {
    if (!isPreviewerOpen || previewMediaList.length === 0) return null;

    const currentFile = previewMediaList[currentPreviewIndex];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={() => setIsPreviewerOpen(false)}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
        >
          <FiX size={24} />
        </button>

        {/* Navigation buttons */}
        {previewMediaList.length > 1 && (
          <>
            <button
              onClick={handlePreviousMedia}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-50 bg-black bg-opacity-50 rounded-full p-2"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextMedia}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-50 bg-black bg-opacity-50 rounded-full p-2"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}

        {/* Media content */}
        <div className="max-w-full max-h-full flex items-center justify-center p-8">
          {currentFile.is_image ? (
            <img
              src={mediaAPI.getDirectUrl(currentFile.path)}
              alt={currentFile.alt_text || currentFile.original_name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                console.error(
                  "Failed to load image:",
                  currentFile.original_name
                );
                e.target.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDE0IDI1LjMxMzcgMTQgMjJDMTQgMTguNjg2MyAxNi42ODYzIDE2IDIwIDE2QzIzLjMxMzcgMTYgMjYgMTguNjg2MyAyNiAyMkMyNiAyNS4zMTM3IDIzLjMxMzcgMjggMjAgMjhaIiBmaWxsPSIjOUI5QjlCIi8+Cjwvc3ZnPgo=";
              }}
            />
          ) : currentFile.mime_type.includes("video") ? (
            <video
              src={mediaAPI.getDirectUrl(currentFile.path)}
              controls
              className="max-w-full max-h-full"
              onError={(e) => {
                console.error(
                  "Failed to load video:",
                  currentFile.original_name
                );
                // Replace with a fallback message
                const errorDiv = document.createElement("div");
                errorDiv.className =
                  "flex flex-col items-center justify-center text-white text-center p-8";
                errorDiv.innerHTML = `
                  <div class="text-4xl mb-4">🎥</div>
                  <div class="text-lg font-medium mb-2">Unable to play video</div>
                  <div class="text-sm text-gray-300">CORS or network error prevented video loading</div>
                  <div class="text-sm text-gray-300 mt-2">${currentFile.original_name}</div>
                `;
                e.target.parentNode.replaceChild(errorDiv, e.target);
              }}
            />
          ) : null}
        </div>

        {/* Media info */}
        <div className="absolute top-0 left-0 right-0 text-white text-center">
          <div className="bg-black bg-opacity-50 rounded p-4">
            <div className="font-medium">{currentFile.original_name}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="media-library px-5 py-8">
      {/* Header */}
      <div className="flex justify-center items-center mb-6">
        <h1 className="lg:text-[40px] text-[36px] text-black font-bold lg:mb-[60px] text-center">
          MEDIA LIBRARY
        </h1>
      </div>

      <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
        <div className="w-full flex flex-col">
          <div className="flex gap-4  justify-between items-center mb-16">
            <div className="w-full flex gap-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search media files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-b border-gray-300 focus:outline-none"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-b border-gray-300 focus:outline-none"
              >
                <option value="created_at">Date Created</option>
                <option value="original_name">Name</option>
                <option value="size">File Size</option>
                <option value="mime_type">File Type</option>
              </select>

              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                className="px-4 py-2 border-b border-gray-300 focus:outline-none"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>

              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                className="px-4 py-2 border-b border-gray-300 focus:outline-none"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>

              <div className="flex border border-gray-300 rounded">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-black text-white"
                      : "text-gray-600"
                  }`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-black text-white"
                      : "text-gray-600"
                  }`}
                >
                  <FiList />
                </button>
              </div>
            </div>
            <div className="flex w-full justify-end">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-black text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <FiUpload /> Upload Files
              </button>
            </div>
          </div>
          <div className="flex w-full justify-between mb-6">
            <Tab.List className="lg:max-w-[300px] w-full flex  items-center space-x-2 rounded-xl p-1">
              {["All", "Images", "Videos"].map((category) => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    `w-full rounded py-2.5 text-sm font-medium leading-5 
                ${
                  selected
                    ? "bg-black shadow text-white"
                    : "bg-[#F0F0F0] text-[#787878] hover:bg-gray-300"
                }`
                  }
                >
                  {category}
                </Tab>
              ))}
            </Tab.List>
            {pagination.total && (
              <div className="w-full flex justify-center items-center text-sm text-gray-600">
                Showing {(currentPage - 1) * perPage + 1} -{" "}
                {Math.min(currentPage * perPage, pagination.total)} of{" "}
                {pagination.total} files
                {searchQuery && ` (filtered by "${searchQuery}")`}
              </div>
            )}
            {/* Pagination */}
            {pagination.last_page && pagination.last_page > 1 && (
              <div className="flex justify-end items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded flex items-center gap-1 ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Prev
                </button>

                <div className="flex gap-1">
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-2 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        1
                      </button>
                      {currentPage > 4 && (
                        <span className="px-2 py-2 text-gray-500">...</span>
                      )}
                    </>
                  )}

                  {/* Page numbers around current page */}
                  {Array.from(
                    { length: Math.min(5, pagination.last_page) },
                    (_, i) => {
                      const page =
                        Math.max(
                          1,
                          Math.min(pagination.last_page - 4, currentPage - 2)
                        ) + i;
                      if (page > pagination.last_page) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded ${
                            page === currentPage
                              ? "bg-black border border-black text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}

                  {/* Last page */}
                  {currentPage < pagination.last_page - 2 && (
                    <>
                      {currentPage < pagination.last_page - 3 && (
                        <span className="px-2 py-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(pagination.last_page)}
                        className="px-3 py-2 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        {pagination.last_page}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === pagination.last_page}
                  className={`px-3 py-2 rounded flex items-center gap-1 ${
                    currentPage === pagination.last_page
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        <Tab.Panels>
          {[0, 1, 2, 3].map((tabIndex) => (
            <Tab.Panel key={tabIndex}>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-gray-500">Loading media files...</div>
                </div>
              ) : currentMedia.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">No media files found</div>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {currentMedia.map((file) => (
                    <div
                      key={file.id}
                      className="border border-gray-200 rounded p-3 hover:shadow-md transition-shadow"
                    >
                      <div
                        className="aspect-square mb-2 bg-gray-100 rounded flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => handlePreviewMedia(file, currentMedia)}
                      >
                        {file.is_image ? (
                          <img
                            src={mediaAPI.getDirectUrl(file.path)}
                            alt={file.alt_text || file.original_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : file.mime_type.includes("video") ? (
                          <VideoThumbnail file={file} />
                        ) : (
                          <div className="text-4xl">
                            {getFileIcon(file.mime_type)}
                          </div>
                        )}
                        <div className="w-full h-full items-center justify-center text-4xl hidden">
                          {getFileIcon(file.mime_type)}
                        </div>
                      </div>

                      <div className="text-sm">
                        <div
                          className="font-medium truncate"
                          title={file.original_name}
                        >
                          {file.original_name}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {formatFileSize(file.size)}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(file.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() =>
                            window.open(
                              mediaAPI.getDirectUrl(file.path),
                              "_blank"
                            )
                          }
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                          title="Download"
                        >
                          <FiDownload size={14} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteFile(file.id, file.original_name)
                          }
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded border">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Size
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentMedia.map((file) => (
                        <tr key={file.id} className="border-b hover:bg-gray-50">
                          <td
                            className="px-4 py-3 cursor-pointer"
                            onClick={() =>
                              handlePreviewMedia(file, currentMedia)
                            }
                          >
                            <div className="flex items-center gap-3">
                              {file.mime_type.includes("video") ? (
                                <VideoThumbnail file={file} size="small" />
                              ) : (
                                <span className="text-lg">
                                  {getFileIcon(file.mime_type)}
                                </span>
                              )}
                              <span className="font-medium">
                                {file.original_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {file.extension.toUpperCase()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(file.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  window.open(
                                    mediaAPI.getDirectUrl(file.path),
                                    "_blank"
                                  )
                                }
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                                title="Download"
                              >
                                <FiDownload size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteFile(file.id, file.original_name)
                                }
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold mb-4">Upload Files</h2>

            {selectedFilesForUpload.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  handleDrop(e);
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    handleFileSelect(files);
                  }
                }}
                className="border-2 border-dashed border-gray-300 rounded p-8 text-center hover:border-black transition-colors"
              >
                <FiUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop files here, or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileSelect(e.target.files);
                    }
                  }}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">Only images and videos are allowed</p>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600">
                    {selectedFilesForUpload.length} file{selectedFilesForUpload.length > 1 ? 's' : ''} selected
                  </p>
                  <button
                    onClick={() => {
                      // Clean up object URLs
                      selectedFilesForUpload.forEach(filePreview => {
                        URL.revokeObjectURL(filePreview.previewUrl);
                      });
                      setSelectedFilesForUpload([]);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedFilesForUpload.map((filePreview) => (
                      <div key={filePreview.id} className="border rounded-lg p-3 relative">
                        <button
                          onClick={() => handleRemoveFileFromUpload(filePreview.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 z-10"
                        >
                          ×
                        </button>
                        
                        <div className="mb-2 aspect-square bg-gray-100 rounded overflow-hidden">
                          {filePreview.type.startsWith('image/') ? (
                            <img
                              src={filePreview.previewUrl}
                              alt={filePreview.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <FiVideo className="text-4xl text-gray-500" />
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs">
                          <p className="font-medium truncate" title={filePreview.name}>
                            {filePreview.name}
                          </p>
                          <p className="text-gray-500">
                            {(filePreview.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-800 text-sm mb-3"
                  >
                    + Add more files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const newFiles = Array.from(e.target.files);
                        const newPreviews = newFiles.map((file, index) => ({
                          id: Date.now() + index,
                          file,
                          name: file.name,
                          type: file.type,
                          size: file.size,
                          previewUrl: URL.createObjectURL(file)
                        }));
                        setSelectedFilesForUpload(prev => [...prev, ...newPreviews]);
                        e.target.value = ''; // Reset input
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {isUploading && uploadProgress > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Uploading...</p>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  // Clean up object URLs
                  selectedFilesForUpload.forEach(filePreview => {
                    URL.revokeObjectURL(filePreview.previewUrl);
                  });
                  setSelectedFilesForUpload([]);
                  setIsUploadModalOpen(false);
                }}
                disabled={isUploading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
              >
                Cancel
              </button>
              {selectedFilesForUpload.length > 0 && (
                <button
                  onClick={handleBatchUpload}
                  disabled={isUploading}
                  className="flex-1 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>Upload {selectedFilesForUpload.length} File{selectedFilesForUpload.length > 1 ? 's' : ''}</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Media Previewer */}
      <MediaPreviewer />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md mx-4 slideUpFromBottom">
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiTrash2 className="h-6 w-6 text-red-600" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete File
              </h3>

              {/* Message */}
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-medium text-gray-900">
                  {fileToDelete?.filename}
                </span>
                ?
              </p>

              {/* Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelDeleteFile}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteFile}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;
