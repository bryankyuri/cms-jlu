import React, { useState } from 'react';

const ContactSubmissionsFilters = ({
  filters,
  onFilterChange,
  onFiltersChange,
  selectedItems,
  onBulkAction,
  stats
}) => {
  const [bulkActionType, setBulkActionType] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is handled by onChange, but this allows Enter key submission
  };

  const handleBulkActionSubmit = () => {
    if (!bulkActionType) return;
    
    if (bulkActionType === 'update_status') {
      const status = prompt('Enter new status (pending, reviewed, responded, archived):');
      if (status && ['pending', 'reviewed', 'responded', 'archived'].includes(status)) {
        onBulkAction('update_status', { status });
      }
    } else {
      onBulkAction(bulkActionType);
    }
    setBulkActionType('');
  };

  const clearFilters = () => {
    onFiltersChange({
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
  };

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="p-6">
        {/* Main Filters Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => onFilterChange('search', e.target.value)}
                  placeholder="Search by name, email, message..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </form>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center space-x-4">
            <select
              value={filters.form_type}
              onChange={(e) => onFilterChange('form_type', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              <option value="career">Career ({stats.by_form_type?.career || 0})</option>
              <option value="pitch">Pitch ({stats.by_form_type?.pitch || 0})</option>
              <option value="produce">Produce ({stats.by_form_type?.produce || 0})</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending ({stats.pending || 0})</option>
              <option value="reviewed">Reviewed ({stats.reviewed || 0})</option>
              <option value="responded">Responded ({stats.responded || 0})</option>
              <option value="archived">Archived ({stats.archived || 0})</option>
            </select>

            <select
              value={filters.per_page}
              onChange={(e) => onFilterChange('per_page', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Advanced
              <svg className={`ml-1 h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => onFilterChange('date_from', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => onFilterChange('date_to', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <div className="flex space-x-2">
                  <select
                    value={filters.sort_by}
                    onChange={(e) => onFilterChange('sort_by', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="created_at">Date Created</option>
                    <option value="updated_at">Date Updated</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="form_type">Form Type</option>
                    <option value="status">Status</option>
                  </select>
                  <select
                    value={filters.sort_order}
                    onChange={(e) => onFilterChange('sort_order', e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={bulkActionType}
                  onChange={(e) => setBulkActionType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Choose Action</option>
                  <option value="update_status">Update Status</option>
                  <option value="archive">Archive</option>
                  <option value="delete">Delete</option>
                </select>
                
                <button
                  onClick={handleBulkActionSubmit}
                  disabled={!bulkActionType}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactSubmissionsFilters;