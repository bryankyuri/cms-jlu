import React from "react";
import {
  FiX,
  FiUpload,
  FiImage,
  FiCheck,
} from "react-icons/fi";
import { mediaAPI } from "../../../../api/index";

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
  loadingImages,
  availableImages,
  handleHeroBannerImageSelection,
  updateHeroBannerImage
}) => {
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

        <div className="overflow-y-auto p-6 flex-grow">
          {/* Current Hero Banner Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Hero Banner
            </label>
            <div className="w-full h-48 overflow-hidden rounded-lg border">
              <img
                src={workData.heroBannerImage}
                alt="Current hero banner"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Upload New Image Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Image
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
                id="hero-banner-upload"
              />
              <label
                htmlFor="hero-banner-upload"
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

          {/* Selected Image Preview */}
          {selectedHeroBannerImage && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Image
              </label>
              <div className="flex items-center bg-gray-50 rounded-lg p-3">
                <div className="w-20 h-20 overflow-hidden rounded-md flex-shrink-0">
                  <img
                    src={mediaAPI.getDirectUrl(
                      selectedHeroBannerImage.path
                    )}
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
                  Upload some images first to use as hero banner.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
                {availableImages.map((image) => {
                  const isSelected = selectedHeroBannerImage?.id === image.id;

                  return (
                    <div
                      key={image.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-black ring-2 ring-black ring-opacity-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      onClick={() => handleHeroBannerImageSelection(image)}
                    >
                      <img
                        src={mediaAPI.getDirectUrl(image.path)}
                        alt={image.alt_text || image.original_name}
                        className="w-full h-24 object-cover"
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
    </div>
  );
};

export default HeroBannerEditorModal;