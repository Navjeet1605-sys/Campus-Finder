import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MapPin, 
  User as UserIcon, 
  ShieldCheck, 
  MessageSquare
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0] || null;

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
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#ecfdf5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          border: '1px solid #a7f3d0'
        }}>
          <MessageSquare size={32} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          MGMCET Student Chat Messenger
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Sign in with your official college email to directly message students who found or reported lost items.
        </p>
        <button onClick={onOpenAuthModal} className="btn btn-primary" style={{ padding: '0.8rem 1.6rem' }}>
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
        height: 'calc(100vh - 160px)',
        minHeight: '580px',
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.08)'
      }}
    >
      {/* LEFT PANE: THREADS LIST (Light Green & Soft Grey) */}
      <div style={{
        background: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '1.2rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
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
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              No active conversations yet. Click "Chat & Verify" on any item in the feed to start messaging!
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
                    padding: '0.85rem',
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
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
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

      {/* RIGHT PANE: ACTIVE CONVERSATION */}
      {activeThread ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
          {/* Top Bar with Student Info */}
          <div style={{
            padding: '0.9rem 1.25rem',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                fontSize: '0.9rem'
              }}>
                {(activeThread.founderId === currentUser.id ? activeThread.claimantName : activeThread.founderName).charAt(0)}
              </div>

              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  {activeThread.founderId === currentUser.id ? activeThread.claimantName : activeThread.founderName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                  MGMCET Verified Student • Active Now
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-college" style={{ fontSize: '0.72rem' }}>
                Campus Verified Chat
              </span>
            </div>
          </div>

          {/* Subheader: Item Banner pinned */}
          <div style={{
            padding: '0.65rem 1.25rem',
            background: '#ecfdf5',
            borderBottom: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <img
                src={activeThread.itemImage}
                alt={activeThread.itemTitle}
                style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #a7f3d0' }}
              />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                  Item: {activeThread.itemTitle}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={11} color="var(--primary)" />
                  {activeThread.itemLocation}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
              Cross-check serials/stickers before handover
            </div>
          </div>

          {/* Messages Feed */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            background: '#ffffff'
          }}>
            {/* Safety Alert inside chat */}
            <div style={{
              margin: '0.5rem auto 1rem',
              maxWidth: '480px',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              fontSize: '0.74rem',
              color: '#475569'
            }}>
              <ShieldCheck size={14} color="var(--primary)" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              MGMCET Campus Safety: Confirm specific details (scratches, lock codes, wallpapers) before meeting.
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
                    gap: '0.6rem'
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: isMe ? 'var(--primary)' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isMe ? '#ffffff' : '#334155',
                    flexShrink: 0
                  }}>
                    {msg.senderName.charAt(0)}
                  </div>

                  <div style={{
                    maxWidth: '70%',
                    padding: '0.75rem 1rem',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMe ? 'var(--primary-gradient)' : '#f1f5f9',
                    border: isMe ? 'none' : '1px solid #e2e8f0',
                    color: isMe ? '#ffffff' : '#0f172a',
                    boxShadow: isMe ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: isMe ? 'rgba(255,255,255,0.9)' : 'var(--primary-dark)', fontWeight: 700, marginBottom: '0.2rem' }}>
                      {isMe ? 'You' : msg.senderName}
                    </div>

                    <div style={{ fontSize: '0.86rem', lineHeight: 1.45, wordBreak: 'break-word' }}>
                      {msg.text}
                    </div>

                    <div style={{ fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.8)' : '#94a3b8', textAlign: 'right', marginTop: '0.35rem' }}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div style={{
            padding: '0.5rem 1.25rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '0.45rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
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
              padding: '0.85rem 1.25rem',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <input
              type="text"
              placeholder={`Message ${activeThread.founderId === currentUser.id ? activeThread.claimantName : activeThread.founderName}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
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
          background: '#ffffff'
        }}>
          <MessageSquare size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.7 }} />
          <h3 style={{ color: '#0f172a' }}>Select a conversation to start chatting</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Coordinate item verification and safe campus handover spots.
          </p>
        </div>
      )}
    </div>
  );
};
