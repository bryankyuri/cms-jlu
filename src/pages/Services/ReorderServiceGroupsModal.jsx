import React, { useRef } from 'react';
import { FiX, FiMove } from 'react-icons/fi';

const DraggableGroupItem = ({ group, index, moveGroup }) => {
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
      moveGroup(dragData.index, index);
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
        <div className="flex-grow">
          <h4 className="font-medium text-sm text-gray-900">{group.name}</h4>
          <p className="text-xs text-gray-500">{group.items_count || 0} items</p>
          <span
            className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize mt-1 ${
              group.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {group.status}
          </span>
        </div>

        <div className="text-sm text-gray-500 font-medium">
          #{index + 1}
        </div>
      </div>
    </div>
  );
};

const ReorderServiceGroupsModal = ({ isOpen, onClose, groups, onSave, onMove, loading = false }) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Reorder Service Groups</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Drag & Drop List */}
        <div className="p-6 flex-1 overflow-y-auto">
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop groups to reorder them. The group at the top will be displayed first.
          </p>

          {groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiMove className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No groups to reorder</p>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map((group, index) => (
                <DraggableGroupItem
                  key={group.id}
                  group={group}
                  index={index}
                  moveGroup={onMove}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
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
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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

export default ReorderServiceGroupsModal;
