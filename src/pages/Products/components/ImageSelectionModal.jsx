import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiSearch, FiCheck } from 'react-icons/fi';
import { mediaAPI } from '../../../api';
import ImageUploadModal from '../../../components/modals/ImageUploadModal';

const ImageSelectionModal = ({ isOpen, onClose, onSelect, selectedImages = [], maxImages = 10 }) => {
  const [availableImages, setAvailableImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [perPage, setPerPage] = useState(25);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedImages.map(img => img.id));
      fetchImages();
    }
  }, [isOpen, selectedImages]);

  const fetchImages = async (page = 1, itemsPerPage = null) => {
    setLoading(true);
    try {
      const response = await mediaAPI.getAll({
        type: 'image',
        page,
        per_page: itemsPerPage || perPage,
        search: searchQuery
      });
      
      if (response.success && response.data) {
        setAvailableImages(response.data.data || []);
        setPagination(response.data);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchImages(1);
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    fetchImages(1, newPerPage);
  };

  const toggleImageSelection = (image) => {
    setSelectedIds(prev => {
      if (prev.includes(image.id)) {
        return prev.filter(id => id !== image.id);
      } else {
        if (prev.length >= maxImages) {
          alert(`Maximum ${maxImages} images allowed`);
          return prev;
        }
        return [...prev, image.id];
      }
    });
  };

  const handleConfirm = () => {
    const selected = availableImages.filter(img => selectedIds.includes(img.id));
    // Also include any previously selected images that might not be on current page
    const previouslySelected = selectedImages.filter(img => 
      selectedIds.includes(img.id) && !availableImages.find(a => a.id === img.id)
    );
    onSelect([...previouslySelected, ...selected]);
  };

  const handleUploadComplete = () => {
    setIsUploadModalOpen(false);
    setCurrentPage(1);
    fetchImages(1);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-6xl h-[90vh] flex flex-col rounded-lg shadow-xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">Select Product Images</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedIds.length} of {maxImages} selected
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Search and Upload */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiSearch size={20} />
                </button>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 flex items-center gap-2"
              >
                <FiUpload size={16} />
                Upload
              </button>
            </div>
            
            {/* Per Page Filter and Pagination */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Show:</label>
                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
                {pagination && (
                  <span className="text-sm text-gray-500 ml-2">
                    Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} images
                  </span>
                )}
              </div>
              
              {/* Pagination Controls */}
              {pagination && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchImages(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => fetchImages(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 px-2">
                    Page {currentPage} of {pagination.last_page || pagination.total_pages || 1}
                  </span>
                  <button
                    onClick={() => fetchImages(currentPage + 1)}
                    disabled={currentPage >= (pagination.last_page || pagination.total_pages || 1)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => fetchImages(pagination.last_page || pagination.total_pages || 1)}
                    disabled={currentPage >= (pagination.last_page || pagination.total_pages || 1)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Image Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : availableImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FiSearch size={48} className="mb-4 opacity-50" />
                <p>No images found</p>
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-3">
                {availableImages.map((image) => {
                  const isSelected = selectedIds.includes(image.id);
                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => toggleImageSelection(image)}
                      className={`relative border-2 rounded-lg overflow-hidden aspect-square transition-all ${
                        isSelected
                          ? 'border-green-500 ring-2 ring-green-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                          <div className="bg-green-500 rounded-full p-1">
                            <FiCheck size={20} className="text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                        {image.filename}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              disabled={selectedIds.length === 0}
            >
              Confirm Selection ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadComplete}
      />
    </>
  );
};

export default ImageSelectionModal;
