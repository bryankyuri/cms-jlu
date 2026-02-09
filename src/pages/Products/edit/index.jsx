import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { FiX, FiInfo, FiArrowLeft } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import { 
  getProduct, 
  updateProduct,
  PRODUCT_CATEGORIES
} from '../../../api/products';
import WysiwygEditor from '../components/WysiwygEditor';
import ImageSelectionModal from '../components/ImageSelectionModal';

// Available tags for products
const AVAILABLE_TAGS = [
  'crusher', 'screen', 'feeder', 'conveyor', 'belt',
  'parts', 'structural', 'sampling', 'heavy-duty', 'custom'
];

const EditProduct = () => {
  const navigate = useNavigate();
  const { uuid } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    highlight_description: '',
    detail_specs: '',
    tags: [],
    status: 'draft',
    image_ids: [],
  });
  
  const [originalProduct, setOriginalProduct] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // Load product and categories on mount
  useEffect(() => {
    loadData();
  }, [uuid]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const productResponse = await getProduct(uuid);

      if (productResponse.success && productResponse.data) {
        const product = productResponse.data;
        setOriginalProduct(product);
        
        setFormData({
          name: product.name || '',
          category: product.category || '',
          highlight_description: product.highlight_description || '',
          detail_specs: product.detail_specs || '',
          tags: product.tags || [],
          status: product.status || 'draft',
          image_ids: product.images?.map(img => img.id) || [],
        });

        // Set selected images with proper structure for the modal
        if (product.images && product.images.length > 0) {
          setSelectedImages(product.images);
        }
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
      navigate('/products');
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

  const handleDetailSpecsChange = (content) => {
    setFormData(prev => ({ ...prev, detail_specs: content }));
    if (errors.detail_specs) {
      setErrors(prev => ({ ...prev, detail_specs: '' }));
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => {
      const currentTags = prev.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
      return { ...prev, tags: newTags };
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const submitData = {
        ...formData,
        image_ids: selectedImages.map(img => parseInt(img.id)),
      };

      const response = await updateProduct(uuid, submitData);
      
      if (response.success) {
        toast.success('Product updated successfully');
        // Redirect to product list
        setTimeout(() => {
          navigate('/products');
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/products')}
              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-md"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="mt-1 text-sm text-gray-600">
                {originalProduct?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSaving}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSaving}
              >
                <option value="">Select Category</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex gap-2 flex-wrap items-center">
                <div className="font-semibold text-white bg-black px-2 py-1 rounded-md text-sm">
                  #
                </div>
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      formData.tags.includes(tag)
                        ? 'text-white bg-black'
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                    disabled={isSaving}
                  >
                    {tag}
                  </button>
                ))}
                <div className="flex items-center ml-2 px-2 py-1 rounded-md bg-blue-50 text-sm text-gray-600">
                  <FiInfo className="mr-1 text-blue-500" />
                  Click to toggle
                </div>
              </div>
              {formData.tags.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected: {formData.tags.join(', ')}
                </p>
              )}
            </div>

            {/* Highlight Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Highlight Description
              </label>
              <textarea
                name="highlight_description"
                value={formData.highlight_description}
                onChange={handleChange}
                placeholder="Short description shown on home page..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                disabled={isSaving}
              />
              <p className="mt-1 text-xs text-gray-500">
                This description will be displayed on the home page. Leave empty to use detail specs.
              </p>
            </div>

            {/* Detail Specs (WYSIWYG) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detail Specifications
              </label>
              <WysiwygEditor
                value={formData.detail_specs}
                onChange={handleDetailSpecsChange}
                placeholder="Enter product specifications, features, technical details..."
              />
            </div>

            {/* Status (read-only display) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  formData.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {formData.status}
                </span>
                <span className="text-sm text-gray-500">
                  Change status from the product list page
                </span>
              </div>
            </div>

            {/* Images Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images ({selectedImages.length}/10)
              </label>
              
              {/* Selected Images Preview */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-5 gap-3 mb-3">
                  {selectedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.filename || 'Product image'}
                        className="w-full h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="w-4 h-4" />
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
              onClick={() => navigate('/products')}
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

export default EditProduct;
