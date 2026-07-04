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
      messages,
      messagesLoading,
      fetchMessages,
      adminDeleteSupportMessage
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
