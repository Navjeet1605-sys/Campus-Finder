import type { ItemCategory } from '../types';

/**
 * Format timestamp to clean relative time string (e.g. "Just now", "15m ago", "2h ago", "Yesterday")
 */
export function timeAgo(timestamp: string): string {
  if (!timestamp) return 'Recently';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    // If it's a date like "11/11/2026", try parsing or return as is
    return timestamp;
  }
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export interface CategoryMeta {
  emoji: string;
  label: string;
  bg: string;
  color: string;
  border: string;
}

export function getCategoryMeta(category: ItemCategory): CategoryMeta {
  switch (category) {
    case 'Electronics & Gadgets':
      return { emoji: '💻', label: 'Gadgets', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
    case 'ID Cards & Documents':
      return { emoji: '🪪', label: 'ID & Docs', bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' };
    case 'Keys & Keychains':
      return { emoji: '🔑', label: 'Keys', bg: '#fefce8', color: '#a16207', border: '#fef08a' };
    case 'Bags & Wallets':
      return { emoji: '🎒', label: 'Bags & Wallets', bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' };
    case 'Books, Notes & Stationery':
      return { emoji: '📚', label: 'Books & Notes', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
    case 'Clothing & Footwear':
      return { emoji: '👕', label: 'Clothing', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
    case 'Bottles & Lunchboxes':
      return { emoji: '🍶', label: 'Bottles & Boxes', bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc' };
    case 'Others':
    default:
      return { emoji: '📦', label: 'Other', bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  }
}

