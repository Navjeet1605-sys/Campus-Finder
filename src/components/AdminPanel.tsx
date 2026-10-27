import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User as UserIcon, 
  Users, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Tag, 
  Award,
  FileText,
  Calendar,
  X
} from 'lucide-react';
import type { Item, User, HandoverRecord } from '../types';

interface AdminPanelProps {
  items: Item[];
  registeredStudents?: User[];
  onUpdateItemStatus?: (itemId: string, status: 'active' | 'claimed' | 'resolved') => void;
  onVerifyItem: (itemId: string, verification: 'verified' | 'pending' | 'flagged') => void;
  onConfirmHandover: (itemId: string, record: HandoverRecord) => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteStudentAccount?: (studentId: string) => void;
  onBackToFeed?: () => void;
  onViewItem?: (item: Item) => void;
  currentUser?: User | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  items,
  registeredStudents: propStudents,
  onVerifyItem,
  onConfirmHandover,
  onDeleteItem,
  onDeleteStudentAccount,
  onBackToFeed,
  onViewItem,
  currentUser
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'items' | 'students' | 'handovers'>('items');
  const [filterType, setFilterType] = useState<'all' | 'found' | 'lost' | 'pending' | 'claimed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handover Modal State
  const [selectedItemForHandover, setSelectedItemForHandover] = useState<Item | null>(null);
  const [handoverRecipientName, setHandoverRecipientName] = useState('');
  const [handoverRecipientRoll, setHandoverRecipientRoll] = useState('');
  const [handoverLocation, setHandoverLocation] = useState('Gate 1 Security Cabin');
  const [handoverNotes, setHandoverNotes] = useState('');

  // Registered students list
  const registeredStudents: User[] = propStudents || (() => {
    try {
      const saved = localStorage.getItem('mgmcet_registered_students');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  const [studentSearch, setStudentSearch] = useState('');

  // Filter items
  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.reportedBy.fullName.toLowerCase().includes(q) ||
      item.reportedBy.rollNumber.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterType === 'found') return item.type === 'found';
    if (filterType === 'lost') return item.type === 'lost';
    if (filterType === 'pending') return item.adminVerification === 'pending' || !item.adminVerification;
    if (filterType === 'claimed') return item.status === 'claimed' || item.status === 'resolved';

    return true;
  });

  // Filter students
  const filteredStudents = registeredStudents.filter((s) => {
    const q = studentSearch.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.collegeEmail.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  const handleOpenHandoverDialog = (item: Item) => {
    setSelectedItemForHandover(item);
    setHandoverRecipientName('');
    setHandoverRecipientRoll('');
    setHandoverLocation('Gate 1 Security Cabin');
    setHandoverNotes('');
  };

  const handleSaveHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForHandover) return;
    if (!handoverRecipientName.trim() || !handoverRecipientRoll.trim()) {
      alert('Please enter both the Recipient Student Name and Roll Number.');
      return;
    }

    const record: HandoverRecord = {
      handedToName: handoverRecipientName.trim(),
      handedToRoll: handoverRecipientRoll.trim().toUpperCase(),
      handedDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      cabinLocation: handoverLocation,
      adminNotes: handoverNotes.trim() || undefined
    };

    onConfirmHandover(selectedItemForHandover.id, record);
    setSelectedItemForHandover(null);
  };

  // Reunited items count
  const reunitedCount = items.filter(i => i.status === 'claimed' || i.status === 'resolved').length;
  const foundCount = items.filter(i => i.type === 'found').length;
  const lostCount = items.filter(i => i.type === 'lost').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '100%' }}>
      {/* Admin Header Banner */}
      <div 
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
          padding: '1.8rem 1.5rem',
          color: '#ffffff',
          boxShadow: '0 12px 35px rgba(5, 150, 105, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            flexShrink: 0
          }}>
            <ShieldCheck size={32} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Campus Admin & Proctor Control Panel
              </h1>
              <span style={{
                background: '#ffffff',
                color: '#065f46',
                padding: '0.15rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 800
              }}>
                OFFICIAL AUTHORITY
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#d1fae5', marginTop: '0.2rem' }}>
              Mahatma Gandhi Mission's College of Engineering & Technology • Sector 62 Noida
            </p>
          </div>
        </div>

        <button
          onClick={onBackToFeed}
          className="btn"
          style={{
            background: '#ffffff',
            color: '#065f46',
            fontWeight: 700,
            fontSize: '0.86rem',
            padding: '0.6rem 1.2rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          View Student Feed →
        </button>
      </div>

      {/* Stats Counter Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Reports</span>
            <Package size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
            {items.length}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Campus-wide postings</span>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Registered Students</span>
            <Users size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
            {registeredStudents.length}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>Verified @coet.in IDs</span>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Found vs Missing</span>
            <AlertTriangle size={18} color="var(--found-color)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
            {foundCount} / {lostCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Found: {foundCount} • Lost: {lostCount}</span>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Items Reunited</span>
            <Award size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--found-color)', marginTop: '0.4rem' }}>
            {reunitedCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Confirmed Handed Over</span>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '0.2rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveAdminTab('items')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            background: activeAdminTab === 'items' ? 'var(--primary)' : 'transparent',
            color: activeAdminTab === 'items' ? '#ffffff' : '#475569',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Package size={17} />
          <span>Reported Items Moderation ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('students')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            background: activeAdminTab === 'students' ? 'var(--primary)' : 'transparent',
            color: activeAdminTab === 'students' ? '#ffffff' : '#475569',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Users size={17} />
          <span>Student Logins & ID Roster ({registeredStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('handovers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            background: activeAdminTab === 'handovers' ? 'var(--primary)' : 'transparent',
            color: activeAdminTab === 'handovers' ? '#ffffff' : '#475569',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Award size={17} />
          <span>Handover Receipts & Audit Log ({reunitedCount})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: REPORTED ITEMS CONTROL & MODERATION
         ========================================================================= */}
      {activeAdminTab === 'items' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filters & Search */}
          <div 
            className="glass-panel"
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilterType('all')}
                className={`btn ${filterType === 'all' ? 'btn-ghost' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setFilterType('found')}
                className={`btn ${filterType === 'found' ? 'btn-ghost' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', color: 'var(--found-color)' }}
              >
                🟢 Found ({foundCount})
              </button>
              <button
                onClick={() => setFilterType('lost')}
                className={`btn ${filterType === 'lost' ? 'btn-ghost' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', color: 'var(--lost-color)' }}
              >
                🔴 Lost ({lostCount})
              </button>
              <button
                onClick={() => setFilterType('claimed')}
                className={`btn ${filterType === 'claimed' ? 'btn-ghost' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', color: '#7c3aed' }}
              >
                ✅ Reunited ({reunitedCount})
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 auto', maxWidth: '400px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search item, student name, or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem 0.55rem 2.4rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.84rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Items List */}
          {filteredItems.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              padding: '3rem',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              color: '#64748b'
            }}>
              <Package size={40} color="var(--primary)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <h3 style={{ color: '#0f172a' }}>No matching items found</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>All reported items are in order.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredItems.map((item) => {
                const isClaimed = item.status === 'claimed' || item.status === 'resolved';
                const isVerified = item.adminVerification === 'verified';

                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      border: isVerified ? '1.5px solid var(--primary)' : '1px solid #e2e8f0',
                      padding: '1.25rem',
                      display: 'flex',
                      gap: '1.25rem',
                      flexWrap: 'wrap',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                      position: 'relative'
                    }}
                  >
                    {/* Item Image */}
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      flexShrink: 0
                    }}>
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Item Details */}
                    <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className={item.type === 'found' ? 'badge badge-found' : 'badge badge-lost'} style={{ fontSize: '0.68rem' }}>
                          {item.type === 'found' ? '🟢 Found Item' : '🔴 Lost Item'}
                        </span>

                        <span className="badge" style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', fontSize: '0.68rem' }}>
                          <Tag size={12} color="var(--primary)" /> {item.category}
                        </span>

                        {isVerified && (
                          <span style={{
                            background: '#ecfdf5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                            padding: '0.15rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <CheckCircle2 size={13} color="var(--primary)" />
                            Proctor Verified ✓
                          </span>
                        )}

                        {isClaimed && (
                          <span className="badge badge-claimed" style={{ fontSize: '0.68rem' }}>
                            <CheckCircle size={13} /> Successfully Handed Over
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {item.title}
                      </h3>

                      <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.45 }}>
                        {item.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={13} color="var(--primary)" />
                          Spot: <strong>{item.location}</strong>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={13} color="var(--primary)" />
                          Date: {item.date} {item.time}
                        </span>
                      </div>

                      {/* Secret verification hint (Visible to Admin to test claimants!) */}
                      {item.secretVerificationHint && (
                        <div style={{
                          background: '#fffbeb',
                          border: '1px solid #fde68a',
                          padding: '0.45rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.76rem',
                          color: '#92400e',
                          marginTop: '0.3rem'
                        }}>
                          <strong>🔒 Secret Verification Test:</strong> {item.secretVerificationHint}
                        </div>
                      )}

                      {/* Handover Details if available */}
                      {item.handoverDetails && (
                        <div style={{
                          background: '#f5f3ff',
                          border: '1px solid #ddd6fe',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          color: '#5b21b6',
                          marginTop: '0.3rem'
                        }}>
                          <strong>🎉 Official Handover Record:</strong> Handed over to <strong>{item.handoverDetails.handedToName}</strong> (Roll: {item.handoverDetails.handedToRoll}) at {item.handoverDetails.cabinLocation} on {item.handoverDetails.handedDate}.
                        </div>
                      )}
                    </div>

                    {/* Reporter Info & Admin Action Buttons */}
                    <div style={{
                      flex: '1 1 240px',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.8rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>
                          Reported By Student:
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                          {item.reportedBy.fullName}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                          Roll: {item.reportedBy.rollNumber || 'N/A'} • {item.reportedBy.department?.split(' ')[0]}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '0.2rem' }}>
                          <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {item.reportedBy.collegeEmail}
                        </div>
                        {item.reportedBy.phoneNumber && (
                          <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '0.1rem' }}>
                            <Phone size={12} color="var(--primary)" style={{ display: 'inline', marginRight: '4px' }} />
                            {item.reportedBy.phoneNumber}
                          </div>
                        )}
                      </div>

                      {/* Admin Actions Bar */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.65rem' }}>
                        {/* Verify toggle */}
                        {!isVerified ? (
                          <button
                            onClick={() => onVerifyItem(item.id, 'verified')}
                            className="btn btn-ghost"
                            style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem', justifyContent: 'center' }}
                          >
                            <CheckCircle2 size={15} color="var(--primary)" />
                            <span>Verify & Approve Item ✓</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onVerifyItem(item.id, 'pending')}
                            className="btn btn-outline"
                            style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem', justifyContent: 'center', borderColor: '#cbd5e1' }}
                          >
                            <span>Revoke Verification</span>
                          </button>
                        )}

                        {/* Handover action */}
                        {!isClaimed && (
                          <button
                            onClick={() => handleOpenHandoverDialog(item)}
                            className="btn"
                            style={{
                              width: '100%',
                              fontSize: '0.78rem',
                              padding: '0.45rem',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#ffffff',
                              justifyContent: 'center',
                              fontWeight: 700
                            }}
                          >
                            <Award size={15} />
                            <span>Confirm Handover Receipt 🎉</span>
                          </button>
                        )}

                        {/* Delete / Spam button */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${item.title}"? This will permanently remove the item post.`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          className="btn btn-danger"
                          style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem', justifyContent: 'center' }}
                        >
                          <Trash2 size={14} />
                          <span>Delete Post (Spam/Fake)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: STUDENT LOGINS & ID ROSTER (CHEQUE EVERY LOGIN)
         ========================================================================= */}
      {activeAdminTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Search Header */}
          <div 
            className="glass-panel"
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Verified College Student Accounts ({registeredStudents.length})
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                All student registrations strictly authenticated with official @coet.in domain
              </p>
            </div>

            <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 auto', maxWidth: '380px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search student by roll no, name, or branch..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem 0.55rem 2.4rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.84rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Students Roster Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {filteredStudents.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
                No students match your search criteria.
              </div>
            ) : (
              filteredStudents.map((student) => {
                const studentItems = items.filter(i => i.reportedBy.id === student.id);

                return (
                  <div
                    key={student.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.15rem',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img
                        src={student.avatar}
                        alt={student.fullName}
                        style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a' }}>
                          {student.fullName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--primary-dark)', fontWeight: 700 }}>
                          Roll No: {student.rollNumber}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {student.collegeEmail}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      background: '#f8fafc',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.74rem',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                      lineHeight: 1.4
                    }}>
                      <div><strong>Branch:</strong> {student.department}</div>
                      <div><strong>Class:</strong> {student.year} • Section {student.section}</div>
                      {student.phoneNumber && (
                        <div><strong>Phone:</strong> {student.phoneNumber}</div>
                      )}
                      <div><strong>Items Reported:</strong> {studentItems.length}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem' }}>
                      <span className="badge badge-college" style={{ fontSize: '0.65rem' }}>
                        Active Verified
                      </span>

                      {onDeleteStudentAccount && student.role !== 'admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Revoke and remove student account for ${student.fullName}?`)) {
                              onDeleteStudentAccount(student.id);
                            }
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--lost-color)',
                            cursor: 'pointer',
                            fontSize: '0.74rem',
                            fontWeight: 600
                          }}
                        >
                          Revoke Account
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: HANDOVER RECEIPTS & AUDIT LOG
         ========================================================================= */}
      {activeAdminTab === 'handovers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div 
            className="glass-panel"
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid #e2e8f0'
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
              Official Campus Handover Audit Log
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Certified record of lost items returned to verified student owners by College Security / Proctors.
            </p>
          </div>

          {items.filter(i => i.handoverDetails || i.status === 'claimed').length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <Award size={40} color="var(--primary)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <h3 style={{ color: '#0f172a' }}>No handover records yet</h3>
              <p style={{ fontSize: '0.85rem' }}>Once you confirm an item handover, the official receipt will be logged here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items
                .filter(i => i.handoverDetails || i.status === 'claimed')
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.2rem',
                      border: '1px solid #a7f3d0',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>
                          Found at: {item.location} • Reported by: {item.reportedBy.fullName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                          {item.handoverDetails ? (
                            <>
                              Handed to: <strong style={{ color: '#0f172a' }}>{item.handoverDetails.handedToName}</strong> (Roll: {item.handoverDetails.handedToRoll}) at {item.handoverDetails.cabinLocation}
                            </>
                          ) : (
                            <span>Reunited with student owner</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span className="badge badge-claimed" style={{ fontSize: '0.72rem' }}>
                        ✓ Case Resolved
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          HANDOVER CONFIRMATION MODAL DIALOG
         ========================================================================= */}
      {selectedItemForHandover && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.55)',
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
              maxWidth: '500px',
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              border: '2px solid var(--primary)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Confirm Item Handover Receipt
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Item: {selectedItemForHandover.title}
                </span>
              </div>
              <button
                onClick={() => setSelectedItemForHandover(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveHandover} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Recipient Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={handoverRecipientName}
                  onChange={(e) => setHandoverRecipientName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Recipient College Roll Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 210901010045"
                  value={handoverRecipientRoll}
                  onChange={(e) => setHandoverRecipientRoll(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Handover Spot / Security Cabin
                </label>
                <select
                  value={handoverLocation}
                  onChange={(e) => setHandoverLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="Gate 1 Security Cabin">Gate 1 Security Cabin</option>
                  <option value="Gate 2 Security Cabin">Gate 2 Security Cabin</option>
                  <option value="Proctor Office (Admin Block)">Proctor Office (Admin Block)</option>
                  <option value="Central Library Reception Desk">Central Library Reception Desk</option>
                  <option value="Main Canteen Handover">Main Canteen Handover</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Proctor Remarks / ID Verified (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physical MGMCET ID Card verified, matching calculator serial"
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedItemForHandover(null)}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.75rem', fontWeight: 700 }}
                >
                  Confirm & Close Post 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
