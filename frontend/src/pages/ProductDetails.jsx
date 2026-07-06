import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext.jsx';
import { ArrowLeft, ShieldAlert, Check, ArrowRight, ExternalLink, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, getProductById, addReview } = useProducts();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Touch Swipe States
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !product?.images || product.images.length <= 1) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveImageIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
    }
    if (isRightSwipe) {
      setActiveImageIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

  // Reset everything when the product id in the URL changes
  useEffect(() => {
    setProduct(null);
    setLoading(true);
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Load product data whenever id or products list changes
  useEffect(() => {
    const load = async () => {
      // Check the in-memory cache first for instant render
      const cached = products.find(p => p._id === id);
      if (cached) {
        setProduct(cached);
        setLoading(false);
        return;
      }
      // Fallback: fetch directly from API
      const data = await getProductById(id);
      setProduct(data || null);
      setLoading(false);
    };
    load();
  }, [id, products]);


  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!comment.trim()) {
      setErrorMessage('Please write a comment for your review.');
      return;
    }
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    const res = await addReview(product._id, reviewerName.trim(), rating, comment);
    setSubmitting(false);
    if (res.success) {
      setSuccessMessage('Thank you! Your review has been published.');
      setReviewerName('');
      setComment('');
      setRating(5);
    } else {
      setErrorMessage(res.error || 'Failed to submit review. Please try again.');
    }
  };

  // Suggested products: same category, exclude current product, max 4
  const suggestedProducts = products
    .filter(p => p._id !== id && p.category === product?.category)
    .slice(0, 4);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-blob-gradient text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-400"></div>
        <p className="text-slate-400 mt-4 text-sm">Synchronizing product nodes...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 min-h-screen bg-blob-gradient text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
        <Link to="/shop" className="glass-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-blob-gradient px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold mb-8 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Catalog
        </Link>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/5 border border-white/5 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl">
          {/* Product Image Slider */}
          <div>
            <div 
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-white/5 border border-white/5 group select-none touch-pan-y"
            >
              <img
                key={activeImageIndex}
                src={product.images?.[activeImageIndex] || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600'}
                alt={product.title}
                className="w-full h-full object-contain bg-white/5 animate-fadeIn animate-scaleUp"
              />
              <span className="absolute top-4 left-4 bg-emerald-500/80 backdrop-blur-md text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/20">
                {product.category}
              </span>

              {/* Slider Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-emerald-500 text-white rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer shadow-lg hover:scale-105"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-emerald-500 text-white rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer shadow-lg hover:scale-105"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Mobile/Tablet Dots Overlay */}
              {product.images && product.images.length > 1 && (
                <div className="flex md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 gap-2 z-10 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === activeImageIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/40 hover:bg-white/60'
                      }`}
                      title={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails Row */}
            {product.images && product.images.length > 1 && (
              <div className="hidden md:flex gap-2.5 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      idx === activeImageIndex 
                        ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/20' 
                        : 'border-white/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-contain bg-white/5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-snug">{product.title}</h1>
              
              {/* Description */}
              <p className="text-slate-300 text-sm leading-relaxed mb-6 font-light">{product.description}</p>

              {/* Pricing Cards */}
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 w-fit mb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Our Price</span>
                  {product.discountPrice ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-400">₹{product.discountPrice}</span>
                      <span className="text-xs text-slate-400 line-through">₹{product.price}</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-white">₹{product.price}</span>
                  )}
                </div>
              </div>

              {/* Stock Indicator */}
              <div className="flex items-center gap-2 mb-6">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                    In Stock ({product.stock} units available)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase bg-rose-500/10 px-3 py-1 rounded-md border border-rose-500/20 animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Actions Card */}
            <div className="space-y-4 border-t border-white/5 pt-6">
              <p className="text-xs text-rose-500 dark:text-rose-450 font-semibold leading-relaxed">
                * Note: To buy this product, please use the official Amazon or Flipkart redirection links below.
              </p>

              {/* Direct Marketplace Buy Links */}
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block mb-2.5">
                  Buy Direct From Authorized Marketplaces:
                </span>
                <div className="flex flex-col sm:flex-row gap-3">
                  {product.sourceMarketplaceLinks?.amazon ? (
                    <a
                      href={product.sourceMarketplaceLinks.amazon}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-amber-500/15 hover:bg-amber-500 text-amber-600 dark:text-amber-300 hover:text-black border border-amber-500/20 py-2.5 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Buy on Amazon India
                    </a>
                  ) : (
                    <span className="flex-1 text-center bg-white/5 text-slate-500 border border-white/5 py-2.5 rounded-lg text-xs font-bold">
                      Amazon Listing Syncing
                    </span>
                  )}
                  
                  {product.sourceMarketplaceLinks?.flipkart ? (
                    <a
                      href={product.sourceMarketplaceLinks.flipkart}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-blue-500/15 hover:bg-blue-500 text-blue-600 dark:text-blue-300 hover:text-white border border-blue-500/20 py-2.5 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Buy on Flipkart
                    </a>
                  ) : (
                    <span className="flex-1 text-center bg-white/5 text-slate-500 border border-white/5 py-2.5 rounded-lg text-xs font-bold">
                      Flipkart Listing Syncing
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mt-14 border-t border-white/5 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Reviews Summary Stats */}
            <div className="glass-card p-6 border border-white/5 rounded-2xl backdrop-blur-md">
              <h2 className="text-xl font-extrabold text-white mb-4">Customer Reviews</h2>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl font-black text-white">{product.averageRating || '0.0'}</span>
                <div>
                  <div className="flex text-amber-400 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.round(product.averageRating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">Based on {product.numReviews || 0} reviews</span>
                </div>
              </div>

              {/* Review submit form */}
              <form onSubmit={handleReviewSubmit} className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Write a Review</h3>
                
                {/* Reviewer Name */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                    required
                  />
                </div>

                {/* Clickable Star Rating Input */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Rating</label>
                  <div className="flex gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starValue = i + 1;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setRating(starValue)}
                          className="text-slate-600 hover:text-amber-400 transition-colors focus:outline-none cursor-pointer"
                        >
                          <Star 
                            className={`w-6 h-6 transition-all duration-150 ${
                              starValue <= rating ? 'fill-amber-400 text-amber-400 scale-110' : 'text-slate-600 hover:scale-105'
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Your Feedback</label>
                  <textarea
                    rows="4"
                    placeholder="Describe your experience with this appliance..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs resize-none"
                    required
                  ></textarea>
                </div>

                {errorMessage && (
                  <p className="text-rose-500 text-xs font-semibold">{errorMessage}</p>
                )}
                {successMessage && (
                  <p className="text-emerald-400 text-xs font-semibold">{successMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full glass-btn-primary py-2.5 rounded-xl text-xs font-bold shadow-lg"
                >
                  {submitting ? 'Submitting review...' : 'Submit Review'}
                </button>
              </form>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">
                All Reviews ({product.reviews?.length || 0})
              </h3>
              
              {!product.reviews || product.reviews.length === 0 ? (
                <div className="glass-card p-10 text-center border border-white/5 rounded-2xl">
                  <p className="text-slate-400 text-sm">No reviews yet for this appliance. Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {[...product.reviews].reverse().map((rev) => (
                    <div 
                      key={rev._id || rev.createdAt} 
                      className="glass-card p-5 border border-white/5 rounded-2xl backdrop-blur-sm animate-fadeIn"
                    >
                      <div className="flex justify-between items-start gap-4 mb-2.5">
                        <div>
                          <h4 className="font-extrabold text-white text-sm">{rev.name || 'Verified Buyer'}</h4>
                          <span className="text-[10px] text-slate-500">
                            {new Date(rev.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-light">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Suggested Products Section */}
        {suggestedProducts.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">You May Also Like</h2>
                <p className="text-slate-400 text-xs mt-1">More {product.category} from our catalog</p>
              </div>
              <Link
                to="/shop"
                className="text-xs text-emerald-400 hover:text-white font-bold flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {suggestedProducts.map((p) => (
                <div
                  key={p._id}
                  className="glass-card border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md hover:border-emerald-500/20 transition-all group flex flex-col"
                >
                  {/* Image */}
                  <Link to={`/products/${p._id}`} className="block relative overflow-hidden aspect-[4/3] bg-white/5">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-emerald-500/80 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md">
                      {p.category}
                    </span>
                  </Link>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <Link to={`/products/${p._id}`}>
                        <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug hover:text-emerald-400 transition-colors">{p.title}</h3>
                      </Link>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">{p.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        {p.discountPrice ? (
                          <>
                            <span className="text-sm font-extrabold text-white">₹{p.discountPrice}</span>
                            <span className="text-[10px] text-slate-400 line-through">₹{p.price}</span>
                          </>
                        ) : (
                          <span className="text-sm font-extrabold text-white">₹{p.price}</span>
                        )}
                      </div>
                      <Link
                        to={`/products/${p._id}`}
                        className="bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-400 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wide flex items-center gap-1 transition-all shadow-md cursor-pointer"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
