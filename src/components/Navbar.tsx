import React, { useState } from 'react';
import { 
  Search, 
  PlusCircle, 
  MessageSquare, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Layers, 
  ChevronDown
} from 'lucide-react';
import type { User, AppNotification } from '../types';

interface NavbarProps {
  currentUser: User;
  activeTab: 'feed' | 'chats' | 'my-items';
  setActiveTab: (tab: 'feed' | 'chats' | 'my-items') => void;
  onOpenReportModal: (defaultType?: 'found' | 'lost') => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  unreadChatCount: number;
  notifications: AppNotification[];
  onMarkNotificationsRead: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onLogout,
  searchQuery,
  setSearchQuery,
  unreadChatCount,
  notifications,
  onMarkNotificationsRead
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      {/* College Top Alert Bar (Light Green Theme) */}
      <div style={{
        background: 'linear-gradient(90deg, #ecfdf5 0%, #d1fae5 50%, #ecfdf5 100%)',
        borderBottom: '1px solid #a7f3d0',
        padding: '0.35rem 1rem',
        fontSize: '0.78rem',
        color: '#065f46',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ 
            background: '#ffffff', 
            color: '#047857', 
            padding: '0.1rem 0.55rem', 
            borderRadius: '4px', 
            fontWeight: 800,
            border: '1px solid #a7f3d0'
          }}>
            MGMCET NOIDA SEC-62
          </span>
          <span style={{ fontWeight: 600 }}>Mahatma Gandhi Mission's College of Engineering & Technology • Student Lost & Found Portal</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('feed')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#ffffff',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            border: '2px solid var(--primary)',
            overflow: 'hidden'
          }}>
            <img
              src="/images/logo4.jpg"
              alt="MGMCET Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="brand-font" style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0f172a' }}>
                Campus<span style={{ color: 'var(--primary-dark)' }}>Finder</span>
              </span>
              <span className="badge badge-college" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                MGMCET
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.1 }}>
              Sector 62, Noida Campus
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          flex: '1',
          maxWidth: '420px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search items by name, lab, canteen, library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.6rem',
              borderRadius: 'var(--radius-full)',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'all var(--transition-fast)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.85rem',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Tab Navigation */}
          <button
            onClick={() => setActiveTab('feed')}
            className={`btn ${activeTab === 'feed' ? 'btn-ghost' : 'btn-outline'}`}
            style={{
              fontSize: '0.85rem',
              padding: '0.55rem 0.9rem',
              borderColor: activeTab === 'feed' ? 'var(--primary)' : '#e2e8f0',
              color: activeTab === 'feed' ? 'var(--primary-dark)' : '#475569',
              background: activeTab === 'feed' ? '#ecfdf5' : '#ffffff'
            }}
          >
            <Layers size={16} />
            <span>Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`btn ${activeTab === 'chats' ? 'btn-ghost' : 'btn-outline'}`}
            style={{
              position: 'relative',
              fontSize: '0.85rem',
              padding: '0.55rem 0.9rem',
              borderColor: activeTab === 'chats' ? 'var(--primary)' : '#e2e8f0',
              color: activeTab === 'chats' ? 'var(--primary-dark)' : '#475569',
              background: activeTab === 'chats' ? '#ecfdf5' : '#ffffff'
            }}
          >
            <MessageSquare size={16} />
            <span>Chats</span>
            {unreadChatCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--lost-color)',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff'
              }}>
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Post Item Action Button */}
          <button
            onClick={() => onOpenReportModal()}
            className="btn btn-primary"
            style={{
              fontSize: '0.86rem',
              padding: '0.55rem 1.1rem'
            }}
          >
            <PlusCircle size={18} />
            <span>Report Item</span>
          </button>

          {/* Notifications Popover */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                if (!showNotifMenu) onMarkNotificationsRead();
              }}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
              }}
            >
              <Bell size={18} />
              {unreadNotifs > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent-gold)'
                }} />
              )}
            </button>

            {showNotifMenu && (
              <div 
                className="glass-panel animate-modal-pop"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '320px',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                  padding: '1rem',
                  zIndex: 60
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>College Notifications</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{notifications.length} alerts</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id}
                        style={{
                          padding: '0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          background: n.read ? '#f8fafc' : '#ecfdf5',
                          border: '1px solid ' + (n.read ? '#e2e8f0' : '#a7f3d0'),
                          fontSize: '0.8rem'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.2rem' }}>{n.title}</div>
                        <div style={{ color: '#475569', lineHeight: 1.3 }}>{n.message}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.3rem' }}>{n.timestamp}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.3rem 0.6rem 0.3rem 0.35rem',
                borderRadius: 'var(--radius-full)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                userSelect: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.1 }}>
                  {currentUser.fullName.split(' ')[0]}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                  {currentUser.department.split(' ')[0]} ({currentUser.section})
                </span>
              </div>
              <ChevronDown size={14} color="#64748b" />
            </div>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div 
                className="glass-panel animate-modal-pop"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '280px',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
                  padding: '1rem',
                  zIndex: 60
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{currentUser.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{currentUser.collegeEmail}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                      Roll: {currentUser.rollNumber}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '0.6rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#475569',
                  border: '1px solid #e2e8f0'
                }}>
                  <div><strong>Department:</strong> {currentUser.department}</div>
                  <div><strong>Class & Sec:</strong> {currentUser.year} • Sec {currentUser.section}</div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button
                    onClick={() => {
                      setActiveTab('my-items');
                      setShowUserMenu(false);
                    }}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                  >
                    <UserIcon size={16} />
                    <span>My Reported Items</span>
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="btn btn-danger"
                    style={{ width: '100%', marginTop: '0.4rem', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
