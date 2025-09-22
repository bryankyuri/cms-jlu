import React, { useRef } from "react";
import { FiUpload, FiVideo } from "react-icons/fi";
import CompressionStats from "../../../components/Media/CompressionStats";
import OptimizationSettings from "../../../components/Media/OptimizationSettings";

const UploadModal = ({
  isUploadModalOpen,
  setIsUploadModalOpen,
  selectedFilesForUpload,
  setSelectedFilesForUpload,
  isUploading,
  uploadProgress,
  optimizationLevel,
  setOptimizationLevel,
  handleFileSelect,
  handleRemoveFileFromUpload,
  handleBatchUpload,
  handleDragOver,
  handleDrop,
}) => {
  const fileInputRef = useRef(null);

  if (!isUploadModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <h2 className="text-xl font-bold mb-4">Upload Files</h2>

        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Left side - File upload area */}
          <div className="flex-1 flex flex-col">
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
                className="border-2 border-dashed border-gray-300 rounded p-8 text-center hover:border-black transition-colors flex-1 flex items-center justify-center"
              >
                <div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedFilesForUpload.map((filePreview) => (
                      <div key={filePreview.id} className="border rounded-lg p-3 relative">
                        <button
                          onClick={() => handleRemoveFileFromUpload(filePreview.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 z-10"
                        >
                          ×
                        </button>
                        
                        <div className="mb-2 aspect-square bg-gray-100 rounded overflow-hidden">
                          {filePreview.type?.startsWith('image/') ? (
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
                          <div className="flex items-center justify-between">
                            <p className="text-gray-500">
                              {(filePreview.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            {filePreview.originalSize && filePreview.size !== filePreview.originalSize && (
                              <p className="text-green-600 text-xs">
                                -{((filePreview.originalSize - filePreview.size) / filePreview.originalSize * 100).toFixed(0)}%
                              </p>
                            )}
                          </div>
                          {filePreview.compressionStats && (
                            <CompressionStats stats={filePreview.compressionStats} className="mt-1" />
                          )}
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
                        handleFileSelect(e.target.files);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right side - Optimization settings */}
          <div className="w-80 flex-shrink-0">
            <OptimizationSettings
              optimizationLevel={optimizationLevel}
              onOptimizationLevelChange={setOptimizationLevel}
            />
          </div>
        </div>

        {/* Upload progress */}
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

        {/* Action buttons */}
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
  );
};

export default UploadModal;