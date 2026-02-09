import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiMove, FiSearch, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { serviceItemAPI, serviceGroupAPI } from '../../api';
import CreateServiceItemModal from './CreateServiceItemModal';
import EditServiceItemModal from './EditServiceItemModal';
import ReorderServiceItemsModal from './ReorderServiceItemsModal';

const ServiceItemsList = () => {
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [openAccordions, setOpenAccordions] = useState({});
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [reorderItems, setReorderItems] = useState([]);
  const [selectedReorderGroup, setSelectedReorderGroup] = useState('');

  // Fetch Service Groups for filter dropdown
  const fetchGroups = async () => {
    try {
      const response = await serviceGroupAPI.getAll({ 
        status: 'active',
        sort_by: 'display_order',
        sort_direction: 'asc'
      });
      setGroups(response || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch Service Items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        sort_by: 'display_order',
        sort_direction: 'asc',
        per_page: 1000
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (groupFilter !== 'all') {
        params.service_group_id = groupFilter;
      }

      const response = await serviceItemAPI.getAll(params);
      setItems(response.data || []);
    } catch (error) {
      console.error('Error fetching service items:', error);
      toast.error('Failed to fetch service items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchQuery, statusFilter, groupFilter]);

  // Group items by service group
  const groupedItems = items.reduce((acc, item) => {
    const groupId = item.service_group_id;
    const groupName = item.service_group?.name || 'Unknown Group';
    
    if (!acc[groupId]) {
      acc[groupId] = {
        groupId,
        groupName,
        items: []
      };
    }
    acc[groupId].items.push(item);
    return acc;
  }, {});

  const toggleAccordion = (groupId) => {
    setOpenAccordions(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Create Item
  const handleCreate = async (itemData) => {
    try {
      await serviceItemAPI.create(itemData);
      toast.success('Service item created successfully');
      setIsCreateModalOpen(false);
      fetchItems();
    } catch (error) {
      console.error('Error creating service item:', error);
      toast.error(error.message || 'Failed to create service item');
    }
  };

  // Edit Item
  const handleEdit = async (itemData) => {
    try {
      await serviceItemAPI.update(currentItem.id, itemData);
      toast.success('Service item updated successfully');
      setIsEditModalOpen(false);
      setCurrentItem(null);
      fetchItems();
    } catch (error) {
      console.error('Error updating service item:', error);
      toast.error(error.message || 'Failed to update service item');
    }
  };

  // Delete Item
  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this service item?')) {
      return;
    }

    try {
      await serviceItemAPI.delete(itemId);
      toast.success('Service item deleted successfully');
      fetchItems();
    } catch (error) {
      console.error('Error deleting service item:', error);
      toast.error('Failed to delete service item');
    }
  };

  // Reorder Items
  const openReorderModal = async () => {
    try {
      const params = {
        sort_by: 'display_order',
        sort_direction: 'asc',
        per_page: 1000
      };
      
      const response = await serviceItemAPI.getAll(params);
      setReorderItems(response.data || []);
      setSelectedReorderGroup('');
      setIsReorderModalOpen(true);
    } catch (error) {
      console.error('Error loading items for reorder:', error);
      toast.error('Failed to load items for reordering');
    }
  };

  const handleReorderGroupChange = (groupId) => {
    setSelectedReorderGroup(groupId);
  };

  const handleReorderSave = async (orderedItems) => {
    try {
      const itemsData = {
        items: orderedItems.map((item, index) => ({
          id: item.id,
          display_order: index + 1
        }))
      };

      const response = await serviceItemAPI.reorder(itemsData);
      
      if (response.success) {
        toast.success('Item order updated successfully');
        setIsReorderModalOpen(false);
        await fetchItems();
      } else {
        throw new Error(response.message || 'Failed to reorder items');
      }
    } catch (error) {
      console.error('Error reordering items:', error);
      toast.error(error.message || 'Failed to update item order');
    }
  };

  // Strip HTML for preview
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Action Bar */}
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Group Filter */}
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
        >
          <option value="all">All Groups</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={openReorderModal}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={items.length < 2}
          >
            <FiMove /> Reorder
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            <FiPlus /> Add Item
          </button>
        </div>
      </div>

      {/* Items List (Grouped by Service Group) */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No service items found</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Create your first item
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(groupedItems).map(({ groupId, groupName, items: groupItems }) => (
            <div key={groupId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Group Header */}
              <button
                onClick={() => toggleAccordion(groupId)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">
                  {groupName} ({groupItems.length})
                </span>
                {openAccordions[groupId] ? (
                  <FiChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* Group Items */}
              <AnimatePresence>
                {openAccordions[groupId] && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-gray-100">
                      {groupItems.map((item) => (
                        <div
                          key={item.id}
                          className="px-6 py-4 flex items-start justify-between hover:bg-gray-50"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500">#{item.display_order}</span>
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {item.title}
                              </h4>
                              <span
                                className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  item.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {stripHtml(item.description)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => {
                                setCurrentItem(item);
                                setIsEditModalOpen(true);
                              }}
                              className="text-gray-600 hover:text-black p-1"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateServiceItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        groups={groups}
      />

      <EditServiceItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCurrentItem(null);
        }}
        onSubmit={handleEdit}
        item={currentItem}
        groups={groups}
      />

      <ReorderServiceItemsModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        items={reorderItems}
        groups={groups}
        selectedGroup={selectedReorderGroup}
        onGroupChange={handleReorderGroupChange}
        onSave={handleReorderSave}
      />
    </div>
  );
};

export default ServiceItemsList;
