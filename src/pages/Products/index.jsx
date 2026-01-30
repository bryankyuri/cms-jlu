import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSearch, FiX, FiFilter, FiPlus, FiEdit, FiMove } from 'react-icons/fi';
import {
  getProducts,
  PRODUCT_CATEGORIES,
  publishProduct,
  unpublishProduct,
  reorderProducts,
} from '../../api/products';
import ReorderProductsModal from './ReorderProductsModal';

// Predefined tags (same pattern as Works in cms-front)
const AVAILABLE_TAGS = [
  'crusher', 'screen', 'feeder', 'conveyor', 'belt',
  'parts', 'structural', 'sampling', 'heavy-duty', 'custom'
];

const Products = () => {
  const navigate = useNavigate();
  
  // State
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagsFilter, setTagsFilter] = useState([]);
  const [sortBy, setSortBy] = useState('display_order');
  const [sortDirection, setSortDirection] = useState('asc');
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Modals
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderProductsList, setReorderProductsList] = useState([]);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [productToPublish, setProductToPublish] = useState(null);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [currentPage, perPage, searchQuery, statusFilter, categoryFilter, tagsFilter, sortBy, sortDirection]);

  const loadProducts = async () => {
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

      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }

      if (tagsFilter.length > 0) {
        params.tags = tagsFilter;
      }

      const response = await getProducts(params);
      
      if (response.success) {
        setProducts(response.data || []);
        setTotalPages(response.meta?.last_page || 1);
        setTotalProducts(response.meta?.total || 0);
        setCurrentPage(response.meta?.current_page || 1);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishClick = (product) => {
    setProductToPublish(product);
    setShowPublishConfirm(true);
  };

  const confirmPublishToggle = async () => {
    if (!productToPublish) return;
    
    try {
      const response = productToPublish.status === 'published'
        ? await unpublishProduct(productToPublish.uuid)
        : await publishProduct(productToPublish.uuid);

      if (response.success) {
        toast.success(
          productToPublish.status === 'published'
            ? 'Product set to draft'
            : 'Product published successfully'
        );
        loadProducts();
      }
    } catch (error) {
      toast.error('Failed to update product status');
      console.error('Error updating status:', error);
    } finally {
      setShowPublishConfirm(false);
      setProductToPublish(null);
    }
  };

  const openReorderModal = async () => {
    try {
      // Fetch all products for reordering
      const response = await getProducts({
        per_page: 1000,
        sort_by: 'display_order',
        sort_direction: 'asc',
      });
      
      if (response.success) {
        setReorderProductsList(response.data || []);
        setIsReorderModalOpen(true);
      }
    } catch (error) {
      toast.error('Failed to load products for reordering');
      console.error('Error loading products for reorder:', error);
    }
  };

  const handleReorderSave = async () => {
    try {
      const productsData = reorderProductsList.map((product, index) => ({
        id: product.id,
        display_order: reorderProductsList.length - index,
      }));

      const response = await reorderProducts(productsData);
      
      if (response.success) {
        toast.success('Products reordered successfully');
        setIsReorderModalOpen(false);
        loadProducts();
      }
    } catch (error) {
      toast.error('Failed to reorder products');
      console.error('Error reordering products:', error);
    }
  };

  const moveProduct = (dragIndex, hoverIndex) => {
    const dragProduct = reorderProductsList[dragIndex];
    const newOrder = [...reorderProductsList];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragProduct);
    setReorderProductsList(newOrder);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setTagsFilter([]);
    setCurrentPage(1);
  };

  const toggleTagFilter = (tag) => {
    setTagsFilter(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
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

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || tagsFilter.length > 0;

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 py-8">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <h1 className="lg:text-[40px] text-[36px] text-black font-bold lg:mb-[60px] mb-8 text-center">
        PRODUCTS
      </h1>

      {/* Controls */}
      <div className="flex flex-col gap-4 mb-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          {/* Search */}
          <div className="relative flex w-full lg:w-auto lg:min-w-[400px]">
            <input
              type="text"
              placeholder="Search by product name..."
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
              disabled={products.length <= 1}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                products.length <= 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <FiMove className="h-4 w-4" />
              Reorder
            </button>
            <Link
              to="/products/create"
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              <FiPlus size={20} />
              Create
            </Link>
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

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-black"
          >
            <option value="all">All Categories</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-black"
          >
            <option value="display_order">Display Order</option>
            <option value="created_at">Date Created</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>

          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border-b border-gray-300 hover:bg-gray-50"
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
            <option value={30}>30 per page</option>
            <option value={50}>50 per page</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 ml-2"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Tags Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Tags:</span>
          {AVAILABLE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTagFilter(tag)}
              className={`px-2 py-1 text-sm rounded-md transition-colors ${
                tagsFilter.includes(tag)
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={loadProducts}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Products Table */}
      {!isLoading && !error && (
        <>
          {products.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No products found</p>
              <Link
                to="/products/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <FiPlus size={16} />
                Create First Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-3 px-2 w-16">Image</th>
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-left py-3 px-2">Category</th>
                    <th className="text-left py-3 px-2">Tags</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">Created</th>
                    <th className="text-left py-3 px-2 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FiEdit size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 font-medium">{product.name}</td>
                      <td className="py-3 px-2 text-gray-600">
                        {PRODUCT_CATEGORIES.find(c => c.value === product.category)?.label || product.category || '-'}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1 flex-wrap">
                          {product.tags?.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {product.tags?.length > 3 && (
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                              +{product.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-600 text-sm">
                        {formatDate(product.created_at)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/products/${product.uuid}/edit`)}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handlePublishClick(product)}
                            className={`px-3 py-1 text-xs font-medium rounded ${
                              product.status === 'published'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                            title={product.status === 'published' ? 'Unpublish' : 'Publish'}
                          >
                            {product.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && products.length > 0 && (
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mt-6">
              <div className="text-sm text-gray-600">
                Showing {products.length} of {totalProducts} products
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
        </>
      )}

      {/* Reorder Modal */}
      <ReorderProductsModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        products={reorderProductsList}
        onReorder={moveProduct}
        onSave={handleReorderSave}
      />

      {/* Publish/Unpublish Confirmation Modal */}
      {showPublishConfirm && productToPublish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {productToPublish.status === 'published' ? 'Unpublish Product' : 'Publish Product'}
            </h3>
            <p className="text-gray-600 mb-6">
              {productToPublish.status === 'published'
                ? `Are you sure you want to unpublish "${productToPublish.name}"? It will no longer be visible on the public website.`
                : `Are you sure you want to publish "${productToPublish.name}"? It will be visible on the public website.`
              }
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPublishConfirm(false);
                  setProductToPublish(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmPublishToggle}
                className={`px-4 py-2 text-white rounded-md ${
                  productToPublish.status === 'published'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {productToPublish.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
