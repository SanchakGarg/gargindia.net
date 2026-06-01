-- Run this entire file in Supabase > SQL Editor

-- 1. Tables
CREATE TABLE categories (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE images (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  filename      TEXT NOT NULL,
  storage_path  TEXT NOT NULL,
  url           TEXT NOT NULL,
  width         INTEGER,
  height        INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE settings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Default admin password
INSERT INTO settings (key, value) VALUES ('admin_password', 'garg303030');

-- 3. Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings   ENABLE ROW LEVEL SECURITY;

-- Main site (anon key) can READ categories and images
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read_images"     ON images     FOR SELECT USING (true);
-- settings is NOT readable by anon — service_role bypasses RLS

-- 4. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalogue', 'catalogue', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view images
CREATE POLICY "public_view_catalogue"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'catalogue');

-- Only service_role can upload/delete (admin site uses service_role key)
CREATE POLICY "service_upload_catalogue"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'catalogue');

CREATE POLICY "service_delete_catalogue"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'catalogue');
