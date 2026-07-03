import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useProducts } from '../context/ProductContext.jsx';
import {
  ShoppingBag,
  PlusCircle,
  Trash2,
  Edit3,
  X,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ArrowRight,
  User,
  LogOut,
  Image,
  Link as LinkIcon
} from 'lucide-react';
import Logo from '../components/Logo.jsx';

const AdminDashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const { products, loading: productsLoading, fetchProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct } = useProducts();
  const navigate = useNavigate();

  // Modals / Sliders
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Product Form states
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    category: 'Kitchen Appliances',
    price: '',
    discountPrice: '',
    stock: '',
    images: '', // Base64 data URL
    amazonLink: '',
    flipkartLink: ''
  });

  // Profile Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });

  // Search & Filter state
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Local Image file to Base64 reader
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm((prev) => ({ ...prev, images: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile Update Handler
  const openProfileEdit = () => {
    setProfileForm({
      name: user?.name || 'Chief Enterprise Admin',
      email: user?.email || 'admin@wellmora.com'
    });
    setIsProfileModalOpen(true);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email) return;
    updateProfile(profileForm.name, profileForm.email);
    setIsProfileModalOpen(false);
    alert('Administrator profile updated successfully!');
  };

  // Product CRUD Handlers
  const openProductCreate = () => {
    setSelectedProduct(null);
    setProductForm({
      title: '',
      description: '',
      category: 'Kitchen Appliances',
      price: '',
      discountPrice: '',
      stock: '',
      images: '',
      amazonLink: '',
      flipkartLink: ''
    });
    setIsProductDrawerOpen(true);
  };

  const openProductEdit = (prod) => {
    setSelectedProduct(prod);
    setProductForm({
      title: prod.title,
      description: prod.description,
      category: prod.category,
      price: prod.price,
      discountPrice: prod.discountPrice || '',
      stock: prod.stock,
      images: prod.images?.[0] || '',
      amazonLink: prod.sourceMarketplaceLinks?.amazon || '',
      flipkartLink: prod.sourceMarketplaceLinks?.flipkart || ''
    });
    setIsProductDrawerOpen(true);
  };

  const handleProductSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      console.log('handleProductSubmit called with form:', productForm);
      if (!productForm.title || !productForm.price || productForm.stock === '') {
        console.log('Validation failed: missing title, price, or stock');
        return;
      }

      const payload = {
        title: productForm.title,
        description: productForm.description,
        category: productForm.category,
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
        stock: Number(productForm.stock),
        images: productForm.images ? [productForm.images] : undefined,
        amazonLink: productForm.amazonLink,
        flipkartLink: productForm.flipkartLink
      };
      console.log('Payload constructed:', payload);

      if (selectedProduct) {
        console.log('Updating product:', selectedProduct._id);
        const res = await adminUpdateProduct(selectedProduct._id, payload);
        console.log('Update response:', res);
        if (res.success) {
          alert('Appliance updated successfully!');
        } else {
          alert(res.error || 'Failed to update appliance');
        }
      } else {
        console.log('Creating product...');
        const res = await adminCreateProduct(payload);
        console.log('Create response:', res);
        if (res.success) {
          alert('Appliance added to catalog!');
        } else {
          alert(res.error || 'Failed to add appliance');
        }
      }
      setIsProductDrawerOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Error in handleProductSubmit:', err);
      alert('An error occurred during submission: ' + err.message);
    }
  };

  const handleDeleteProd = async (id) => {
    if (window.confirm('Are you sure you want to retire this appliance?')) {
      const res = await adminDeleteProduct(id);
      if (res.success) {
        alert('Appliance retired.');
        fetchProducts();
      } else {
        alert(res.error || 'Failed to delete appliance');
      }
    }
  };

  // Filters logic
  const filteredProducts = products.filter((p) => {
    const matchQ = p.title.toLowerCase().includes(productSearch.toLowerCase()) || p.description.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = productCategoryFilter ? p.category === productCategoryFilter : true;
    return matchQ && matchCat;
  });

  return (
    <div className="flex min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans transition-colors duration-300">
      {/* Sidebar Navigation */}
      <aside className="w-64 glass-panel border-r border-[var(--nav-border)] flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center justify-center mb-10 border-b border-[var(--nav-border)] pb-6">
            <Logo size="sm" />
          </div>

          <nav className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-l-2 border-emerald-500 font-black shadow-lg shadow-emerald-500/5">
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
              Appliance Catalog
            </div>
          </nav>
        </div>

        {/* Profile Card & Logout */}
        <div className="border-t border-[var(--nav-border)] pt-6 flex flex-col gap-4">
          <button
            onClick={openProfileEdit}
            title="Edit Admin Profile"
            className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/2 border border-white/5 hover:border-emerald-500/25 hover:bg-emerald-500/5 transition-all cursor-pointer text-left w-full group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-all">
                <User className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-black text-[var(--text-color)] truncate group-hover:text-emerald-500 dark:group-hover:text-emerald-450 transition-colors">
                  {user?.name || 'Chief Enterprise Admin'}
                </p>
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mt-0.5">
                  {user?.role || 'Admin'}
                </span>
              </div>
            </div>
            <Edit3 className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-500 transition-all flex-shrink-0" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold text-rose-500 hover:text-white hover:bg-rose-500/10 border border-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            Terminate Console
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-10 bg-slate-900/5 relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Catalog Panel */}
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[var(--text-color)]">Appliance Catalog</h1>
              <p className="text-[var(--text-muted)] text-xs mt-1">Manage listings, edit pricing structures, upload image files, and assign redirection links.</p>
            </div>
            <button
              onClick={openProductCreate}
              className="glass-btn-primary px-5 py-3 rounded-xl text-xs font-black tracking-wide flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <PlusCircle className="w-4 h-4" />
              Add New Appliance
            </button>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 bg-[var(--panel-bg)] border border-[var(--panel-border)] p-4 rounded-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog appliances..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full glass-input pl-9 pr-4 py-2 rounded-xl text-xs"
              />
            </div>
            <div className="relative w-full sm:w-48">
              <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="w-full glass-input pl-9 pr-4 py-2 rounded-xl text-xs appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Kitchen Appliances">Kitchen Appliances</option>
                <option value="Home Appliances">Home Appliances</option>
                <option value="Cookware">Cookware</option>
                <option value="Tableware">Tableware</option>
              </select>
            </div>
          </div>

          {/* Product Table */}
          <div className="glass-card border border-[var(--card-border)] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--card-border)] bg-white/2">
                    <th className="p-4 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Appliance Details</th>
                    <th className="p-4 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Category</th>
                    <th className="p-4 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Regular Price</th>
                    <th className="p-4 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Discount Price</th>
                    <th className="p-4 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Warehouse Stock</th>
                    <th className="p-4 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Marketplace Redirects</th>
                    <th className="p-4 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {filteredProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-500/5 transition-all">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=60'}
                            alt={p.title}
                            className="w-10 h-10 object-cover rounded bg-white/5 flex-shrink-0 border border-[var(--card-border)]"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-[var(--text-color)] block truncate">{p.title}</span>
                            <span className="text-[9px] text-[var(--text-muted)] truncate block mt-0.5">{p._id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-[var(--text-muted)]">{p.category}</td>
                      <td className="p-4 font-bold text-[var(--text-color)]">₹{p.price}</td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-450">
                        {p.discountPrice ? `₹${p.discountPrice}` : '--'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-lg text-[9px] uppercase tracking-wide inline-block ${
                            p.stock === 0
                              ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/15'
                              : p.stock <= 5
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15'
                          }`}
                        >
                          {p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? `Critical: ${p.stock}` : `Units: ${p.stock}`}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {p.sourceMarketplaceLinks?.amazon ? (
                            <a
                              href={p.sourceMarketplaceLinks.amazon}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:text-white border border-amber-500/25 rounded text-[9px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              Amazon
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-[var(--text-muted)] text-[9px] italic">No Amazon</span>
                          )}
                          {p.sourceMarketplaceLinks?.flipkart ? (
                            <a
                              href={p.sourceMarketplaceLinks.flipkart}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-500/25 rounded text-[9px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              Flipkart
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-[var(--text-muted)] text-[9px] italic">No Flipkart</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openProductEdit(p)}
                            className="p-1.5 bg-[var(--btn-secondary-bg)] hover:bg-emerald-500/10 border border-[var(--btn-secondary-border)] hover:border-emerald-500/15 text-[var(--text-muted)] hover:text-emerald-500 dark:hover:text-emerald-400 rounded-lg transition-all cursor-pointer"
                            title="Edit details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProd(p._id)}
                            className="p-1.5 bg-[var(--btn-secondary-bg)] hover:bg-rose-500/10 border border-[var(--btn-secondary-border)] hover:border-rose-500/15 text-[var(--text-muted)] hover:text-rose-500 rounded-lg transition-all cursor-pointer"
                            title="Retire Appliance"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500 font-bold">
                        No matching appliances found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* --- SIDEBAR PRODUCT EDIT DRAWER --- */}
      {isProductDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="absolute inset-0 -z-10" onClick={() => setIsProductDrawerOpen(false)}></div>

          <div className="w-full max-w-md bg-[var(--bg-color)] border-l border-[var(--nav-border)] h-full p-6 flex flex-col justify-between shadow-2xl animate-slideLeft">
            {/* Wrap drawer elements inside single Form component natively */}
            <form onSubmit={handleProductSubmit} className="h-full flex flex-col justify-between">
              <div className="overflow-y-auto pr-1 flex-grow">
                <div className="flex justify-between items-center mb-8 border-b border-[var(--nav-border)] pb-4">
                  <div>
                    <h3 className="text-sm font-black text-[var(--text-color)] uppercase tracking-wider">
                      {selectedProduct ? 'Update Appliance' : 'Add New Appliance'}
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Define specifications, pricing, upload image file, and links.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProductDrawerOpen(false)}
                    className="p-1.5 bg-[var(--btn-secondary-bg)] hover:bg-rose-500/10 border border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:text-rose-500 rounded-lg transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Application Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wellmora Pro-Blend 1000W Mixer Grinder"
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-[var(--input-color)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Specification Details</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Provide a comprehensive operational summary of the appliance..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-[var(--input-color)] resize-none"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Category</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full glass-input px-3 py-2.5 rounded-xl text-xs text-[var(--input-color)] cursor-pointer"
                      >
                        <option value="Kitchen Appliances">Kitchen Appliances</option>
                        <option value="Home Appliances">Home Appliances</option>
                        <option value="Cookware">Cookware</option>
                        <option value="Tableware">Tableware</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Warehouse Stock</label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="e.g. 25"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-[var(--input-color)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Price (₹)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 4999"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-[var(--input-color)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Discounted Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 3499"
                        value={productForm.discountPrice}
                        onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                        className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Local Image File Upload button */}
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1.5 flex items-center gap-1">
                      <Image className="w-3.5 h-3.5 text-emerald-500" />
                      Appliance Image Upload
                    </label>
                    {productForm.images && (
                      <div className="mb-3 p-1.5 bg-white/5 border border-[var(--panel-border)] rounded-xl flex items-center gap-3">
                        <img src={productForm.images} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-white/10" />
                        <span className="text-[10px] text-[var(--text-muted)] font-semibold truncate max-w-[200px]">Current file loaded</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl text-[10px] text-[var(--text-color)] cursor-pointer file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[9px] file:font-extrabold file:bg-emerald-500/10 file:text-emerald-600 dark:file:text-emerald-400 hover:file:bg-emerald-500/25 file:cursor-pointer"
                    />
                  </div>

                  {/* Redirect Links Section */}
                  <div className="border-t border-[var(--nav-border)] pt-4 space-y-4">
                    <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest block flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-emerald-500" />
                      Redirection Links
                    </span>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Amazon Product URL</label>
                      <input
                        type="url"
                        placeholder="https://www.amazon.in/dp/..."
                        value={productForm.amazonLink}
                        onChange={(e) => setProductForm({ ...productForm, amazonLink: e.target.value })}
                        className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-[var(--input-color)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Flipkart Product URL</label>
                      <input
                        type="url"
                        placeholder="https://www.flipkart.com/..."
                        value={productForm.flipkartLink}
                        onChange={(e) => setProductForm({ ...productForm, flipkartLink: e.target.value })}
                        className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-[var(--input-color)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--nav-border)] pt-6 flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsProductDrawerOpen(false)}
                  className="flex-1 px-4 py-3 border border-[var(--nav-border)] hover:bg-white/5 rounded-xl text-xs font-bold text-slate-450 hover:text-white transition-all cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-btn-primary px-4 py-3 rounded-xl text-xs font-black tracking-wide cursor-pointer"
                >
                  {selectedProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DYNAMIC ADMINISTRATOR PROFILE EDIT MODAL --- */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
          <div className="max-w-md w-full glass-card border border-[var(--card-border)] p-6 bg-[var(--bg-color)] animate-scaleUp shadow-2xl mx-6">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--nav-border)] pb-3">
              <div>
                <h3 className="text-sm font-black text-[var(--text-color)] uppercase tracking-wider">Edit Administrator Profile</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Update console administrator settings.</p>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] rounded-lg text-[var(--text-muted)] hover:text-rose-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Administrator Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-[var(--input-color)] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-[var(--input-color)] text-xs"
                />
              </div>

              <div className="border-t border-[var(--nav-border)] pt-4 flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-[var(--nav-border)] hover:bg-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-btn-primary px-4 py-2.5 rounded-xl text-xs font-black tracking-wide cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
