import React from "react";
import {
  FiX,
  FiUpload,
  FiImage,
  FiCheck,
} from "react-icons/fi";
import { mediaAPI } from "../../../../api/index";

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
  loadingImages,
  availableImages,
  updateGalleryItem,
  addGalleryItem
}) => {
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Type
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {IMAGE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleImageTypeChange(type.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedImageType === type.value
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400 bg-white"
                  }`}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {type.imageCount} image{type.imageCount > 1 ? "s" : ""}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Existing Images Section (only shown when editing) */}
          {editingGalleryItem && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Images
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                {editingGalleryItem.type === "full-width" ? (
                  // Single image display
                  <div className="w-32 h-32 overflow-hidden rounded-lg">
                    <img
                      src={editingGalleryItem.imageUrl}
                      alt="Current image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  // Multiple images display
                  <div className="flex gap-3 flex-wrap">
                    {Array.isArray(editingGalleryItem.imageUrl) 
                      ? editingGalleryItem.imageUrl.map((url, index) => (
                          <div key={index} className="w-24 h-24 overflow-hidden rounded-lg">
                            <img
                              src={url}
                              alt={`Current image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))
                      : (
                          <div className="w-24 h-24 overflow-hidden rounded-lg">
                            <img
                              src={editingGalleryItem.imageUrl}
                              alt="Current image"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )
                    }
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  These are the current images. Select new images below to replace them.
                </p>
              </div>
            </div>
          )}

          {/* Upload New Images Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Images
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
            >
              <FiUpload className="mx-auto text-3xl text-gray-400 mb-3" />
              <p className="text-gray-600 mb-2">Drag and drop images here, or</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="gallery-upload"
              />
              <label
                htmlFor="gallery-upload"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer inline-block"
              >
                Browse Images
              </label>
              <p className="text-xs text-gray-500 mt-2">Only image files are allowed</p>
              
              {isUploading && (
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Images ({selectedImages.length}/
                {currentTypeConfig.imageCount})
              </label>
              <div className="flex gap-3 flex-wrap">
                {selectedImages.map((image, index) => (
                  <div key={image.id} className="relative">
                    <img
                      src={mediaAPI.getDirectUrl(image.path)}
                      alt={image.alt_text || image.original_name}
                      className="w-20 h-20 object-cover rounded-lg border"
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
            </div>
          )}

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

            {loadingImages ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                <p className="mt-2 text-gray-500">Loading images...</p>
              </div>
            ) : availableImages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiImage size={48} className="mx-auto mb-4 opacity-50" />
                <p>No images found in your media gallery.</p>
                <p className="text-sm">
                  Upload some images first to use them in your project
                  gallery.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto">
                {availableImages.map((image) => {
                  const isSelected = selectedImages.find(
                    (img) => img.id === image.id
                  );
                  const canSelect =
                    selectedImages.length < currentTypeConfig.imageCount ||
                    isSelected;

                  return (
                    <div
                      key={image.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-black ring-2 ring-black ring-opacity-50"
                          : canSelect
                          ? "border-gray-200 hover:border-gray-400"
                          : "border-gray-200 opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => canSelect && handleImageSelection(image)}
                    >
                      <img
                        src={mediaAPI.getDirectUrl(image.path)}
                        alt={image.alt_text || image.original_name}
                        className="w-full h-20 object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <FiCheck className="text-white" size={20} />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                        <div className="text-white text-xs truncate">
                          {image.original_name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
    </div>
  );
};

export default AddGalleryItemModal;