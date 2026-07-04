import React, { createContext, useState, useEffect, useContext } from 'react';

const ProductContext = createContext();

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.vercel.app')) {
    return `http://${hostname}:5000`;
  }
  return 'http://localhost:5000';
};

const API_URL = getApiUrl();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.sort) params.append('sort', filters.sort);

      const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Network error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const getProductById = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`);
      const data = await res.json();
      if (data.success) {
        return data.product;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const addReview = async (productId, rating, comment) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to add review' };
    } catch (err) {
      return { success: false, error: 'Network error adding review' };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error, fetchProducts, getProductById, addReview }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
