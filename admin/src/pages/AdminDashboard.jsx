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
  ExternalLink,
  User,
  LogOut,
  Image,
  Link as LinkIcon,
  Menu,
  Mail,
  Bell,
  HelpCircle,
  ShieldCheck,
  Star
} from 'lucide-react';
import Logo from '../components/Logo.jsx';

const AdminDashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const { 
    products, 
    loading: productsLoading, 
    fetchProducts, 
    adminCreateProduct, 
    adminUpdateProduct, 
    adminDeleteProduct,
    messages,
    messagesLoading,
    fetchMessages,
    adminDeleteSupportMessage,
    adminDeleteReview,
    socket
  } = useProducts();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState('catalog');

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals / Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState(null);
  const handleConfirmAction = () => {
    if (confirmModal && confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
    setConfirmModal(null);
  };

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleNewProductNotif = (newProduct) => {
      const notif = {
        id: 'notif_' + Date.now(),
        title: 'New Appliance Added',
        desc: `${newProduct.title} was added to the catalog.`,
        time: new Date(),
        unread: true
      };
      setNotifications(prev => [notif, ...prev]);
      showToast('New appliance added to catalog!');
    };

    const handleNewMessageNotif = (newMsg) => {
      const notif = {
        id: 'notif_' + Date.now(),
        title: 'New Support Message',
        desc: `Message from ${newMsg.name}: "${newMsg.subject}"`,
        time: new Date(),
        unread: true
      };
      setNotifications(prev => [notif, ...prev]);
      showToast('New support message received!', 'info');
    };

    socket.on('product_created', handleNewProductNotif);
    socket.on('support_message_created', handleNewMessageNotif);

    return () => {
      socket.off('product_created', handleNewProductNotif);
      socket.off('support_message_created', handleNewMessageNotif);
    };
  }, [socket]);

  // Product Form
  const [productForm, setProductForm] = useState({
    title: '', description: '', category: 'Kitchen Appliances',
    price: '', discountPrice: '', stock: '', images: '',
    amazonLink: '', flipkartLink: ''
  });

  // Profile Form
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });

  // Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setIsSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new window.Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 800; // max size in px
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality compression
          setProductForm(prev => ({ ...prev, images: dataUrl }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const openProfileEdit = () => {
    setProfileForm({ name: user?.name || 'Chief Enterprise Admin', email: user?.email || 'admin@wellmora.com' });
    setIsProfileModalOpen(true);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email) return;
    updateProfile(profileForm.name, profileForm.email);
    setIsProfileModalOpen(false);
    showToast('Administrator profile updated!');
  };

  const openProductCreate = () => {
    setSelectedProduct(null);
    setProductForm({ title: '', description: '', category: 'Kitchen Appliances', price: '', discountPrice: '', stock: '', images: '', amazonLink: '', flipkartLink: '' });
    setIsProductDrawerOpen(true);
  };

  const openProductEdit = (prod) => {
    setSelectedProduct(prod);
    setProductForm({
      title: prod.title, description: prod.description, category: prod.category,
      price: prod.price, discountPrice: prod.discountPrice || '', stock: prod.stock,
      images: prod.images?.[0] || '',
      amazonLink: prod.sourceMarketplaceLinks?.amazon || '',
      flipkartLink: prod.sourceMarketplaceLinks?.flipkart || ''
    });
    setIsProductDrawerOpen(true);
  };

  const handleProductSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      if (!productForm.title || !productForm.price || productForm.stock === '') return;
      const payload = {
        title: productForm.title, description: productForm.description,
        category: productForm.category, price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
        stock: Number(productForm.stock),
        images: productForm.images ? [productForm.images] : undefined,
        amazonLink: productForm.amazonLink, flipkartLink: productForm.flipkartLink
      };
      if (selectedProduct) {
        const res = await adminUpdateProduct(selectedProduct._id, payload);
        if (res.success) showToast('Appliance updated successfully!');
        else showToast(res.error || 'Failed to update', 'error');
      } else {
        const res = await adminCreateProduct(payload);
        if (res.success) showToast('Appliance added to catalog!');
        else showToast(res.error || 'Failed to add', 'error');
      }
      setIsProductDrawerOpen(false);
      fetchProducts();
    } catch (err) {
      showToast('Submission error: ' + err.message, 'error');
    }
  };

  const handleDeleteProd = (id) => {
    setConfirmModal({
      title: 'Retire Appliance',
      message: 'Are you sure you want to permanently retire this appliance from the catalog?',
      onConfirm: async () => {
        const res = await adminDeleteProduct(id);
        if (res.success) {
          showToast('Appliance retired successfully!');
          fetchProducts();
        } else {
          showToast(res.error || 'Failed to delete', 'error');
        }
      }
    });
  };

  const filteredProducts = products.filter(p => {
    const matchQ = p.title.toLowerCase().includes(productSearch.toLowerCase()) || p.description.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = productCategoryFilter ? p.category === productCategoryFilter : true;
    return matchQ && matchCat;
  });

  // Reusable sidebar content
  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-center mb-8 border-b border-[var(--nav-border)] pb-6">
          <Logo size="sm" />
        </div>
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => { setActiveTab('catalog'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer border-l-2 ${activeTab === 'catalog' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-lg shadow-emerald-500/5' : 'text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-white/2 border-transparent'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            Appliance Catalog
          </button>
          <button
            onClick={() => { setActiveTab('messages'); fetchMessages(); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer border-l-2 ${activeTab === 'messages' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-lg shadow-emerald-500/5' : 'text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-white/2 border-transparent'}`}
          >
            <Mail className="w-4 h-4" />
            Support Messages
            {messages.length > 0 && (
              <span className="ml-auto bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                {messages.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      <div className="border-t border-[var(--nav-border)] pt-5 flex flex-col gap-3">
        <button
          onClick={openProfileEdit}
          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/2 border border-white/5 hover:border-emerald-500/25 hover:bg-emerald-500/5 transition-all cursor-pointer text-left w-full group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-all">
              <User className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-black text-[var(--text-color)] truncate group-hover:text-emerald-500 transition-colors">
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
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans transition-colors duration-300">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 glass-panel border-r border-[var(--nav-border)] flex-col p-6">
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-72 glass-panel border-r border-[var(--nav-border)] p-6 flex flex-col shadow-2xl animate-slideRight">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[var(--text-muted)] hover:text-rose-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--nav-border)] bg-[var(--bg-color)] sticky top-0 z-40">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo size="sm" />
          <button
            onClick={openProductCreate}
            className="p-2 rounded-xl glass-btn-primary shadow-md"
            title="Add Appliance"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-slate-900/5 relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="space-y-5 animate-fadeIn max-w-7xl mx-auto">

            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-color)]">
                  {activeTab === 'catalog' ? 'Appliance Catalog' : 'Support Messages'}
                </h1>
                <p className="text-[var(--text-muted)] text-xs mt-1">
                  {activeTab === 'catalog' 
                    ? 'Manage listings, pricing, images and marketplace links.' 
                    : 'View and respond to customer support inquiries.'}
                </p>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-center relative">
                {/* Notification Bell Button */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                    className="p-3 bg-[var(--btn-secondary-bg)] hover:bg-emerald-500/10 border border-[var(--btn-secondary-border)] hover:border-emerald-500/15 text-[var(--text-muted)] hover:text-emerald-500 rounded-xl transition-all cursor-pointer relative"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications.some(n => n.unread) && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    )}
                  </button>

                  {/* Notification Dropdown Menu */}
                  {isNotifMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 glass-panel border border-[var(--panel-border)] rounded-2xl shadow-2xl z-50 p-4 animate-scaleUp max-h-96 overflow-y-auto">
                      <div className="flex justify-between items-center pb-2 border-b border-[var(--panel-border)] mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-color)]">Recent Events</span>
                        {notifications.length > 0 && (
                          <button
                            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                            className="text-[9px] text-emerald-405 hover:underline cursor-pointer font-bold bg-transparent border-0"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-[10px] text-[var(--text-muted)] text-center py-4">No recent notifications.</p>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              onClick={() => {
                                setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                              }}
                              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                n.unread 
                                  ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' 
                                  : 'bg-white/2 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <span className="text-[10px] font-black text-[var(--text-color)]">{n.title}</span>
                                <span className="text-[8px] text-[var(--text-muted)] font-mono">
                                  {new Date(n.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[9px] text-[var(--text-muted)] leading-relaxed">{n.desc}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {activeTab === 'catalog' && (
                  <button
                    onClick={openProductCreate}
                    className="hidden sm:flex glass-btn-primary px-5 py-3 rounded-xl text-xs font-black tracking-wide items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add New Appliance
                  </button>
                )}
              </div>
            </div>

            {activeTab === 'catalog' ? (
              <>
                {/* Filter Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 bg-[var(--panel-bg)] border border-[var(--panel-border)] p-4 rounded-2xl">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search catalog appliances..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="w-full glass-input pl-9 pr-4 py-2.5 rounded-xl text-xs"
                    />
                  </div>
                  <div className="relative w-full sm:w-48">
                    <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={productCategoryFilter}
                      onChange={e => setProductCategoryFilter(e.target.value)}
                      className="w-full glass-input pl-9 pr-4 py-2.5 rounded-xl text-xs appearance-none cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      <option value="Kitchen Appliances">Kitchen Appliances</option>
                      <option value="Home Appliances">Home Appliances</option>
                      <option value="Cookware">Cookware</option>
                      <option value="Tableware">Tableware</option>
                    </select>
                  </div>
                </div>

                {/* ── DESKTOP TABLE VIEW (xl+) ── */}
                <div className="hidden xl:block glass-card border border-[var(--card-border)] overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--card-border)] bg-white/2">
                          {['Appliance Details', 'Category', 'Regular Price', 'Discount Price', 'Stock', 'Marketplace', 'Actions'].map(h => (
                            <th key={h} className="p-4 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--card-border)]">
                        {filteredProducts.map(p => (
                          <tr key={p._id} className="hover:bg-slate-500/5 transition-all">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=60'} alt={p.title} className="w-10 h-10 object-cover rounded border border-[var(--card-border)] flex-shrink-0" />
                                <div className="min-w-0">
                                  <span className="font-bold text-[var(--text-color)] block truncate max-w-[160px]">{p.title}</span>
                                  <span className="text-[9px] text-[var(--text-muted)] truncate block mt-0.5 max-w-[160px]">{p._id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-[var(--text-muted)]">{p.category}</td>
                            <td className="p-4 font-bold text-[var(--text-color)]">₹{p.price}</td>
                            <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{p.discountPrice ? `₹${p.discountPrice}` : '--'}</td>
                            <td className="p-4">
                              <span className={`font-bold px-2.5 py-0.5 rounded-lg text-[9px] uppercase tracking-wide inline-block ${p.stock === 0 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/15' : p.stock <= 5 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/15' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15'}`}>
                                {p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? `Low: ${p.stock}` : `${p.stock} units`}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 flex-wrap">
                                {p.sourceMarketplaceLinks?.amazon ? (
                                  <a href={p.sourceMarketplaceLinks.amazon} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/25 rounded text-[9px] font-bold flex items-center gap-1 transition-colors cursor-pointer hover:text-white">Amazon <ExternalLink className="w-2.5 h-2.5" /></a>
                                ) : <span className="text-[var(--text-muted)] text-[9px] italic">No Amazon</span>}
                                {p.sourceMarketplaceLinks?.flipkart ? (
                                  <a href={p.sourceMarketplaceLinks.flipkart} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 rounded text-[9px] font-bold flex items-center gap-1 transition-colors cursor-pointer hover:text-white">Flipkart <ExternalLink className="w-2.5 h-2.5" /></a>
                                ) : <span className="text-[var(--text-muted)] text-[9px] italic">No Flipkart</span>}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button type="button" onClick={() => openProductEdit(p)} className="p-1.5 bg-[var(--btn-secondary-bg)] hover:bg-emerald-500/10 border border-[var(--btn-secondary-border)] hover:border-emerald-500/15 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-all cursor-pointer" title="Edit">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button type="button" onClick={() => handleDeleteProd(p._id)} className="p-1.5 bg-[var(--btn-secondary-bg)] hover:bg-rose-500/10 border border-[var(--btn-secondary-border)] hover:border-rose-500/15 text-[var(--text-muted)] hover:text-rose-500 rounded-lg transition-all cursor-pointer" title="Delete">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                          <tr><td colSpan="7" className="p-10 text-center text-slate-500 font-bold">No matching appliances found in the database.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── MOBILE / TABLET CARD VIEW (< xl) ── */}
                <div className="xl:hidden space-y-6">
                  {filteredProducts.length === 0 ? (
                    <div className="glass-card border border-[var(--card-border)] p-10 text-center text-slate-500 font-bold rounded-2xl">
                      No matching appliances found in the database.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      {filteredProducts.map(p => (
                        <div key={p._id} className="glass-card border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                          <div>
                            {/* Card Header */}
                            <div className="flex items-center gap-4 p-4 border-b border-[var(--card-border)]">
                              <img
                                src={p.images?.[0] || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=60'}
                                alt={p.title}
                                className="w-14 h-14 object-cover rounded-xl border border-[var(--card-border)] flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[var(--text-color)] text-sm truncate">{p.title}</h3>
                                <span className="text-[9px] text-[var(--text-muted)] font-mono">{p.category}</span>
                              </div>
                              {/* Action buttons top-right */}
                              <div className="flex gap-2 flex-shrink-0">
                                <button type="button" onClick={() => openProductEdit(p)} className="p-2 bg-[var(--btn-secondary-bg)] hover:bg-emerald-500/10 border border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:text-emerald-500 rounded-xl transition-all cursor-pointer">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => handleDeleteProd(p._id)} className="p-2 bg-[var(--btn-secondary-bg)] hover:bg-rose-500/10 border border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:text-rose-500 rounded-xl transition-all cursor-pointer">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Card Body — pricing & stock */}
                            <div className="grid grid-cols-3 divide-x divide-[var(--card-border)] text-center">
                              <div className="p-3">
                                <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold mb-1">Price</p>
                                <p className="font-extrabold text-[var(--text-color)] text-sm">₹{p.price}</p>
                              </div>
                              <div className="p-3">
                                <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold mb-1">Discount</p>
                                <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{p.discountPrice ? `₹${p.discountPrice}` : '—'}</p>
                              </div>
                              <div className="p-3">
                                <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold mb-1">Stock</p>
                                <span className={`font-bold text-[10px] px-2 py-0.5 rounded-md inline-block ${p.stock === 0 ? 'bg-rose-500/10 text-rose-500' : p.stock <= 5 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                                  {p.stock === 0 ? 'OOS' : p.stock}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Marketplace links */}
                          {(p.sourceMarketplaceLinks?.amazon || p.sourceMarketplaceLinks?.flipkart) && (
                            <div className="px-4 py-3 border-t border-[var(--card-border)] flex gap-2 flex-wrap">
                              {p.sourceMarketplaceLinks?.amazon && (
                                <a href={p.sourceMarketplaceLinks.amazon} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/25 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 hover:text-white transition-colors">
                                  Amazon <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {p.sourceMarketplaceLinks?.flipkart && (
                                <a href={p.sourceMarketplaceLinks.flipkart} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 hover:text-white transition-colors">
                                  Flipkart <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Support Messages Inbox */
              <div className="space-y-4">
                {messagesLoading ? (
                  <div className="glass-card border border-[var(--card-border)] p-10 text-center text-slate-500 font-bold rounded-2xl">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="glass-card border border-[var(--card-border)] p-10 text-center text-slate-500 font-bold rounded-2xl">
                    No support messages received yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {messages.map((msg) => (
                      <div key={msg._id} className="glass-card border border-[var(--card-border)] p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-500/20 transition-all">
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-4 border-b border-[var(--card-border)] pb-3">
                            <div>
                              <h3 className="font-bold text-[var(--text-color)] text-sm">{msg.name}</h3>
                              <a href={`mailto:${msg.email}`} className="text-[10px] text-emerald-400 hover:underline">{msg.email}</a>
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)] font-mono">
                              {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-black text-[var(--text-color)]">{msg.subject}</p>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[var(--card-border)] flex justify-between items-center gap-2">
                          <button
                            onClick={() => {
                              setConfirmModal({
                                title: 'Resolve Ticket',
                                message: 'Mark this support message as resolved and delete it from the database?',
                                onConfirm: async () => {
                                  const res = await adminDeleteSupportMessage(msg._id);
                                  if (res.success) showToast('Support ticket resolved!');
                                  else showToast(res.error || 'Failed to resolve', 'error');
                                }
                              });
                            }}
                            className="p-2 bg-[var(--btn-secondary-bg)] hover:bg-rose-500/10 border border-[var(--btn-secondary-border)] hover:border-rose-500/15 text-[var(--text-muted)] hover:text-rose-500 rounded-xl transition-all cursor-pointer text-[10px] font-bold flex items-center gap-1"
                            title="Resolve Ticket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Resolve
                          </button>
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            className="glass-btn-secondary px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 hover:text-white"
                          >
                            <Mail className="w-3.5 h-3.5 text-emerald-500" />
                            Reply via Email
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Custom Toast Notification */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-slideLeft ${
            toast.type === 'error' 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450'
          }`}>
            {toast.type === 'error' ? <X className="w-4 h-4 text-rose-500 animate-pulse" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {confirmModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="glass-card border border-[var(--panel-border)] p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-scaleUp text-center">
              <HelpCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-bounce" />
              <h3 className="font-extrabold text-[var(--text-color)] text-sm mb-2 uppercase tracking-wide">
                {confirmModal.title || 'Confirm Action'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">
                {confirmModal.message}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 glass-btn-secondary py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className="flex-1 glass-btn-primary py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-rose-500/20 border-rose-500/30 text-rose-450 hover:bg-rose-500 hover:text-white"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PRODUCT DRAWER ── */}
      {isProductDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="absolute inset-0 -z-10" onClick={() => setIsProductDrawerOpen(false)} />
          <div className="w-full max-w-md bg-[var(--bg-color)] border-l border-[var(--nav-border)] h-full flex flex-col shadow-2xl animate-slideLeft">
            <form onSubmit={handleProductSubmit} className="h-full flex flex-col">
              {/* Drawer Header */}
              <div className="flex justify-between items-center p-5 border-b border-[var(--nav-border)] flex-shrink-0">
                <div>
                  <h3 className="text-sm font-black text-[var(--text-color)] uppercase tracking-wider">
                    {selectedProduct ? 'Update Appliance' : 'Add New Appliance'}
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Fill in all required fields and submit.</p>
                </div>
                <button type="button" onClick={() => setIsProductDrawerOpen(false)} className="p-1.5 bg-[var(--btn-secondary-bg)] hover:bg-rose-500/10 border border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:text-rose-500 rounded-lg transition-all cursor-pointer flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Fields */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Application Name *</label>
                  <input type="text" required placeholder="e.g. Wellmora Pro-Blend 1000W" value={productForm.title} onChange={e => setProductForm({ ...productForm, title: e.target.value })} className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-[var(--input-color)]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Specification Details *</label>
                  <textarea rows="3" required placeholder="Comprehensive appliance description..." value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-[var(--input-color)] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Category</label>
                    <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full glass-input px-3 py-2.5 rounded-xl text-xs text-[var(--input-color)] cursor-pointer">
                      <option value="Kitchen Appliances">Kitchen</option>
                      <option value="Home Appliances">Home</option>
                      <option value="Cookware">Cookware</option>
                      <option value="Tableware">Tableware</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Stock *</label>
                    <input type="number" required min="0" placeholder="e.g. 25" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-[var(--input-color)]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Price (₹) *</label>
                    <input type="number" required min="1" placeholder="e.g. 4999" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-[var(--input-color)]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Discount (₹)</label>
                    <input type="number" min="0" placeholder="e.g. 3499" value={productForm.discountPrice} onChange={e => setProductForm({ ...productForm, discountPrice: e.target.value })} className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1.5">
                    <Image className="w-3.5 h-3.5 text-emerald-500" /> Image Upload
                  </label>
                  {productForm.images && (
                    <div className="mb-2 p-1.5 bg-white/5 border border-[var(--panel-border)] rounded-xl flex items-center gap-3">
                      <img src={productForm.images} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-white/10" />
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold">Image loaded</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full glass-input px-3.5 py-2.5 rounded-xl text-[10px] text-[var(--text-color)] cursor-pointer file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[9px] file:font-extrabold file:bg-emerald-500/10 file:text-emerald-600 dark:file:text-emerald-400 hover:file:bg-emerald-500/25 file:cursor-pointer" />
                </div>
                <div className="border-t border-[var(--nav-border)] pt-4 space-y-3">
                  <span className="flex items-center gap-1 text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                    <LinkIcon className="w-3 h-3 text-emerald-500" /> Redirection Links
                  </span>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Amazon URL</label>
                    <input type="url" placeholder="https://www.amazon.in/dp/..." value={productForm.amazonLink} onChange={e => setProductForm({ ...productForm, amazonLink: e.target.value })} className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-[var(--input-color)]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Flipkart URL</label>
                    <input type="url" placeholder="https://www.flipkart.com/..." value={productForm.flipkartLink} onChange={e => setProductForm({ ...productForm, flipkartLink: e.target.value })} className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-[var(--input-color)]" />
                  </div>
                </div>

                {/* Manage Reviews Section (Only when editing an existing product) */}
                {selectedProduct && (
                  <div className="border-t border-[var(--nav-border)] pt-4 space-y-3">
                    <span className="flex items-center gap-1 text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500/20" /> Customer Reviews ({selectedProduct.reviews?.length || 0})
                    </span>
                    
                    {!selectedProduct.reviews || selectedProduct.reviews.length === 0 ? (
                      <p className="text-[10px] text-[var(--text-muted)] italic">No reviews yet for this appliance.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1.5 custom-scrollbar">
                        {selectedProduct.reviews.map((rev) => (
                          <div key={rev._id} className="p-3 bg-white/3 border border-[var(--panel-border)] rounded-xl flex justify-between items-start gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-extrabold text-[var(--text-color)] text-[10px] truncate">{rev.name}</span>
                                <div className="flex text-amber-400">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-2.5 h-2.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{rev.comment}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmModal({
                                  title: 'Delete Review',
                                  message: 'Are you sure you want to permanently delete this customer review?',
                                  onConfirm: async () => {
                                    const res = await adminDeleteReview(selectedProduct._id, rev._id);
                                    if (res.success) {
                                      showToast('Review deleted successfully!');
                                      // Sync local state in selectedProduct so the list updates in real-time in the drawer
                                      setSelectedProduct(prev => ({
                                        ...prev,
                                        reviews: prev.reviews.filter(r => r._id !== rev._id)
                                      }));
                                    } else {
                                      showToast(res.error || 'Failed to delete review', 'error');
                                    }
                                  }
                                });
                              }}
                              className="p-1 bg-white/2 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/15 text-[var(--text-muted)] hover:text-rose-500 rounded-lg transition-all cursor-pointer flex-shrink-0"
                              title="Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-[var(--nav-border)] p-5 flex gap-3 flex-shrink-0">
                <button type="button" onClick={() => setIsProductDrawerOpen(false)} className="flex-1 px-4 py-3 border border-[var(--nav-border)] hover:bg-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer">
                  Dismiss
                </button>
                <button type="submit" className="flex-1 glass-btn-primary px-4 py-3 rounded-xl text-xs font-black tracking-wide cursor-pointer">
                  {selectedProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PROFILE MODAL ── */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fadeIn p-4">
          <div className="w-full max-w-md glass-card border border-[var(--card-border)] p-6 bg-[var(--bg-color)] animate-scaleUp shadow-2xl rounded-2xl">
            <div className="flex justify-between items-center mb-5 border-b border-[var(--nav-border)] pb-3">
              <div>
                <h3 className="text-sm font-black text-[var(--text-color)] uppercase tracking-wider">Edit Administrator Profile</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Update console administrator settings.</p>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-1.5 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] rounded-lg text-[var(--text-muted)] hover:text-rose-500 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Administrator Name</label>
                <input type="text" required value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full glass-input px-3.5 py-2.5 rounded-xl text-[var(--input-color)] text-xs" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Email Address</label>
                <input type="email" required value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full glass-input px-3.5 py-2.5 rounded-xl text-[var(--input-color)] text-xs" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="flex-1 px-4 py-2.5 border border-[var(--nav-border)] hover:bg-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 glass-btn-primary px-4 py-2.5 rounded-xl text-xs font-black tracking-wide cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
