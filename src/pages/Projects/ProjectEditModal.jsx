import React, { useState, useEffect } from 'react';
import { getMediaFiles } from '../../api';

const ProjectEditModal = ({ isOpen, onClose, onSave, project, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    year: '',
    description_en: '',
    description_id: '',
    status: 'draft',
    image_ids: [],
  });
  const [errors, setErrors] = useState({});
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      setFormData({
        title: project.title || '',
        location: project.location || '',
        year: project.year || '',
        description_en: project.description_en || '',
        description_id: project.description_id || '',
        status: project.status || 'draft',
        image_ids: project.images?.map(img => img.media_id) || [],
      });
      loadMediaFiles();
    }
  }, [isOpen, project]);

  const loadMediaFiles = async () => {
    setIsLoadingMedia(true);
    try {
      const response = await getMediaFiles({ type: 'image', per_page: 100 });
      if (response.success && response.data) {
        setMediaFiles(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load media files:', error);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageToggle = (mediaId) => {
    setFormData(prev => {
      const imageIds = [...prev.image_ids];
      const index = imageIds.indexOf(mediaId);
      
      if (index > -1) {
        imageIds.splice(index, 1);
      } else {
        if (imageIds.length >= 10) {
          alert('Maximum 10 images allowed per project');
          return prev;
        }
        imageIds.push(mediaId);
      }
      
      return { ...prev, image_ids: imageIds };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      location: '',
      year: '',
      description_en: '',
      description_id: '',
      status: 'draft',
      image_ids: [],
    });
    setErrors({});
    setShowImageSelector(false);
    onClose();
  };

  if (!isOpen) return null;

  const selectedImages = mediaFiles.filter(m => formData.image_ids.includes(m.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Project</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Location and Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Description English */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
              <textarea
                name="description_en"
                value={formData.description_en}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {/* Description Indonesian */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Indonesian)</label>
              <textarea
                name="description_id"
                value={formData.description_id}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Images Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images ({formData.image_ids.length}/10)
              </label>
              
              {/* Selected Images Preview */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {selectedImages.map((media) => (
                    <div key={media.id} className="relative group">
                      <img
                        src={media.url}
                        alt={media.filename}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageToggle(media.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Images Button */}
              <button
                type="button"
                onClick={() => setShowImageSelector(!showImageSelector)}
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
                disabled={isLoading || formData.image_ids.length >= 10}
              >
                {showImageSelector ? 'Hide Image Library' : 'Select from Media Library'}
              </button>

              {/* Image Selector */}
              {showImageSelector && (
                <div className="mt-3 border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
                  {isLoadingMedia ? (
                    <p className="text-center text-gray-500">Loading images...</p>
                  ) : mediaFiles.length === 0 ? (
                    <p className="text-center text-gray-500">No images available</p>
                  ) : (
                    <div className="grid grid-cols-6 gap-2">
                      {mediaFiles.map((media) => (
                        <button
                          key={media.id}
                          type="button"
                          onClick={() => handleImageToggle(media.id)}
                          className={`relative border-2 rounded overflow-hidden ${
                            formData.image_ids.includes(media.id)
                              ? 'border-blue-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={media.url}
                            alt={media.filename}
                            className="w-full h-16 object-cover"
                          />
                          {formData.image_ids.includes(media.id) && (
                            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectEditModal;
