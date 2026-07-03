import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  const cards = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {cards.map((_, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl border border-white/5 animate-pulse flex flex-col gap-4">
            {/* Image Skeleton */}
            <div className="w-full h-48 bg-white/5 rounded-xl"></div>
            {/* Title Skeleton */}
            <div className="h-5 bg-white/10 rounded w-3/4"></div>
            {/* Description Skeleton */}
            <div className="space-y-2">
              <div className="h-3.5 bg-white/5 rounded"></div>
              <div className="h-3.5 bg-white/5 rounded w-5/6"></div>
            </div>
            {/* Pricing / Button Skeleton */}
            <div className="flex justify-between items-center mt-4">
              <div className="h-6 bg-white/10 rounded w-1/4"></div>
              <div className="h-9 bg-emerald-500/20 rounded-lg w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse flex flex-col gap-4 w-full max-w-xl">
      <div className="h-8 bg-white/10 rounded w-1/2"></div>
      <div className="h-4 bg-white/5 rounded w-full"></div>
      <div className="h-4 bg-white/5 rounded w-5/6"></div>
    </div>
  );
};

export default SkeletonLoader;
