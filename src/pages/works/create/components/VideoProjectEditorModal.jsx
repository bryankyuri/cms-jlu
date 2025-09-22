import React from "react";
import {
  FiX,
  FiUpload,
  FiCheck,
  FiSearch,
  FiChevronDown,
  FiEye,
  FiMousePointer,
  FiVideo,
} from "react-icons/fi";
import { mediaAPI } from "../../../../api/index";
import VideoUploadModal from "../../../../components/modals/VideoUploadModal";
import ModalPagination from "./ModalPagination";
import { useModalVideoSelection } from "../hooks/useModalVideoSelection";

const VideoProjectEditorModal = ({
  isVideoProjectModalOpen,
  closeVideoProjectModal,
  workData,
  selectedVideoProject,
  setSelectedVideoProject,
  handleVideoProjectSelection,
  updateVideoProject,
  // Upload modal props
  isVideoUploadModalOpen,
  openVideoUploadModal,
  closeVideoUploadModal,
}) => {
  // Use the custom hook for video selection with search, sort, and pagination
  const {
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
  } = useModalVideoSelection();

  // Preview video state
  const [previewVideo, setPreviewVideo] = React.useState(null);

  const openVideoPreview = (video) => {
    setPreviewVideo(video);
  };

  const closeVideoPreview = () => {
    setPreviewVideo(null);
  };

  if (!isVideoProjectModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-medium">Select Project Video</h3>
          <button
            onClick={closeVideoProjectModal}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow">
          {/* Current Video Preview */}
          <div className="flex w-full gap-8">
            <div className="mb-6 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Project Video
              </label>
              <div className="w-full h-[550px] overflow-hidden rounded-lg border bg-black flex items-center justify-center">
                {workData.videoProjectSrc ? (
                  <video
                    src={workData.videoProjectSrc}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    poster={workData.videoProjectPosterUrl}
                  />
                ) : (
                  <div className="text-white text-center">
                    <p>No Video</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mb-6 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Project Video
              </label>
              <div className="w-full h-[550px] overflow-hidden rounded-lg border bg-black flex items-center justify-center">
                {selectedVideoProject ? (
                  <video
                    src={mediaAPI.getDirectUrl(selectedVideoProject.path)}
                    className="w-full h-full object-cover"
                    controls
                    poster={selectedVideoProject.poster_url}
                    preload="metadata"
                  />
                ) : (
                  <div className="text-white text-center">
                    <p>No Video Selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Video Selection Grid */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project Video from Gallery
            </label>

            {/* Search and Sort Controls */}
            <div className="flex w-full items-center mb-8 ">
              <div className="flex gap-4 w-full">
                <div className="relative flex-1">
                  <FiSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-b border-gray-300 focus:outline-none focus:border-black text-sm"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-black text-sm"
                >
                  <option value="created_at">Date Created</option>
                  <option value="original_name">Name</option>
                  <option value="size">Size</option>
                </select>
                <select
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value)}
                  className="px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-black text-sm"
                >
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </select>
                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-black text-sm"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={30}>30 per page</option>
                  <option value={40}>40 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>

              <div className="flex w-[300px] justify-end">
                <button
                  onClick={openVideoUploadModal}
                  className="bg-black hover:bg-black text-white px-4 py-2 rounded-md"
                >
                  Upload Video
                </button>
              </div>
            </div>

            {/* Results Info */}
            {pagination.total && (
              <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
                <span>
                  Showing {(currentPage - 1) * perPage + 1} -{" "}
                  {Math.min(currentPage * perPage, pagination.total)} of{" "}
                  {pagination.total} videos
                  {searchQuery && ` (filtered by "${searchQuery}")`}
                </span>
                <ModalPagination
                  pagination={pagination}
                  currentPage={currentPage}
                  handlePageChange={handlePageChange}
                  handlePrevPage={handlePrevPage}
                  handleNextPage={handleNextPage}
                  size="small"
                />
              </div>
            )}

            {loadingVideos ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                <p className="mt-2 text-gray-500">Loading videos...</p>
              </div>
            ) : availableVideos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiUpload size={48} className="mx-auto mb-4 opacity-50" />
                {searchQuery ? (
                  <>
                    <p>No videos found for "{searchQuery}".</p>
                    <p className="text-sm">Try adjusting your search terms.</p>
                  </>
                ) : (
                  <>
                    <p>No videos found in your media gallery.</p>
                    <p className="text-sm">
                      Upload some videos first to use as project video.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 min-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availableVideos.map((video) => {
                    const isSelected = selectedVideoProject?.id === video.id;

                    return (
                      <div
                        key={video.id}
                        className={`group relative h-48 rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected
                            ? "border-green-500 ring-2 ring-green-500 ring-opacity-50"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <div className="w-full h-48 bg-black flex items-center justify-center relative">
                          {video.poster_url ? (
                            // Display poster image if available
                            <img
                              src={video.poster_url}
                              alt={video.original_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            // Fall back to video preview
                            <video
                              src={mediaAPI.getDirectUrl(video.path)}
                              className="w-full h-full object-cover"
                              preload="metadata"
                              muted
                            />
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <FiVideo className="text-white" size={20} />
                          </div>
                        </div>

                        {/* Hover overlay with buttons */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              isSelected
                                ? handleVideoProjectSelection("")
                                : handleVideoProjectSelection(video);
                            }}
                            className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs"
                            title={
                              isSelected ? "Unselect Video" : "Select Video"
                            }
                          >
                            {isSelected ? (
                              <FiX size={16} className="text-red-500" />
                            ) : (
                              <FiCheck size={16} className="text-green-500" />
                            )}
                            {isSelected ? "Unselect" : "Select"}
                          </button>
                          <button
                            onClick={() => openVideoPreview(video)}
                            className="bg-white text-black p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1 text-xs"
                            title="Preview Video"
                          >
                            <FiEye size={12} />
                            Preview
                          </button>
                        </div>

                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-full p-1 border-green-500 border-2">
                            <FiCheck className="text-green-500" size={14} />
                          </div>
                        )}

                        {/* Video name overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                          <div className="text-white text-xs truncate">
                            {video.original_name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Pagination */}
                {pagination.last_page > 1 && (
                  <div className="flex justify-center mt-4">
                    <ModalPagination
                      pagination={pagination}
                      currentPage={currentPage}
                      handlePageChange={handlePageChange}
                      handlePrevPage={handlePrevPage}
                      handleNextPage={handleNextPage}
                      size="normal"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 mr-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            onClick={closeVideoProjectModal}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-3 text-sm font-semibold rounded-md bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={updateVideoProject}
            disabled={!selectedVideoProject}
          >
            Update Project Video
          </button>
        </div>
      </div>

      {/* Separate Video Upload Modal */}
      <VideoUploadModal
        isOpen={isVideoUploadModalOpen}
        onClose={closeVideoUploadModal}
        onUploadSuccess={() => {
          // Refresh the available videos after successful upload
          fetchAvailableVideos();
          closeVideoUploadModal();
        }}
        title="Upload Project Video"
      />

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4 w-full">
          <div className="relative w-full max-w-[800px] max-h-full">
            <button
              onClick={closeVideoPreview}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-2"
            >
              <FiX size={24} />
            </button>
            <video
              src={mediaAPI.getDirectUrl(previewVideo.path)}
              className="w-full max-h-[80vh] object-contain rounded-lg"
              controls
              autoPlay={false}
              poster={previewVideo.poster_url}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoProjectEditorModal;
