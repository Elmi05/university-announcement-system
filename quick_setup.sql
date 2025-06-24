-- Quick Setup Script for Multi-Tenant Announcement System
-- Copy and paste this entire script into Supabase SQL Editor

-- 1. Create universities table
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create admin_users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'university_admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create trigger function for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Add triggers to all tables
CREATE TRIGGER update_universities_updated_at 
    BEFORE UPDATE ON universities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at 
    BEFORE UPDATE ON announcements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies (permissive for development)
CREATE POLICY "universities_all" ON universities FOR ALL USING (true);
CREATE POLICY "admin_users_all" ON admin_users FOR ALL USING (true);
CREATE POLICY "announcements_all" ON announcements FOR ALL USING (true);

-- 8. Insert sample data
INSERT INTO universities (name, domain) VALUES
('Harvard University', 'harvard.edu'),
('Stanford University', 'stanford.edu');

-- 9. Insert sample admin users
WITH university_ids AS (
  SELECT id, domain FROM universities WHERE domain IN ('harvard.edu', 'stanford.edu')
)
INSERT INTO admin_users (university_id, email, role)
SELECT 
  u.id,
  'admin@' || u.domain,
  'university_admin'
FROM university_ids u;

-- 10. Insert sample announcements
WITH university_data AS (
  SELECT id, name FROM universities WHERE domain IN ('harvard.edu', 'stanford.edu')
)
INSERT INTO announcements (university_id, title, content, status)
SELECT 
  u.id,
  'Welcome to ' || u.name,
  'Welcome to the new academic year at ' || u.name || '. We are excited to have you here!',
  'published'
FROM university_data u;

-- Success message
SELECT 'Database setup completed successfully!' as status; 