import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSearch, FiX, FiMove, FiPlus, FiFilter, FiEdit } from 'react-icons/fi';
import {
  getProjects,
  publishProject,
  unpublishProject,
  reorderProjects,
} from '../../api/projects';
import ReorderProjectsModal from './ReorderProjectsModal';

const Projects = () => {
  const navigate = useNavigate();
  
  // State
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('display_order');
  const [sortDirection, setSortDirection] = useState('asc');
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  
  // Modals
  const [isSaving, setIsSaving] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [projectToPublish, setProjectToPublish] = useState(null);

  // Load projects when filters change
  useEffect(() => {
    loadProjects();
  }, [currentPage, perPage, searchQuery, statusFilter, sortBy, sortDirection]);

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await getProjects(params);
      
      if (response.success) {
        setProjects(response.data || []);
        setTotalPages(response.meta?.last_page || 1);
        setTotalProjects(response.meta?.total || response.data?.length || 0);
        setCurrentPage(response.meta?.current_page || 1);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openReorderModal = async () => {
    try {
      // Fetch all projects for reordering
      const response = await getProjects({
        per_page: 1000,
        sort_by: 'display_order',
        sort_direction: 'asc',
      });
      
      if (response.success) {
        setIsReorderModalOpen(true);
      }
    } catch (error) {
      toast.error('Failed to load projects for reordering');
      console.error('Error loading projects for reorder:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePublishClick = (project) => {
    setProjectToPublish(project);
    setShowPublishConfirm(true);
  };

  const confirmPublishToggle = async () => {
    if (!projectToPublish) return;
    
    try {
      const response = projectToPublish.status === 'published'
        ? await unpublishProject(projectToPublish.uuid)
        : await publishProject(projectToPublish.uuid);

      if (response.success) {
        toast.success(
          projectToPublish.status === 'published'
            ? 'Project set to draft'
            : 'Project published successfully'
        );
        loadProjects();
      }
    } catch (error) {
      toast.error('Failed to update project status');
      console.error('Error updating status:', error);
    } finally {
      setShowPublishConfirm(false);
      setProjectToPublish(null);
    }
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all';

  const handleReorderSave = async (reorderedProjects) => {
    setIsSaving(true);
    try {
      const response = await reorderProjects(reorderedProjects);
      if (response.success) {
        toast.success('Projects reordered successfully');
        setIsReorderModalOpen(false);
        loadProjects();
      }
    } catch (error) {
      toast.error('Failed to reorder projects');
      console.error('Error reordering projects:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (project) => {
    navigate(`/projects/${project.uuid}/edit`);
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 py-8">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <h1 className="lg:text-[40px] text-[36px] text-black font-bold lg:mb-[60px] mb-8 text-center">
        PROJECTS
      </h1>

      {/* Controls */}
      <div className="flex flex-col gap-4 mb-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          {/* Search */}
          <div className="relative flex w-full lg:w-auto lg:min-w-[400px]">
            <input
              type="text"
              placeholder="Search by project title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pr-10 pl-3 py-2 w-full border-b border-gray-300 focus:outline-none focus:border-black"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-8 flex items-center"
              >
                <FiX className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
            <span className="absolute inset-y-0 right-2 flex items-center">
              <FiSearch className="text-gray-500" />
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={openReorderModal}
              disabled={projects.length <= 1}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                projects.length <= 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <FiMove className="h-4 w-4" />
              Reorder
            </button>
            <button
              onClick={() => navigate('/projects/create')}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Create
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 flex-wrap mt-4">
          <FiFilter className="text-gray-500" />
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-black"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-black"
          >
            <option value="display_order">Display Order</option>
            <option value="title">Title</option>
            <option value="created_at">Date Created</option>
          </select>

          {/* Sort Direction */}
          <button
            onClick={() => {
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              setCurrentPage(1);
            }}
            className="px-3 py-2 border-b border-gray-300 hover:border-black transition-colors"
          >
            {sortDirection === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>

          {/* Per Page */}
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-black"
          >
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-black underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <p className="mt-2 text-sm text-gray-600">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">No projects found</p>
              <button
                onClick={() => navigate('/projects/create')}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                Create your first project
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-3 px-2 w-16">Image</th>
                    <th className="text-left py-3 px-2">Title</th>
                    <th className="text-left py-3 px-2">Location</th>
                    <th className="text-left py-3 px-2">Year</th>
                    <th className="text-left py-3 px-2">Images</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.uuid} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                          {project.images && project.images.length > 0 ? (
                            <img
                              src={project.images[0].url}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FiEdit size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {project.title}
                      </td>
                      <td className="py-3 px-2 text-gray-600 text-sm">
                        {project.location || '-'}
                      </td>
                      <td className="py-3 px-2 text-gray-600 text-sm">
                        {project.year || '-'}
                      </td>
                      <td className="py-3 px-2 text-gray-600 text-sm">
                        {project.images?.length || 0}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {project.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(project)}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handlePublishClick(project)}
                            className={`px-3 py-1 text-xs font-medium rounded ${
                              project.status === 'published'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                            title={project.status === 'published' ? 'Unpublish' : 'Publish'}
                          >
                            {project.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Pagination */}
      {!isLoading && projects.length > 0 && (
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-sm text-gray-600">
            Showing {projects.length} of {totalProjects} projects
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === pageNum
                        ? 'bg-black text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReorderProjectsModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        projects={projects}
        onSave={handleReorderSave}
        isLoading={isSaving}
      />

      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {projectToPublish?.status === 'published' ? 'Unpublish Project?' : 'Publish Project?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {projectToPublish?.status === 'published'
                ? 'This will set the project to draft and hide it from the public site.'
                : 'This will make the project visible on the public site.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPublishConfirm(false);
                  setProjectToPublish(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmPublishToggle}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  projectToPublish?.status === 'published'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {projectToPublish?.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
