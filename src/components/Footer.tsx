import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

interface FooterProps {
  onOpenReportModal: (type?: 'found' | 'lost') => void;
  onOpenAuthModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenReportModal,
  onOpenAuthModal
}) => {
  return (
    <footer style={{
      marginTop: '5rem',
      background: '#ffffff',
      borderTop: '1px solid rgba(16, 185, 129, 0.2)',
      padding: '3rem 1.5rem 2rem',
      position: 'relative',
      boxShadow: '0 -4px 20px rgba(16, 185, 129, 0.05)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* College Bio */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: '#ffffff',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--primary)',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
            }}>
              <img
                src="/images/logo4.jpg"
                alt="MGMCET Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Campus<span style={{ color: 'var(--primary-dark)' }}>Finder</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary-dark)', fontWeight: 700 }}>
                MGMCET NOIDA SEC-62
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
            Official student-driven peer network to locate, report, and safely recover lost belongings across Mahatma Gandhi Mission's College of Engineering & Technology campus.
          </p>

          <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
            Affiliated to Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow • Approved by AICTE, New Delhi.
          </div>
        </div>

        {/* Campus Location & Security */}
        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Campus Contact & Security
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>A-9, Sector 62, Institutional Area, Noida, Uttar Pradesh 201309</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Phone size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>Security Cabin (Gate 1): +91 120 240 1445</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Mail size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>campusfinder@coet.in</span>
            </div>
          </div>
        </div>

        {/* Quick Portal Links */}
        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Portal Shortcuts
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.84rem' }}>
            <button
              onClick={() => onOpenReportModal('found')}
              style={{ background: 'none', border: 'none', color: '#475569', textAlign: 'left', cursor: 'pointer', padding: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-dark)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              • Report a Found Item (Photo & Details)
            </button>

            <button
              onClick={() => onOpenReportModal('lost')}
              style={{ background: 'none', border: 'none', color: '#475569', textAlign: 'left', cursor: 'pointer', padding: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--lost-color)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              • Report a Missing Item (SOS Post)
            </button>

            <button
              onClick={onOpenAuthModal}
              style={{ background: 'none', border: 'none', color: '#475569', textAlign: 'left', cursor: 'pointer', padding: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-dark)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              • Student Account / Profile
            </button>

            <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.5rem' }}>
              Recommended Handover Spots: Central Library, Main Canteen, Block A Dean Office
            </span>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '1.5rem',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.78rem',
        color: '#64748b'
      }}>
        <div>
          © 2026 Mahatma Gandhi Mission's College of Engineering & Technology, Noida. All rights reserved.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span>Designed with care for MGMCET Noida students</span>
        </div>
      </div>
    </footer>
  );
};
