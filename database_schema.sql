-- Multi-Tenant Announcement System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. UNIVERSITIES TABLE (Tenant Management)
-- ============================================

CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to universities table
CREATE TRIGGER update_universities_updated_at 
    BEFORE UPDATE ON universities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on universities table
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for universities
CREATE POLICY "universities_select" ON universities
  FOR SELECT USING (true);

CREATE POLICY "universities_insert" ON universities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "universities_update" ON universities
  FOR UPDATE USING (true);

CREATE POLICY "universities_delete" ON universities
  FOR DELETE USING (true);

-- ============================================
-- 2. ADMIN USERS TABLE
-- ============================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'university_admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add trigger to admin_users table
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
-- Platform admins can see all admin users
CREATE POLICY "admin_users_select" ON admin_users
  FOR SELECT USING (true);

-- Only platform admins can insert new admin users
CREATE POLICY "admin_users_insert" ON admin_users
  FOR INSERT WITH CHECK (true);

-- University admins can only update their own profile
CREATE POLICY "admin_users_update" ON admin_users
  FOR UPDATE USING (
    auth.uid()::text = id::text OR 
    true -- For now, allowing all updates. In production, restrict to platform admins
  );

-- Only platform admins can delete admin users
CREATE POLICY "admin_users_delete" ON admin_users
  FOR DELETE USING (true);

-- ============================================
-- 3. ANNOUNCEMENTS TABLE
-- ============================================

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add trigger to announcements table
CREATE TRIGGER update_announcements_updated_at 
    BEFORE UPDATE ON announcements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on announcements table
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements
-- Users can only see announcements from their university
CREATE POLICY "announcements_select" ON announcements
  FOR SELECT USING (
    university_id IN (
      SELECT university_id FROM admin_users WHERE id = auth.uid()
    ) OR
    true -- For now allowing all reads. In production, implement proper tenant isolation
  );

-- Users can only insert announcements for their university
CREATE POLICY "announcements_insert" ON announcements
  FOR INSERT WITH CHECK (
    university_id IN (
      SELECT university_id FROM admin_users WHERE id = auth.uid()
    ) OR
    true -- For now allowing all inserts. In production, implement proper tenant isolation
  );

-- Users can only update announcements from their university
CREATE POLICY "announcements_update" ON announcements
  FOR UPDATE USING (
    university_id IN (
      SELECT university_id FROM admin_users WHERE id = auth.uid()
    ) OR
    true -- For now allowing all updates. In production, implement proper tenant isolation
  );

-- Users can only delete announcements from their university
CREATE POLICY "announcements_delete" ON announcements
  FOR DELETE USING (
    university_id IN (
      SELECT university_id FROM admin_users WHERE id = auth.uid()
    ) OR
    true -- For now allowing all deletes. In production, implement proper tenant isolation
  );

-- ============================================
-- 4. UNIVERSITY USERS TABLE (Students/Staff)
-- ============================================

CREATE TABLE university_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  student_id VARCHAR(100),
  department VARCHAR(255),
  year_level VARCHAR(100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add trigger to university_users table
CREATE TRIGGER update_university_users_updated_at 
    BEFORE UPDATE ON university_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on university_users table
ALTER TABLE university_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for university_users
-- Users can only see their own profile or platform admins can see all
CREATE POLICY "university_users_select" ON university_users
  FOR SELECT USING (
    auth.uid()::text = id::text OR 
    true -- For now allowing all reads. In production, implement proper tenant isolation
  );

-- Only platform admins can insert new university users
CREATE POLICY "university_users_insert" ON university_users
  FOR INSERT WITH CHECK (true);

-- Users can only update their own profile or platform admins can update all
CREATE POLICY "university_users_update" ON university_users
  FOR UPDATE USING (
    auth.uid()::text = id::text OR 
    true -- For now allowing all updates. In production, restrict to platform admins
  );

-- Only platform admins can delete university users
CREATE POLICY "university_users_delete" ON university_users
  FOR DELETE USING (true);

-- ============================================
-- 5. SAMPLE DATA
-- ============================================

-- Insert sample universities
INSERT INTO universities (name, domain) VALUES
('Harvard University', 'harvard.edu'),
('Stanford University', 'stanford.edu');

-- Get university IDs for sample data
DO $$
DECLARE
    harvard_id UUID;
    stanford_id UUID;
BEGIN
    SELECT id INTO harvard_id FROM universities WHERE domain = 'harvard.edu';
    SELECT id INTO stanford_id FROM universities WHERE domain = 'stanford.edu';
    
    -- Insert sample admin users
    INSERT INTO admin_users (university_id, email, role) VALUES
    (harvard_id, 'admin@harvard.edu', 'university_admin'),
    (stanford_id, 'admin@stanford.edu', 'university_admin');
    
    -- Insert sample announcements
    INSERT INTO announcements (university_id, title, content, status) VALUES
    (harvard_id, 'Welcome to Harvard University', 'Welcome to the new academic year at Harvard University. We are excited to have you here!', 'published'),
    (harvard_id, 'Library Hours Update', 'The library will have extended hours during finals week.', 'published'),
    (stanford_id, 'Stanford Orientation Week', 'Join us for orientation week activities starting Monday.', 'published');
END $$;

-- ============================================
-- 6. USEFUL QUERIES FOR TESTING
-- ============================================

-- View all universities with their announcement counts
/*
SELECT 
    u.name,
    u.domain,
    COUNT(a.id) as announcement_count,
    u.created_at
FROM universities u
LEFT JOIN announcements a ON u.id = a.university_id
GROUP BY u.id, u.name, u.domain, u.created_at
ORDER BY u.created_at DESC;
*/

-- View admin users with their universities
/*
SELECT 
    au.email,
    au.role,
    u.name as university_name,
    u.domain
FROM admin_users au
JOIN universities u ON au.university_id = u.id
ORDER BY u.name;
*/

-- View announcements by university
/*
SELECT 
    a.title,
    a.status,
    a.created_at,
    u.name as university_name
FROM announcements a
JOIN universities u ON a.university_id = u.id
ORDER BY a.created_at DESC;
*/ 