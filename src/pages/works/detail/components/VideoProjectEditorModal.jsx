import React from "react";
import {
  FiX,
  FiUpload,
  FiCheck,
} from "react-icons/fi";
import { mediaAPI } from "../../../../api/index";

const VideoProjectEditorModal = ({
  isVideoProjectModalOpen,
  closeVideoProjectModal,
  workData,
  selectedVideoProject,
  setSelectedVideoProject,
  handleDragOver,
  handleVideoDrop,
  handleVideoUpload,
  isUploading,
  uploadProgress,
  loadingVideos,
  availableVideos,
  handleVideoProjectSelection,
  updateVideoProject
}) => {
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
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Project Video
            </label>
            <div className="w-full h-48 overflow-hidden rounded-lg border bg-black flex items-center justify-center">
              {workData.videoProjectSrc ? (
                <video
                  src={workData.videoProjectSrc}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              ) : (
                <div className="text-white text-center">
                  <FiUpload className="mx-auto mb-2" size={32} />
                  <p>No video selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload New Video Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Video
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleVideoDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
            >
              <FiUpload className="mx-auto text-3xl text-gray-400 mb-3" />
              <p className="text-gray-600 mb-2">Drag and drop videos here, or</p>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleVideoUpload(e.target.files)}
                className="hidden"
                id="video-project-upload"
              />
              <label
                htmlFor="video-project-upload"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer inline-block"
              >
                Browse Videos
              </label>
              <p className="text-xs text-gray-500 mt-2">Only video files are allowed</p>
              
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

          {/* Selected Video Preview */}
          {selectedVideoProject && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Video
              </label>
              <div className="flex items-center bg-gray-50 rounded-lg p-3">
                <div className="w-20 h-20 overflow-hidden rounded-md flex-shrink-0 bg-black flex items-center justify-center">
                  {selectedVideoProject.poster_url ? (
                    // Display poster image if available
                    <img
                      src={selectedVideoProject.poster_url}
                      alt={selectedVideoProject.original_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Fall back to video preview
                    <video
                      src={mediaAPI.getDirectUrl(selectedVideoProject.path)}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  )}
                </div>
                <div className="ml-3 flex-grow">
                  <div className="font-medium text-sm">
                    {selectedVideoProject.original_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedVideoProject.alt_text && (
                      <span>{selectedVideoProject.alt_text}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVideoProject(null)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Video Selection Grid */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project Video from Gallery
            </label>

            {loadingVideos ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                <p className="mt-2 text-gray-500">Loading videos...</p>
              </div>
            ) : availableVideos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiUpload size={48} className="mx-auto mb-4 opacity-50" />
                <p>No videos found in your media gallery.</p>
                <p className="text-sm">
                  Upload some videos first to use as project video.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
                {availableVideos.map((video) => {
                  const isSelected = selectedVideoProject?.id === video.id;

                  return (
                    <div
                      key={video.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-black ring-2 ring-black ring-opacity-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      onClick={() => handleVideoProjectSelection(video)}
                    >
                      <div className="w-full h-24 bg-black flex items-center justify-center relative">
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
                          <FiUpload className="text-white" size={20} />
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <FiCheck className="text-white" size={20} />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                        <div className="text-white text-xs truncate">
                          {video.original_name}
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
    </div>
  );
};

export default VideoProjectEditorModal;