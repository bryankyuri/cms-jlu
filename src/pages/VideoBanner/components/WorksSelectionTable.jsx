import React from 'react';
import { FiSearch, FiX, FiFilter, FiEye } from 'react-icons/fi';
import MultiSelect from '../../../components/MultiSelect';

const WorksSelectionTable = ({
  works,
  loading,
  error,
  selectedWork,
  onWorkSelect,
  // Pagination props
  currentPage,
  totalPages,
  totalWorks,
  onPageChange,
  perPage,
  onPerPageChange,
  // Filter props
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  tagsFilter,
  onTagsChange,
  onClearFilters,
  onRetry
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || tagsFilter.length > 0;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <FiSearch className="text-gray-500" />
          </span>
          <input
            type="text"
            placeholder="Search by title, client, or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:border-black"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-2"
            >
              <FiX className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter className="text-gray-500" />
          
          {/* Per Page Filter */}
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={15}>15 per page</option>
            <option value={25}>25 per page</option>
          </select>
          
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          >
            <option value="all">All Categories</option>
            <option value="film/series">Film/Series</option>
            <option value="commercial">Commercial</option>
          </select>

          {/* Tags Filter */}
          <MultiSelect
            options={[
              { value: 'MOTION GRAPHIC', label: 'Motion Graphic' },
              { value: 'COLOR GRADING', label: 'Color Grading' },
              { value: 'VFX', label: 'VFX' },
              { value: 'CGI', label: 'CGI' }
            ]}
            value={tagsFilter}
            onChange={onTagsChange}
            placeholder="Select Tags..."
            className="min-w-[140px]"
          />

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      {!loading && !error && (
        <div className="text-sm text-gray-600">
          Showing {works.length} of {totalWorks} published works
          {searchQuery && ` for "${searchQuery}"`}
          {categoryFilter !== 'all' && ` (Category: ${categoryFilter})`}
          {tagsFilter.length > 0 && ` (Tags: ${tagsFilter.join(', ')})`}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading works...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Works Table */}
      {!loading && !error && works.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {works.map((work) => (
                  <tr 
                    key={work.id} 
                    onClick={() => onWorkSelect(work)}
                    className={`cursor-pointer transition-colors ${
                      selectedWork?.id === work.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-16">
                          {work.hero_banner_image ? (
                            <img
                              className="h-12 w-16 object-cover rounded"
                              src={work.hero_banner_image}
                              alt={work.title}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {work.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {work.client}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {work.category || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {work.year || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1 max-w-90">
                        {work.tags && work.tags.length > 0 ? (
                          work.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">No tags</span>
                        )}
                        {work.tags && work.tags.length > 2 && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            +{work.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(work.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && works.length === 0 && (
        <div className="text-center py-12">
          <FiEye size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg text-gray-600 mb-2">No works found</h3>
          <p className="text-gray-500 mb-4">
            {hasActiveFilters
              ? "No published works match your current filters. Try adjusting your search criteria."
              : "No published works available."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default WorksSelectionTable;