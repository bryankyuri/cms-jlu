import React, { useState, useEffect, useCallback } from 'react';
import { contactSubmissionsApi } from '../../api';
import ContactSubmissionsTable from './ContactSubmissionsTable';
import ContactSubmissionsFilters from './ContactSubmissionsFilters';
import ContactSubmissionModal from './ContactSubmissionModal';
import { toast } from 'react-toastify';

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    form_type: '',
    status: '',
    date_from: '',
    date_to: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 20,
    page: 1
  });

  // Fetch submissions
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contactSubmissionsApi.getAll(filters);
      
      if (response.success) {
        setSubmissions(response.data);
        setPagination(response.pagination);
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to fetch contact submissions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 for new filters
    }));
  };

  // Handle bulk filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
  };

  // Handle submission selection
  const handleSubmissionSelect = (submissionId) => {
    setSelectedItems(prev => {
      if (prev.includes(submissionId)) {
        return prev.filter(id => id !== submissionId);
      } else {
        return [...prev, submissionId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === submissions.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(submissions.map(s => s.id));
    }
  };

  // Handle view submission
  const handleViewSubmission = async (submission) => {
    try {
      const response = await contactSubmissionsApi.getById(submission.id);
      if (response.success) {
        setSelectedSubmission(response.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching submission details:', error);
      toast.error('Failed to load submission details');
    }
  };

  // Handle update submission
  const handleUpdateSubmission = async (submissionId, updateData) => {
    try {
      const response = await contactSubmissionsApi.update(submissionId, updateData);
      if (response.success) {
        toast.success('Submission updated successfully');
        fetchSubmissions(); // Refresh the list
        setShowModal(false);
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    }
  };

  // Handle delete submission
  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const response = await contactSubmissionsApi.delete(submissionId);
      if (response.success) {
        toast.success('Submission deleted successfully');
        fetchSubmissions(); // Refresh the list
        setSelectedItems(prev => prev.filter(id => id !== submissionId));
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action, options = {}) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first');
      return;
    }

    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to delete ${selectedItems.length} submissions?`
      : `Are you sure you want to ${action.replace('_', ' ')} ${selectedItems.length} submissions?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await contactSubmissionsApi.bulkAction(action, selectedItems, options);
      if (response.success) {
        toast.success(response.message);
        fetchSubmissions(); // Refresh the list
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Form Submissions</h1>
        <p className="text-gray-600">Manage and respond to contact form submissions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Submissions</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.pending || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Reviewed</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.reviewed || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Responded</h3>
          <p className="text-2xl font-bold text-green-600">{stats.responded || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <ContactSubmissionsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onFiltersChange={handleFiltersChange}
        selectedItems={selectedItems}
        onBulkAction={handleBulkAction}
        stats={stats}
      />

      {/* Table */}
      <ContactSubmissionsTable
        submissions={submissions}
        loading={loading}
        pagination={pagination}
        filters={filters}
        selectedItems={selectedItems}
        onFilterChange={handleFilterChange}
        onSubmissionSelect={handleSubmissionSelect}
        onSelectAll={handleSelectAll}
        onViewSubmission={handleViewSubmission}
        onUpdateSubmission={handleUpdateSubmission}
        onDeleteSubmission={handleDeleteSubmission}
      />

      {/* Modal */}
      {showModal && selectedSubmission && (
        <ContactSubmissionModal
          submission={selectedSubmission}
          onClose={() => {
            setShowModal(false);
            setSelectedSubmission(null);
          }}
          onUpdate={handleUpdateSubmission}
        />
      )}
    </div>
  );
};

export default ContactSubmissions;