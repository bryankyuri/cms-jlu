import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiMove } from 'react-icons/fi';

const DraggableItemComponent = ({ item, index, moveItem }) => {
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
      moveItem(dragData.index, index);
    }
  };

  // Helper to strip HTML tags for preview
  const stripHtml = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
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
      
      <div className="flex-grow min-w-0">
        <h4 className="font-medium text-sm text-gray-900 truncate">{item.title}</h4>
        <p className="text-xs text-gray-500 truncate">
          {stripHtml(item.description).substring(0, 60)}...
        </p>
      </div>

      <div className="text-sm text-gray-500 font-medium flex-shrink-0">
        #{index + 1}
      </div>
    </div>
  );
};

const ReorderServiceItemsModal = ({ isOpen, onClose, items, groups, selectedGroup, onGroupChange, onSave, loading = false }) => {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [orderedItems, setOrderedItems] = useState([]);

  // Filter and initialize items when modal opens or group changes
  useEffect(() => {
    if (isOpen && items && selectedGroupId) {
      const filteredItems = items
        .filter((item) => item.service_group_id === parseInt(selectedGroupId))
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      setOrderedItems(filteredItems);
    } else if (isOpen && items && groups?.length > 0 && !selectedGroupId) {
      // Auto-select first group
      setSelectedGroupId(groups[0].id.toString());
    }
  }, [isOpen, items, selectedGroupId, groups]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedGroupId('');
      setOrderedItems([]);
    }
  }, [isOpen]);

  const moveItem = (dragIndex, hoverIndex) => {
    const dragItem = orderedItems[dragIndex];
    const newOrder = [...orderedItems];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragItem);
    setOrderedItems(newOrder);
  };

  const handleGroupChange = (e) => {
    setSelectedGroupId(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Reorder Service Items</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Group Selector */}
        <div className="px-6 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Group
          </label>
          <select
            value={selectedGroupId}
            onChange={handleGroupChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          >
            <option value="">Choose a group...</option>
            {groups?.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Drag & Drop List */}
        <div className="p-6 flex-1 overflow-y-auto">
          {selectedGroupId ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop items to reorder them within this group. The item at the top will be displayed first.
              </p>

              {orderedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiMove className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>No items in this group</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orderedItems.map((item, index) => (
                    <DraggableItemComponent
                      key={item.id}
                      item={item}
                      index={index}
                      moveItem={moveItem}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Please select a group to reorder its items.
            </p>
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
            onClick={() => onSave(orderedItems)}
            disabled={loading || !selectedGroupId || orderedItems.length === 0}
          >
            {loading ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReorderServiceItemsModal;
