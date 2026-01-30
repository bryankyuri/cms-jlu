import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProject, updateProject } from '../../../api/projects';
import ImageSelectionModal from '../create/components/ImageSelectionModal';

const EditProject = () => {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    year: '',
    description: '',
    status: 'draft',
    image_ids: [],
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    loadProject();
  }, [uuid]);

  const loadProject = async () => {
    setIsLoading(true);
    try {
      const response = await getProject(uuid);
      if (response.success && response.data) {
        const project = response.data;
        setFormData({
          title: project.title || '',
          location: project.location || '',
          year: project.year || '',
          description: project.description || '',
          status: project.status || 'draft',
          image_ids: project.images?.map(img => img.media_id) || [],
        });
        
        // Set selected images from project
        if (project.images && project.images.length > 0) {
          const images = project.images.map(img => ({
            id: img.media_id,
            url: img.url,
            filename: img.filename
          }));
          setSelectedImages(images);
        }
      }
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const response = await updateProject(uuid, formData);
      if (response.success) {
        toast.success('Project updated successfully');
        navigate('/projects');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (images) => {
    setSelectedImages(images);
    setFormData(prev => ({
      ...prev,
      image_ids: images.map(img => img.id)
    }));
    setIsImageModalOpen(false);
  };

  const handleRemoveImage = (imageId) => {
    const newImages = selectedImages.filter(img => img.id !== imageId);
    setSelectedImages(newImages);
    setFormData(prev => ({
      ...prev,
      image_ids: newImages.map(img => img.id)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update project details and images
            </p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSaving}
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Location and Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={isSaving}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                disabled={isSaving}
              />
            </div>

            {/* Status - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex items-center">
                <span
                  className={`px-3 py-2 text-sm font-medium rounded-full ${
                    formData.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {formData.status === 'published' ? 'Published' : 'Draft'}
                </span>
                <span className="ml-3 text-sm text-gray-500">
                  (Use publish/unpublish action in the list page to change status)
                </span>
              </div>
            </div>

            {/* Images Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images ({selectedImages.length}/10)
              </label>
              
              {/* Selected Images Preview */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-5 gap-3 mb-3">
                  {selectedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                onClick={() => setIsImageModalOpen(true)}
                className="w-full px-4 py-3 text-sm font-medium text-black bg-gray-50 border-2 border-dashed border-gray-400 rounded-md hover:bg-gray-100"
                disabled={isSaving || selectedImages.length >= 10}
              >
                {selectedImages.length === 0 ? 'Select Images' : 'Change Images'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Image Selection Modal */}
      <ImageSelectionModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelect={handleImageSelect}
        selectedImages={selectedImages}
        maxImages={10}
      />
    </div>
  );
};

export default EditProject;
