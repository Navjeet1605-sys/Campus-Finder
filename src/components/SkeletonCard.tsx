import React from 'react';

interface SkeletonGridProps {
  count?: number;
}

export const SkeletonCard: React.FC = () => {
  return (
    <div 
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-md)',
        background: '#ffffff',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)'
      }}
    >
      {/* Shimmer Image */}
      <div 
        className="skeleton-shimmer" 
        style={{ width: '100%', height: '200px', borderRadius: 0 }} 
      />

      {/* Content */}
      <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
        {/* Category Pill Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton-shimmer" style={{ width: '85px', height: '20px', borderRadius: '9999px' }} />
          <div className="skeleton-shimmer" style={{ width: '55px', height: '16px', borderRadius: '4px' }} />
        </div>

        {/* Title */}
        <div className="skeleton-shimmer" style={{ width: '85%', height: '22px', borderRadius: '4px' }} />

        {/* Description line */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '14px', borderRadius: '4px' }} />
          <div className="skeleton-shimmer" style={{ width: '70%', height: '14px', borderRadius: '4px' }} />
        </div>

        {/* Location & Reporter meta */}
        <div style={{ paddingTop: '0.6rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skeleton-shimmer" style={{ width: '60%', height: '14px', borderRadius: '4px' }} />
          <div className="skeleton-shimmer" style={{ width: '45%', height: '14px', borderRadius: '4px' }} />
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 'auto', paddingTop: '0.8rem' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 6 }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))',
      gap: '1.5rem',
      width: '100%'
    }}>
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
};

