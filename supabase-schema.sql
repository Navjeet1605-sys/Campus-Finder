-- 1. Create Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Clean and recreate policies for students
DROP POLICY IF EXISTS "Allow public read students" ON public.students;
CREATE POLICY "Allow public read students" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert students" ON public.students;
CREATE POLICY "Allow public insert students" ON public.students FOR INSERT WITH CHECK (true);


-- 2. Create Messages Table (for chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Clean and recreate policies for messages
DROP POLICY IF EXISTS "Allow public read messages" ON public.messages;
CREATE POLICY "Allow public read messages" ON public.messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert messages" ON public.messages;
CREATE POLICY "Allow public insert messages" ON public.messages FOR INSERT WITH CHECK (true);


-- 3. Create Items Table
CREATE TABLE IF NOT EXISTS public.items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for items
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Clean and recreate policies for items
DROP POLICY IF EXISTS "Allow public read items" ON public.items;
CREATE POLICY "Allow public read items" ON public.items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert items" ON public.items;
CREATE POLICY "Allow public insert items" ON public.items FOR INSERT WITH CHECK (true);


-- -- 4. Setup Realtime for Chat and Items
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.items;


-- 5. Create Storage Bucket for Item Photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('item-photos', 'item-photos', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage Policy for Photos
DROP POLICY IF EXISTS "Public Upload to item-photos" ON storage.objects;
CREATE POLICY "Public Upload to item-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'item-photos');

DROP POLICY IF EXISTS "Public Read item-photos" ON storage.objects;
CREATE POLICY "Public Read item-photos" ON storage.objects FOR SELECT USING (bucket_id = 'item-photos');