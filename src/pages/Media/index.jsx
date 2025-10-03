import React from "react";
import { Tab } from "@headlessui/react";
import { FiGrid, FiList, FiUpload, FiSearch, FiChevronDown, FiImage, FiVideo } from "react-icons/fi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import components
import MediaPreviewer from "./components/MediaPreviewer";
import UploadModal from "./components/UploadModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import MediaGrid from "./components/MediaGrid";
import Pagination from "./components/Pagination";
import ImageUploadModal from "../../components/modals/ImageUploadModal";
import VideoUploadModal from "../../components/modals/VideoUploadModal";

// Import custom hooks
import {
  useMediaFiles,
  useFileUpload,
  useMediaPreviewer,
  useModalManager,
  useMediaUI,
} from "./hooks";

const Media = () => {
  // Custom hooks for state management
  const {
    mediaFiles,
    pagination,
    isLoading,
    currentPage,
    perPage,
    searchQuery,
    sortBy,
    sortDirection,
    mediaTypeFilter,
    setSearchQuery,
    setSortBy,
    setSortDirection,
    setMediaTypeFilter,
    loadMediaFiles,
    handlePageChange,
    handleNextPage,
    handlePrevPage,
    handlePerPageChange,
    deleteMediaFile,
  } = useMediaFiles();

  const {
    selectedFilesForUpload,
    isUploading,
    uploadProgress,
    optimizationLevel,
    setSelectedFilesForUpload,
    setOptimizationLevel,
    handleFileSelect,
    handleRemoveFileFromUpload,
    handleBatchUpload,
    handleDirectFileUpload,
  } = useFileUpload(loadMediaFiles);

  const {
    isPreviewerOpen,
    currentPreviewIndex,
    previewMediaList,
    setIsPreviewerOpen,
    handleMediaClick,
    handlePreviousMedia,
    handleNextMedia,
  } = useMediaPreviewer();

  const {
    isUploadModalOpen,
    isDeleteModalOpen,
    fileToDelete,
    setIsUploadModalOpen,
    handleDeleteFile,
    cancelDeleteFile,
  } = useModalManager();

  const {
    activeTab,
    viewMode,
    handleTabChange,
    toggleViewMode,
    getFileIcon,
    formatFileSize,
    handleDragOver,
    handleDrop,
  } = useMediaUI();

  // State for upload modals
  const [isImageUploadOpen, setIsImageUploadOpen] = React.useState(false);
  const [isVideoUploadOpen, setIsVideoUploadOpen] = React.useState(false);
  const [isUploadDropdownOpen, setIsUploadDropdownOpen] = React.useState(false);

  // Ref for dropdown to handle click outside
  const dropdownRef = React.useRef(null);

  // Handle click outside dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUploadDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle upload success - refresh media files
  const handleUploadSuccess = () => {
    loadMediaFiles();
  };

  // Handle upload modal actions
  const openImageUpload = () => setIsImageUploadOpen(true);
  const closeImageUpload = () => setIsImageUploadOpen(false);
  const openVideoUpload = () => setIsVideoUploadOpen(true);
  const closeVideoUpload = () => setIsVideoUploadOpen(false);

  // Handle dropdown actions
  const toggleUploadDropdown = () => setIsUploadDropdownOpen(!isUploadDropdownOpen);
  const handleImageUploadClick = () => {
    setIsUploadDropdownOpen(false);
    openImageUpload();
  };
  const handleVideoUploadClick = () => {
    setIsUploadDropdownOpen(false);
    openVideoUpload();
  };

  // Handle tab change with media type filter
  const onTabChange = (tabIndex) => {
    const mediaType = handleTabChange(tabIndex);
    setMediaTypeFilter(mediaType);
  };

  // Handle file deletion with confirmation
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    const success = await deleteMediaFile(fileToDelete.id);
    if (success) {
      // Close previewer if deleted file was being previewed
      if (
        isPreviewerOpen &&
        previewMediaList[currentPreviewIndex]?.id === fileToDelete.id
      ) {
        setIsPreviewerOpen(false);
      }
    }

    cancelDeleteFile();
  };

  // Handle media click with current media files
  const onMediaClick = (file) => {
    handleMediaClick(file, mediaFiles);
  };

  return (
    <div className="media-library px-5 py-8">
      {/* Header */}
      <div className="flex justify-center items-center mb-6">
        <h1 className="lg:text-[40px] text-[36px] text-black font-bold lg:mb-[60px] text-center">
          MEDIA LIBRARY
        </h1>
      </div>

      <Tab.Group selectedIndex={activeTab} onChange={onTabChange}>
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
                <option value="size">Size</option>
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
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <FiGrid size={18} />
              </button>
              <button
                onClick={() => toggleViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <FiList size={18} />
              </button>
              <div className="flex w-[450px] justify-end gap-8">
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={toggleUploadDropdown}
                    className="bg-black text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <FiUpload size={18} />
                    Upload
                    <FiChevronDown size={16} className={`transition-transform ${isUploadDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isUploadDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <button
                        onClick={handleImageUploadClick}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FiImage size={16} />
                        Images
                      </button>
                      <button
                        onClick={handleVideoUploadClick}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-t border-gray-100"
                      >
                        <FiVideo size={16} />
                        Videos
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
            <Pagination
              pagination={pagination}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
              handlePrevPage={handlePrevPage}
              handleNextPage={handleNextPage}
            />
          </div>

          <Tab.Panels>
            <Tab.Panel>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  <p className="mt-4 text-gray-500">Loading media files...</p>
                </div>
              ) : (
                <MediaGrid
                  mediaFiles={mediaFiles}
                  viewMode={viewMode}
                  handleMediaClick={onMediaClick}
                  handleDeleteFile={handleDeleteFile}
                  getFileIcon={getFileIcon}
                  formatFileSize={formatFileSize}
                  onRefetchMedia={loadMediaFiles}
                />
              )}
            </Tab.Panel>
            <Tab.Panel>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  <p className="mt-4 text-gray-500">Loading images...</p>
                </div>
              ) : (
                <MediaGrid
                  mediaFiles={mediaFiles}
                  viewMode={viewMode}
                  handleMediaClick={onMediaClick}
                  handleDeleteFile={handleDeleteFile}
                  getFileIcon={getFileIcon}
                  formatFileSize={formatFileSize}
                  onRefetchMedia={loadMediaFiles}
                />
              )}
            </Tab.Panel>
            <Tab.Panel>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  <p className="mt-4 text-gray-500">Loading videos...</p>
                </div>
              ) : (
                <MediaGrid
                  mediaFiles={mediaFiles}
                  viewMode={viewMode}
                  handleMediaClick={onMediaClick}
                  handleDeleteFile={handleDeleteFile}
                  getFileIcon={getFileIcon}
                  formatFileSize={formatFileSize}
                  onRefetchMedia={loadMediaFiles}
                />
              )}
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>

      {/* Media Previewer */}
      <MediaPreviewer
        isPreviewerOpen={isPreviewerOpen}
        setIsPreviewerOpen={setIsPreviewerOpen}
        previewMediaList={previewMediaList}
        currentPreviewIndex={currentPreviewIndex}
        handlePreviousMedia={handlePreviousMedia}
        handleNextMedia={handleNextMedia}
      />

      {/* Upload Modal */}
      <UploadModal
        isUploadModalOpen={isUploadModalOpen}
        setIsUploadModalOpen={setIsUploadModalOpen}
        selectedFilesForUpload={selectedFilesForUpload}
        setSelectedFilesForUpload={setSelectedFilesForUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        optimizationLevel={optimizationLevel}
        setOptimizationLevel={setOptimizationLevel}
        handleFileSelect={handleFileSelect}
        handleRemoveFileFromUpload={handleRemoveFileFromUpload}
        handleBatchUpload={handleBatchUpload}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isDeleteModalOpen={isDeleteModalOpen}
        fileToDelete={fileToDelete}
        confirmDeleteFile={confirmDeleteFile}
        cancelDeleteFile={cancelDeleteFile}
      />

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageUploadOpen}
        onClose={closeImageUpload}
        onUploadSuccess={handleUploadSuccess}
        title="Upload Images"
      />

      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={isVideoUploadOpen}
        onClose={closeVideoUpload}
        onUploadSuccess={handleUploadSuccess}
        title="Upload Video"
      />

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Media;
