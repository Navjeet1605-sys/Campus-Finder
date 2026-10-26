import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Item, ChatMessage } from '../types';

/**
 * Service to interact with PostgreSQL via Supabase
 * Automatically falls back to localStorage if Supabase credentials are not yet configured in .env
 */

// ========================
// 1. STUDENT AUTH
// ========================
export async function dbRegisterStudent(student: User, passwordPlain: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('students').insert({
        id: student.id,
        full_name: student.fullName,
        college_email: student.collegeEmail.toLowerCase(),
        roll_number: student.rollNumber,
        department: student.department,
        year: student.year,
        section: student.section,
        phone_number: student.phoneNumber || null,
        password_hash: passwordPlain, // In production, hash with bcrypt
        avatar_url: student.avatar
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Local fallback
  const existing = JSON.parse(localStorage.getItem('mgmcet_registered_students') || '[]');
  existing.push(student);
  localStorage.setItem('mgmcet_registered_students', JSON.stringify(existing));
  
  const passwords = JSON.parse(localStorage.getItem('mgmcet_student_passwords') || '{}');
  passwords[student.id] = passwordPlain;
  localStorage.setItem('mgmcet_student_passwords', JSON.stringify(passwords));

  return { success: true };
}

export async function dbLoginStudent(email: string, passwordPlain: string): Promise<{ success: boolean; student?: User; error?: string }> {
  const emailClean = email.trim().toLowerCase();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('college_email', emailClean)
        .single();

      if (error || !data) {
        return { success: false, error: 'No student found with this email. Please register.' };
      }

      if (data.password_hash !== passwordPlain) {
        return { success: false, error: 'Incorrect password.' };
      }

      const student: User = {
        id: data.id,
        fullName: data.full_name,
        collegeEmail: data.college_email,
        department: data.department,
        year: data.year,
        section: data.section,
        rollNumber: data.roll_number,
        phoneNumber: data.phone_number || undefined,
        avatar: data.avatar_url,
        joinedDate: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      };

      return { success: true, student };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Local fallback
  const existing: User[] = JSON.parse(localStorage.getItem('mgmcet_registered_students') || '[]');
  const matched = existing.find(u => u.collegeEmail.toLowerCase() === emailClean);
  if (!matched) {
    return { success: false, error: 'No student account found. Please register.' };
  }

  const passwords = JSON.parse(localStorage.getItem('mgmcet_student_passwords') || '{}');
  if (passwords[matched.id] && passwords[matched.id] !== passwordPlain) {
    return { success: false, error: 'Incorrect password.' };
  }

  return { success: true, student: matched };
}

// ========================
// 2. ITEMS (LOST & FOUND)
// ========================
export async function dbFetchItems(): Promise<Item[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any): Item => ({
        id: row.id,
        title: row.title,
        category: row.category,
        type: row.type,
        description: row.description,
        location: row.location,
        date: row.incident_date,
        time: row.incident_time,
        imageUrl: row.image_url,
        secretVerificationHint: row.secret_hint,
        status: row.status,
        reportedBy: {
          id: row.reporter_id || 'unknown',
          fullName: row.reporter_name,
          collegeEmail: row.reporter_email,
          department: 'Computer Science & Engineering (CSE)',
          year: '3rd Year',
          section: 'A',
          rollNumber: '',
          phoneNumber: row.reporter_phone || undefined,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.reporter_name)}&backgroundColor=a7f3d0,10b981`
        },
        createdAt: row.created_at
      }));
    } catch {
      return [];
    }
  }

  return JSON.parse(localStorage.getItem('mgmcet_items') || '[]');
}

export async function dbCreateItem(item: Item): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('items').insert({
        id: item.id,
        title: item.title,
        category: item.category,
        type: item.type,
        description: item.description,
        location: item.location,
        incident_date: item.date,
        incident_time: item.time,
        image_url: item.imageUrl,
        secret_hint: item.secretVerificationHint,
        status: item.status,
        reporter_id: item.reportedBy.id,
        reporter_name: item.reportedBy.fullName,
        reporter_email: item.reportedBy.collegeEmail,
        reporter_phone: item.reportedBy.phoneNumber || null
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const existing: Item[] = JSON.parse(localStorage.getItem('mgmcet_items') || '[]');
  localStorage.setItem('mgmcet_items', JSON.stringify([item, ...existing]));
  return { success: true };
}

// ========================
// 3. PHOTO UPLOAD TO SUPABASE STORAGE
// ========================
export async function dbUploadItemPhoto(file: File): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `items/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('item-photos')
      .upload(filePath, file);

    if (uploadError) return null;

    const { data } = supabase.storage
      .from('item-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch {
    return null;
  }
}
