import React from 'react';

const ContactSubmissionsTable = ({
  submissions,
  loading,
  pagination,
  filters,
  selectedItems,
  onFilterChange,
  onSubmissionSelect,
  onSelectAll,
  onViewSubmission,
  onUpdateSubmission,
  onDeleteSubmission
}) => {
  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-orange-100 text-orange-800',
      reviewed: 'bg-blue-100 text-blue-800',
      responded: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getFormTypeBadge = (formType) => {
    const typeColors = {
      career: 'bg-purple-100 text-purple-800',
      pitch: 'bg-indigo-100 text-indigo-800',
      produce: 'bg-teal-100 text-teal-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[formType] || 'bg-gray-100 text-gray-800'}`}>
        {formType}
      </span>
    );
  };

  const handleSort = (field) => {
    const newOrder = filters.sort_by === field && filters.sort_order === 'asc' ? 'desc' : 'asc';
    onFilterChange('sort_by', field);
    onFilterChange('sort_order', newOrder);
  };

  const getSortIcon = (field) => {
    if (filters.sort_by !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return filters.sort_order === 'asc' ? <span className="text-gray-600">↑</span> : <span className="text-gray-600">↓</span>;
  };

  const handleQuickStatusUpdate = async (submission, newStatus) => {
    await onUpdateSubmission(submission.id, { 
      status: newStatus,
      admin_notes: submission.admin_notes || ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.length === submissions.length && submissions.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                Date {getSortIcon('created_at')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Name {getSortIcon('name')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('email')}
              >
                Email {getSortIcon('email')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('form_type')}
              >
                Type {getSortIcon('form_type')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(submission.id)}
                    onChange={() => onSubmissionSelect(submission.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(submission.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{submission.name}</div>
                  {submission.company_name && (
                    <div className="text-sm text-gray-500">{submission.company_name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{submission.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getFormTypeBadge(submission.form_type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={submission.status}
                    onChange={(e) => handleQuickStatusUpdate(submission, e.target.value)}
                    className="text-sm border-0 bg-transparent p-0 focus:ring-0"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="responded">Responded</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{truncateText(submission.message)}</div>
                  {submission.subject && (
                    <div className="text-sm text-gray-500">Subject: {truncateText(submission.subject, 30)}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewSubmission(submission)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onDeleteSubmission(submission.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onFilterChange('page', pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onFilterChange('page', pagination.current_page + 1)}
              disabled={!pagination.has_more_pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{pagination.from}</span> to{' '}
                <span className="font-medium">{pagination.to}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onFilterChange('page', pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(pagination.last_page, 10) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => onFilterChange('page', page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.current_page
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onFilterChange('page', pagination.current_page + 1)}
                  disabled={!pagination.has_more_pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {submissions.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500">No contact submissions found</div>
        </div>
      )}
    </div>
  );
};

export default ContactSubmissionsTable;