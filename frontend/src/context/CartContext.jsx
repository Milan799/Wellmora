import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('wellmora_cart');
    return saved ? JSON.parse(saved) : { items: [], subtotal: 0 };
  });
  const [loading, setLoading] = useState(false);

  // Sync cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem('wellmora_cart', JSON.stringify(cart));
  }, [cart]);

  const recalculateSubtotal = (items) => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  // Fetch live product from API to validate stock & get accurate price
  const fetchProductFromAPI = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`);
      const data = await res.json();
      if (data.success) return data.product;
      return null;
    } catch {
      return null;
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      // Fetch live product data from API (supports dynamic MongoDB products)
      const product = await fetchProductFromAPI(productId);
      if (!product) return { success: false, error: 'Appliance not found in catalog' };

      if (quantity > product.stock) {
        return { success: false, error: `Cannot add. Only ${product.stock} units in stock.` };
      }

      const price = product.discountPrice || product.price;
      const existingItemIndex = cart.items.findIndex((item) => item.product._id === productId);
      let updatedItems = [...cart.items];

      if (existingItemIndex > -1) {
        const newQty = updatedItems[existingItemIndex].quantity + quantity;
        if (newQty > product.stock) {
          return { success: false, error: `Cannot add more. Only ${product.stock} units available.` };
        }
        updatedItems[existingItemIndex].quantity = newQty;
      } else {
        updatedItems.push({
          product: {
            _id: product._id,
            title: product.title,
            price: product.price,
            discountPrice: product.discountPrice,
            images: product.images
          },
          quantity,
          price
        });
      }

      const subtotal = recalculateSubtotal(updatedItems);
      setCart({ items: updatedItems, subtotal });
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error adding to cart' };
    } finally {
      setLoading(false);
    }
  };

  const updateCartQty = async (productId, quantity) => {
    setLoading(true);
    try {
      const product = await fetchProductFromAPI(productId);
      if (product && quantity > product.stock) {
        return { success: false, error: `Insufficient stock. Only ${product.stock} units available.` };
      }

      const updatedItems = cart.items
        .map((item) => {
          if (item.product._id === productId) {
            return { ...item, quantity: Number(quantity) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      const subtotal = recalculateSubtotal(updatedItems);
      setCart({ items: updatedItems, subtotal });
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error updating quantity' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const updatedItems = cart.items.filter((item) => item.product._id !== productId);
      const subtotal = recalculateSubtotal(updatedItems);
      setCart({ items: updatedItems, subtotal });
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error removing item' };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      setCart({ items: [], subtotal: 0 });
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error clearing cart' };
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = () => {
    // Local cart, no-op
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateCartQty, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
