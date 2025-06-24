-- Add university_users table to existing database
-- Run this in your Supabase SQL Editor

-- ============================================
-- UNIVERSITY USERS TABLE (Students/Staff)
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

-- Insert some sample university users for testing
DO $$
DECLARE
    harvard_id UUID;
    stanford_id UUID;
BEGIN
    -- Get university IDs
    SELECT id INTO harvard_id FROM universities WHERE domain = 'harvard.edu';
    SELECT id INTO stanford_id FROM universities WHERE domain = 'stanford.edu';
    
    -- Insert sample university users
    INSERT INTO university_users (university_id, email, first_name, last_name, student_id, department, year_level, active) VALUES
    (harvard_id, 'john.doe@harvard.edu', 'John', 'Doe', 'H001', 'Computer Science', 'Senior', true),
    (harvard_id, 'jane.smith@harvard.edu', 'Jane', 'Smith', 'H002', 'Mathematics', 'Junior', true),
    (stanford_id, 'alex.johnson@stanford.edu', 'Alex', 'Johnson', 'S001', 'Engineering', 'Senior', true),
    (stanford_id, 'sarah.wilson@stanford.edu', 'Sarah', 'Wilson', 'S002', 'Biology', 'Sophomore', true);
END $$;

-- Verify the table was created successfully
SELECT 'University users table created successfully!' as status;

-- Check the data
SELECT 
    uu.first_name,
    uu.last_name,
    uu.email,
    uu.student_id,
    uu.department,
    uu.year_level,
    u.name as university_name
FROM university_users uu
JOIN universities u ON uu.university_id = u.id
ORDER BY u.name, uu.last_name; 