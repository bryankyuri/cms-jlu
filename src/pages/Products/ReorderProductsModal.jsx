import React, { useRef } from 'react';
import { FiX, FiMove } from 'react-icons/fi';

const DraggableProductItem = ({ product, index, moveProduct }) => {
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
      moveProduct(dragData.index, index);
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
        {/* Product Thumbnail */}
        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiMove className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-grow">
          <h4 className="font-medium text-sm text-gray-900">{product.name}</h4>
          <p className="text-xs text-gray-500">{product.category?.name || 'No Category'}</p>
          <div className="flex gap-2 mt-1 items-center flex-wrap">
            {product.status && (
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                  product.status === "published"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {product.status}
              </span>
            )}
            {product.tags && product.tags.length > 0 && (
              <>
                {product.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
                {product.tags.length > 3 && (
                  <span className="text-xs text-gray-400">+{product.tags.length - 3}</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Position */}
        <div className="text-sm text-gray-500 font-medium">
          #{index + 1}
        </div>
      </div>
    </div>
  );
};

const ReorderProductsModal = ({
  isOpen,
  onClose,
  products,
  onSave,
  onReorder,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">Reorder Products</h3>
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
              Drag and drop the products below to change their order. The product at the top will be displayed first.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiMove className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No products to reorder</p>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((product, index) => (
                <DraggableProductItem
                  key={product.id}
                  product={product}
                  index={index}
                  moveProduct={onReorder}
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

export default ReorderProductsModal;
