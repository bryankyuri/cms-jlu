import React from "react";
import {
  FiX,
  FiUpload,
  FiImage,
  FiCheck,
  FiSearch,
  FiEye,
  FiMousePointer,
} from "react-icons/fi";
import { mediaAPI } from "../../../../api/index";
import ImageUploadModal from "../../../../components/modals/ImageUploadModal";
import ModalPagination from "./ModalPagination";
import { useModalImageSelection } from "../hooks/useModalImageSelection";

const HeroBannerEditorModal = ({
  isHeroBannerModalOpen,
  closeHeroBannerModal,
  workData,
  selectedHeroBannerImage,
  setSelectedHeroBannerImage,
  handleDragOver,
  handleDrop,
  handleImageUpload,
  isUploading,
  uploadProgress,
  handleHeroBannerImageSelection,
  updateHeroBannerImage,
  // Upload modal props
  isImageUploadModalOpen,
  openImageUploadModal,
  closeImageUploadModal,
}) => {
  // Use the custom hook for image selection with search, sort, and pagination
  const {
    availableImages,
    pagination,
    loadingImages,
    currentPage,
    perPage,
    searchQuery,
    sortBy,
    sortDirection,
    setSearchQuery,
    setSortBy,
    setSortDirection,
    fetchAvailableImages,
    handlePageChange,
    handleNextPage,
    handlePrevPage,
    handlePerPageChange,
  } = useModalImageSelection();

  // State for image preview
  const [previewImage, setPreviewImage] = React.useState(null);

  // Handle image preview
  const handleImagePreview = (image) => {
    setPreviewImage(image);
  };

  // Close image preview
  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  if (!isHeroBannerModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-medium">Edit Hero Banner Image</h3>
          <button
            onClick={closeHeroBannerModal}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          {/* Current Hero Banner Preview */}
          <div className="flex w-full gap-8">
            <div className="mb-6 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Hero Banner
              </label>
              <div
                className="w-full h-[550px] overflow-hidden rounded-lg border flex justify-center items-center"
                style={{
                  backgroundImage: `url(${workData.heroBannerImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: "black",
                }}
              >
                {!workData.heroBannerImage && (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    No Image
                  </div>
                )}
              </div>
            </div>
            <div className="mb-6 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Hero Banner
              </label>
              <div
                className="w-full h-[550px] overflow-hidden rounded-lg border flex justify-center items-center"
                style={{
                  backgroundImage: `url(${
                    selectedHeroBannerImage
                      ? mediaAPI.getDirectUrl(selectedHeroBannerImage.path)
                      : ""
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: "black",
                }}
              >
                {!selectedHeroBannerImage && (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    No Image Selected
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Image Preview */}
          {selectedHeroBannerImage && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Image
              </label>
              <div className="flex items-center bg-gray-50 rounded-lg p-3">
                <div className="w-20 h-20 overflow-hidden rounded-md flex-shrink-0">
                  <img
                    src={mediaAPI.getDirectUrl(selectedHeroBannerImage.path)}
                    alt={
                      selectedHeroBannerImage.alt_text ||
                      selectedHeroBannerImage.original_name
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3 flex-grow">
                  <div className="font-medium text-sm">
                    {selectedHeroBannerImage.original_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedHeroBannerImage.alt_text && (
                      <span>{selectedHeroBannerImage.alt_text}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHeroBannerImage(null)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Image Selection Grid */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Hero Banner Image from Gallery
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
                    placeholder="Search images..."
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
                  onClick={openImageUploadModal}
                  className="bg-black hover:bg-black text-white px-4 py-2 rounded-md"
                >
                  Upload Image
                </button>
              </div>
            </div>

            {/* Results Info */}
            {pagination.total && (
              <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
                <span>
                  Showing {(currentPage - 1) * perPage + 1} -{" "}
                  {Math.min(currentPage * perPage, pagination.total)} of{" "}
                  {pagination.total} images
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

            {loadingImages ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                <p className="mt-2 text-gray-500">Loading images...</p>
              </div>
            ) : availableImages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiImage size={48} className="mx-auto mb-4 opacity-50" />
                {searchQuery ? (
                  <>
                    <p>No images found for "{searchQuery}".</p>
                    <p className="text-sm">Try adjusting your search terms.</p>
                  </>
                ) : (
                  <>
                    <p>No images found in your media gallery.</p>
                    <p className="text-sm">
                      Upload some images first to use as hero banner.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 min-h-96 border border-gray-200 rounded-lg p-3">
                  {availableImages.map((image) => {
                    const isSelected = selectedHeroBannerImage?.id === image.id;

                    return (
                      <div
                        key={image.id}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all group ${
                          isSelected
                            ? "border-black ring-2 ring-black ring-opacity-50"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={mediaAPI.getDirectUrl(image.path)}
                          alt={image.alt_text || image.original_name}
                          className="w-full h-48 object-cover"
                        />

                        {/* Hover overlay with buttons */}
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImagePreview(image);
                            }}
                            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-all"
                            title="Preview Image"
                          >
                            <FiEye size={14} />
                            Preview
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHeroBannerImageSelection(image);
                            }}
                            className="bg-black bg-opacity-90 hover:bg-opacity-100 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-all"
                            title={
                              isSelected ? "Unselect Image" : "Select Image"
                            }
                          >
                            <FiMousePointer size={14} />
                            {isSelected ? "Unselect" : "Select"}
                          </button>
                        </div>

                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-full p-1 border-green-500 border-2">
                            <FiCheck className="text-green-500" size={14} />
                          </div>
                        )}

                        {/* Image name overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                          <div className="text-white text-xs truncate font-medium">
                            {image.original_name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

            {/* Bottom Pagination */}
          </div>
        </div>

        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 mr-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            onClick={closeHeroBannerModal}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-3 text-sm font-semibold rounded-md bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={updateHeroBannerImage}
            disabled={!selectedHeroBannerImage}
          >
            Update Hero Banner
          </button>
        </div>
      </div>

      {/* Separate Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={closeImageUploadModal}
        onUploadSuccess={() => {
          // Refresh the available images after successful upload
          fetchAvailableImages();
          closeImageUploadModal();
        }}
        title="Upload Hero Banner Images"
      />

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImagePreview}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-2"
            >
              <FiX size={24} />
            </button>
            <img
              src={mediaAPI.getDirectUrl(previewImage.path)}
              alt={previewImage.alt_text || previewImage.original_name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 rounded-b-lg">
              <div className="text-white">
                <h3 className="font-medium text-lg">
                  {previewImage.original_name}
                </h3>
                {previewImage.alt_text && (
                  <p className="text-sm text-gray-300 mt-1">
                    {previewImage.alt_text}
                  </p>
                )}
                <div className="flex gap-4 text-xs text-gray-300 mt-2">
                  <span>{previewImage.extension?.toUpperCase()}</span>
                  <span>{Math.round(previewImage.size / 1024)} KB</span>
                  <span>
                    {new Date(previewImage.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroBannerEditorModal;
