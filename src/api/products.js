// Base API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('cms_auth_token');
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// ============================================
// Hardcoded Product Categories
// ============================================

export const PRODUCT_CATEGORIES = [
  { value: 'Crushing, Screening & Processing Equipment', label: 'Crushing, Screening & Processing Equipment' },
  { value: 'Components, Parts & Accessories', label: 'Components, Parts & Accessories' },
  { value: 'Structural & Sampling Solutions', label: 'Structural & Sampling Solutions' },
];

// ============================================
// Products API
// ============================================

/**
 * Get all products (CMS) with filters and pagination
 */
export const getProducts = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    return await apiRequest(url);
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single product by UUID
 */
export const getProduct = async (uuid) => {
  try {
    return await apiRequest(`/products/${uuid}`);
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new product
 */
export const createProduct = async (productData) => {
  try {
    return await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Update a product
 */
export const updateProduct = async (uuid, productData) => {
  try {
    return await apiRequest(`/products/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (uuid) => {
  try {
    return await apiRequest(`/products/${uuid}`, {
      method: 'DELETE',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Publish a product
 */
export const publishProduct = async (uuid) => {
  try {
    return await apiRequest(`/products/${uuid}/publish`, {
      method: 'POST',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Unpublish a product (set to draft)
 */
export const unpublishProduct = async (uuid) => {
  try {
    return await apiRequest(`/products/${uuid}/unpublish`, {
      method: 'POST',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Reorder products
 */
export const reorderProducts = async (products) => {
  try {
    return await apiRequest('/products/reorder', {
      method: 'POST',
      body: JSON.stringify({ products }),
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get public product categories with products (for frontsite)
 */
export const getPublicProductCategories = async () => {
  try {
    return await apiRequest('/public/product-categories');
  } catch (error) {
    throw error;
  }
};

/**
 * Get public products (for frontsite)
 */
export const getPublicProducts = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/public/products?${queryString}` : '/public/products';
    return await apiRequest(url);
  } catch (error) {
    throw error;
  }
};
