import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MapPin, 
  User as UserIcon, 
  ShieldCheck, 
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import type { ChatThread, User, Item } from '../types';

interface ChatMessengerProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onSendMessage: (threadId: string, text: string, isProof?: boolean) => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  items: Item[];
}

const QUICK_CAMPUS_PROMPTS = [
  'Hi! I lost this item on campus. Can we meet to verify?',
  'Can you meet near the Canteen Nescafe counter during lunch?',
  'I am near Central Library 2nd Floor right now.',
  'Let us meet at Gate 1 Security Cabin at 4:30 PM.',
  'I have my MGMCET College ID card to verify my identity!'
];

export const ChatMessenger: React.FC<ChatMessengerProps> = ({
  threads,
  activeThreadId,
  onSelectThread,
  onSendMessage,
  currentUser,
  onOpenAuthModal
}) => {
  const [inputText, setInputText] = useState('');
  const [isMobile, setIsMobile] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine active thread
  const activeThread = activeThreadId
    ? threads.find(t => t.id === activeThreadId) || null
    : (!isMobile ? (threads[0] || null) : null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  if (!currentUser) {
    return (
      <div 
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '4rem 2rem',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '2rem auto',
          background: '#ffffff',
          border: '1px solid rgba(16, 185, 129, 0.25)'
        }}
      >
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: '#ecfdf5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          border: '1px solid #a7f3d0'
        }}>
          <MessageSquare size={34} color="var(--primary)" />
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem' }}>
          MGMCET Campus Handover Chat
        </h2>

        <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.8rem' }}>
          Sign in with your official college credentials to coordinate safe campus handovers, verify secret item marks, and communicate directly with fellow students.
        </p>

        <button 
          onClick={onOpenAuthModal} 
          className="btn btn-primary" 
          style={{ padding: '0.8rem 1.6rem' }}
        >
          <UserIcon size={18} />
          <span>Student Sign In</span>
        </button>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread) return;
    onSendMessage(activeThread.id, inputText.trim());
    setInputText('');
  };

  const handleQuickPromptClick = (prompt: string) => {
    if (!activeThread) return;
    onSendMessage(activeThread.id, prompt);
  };

  return (
    <div 
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-lg)',
        height: isMobile ? 'calc(100dvh - 140px)' : 'calc(100vh - 160px)',
        minHeight: isMobile ? '460px' : '580px',
        display: isMobile ? 'flex' : 'grid',
        flexDirection: isMobile ? 'column' : undefined,
        gridTemplateColumns: isMobile ? undefined : '320px minmax(0, 1fr)',
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.08)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* LEFT PANE: THREADS LIST (Hidden on mobile if a thread is active) */}
      {(!isMobile || !activeThread) && (
        <div style={{
          background: '#f8fafc',
          borderRight: isMobile ? 'none' : '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          width: isMobile ? '100%' : '320px',
          height: '100%',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff'
          }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Conversations
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Direct Student Peer Chat
              </span>
            </div>
            <span className="badge badge-college" style={{ fontSize: '0.7rem' }}>
              {threads.length} Active
            </span>
          </div>

          {/* Thread items scroll */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem' }}>
            {threads.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                <MessageSquare size={36} color="var(--primary)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>No Conversations Yet</p>
                <p>Click "Chat & Verify" on any item in the feed to start messaging the student!</p>
              </div>
            ) : (
              threads.map((thread) => {
                const isSelected = activeThread?.id === thread.id;
                const otherStudentName = thread.founderId === currentUser.id ? thread.claimantName : thread.founderName;
                const lastMsg = thread.messages[thread.messages.length - 1];

                return (
                  <div
                    key={thread.id}
                    onClick={() => onSelectThread(thread.id)}
                    style={{
                      padding: '0.8rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? '#ecfdf5' : '#ffffff',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid #e2e8f0',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                      boxShadow: isSelected ? '0 2px 8px rgba(16, 185, 129, 0.15)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: '#e2e8f0',
                      position: 'relative',
                      border: '1px solid #cbd5e1'
                    }}>
                      <img
                        src={thread.itemImage}
                        alt={thread.itemTitle}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {otherStudentName}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', flexShrink: 0 }}>
                          {thread.lastUpdated}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.74rem', color: 'var(--primary-dark)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.2rem' }}>
                        {thread.itemTitle}
                      </div>

                      <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lastMsg ? lastMsg.text : 'No messages yet'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* RIGHT PANE: ACTIVE CONVERSATION */}
      {(!isMobile || activeThread) && (
        activeThread ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: '#ffffff',
            flex: 1,
            minWidth: 0,
            width: '100%',
            overflow: 'hidden'
          }}>
            {/* Top Bar with Student Info */}
            <div style={{
              padding: '0.75rem 1rem',
              background: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              minWidth: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                {/* Mobile Back Button */}
                {isMobile && (
                  <button
                    onClick={() => onSelectThread('')}
                    className="btn btn-ghost"
                    style={{
                      padding: '0.4rem 0.65rem',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      flexShrink: 0
                    }}
                    title="Back to conversations"
                  >
                    <ArrowLeft size={16} />
                    <span>Chats</span>
                  </button>
                )}

                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}>
                  {(activeThread.founderId === currentUser.id ? activeThread.claimantName : activeThread.founderName).charAt(0)}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeThread.founderId === currentUser.id ? activeThread.claimantName : activeThread.founderName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>MGMCET Student • Active</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <span className="badge badge-college" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
                  Verified
                </span>
              </div>
            </div>

            {/* Subheader: Item Banner pinned */}
            <div style={{
              padding: '0.6rem 1rem',
              background: '#ecfdf5',
              borderBottom: '1px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.6rem',
              minWidth: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                <img
                  src={activeThread.itemImage}
                  alt={activeThread.itemTitle}
                  style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #a7f3d0', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Item: {activeThread.itemTitle}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <MapPin size={11} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <span>{activeThread.itemLocation}</span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--primary-dark)', fontWeight: 600, flexShrink: 0, textAlign: 'right' }}>
                Handover on campus
              </div>
            </div>

            {/* Messages Feed */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: isMobile ? '1rem 0.75rem' : '1.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9rem',
              background: '#ffffff',
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box'
            }}>
              {/* Safety Alert inside chat */}
              <div style={{
                margin: '0.25rem auto 0.75rem',
                maxWidth: '480px',
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                fontSize: '0.73rem',
                color: '#475569',
                lineHeight: 1.45,
                boxSizing: 'border-box'
              }}>
                <ShieldCheck size={14} color="var(--primary)" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                MGMCET Safety: Verify unique item marks (stickers, scratches, wallpapers) before meeting.
              </div>

              {activeThread.messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: isMe ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                      gap: '0.55rem',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* User Avatar Circle */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isMe ? '#059669' : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: isMe ? '#ffffff' : '#334155',
                      flexShrink: 0,
                      border: isMe ? '1px solid #047857' : '1px solid #cbd5e1'
                    }}>
                      {msg.senderName.charAt(0)}
                    </div>

                    {/* Message Bubble - 100% visible, high-contrast, fully contained */}
                    <div style={{
                      maxWidth: isMobile ? '82%' : '75%',
                      minWidth: '120px',
                      padding: '0.8rem 1.05rem',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMe ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : '#f8fafc',
                      border: isMe ? '1px solid #047857' : '1px solid #e2e8f0',
                      color: isMe ? '#ffffff' : '#0f172a',
                      boxShadow: isMe ? '0 4px 14px rgba(5, 150, 105, 0.22)' : '0 2px 6px rgba(0,0,0,0.02)',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      boxSizing: 'border-box'
                    }}>
                      {/* Sender & Timestamp Header */}
                      <div style={{
                        fontSize: '0.72rem',
                        color: isMe ? '#d1fae5' : 'var(--primary-dark)',
                        fontWeight: 800,
                        marginBottom: '0.3rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}>
                        <span>{isMe ? 'You' : msg.senderName}</span>
                        <span style={{
                          fontSize: '0.66rem',
                          color: isMe ? 'rgba(255, 255, 255, 0.88)' : '#94a3b8',
                          fontWeight: 500
                        }}>
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Main Message Text */}
                      <div style={{
                        fontSize: '0.92rem',
                        lineHeight: 1.5,
                        fontWeight: isMe ? 500 : 400,
                        color: isMe ? '#ffffff' : '#0f172a',
                        letterSpacing: '0.01em'
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Chips */}
            <div style={{
              padding: '0.5rem 0.85rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '0.45rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              WebkitOverflowScrolling: 'touch'
            }}>
              {QUICK_CAMPUS_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickPromptClick(prompt)}
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Bottom Message Input Bar */}
            <form
              onSubmit={handleSend}
              style={{
                padding: '0.75rem 1rem',
                background: '#ffffff',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                width: '100%',
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <input
                type="text"
                placeholder={`Message ${activeThread.founderId === currentUser.id ? activeThread.claimantName : activeThread.founderName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="btn btn-primary"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  padding: 0,
                  flexShrink: 0,
                  opacity: inputText.trim() ? 1 : 0.5,
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: '#64748b',
            textAlign: 'center',
            background: '#ffffff',
            flex: 1,
            minWidth: 0
          }}>
            <MessageSquare size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.7 }} />
            <h3 style={{ color: '#0f172a' }}>Select a conversation to start chatting</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Coordinate item verification and safe campus handover spots.
            </p>
          </div>
        )
      )}
    </div>
  );
};
