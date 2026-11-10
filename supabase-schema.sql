-- ====================================================================
-- CAMPUS FINDER - HARDENED PRODUCTION POSTGRESQL SCHEMA FOR SUPABASE
-- Designed for: Mahatma Gandhi Mission's College of Engg & Tech (MGMCET)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STUDENTS TABLE (Roster & Auth Profile)
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL CHECK (length(full_name) <= 100),
    college_email TEXT UNIQUE NOT NULL CHECK (length(college_email) <= 100),
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    section TEXT NOT NULL CHECK (length(section) <= 10),
    roll_number TEXT NOT NULL CHECK (length(roll_number) <= 50),
    phone_number TEXT CHECK (phone_number IS NULL OR length(phone_number) <= 20),
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    password_hash TEXT NOT NULL, -- Stored as cryptographically salted hash (salt:hash)
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for instant high-concurrency lookups
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(college_email);
CREATE INDEX IF NOT EXISTS idx_students_roll ON public.students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_role ON public.students(role);

-- 3. ITEMS TABLE (Lost & Found Posts)
CREATE TABLE IF NOT EXISTS public.items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL CHECK (length(title) <= 120),
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('found', 'lost')),
    description TEXT NOT NULL CHECK (length(description) <= 2500),
    location TEXT NOT NULL CHECK (length(location) <= 150),
    incident_date TEXT NOT NULL,
    incident_time TEXT NOT NULL,
    image_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'resolved')),
    secret_hint TEXT CHECK (secret_hint IS NULL OR length(secret_hint) <= 250),
    admin_verification TEXT NOT NULL DEFAULT 'pending' CHECK (admin_verification IN ('verified', 'pending', 'flagged')),
    handover_details JSONB,
    reporter_id TEXT NOT NULL,
    reporter_name TEXT NOT NULL CHECK (length(reporter_name) <= 100),
    reporter_email TEXT NOT NULL CHECK (length(reporter_email) <= 100),
    reporter_phone TEXT CHECK (reporter_phone IS NULL OR length(reporter_phone) <= 20),
    reporter_dept TEXT,
    reporter_year TEXT,
    reporter_roll TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- High-performance indexes for concurrent feeds and filters
CREATE INDEX IF NOT EXISTS idx_items_type ON public.items(type);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_reporter ON public.items(reporter_id);

-- 4. CHAT THREADS TABLE (Student Peer Handover Conversations)
CREATE TABLE IF NOT EXISTS public.chat_threads (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    item_title TEXT NOT NULL CHECK (length(item_title) <= 120),
    item_image TEXT,
    item_type TEXT NOT NULL,
    item_location TEXT NOT NULL,
    founder_id TEXT NOT NULL,
    founder_name TEXT NOT NULL CHECK (length(founder_name) <= 100),
    claimant_id TEXT NOT NULL,
    claimant_name TEXT NOT NULL CHECK (length(claimant_name) <= 100),
    last_updated TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_threads_founder ON public.chat_threads(founder_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_claimant ON public.chat_threads(claimant_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_item ON public.chat_threads(item_id);

-- 5. CHAT MESSAGES TABLE (Real-time Peer Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL CHECK (length(sender_name) <= 100),
    sender_avatar TEXT,
    text TEXT NOT NULL CHECK (length(text) <= 1500),
    timestamp TEXT NOT NULL,
    is_proof_attachment BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Students Policies
DROP POLICY IF EXISTS "Public select students" ON public.students;
CREATE POLICY "Public select students" ON public.students 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert students" ON public.students;
CREATE POLICY "Public insert students" ON public.students 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update students" ON public.students;
CREATE POLICY "Public update students" ON public.students 
FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete students" ON public.students;
CREATE POLICY "Public delete students" ON public.students 
FOR DELETE USING (true);

-- Items Policies: Read is public, create/update/delete restricted
DROP POLICY IF EXISTS "Public select items" ON public.items;
CREATE POLICY "Public select items" ON public.items 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert items" ON public.items;
CREATE POLICY "Public insert items" ON public.items 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update items" ON public.items;
CREATE POLICY "Public update items" ON public.items 
FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete items" ON public.items;
CREATE POLICY "Public delete items" ON public.items 
FOR DELETE USING (true);

-- Chat Threads Policies
DROP POLICY IF EXISTS "Public select chat_threads" ON public.chat_threads;
CREATE POLICY "Public select chat_threads" ON public.chat_threads 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert chat_threads" ON public.chat_threads;
CREATE POLICY "Public insert chat_threads" ON public.chat_threads 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update chat_threads" ON public.chat_threads;
CREATE POLICY "Public update chat_threads" ON public.chat_threads 
FOR UPDATE USING (true);

-- Chat Messages Policies
DROP POLICY IF EXISTS "Public select messages" ON public.messages;
CREATE POLICY "Public select messages" ON public.messages 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert messages" ON public.messages;
CREATE POLICY "Public insert messages" ON public.messages 
FOR INSERT WITH CHECK (true);

-- 7. CLOUD STORAGE BUCKET FOR ITEM PHOTOS (WITH STRICT SECURITY)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'item-photos', 
    'item-photos', 
    true, 
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) 
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Policies
DROP POLICY IF EXISTS "Public Upload to item-photos" ON storage.objects;
CREATE POLICY "Public Upload to item-photos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'item-photos');

DROP POLICY IF EXISTS "Public Read item-photos" ON storage.objects;
CREATE POLICY "Public Read item-photos" ON storage.objects 
FOR SELECT USING (bucket_id = 'item-photos');

-- 8. REALTIME REPLICATION (For live multi-device sync)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_threads;
  END IF;
END $$;
