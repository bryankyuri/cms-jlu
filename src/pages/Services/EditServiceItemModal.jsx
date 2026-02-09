import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditServiceItemModal = ({ isOpen, onClose, onSubmit, item, groups }) => {
  const [formData, setFormData] = useState({
    service_group_id: '',
    title: '',
    description: '',
    status: 'active'
  });

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link'
  ];

  // Load item data when modal opens
  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        service_group_id: item.service_group_id?.toString() || '',
        title: item.title || '',
        description: item.description || '',
        status: item.status || 'active'
      });
    }
  }, [isOpen, item]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.service_group_id) {
      alert('Please select a service group');
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!formData.description.trim() || formData.description === '<p><br></p>') {
      alert('Please enter a description');
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      service_group_id: '',
      title: '',
      description: '',
      status: 'active'
    });
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold">Edit Service Item</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Service Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Group <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.service_group_id}
                onChange={(e) =>
                  setFormData({ ...formData, service_group_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                required
              >
                <option value="">Select a group...</option>
                {groups?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                placeholder="Enter service title..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/500 characters
              </p>
            </div>

            {/* Description (WYSIWYG) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                modules={quillModules}
                formats={quillFormats}
                placeholder="Enter service description..."
                className="bg-white"
                style={{ minHeight: '200px' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use the toolbar to format your description
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Update Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceItemModal;
