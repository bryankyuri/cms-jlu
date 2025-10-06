import React, { useState } from 'react';
import { FiX, FiUpload, FiVideo, FiCheck, FiSearch, FiChevronLeft, FiChevronRight, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import VideoUploadModal from '../../../components/modals/VideoUploadModal';

const VideoLibraryModal = ({
  isOpen,
  onClose,
  videoLibrary,
  onVideoSelect,
  onVideoUpload, // This is for the old direct upload method
  uploadingVideo,
  uploadProgress,
  // Add new prop for refreshing video library
  onRefreshLibrary,
  // Pagination props
  currentPage = 1,
  totalPages = 1,
  totalVideos = 0,
  videosPerPage = 12,
  onPageChange,
  onPerPageChange,
  // Search and filtering props
  searchQuery = '',
  onSearchChange,
  // Sorting props
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSortByChange,
  onSortOrderChange,
  // Loading state
  loading = false
}) => {
  // State for VideoUploadModal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleUploadSuccess = () => {
    // Close upload modal
    setIsUploadModalOpen(false);
    // Refresh the video library
    if (onRefreshLibrary) {
      onRefreshLibrary();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onVideoUpload(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Select Video from Library</h3>
            <p className="text-sm text-gray-500 mt-1">Choose from existing videos or upload a new one</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Upload Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium">Upload New Video</h4>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <FiUpload className="h-4 w-4" />
              Upload Video
            </button>
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

        {/* Search and Filter Section */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-grow">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort By */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => onSortByChange && onSortByChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              >
                <option value="created_at">Sort by Date</option>
                <option value="original_name">Sort by Name</option>
                <option value="size">Sort by Size</option>
              </select>

              {/* Sort Order */}
              <button
                onClick={() => onSortOrderChange && onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-black focus:border-transparent text-sm flex items-center gap-1"
                title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
              >
                {sortOrder === 'asc' ? <FiArrowUp className="h-4 w-4" /> : <FiArrowDown className="h-4 w-4" />}
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </button>

              {/* Videos Per Page */}
              <select
                value={videosPerPage}
                onChange={(e) => onPerPageChange && onPerPageChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={18}>18 per page</option>
                <option value={24}>24 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Video Library Grid */}
        <div className="p-4 flex-grow overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium">
              {totalVideos > 0 ? `Videos (${totalVideos})` : 'Existing Videos'}
            </h4>
            {totalVideos > 0 && (
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading videos...</p>
            </div>
          ) : (!Array.isArray(videoLibrary) || videoLibrary.length === 0) ? (
            <div className="text-center py-8 text-gray-500">
              <FiVideo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {searchQuery ? (
                <>
                  <p>No videos found matching "{searchQuery}"</p>
                  <p className="text-sm">Try adjusting your search or upload a new video</p>
                </>
              ) : (
                <>
                  <p>No videos in library yet</p>
                  <p className="text-sm">Upload your first video to get started</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videoLibrary.map((video) => (
                <div
                  key={video.id}
                  onClick={() => onVideoSelect(video)}
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
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        title="Upload Video to Library"
      />
    </div>
  );
};

export default VideoLibraryModal;