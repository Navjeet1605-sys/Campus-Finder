import type { User, Item, ChatThread, AppNotification } from '../types';

export const CAMPUS_LOCATIONS = [
  'Central Library (2nd Floor Reading Hall)',
  'Main Canteen / Cafeteria',
  'Block A - Computer Labs (3rd Floor)',
  'Block A - Lecture Hall 204',
  'Block B - Electronics Lab',
  'Mechanical Workshop & Drawing Hall',
  'College Main Gate & Security Cabin',
  'Admin Block & Dean Office Corridor',
  'College Auditorium & Seminar Hall',
  'Sports Ground / Basketball Court',
  'Parking Area (Near Gate 2)',
  'Girls Common Room (1st Floor)',
  'Boys Common Room'
];

// No fake pre-populated data; all data is user-driven and stored in localStorage
export const INITIAL_USERS: User[] = [];
export const INITIAL_ITEMS: Item[] = [];
export const INITIAL_CHATS: ChatThread[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
