import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMove,
  FiImage,
  FiVideo,
  FiYoutube,
  FiX,
  FiCheck,
  FiEye,
  FiSearch,
  FiUpload,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showreelAPI, mediaAPI } from "../../api";
import VideoUploadModal from "../../components/modals/VideoUploadModal";
import ImageUploadModal from "../../components/modals/ImageUploadModal";

const Showreel = () => {
  const [showreels, setShowreels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    video_source_type: "upload",
    poster_media_id: null,
    video_youtube_url: "",
    video_vimeo_url: "",
    video_cloudflare_url: "",
    // position is auto-assigned by backend, no need to send it
    // is_active removed - all showreels are always active
  });

  const [currentShowreel, setCurrentShowreel] = useState(null);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Image/Poster library modal states
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [mediaSortBy, setMediaSortBy] = useState("created_at");
  const [mediaSortDirection, setMediaSortDirection] = useState("desc");
  const [mediaCurrentPage, setMediaCurrentPage] = useState(1);
  const [mediaPerPage, setMediaPerPage] = useState(20);
  const [mediaPagination, setMediaPagination] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  // Image upload modal
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);

  // Video library modal
  const [isVideoLibraryOpen, setIsVideoLibraryOpen] = useState(false);
  const [videoLibrary, setVideoLibrary] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [videoSortBy, setVideoSortBy] = useState("created_at");
  const [videoSortDirection, setVideoSortDirection] = useState("desc");
  const [videoCurrentPage, setVideoCurrentPage] = useState(1);
  const [videoPerPage, setVideoPerPage] = useState(20);
  const [videoPagination, setVideoPagination] = useState({});
  const [previewVideo, setPreviewVideo] = useState(null);

  // Video upload modal
  const [isVideoUploadModalOpen, setIsVideoUploadModalOpen] = useState(false);

  useEffect(() => {
    loadShowreels();
  }, []);

  const loadShowreels = async () => {
    try {
      setLoading(true);
      const response = await showreelAPI.getAll();
      if (response.success) {
        setShowreels(response.data);
      }
    } catch (error) {
      console.error("Error loading showreels:", error);
      toast.error("Failed to load showreels");
    } finally {
      setLoading(false);
    }
  };

  const loadMediaLibrary = async () => {
    try {
      setMediaLoading(true);
      const params = {
        type: "images", // Use 'images' type to filter for images only
        search: mediaSearchQuery,
        sort_by: mediaSortBy,
        sort_direction: mediaSortDirection,
        page: mediaCurrentPage,
        per_page: mediaPerPage,
      };

      const response = await mediaAPI.getAll(params);
      if (response.success) {
        setMediaLibrary(response.data.data || response.data);
        setMediaPagination(response.data);
      }
    } catch (error) {
      console.error("Error loading media library:", error);
      toast.error("Failed to load media library");
    } finally {
      setMediaLoading(false);
    }
  };

  const loadVideoLibrary = async () => {
    try {
      setVideoLoading(true);
      const params = {
        type: "videos", // Use 'videos' type to filter for videos only
        search: videoSearchQuery,
        sort_by: videoSortBy,
        sort_direction: videoSortDirection,
        page: videoCurrentPage,
        per_page: videoPerPage,
      };

      const response = await mediaAPI.getAll(params);
      if (response.success) {
        setVideoLibrary(response.data.data || response.data);
        setVideoPagination(response.data);
      }
    } catch (error) {
      console.error("Error loading video library:", error);
      toast.error("Failed to load video library");
    } finally {
      setVideoLoading(false);
    }
  };

  useEffect(() => {
    if (isMediaLibraryOpen) {
      loadMediaLibrary();
    }
  }, [
    isMediaLibraryOpen,
    mediaSearchQuery,
    mediaSortBy,
    mediaSortDirection,
    mediaCurrentPage,
    mediaPerPage,
  ]);

  useEffect(() => {
    if (isVideoLibraryOpen) {
      loadVideoLibrary();
    }
  }, [
    isVideoLibraryOpen,
    videoSearchQuery,
    videoSortBy,
    videoSortDirection,
    videoCurrentPage,
    videoPerPage,
  ]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreateModal = () => {
    setFormData({
      title: "",
      description: "",
      video_url: "",
      video_source_type: "upload",
      poster_media_id: null,
      video_youtube_url: "",
      video_vimeo_url: "",
      video_cloudflare_url: "",
      // position will be auto-assigned by backend
      // is_active removed - all showreels are always active
    });
    setSelectedPoster(null);
    setSelectedVideo(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (showreel) => {
    setCurrentShowreel(showreel);
    setFormData({
      title: showreel.title,
      description: showreel.description || "",
      video_url: showreel.video_url,
      video_source_type: showreel.video_source_type,
      poster_media_id: showreel.poster_media_id,
      video_youtube_url: showreel.video_youtube_url || "",
      video_vimeo_url: showreel.video_vimeo_url || "",
      video_cloudflare_url: showreel.video_cloudflare_url || "",
      // position is managed separately via reorder, not in edit form
      // is_active removed - all showreels are always active
    });

    // Set selected poster from poster_url (API returns poster_url directly, not nested posterMedia)
    if (showreel.poster_url && showreel.poster_media_id) {
      setSelectedPoster({
        id: showreel.poster_media_id,
        url: showreel.poster_url,
        filename: showreel.title || "Poster Image",
      });
    } else {
      setSelectedPoster(null);
    }

    // Set selected video if exists
    if (showreel.video_url) {
      setSelectedVideo({
        id: showreel.id,
        path: showreel.video_url,
        url: showreel.video_url,
        poster_url: showreel.poster_url,
        original_name: showreel.title,
      });
    } else {
      setSelectedVideo(null);
    }
    setIsEditModalOpen(true);
  };

  const openMediaLibrary = async () => {
    setIsMediaLibraryOpen(true);
    await loadMediaLibrary();
  };

  const closeMediaLibrary = () => {
    setIsMediaLibraryOpen(false);
    setMediaSearchQuery("");
    setMediaCurrentPage(1);
  };

  const handlePosterSelect = (media) => {
    setSelectedPoster({
      id: media.id,
      url: media.url,
      path: media.path,
      filename: media.filename,
    });
    setFormData((prev) => ({
      ...prev,
      poster_media_id: media.id,
    }));
    setIsMediaLibraryOpen(false);
    toast.success("Poster selected successfully");
  };

  const openImageUploadModal = () => {
    setIsImageUploadModalOpen(true);
  };

  const closeImageUploadModal = () => {
    setIsImageUploadModalOpen(false);
  };

  const handleImageUploadSuccess = () => {
    loadMediaLibrary();
    closeImageUploadModal();
  };

  const openVideoLibrary = () => {
    setIsVideoLibraryOpen(true);
  };

  const closeVideoLibrary = () => {
    setIsVideoLibraryOpen(false);
    setVideoSearchQuery("");
    setVideoCurrentPage(1);
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setFormData((prev) => ({
      ...prev,
      video_url: video.path,
    }));
    setIsVideoLibraryOpen(false);
    toast.success("Video selected successfully");
  };

  const openVideoUploadModal = () => {
    setIsVideoUploadModalOpen(true);
  };

  const closeVideoUploadModal = () => {
    setIsVideoUploadModalOpen(false);
  };

  const handleVideoUploadSuccess = () => {
    loadVideoLibrary();
    closeVideoUploadModal();
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.video_url) {
      toast.error("Please select a video from media library");
      return;
    }

    if (!formData.poster_media_id) {
      toast.error("Please select a poster image");
      return;
    }

    try {
      const response = await showreelAPI.create(formData);
      if (response.success) {
        toast.success("Showreel created successfully");
        setIsCreateModalOpen(false);
        setSelectedVideo(null);
        setSelectedPoster(null);
        await loadShowreels();
      }
    } catch (error) {
      console.error("Error creating showreel:", error);
      toast.error(error.message || "Failed to create showreel");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.video_url) {
      toast.error("Please select a video from media library");
      return;
    }

    if (!formData.poster_media_id) {
      toast.error("Please select a poster image");
      return;
    }

    try {
      const response = await showreelAPI.update(currentShowreel.id, formData);
      if (response.success) {
        toast.success("Showreel updated successfully");

        // Delay closing modal to allow toast to render
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSelectedVideo(null);
          setSelectedPoster(null);
        }, 300);
        await loadShowreels();
      }
    } catch (error) {
      console.error("Error updating showreel:", error);
      toast.error(error.message || "Failed to update showreel");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this showreel?")) {
      return;
    }

    try {
      const response = await showreelAPI.delete(id);
      if (response.success) {
        toast.success("Showreel deleted successfully");
        await loadShowreels();
      }
    } catch (error) {
      console.error("Error deleting showreel:", error);
      toast.error(error.message || "Failed to delete showreel");
    }
  };

  const openReorderModal = () => {
    setIsReorderModalOpen(true);
  };

  const handleReorder = async (reorderedList) => {
    try {
      const reorderData = {
        showreels: reorderedList.map((item, index) => ({
          id: item.id,
          position: index,
        })),
      };

      const response = await showreelAPI.reorder(reorderData);
      if (response.success) {
        toast.success("Showreels reordered successfully");
        setIsReorderModalOpen(false);
        await loadShowreels();
      }
    } catch (error) {
      console.error("Error reordering showreels:", error);
      toast.error(error.message || "Failed to reorder showreels");
    }
  };

  const getSourceTypeIcon = (type) => {
    switch (type) {
      case "youtube":
        return <FiYoutube className="text-red-600" />;
      case "vimeo":
        return <FiVideo className="text-blue-500" />;
      default:
        return <FiVideo className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Showreels</h1>
          <p className="text-gray-600 mt-1">
            Manage showreel video for homepage
          </p>
        </div>
        {/* <div className="flex gap-2">
          <button
            onClick={openReorderModal}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FiMove /> Reorder
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus /> Add Showreel
          </button>
        </div> */}
      </div>

      {/* Showreels Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Poster
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Video Sources
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {showreels.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No showreels found. Create your first showreel!
                </td>
              </tr>
            ) : (
              showreels.map((showreel) => (
                <tr key={showreel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {showreel.poster_url ? (
                      <img
                        src={showreel.poster_url}
                        alt={showreel.title}
                        className="w-24 h-14 object-cover rounded"
                      />
                    ) : (
                      <div className="w-24 h-14 bg-gray-200 rounded flex items-center justify-center">
                        <FiImage className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {showreel.title}
                    </div>
                    {showreel.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {showreel.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      {showreel.video_url && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <FiVideo size={12} />
                          <span>Primary</span>
                        </div>
                      )}
                      {showreel.video_youtube_url && (
                        <div className="flex items-center gap-1 text-red-600">
                          <FiYoutube size={12} />
                          <span>YouTube</span>
                        </div>
                      )}
                      {showreel.video_vimeo_url && (
                        <div className="flex items-center gap-1 text-blue-500">
                          <FiVideo size={12} />
                          <span>Vimeo</span>
                        </div>
                      )}
                      {showreel.video_cloudflare_url && (
                        <div className="flex items-center gap-1 text-orange-500">
                          <FiVideo size={12} />
                          <span>Cloudflare</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {showreel.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(showreel)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <FiEdit2 />
                    </button>
                    {/* <button
                      onClick={() => handleDelete(showreel.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 />
                    </button> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <ShowreelModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
          formData={formData}
          onInputChange={handleInputChange}
          selectedPoster={selectedPoster}
          selectedVideo={selectedVideo}
          onOpenMediaLibrary={openMediaLibrary}
          onOpenVideoLibrary={openVideoLibrary}
          title="Create Showreel"
          submitText="Create"
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <ShowreelModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdate}
          formData={formData}
          onInputChange={handleInputChange}
          selectedPoster={selectedPoster}
          selectedVideo={selectedVideo}
          onOpenMediaLibrary={openMediaLibrary}
          onOpenVideoLibrary={openVideoLibrary}
          title="Edit Showreel"
          submitText="Update"
        />
      )}

      {/* Poster Image Library Modal */}
      {isMediaLibraryOpen && (
        <PosterImageLibraryModal
          isOpen={isMediaLibraryOpen}
          onClose={closeMediaLibrary}
          mediaLibrary={mediaLibrary}
          mediaLoading={mediaLoading}
          onSelectImage={handlePosterSelect}
          selectedPoster={selectedPoster}
          searchQuery={mediaSearchQuery}
          setSearchQuery={setMediaSearchQuery}
          sortBy={mediaSortBy}
          setSortBy={setMediaSortBy}
          sortDirection={mediaSortDirection}
          setSortDirection={setMediaSortDirection}
          currentPage={mediaCurrentPage}
          setCurrentPage={setMediaCurrentPage}
          perPage={mediaPerPage}
          setPerPage={setMediaPerPage}
          pagination={mediaPagination}
          onOpenUploadModal={openImageUploadModal}
          previewImage={previewImage}
          setPreviewImage={setPreviewImage}
        />
      )}

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={closeImageUploadModal}
        onUploadSuccess={handleImageUploadSuccess}
        title="Upload Poster Images"
      />

      {/* Video Library Modal */}
      {isVideoLibraryOpen && (
        <VideoLibraryModal
          isOpen={isVideoLibraryOpen}
          onClose={closeVideoLibrary}
          videoLibrary={videoLibrary}
          videoLoading={videoLoading}
          onSelectVideo={handleVideoSelect}
          selectedVideo={selectedVideo}
          searchQuery={videoSearchQuery}
          setSearchQuery={setVideoSearchQuery}
          sortBy={videoSortBy}
          setSortBy={setVideoSortBy}
          sortDirection={videoSortDirection}
          setSortDirection={setVideoSortDirection}
          currentPage={videoCurrentPage}
          setCurrentPage={setVideoCurrentPage}
          perPage={videoPerPage}
          setPerPage={setVideoPerPage}
          pagination={videoPagination}
          onOpenUploadModal={openVideoUploadModal}
          previewVideo={previewVideo}
          setPreviewVideo={setPreviewVideo}
        />
      )}

      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={isVideoUploadModalOpen}
        onClose={closeVideoUploadModal}
        onUploadSuccess={handleVideoUploadSuccess}
        title="Upload Showreel Video"
      />

      {/* Reorder Modal */}
      {isReorderModalOpen && (
        <ReorderModal
          isOpen={isReorderModalOpen}
          onClose={() => setIsReorderModalOpen(false)}
          items={showreels}
          onReorder={handleReorder}
        />
      )}
    </div>
  );
};

// Showreel Form Modal Component
const ShowreelModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  selectedPoster,
  selectedVideo,
  onOpenMediaLibrary,
  onOpenVideoLibrary,
  title,
  submitText,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <form onSubmit={onSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Primary Video from Media Library */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Video <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              {selectedVideo ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg flex-1">
                  <div className="w-24 h-16 bg-black rounded overflow-hidden">
                    {selectedVideo.poster_url ? (
                      <img
                        src={selectedVideo.poster_url}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiVideo className="text-white" size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedVideo.original_name || "Selected Video"}
                    </p>
                    <p className="text-xs text-gray-500">From Media Library</p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenVideoLibrary}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenVideoLibrary}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiVideo />
                  Select Video from Library
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select the main video file from your media library
            </p>
          </div>

          {/* Optional Video Sources */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Optional Video Sources
            </h3>

            {/* YouTube URL */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <FiYoutube className="inline mr-1 text-red-600" />
                YouTube URL
              </label>
              <input
                type="url"
                name="video_youtube_url"
                value={formData.video_youtube_url}
                onChange={onInputChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Vimeo URL */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <FiVideo className="inline mr-1 text-blue-500" />
                Vimeo URL
              </label>
              <input
                type="url"
                name="video_vimeo_url"
                value={formData.video_vimeo_url}
                onChange={onInputChange}
                placeholder="https://vimeo.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Cloudflare URL */}
            <div className="mb-0">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <FiVideo className="inline mr-1 text-orange-500" />
                Cloudflare Stream URL
              </label>
              <input
                type="url"
                name="video_cloudflare_url"
                value={formData.video_cloudflare_url}
                onChange={onInputChange}
                placeholder="https://customer-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Poster Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poster Image <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              {selectedPoster && (
                <img
                  src={selectedPoster.url}
                  alt="Selected poster"
                  className="w-32 h-20 object-cover rounded"
                />
              )}
              <button
                type="button"
                onClick={onOpenMediaLibrary}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiImage />
                {selectedPoster ? "Change Poster" : "Select Poster"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Optional: Override the default video poster with a custom image
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedVideo}
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Poster Image Library Modal Component (similar to Hero Banner Editor Modal)
const PosterImageLibraryModal = ({
  isOpen,
  onClose,
  mediaLibrary,
  mediaLoading,
  onSelectImage,
  selectedPoster,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  currentPage,
  setCurrentPage,
  perPage,
  setPerPage,
  pagination,
  onOpenUploadModal,
  previewImage,
  setPreviewImage,
}) => {
  if (!isOpen) return null;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < pagination.last_page) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-medium">Select Poster Image</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow">
          {/* Search and Controls */}
          <div className="flex items-center mb-6 gap-4">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="created_at">Date Created</option>
              <option value="original_name">Name</option>
              <option value="size">Size</option>
            </select>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={30}>30 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <button
              onClick={onOpenUploadModal}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <FiUpload size={16} />
              Upload Image
            </button>
          </div>

          {/* Results Info */}
          {pagination.total > 0 && (
            <div className="mb-4 text-sm text-gray-600">
              Showing {(currentPage - 1) * perPage + 1} -{" "}
              {Math.min(currentPage * perPage, pagination.total)} of{" "}
              {pagination.total} images
              {searchQuery && ` (filtered by "${searchQuery}")`}
            </div>
          )}

          {mediaLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : mediaLibrary.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiImage size={48} className="mx-auto mb-4 opacity-50" />
              {searchQuery ? (
                <>
                  <p>No images found for "{searchQuery}"</p>
                  <p className="text-sm">Try adjusting your search terms.</p>
                </>
              ) : (
                <>
                  <p>No images in your media library</p>
                  <p className="text-sm">
                    Upload some images first to use as posters.
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mediaLibrary.map((image) => {
                  const isSelected = selectedPoster?.id === image.id;

                  return (
                    <div
                      key={image.id}
                      className={`group relative h-48 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-green-500 ring-2 ring-green-500 ring-opacity-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={mediaAPI.getDirectUrl(image.path)}
                        alt={image.alt_text || image.original_name}
                        className="w-full h-48 object-cover"
                      />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onSelectImage(image)}
                          className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs"
                        >
                          <FiCheck size={16} className="text-green-500" />
                          Select
                        </button>
                        <button
                          onClick={() => setPreviewImage(image)}
                          className="bg-white text-black p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1 text-xs"
                        >
                          <FiEye size={16} />
                          Preview
                        </button>
                      </div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-full p-1 border-green-500 border-2">
                          <FiCheck className="text-green-500" size={14} />
                        </div>
                      )}

                      {/* Image name */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <div className="text-white text-xs truncate font-medium">
                          {image.original_name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from(
                    { length: Math.min(pagination.last_page, 10) },
                    (_, i) => {
                      const page = i + 1;
                      // Show first 3, last 3, and current page with neighbors
                      if (
                        page <= 3 ||
                        page > pagination.last_page - 3 ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 border rounded-lg ${
                              currentPage === page
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === 4 ||
                        page === pagination.last_page - 3
                      ) {
                        return (
                          <span key={page} className="px-2">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                  )}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === pagination.last_page}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewImage(null)}
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

// Video Library Modal Component
const VideoLibraryModal = ({
  isOpen,
  onClose,
  videoLibrary,
  videoLoading,
  onSelectVideo,
  selectedVideo,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  currentPage,
  setCurrentPage,
  perPage,
  setPerPage,
  pagination,
  onOpenUploadModal,
  previewVideo,
  setPreviewVideo,
}) => {
  if (!isOpen) return null;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < pagination.last_page) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-medium">Select Video from Library</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow">
          {/* Search and Controls */}
          <div className="flex items-center mb-6 gap-4">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="created_at">Date Created</option>
              <option value="original_name">Name</option>
              <option value="size">Size</option>
            </select>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={30}>30 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <button
              onClick={onOpenUploadModal}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <FiUpload size={16} />
              Upload Video
            </button>
          </div>

          {/* Results Info */}
          {pagination.total > 0 && (
            <div className="mb-4 text-sm text-gray-600">
              Showing {(currentPage - 1) * perPage + 1} -{" "}
              {Math.min(currentPage * perPage, pagination.total)} of{" "}
              {pagination.total} videos
              {searchQuery && ` (filtered by "${searchQuery}")`}
            </div>
          )}

          {videoLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : videoLibrary.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiVideo size={48} className="mx-auto mb-4 opacity-50" />
              {searchQuery ? (
                <>
                  <p>No videos found for "{searchQuery}"</p>
                  <p className="text-sm">Try adjusting your search terms.</p>
                </>
              ) : (
                <>
                  <p>No videos in your media library</p>
                  <p className="text-sm">
                    Upload some videos first to use as showreels.
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {videoLibrary.map((video) => {
                  const isSelected = selectedVideo?.id === video.id;

                  return (
                    <div
                      key={video.id}
                      className={`group relative h-48 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-green-500 ring-2 ring-green-500 ring-opacity-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="w-full h-48 bg-black flex items-center justify-center relative">
                        {video.poster_url ? (
                          <img
                            src={video.poster_url}
                            alt={video.original_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={mediaAPI.getDirectUrl(video.path)}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                          />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <FiVideo className="text-white" size={24} />
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => onSelectVideo(video)}
                          className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs"
                        >
                          <FiCheck size={16} className="text-green-500" />
                          Select
                        </button>
                        <button
                          onClick={() => setPreviewVideo(video)}
                          className="bg-white text-black p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1 text-xs"
                        >
                          <FiEye size={16} />
                          Preview
                        </button>
                      </div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-full p-1 border-green-500 border-2">
                          <FiCheck className="text-green-500" size={14} />
                        </div>
                      )}

                      {/* Video name */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <div className="text-white text-xs truncate">
                          {video.original_name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from(
                    { length: pagination.last_page },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded-lg ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === pagination.last_page}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4">
          <div className="relative w-full max-w-[800px]">
            <button
              onClick={() => setPreviewVideo(null)}
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

// Reorder Modal Component
const ReorderModal = ({ isOpen, onClose, items, onReorder }) => {
  const [orderedItems, setOrderedItems] = useState(items);

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  const moveItem = (index, direction) => {
    const newItems = [...orderedItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index],
    ];
    setOrderedItems(newItems);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Reorder Showreels</h2>

        <div className="space-y-2 mb-6">
          {orderedItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveItem(index, "down")}
                  disabled={index === orderedItems.length - 1}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                >
                  ▼
                </button>
              </div>

              {item.poster_url && (
                <img
                  src={item.poster_url}
                  alt={item.title}
                  className="w-20 h-12 object-cover rounded"
                />
              )}

              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-gray-500">Position: {index}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onReorder(orderedItems)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Showreel;
