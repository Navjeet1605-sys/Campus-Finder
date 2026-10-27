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
  X,
  Printer,
  Download,
  FileSpreadsheet
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

  // Printable Handover Slip State
  const [printingItem, setPrintingItem] = useState<Item | null>(null);

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

    // Prepare ready item for instant printing/audit slip
    const confirmedItem: Item = {
      ...selectedItemForHandover,
      status: 'claimed',
      handoverDetails: record
    };

    setSelectedItemForHandover(null);
    setPrintingItem(confirmedItem);
  };

  // Export full campus audit log as CSV for institutional / proctorial review
  const handleExportAuditCSV = () => {
    if (items.length === 0) {
      alert('No campus items found to export.');
      return;
    }

    const headers = [
      'Case ID',
      'Report Type',
      'Status',
      'Item Title',
      'Category',
      'Campus Spot',
      'Incident Date',
      'Incident Time',
      'Proctor Verification',
      'Reported By Student',
      'Reporter Roll Number',
      'Reporter Department',
      'Reporter Email',
      'Reporter Phone',
      'Claimed By / Handed To',
      'Claimant Roll Number',
      'Handover Location / Cabin',
      'Handover Date',
      'Secret Verification Proof',
      'Proctor Notes',
      'Created Timestamp'
    ];

    const escapeCSV = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const clean = String(val).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = items.map((item) => [
      escapeCSV(item.id),
      escapeCSV(item.type.toUpperCase()),
      escapeCSV(item.status.toUpperCase()),
      escapeCSV(item.title),
      escapeCSV(item.category),
      escapeCSV(item.location),
      escapeCSV(item.date),
      escapeCSV(item.time),
      escapeCSV(item.adminVerification || 'pending'),
      escapeCSV(item.reportedBy?.fullName || 'Anonymous'),
      escapeCSV(item.reportedBy?.rollNumber || 'N/A'),
      escapeCSV(item.reportedBy?.department || 'N/A'),
      escapeCSV(item.reportedBy?.collegeEmail || 'N/A'),
      escapeCSV(item.reportedBy?.phoneNumber || 'N/A'),
      escapeCSV(item.handoverDetails?.handedToName || (item.status === 'claimed' ? 'Verified Owner' : 'Unclaimed')),
      escapeCSV(item.handoverDetails?.handedToRoll || 'N/A'),
      escapeCSV(item.handoverDetails?.cabinLocation || 'N/A'),
      escapeCSV(item.handoverDetails?.handedDate || 'N/A'),
      escapeCSV(item.secretVerificationHint || 'None specified'),
      escapeCSV(item.handoverDetails?.adminNotes || 'N/A'),
      escapeCSV(item.createdAt || new Date().toISOString())
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `MGMCET_Campus_Audit_Log_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportAuditCSV}
            className="btn"
            title="Download complete campus lost & found log as a certified spreadsheet"
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(8px)',
              fontWeight: 700,
              fontSize: '0.84rem',
              padding: '0.6rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={16} />
            <span>Export Audit Log (.CSV)</span>
          </button>

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
                        {!isClaimed ? (
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
                        ) : (
                          <button
                            onClick={() => setPrintingItem(item)}
                            className="btn"
                            style={{
                              width: '100%',
                              fontSize: '0.78rem',
                              padding: '0.45rem',
                              justifyContent: 'center',
                              background: '#ecfdf5',
                              border: '1px solid #10b981',
                              color: '#065f46',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <Printer size={14} />
                            <span>Print Handover Slip 🖨️</span>
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
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                Official Campus Handover Audit Log
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Certified record of lost items returned to verified student owners by College Security / Proctors.
              </p>
            </div>

            <button
              onClick={handleExportAuditCSV}
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                cursor: 'pointer'
              }}
            >
              <Download size={15} />
              <span>Export Audit Log (CSV)</span>
            </button>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-claimed" style={{ fontSize: '0.72rem' }}>
                        ✓ Case Resolved
                      </span>
                      <button
                        onClick={() => setPrintingItem(item)}
                        className="btn"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.45rem 0.85rem',
                          background: '#065f46',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(6, 95, 70, 0.2)'
                        }}
                      >
                        <Printer size={14} />
                        <span>Print Official Slip 🖨️</span>
                      </button>
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
      {/* =========================================================================
          PRINTABLE OFFICIAL HANDOVER SLIP / VOUCHER MODAL (COLLEGE SEAL & SIGNATURES)
         ========================================================================= */}
      {printingItem && (
        <div 
          className="handover-slip-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflowY: 'auto',
            padding: '2rem 1rem',
            zIndex: 99999
          }}
        >
          {/* Action Toolbar (Hidden during printing) */}
          <div 
            className="no-print"
            style={{
              width: '100%',
              maxWidth: '780px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              background: '#0f172a',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ShieldCheck size={22} color="#10b981" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.94rem' }}>
                  Official Handover Pass Ready
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Authorized by MGMCET Proctorial Board • Form LF-04
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} />
                <span>Print Slip / Save PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintingItem(null)}
                className="btn"
                style={{
                  background: '#334155',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  padding: '0.55rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Official Printable Handover Slip Paper */}
          <div 
            className="printable-handover-slip"
            style={{
              width: '100%',
              maxWidth: '780px',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '8px',
              padding: '2.5rem 2.8rem',
              boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
              border: '2px solid #047857',
              fontFamily: '"Times New Roman", Times, serif',
              position: 'relative'
            }}
          >
            {/* Top College Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #065f46', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <ShieldCheck size={36} color="#065f46" />
                <h1 style={{
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  color: '#065f46',
                  letterSpacing: '0.02em',
                  margin: 0,
                  textTransform: 'uppercase'
                }}>
                  Mahatma Gandhi Mission's College of Engineering & Technology
                </h1>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                Approved by AICTE, New Delhi & Affiliated to Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                Institutional Area, Sector 62, Noida - 201309 (Uttar Pradesh) • Phone: (0120) 2400112 / 2400113
              </div>

              <div style={{
                marginTop: '0.75rem',
                display: 'inline-block',
                background: '#065f46',
                color: '#ffffff',
                padding: '0.3rem 1.4rem',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.88rem',
                letterSpacing: '0.05em'
              }}>
                OFFICE OF CHIEF PROCTOR • PROPERTY CUSTODY DISCHARGE SLIP
              </div>
            </div>

            {/* Reference & Audit Serial Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '0.5rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#334155',
              marginBottom: '1.25rem'
            }}>
              <div>
                <strong>REF VOUCHER:</strong> MGMCET/PROCTOR/LF-{printingItem.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}
              </div>
              <div>
                <strong>DISCHARGE DATE:</strong> {printingItem.handoverDetails?.handedDate || new Date().toLocaleDateString('en-GB')}
              </div>
              <div>
                <strong>CASE:</strong> <span style={{ color: '#059669' }}>CLOSED & DISCHARGED ✓</span>
              </div>
            </div>

            {/* Section 1: Recovered Article Specifications */}
            <div style={{ marginBottom: '1.2rem' }}>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#065f46',
                textTransform: 'uppercase',
                borderBottom: '1px solid #065f46',
                paddingBottom: '0.2rem',
                marginBottom: '0.5rem'
              }}>
                1. Recovered Property / Article Particulars
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.35rem 0.5rem', width: '25%', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Article Description:</td>
                    <td style={{ padding: '0.35rem 0.5rem', width: '40%', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>{printingItem.title}</td>
                    <td style={{ padding: '0.35rem 0.5rem', width: '15%', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Category:</td>
                    <td style={{ padding: '0.35rem 0.5rem', width: '20%', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>{printingItem.category}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Campus Location:</td>
                    <td style={{ padding: '0.35rem 0.5rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>{printingItem.location}</td>
                    <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Date & Time:</td>
                    <td style={{ padding: '0.35rem 0.5rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>{printingItem.date} {printingItem.time}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Unique Proof/Hint:</td>
                    <td colSpan={3} style={{ padding: '0.35rem 0.5rem', color: '#334155', borderBottom: '1px solid #e2e8f0', fontStyle: 'italic' }}>
                      {printingItem.secretVerificationHint || 'Physical verification conducted by security staff.'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 2: Surrender (Finder) & Claim (Owner) Particulars in 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.2rem' }}>
              {/* Left Column: Reporting / Surrender Student */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', marginBottom: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem' }}>
                  2. Surrendered By (Finder / Reporter)
                </div>
                <div style={{ fontSize: '0.8rem', lineHeight: '1.45', color: '#334155' }}>
                  <div><strong>Student Name:</strong> {printingItem.reportedBy?.fullName || 'Campus Member'}</div>
                  <div><strong>College Roll No:</strong> {printingItem.reportedBy?.rollNumber || 'N/A'}</div>
                  <div><strong>Branch / Dept:</strong> {printingItem.reportedBy?.department || 'N/A'}</div>
                  <div><strong>College Email:</strong> {printingItem.reportedBy?.collegeEmail || 'N/A'}</div>
                  <div><strong>Contact Mobile:</strong> {printingItem.reportedBy?.phoneNumber || 'Recorded on Portal'}</div>
                </div>
              </div>

              {/* Right Column: Handover (Claimant) */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', marginBottom: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem' }}>
                  3. Handed Over To (Verified Owner)
                </div>
                <div style={{ fontSize: '0.8rem', lineHeight: '1.45', color: '#334155' }}>
                  <div><strong>Claimant Name:</strong> {printingItem.handoverDetails?.handedToName || printingItem.reportedBy?.fullName}</div>
                  <div><strong>Student Roll No:</strong> {printingItem.handoverDetails?.handedToRoll || 'VERIFIED ROLL'}</div>
                  <div><strong>Cabin Location:</strong> {printingItem.handoverDetails?.cabinLocation || 'Gate 1 Security Cabin'}</div>
                  <div><strong>Handover Date:</strong> {printingItem.handoverDetails?.handedDate || new Date().toLocaleDateString('en-GB')}</div>
                  <div><strong>Officer Remarks:</strong> {printingItem.handoverDetails?.adminNotes || 'Identity verified via college card.'}</div>
                </div>
              </div>
            </div>

            {/* Legal Undertaking & Indemnity Clause */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '0.75rem',
              borderRadius: '4px',
              fontSize: '0.76rem',
              color: '#334155',
              lineHeight: 1.4,
              marginBottom: '1.5rem',
              textAlign: 'justify'
            }}>
              <strong>STATUTORY DECLARATION & ACKNOWLEDGEMENT:</strong> I hereby certify that I am the genuine and rightful owner of the property described herein and acknowledge receipt thereof in sound and undamaged physical condition. I affirm that Mahatma Gandhi Mission's College of Engineering & Technology, its Proctorial Board, and Duty Security Officers are relieved from any further claims or liabilities regarding this article.
            </div>

            {/* Signatures & College Seal Grid (3 Columns) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 140px 1fr',
              alignItems: 'flex-end',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              {/* Column 1: Student Claimant Signature */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '0.4rem', height: '40px' }} />
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                  Signature of Claimant / Student
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {printingItem.handoverDetails?.handedToName || 'Verified Claimant'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Roll: {printingItem.handoverDetails?.handedToRoll || 'MGMCET'}
                </div>
              </div>

              {/* Column 2: Official College Seal Graphic */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '95px',
                  height: '95px',
                  borderRadius: '50%',
                  border: '3px double #065f46',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  textAlign: 'center',
                  background: '#f0fdf4',
                  boxShadow: 'inset 0 0 8px rgba(6, 95, 70, 0.15)'
                }}>
                  <div style={{ fontSize: '0.45rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    * MGMCET NOIDA *
                  </div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#065f46', margin: '2px 0' }}>
                    PROCTORIAL BOARD
                  </div>
                  <div style={{ fontSize: '0.45rem', fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '1px 4px', borderRadius: '2px' }}>
                    VERIFIED & RELEASED
                  </div>
                  <div style={{ fontSize: '0.48rem', color: '#065f46', marginTop: '2px' }}>
                    {printingItem.handoverDetails?.handedDate || new Date().toLocaleDateString('en-GB')}
                  </div>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#065f46', marginTop: '4px' }}>
                  OFFICIAL SEAL
                </span>
              </div>

              {/* Column 3: Duty Officer / Proctor Signature */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '0.4rem', height: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'cursive', fontSize: '0.9rem', color: '#065f46' }}>
                    Security Proctor
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                  Campus Security Proctor
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Chief Proctorial Board & Custody Cell
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Cabin: {printingItem.handoverDetails?.cabinLocation || 'Gate 1 Security Cabin'}
                </div>
              </div>
            </div>

            {/* Bottom Footer Watermark Note */}
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '0.6rem',
              borderTop: '1px dashed #cbd5e1',
              fontSize: '0.68rem',
              color: '#94a3b8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>System-generated through MGMCET Campus Finder • Valid without physical seal if digitally approved</span>
              <span>Page 1 of 1 • Official Archive Copy</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
