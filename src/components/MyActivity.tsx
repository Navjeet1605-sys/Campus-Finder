import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Hash, 
  Mail, 
  Phone, 
  PlusCircle, 
  MessageSquare, 
  Building2,
  Trash2
} from 'lucide-react';
import type { User, Item, ChatThread } from '../types';
import { ItemCard } from './ItemCard';

interface MyActivityProps {
  currentUser: User | null;
  items: Item[];
  threads: ChatThread[];
  onOpenReportModal: (type?: 'found' | 'lost') => void;
  onOpenAuthModal: () => void;
  onViewDetails: (item: Item) => void;
  onOpenChat: (item: Item) => void;
  onDeleteMyItem: (itemId: string) => void;
  onOpenChatThread: (threadId: string) => void;
}

export const MyActivity: React.FC<MyActivityProps> = ({
  currentUser,
  items,
  threads,
  onOpenReportModal,
  onOpenAuthModal,
  onViewDetails,
  onOpenChat,
  onDeleteMyItem,
  onOpenChatThread
}) => {
  const [activeTab, setActiveTab] = useState<'found' | 'lost' | 'resolved'>('found');

  if (!currentUser) {
    return (
      <div 
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '4rem 2rem',
          textAlign: 'center',
          maxWidth: '550px',
          margin: '2rem auto',
          background: '#ffffff',
          border: '1px solid rgba(16, 185, 129, 0.25)'
        }}
      >
        <Building2 size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Student Dashboard
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Login with your MGMCET official email to manage your reported items and campus conversations.
        </p>
        <button onClick={onOpenAuthModal} className="btn btn-primary">
          <UserIcon size={18} />
          <span>Sign In / Register</span>
        </button>
      </div>
    );
  }

  const myFoundItems = items.filter(i => i.reportedBy.id === currentUser.id && i.type === 'found' && i.status !== 'claimed');
  const myLostItems = items.filter(i => i.reportedBy.id === currentUser.id && i.type === 'lost' && i.status !== 'claimed');
  const myResolvedItems = items.filter(i => i.reportedBy.id === currentUser.id && (i.status === 'claimed' || i.status === 'resolved'));

  const myThreads = threads.filter(t => t.founderId === currentUser.id || t.claimantId === currentUser.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Student Profile Overview Card (Light Green & White) */}
      <div 
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '1.8rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.fullName}
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--primary)',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                {currentUser.fullName}
              </h2>
              <span className="badge badge-college">
                MGMCET Student
              </span>
            </div>

            <div style={{ fontSize: '0.86rem', color: 'var(--primary-dark)', fontWeight: 700, marginBottom: '0.35rem' }}>
              {currentUser.department} • {currentUser.year} (Section {currentUser.section})
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#475569' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Hash size={14} color="var(--primary)" />
                Roll: <strong style={{ color: '#0f172a' }}>{currentUser.rollNumber}</strong>
              </span>

              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Mail size={14} color="var(--primary)" />
                {currentUser.collegeEmail}
              </span>

              {currentUser.phoneNumber && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Phone size={14} color="var(--primary)" />
                  {currentUser.phoneNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Report actions */}
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            onClick={() => onOpenReportModal('found')}
            className="btn btn-primary"
            style={{ fontSize: '0.86rem' }}
          >
            <PlusCircle size={16} />
            <span>Post Found Item</span>
          </button>

          <button
            onClick={() => onOpenReportModal('lost')}
            className="btn btn-danger"
            style={{ fontSize: '0.86rem' }}
          >
            <PlusCircle size={16} />
            <span>Post Lost Item</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
        paddingBottom: '0.75rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('found')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'found' ? '1px solid var(--found-color)' : '1px solid #e2e8f0',
              background: activeTab === 'found' ? '#ecfdf5' : '#ffffff',
              color: activeTab === 'found' ? '#065f46' : '#64748b',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            🟢 Items I Found ({myFoundItems.length})
          </button>

          <button
            onClick={() => setActiveTab('lost')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'lost' ? '1px solid var(--lost-color)' : '1px solid #e2e8f0',
              background: activeTab === 'lost' ? '#fff1f2' : '#ffffff',
              color: activeTab === 'lost' ? '#9f1239' : '#64748b',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            🔴 Items I Lost ({myLostItems.length})
          </button>

          <button
            onClick={() => setActiveTab('resolved')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'resolved' ? '1px solid var(--claimed-color)' : '1px solid #e2e8f0',
              background: activeTab === 'resolved' ? '#f5f3ff' : '#ffffff',
              color: activeTab === 'resolved' ? '#5b21b6' : '#64748b',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            ✅ Reunited ({myResolvedItems.length})
          </button>
        </div>

        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
          All reports tied to your student account
        </span>
      </div>

      {/* Grid of My Items */}
      {(() => {
        const displayedItems = 
          activeTab === 'found' ? myFoundItems : 
          activeTab === 'lost' ? myLostItems : 
          myResolvedItems;

        if (displayedItems.length === 0) {
          return (
            <div 
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-md)',
                padding: '3rem 2rem',
                textAlign: 'center',
                background: '#ffffff',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                You have no items in this section right now.
              </p>
              <button
                onClick={() => onOpenReportModal(activeTab === 'lost' ? 'lost' : 'found')}
                className="btn btn-outline"
                style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}
              >
                <PlusCircle size={16} />
                <span>Report an item</span>
              </button>
            </div>
          );
        }

        return (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '1.5rem'
          }}>
            {displayedItems.map((item) => (
              <div key={item.id} style={{ position: 'relative' }}>
                <ItemCard
                  item={item}
                  currentUser={currentUser}
                  onViewDetails={onViewDetails}
                  onOpenChat={onOpenChat}
                />
                {/* Delete / remove listing button */}
                <button
                  onClick={() => {
                    if (confirm(`Remove this listing for "${item.title}"?`)) {
                      onDeleteMyItem(item.id);
                    }
                  }}
                  title="Delete listing"
                  style={{
                    position: 'absolute',
                    top: '0.65rem',
                    right: '0.65rem',
                    background: '#f43f5e',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 5,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Recent Chats with Peers (White card & Light Green Accent) */}
      <div 
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginTop: '1rem',
          background: '#ffffff',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          boxShadow: '0 4px 18px rgba(16, 185, 129, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Your Active Student Inquiries
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Direct chats initiated between you and peers regarding lost items.
            </p>
          </div>
          <span className="badge badge-college">
            {myThreads.length} Conversations
          </span>
        </div>

        {myThreads.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>
            No chat inquiries yet. When another student finds your lost item or asks about your found item, messages will show up here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {myThreads.map((thread) => {
              const otherName = thread.founderId === currentUser.id ? thread.claimantName : thread.founderName;
              const lastMsg = thread.messages[thread.messages.length - 1];

              return (
                <div
                  key={thread.id}
                  onClick={() => onOpenChatThread(thread.id)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ecfdf5';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={thread.itemImage}
                      alt={thread.itemTitle}
                      style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                        Chat with {otherName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                        Regarding: {thread.itemTitle}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Last message: "{lastMsg ? lastMsg.text : '...'}"
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', background: '#ffffff', borderColor: '#cbd5e1' }}>
                    <MessageSquare size={14} />
                    <span>Open Chat</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
