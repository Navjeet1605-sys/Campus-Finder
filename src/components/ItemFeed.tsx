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
import { CAMPUS_LOCATIONS } from '../data/mockData';

interface ItemFeedProps {
  items: Item[];
  currentUser: User | null;
  onViewDetails: (item: Item) => void;
  onOpenChat: (item: Item) => void;
  onOpenReportModal: () => void;
  searchQuery: string;
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
  searchQuery
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
      {/* Filters and Controls Bar (Light Green & Crisp White) */}
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
          {/* Status Tabs */}
          <div style={{
            display: 'flex',
            background: '#f8fafc',
            padding: '0.3rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #e2e8f0',
            gap: '0.3rem',
            overflowX: 'auto',
            maxWidth: '100%',
            WebkitOverflowScrolling: 'touch'
          }}>
            <button
              onClick={() => setSelectedType('all')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: selectedType === 'all' ? 'var(--primary)' : 'transparent',
                color: selectedType === 'all' ? '#ffffff' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              All Items ({items.length})
            </button>

            <button
              onClick={() => setSelectedType('found')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: selectedType === 'found' ? 'var(--found-color)' : 'transparent',
                color: selectedType === 'found' ? '#ffffff' : '#065f46',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              🟢 Found ({items.filter(i => i.type === 'found' && i.status !== 'claimed').length})
            </button>

            <button
              onClick={() => setSelectedType('lost')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: selectedType === 'lost' ? 'var(--lost-color)' : 'transparent',
                color: selectedType === 'lost' ? '#ffffff' : '#9f1239',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              🔴 Missing ({items.filter(i => i.type === 'lost' && i.status !== 'claimed').length})
            </button>

            <button
              onClick={() => setSelectedType('claimed')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: selectedType === 'claimed' ? 'var(--claimed-color)' : 'transparent',
                color: selectedType === 'claimed' ? '#ffffff' : '#5b21b6',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              ✅ Reunited
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
                className="btn btn-outline"
                style={{ fontSize: '0.76rem', padding: '0.45rem 0.7rem', borderColor: '#cbd5e1', background: '#f8fafc' }}
              >
                <X size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Slider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.2rem'
        }}>
          <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
            <Tag size={13} color="var(--primary)" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid #e2e8f0',
                background: selectedCategory === cat ? '#ecfdf5' : '#ffffff',
                color: selectedCategory === cat ? 'var(--primary-dark)' : '#475569',
                fontSize: '0.78rem',
                fontWeight: selectedCategory === cat ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Item Cards Grid */}
      {filteredItems.length > 0 ? (
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
