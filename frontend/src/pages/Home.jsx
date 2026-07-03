import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext.jsx';
import { Flame, ShieldCheck, Zap, Sparkles, ArrowRight } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

const Home = () => {
  const { products, loading, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  const trendingProducts = products.slice(0, 3);

  return (
    <div className="pt-24 min-h-screen bg-blob-gradient px-6">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto py-16 md:py-24 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl -z-10"></div>
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          The Future of Home Appliances
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          Elevate Your Living With{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
            Wellmora
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
          Experience premium engineering designed for contemporary Indian households. Our state-of-the-art home and kitchen appliances integrate smart technology, sleek design, and lifetime durability.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/shop"
            className="glass-btn-primary px-8 py-3.5 rounded-xl text-base font-semibold tracking-wide shadow-lg"
          >
            Explore the Collection
          </Link>
          <a
            href="#marketplaces"
            className="glass-btn-secondary px-8 py-3.5 rounded-xl text-base font-semibold tracking-wide"
          >
            Find Us on Amazon & Flipkart
          </a>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto py-10 border-y border-white/5 my-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-emerald-500/10 rounded-xl mb-3 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="font-bold text-white text-lg">100% Secure Checkout</h3>
          <p className="text-xs text-slate-400 mt-1">Argon2/JWT token encrypted security layers.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="p-3 bg-teal-500/10 rounded-xl mb-3 border border-teal-500/20">
            <Zap className="w-6 h-6 text-teal-400" />
          </div>
          <h3 className="font-bold text-white text-lg">Real-Time Syncing</h3>
          <p className="text-xs text-slate-400 mt-1">Live WebSocket updates for stock and price changes.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="p-3 bg-blue-500/10 rounded-xl mb-3 border border-blue-500/20">
            <Flame className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="font-bold text-white text-lg">Marketplace Verified</h3>
          <p className="text-xs text-slate-400 mt-1">Officially trusted store redirects to Amazon & Flipkart.</p>
        </div>
      </section>

      {/* Marketplace Redirection Grid */}
      <section id="marketplaces" className="max-w-7xl mx-auto py-12 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white mb-3">Sync & Shop Anywhere</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Choose to buy natively from our official store with secure state management or redirect instantly to our official marketplace stores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Amazon Glass Card */}
          <div className="glass-card p-8 border border-amber-500/15 flex flex-col justify-between gap-6 hover:shadow-2xl hover:border-amber-500/30 transition-all duration-300 group">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-450 tracking-widest uppercase">Official Partner</span>
              <h3 className="text-2xl font-extrabold text-white mt-2 mb-3">Wellmora on Amazon</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Enjoy Prime delivery, secure Amazon payments, and check out authentic reviews from verified buyers across India.
              </p>
            </div>
            <a
              href="https://www.amazon.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-300 hover:text-black border border-amber-500/30 py-3 rounded-xl font-bold tracking-wide transition-all"
            >
              Shop on Amazon India
            </a>
          </div>

          {/* Flipkart Glass Card */}
          <div className="glass-card p-8 border border-blue-500/15 flex flex-col justify-between gap-6 hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 group">
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">Official Partner</span>
              <h3 className="text-2xl font-extrabold text-white mt-2 mb-3">Wellmora on Flipkart</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Unlock exclusive flipkart SuperCoins, brand warranties, and easy replacement options for all home and kitchen appliances.
              </p>
            </div>
            <a
              href="https://www.flipkart.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center bg-blue-500/10 hover:bg-blue-500 text-blue-600 dark:text-blue-300 hover:text-white border border-blue-500/30 py-3 rounded-xl font-bold tracking-wide transition-all"
            >
              Shop on Flipkart
            </a>
          </div>
        </div>
      </section>

      {/* Trending Arrivals */}
      <section className="max-w-7xl mx-auto py-16">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <Flame className="w-7 h-7 text-rose-500 fill-rose-500/20" />
              Trending Innovations
            </h2>
            <p className="text-slate-400 text-sm mt-1">Our best-selling appliances of the month.</p>
          </div>
          <Link to="/shop" className="text-emerald-400 hover:text-white transition-colors text-sm font-semibold tracking-wider uppercase">
            View All Shop &rarr;
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingProducts.map((product) => (
              <div key={product._id} className="glass-card overflow-hidden border border-white/5 flex flex-col justify-between glass-panel-hover p-4 group">
                <div>
                  {/* Image Container */}
                  <div className="relative rounded-xl overflow-hidden mb-4 aspect-[4/3] bg-white/5">
                    <img
                      src={product.images[0] || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400"}
                      alt={product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-slate-300 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border border-white/10">
                      {product.category}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <Link to={`/products/${product._id}`} className="block hover:text-emerald-400 transition-colors">
                    <h3 className="font-bold text-white text-lg line-clamp-1">{product.title}</h3>
                  </Link>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Bottom Section */}
                <div className="mt-5 pt-3 border-t border-white/5 flex justify-between items-center">
                  <div className="flex flex-col">
                    {product.discountPrice ? (
                      <>
                        <span className="text-lg font-extrabold text-white">₹{product.discountPrice}</span>
                        <span className="text-xs text-slate-400 line-through">₹{product.price}</span>
                      </>
                    ) : (
                      <span className="text-lg font-extrabold text-white">₹{product.price}</span>
                    )}
                  </div>

                  <Link
                    to={`/products/${product._id}`}
                    className="bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
