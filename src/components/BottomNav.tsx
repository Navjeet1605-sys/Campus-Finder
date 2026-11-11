import React from 'react';
import { Home, MessageSquare, Plus, User, ShieldAlert, Search } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'feed' | 'chats' | 'my-items' | 'admin';
  setActiveTab: (tab: 'feed' | 'chats' | 'my-items' | 'admin') => void;
  onOpenReportModal: (type: 'found' | 'lost') => void;
  unreadChatCount: number;
  isAdmin: boolean;
  onSearchClick?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  unreadChatCount,
  isAdmin,
  onSearchClick
}) => {
  return (
    <nav className="mobile-bottom-nav no-print" aria-label="Mobile Navigation">
      {/* Home / Feed */}
      <button 
        type="button"
        className={`mobile-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('feed');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        aria-label="Campus Feed"
      >
        <Home size={20} />
        <span>Feed</span>
      </button>

      {/* Quick Search */}
      <button 
        type="button"
        className="mobile-nav-item"
        onClick={() => {
          setActiveTab('feed');
          if (onSearchClick) {
            onSearchClick();
          } else {
            const searchInput = document.getElementById('campus-search-input');
            searchInput?.focus();
          }
        }}
        aria-label="Search items"
      >
        <Search size={20} />
        <span>Search</span>
      </button>

      {/* Center Action Button: Report Item */}
      <button 
        type="button"
        className="mobile-report-btn"
        onClick={() => onOpenReportModal('found')}
        aria-label="Report lost or found item"
        title="Report Item"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Live Chat */}
      <button 
        type="button"
        className={`mobile-nav-item ${activeTab === 'chats' ? 'active' : ''}`}
        onClick={() => setActiveTab('chats')}
        aria-label="Campus Chat"
      >
        <div style={{ position: 'relative' }}>
          <MessageSquare size={20} />
          {unreadChatCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-6px',
              background: '#e11d48',
              color: '#ffffff',
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '9999px',
              border: '2px solid #ffffff'
            }}>
              {unreadChatCount}
            </span>
          )}
        </div>
        <span>Chat</span>
      </button>

      {/* My Activity or Admin Panel */}
      {isAdmin ? (
        <button 
          type="button"
          className={`mobile-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
          aria-label="Admin Portal"
        >
          <ShieldAlert size={20} />
          <span>Admin</span>
        </button>
      ) : (
        <button 
          type="button"
          className={`mobile-nav-item ${activeTab === 'my-items' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-items')}
          aria-label="My Activity"
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      )}
    </nav>
  );
};
