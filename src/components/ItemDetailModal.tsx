import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  MessageSquare, 
  CheckCircle, 
  ShieldCheck, 
  Share2, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Item, User } from '../types';

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  currentUser: User | null;
  onOpenChat: (item: Item) => void;
  onMarkResolved: (item: Item) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  currentUser,
  onOpenChat,
  onMarkResolved
}) => {
  if (!item) return null;

  const isOwner = currentUser?.id === item.reportedBy.id;
  const isFound = item.type === 'found';
  const isResolved = item.status === 'claimed' || item.status === 'resolved';

  const handleResolveClick = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    onMarkResolved(item);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 100
    }}>
      <div 
        className="glass-panel animate-modal-pop"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-lg)',
          background: '#ffffff',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.16)',
          position: 'relative',
          padding: '0',
          overflow: 'hidden'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: '#0f172a',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <X size={20} />
        </button>

        {/* Hero Image Section */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '300px',
          background: '#f1f5f9'
        }}>
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, transparent 60%)'
          }} />

          {/* Badges on image */}
          <div style={{
            position: 'absolute',
            top: '1.25rem',
            left: '1.25rem',
            display: 'flex',
            gap: '0.5rem',
            zIndex: 2
          }}>
            {isResolved ? (
              <span className="badge badge-claimed" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
                <CheckCircle size={14} />
                Successfully Reunited
              </span>
            ) : isFound ? (
              <span className="badge badge-found" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
                🟢 FOUND ITEM
              </span>
            ) : (
              <span className="badge badge-lost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
                🔴 MISSING / LOST
              </span>
            )}

            <span className="badge" style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1'
            }}>
              <Tag size={13} color="var(--primary)" />
              {item.category}
            </span>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1.5rem',
            right: '1.5rem',
            zIndex: 2
          }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
              {item.title}
            </h1>
          </div>
        </div>

        {/* Modal Content Details */}
        <div style={{ padding: '1.5rem', background: '#ffffff' }}>
          {/* Key Facts Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            background: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            border: '1px solid #e2e8f0',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MapPin size={18} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Location</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{item.location}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Calendar size={18} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Date</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{item.date}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Clock size={18} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Time</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{item.time}</div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
              Description & Details
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {item.description}
            </p>
          </div>

          {/* Reporter Student Info Card */}
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase' }}>
                Reported By MGMCET Student
              </div>
              <div style={{
                fontSize: '0.72rem',
                color: '#065f46',
                background: '#d1fae5',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                border: '1px solid #a7f3d0'
              }}>
                Verified College ID
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <img
                src={item.reportedBy.avatar}
                alt={item.reportedBy.fullName}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {item.reportedBy.fullName} {isOwner && '(You)'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                  {item.reportedBy.department} • {item.reportedBy.year} (Section {item.reportedBy.section})
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Roll: {item.reportedBy.rollNumber} • {item.reportedBy.collegeEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Handover Safety Guidance */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            fontSize: '0.78rem',
            color: '#475569',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem'
          }}>
            <ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#0f172a' }}>MGMCET Safe Handover Protocol:</strong> For security, we recommend meeting during daytime in monitored campus locations such as the Central Library Reception, Main Canteen Nescafe counter, or Gate 1 Security post.
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            {!isOwner ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenChat(item);
                }}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}
              >
                <MessageSquare size={18} />
                <span>Chat with {item.reportedBy.fullName.split(' ')[0]}</span>
              </button>
            ) : (
              !isResolved && (
                <button
                  onClick={handleResolveClick}
                  className="btn"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    padding: '0.85rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: 700
                  }}
                >
                  <Sparkles size={18} />
                  <span>Mark as Claimed / Handed Over 🎉</span>
                </button>
              )
            )}

            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Item link copied to clipboard!');
              }}
              className="btn btn-outline"
              style={{ padding: '0.85rem 1.25rem', background: '#f8fafc', borderColor: '#cbd5e1' }}
            >
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
