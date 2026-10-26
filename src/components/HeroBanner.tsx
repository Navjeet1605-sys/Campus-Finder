import React from 'react';
import { 
  PlusCircle, 
  Search, 
  AlertTriangle 
} from 'lucide-react';
import type { Item } from '../types';

interface HeroBannerProps {
  items: Item[];
  onOpenReportModal: (type: 'found' | 'lost') => void;
  onExploreFeed: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  items,
  onOpenReportModal,
  onExploreFeed
}) => {
  const foundCount = items.filter(i => i.type === 'found').length;
  const lostCount = items.filter(i => i.type === 'lost').length;
  const resolvedCount = items.filter(i => i.status === 'claimed' || i.status === 'resolved').length;

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(236, 253, 245, 0.97) 100%), url("/images/interior.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      border: '1px solid rgba(16, 185, 129, 0.25)',
      boxShadow: '0 20px 50px -10px rgba(16, 185, 129, 0.12), 0 4px 20px rgba(0, 0, 0, 0.03)',
      padding: '2.8rem 2rem',
      marginBottom: '2rem'
    }}>
      <div style={{
        maxWidth: '850px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Verification Pill with College Logo */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.35rem 0.95rem',
          borderRadius: 'var(--radius-full)',
          background: '#ffffff',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '1.25rem',
          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.15)'
        }}>
          <img
            src="/images/logo4.jpg"
            alt="MGMCET Logo"
            style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'contain', background: '#fff' }}
          />
          <span>Exclusive for MGMCET Noida (Sec-62) Students & Faculty</span>
        </div>

        {/* Main Heading */}
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 2.85rem)',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1.15,
          marginBottom: '1rem'
        }}>
          Lost Something on Campus? <br />
          <span style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Connect, Chat & Recover Instantly.
          </span>
        </h1>

        <p style={{
          fontSize: '1rem',
          color: '#475569',
          maxWidth: '650px',
          margin: '0 auto 1.8rem',
          lineHeight: 1.6
        }}>
          From calculators in Math Labs to ID cards in the Canteen, report found items or search for lost belongings. Verify ownership and chat securely with fellow MGMCET students.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2.2rem'
        }}>
          <button
            onClick={() => onOpenReportModal('found')}
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              padding: '0.85rem 1.6rem',
              fontSize: '0.96rem',
              fontWeight: 700,
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <PlusCircle size={20} />
            <span>I Found an Item</span>
          </button>

          <button
            onClick={() => onOpenReportModal('lost')}
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              color: '#ffffff',
              padding: '0.85rem 1.6rem',
              fontSize: '0.96rem',
              fontWeight: 700,
              boxShadow: '0 6px 20px rgba(244, 63, 94, 0.35)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <AlertTriangle size={20} />
            <span>I Lost an Item (Post SOS)</span>
          </button>

          <button
            onClick={onExploreFeed}
            className="btn btn-outline"
            style={{
              padding: '0.85rem 1.3rem',
              fontSize: '0.92rem',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a'
            }}
          >
            <Search size={18} />
            <span>Browse All Items</span>
          </button>
        </div>

        {/* Live Campus Stats Bar (Crisp White & Light Green) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '1rem',
          padding: '1.2rem',
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.08)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              {items.length}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Campus Reports
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--found-color)' }}>
              {foundCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Found Items
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--lost-color)' }}>
              {lostCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Missing Items
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {resolvedCount}+
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Reunited
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
