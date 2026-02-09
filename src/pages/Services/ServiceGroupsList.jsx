import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiMove, FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { serviceGroupAPI } from '../../api';
import CreateServiceGroupModal from './CreateServiceGroupModal';
import EditServiceGroupModal from './EditServiceGroupModal';
import ReorderServiceGroupsModal from './ReorderServiceGroupsModal';

const ServiceGroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [reorderGroups, setReorderGroups] = useState([]);

  // Fetch Service Groups
  const fetchGroups = async () => {
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

      const response = await serviceGroupAPI.getAll(params);
      setGroups(response || []);
    } catch (error) {
      console.error('Error fetching service groups:', error);
      toast.error('Failed to fetch service groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [searchQuery, statusFilter]);

  // Create Group
  const handleCreate = async (groupData) => {
    try {
      await serviceGroupAPI.create(groupData);
      toast.success('Service group created successfully');
      setIsCreateModalOpen(false);
      fetchGroups();
    } catch (error) {
      console.error('Error creating service group:', error);
      toast.error(error.message || 'Failed to create service group');
    }
  };

  // Edit Group
  const handleEdit = async (groupData) => {
    try {
      await serviceGroupAPI.update(currentGroup.id, groupData);
      toast.success('Service group updated successfully');
      setIsEditModalOpen(false);
      setCurrentGroup(null);
      fetchGroups();
    } catch (error) {
      console.error('Error updating service group:', error);
      toast.error(error.message || 'Failed to update service group');
    }
  };

  // Delete Group
  const handleDelete = async (groupId, itemsCount) => {
    if (itemsCount > 0) {
      toast.error('Cannot delete group with existing service items. Please delete all items first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this service group?')) {
      return;
    }

    try {
      await serviceGroupAPI.delete(groupId);
      toast.success('Service group deleted successfully');
      fetchGroups();
    } catch (error) {
      console.error('Error deleting service group:', error);
      toast.error(error.message || 'Failed to delete service group');
    }
  };

  // Reorder Groups
  const openReorderModal = async () => {
    try {
      const params = {
        sort_by: 'display_order',
        sort_direction: 'asc',
        per_page: 1000
      };
      
      const response = await serviceGroupAPI.getAll(params);
      setReorderGroups(response || []);
      setIsReorderModalOpen(true);
    } catch (error) {
      console.error('Error loading groups for reorder:', error);
      toast.error('Failed to load groups for reordering');
    }
  };

  const handleReorderSave = async () => {
    try {
      const groupsData = {
        groups: reorderGroups.map((group, index) => ({
          id: group.id,
          display_order: index + 1
        }))
      };

      const response = await serviceGroupAPI.reorder(groupsData);
      
      if (response.success) {
        setGroups(reorderGroups);
        toast.success('Group order updated successfully');
        setIsReorderModalOpen(false);
        await fetchGroups();
      } else {
        throw new Error(response.message || 'Failed to reorder groups');
      }
    } catch (error) {
      console.error('Error reordering groups:', error);
      toast.error(error.message || 'Failed to update group order');
    }
  };

  const moveGroup = (dragIndex, hoverIndex) => {
    const dragGroup = reorderGroups[dragIndex];
    const newOrder = [...reorderGroups];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragGroup);
    setReorderGroups(newOrder);
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
            placeholder="Search groups..."
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={openReorderModal}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={groups.length < 2}
          >
            <FiMove /> Reorder
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            <FiPlus /> Add Group
          </button>
        </div>
      </div>

      {/* Groups Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No service groups found</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Create your first group
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {groups.map((group) => (
                  <motion.tr
                    key={group.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {group.display_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {group.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {group.items_count} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          group.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {group.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => {
                          setCurrentGroup(group);
                          setIsEditModalOpen(true);
                        }}
                        className="text-gray-600 hover:text-black"
                        title="Edit"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <CreateServiceGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
      />

      <EditServiceGroupModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCurrentGroup(null);
        }}
        onSubmit={handleEdit}
        group={currentGroup}
      />

      <ReorderServiceGroupsModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        groups={reorderGroups}
        onMove={moveGroup}
        onSave={handleReorderSave}
      />
    </div>
  );
};

export default ServiceGroupsList;
