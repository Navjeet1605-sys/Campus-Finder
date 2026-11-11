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
import { BottomNav } from './components/BottomNav';
import { ToastProvider, toast } from './components/Toast';
import type { User, Item, ChatThread, AppNotification, ItemType, HandoverRecord } from './types';
import {
  dbFetchItems,
  dbCreateItem,
  dbUpdateItemStatus,
  dbVerifyItem,
  dbConfirmHandover,
  dbDeleteItem,
  dbFetchRegisteredStudents,
  dbDeleteStudent,
  dbFetchChatThreads,
  dbCreateChatThread,
  dbSendMessage,
  dbSubscribeToItems,
  dbSubscribeToMessages,
  dbSubscribeToChatThreads
} from './services/dbService';
import { playNotificationChime } from './lib/sound';

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

  // Toast Notification & Loading state
  const [itemsLoading, setItemsLoading] = useState(true);

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
    toast.success(msg);
  };

  // Keyboard Shortcuts: '/' to search, 'Esc' to dismiss modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement).isContentEditable
      );

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        const searchInput = document.getElementById('campus-search-input');
        if (searchInput) {
          searchInput.focus();
        } else {
          const mobileInput = document.getElementById('campus-search-input-mobile');
          mobileInput?.focus();
        }
      } else if (e.key === 'Escape') {
        if (selectedItemForDetail) {
          setSelectedItemForDetail(null);
        } else if (reportModalOpen) {
          setReportModalOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemForDetail, reportModalOpen]);

  // 1. Initial Load from Supabase + Realtime Subscription
  useEffect(() => {
    const loadItemsFromDb = async () => {
      try {
        const cloudItems = await dbFetchItems();
        if (cloudItems && cloudItems.length > 0) {
          setItems(cloudItems);
        }
      } catch (err) {
        console.warn('Initial item fetch fallback to local storage:', err);
      } finally {
        setItemsLoading(false);
      }
    };

    loadItemsFromDb();

    // Subscribe to realtime item changes (inserts, updates, claims)
    const unsubscribe = dbSubscribeToItems(async () => {
      const refreshed = await dbFetchItems();
      setItems(refreshed);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Load User Chat Threads + Realtime Message & Thread Listeners
  useEffect(() => {
    if (!currentUser) return;

    // Load initial user threads
    const loadUserChats = async () => {
      try {
        const userThreads = await dbFetchChatThreads(currentUser.id);
        if (userThreads && userThreads.length > 0) {
          setThreads(userThreads);
        }
      } catch (err) {
        console.warn('Chat threads fetch fallback:', err);
      }
    };
    loadUserChats();

    // Realtime listener for incoming messages from other students
    const unsubscribeMessages = dbSubscribeToMessages(({ threadId, message }) => {
      const isFromMe = message.senderId === currentUser.id;

      setThreads(prev => {
        const threadExists = prev.some(t => t.id === threadId);
        if (!threadExists) {
          // A new thread was created with current user, reload from db
          dbFetchChatThreads(currentUser.id).then(fresh => setThreads(fresh));
          return prev;
        }

        return prev.map(t => {
          if (t.id === threadId) {
            // Deduplicate if already present
            if (t.messages.some(m => m.id === message.id)) return t;

            const isViewingThisThread = activeTab === 'chats' && activeChatThreadId === threadId;
            const newUnread = isFromMe || isViewingThisThread ? 0 : (t.unreadCount || 0) + 1;

            return {
              ...t,
              messages: [...t.messages, message],
              lastUpdated: message.timestamp,
              unreadCount: newUnread
            };
          }
          return t;
        });
      });

      // If the message is from another student and we are not currently viewing that chat
      const isViewingThisThread = activeTab === 'chats' && activeChatThreadId === threadId;
      if (!isFromMe && !isViewingThisThread) {
        playNotificationChime();
        showToast(`💬 ${message.senderName}: "${message.text.slice(0, 32)}${message.text.length > 32 ? '...' : ''}"`);

        const newNotif: AppNotification = {
          id: `notif_${Date.now()}`,
          title: `Message from ${message.senderName}`,
          message: message.text,
          timestamp: 'Just now',
          read: false,
          type: 'chat'
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    });

    // Realtime listener for thread creation / updates
    const unsubscribeThreads = dbSubscribeToChatThreads(currentUser.id, async () => {
      const fresh = await dbFetchChatThreads(currentUser.id);
      setThreads(fresh);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeThreads();
    };
  }, [currentUser, activeTab, activeChatThreadId]);

  // 3. Load Registered Students for Proctor Admin Panel
  useEffect(() => {
    if (activeTab === 'admin') {
      const loadStudents = async () => {
        try {
          const students = await dbFetchRegisteredStudents();
          setStudentsList(students);
        } catch (err) {
          console.warn('Student list fetch fallback:', err);
        }
      };
      loadStudents();
    }
  }, [activeTab]);

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Welcome ${user.fullName}! Connected to MGMCET Campus Finder.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('feed');
    setThreads([]);
    setActiveChatThreadId(null);
    localStorage.removeItem('mgmcet_chats');
    showToast('You have been logged out.');
  };

  // Item Handlers
  const handleCreateItem = async (newItem: Item) => {
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

    // Persist to Supabase Cloud
    await dbCreateItem(newItem);
  };

  const handleMarkResolved = async (item: Item) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'claimed' } : i));
    if (selectedItemForDetail?.id === item.id) {
      setSelectedItemForDetail({ ...selectedItemForDetail, status: 'claimed' });
    }
    showToast(`"${item.title}" marked as successfully reunited.`);

    // Persist to Supabase
    await dbUpdateItemStatus(item.id, 'claimed');
  };

  const handleDeleteItem = async (itemId: string) => {
    const targetItem = items.find(i => i.id === itemId);
    if (currentUser?.role !== 'admin' && targetItem && targetItem.reportedBy.id !== currentUser?.id) {
      showToast('Unauthorized: You can only delete your own listings.');
      return;
    }

    setItems(prev => prev.filter(i => i.id !== itemId));
    showToast('Item listing removed.');

    // Persist to Supabase
    await dbDeleteItem(itemId);
  };

  // Admin Verification & Handover Certification Handlers
  const handleVerifyItem = async (itemId: string, status: 'verified' | 'pending' | 'flagged') => {
    if (currentUser?.role !== 'admin') {
      showToast('Unauthorized: Proctor privileges required.');
      return;
    }
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, adminVerification: status } : item));
    showToast(status === 'verified' ? 'Item verified by Proctor.' : status === 'flagged' ? 'Item flagged for review.' : 'Verification set to pending.');

    // Persist to Supabase
    await dbVerifyItem(itemId, status);
  };

  const handleConfirmHandover = async (itemId: string, record: HandoverRecord) => {
    if (currentUser?.role !== 'admin') {
      showToast('Unauthorized: Proctor privileges required.');
      return;
    }
    setItems(prev => prev.map(item => item.id === itemId ? {
      ...item,
      status: 'claimed',
      adminVerification: 'verified',
      handoverDetails: record
    } : item));
    showToast(`Handover officially certified and recorded for student ${record.handedToName}.`);

    // Persist to Supabase
    await dbConfirmHandover(itemId, record);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Unauthorized: Proctor privileges required.');
      return;
    }
    const updated = studentsList.filter(s => s.id !== studentId);
    setStudentsList(updated);
    showToast('Student account record removed.');

    // Persist to Supabase
    await dbDeleteStudent(studentId);
  };

  // Direct Chat Handler
  const handleStartChatWithItem = async (item: Item) => {
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

      // Persist thread to Supabase
      await dbCreateChatThread(newThread);
    } else {
      setActiveChatThreadId(existingThread.id);
    }

    setActiveTab('chats');
  };

  const handleSendMessage = async (threadId: string, text: string, isProof?: boolean) => {
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

    // Persist message to Supabase
    await dbSendMessage(threadId, newMsg);
  };

  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleSelectThread = (threadId: string) => {
    setActiveChatThreadId(threadId);
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unreadCount: 0 } : t));
  };

  const unreadChatCount = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  // FIRST REQUIREMENT:
  // When the student enters the site, ONLY Login & Register page is available at the center.
  // There is NO extra page, navbar, feed, or footer open!
  if (!currentUser) {
    return (
      <ToastProvider>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        </div>
      </ToastProvider>
    );
  }

  // Once authenticated, render the full CampusFinder portal:
  return (
    <ToastProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
          unreadChatCount={unreadChatCount}
          notifications={notifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
        />

        {/* Main Body */}
        <main className="campus-main-content" style={{ 
          flex: 1, 
          maxWidth: '1280px', 
          margin: '0 auto', 
          width: '100%', 
          padding: '1.5rem 1.25rem'
        }}>
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
                  isLoading={itemsLoading}
                />
              </div>
            </>
          )}

        {activeTab === 'chats' && (
          <ChatMessenger
            threads={threads}
            activeThreadId={activeChatThreadId}
            onSelectThread={handleSelectThread}
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
              handleSelectThread(threadId);
              setActiveTab('chats');
            }}
          />
        )}

        {activeTab === 'admin' && (
          currentUser.role === 'admin' ? (
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
          ) : (
            <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '580px', margin: '3rem auto', borderRadius: 'var(--radius-lg)', background: '#ffffff', border: '1px solid #fecdd3' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🔒</span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e11d48', marginBottom: '0.5rem' }}>
                Access Restricted
              </h2>
              <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Only verified college proctors and administrators with designated roles can access the custody management console.
              </p>
              <button 
                onClick={() => setActiveTab('feed')} 
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.6rem' }}
              >
                Return to Campus Feed
              </button>
            </div>
          )
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

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={(type) => {
          setReportModalType(type);
          setReportModalOpen(true);
        }}
        unreadChatCount={unreadChatCount}
        isAdmin={currentUser.role === 'admin'}
        onSearchClick={() => {
          const mobileInput = document.getElementById('campus-search-input-mobile');
          if (mobileInput) {
            mobileInput.focus();
          } else {
            const deskInput = document.getElementById('campus-search-input');
            deskInput?.focus();
          }
        }}
      />
    </div>
  </ToastProvider>
  );
};

export default App;
