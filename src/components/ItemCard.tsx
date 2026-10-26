import React from 'react';
import { 
  MapPin, 
  Calendar, 
  MessageSquare, 
  CheckCircle, 
  Eye, 
  Tag 
} from 'lucide-react';
import type { Item, User } from '../types';

interface ItemCardProps {
  item: Item;
  currentUser: User | null;
  onViewDetails: (item: Item) => void;
  onOpenChat: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  currentUser,
  onViewDetails,
  onOpenChat
}) => {
  const isOwner = currentUser?.id === item.reportedBy.id;
  const isFound = item.type === 'found';

  return (
    <div 
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-md)',
        background: '#ffffff',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all var(--transition-normal)',
        position: 'relative',
        boxShadow: '0 4px 18px rgba(16, 185, 129, 0.08)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.18)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
        e.currentTarget.style.boxShadow = '0 4px 18px rgba(16, 185, 129, 0.08)';
      }}
    >
      {/* Image Container with Badges */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '200px',
        background: '#f1f5f9',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
      onClick={() => onViewDetails(item)}
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Subtle gradient at bottom of image for date contrast */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, transparent 50%)'
        }} />

        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          display: 'flex',
          gap: '0.4rem',
          zIndex: 2
        }}>
          {item.status === 'claimed' || item.status === 'resolved' ? (
            <span className="badge badge-claimed">
              <CheckCircle size={12} />
              Reunited
            </span>
          ) : isFound ? (
            <span className="badge badge-found">
              🟢 FOUND
            </span>
          ) : (
            <span className="badge badge-lost">
              🔴 LOST
            </span>
          )}

          <span className="badge" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#334155',
            border: '1px solid #cbd5e1'
          }}>
            <Tag size={11} />
            {item.category.split('&')[0]}
          </span>
        </div>

        {/* Date on bottom right of image */}
        <div style={{
          position: 'absolute',
          bottom: '0.6rem',
          right: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.72rem',
          color: '#f8fafc',
          fontWeight: 600,
          zIndex: 2
        }}>
          <Calendar size={12} />
          <span>{item.date}</span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{
        padding: '1.1rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff'
      }}>
        {/* Title */}
        <h3 
          onClick={() => onViewDetails(item)}
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.3,
            marginBottom: '0.45rem',
            cursor: 'pointer'
          }}
        >
          {item.title}
        </h3>

        {/* Location */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.78rem',
          color: 'var(--primary-dark)',
          fontWeight: 600,
          marginBottom: '0.65rem'
        }}>
          <MapPin size={14} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.location}
          </span>
        </div>

        {/* Short Description */}
        <p style={{
          fontSize: '0.82rem',
          color: '#475569',
          lineHeight: 1.45,
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {item.description}
        </p>

        {/* Reporter Info Bar */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.85rem',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src={item.reportedBy.avatar}
              alt={item.reportedBy.fullName}
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--primary)' }}
            />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
                {item.reportedBy.fullName} {isOwner && '(You)'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                {item.reportedBy.department.split(' ')[0]} • Sec {item.reportedBy.section}
              </div>
            </div>
          </div>

          <div style={{
            fontSize: '0.7rem',
            color: 'var(--primary-dark)',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
            fontWeight: 600
          }}>
            Roll: {item.reportedBy.rollNumber.slice(-4)}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: isOwner ? '1fr' : '1fr 1.2fr', gap: '0.5rem' }}>
          <button
            onClick={() => onViewDetails(item)}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.6rem', background: '#f8fafc', borderColor: '#cbd5e1' }}
          >
            <Eye size={15} />
            <span>Details</span>
          </button>

          {!isOwner && (
            <button
              onClick={() => onOpenChat(item)}
              className="btn btn-primary"
              style={{
                fontSize: '0.8rem',
                padding: '0.5rem 0.6rem'
              }}
            >
              <MessageSquare size={15} />
              <span>Chat & Verify</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
