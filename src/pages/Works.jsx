import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FiSearch, FiX, FiFilter, FiPlus, FiEye, FiEdit, FiAlertTriangle } from "react-icons/fi";
import { worksAPI } from "../api";
import MultiSelect from "../components/MultiSelect";

const Works = () => {
  // State management
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tagsFilter, setTagsFilter] = useState([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWorks, setTotalWorks] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [workToToggle, setWorkToToggle] = useState(null);

  const navigate = useNavigate();

  // Fetch works from API
  const fetchWorks = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: 12,
      };

      // Only add parameters if they have actual values
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (statusFilter.length > 0) {
        params.status = statusFilter;
      }

      if (categoryFilter !== "all") {
        params.category = categoryFilter;
      }

      if (tagsFilter.length > 0) {
        params.tags = tagsFilter;
      }

      params.sort_by = sortBy;
      params.sort_direction = sortDirection;

      const response = await worksAPI.getAll(params);

      setWorks(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
      setTotalWorks(response.meta?.total || 0);
      setCurrentPage(response.meta?.current_page || 1);
    } catch (err) {
      console.error("Error fetching works:", err);
      setError(err.response?.data?.message || "Failed to fetch works");
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchWorks();
  }, [
    currentPage,
    searchQuery,
    statusFilter,
    categoryFilter,
    tagsFilter,
    sortBy,
    sortDirection,
  ]);

  // Computed values
  const filteredAndSortedWorks = works;

  // Helper functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Event handlers
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setCategoryFilter("all");
    setTagsFilter([]);
    setCurrentPage(1);
  };

  const handleToggleStatus = async (work) => {
    setWorkToToggle(work);
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!workToToggle) return;

    try {
      const newStatus = workToToggle.status === "published" ? "draft" : "published";

      if (newStatus === "published") {
        await worksAPI.publish(workToToggle.id);
      } else {
        await worksAPI.unpublish(workToToggle.id);
      }

      // Update local state
      setWorks((prevWorks) =>
        prevWorks.map((w) =>
          w.id === workToToggle.id ? { ...w, status: newStatus } : w
        )
      );

      toast.success(
        `Work ${
          newStatus === "published" ? "published" : "unpublished"
        } successfully!`
      );
    } catch (error) {
      console.error("Error toggling work status:", error);
      toast.error("Failed to update work status");
    } finally {
      setShowConfirmModal(false);
      setWorkToToggle(null);
    }
  };

  const cancelToggleStatus = () => {
    setShowConfirmModal(false);
    setWorkToToggle(null);
  };

  return (
    <div className="w-full px-4 py-8">
      <ToastContainer position="top-center" autoClose={3000} />

      <h1 className="lg:text-[40px] text-[36px] text-black font-bold lg:mb-[60px] text-center">
        WORKS
      </h1>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start mb-10 gap-4">
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
          {/* Search input */}
          <div className="relative flex w-full sm:w-auto min-w-[500px] mr-8">
            <input
              type="text"
              placeholder="Search by title, client, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 pl-2 py-2 w-full border-b border-gray-300 focus:outline-none focus:border-black"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2"
              >
                <FiX className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
              <FiSearch className="text-gray-500" />
            </span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <FiFilter className="text-gray-500" />

            {/* Status Filter - Multiple Selection */}
            <MultiSelect
              options={[
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Select Status..."
              className="min-w-[160px]"
            />

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-[11px] border-b border-gray-300 focus:outline-none focus:border-black"
            >
              <option value="all">All Categories</option>
              <option value="film/series">Film/Series</option>
              <option value="commercial">Commercial</option>
            </select>

            {/* Tags Filter - Multiple Selection */}
            <MultiSelect
              options={[
                { value: "MOTION GRAPHIC", label: "Motion Graphic" },
                { value: "COLOR GRADING", label: "Color Grading" },
                { value: "VFX", label: "VFX" },
                { value: "CGI", label: "CGI" },
              ]}
              value={tagsFilter}
              onChange={setTagsFilter}
              placeholder="Select Tags..."
              className="min-w-[140px]"
            />

            {/* Sort options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-[11px] border-b border-gray-300 focus:outline-none focus:border-black"
            >
              <option value="created_at">Date Created</option>
              <option value="updated_at">Last Modified</option>
              <option value="title">Title</option>
              <option value="client">Client</option>
              <option value="status">Status</option>
            </select>

            <button
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
              className="px-3 py-[8px] border-b border-gray-300 hover:bg-gray-50 focus:outline-none"
            >
              {sortDirection === "asc" ? "↑ Sort Ascending" : "↓ Sort Descending"}
            </button>

            {/* Clear filters */}
            {(searchQuery ||
              statusFilter.length > 0 ||
              categoryFilter !== "all" ||
              tagsFilter.length > 0) && (
              <button
                onClick={clearFilters}
                className="px-3 py-[11px] bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Create Work Button */}
        <Link
          to="/works/create"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap"
        >
          <FiPlus size={20} />
          Create Work
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading works...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchWorks}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Works List */}
      {!loading && !error && (
        <>
          {/* Results Info */}
          <div className="mb-6 text-sm text-gray-600">
            Showing {filteredAndSortedWorks.length} of {totalWorks} works
            {searchQuery && ` for "${searchQuery}"`}
            {statusFilter.length > 0 && ` (Status: ${statusFilter.join(", ")})`}
            {categoryFilter !== "all" && ` (Category: ${categoryFilter})`}
            {tagsFilter.length > 0 && ` (Tags: ${tagsFilter.join(", ")})`}
          </div>

          {/* Works Table */}
          {filteredAndSortedWorks.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Work
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tags
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedWorks.map((work) => (
                      <tr key={work.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-16">
                              {work.hero_banner_image ? (
                                <img
                                  className="h-12 w-16 object-cover rounded"
                                  src={work.hero_banner_image}
                                  alt={work.title}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {work.title}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {work.client}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {work.category ? work.category === "film/series" ? "Film/Series" : "Commercial" : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {work.year || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {work.tags && work.tags.length > 0 ? (
                              // work.tags.slice(0, 2).map((tag, index) => (
                              work.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">
                                No tags
                              </span>
                            )}
                            {/* {work.tags && work.tags.length >  && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                +{work.tags.length - 3}
                              </span>
                            )} */}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                              work.status === "published"
                                ? "bg-green-100 text-green-800"
                                : work.status === "unpublished"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {work.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(work.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-8">
                            {/* <Link
                              to={`/works/detail/${work.id}`}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                            >
                              <FiEye size={16} />
                              View
                            </Link> */}

                            <Link
                              to={`/works/edit/${work.id}`}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <FiEdit size={16} />
                              Edit
                            </Link>

                            <button
                              onClick={() => handleToggleStatus(work)}
                              className={`flex items-center gap-1 ${
                                work.status === "published"
                                  ? "text-yellow-600 hover:text-yellow-900"
                                  : "text-green-600 hover:text-green-900"
                              }`}
                            >
                              <FiEye size={16} />
                              {work.status === "published"
                                ? "Unpublish"
                                : "Publish"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiEye size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl text-gray-600 mb-2">No works found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery ||
                statusFilter.length > 0 ||
                categoryFilter !== "all" ||
                tagsFilter.length > 0
                  ? "No works match your current filters. Try adjusting your search criteria."
                  : "You haven't created any works yet. Get started by creating your first work!"}
              </p>
              <Link
                to="/works/create"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
              >
                <FiPlus size={20} />
                Create Your First Work
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage >= totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && workToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <FiAlertTriangle className="text-yellow-500 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Action
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-semibold">
                {workToToggle.status === "published" ? "unpublish" : "publish"}
              </span>{" "}
              the work "{workToToggle.title}"?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelToggleStatus}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleStatus}
                className={`px-4 py-2 text-white rounded-md transition-colors ${
                  workToToggle.status === "published"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {workToToggle.status === "published" ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Works;
