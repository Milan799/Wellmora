import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, ExternalLink, ArrowRight, X } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import ProductCardImageSlider from '../components/ProductCardImageSlider.jsx';

const Shop = () => {
  const { products, loading, fetchProducts } = useProducts();

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Trigger search / filters fetch
  useEffect(() => {
    fetchProducts({
      search,
      category,
      minPrice,
      maxPrice,
      sort
    });
  }, [category, sort]); // Fetch automatically on category/sort change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts({ search, category, minPrice, maxPrice, sort });
  };

  const handlePriceFilterSubmit = (e) => {
    e.preventDefault();
    fetchProducts({ search, category, minPrice, maxPrice, sort });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('-createdAt');
    fetchProducts({});
  };

  const categories = ['Home Appliances', 'Kitchen Appliances', 'Cookware', 'Tableware'];

  return (
    <div className="pt-24 min-h-screen bg-blob-gradient px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Product Catalog</h1>
            <p className="text-slate-400 text-xs mt-1">Discover premium kitchen & home appliances with real-time updates.</p>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog appliances..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-xs"
              />
            </div>
            <button
              type="submit"
              className="glass-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* --- SIDEBAR FILTERS (DESKTOP) --- */}
          <aside className="hidden lg:flex w-64 glass-panel border border-white/5 p-6 rounded-2xl flex-col gap-6 flex-shrink-0">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Catalog Categories</h3>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setCategory('')}
                  className={`text-left text-xs font-bold py-1 px-2 rounded-lg transition-all cursor-pointer ${
                    category === ''
                      ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Appliances
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-left text-xs font-bold py-1 px-2 rounded-lg transition-all cursor-pointer ${
                      category === cat
                        ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Form */}
            <form onSubmit={handlePriceFilterSubmit} className="border-t border-white/5 pt-4 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Price Range (₹)</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full glass-input px-3 py-1.5 rounded-lg text-xs"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full glass-input px-3 py-1.5 rounded-lg text-xs"
                />
              </div>
              <button type="submit" className="w-full glass-btn-primary py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                Apply Price Filters
              </button>
            </form>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1 w-full">
            {/* Sorting & Filter toggle for mobile */}
            <div className="flex justify-between items-center mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
              <button
                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                className="lg:hidden flex items-center gap-2 bg-slate-900 dark:bg-white/10 border border-white/15 hover:bg-white/5 px-4 py-2.5 rounded-xl text-xs text-white font-bold transition-all cursor-pointer shadow-md"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                Filters Panel
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-slate-900 border border-white/10 text-slate-300 text-xs rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="-createdAt">Newest Arrivals</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Render */}
            {loading ? (
              <SkeletonLoader count={6} />
            ) : products.length === 0 ? (
              <div className="text-center py-20 glass-card border border-white/5 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-2">No appliances found</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                  Try widening your search terms or adjusting the category filters.
                </p>
                <button onClick={handleResetFilters} className="glass-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold">
                  Reset Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="glass-card border border-white/5 overflow-hidden flex flex-col justify-between glass-panel-hover p-4 group">
                    <div>
                      {/* Product Card Image Slider */}
                      <ProductCardImageSlider images={product.images} category={product.category} />

                      {/* Stock warning if low */}
                      {product.stock <= 5 && product.stock > 0 && (
                        <div className="mb-2">
                          <span className="text-[9px] text-amber-400 font-extrabold uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse inline-block">
                            Only {product.stock} left
                          </span>
                        </div>
                      )}

                      {/* Title & Desc */}
                      <Link to={`/products/${product._id}`} className="block hover:text-emerald-400 transition-colors">
                        <h3 className="font-bold text-white text-base line-clamp-1">{product.title}</h3>
                      </Link>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Bottom Pricing & Checkout Controls */}
                    <div className="mt-5 pt-3 border-t border-white/5 flex flex-col gap-3.5">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          {product.discountPrice ? (
                            <>
                              <span className="text-base font-extrabold text-white">₹{product.discountPrice}</span>
                              <span className="text-[10px] text-slate-400 line-through">₹{product.price}</span>
                            </>
                          ) : (
                            <span className="text-base font-extrabold text-white">₹{product.price}</span>
                          )}
                        </div>

                        <Link
                          to={`/products/${product._id}`}
                          className="bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          View Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <p className="text-[10px] text-rose-500 dark:text-rose-450 font-semibold leading-normal">
                        * To purchase, please click the official Flipkart or Amazon redirection link below.
                      </p>

                      {/* Partner Stores (Flipkart / Amazon redirect sync links) */}
                      <div className="partner-store-container">
                        <span className="partner-store-label">
                          Partner Stores:
                        </span>
                        <div className="flex gap-2 ml-auto">
                          {product.sourceMarketplaceLinks?.amazon && (
                            <a
                              href={product.sourceMarketplaceLinks.amazon}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-amazon"
                            >
                              Amazon
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {product.sourceMarketplaceLinks?.flipkart && (
                            <a
                              href={product.sourceMarketplaceLinks.flipkart}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-flipkart"
                            >
                              Flipkart
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* --- MOBILE FILTERS OVERLAY SIDE-DRAWER --- */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-80 bg-slate-950 p-6 h-full flex flex-col justify-between shadow-2xl border-l border-white/5 animate-slideLeft">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Filters Panel</h3>
                <button
                  onClick={() => setShowFiltersMobile(false)}
                  className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setCategory('');
                      setShowFiltersMobile(false);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl font-semibold border ${
                      category === ''
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        : 'border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setShowFiltersMobile(false);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl font-semibold border ${
                        category === cat
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : 'border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <form
                onSubmit={(e) => {
                  handlePriceFilterSubmit(e);
                  setShowFiltersMobile(false);
                }}
                className="space-y-4 border-t border-white/5 pt-4"
              >
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Price Range (₹)</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full glass-input px-3 py-1.5 rounded-lg text-xs text-white"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full glass-input px-3 py-1.5 rounded-lg text-xs text-white"
                  />
                </div>
                <button type="submit" className="w-full glass-btn-primary py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                  Apply Price Filters
                </button>
              </form>
            </div>

            <button
              onClick={() => {
                handleResetFilters();
                setShowFiltersMobile(false);
              }}
              className="w-full py-3 border border-white/5 hover:bg-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
