import React, { useState, useEffect } from 'react';
import { 
  Search, 
  PlusCircle, 
  MessageSquare, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Layers, 
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import type { User, AppNotification } from '../types';

interface NavbarProps {
  currentUser: User;
  activeTab: 'feed' | 'chats' | 'my-items' | 'admin';
  setActiveTab: (tab: 'feed' | 'chats' | 'my-items' | 'admin') => void;
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
  const [isMobile, setIsMobile] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      {/* College Top Alert Bar (Light Green Theme) */}
      <div style={{
        background: 'linear-gradient(90deg, #ecfdf5 0%, #d1fae5 50%, #ecfdf5 100%)',
        borderBottom: '1px solid #a7f3d0',
        padding: '0.3rem 0.75rem',
        fontSize: '0.75rem',
        color: '#065f46',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ 
            background: '#ffffff', 
            color: '#047857', 
            padding: '0.1rem 0.45rem', 
            borderRadius: '4px', 
            fontWeight: 800,
            border: '1px solid #a7f3d0',
            fontSize: '0.68rem'
          }}>
            MGMCET NOIDA SEC-62
          </span>
          <span style={{ fontWeight: 600 }}>
            {isMobile ? 'Student Lost & Found Portal' : "Mahatma Gandhi Mission's College of Engineering & Technology • Student Lost & Found Portal"}
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '0.6rem 0.75rem' : '0.75rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '0.6rem' : '0'
      }}>
        {/* Top / Main Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          width: '100%'
        }}>
          {/* Brand / Logo */}
          <div 
            onClick={() => setActiveTab('feed')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#ffffff',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              border: '2px solid var(--primary)',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <img
                src="/images/logo4.jpg"
                alt="MGMCET Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="brand-font" style={{ fontSize: isMobile ? '1.15rem' : '1.28rem', fontWeight: 800, color: '#0f172a' }}>
                  Campus<span style={{ color: 'var(--primary-dark)' }}>Finder</span>
                </span>
                <span className="badge badge-college" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                  MGMCET
                </span>
              </div>
              {!isMobile && (
                <p style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.1 }}>
                  Sector 62, Noida Campus
                </p>
              )}
            </div>
          </div>

          {/* Desktop Search Bar */}
          {!isMobile && (
            <div style={{
              flex: '1',
              maxWidth: '380px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={17} style={{ position: 'absolute', left: '1rem', color: '#94a3b8' }} />
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
          )}

          {/* Actions & Profile Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.45rem' : '0.65rem' }}>
            {/* Desktop Navigation Tabs */}
            {!isMobile && (
              <>
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

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`btn ${activeTab === 'admin' ? 'btn-ghost' : 'btn-outline'}`}
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.55rem 0.9rem',
                      borderColor: activeTab === 'admin' ? 'var(--primary)' : '#a7f3d0',
                      color: activeTab === 'admin' ? '#065f46' : '#047857',
                      background: activeTab === 'admin' ? '#d1fae5' : '#ecfdf5',
                      fontWeight: 800
                    }}
                  >
                    <ShieldCheck size={16} color="var(--primary)" />
                    <span>Admin Panel</span>
                  </button>
                )}
              </>
            )}

            {/* Post Item Action Button */}
            <button
              onClick={() => onOpenReportModal()}
              className="btn btn-primary"
              style={{
                fontSize: isMobile ? '0.8rem' : '0.86rem',
                padding: isMobile ? '0.45rem 0.75rem' : '0.55rem 1.1rem'
              }}
            >
              <PlusCircle size={17} />
              <span>{isMobile ? 'Report' : 'Report Item'}</span>
            </button>

            {/* Notifications Popover */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  if (!showNotifMenu) onMarkNotificationsRead();
                }}
                style={{
                  width: '36px',
                  height: '36px',
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
                title="Notifications"
              >
                <Bell size={17} />
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
                    top: '44px',
                    width: '300px',
                    maxWidth: '90vw',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
                    padding: '1rem',
                    zIndex: 60
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Notifications</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{notifications.length} alerts</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxHeight: '260px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id}
                          style={{
                            padding: '0.55rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: n.read ? '#f8fafc' : '#ecfdf5',
                            border: '1px solid ' + (n.read ? '#e2e8f0' : '#a7f3d0'),
                            fontSize: '0.78rem'
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.15rem' }}>{n.title}</div>
                          <div style={{ color: '#475569', lineHeight: 1.3 }}>{n.message}</div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.25rem' }}>{n.timestamp}</div>
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
                  gap: '0.4rem',
                  padding: isMobile ? '2px' : '0.3rem 0.6rem 0.3rem 0.35rem',
                  borderRadius: 'var(--radius-full)',
                  background: isMobile ? 'transparent' : '#ffffff',
                  border: isMobile ? 'none' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                  userSelect: 'none',
                  boxShadow: isMobile ? 'none' : '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--primary)' }}
                />
                {!isMobile && (
                  <>
                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.1 }}>
                        {currentUser.fullName.split(' ')[0]}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                        {currentUser.department.split(' ')[0]} ({currentUser.section})
                      </span>
                    </div>
                    <ChevronDown size={14} color="#64748b" />
                  </>
                )}
              </div>

              {/* Profile Dropdown */}
              {showUserMenu && (
                <div 
                  className="glass-panel animate-modal-pop"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '44px',
                    width: '280px',
                    maxWidth: '90vw',
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
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.fullName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.collegeEmail}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                        Roll: {currentUser.rollNumber}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '0.6rem',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '0.75rem',
                    fontSize: '0.74rem',
                    color: '#475569',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div><strong>Department:</strong> {currentUser.department}</div>
                    <div><strong>Class & Sec:</strong> {currentUser.year} • Sec {currentUser.section}</div>
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setShowUserMenu(false);
                        }}
                        className="btn"
                        style={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          fontSize: '0.82rem',
                          padding: '0.45rem 0.75rem',
                          background: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          fontWeight: 700
                        }}
                      >
                        <ShieldCheck size={16} />
                        <span>Admin Panel</span>
                      </button>
                    )}

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
                      onClick={onLogout}
                      className="btn btn-danger"
                      style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Row 2: Search Input & Tabs Bar */}
        {isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            {/* Mobile Search Input */}
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search items, canteen, library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem 0.55rem 2.4rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.84rem',
                  outline: 'none',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile Navigation Tabs Pills */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: currentUser.role === 'admin' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
              background: '#f1f5f9',
              borderRadius: 'var(--radius-full)',
              padding: '3px',
              border: '1px solid #e2e8f0',
              gap: '2px'
            }}>
              <button
                onClick={() => setActiveTab('feed')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  padding: '0.45rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'feed' ? '#ffffff' : 'transparent',
                  color: activeTab === 'feed' ? 'var(--primary-dark)' : '#64748b',
                  boxShadow: activeTab === 'feed' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <Layers size={14} />
                <span>Feed</span>
              </button>

              <button
                onClick={() => setActiveTab('chats')}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  padding: '0.45rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'chats' ? '#ffffff' : 'transparent',
                  color: activeTab === 'chats' ? 'var(--primary-dark)' : '#64748b',
                  boxShadow: activeTab === 'chats' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <MessageSquare size={14} />
                <span>Chats</span>
                {unreadChatCount > 0 && (
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: 'var(--lost-color)',
                    display: 'inline-block'
                  }} />
                )}
              </button>

              <button
                onClick={() => setActiveTab('my-items')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  padding: '0.45rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'my-items' ? '#ffffff' : 'transparent',
                  color: activeTab === 'my-items' ? 'var(--primary-dark)' : '#64748b',
                  boxShadow: activeTab === 'my-items' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <UserIcon size={14} />
                <span>My Posts</span>
              </button>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    padding: '0.45rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeTab === 'admin' ? '#ffffff' : 'transparent',
                    color: activeTab === 'admin' ? '#059669' : '#64748b',
                    boxShadow: activeTab === 'admin' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
