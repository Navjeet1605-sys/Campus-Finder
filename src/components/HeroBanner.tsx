import React, { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const foundCount = items.filter(i => i.type === 'found').length;
  const lostCount = items.filter(i => i.type === 'lost').length;
  const resolvedCount = items.filter(i => i.status === 'claimed' || i.status === 'resolved').length;

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(236, 253, 245, 0.97) 100%), url("/images/interior.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      border: '1px solid rgba(16, 185, 129, 0.25)',
      boxShadow: '0 20px 50px -10px rgba(16, 185, 129, 0.12), 0 4px 20px rgba(0, 0, 0, 0.03)',
      padding: isMobile ? '1.6rem 1.1rem' : '2.8rem 2rem',
      marginBottom: isMobile ? '1.25rem' : '2rem'
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
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          background: '#ffffff',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          fontSize: isMobile ? '0.72rem' : '0.8rem',
          fontWeight: 700,
          marginBottom: '1rem',
          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.15)',
          maxWidth: '100%'
        }}>
          <img
            src="/images/logo4.jpg"
            alt="MGMCET Logo"
            style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'contain', background: '#fff', flexShrink: 0 }}
          />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Exclusive for MGMCET Noida (Sec-62)
          </span>
        </div>

        {/* Main Heading */}
        <h1 style={{
          fontSize: isMobile ? '1.75rem' : 'clamp(2rem, 4vw, 2.85rem)',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1.2,
          marginBottom: '0.85rem'
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
          fontSize: isMobile ? '0.88rem' : '1rem',
          color: '#475569',
          maxWidth: '650px',
          margin: '0 auto 1.5rem',
          lineHeight: 1.55
        }}>
          From calculators in Math Labs to ID cards in the Canteen, report found items or search for lost belongings. Verify ownership and chat securely with fellow MGMCET students.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          flexDirection: isMobile ? 'column' : 'row',
          width: '100%',
          marginBottom: isMobile ? '1.5rem' : '2.2rem'
        }}>
          <button
            onClick={() => onOpenReportModal('found')}
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              padding: '0.8rem 1.5rem',
              fontSize: '0.94rem',
              fontWeight: 700,
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
              borderRadius: 'var(--radius-md)',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center'
            }}
          >
            <PlusCircle size={19} />
            <span>I Found an Item</span>
          </button>

          <button
            onClick={() => onOpenReportModal('lost')}
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              color: '#ffffff',
              padding: '0.8rem 1.5rem',
              fontSize: '0.94rem',
              fontWeight: 700,
              boxShadow: '0 6px 20px rgba(244, 63, 94, 0.35)',
              borderRadius: 'var(--radius-md)',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={19} />
            <span>I Lost an Item (Post SOS)</span>
          </button>

          <button
            onClick={onExploreFeed}
            className="btn btn-outline"
            style={{
              padding: '0.8rem 1.3rem',
              fontSize: '0.9rem',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center'
            }}
          >
            <Search size={17} />
            <span>Browse All Items</span>
          </button>
        </div>

        {/* Live Campus Stats Bar (Crisp White & Light Green) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          padding: isMobile ? '1rem' : '1.2rem',
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.08)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? '1.35rem' : '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              {items.length}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Campus Reports
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? '1.35rem' : '1.6rem', fontWeight: 800, color: 'var(--found-color)' }}>
              {foundCount}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Found Items
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? '1.35rem' : '1.6rem', fontWeight: 800, color: 'var(--lost-color)' }}>
              {lostCount}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Missing Items
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? '1.35rem' : '1.6rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {resolvedCount}+
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Reunited
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
