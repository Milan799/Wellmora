import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductCardImageSlider = ({ images = [], category }) => {
  const [activeIdx, setActiveIdx] = useState(0);

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
    if (!touchStart || !touchEnd || images.length <= 1) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveIdx(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }
    if (isRightSwipe) {
      setActiveIdx(prev => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx(index);
  };

  const currentImage = images[activeIdx] || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400';

  return (
    <div 
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative rounded-xl overflow-hidden mb-4 aspect-[4/3] bg-white/5 group/slider select-none touch-pan-y"
    >
      <img
        key={activeIdx}
        src={currentImage}
        alt="Product preview"
        className="object-contain w-full h-full bg-white/3 animate-fadeIn animate-scaleUp"
      />
      {category && (
        <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-slate-300 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border border-white/10 z-10">
          {category}
        </span>
      )}

      {/* Slider Left/Right Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-emerald-500 text-white rounded-full border border-white/10 opacity-0 group-hover/slider:opacity-100 transition-all duration-300 cursor-pointer shadow-lg hover:scale-105 z-10"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-emerald-500 text-white rounded-full border border-white/10 opacity-0 group-hover/slider:opacity-100 transition-all duration-300 cursor-pointer shadow-lg hover:scale-105 z-10"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="flex absolute bottom-2.5 left-1/2 -translate-x-1/2 gap-1.5 z-10 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => handleDotClick(e, idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIdx 
                  ? 'bg-white scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCardImageSlider;
