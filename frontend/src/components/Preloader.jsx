import React, { useState, useEffect } from 'react';
import Logo from './Logo.jsx';

const Preloader = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fading out after 1800ms, completely unmount after 2100ms
    const fadeTimer = setTimeout(() => setFade(true), 1800);
    const removeTimer = setTimeout(() => setLoading(false), 2100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!loading) return children;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#06090e] flex flex-col items-center justify-center transition-all duration-300 ${
        fade ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* High-tech glow spots in the background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" 
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="relative flex flex-col items-center gap-6 text-center select-none scale-95 animate-scaleUp">
        {/* Pulsing logo container */}
        <div className="relative p-8 rounded-full bg-white/5 border border-white/5 shadow-2xl backdrop-blur-md animate-pulse">
          <Logo size="lg" showText={false} />
          {/* Circular spinning ring */}
          <div 
            className="absolute inset-0 rounded-full border border-emerald-500/20 border-t-emerald-400 animate-spin" 
            style={{ margin: '-4px', animationDuration: '1.5s' }}
          ></div>
        </div>

        {/* Loading text with sliding/glowing letters */}
        <div>
          <h2 className="text-2xl font-black tracking-[0.2em] text-white uppercase bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 bg-clip-text text-transparent mb-2">
            Wellmora
          </h2>
          <div className="flex items-center gap-2 justify-center text-[10px] text-slate-500 uppercase tracking-widest font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Establishing Secure Link...
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all ease-out"
            style={{
              width: fade ? '100%' : '80%',
              transitionDuration: '1800ms'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
