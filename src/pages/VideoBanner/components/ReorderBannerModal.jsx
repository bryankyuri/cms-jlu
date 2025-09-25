import React, { useRef } from 'react';
import { FiX, FiMove } from 'react-icons/fi';

const DraggableBannerItem = ({ banner, index, moveBanner }) => {
  const ref = useRef(null);

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', ref.current);
    e.dataTransfer.setData('application/json', JSON.stringify({ index }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
    if (dragData.index !== index) {
      moveBanner(dragData.index, index);
    }
  };

  return (
    <div
      ref={ref}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 cursor-move hover:shadow-md transition-shadow flex items-center gap-4"
    >
      <FiMove className="h-5 w-5 text-gray-400 flex-shrink-0" />
      
      <div className="flex items-center gap-4 flex-grow">
        {/* Banner Thumbnail */}
        <div className="w-20 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          {banner.video_thumbnail ? (
            <img
              src={banner.video_thumbnail}
              alt={banner.work_title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiMove className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Banner Info */}
        <div className="flex-grow">
          <h4 className="font-medium text-sm text-gray-900">{banner.work_title}</h4>
          <p className="text-xs text-gray-500">{banner.work_client}</p>
          <p className="text-xs text-gray-400 mt-1">
            {banner.is_custom_video ? 'Custom Video' : 'Default Video'}
          </p>
        </div>

        {/* Position */}
        <div className="text-sm text-gray-500 font-medium">
          #{index + 1}
        </div>
      </div>
    </div>
  );
};

const ReorderBannerModal = ({
  isOpen,
  onClose,
  banners,
  onSave,
  moveBanner,
  loading = false
}) => {
  console.log('🎭 ReorderBannerModal render:', { isOpen, bannersCount: banners?.length });
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">Reorder Video Banners</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Drag and drop the banners below to change their order. The banner at the top will be displayed first.
            </p>
          </div>

          {banners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiMove className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No banners to reorder</p>
            </div>
          ) : (
            <div className="space-y-2">
              {banners.map((banner, index) => (
                <DraggableBannerItem
                  key={banner.id}
                  banner={banner}
                  index={index}
                  moveBanner={moveBanner}
                />
              ))}
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
              !loading
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            onClick={onSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReorderBannerModal;