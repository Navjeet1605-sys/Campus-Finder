import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  PlusCircle, 
  X, 
  Tag, 
  ArrowUpDown 
} from 'lucide-react';
import type { Item, ItemCategory, User } from '../types';
import { ItemCard } from './ItemCard';
import { SkeletonGrid } from './SkeletonCard';
import { CAMPUS_LOCATIONS } from '../data/mockData';
import { getCategoryMeta } from '../lib/formatters';

interface ItemFeedProps {
  items: Item[];
  currentUser: User | null;
  onViewDetails: (item: Item) => void;
  onOpenChat: (item: Item) => void;
  onOpenReportModal: () => void;
  searchQuery: string;
  isLoading?: boolean;
}

const CATEGORIES: ('All' | ItemCategory)[] = [
  'All',
  'Electronics & Gadgets',
  'ID Cards & Documents',
  'Keys & Keychains',
  'Bags & Wallets',
  'Books, Notes & Stationery',
  'Others'
];

export const ItemFeed: React.FC<ItemFeedProps> = ({
  items,
  currentUser,
  onViewDetails,
  onOpenChat,
  onOpenReportModal,
  searchQuery,
  isLoading = false
}) => {
  const [selectedType, setSelectedType] = useState<'all' | 'found' | 'lost' | 'claimed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ItemCategory>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Filtering logic
  const filteredItems = items.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesDesc = item.description.toLowerCase().includes(q);
      const matchesLoc = item.location.toLowerCase().includes(q);
      const matchesReporter = item.reportedBy.fullName.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesReporter) {
        return false;
      }
    }

    if (selectedType === 'found' && (item.type !== 'found' || item.status === 'claimed')) return false;
    if (selectedType === 'lost' && (item.type !== 'lost' || item.status === 'claimed')) return false;
    if (selectedType === 'claimed' && item.status !== 'claimed' && item.status !== 'resolved') return false;

    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedLocation !== 'All' && item.location !== selectedLocation) return false;

    return true;
  });

  filteredItems.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
  });

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedCategory('All');
    setSelectedLocation('All');
  };

  const hasActiveFilters = selectedType !== 'all' || selectedCategory !== 'All' || selectedLocation !== 'All' || Boolean(searchQuery);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Filters and Controls Bar */}
      <div 
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-md)',
          background: '#ffffff',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {/* Top Filter Controls: Type Tabs & Dropdowns */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Apple/Linear Segmented Track */}
          <div className="segmented-track" style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <button
              onClick={() => setSelectedType('all')}
              className={`segmented-pill ${selectedType === 'all' ? 'active' : ''}`}
            >
              <span>All Items</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.8, background: selectedType === 'all' ? '#f1f5f9' : '#e2e8f0', padding: '1px 6px', borderRadius: '9999px' }}>
                {items.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedType('found')}
              className={`segmented-pill ${selectedType === 'found' ? 'active' : ''}`}
            >
              <span>🟢 Found</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.8, background: selectedType === 'found' ? '#ecfdf5' : '#e2e8f0', padding: '1px 6px', borderRadius: '9999px', color: selectedType === 'found' ? '#059669' : 'inherit' }}>
                {items.filter(i => i.type === 'found' && i.status !== 'claimed').length}
              </span>
            </button>

            <button
              onClick={() => setSelectedType('lost')}
              className={`segmented-pill ${selectedType === 'lost' ? 'active' : ''}`}
            >
              <span>🔴 Missing</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.8, background: selectedType === 'lost' ? '#fff1f2' : '#e2e8f0', padding: '1px 6px', borderRadius: '9999px', color: selectedType === 'lost' ? '#e11d48' : 'inherit' }}>
                {items.filter(i => i.type === 'lost' && i.status !== 'claimed').length}
              </span>
            </button>

            <button
              onClick={() => setSelectedType('claimed')}
              className={`segmented-pill ${selectedType === 'claimed' ? 'active' : ''}`}
            >
              <span>✅ Reunited</span>
            </button>
          </div>

          {/* Location & Sort dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Location selector */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <MapPin size={15} style={{ position: 'absolute', left: '0.75rem', color: '#10b981', pointerEvents: 'none' }} />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem 0.55rem 2.2rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.82rem',
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '220px'
                }}
              >
                <option value="All">All Campus Locations</option>
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Sort by */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ArrowUpDown size={15} style={{ position: 'absolute', left: '0.75rem', color: '#10b981', pointerEvents: 'none' }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding: '0.55rem 0.85rem 0.55rem 2.2rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.82rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">Latest Reports</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-outline btn-tactile"
                style={{ fontSize: '0.76rem', padding: '0.45rem 0.7rem', borderColor: '#cbd5e1', background: '#f8fafc' }}
              >
                <X size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips with Emojis */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.3rem',
          WebkitOverflowScrolling: 'touch'
        }}>
          <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
            <Tag size={13} color="var(--primary)" /> Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isAll = cat === 'All';
            const meta = !isAll ? getCategoryMeta(cat) : null;
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`filter-chip ${isActive ? 'active' : ''}`}
              >
                <span>{isAll ? '✨' : meta?.emoji}</span>
                <span>{isAll ? 'All Categories' : meta?.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Item Cards Grid or Skeleton Loader */}
      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : filteredItems.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: '1.25rem'
        }}>
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              currentUser={currentUser}
              onViewDetails={onViewDetails}
              onOpenChat={onOpenChat}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div 
          className="glass-panel"
          style={{
            borderRadius: 'var(--radius-lg)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            border: '1px solid rgba(16, 185, 129, 0.25)'
          }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            border: '1px solid #a7f3d0'
          }}>
            <Layers size={32} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            No Matching Items Found
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#475569', maxWidth: '420px', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            No item matches your current campus filter criteria or search keyword. Did you recently find something? Report it to help a fellow student!
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn btn-outline" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
                Clear Filters
              </button>
            )}
            <button onClick={onOpenReportModal} className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Report New Item</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
