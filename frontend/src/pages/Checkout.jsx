import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { CreditCard, Truck, ClipboardList, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  // Address Form States
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  // Processing & Success states
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shippingPrice = subtotal > 1000 ? 0 : (items.length > 0 ? 100 : 0);
  const taxPrice = parseFloat((subtotal * 0.18).toFixed(2));
  const totalPrice = parseFloat((subtotal + shippingPrice + taxPrice).toFixed(2));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zipCode) {
      setErrorMessage('Please fill in all shipping fields');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Simulate network latency
    setTimeout(async () => {
      try {
        const addressObj = { street, city, state, zipCode, country };
        const orderId = 'WM_' + Math.random().toString(36).substr(2, 9).toUpperCase();

        const mockOrder = {
          _id: orderId,
          items: items.map(item => ({
            product: item.product,
            title: item.product.title,
            quantity: item.quantity,
            price: item.price,
            image: item.product.images?.[0]
          })),
          shippingAddress: addressObj,
          paymentDetails: {
            paymentMethod,
            status: paymentMethod === 'COD' ? 'Pending' : 'Paid',
            transactionId: paymentMethod === 'COD' ? '' : 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase()
          },
          shippingPrice,
          taxPrice,
          totalPrice,
          createdAt: new Date().toISOString(),
          orderStatus: 'Pending'
        };

        // Save order in customer's local storage history
        const existingOrders = JSON.parse(localStorage.getItem('wellmora_orders') || '[]');
        localStorage.setItem('wellmora_orders', JSON.stringify([mockOrder, ...existingOrders]));

        setCreatedOrder(mockOrder);
        setOrderSuccess(true);
        await clearCart();
      } catch (err) {
        setErrorMessage('Simulation error placing order.');
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  // Success view
  if (orderSuccess && createdOrder) {
    return (
      <div className="pt-32 min-h-screen bg-blob-gradient px-6 pb-20 flex items-center justify-center">
        <div className="max-w-xl w-full glass-card border border-emerald-500/25 p-8 backdrop-blur-lg shadow-2xl text-center flex flex-col items-center gap-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
          
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Order Placed Successfully!</h2>
            <p className="text-slate-300 text-sm mt-2">
              Thank you for choosing Wellmora. We are preparing your shipment.
            </p>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 w-full text-left flex flex-col gap-2.5 text-xs text-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">ORDER NUMBER</span>
              <span className="font-mono text-white text-sm font-semibold">{createdOrder._id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">SHIP TO</span>
              <span className="text-white font-medium">
                {createdOrder.shippingAddress.street}, {createdOrder.shippingAddress.city}, {createdOrder.shippingAddress.state} - {createdOrder.shippingAddress.zipCode}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">PAYMENT METHOD</span>
                <span className="text-white font-semibold">{createdOrder.paymentDetails.paymentMethod}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold block">TOTAL CHARGED</span>
                <span className="text-emerald-400 font-extrabold text-sm">₹{createdOrder.totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link
              to="/shop"
              className="flex-1 glass-btn-secondary py-3 rounded-xl font-bold text-xs"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => navigate('/')}
              className="flex-1 glass-btn-primary py-3 rounded-xl font-bold text-xs shadow-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-blob-gradient px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold mb-8 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-extrabold text-white mb-8 flex items-center gap-2">
          <ClipboardList className="w-8 h-8 text-emerald-400" />
          Checkout Gateway
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-12 glass-card max-w-md mx-auto border border-white/5">
            <p className="text-slate-400 text-sm mb-4">No items to checkout</p>
            <Link to="/shop" className="glass-btn-primary px-6 py-2 rounded-lg text-xs font-bold">
              Shop Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Address & Payment Steps */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Shipping Address Step */}
              <div className="glass-card border border-white/5 p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-400" />
                  1. Shipping Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase">Street Address</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. Flat 101, Blue Heights"
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase">ZIP / Postal Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="e.g. 400001"
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                      required
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Payment Step */}
              <div className="glass-card border border-white/5 p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  2. Payment Selection
                </h3>

                <div className="flex gap-4 mb-6">
                  {['COD', 'Card', 'UPI'].map((method) => (
                    <label
                      key={method}
                      className={`flex-1 border text-center p-3 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === method
                          ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="hidden"
                      />
                      <span className="text-xs tracking-wider">
                        {method === 'COD' ? 'Cash on Delivery' : method === 'Card' ? 'Card Pay' : 'UPI Instant'}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Card Fields */}
                {paymentMethod === 'Card' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase">Card Number</label>
                      <input
                        type="text"
                        maxLength="16"
                        placeholder="1234567812345678"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          maxLength="5"
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase">CVV</label>
                        <input
                          type="password"
                          maxLength="3"
                          placeholder="***"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Fields */}
                {paymentMethod === 'UPI' && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase">UPI ID</label>
                    <input
                      type="text"
                      placeholder="username@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Order Review Column */}
            <div className="flex flex-col gap-6">
              <div className="glass-card border border-white/5 p-6 backdrop-blur-md flex flex-col gap-4">
                <h3 className="text-lg font-bold text-white pb-3 border-b border-white/5">Order Overview</h3>
                
                {/* Product Summary */}
                <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.product?._id} className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=60'}
                          alt={item.product?.title}
                          className="w-8 h-8 object-cover rounded bg-white/5"
                        />
                        <div>
                          <span className="text-xs text-white font-medium block truncate max-w-[120px]">{item.product?.title}</span>
                          <span className="text-[10px] text-slate-400">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="text-xs text-white font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-3.5 flex flex-col gap-2.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span className="text-white font-medium">₹{taxPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="text-white font-medium">
                      {shippingPrice === 0 ? 'Free' : `₹${shippingPrice}`}
                    </span>
                  </div>
                  
                  <div className="border-t border-white/5 pt-3 mt-1 flex justify-between text-sm font-extrabold text-white">
                    <span>Total Due</span>
                    <span className="text-emerald-400">₹{totalPrice}</span>
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-400 text-center font-semibold bg-rose-500/5 p-2 rounded border border-rose-500/10">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full glass-btn-primary py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase mt-2 shadow-lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing Transaction...' : 'Place Secure Order'}
                </button>

                <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified Escrow Protection Shield</span>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Checkout;
