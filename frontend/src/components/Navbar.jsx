import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Menu, X, HelpCircle } from 'lucide-react';
import Logo from './Logo.jsx';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel shadow-xl px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
            Home
          </Link>
          <Link to="/shop" className="text-slate-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1.5">
            <Store className="w-4 h-4 text-emerald-400" />
            Shop
          </Link>
          <Link to="/contact" className="text-slate-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-450" />
            Contact Support
          </Link>
        </div>

        {/* Mobile Navigation controls */}
        <div className="flex md:hidden items-center gap-4">
          {/* Hamburger toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-slate-300 hover:text-white p-1 transition-colors cursor-pointer"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown drawer */}
      {menuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/5 flex flex-col gap-4 animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="text-slate-300 hover:text-white text-sm font-semibold px-2 py-1.5 rounded hover:bg-white/5 transition-all"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setMenuOpen(false)}
            className="text-slate-300 hover:text-white text-sm font-semibold px-2 py-1.5 rounded hover:bg-white/5 flex items-center gap-2 transition-all"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            Shop
          </Link>
          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="text-slate-300 hover:text-white text-sm font-semibold px-2 py-1.5 rounded hover:bg-white/5 flex items-center gap-2 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            Contact Support
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
