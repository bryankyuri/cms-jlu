import React, { useState } from 'react';
import { FiX, FiVideo } from 'react-icons/fi';
import { Stream } from "@cloudflare/stream-react";
import WorksSelectionTable from './WorksSelectionTable';
import { mediaAPI } from '../../../api/index';

const EditBannerModal = ({
  isOpen,
  onClose,
  currentBanner,
  allowWorkChange = true,
  publishedWorks = [],
  worksLoading = false,
  worksError = null,
  selectedWork,
  onWorkSelect,
  worksCurrentPage = 1,
  worksTotalPages = 0,
  worksTotalWorks = 0,
  worksPerPage = 10,
  onWorksPageChange,
  onWorksPerPageChange,
  worksSearchQuery = '',
  onWorksSearchChange,
  worksCategoryFilter = [],
  onWorksCategoryChange,
  worksTagsFilter = [],
  onWorksTagsChange,
  onClearWorksFilters,
  onRetryWorks,
  useCustomVideo,
  selectedVideo,
  onCustomVideoToggle,
  onVideoLibraryOpen,
  onSave,
  loading = false
}) => {
  const [cloudflareVideoUrl, setCloudflareVideoUrl] = useState('');
  const [videoSourceType, setVideoSourceType] = useState('default'); // 'default', 'custom', 'cloudflare'

  // Helper function to extract video ID from Cloudflare Stream URL
  const getCloudflareVideoId = (url) => {
    if (!url) return "";

    // Handle different Cloudflare Stream URL formats
    // Format 1: https://customer-domain.cloudflarestream.com/videoId/manifest/video.m3u8
    // Format 2: https://customer-domain.cloudflarestream.com/videoId
    // Format 3: https://iframe.videodelivery.net/videoId
    // Format 4: https://watch.videodelivery.net/videoId

    try {
      // Remove query parameters first
      const cleanUrl = url.split("?")[0];

      // Extract video ID from different URL patterns
      if (cleanUrl.includes("iframe.videodelivery.net") || cleanUrl.includes("watch.videodelivery.net")) {
        return cleanUrl.split("/").pop();
      } else if (cleanUrl.includes("cloudflarestream.com")) {
        const parts = cleanUrl.split("/");
        const videoIdIndex =
          parts.findIndex((part) => part.includes("cloudflarestream.com")) + 1;
        return parts[videoIdIndex] || cleanUrl.split("/").pop();
      } else {
        // Fallback: assume the last part is the video ID
        return cleanUrl.split("/").pop();
      }
    } catch (error) {
      console.error("Error extracting Cloudflare video ID:", error);
      return url;
    }
  };

  if (!isOpen || !currentBanner) return null;

  const work = publishedWorks.find(w => w.id === currentBanner.work_id);

  // CSS styles for Stream component
  const streamStyles = `
    .stream-preview-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    .stream-preview-container > div {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    
    [data-cloudflare-stream] {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
    }
    
    [data-cloudflare-stream] iframe {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
    }
  `;
  
  // Determine which video to display in preview (temp state, not current banner)
  const getPreviewVideo = () => {
    if (videoSourceType === 'cloudflare' && cloudflareVideoUrl) {
      // Show Cloudflare embed video
      return {
        url: cloudflareVideoUrl,
        thumbnail: null, // Cloudflare embeds don't have separate thumbnails
        name: 'Cloudflare Stream Video',
        isDefault: false,
        isCloudflare: true
      };
    } else if (videoSourceType === 'custom' || useCustomVideo) {
      // Show selected custom video from library
      if (selectedVideo) {
        console.log('🎬 Custom video preview data:', selectedVideo);
        
        // Handle different video object structures
        let videoUrl = null;
        let thumbnailUrl = null;
        
        // Try different URL properties
        if (selectedVideo.url) {
          videoUrl = selectedVideo.url;
        } else if (selectedVideo.src) {
          videoUrl = selectedVideo.src;
        } else if (selectedVideo.path) {
          videoUrl = mediaAPI.getDirectUrl(selectedVideo.path);
        } else if (selectedVideo.filename) {
          videoUrl = mediaAPI.getDirectUrl(selectedVideo.filename);
        } else if (selectedVideo.file_path) {
          videoUrl = mediaAPI.getDirectUrl(selectedVideo.file_path);
        }
        
        // Try different thumbnail properties
        if (selectedVideo.thumbnail) {
          thumbnailUrl = selectedVideo.thumbnail;
        } else if (selectedVideo.poster_url) {
          thumbnailUrl = selectedVideo.poster_url;
        } else if (selectedVideo.poster) {
          thumbnailUrl = selectedVideo.poster;
        } else {
          thumbnailUrl = videoUrl; // Use video URL as fallback
        }
        
        const videoName = selectedVideo.name || 
                         selectedVideo.original_name || 
                         selectedVideo.filename || 
                         'Custom Video';
        
        console.log('🎬 Processed video URLs:', { videoUrl, thumbnailUrl, videoName });
        
        if (!videoUrl) {
          console.error('❌ No video URL found in selectedVideo object:', selectedVideo);
          return null;
        }
        
        return {
          url: videoUrl,
          thumbnail: thumbnailUrl,
          name: videoName,
          isDefault: false
        };
      }
      return null;
    } else {
      // Show work's default video (from selected work or current work)
      const workToUse = selectedWork || work;
      if (workToUse && workToUse.video_project_src) {
        return {
          url: mediaAPI.getDirectUrl(workToUse.video_project_src),
          thumbnail: workToUse.video_project_poster || workToUse.hero_banner_image,
          name: `${workToUse.title} - Default Video`,
          isDefault: true
        };
      }
    }
    return null;
  };

  const previewVideo = getPreviewVideo();

  const handleSave = () => {
    const workToUse = selectedWork || work;
    if (!workToUse) {
      alert('Please select a work first');
      return;
    }

    if (!previewVideo) {
      alert('Please select a video');
      return;
    }

    onSave(workToUse, previewVideo, videoSourceType === 'custom' || useCustomVideo);
  };

  const canSave = previewVideo && (selectedWork || work);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <style>{streamStyles}</style>
      <div className="bg-white rounded-lg shadow-xl w-full h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">
            Edit Banner - {currentBanner.work_title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          {/* Current Banner Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Current Banner</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Work:</span>
                <p>{currentBanner.work_title}</p>
              </div>
              <div>
                <span className="font-medium">Client:</span>
                <p>{currentBanner.work_client}</p>
              </div>
              <div>
                <span className="font-medium">Video Source:</span>
                <p>{currentBanner.is_custom_video ? 'Custom Video' : 'Work Default Video'}</p>
              </div>
            </div>
          </div>

          {/* Step 1: Change Work (Optional) */}
          {allowWorkChange && (
            <div className="mb-8">
              <h4 className="text-md font-medium mb-4">1. Change Work (Optional)</h4>
              <div className="text-sm text-gray-600 mb-4">
                Current work: <strong>{currentBanner.work_title}</strong>. Select a different work below to change it, or keep the current selection.
              </div>
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
          )}

          {/* Step 2: Video Selection (same as CreateBannerModal) */}
          <div className="mb-8">
            <h4 className="text-md font-medium mb-4">
              {allowWorkChange ? '2. Select Video' : 'Select Video'}
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Preview */}
              <div>
                <div className="mb-4">
                  <h5 className="font-medium mb-2">Preview</h5>
                  <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                    {previewVideo ? (
                      previewVideo.url ? (
                        <div className='w-full h-full'>
                          {console.log('🎥 Rendering video preview:', previewVideo)}
                          {previewVideo.isCloudflare ? (
                            <div className="stream-preview-container">
                              <Stream
                                src={getCloudflareVideoId(previewVideo.url)}
                                controls={true}
                                autoplay={false}
                                loop={false}
                                muted={true}
                                poster={previewVideo.thumbnail}
                                style={{
                                  width: "100%",
                                  height: "100%"
                                }}
                              />
                            </div>
                          ) : (
                            <video
                              src={previewVideo.url}
                              poster={previewVideo.thumbnail}
                              controls
                              className="w-full h-full object-cover"
                              preload="metadata"
                              onError={(e) => {
                                console.error('❌ Video error:', e.target.error);
                                console.error('❌ Video src:', e.target.src);
                              }}
                              onLoadStart={() => console.log('📤 Video load started:', previewVideo.url)}
                              onCanPlay={() => console.log('✅ Video can play:', previewVideo.url)}
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-red-50">
                          <div className="text-center">
                            <div className="mb-2">
                              <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                            </div>
                            <p className="text-red-600 text-sm font-medium">
                              Video URL is undefined
                            </p>
                            <p className="text-red-500 text-xs mt-1">
                              Please select a different video
                            </p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="mb-2">
                            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-400 text-sm">
                            Select video source below
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {previewVideo && (
                    <div className="mt-2 p-3 bg-gray-50 rounded">
                      <p className="font-medium text-sm">{previewVideo.name}</p>
                      <p className="text-xs text-gray-500">
                        {previewVideo.isDefault 
                          ? 'Default work video' 
                          : previewVideo.isCloudflare 
                            ? 'Cloudflare Stream embed' 
                            : 'Custom video from library'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Options */}
              <div>
                <h5 className="font-medium mb-2">Video Options</h5>
                
                {/* Default Video Option */}
                <div className={`border-2 rounded-lg p-4 mb-3 cursor-pointer ${
                  videoSourceType === 'default' ? 'border-black bg-gray-50' : 'border-gray-200'
                }`}
                onClick={() => {
                  console.log('🎯 Switching to default video...', { videoSourceType, selectedWork, currentBanner });
                  setVideoSourceType('default');
                  onCustomVideoToggle(false, selectedWork || publishedWorks.find(w => w.id === currentBanner.work_id));
                }}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                      videoSourceType === 'default' ? 'border-black bg-black' : 'border-gray-300'
                    }`}>
                      {videoSourceType === 'default' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                    </div>
                    <span className="font-medium">Use Work's Default Video</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    {(() => {
                      const work = selectedWork || publishedWorks.find(w => w.id === currentBanner.work_id);
                      return work?.video_project_src 
                        ? `Video from ${work.title} work`
                        : 'No default video available for this work';
                    })()}
                  </p>
                </div>

                {/* Custom Video Option */}
                <div className={`border-2 rounded-lg p-4 mb-3 cursor-pointer ${
                  videoSourceType === 'custom' ? 'border-black bg-gray-50' : 'border-gray-200'
                }`}
                onClick={() => {
                  console.log('🎯 Switching to custom video...', { videoSourceType });
                  setVideoSourceType('custom');
                  onCustomVideoToggle(true);
                }}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                      videoSourceType === 'custom' ? 'border-black bg-black' : 'border-gray-300'
                    }`}>
                      {videoSourceType === 'custom' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                    </div>
                    <span className="font-medium">Use Custom Video</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6 mb-3">
                    Select from video library or upload new video
                  </p>
                  
                  {videoSourceType === 'custom' && (
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

                {/* Cloudflare Video Option */}
                <div className={`border-2 rounded-lg p-4 cursor-pointer ${
                  videoSourceType === 'cloudflare' ? 'border-black bg-gray-50' : 'border-gray-200'
                }`}
                onClick={() => {
                  console.log('🎯 Switching to Cloudflare video...', { videoSourceType });
                  setVideoSourceType('cloudflare');
                  onCustomVideoToggle(false);
                }}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                      videoSourceType === 'cloudflare' ? 'border-black bg-black' : 'border-gray-300'
                    }`}>
                      {videoSourceType === 'cloudflare' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                    </div>
                    <span className="font-medium">Use Cloudflare Stream Video</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6 mb-3">
                    Enter Cloudflare Stream embed URL
                  </p>
                  
                  {videoSourceType === 'cloudflare' && (
                    <div className="ml-6">
                      <input
                        type="url"
                        value={cloudflareVideoUrl}
                        onChange={(e) => {
                          e.stopPropagation();
                          setCloudflareVideoUrl(e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="https://watch.videodelivery.net/your-video-id"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the full Cloudflare Stream embed URL
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Current vs New Comparison */}
            {previewVideo && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <h6 className="font-medium text-sm text-blue-800 mb-2">Changes Preview:</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Current:</span>
                    <p className="text-blue-600">
                      {currentBanner.is_custom_video ? 'Custom Video' : `Default Video from ${currentBanner.work_title}`}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">New:</span>
                    <p className="text-blue-600">
                      {previewVideo.isDefault 
                        ? `Default Video from ${(selectedWork || work)?.title}` 
                        : previewVideo.isCloudflare 
                          ? 'Cloudflare Stream Video'
                          : 'Custom Video from Library'}
                    </p>
                  </div>
                </div>
                {selectedWork && selectedWork.id !== currentBanner.work_id && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> You're also changing the work from "{currentBanner.work_title}" to "{selectedWork.title}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <div></div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`px-6 py-2 text-sm font-medium rounded transition-colors ${
                canSave && !loading
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              onClick={handleSave}
              disabled={!canSave || loading}
            >
              {loading ? 'Updating...' : 'Update Banner'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBannerModal;