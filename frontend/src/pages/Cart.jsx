import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

const Cart = () => {
  const { cart, updateCartQty, removeFromCart, clearCart, loading } = useCart();
  const navigate = useNavigate();

  const handleQtyChange = async (productId, currentQty, amount) => {
    const nextQty = currentQty + amount;
    if (nextQty < 1) return;
    const res = await updateCartQty(productId, nextQty);
    if (!res.success) {
      alert(res.error);
    }
  };

  const handleRemove = async (productId) => {
    const res = await removeFromCart(productId);
    if (!res.success) {
      alert(res.error);
    }
  };

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shippingPrice = subtotal > 1000 ? 0 : (items.length > 0 ? 100 : 0);
  const taxPrice = parseFloat((subtotal * 0.18).toFixed(2));
  const totalPrice = parseFloat((subtotal + shippingPrice + taxPrice).toFixed(2));

  return (
    <div className="pt-24 min-h-screen bg-blob-gradient px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-8 flex items-center gap-2.5">
          <ShoppingBag className="w-8 h-8 text-emerald-400" />
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="glass-card border border-white/5 p-12 text-center max-w-xl mx-auto">
            <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Your Cart is Empty</h2>
            <p className="text-slate-400 text-sm mb-8">
              Explore our premium home and kitchen appliances collection to find the perfect fit.
            </p>
            <Link to="/shop" className="glass-btn-primary px-8 py-3 rounded-xl text-sm font-bold shadow-lg">
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items Column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.product?._id}
                  className="glass-card border border-white/5 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-white/10 transition-all"
                >
                  {/* Left: Product Thumbnail & Text */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=150'}
                      alt={item.product?.title}
                      className="w-16 h-16 object-cover rounded-lg bg-white/5 flex-shrink-0"
                    />
                    <div>
                      <Link to={`/products/${item.product?._id}`} className="font-bold text-white text-sm hover:text-emerald-400 transition-colors line-clamp-1">
                        {item.product?.title}
                      </Link>
                      <span className="text-[10px] text-slate-400 block mt-1">{item.product?.category}</span>
                      <span className="text-xs text-emerald-400 font-bold block mt-1">₹{item.price} each</span>
                    </div>
                  </div>

                  {/* Right: Quantity Selector, Total Price & Remove Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                    {/* Quantity controls */}
                    <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQtyChange(item.product?._id, item.quantity, -1)}
                        className="px-2.5 py-1 text-slate-400 hover:text-white font-bold"
                        disabled={loading}
                      >
                        -
                      </button>
                      <span className="px-3 text-xs text-white font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item.product?._id, item.quantity, 1)}
                        className="px-2.5 py-1 text-slate-400 hover:text-white font-bold"
                        disabled={loading}
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm font-extrabold text-white w-20 text-right">
                      ₹{item.price * item.quantity}
                    </span>

                    <button
                      onClick={() => handleRemove(item.product?._id)}
                      className="text-slate-400 hover:text-rose-400 p-2 transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center mt-4">
                <Link to="/shop" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  &larr; Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400/80 hover:text-rose-500 transition-colors cursor-pointer"
                  disabled={loading}
                >
                  Clear Cart Items
                </button>
              </div>
            </div>

            {/* Checkout Pricing Card */}
            <div className="glass-card border border-white/5 p-6 backdrop-blur-md h-fit flex flex-col gap-5">
              <h3 className="text-lg font-bold text-white pb-3 border-b border-white/5">Order Summary</h3>

              <div className="flex flex-col gap-3.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18% GST)</span>
                  <span className="text-white font-semibold">₹{taxPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-white font-semibold">
                    {shippingPrice === 0 ? (
                      <span className="text-emerald-400 font-bold uppercase text-[10px]">Free Shipping</span>
                    ) : (
                      `₹${shippingPrice}`
                    )}
                  </span>
                </div>
                {shippingPrice > 0 && (
                  <p className="text-[10px] text-slate-400 italic">
                    Add ₹{1000 - subtotal} more for FREE shipping!
                  </p>
                )}
                
                <div className="border-t border-white/5 pt-3.5 mt-2 flex justify-between text-sm font-extrabold text-white">
                  <span>Total Due</span>
                  <span className="text-emerald-400">₹{totalPrice}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full glass-btn-primary py-3 rounded-xl font-bold text-sm tracking-wide flex justify-center items-center gap-1.5 shadow-lg mt-2"
                disabled={loading}
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-400 mt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Secure SSL Checkout Shield Activated</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
