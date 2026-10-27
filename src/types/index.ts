export type Department = 
  | 'Computer Science & Engineering (CSE)'
  | 'Information Technology (IT)'
  | 'Electronics & Communication (ECE)'
  | 'Mechanical Engineering (ME)'
  | 'Civil Engineering (CE)'
  | 'Artificial Intelligence & ML (AIML)'
  | 'Applied Sciences & Humanities';

export type ItemCategory = 
  | 'Electronics & Gadgets'
  | 'ID Cards & Documents'
  | 'Keys & Keychains'
  | 'Bags & Wallets'
  | 'Books, Notes & Stationery'
  | 'Clothing & Footwear'
  | 'Bottles & Lunchboxes'
  | 'Others';

export type ItemType = 'found' | 'lost';
export type ItemStatus = 'active' | 'claimed' | 'resolved';

export interface User {
  id: string;
  fullName: string;
  collegeEmail: string;
  department: Department;
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  section: string;
  rollNumber: string;
  phoneNumber?: string;
  avatar?: string;
  joinedDate?: string;
  role?: 'student' | 'admin';
}

export interface HandoverRecord {
  handedToName: string;
  handedToRoll: string;
  handedDate: string;
  cabinLocation: string;
  adminNotes?: string;
}

export interface Item {
  id: string;
  title: string;
  category: ItemCategory;
  type: ItemType; // 'found' or 'lost'
  description: string;
  location: string;
  date: string;
  time: string;
  imageUrl: string;
  status: ItemStatus;
  reportedBy: User;
  secretVerificationHint?: string; // e.g. "Ask owner to verify sticker on back"
  adminVerification?: 'verified' | 'pending' | 'flagged';
  handoverDetails?: HandoverRecord;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isProofAttachment?: boolean;
}

export interface ChatThread {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  itemType: ItemType;
  itemLocation: string;
  founderId: string;
  founderName: string;
  claimantId: string;
  claimantName: string;
  messages: ChatMessage[];
  lastUpdated: string;
  unreadCount?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  itemId?: string;
  type: 'chat' | 'claim' | 'system';
}
