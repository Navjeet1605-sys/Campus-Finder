import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ItemFeed } from './components/ItemFeed';
import { ReportItemModal } from './components/ReportItemModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ChatMessenger } from './components/ChatMessenger';
import { MyActivity } from './components/MyActivity';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import type { User, Item, ChatThread, AppNotification, ItemType, HandoverRecord } from './types';
import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  // Current user state: starts as null if not logged in.
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mgmcet_current_student');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Items State (No false/fake data: only items posted by students)
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const saved = localStorage.getItem('mgmcet_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Chat threads State (No false data: only real conversations created by students)
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem('mgmcet_chats');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('mgmcet_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Registered students roster for proctor inspection
  const [studentsList, setStudentsList] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('mgmcet_registered_students');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active view tab: 'feed' | 'chats' | 'my-items' | 'admin'
  const [activeTab, setActiveTab] = useState<'feed' | 'chats' | 'my-items' | 'admin'>('feed');
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<ItemType>('found');
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<Item | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mgmcet_current_student', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mgmcet_current_student');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mgmcet_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('mgmcet_chats', JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem('mgmcet_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Welcome ${user.fullName}! Connected to MGMCET Campus Finder.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('feed');
    showToast('You have been logged out.');
  };

  // Item Handlers
  const handleCreateItem = (newItem: Item) => {
    setItems(prev => [newItem, ...prev]);
    showToast(`Your ${newItem.type === 'found' ? 'Found' : 'Lost'} item report has been published!`);

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: `Report Published: ${newItem.title.slice(0, 25)}...`,
      message: `Your item was posted to MGMCET Campus Finder. Students can view details and chat with you.`,
      timestamp: 'Just now',
      read: false,
      itemId: newItem.id,
      type: 'system'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkResolved = (item: Item) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'claimed' } : i));
    if (selectedItemForDetail?.id === item.id) {
      setSelectedItemForDetail({ ...selectedItemForDetail, status: 'claimed' });
    }
    showToast(`"${item.title}" marked as successfully reunited.`);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
    showToast('Item listing removed.');
  };

  // Admin Verification & Handover Certification Handlers
  const handleVerifyItem = (itemId: string, status: 'verified' | 'pending' | 'flagged') => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, adminVerification: status } : item));
    showToast(status === 'verified' ? 'Item verified by Proctor.' : status === 'flagged' ? 'Item flagged for review.' : 'Verification set to pending.');
  };

  const handleConfirmHandover = (itemId: string, record: HandoverRecord) => {
    setItems(prev => prev.map(item => item.id === itemId ? {
      ...item,
      status: 'claimed',
      adminVerification: 'verified',
      handoverDetails: record
    } : item));
    showToast(`Handover officially certified and recorded for student ${record.handedToName}.`);
  };

  const handleDeleteStudent = (studentId: string) => {
    const updated = studentsList.filter(s => s.id !== studentId);
    setStudentsList(updated);
    localStorage.setItem('mgmcet_registered_students', JSON.stringify(updated));
    showToast('Student account record removed.');
  };

  // Re-sync students list when switching to admin tab
  useEffect(() => {
    if (activeTab === 'admin') {
      try {
        const saved = localStorage.getItem('mgmcet_registered_students');
        if (saved) setStudentsList(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, [activeTab]);

  // Direct Chat Handler
  const handleStartChatWithItem = (item: Item) => {
    if (!currentUser) return;

    if (item.reportedBy.id === currentUser.id) {
      showToast('You are the author of this post.');
      return;
    }

    let existingThread = threads.find(
      t => t.itemId === item.id &&
      ((t.founderId === item.reportedBy.id && t.claimantId === currentUser.id) ||
       (t.founderId === currentUser.id && t.claimantId === item.reportedBy.id))
    );

    if (!existingThread) {
      const newThread: ChatThread = {
        id: `chat_${Date.now()}`,
        itemId: item.id,
        itemTitle: item.title,
        itemImage: item.imageUrl,
        itemType: item.type,
        itemLocation: item.location,
        founderId: item.reportedBy.id,
        founderName: item.reportedBy.fullName,
        claimantId: currentUser.id,
        claimantName: currentUser.fullName,
        messages: [
          {
            id: `msg_init_${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.fullName,
            senderAvatar: currentUser.avatar,
            text: `Hi ${item.reportedBy.fullName.split(' ')[0]}! I saw your post on Campus Finder about "${item.title}". I would like to verify and coordinate handover.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ],
        lastUpdated: 'Just now'
      };

      setThreads(prev => [newThread, ...prev]);
      setActiveChatThreadId(newThread.id);
    } else {
      setActiveChatThreadId(existingThread.id);
    }

    setActiveTab('chats');
  };

  const handleSendMessage = (threadId: string, text: string, isProof?: boolean) => {
    if (!currentUser) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isProofAttachment: isProof
    };

    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          messages: [...t.messages, newMsg],
          lastUpdated: newMsg.timestamp
        };
      }
      return t;
    }));
  };

  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // FIRST REQUIREMENT:
  // When the student enters the site, ONLY Login & Register page is available at the center.
  // There is NO extra page, navbar, feed, or footer open!
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {toastMessage && (
          <div 
            className="animate-fade-in"
            style={{
              position: 'fixed',
              top: '24px',
              background: '#ffffff',
              border: '2px solid var(--primary)',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.25)',
              color: '#0f172a',
              padding: '0.8rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.88rem',
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={19} color="var(--primary)" />
            <span>{toastMessage}</span>
          </div>
        )}
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Once authenticated, render the full CampusFinder portal:
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#ffffff',
            border: '2px solid var(--primary)',
            boxShadow: '0 12px 35px rgba(16, 185, 129, 0.25)',
            color: '#0f172a',
            padding: '0.9rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.88rem',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={20} color="var(--primary)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={(type) => {
          setReportModalType(type || 'found');
          setReportModalOpen(true);
        }}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadChatCount={0}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* Main Body */}
      <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '1.5rem 1.25rem' }}>
        {activeTab === 'feed' && (
          <>
            <HeroBanner
              items={items}
              onOpenReportModal={(type) => {
                setReportModalType(type);
                setReportModalOpen(true);
              }}
              onExploreFeed={() => {
                const el = document.getElementById('campus-feed-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <div id="campus-feed-section">
              <ItemFeed
                items={items}
                currentUser={currentUser}
                onViewDetails={(item) => setSelectedItemForDetail(item)}
                onOpenChat={handleStartChatWithItem}
                onOpenReportModal={() => {
                  setReportModalType('found');
                  setReportModalOpen(true);
                }}
                searchQuery={searchQuery}
              />
            </div>
          </>
        )}

        {activeTab === 'chats' && (
          <ChatMessenger
            threads={threads}
            activeThreadId={activeChatThreadId}
            onSelectThread={(id) => setActiveChatThreadId(id)}
            onSendMessage={handleSendMessage}
            currentUser={currentUser}
            onOpenAuthModal={() => {}}
            items={items}
          />
        )}

        {activeTab === 'my-items' && (
          <MyActivity
            currentUser={currentUser}
            items={items}
            threads={threads}
            onOpenReportModal={(type) => {
              setReportModalType(type || 'found');
              setReportModalOpen(true);
            }}
            onOpenAuthModal={() => {}}
            onViewDetails={(item) => setSelectedItemForDetail(item)}
            onOpenChat={handleStartChatWithItem}
            onDeleteMyItem={handleDeleteItem}
            onOpenChatThread={(threadId) => {
              setActiveChatThreadId(threadId);
              setActiveTab('chats');
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            items={items}
            registeredStudents={studentsList}
            onVerifyItem={handleVerifyItem}
            onDeleteItem={handleDeleteItem}
            onConfirmHandover={handleConfirmHandover}
            onDeleteStudentAccount={handleDeleteStudent}
            onViewItem={(item: Item) => setSelectedItemForDetail(item)}
            onBackToFeed={() => setActiveTab('feed')}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* College Footer */}
      <Footer
        onOpenReportModal={(type) => {
          setReportModalType(type || 'found');
          setReportModalOpen(true);
        }}
        onOpenAuthModal={() => {}}
      />

      {/* Modals */}
      <ReportItemModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        currentUser={currentUser}
        onOpenAuthModal={() => {}}
        onSubmitItem={handleCreateItem}
        initialType={reportModalType}
      />

      <ItemDetailModal
        item={selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        currentUser={currentUser}
        onOpenChat={handleStartChatWithItem}
        onMarkResolved={handleMarkResolved}
      />
    </div>
  );
};

export default App;
