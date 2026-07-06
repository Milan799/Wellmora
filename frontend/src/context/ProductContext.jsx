import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

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

  const addReview = async (productId, name, rating, comment) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, comment })
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

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketConnection = io(API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    setSocket(socketConnection);

    // Listeners
    socketConnection.on('product_created', (newProduct) => {
      setProducts(prev => {
        if (prev.some(p => p._id === newProduct._id)) return prev;
        return [newProduct, ...prev];
      });
    });

    socketConnection.on('product_updated', (updatedProduct) => {
      setProducts(prev => prev.map(p => p._id === updatedProduct.id ? { ...p, ...updatedProduct, _id: updatedProduct.id } : p));
    });

    socketConnection.on('product_deleted', (deletedId) => {
      setProducts(prev => prev.filter(p => p._id !== deletedId));
    });

    socketConnection.on('product_review_added', ({ productId, averageRating, numReviews, review }) => {
      setProducts(prev => prev.map(p => {
        if (p._id === productId) {
          const reviewsList = p.reviews || [];
          const exists = reviewsList.some(r => r._id === review._id);
          const updatedReviews = exists ? reviewsList : [...reviewsList, review];
          return {
            ...p,
            reviews: updatedReviews,
            averageRating,
            numReviews
          };
        }
        return p;
      }));
    });

    socketConnection.on('product_review_deleted', ({ productId, averageRating, numReviews, reviewId }) => {
      setProducts(prev => prev.map(p => {
        if (p._id === productId) {
          return {
            ...p,
            reviews: (p.reviews || []).filter(r => r._id !== reviewId),
            averageRating,
            numReviews
          };
        }
        return p;
      }));
    });

    return () => {
      socketConnection.close();
    };
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error, fetchProducts, getProductById, addReview, socket }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
