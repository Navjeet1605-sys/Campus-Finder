import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  ShieldAlert, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import type { Item, ItemCategory, ItemType, User } from '../types';
import { CAMPUS_LOCATIONS } from '../data/mockData';

interface ReportItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onSubmitItem: (newItem: Item) => void;
  initialType?: ItemType;
}

const CATEGORIES: ItemCategory[] = [
  'Electronics & Gadgets',
  'ID Cards & Documents',
  'Keys & Keychains',
  'Bags & Wallets',
  'Books, Notes & Stationery',
  'Clothing & Footwear',
  'Bottles & Lunchboxes',
  'Others'
];

const PRESET_PHOTOS = [
  { label: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80' },
  { label: 'ID Card / Lanyard', url: 'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?w=800&auto=format&fit=crop&q=80' },
  { label: 'Earbuds', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80' },
  { label: 'Bike Keys', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80' },
  { label: 'Laptop Charger', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80' },
  { label: 'College Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80' },
  { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80' }
];

export const ReportItemModal: React.FC<ReportItemModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuthModal,
  onSubmitItem,
  initialType = 'found'
}) => {
  const [itemType, setItemType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics & Gadgets');
  const [location, setLocation] = useState(CAMPUS_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('11:30 AM');
  const [description, setDescription] = useState('');
  const [secretHint, setSecretHint] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS[0].url);
  const [imagePreview, setImagePreview] = useState<string>(PRESET_PHOTOS[0].url);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      onOpenAuthModal();
      return;
    }

    if (!title.trim()) {
      setError('Please provide a title for the item.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a short description.');
      return;
    }

    const finalLocation = customLocation.trim() || location;

    const newItem: Item = {
      id: `item_${Date.now()}`,
      title: title.trim(),
      category,
      type: itemType,
      description: description.trim(),
      location: finalLocation,
      date,
      time,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80',
      status: 'active',
      reportedBy: currentUser,
      secretVerificationHint: secretHint.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onSubmitItem(newItem);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
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
          maxWidth: '680px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-lg)',
          background: '#ffffff',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.18)',
          position: 'relative',
          padding: '2rem'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img
            src="/images/logo4.jpg"
            alt="MGMCET Logo"
            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'contain', background: '#ffffff', padding: '2px', border: '2px solid var(--primary)' }}
          />
          <div>
            <span className="badge badge-college" style={{ marginBottom: '0.25rem' }}>
              MGMCET NOIDA SEC-62 CAMPUS
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              Report an Item on Campus
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
              Upload a clear photo and location details so students can identify and claim it.
            </p>
          </div>
        </div>

        {/* Type Toggle: FOUND vs LOST */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => setItemType('found')}
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: itemType === 'found' ? '2px solid var(--found-color)' : '1px solid #cbd5e1',
              background: itemType === 'found' ? 'var(--found-bg)' : '#ffffff',
              color: itemType === 'found' ? 'var(--found-color)' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--found-color)' }} />
            <span>I Found an Item</span>
          </button>

          <button
            type="button"
            onClick={() => setItemType('lost')}
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: itemType === 'lost' ? '2px solid var(--lost-color)' : '1px solid #cbd5e1',
              background: itemType === 'lost' ? 'var(--lost-bg)' : '#ffffff',
              color: itemType === 'lost' ? 'var(--lost-color)' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--lost-color)' }} />
            <span>I Lost an Item (SOS)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--lost-bg)',
              border: '1px solid var(--lost-border)',
              padding: '0.6rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--lost-color)',
              fontSize: '0.82rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Photo Upload Section */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Upload Photo of Item
            </label>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr',
              gap: '1rem',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px dashed #a7f3d0',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem'
            }}>
              {/* Preview Box */}
              <div style={{
                width: '140px',
                height: '110px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                background: '#e2e8f0',
                border: '1px solid #cbd5e1',
                position: 'relative'
              }}>
                <img
                  src={imagePreview}
                  alt="Item Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Upload Controls & Presets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.9rem',
                  background: 'var(--primary-soft)',
                  border: '1px solid var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--primary-dark)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: 'fit-content'
                }}>
                  <Upload size={16} />
                  <span>Choose Image File...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ display: 'none' }}
                  />
                </label>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.3rem' }}>
                    Or pick a quick campus item preset:
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {PRESET_PHOTOS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setImagePreview(p.url);
                          setImageUrl(p.url);
                        }}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          border: imagePreview === p.url ? '1px solid var(--primary)' : '1px solid #cbd5e1',
                          background: imagePreview === p.url ? '#ecfdf5' : '#ffffff',
                          color: imagePreview === p.url ? 'var(--primary-dark)' : '#475569',
                          fontWeight: imagePreview === p.url ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Item Name / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Casio fx-991EX Calculator / Blue College Lanyard / HP Charger"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Category & Location Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Item Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Campus Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Specific Room / Spot note */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
              Specific spot on campus (optional detail):
            </label>
            <input
              type="text"
              placeholder="e.g. 3rd bench from entrance, near water cooler, room 302"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Date & Time Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Date {itemType === 'found' ? 'Found' : 'Lost'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Approx Time
              </label>
              <input
                type="text"
                placeholder="e.g. 11:30 AM / 1:15 PM lunch"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Item Description & Appearance
            </label>
            <textarea
              rows={3}
              placeholder="Describe color, brand, condition, and where you placed it for safekeeping..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.88rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Anti-fraud Secret Verification Question */}
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-dark)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.3rem' }}>
              <ShieldAlert size={16} />
              <span>Fraud Protection Hint (Hidden Verification)</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#475569', marginBottom: '0.45rem' }}>
              What question will you ask the claiming student in chat to verify true ownership? (e.g. "Tell me the keychain text", "What sticker is on the back?").
            </p>
            <input
              type="text"
              placeholder="e.g. Ask them to verify wallpaper, scratch location, or ID number"
              value={secretHint}
              onChange={(e) => setSecretHint(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '0.9rem',
              fontSize: '0.96rem',
              fontWeight: 700,
              marginTop: '0.4rem'
            }}
          >
            <Sparkles size={18} />
            <span>Publish {itemType === 'found' ? 'Found' : 'Lost'} Item Report</span>
          </button>
        </form>
      </div>
    </div>
  );
};
