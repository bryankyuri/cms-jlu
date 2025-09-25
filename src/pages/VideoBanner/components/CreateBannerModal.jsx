import React from 'react';
import { FiX, FiVideo } from 'react-icons/fi';
import WorksSelectionTable from './WorksSelectionTable';

const CreateBannerModal = ({
  isOpen,
  onClose,
  publishedWorks,
  selectedWork,
  onWorkSelect,
  selectedVideo,
  useCustomVideo,
  onCustomVideoToggle,
  onVideoLibraryOpen,
  onCreateBanner,
  // Works pagination and filtering props
  worksLoading,
  worksError,
  worksCurrentPage,
  worksTotalPages,
  worksTotalWorks,
  worksPerPage = 10,
  worksSearchQuery,
  worksCategoryFilter,
  worksTagsFilter,
  onWorksPageChange,
  onWorksPerPageChange,
  onWorksSearchChange,
  onWorksCategoryChange,
  onWorksTagsChange,
  onClearWorksFilters,
  onRetryWorks
}) => {
  if (!isOpen) return null;

  // Determine which video to display in preview
  const getPreviewVideo = () => {
    if (useCustomVideo) {
      return selectedVideo; // Show selected custom video
    } else if (selectedWork && selectedWork.video_project_src) {
      // Show work's default video
      return {
        url: selectedWork.video_project_src,
        thumbnail: selectedWork.video_project_poster || selectedWork.hero_banner_image,
        name: `${selectedWork.title} - Default Video`,
        isDefault: true
      };
    }
    return null;
  };

  const previewVideo = getPreviewVideo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">Create Video Banner</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          {/* Step 1: Select Work */}
          <div className="mb-8">
            <h4 className="text-md font-medium mb-4">1. Select Published Work</h4>
            <WorksSelectionTable
              works={publishedWorks}
              loading={worksLoading}
              error={worksError}
              selectedWork={selectedWork}
              onWorkSelect={onWorkSelect}
              currentPage={worksCurrentPage}
              totalPages={worksTotalPages}
              totalWorks={worksTotalWorks}
              perPage={worksPerPage}
              onPageChange={onWorksPageChange}
              onPerPageChange={onWorksPerPageChange}
              searchQuery={worksSearchQuery}
              onSearchChange={onWorksSearchChange}
              categoryFilter={worksCategoryFilter}
              onCategoryChange={onWorksCategoryChange}
              tagsFilter={worksTagsFilter}
              onTagsChange={onWorksTagsChange}
              onClearFilters={onClearWorksFilters}
              onRetry={onRetryWorks}
            />
          </div>

          {/* Step 2: Video Selection */}
          {selectedWork && (
            <div className="mb-8">
              <h4 className="text-md font-medium mb-4">2. Select Video</h4>
              
              {/* Video Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h5 className="font-medium mb-2">Preview</h5>
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                      {previewVideo ? (
                        <video
                          src={previewVideo.url}
                          poster={previewVideo.thumbnail}
                          controls
                          className="w-full h-full object-cover"
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="mb-2">
                              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-gray-400 text-sm">
                              {selectedWork ? 'Select video source below' : 'Select a work first'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {previewVideo && (
                      <div className="mt-2 p-3 bg-gray-50 rounded">
                        <p className="font-medium text-sm">{previewVideo.name}</p>
                        <p className="text-xs text-gray-500">
                          {previewVideo.isDefault ? 'Default work video' : 'Custom video from library'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Video Options</h5>
                  
                  {/* Default Video Option */}
                  <div className={`border-2 rounded-lg p-4 mb-3 cursor-pointer ${
                    !useCustomVideo ? 'border-black bg-gray-50' : 'border-gray-200'
                  }`}
                  onClick={() => onCustomVideoToggle(false, selectedWork)}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                        !useCustomVideo ? 'border-black bg-black' : 'border-gray-300'
                      }`}>
                        {!useCustomVideo && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                      </div>
                      <span className="font-medium">Use Work's Default Video</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      {selectedWork.video_project_src 
                        ? 'Video from work\'s'
                        : 'No default video available for this work'
                      }
                    </p>
                  </div>

                  {/* Custom Video Option */}
                  <div className={`border-2 rounded-lg p-4 cursor-pointer ${
                    useCustomVideo ? 'border-black bg-gray-50' : 'border-gray-200'
                  }`}
                  onClick={() => onCustomVideoToggle(true)}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                        useCustomVideo ? 'border-black bg-black' : 'border-gray-300'
                      }`}>
                        {useCustomVideo && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                      </div>
                      <span className="font-medium">Use Custom Video</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6 mb-3">
                      Select from video library or upload new video
                    </p>
                    
                    {useCustomVideo && (
                      <div className="ml-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVideoLibraryOpen();
                          }}
                          className="bg-black text-white px-4 py-2 rounded text-sm"
                        >
                          <FiVideo className="inline mr-2" />
                          Select from Library
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedWork && previewVideo
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            onClick={onCreateBanner}
            disabled={!selectedWork || !previewVideo}
          >
            Create Banner
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBannerModal;