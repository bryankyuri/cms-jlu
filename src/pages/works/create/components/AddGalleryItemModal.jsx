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

const AddGalleryItemModal = ({
  isAddGalleryModalOpen,
  closeAddGalleryModal,
  editingGalleryItem,
  selectedImageType,
  IMAGE_TYPES,
  handleImageTypeChange,
  handleDragOver,
  handleDrop,
  handleImageUpload,
  isUploading,
  uploadProgress,
  selectedImages,
  handleImageSelection,
  updateGalleryItem,
  addGalleryItem,
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

  // Preview image state
  const [previewImage, setPreviewImage] = React.useState(null);

  const openImagePreview = (image) => {
    setPreviewImage(image);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  if (!isAddGalleryModalOpen) return null;

  const currentTypeConfig = IMAGE_TYPES.find(
    (type) => type.value === selectedImageType
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-medium">
            {editingGalleryItem ? "Edit Gallery Item" : "Add Gallery Item"}
          </h3>
          <button
            onClick={closeAddGalleryModal}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow">
          {/* Image Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Image Type
            </label>
            
            {/* Full Width Section */}
            <div className="mb-5">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Full Width</h4>
              <div className="grid grid-cols-5 gap-3">
                {IMAGE_TYPES.filter(type => type.category === "Full Width").map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleImageTypeChange(type.value)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      selectedImageType === type.value
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {type.imageCount} image
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Two Column Section */}
            <div className="mb-5">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Two Column</h4>
              <div className="grid grid-cols-5 gap-3">
                {IMAGE_TYPES.filter(type => type.category === "Two Column").map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleImageTypeChange(type.value)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      selectedImageType === type.value
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {type.imageCount} images
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Before/After Comparison Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Before/After Comparison</h4>
              <div className="grid grid-cols-5 gap-3">
                {IMAGE_TYPES.filter(type => type.category === "Before/After Comparison").map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleImageTypeChange(type.value)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      selectedImageType === type.value
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {type.imageCount} images
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            {editingGalleryItem && (
              <div className="w-full mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Images
                </label>
                <div className=" rounded-lg">
                  {editingGalleryItem.type === "full-width" ? (
                    // Single image display
                    <div className="w-full h-80 overflow-hidden rounded-lg">
                      <img
                        src={editingGalleryItem.imageUrl}
                        alt="Current image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    // Multiple images display
                    <div className="flex gap-3">
                      {Array.isArray(editingGalleryItem.imageUrl) ? (
                        editingGalleryItem.imageUrl.map((url, index) => (
                          <div
                            key={index}
                            className="w-full h-80 overflow-hidden rounded-lg"
                          >
                            <img
                              src={url}
                              alt={`Current image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="w-24 h-24 overflow-hidden rounded-lg">
                          <img
                            src={editingGalleryItem.imageUrl}
                            alt="Current image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    These are the current images. Select new images below to
                    replace them.
                  </p>
                </div>
              </div>
            )}

            {/* Selected Images Preview */}
            <div className="w-full mb-6">
              {selectedImages.length > 0 && currentTypeConfig && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Images ({selectedImages.length}/
                    {currentTypeConfig.imageCount})
                  </label>
                  <div className="flex gap-3 items-center">
                    {selectedImages.map((image, index) => (
                      <div
                        key={image.id}
                        className={`relative`}
                        style={{
                          width: `${100 / currentTypeConfig.imageCount}%`,
                        }}
                      >
                        <img
                          src={mediaAPI.getDirectUrl(image.path)}
                          alt={image.alt_text || image.original_name}
                          className="w-full h-80 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => handleImageSelection(image)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Existing Images Section (only shown when editing) */}

          {/* Image Selection Grid */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Images from Gallery
              {currentTypeConfig && (
                <span className="text-gray-500 text-xs ml-2">
                  (Select {currentTypeConfig.imageCount} image
                  {currentTypeConfig.imageCount > 1 ? "s" : ""})
                </span>
              )}
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
                      Upload some images first to use them in your project
                      gallery.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 min-h-52 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availableImages.map((image) => {
                    const isSelected = selectedImages.find(
                      (img) => img.id === image.id
                    );
                    const canSelect =
                      !currentTypeConfig ||
                      selectedImages.length < currentTypeConfig.imageCount ||
                      isSelected;

                    return (
                      <div
                        key={image.id}
                        className={`group relative rounded-lg overflow-hidden border-2 transition-all h-48 ${
                          isSelected
                            ? "border-green-500 ring-2 ring-green-500 ring-opacity-50"
                            : canSelect
                            ? "border-gray-200 hover:border-gray-400"
                            : "border-gray-200 opacity-50"
                        }`}
                      >
                        <img
                          src={mediaAPI.getDirectUrl(image.path)}
                          alt={image.alt_text || image.original_name}
                          className="w-full h-48 object-cover"
                        />

                        {/* Hover overlay with buttons */}
                        {canSelect && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => {handleImageSelection(image)}}
                              className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs"
                              title={
                                isSelected ? "Unselect Image" : "Select Image"
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
                              onClick={() => openImagePreview(image)}
                              className="bg-white text-black p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1 text-xs"
                              title="Preview Image"
                            >
                              <FiEye size={12} />
                              Preview
                            </button>
                          </div>
                        )}

                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-full p-1 border-green-500 border-2">
                            <FiCheck className="text-green-500" size={14} />
                          </div>
                        )}

                        {/* Image name overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                          <div className="text-white text-xs truncate">
                            {image.original_name}
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
            onClick={closeAddGalleryModal}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-3 text-sm font-semibold rounded-md bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={editingGalleryItem ? updateGalleryItem : addGalleryItem}
            disabled={
              !currentTypeConfig ||
              selectedImages.length !== currentTypeConfig.imageCount
            }
          >
            {editingGalleryItem ? "Update Item" : "Add Item"}
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
        title="Upload Gallery Images"
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

export default AddGalleryItemModal;
