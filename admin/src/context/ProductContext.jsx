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

      const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError(`Network error fetching products from ${API_URL}. Details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const adminCreateProduct = async (productData) => {
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productData.title,
          description: productData.description,
          category: productData.category,
          price: Number(productData.price),
          discountPrice: productData.discountPrice ? Number(productData.discountPrice) : undefined,
          stock: Number(productData.stock),
          images: productData.images || ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600'],
          sourceMarketplaceLinks: {
            amazon: productData.amazonLink || '',
            flipkart: productData.flipkartLink || ''
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        return { success: true, product: data.product };
      }
      return { success: false, error: data.error || 'Failed to create product' };
    } catch (err) {
      return { success: false, error: `Network error creating product at ${API_URL}/api/products. Details: ${err.message}. Please verify VITE_API_URL settings in Vercel.` };
    }
  };

  const adminUpdateProduct = async (id, productData) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productData.title,
          description: productData.description,
          category: productData.category,
          price: Number(productData.price),
          discountPrice: productData.discountPrice ? Number(productData.discountPrice) : undefined,
          stock: Number(productData.stock),
          images: productData.images,
          sourceMarketplaceLinks: {
            amazon: productData.amazonLink || '',
            flipkart: productData.flipkartLink || ''
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        return { success: true, product: data.product };
      }
      return { success: false, error: data.error || 'Failed to update product' };
    } catch (err) {
      return { success: false, error: `Network error updating product at ${API_URL}/api/products/${id}. Details: ${err.message}` };
    }
  };

  const adminDeleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to delete product' };
    } catch (err) {
      return { success: false, error: `Network error deleting product at ${API_URL}/api/products/${id}. Details: ${err.message}` };
    }
  };

  const adminDeleteReview = async (productId, reviewId) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to delete review' };
    } catch (err) {
      return { success: false, error: `Network error deleting review at ${API_URL}/api/products/${productId}/reviews/${reviewId}. Details: ${err.message}` };
    }
  };

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/support`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const adminDeleteSupportMessage = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/support/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => prev.filter(msg => msg._id !== id));
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to delete support message' };
    } catch (err) {
      return { success: false, error: `Network error resolving support message: ${err.message}` };
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

    socketConnection.on('support_message_created', (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === newMsg._id)) return prev;
        return [newMsg, ...prev];
      });
    });

    return () => {
      socketConnection.close();
    };
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchMessages();
  }, []);

  return (
    <ProductContext.Provider value={{ 
      products, 
      loading, 
      error, 
      fetchProducts, 
      adminCreateProduct, 
      adminUpdateProduct, 
      adminDeleteProduct,
      adminDeleteReview,
      messages,
      messagesLoading,
      fetchMessages,
      adminDeleteSupportMessage,
      socket
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
