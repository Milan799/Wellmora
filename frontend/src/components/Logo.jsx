import React from 'react';

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Attractive Minimalist SVG Icon */}
      <svg
        className={`${iconSizes[size]} filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition-transform hover:scale-105 duration-350`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="logo-blue-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Dynamic Curved Outer Ring (Teal-Emerald) */}
        <path
          d="M 50 15 A 35 35 0 0 1 85 50 A 35 35 0 0 1 50 85 A 35 35 0 0 1 15 50"
          stroke="url(#logo-emerald-grad)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Dynamic Curved Inner Arc (Blue-Indigo) */}
        <path
          d="M 50 30 A 20 20 0 0 1 70 50 A 20 20 0 0 1 50 70"
          stroke="url(#logo-blue-grad)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Radiant Spark Core (Golden/Amber) */}
        <path
          d="M 50 38 L 53 47 L 62 50 L 53 53 L 50 62 L 47 53 L 38 50 L 47 47 Z"
          fill="#f59e0b"
          className="animate-pulse"
        />
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 leading-none">
          <span className={`${textSizes[size]} font-black tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 bg-clip-text text-transparent`}>
            WELLMORA
          </span>
          <span className="text-[9px] uppercase font-extrabold text-emerald-400 border border-emerald-400/30 px-1.5 py-0.5 rounded tracking-widest self-start sm:self-auto">
            Enterprise
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
