import React from 'react';
import Logo from './Logo.jsx';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, HelpCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="glass-panel border-t border-white/5 py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Brand Info */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
          <Logo size="sm" />
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            Premium Home and Kitchen Appliances engineered for contemporary living. Elevate your everyday household experiences.
          </p>
        </div>

        {/* Contact Info & Support Page Link */}
        <div className="flex flex-col items-center md:items-end gap-3 text-center md:text-right">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Get in Touch</h4>
          <div className="flex flex-col items-center md:items-end gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+91 79901 12650</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>wellmoraenterprise@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Surat, Gujarat, India</span>
            </div>

            {/* Contact Support Page Redirect */}
            <Link
              to="/contact"
              className="mt-2 text-xs font-bold text-emerald-450 hover:text-white flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-lg transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              Send support message
            </Link>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 text-center md:text-left">
        <div>
          &copy; {new Date().getFullYear()} Wellmora Enterprise. All rights reserved.
        </div>
        <div className="text-[10px] text-slate-600">
          Designed with Premium Glassmorphism Theme.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
