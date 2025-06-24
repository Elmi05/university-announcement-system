# Multi-Tenant Announcement System - Setup Instructions

## Quick Setup Guide

### 1. Environment Variables

Create a file `frontend/.env` with the following content:

```env
VITE_SUPABASE_URL=https://yhpjxkbyfbjblibmituf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocGp4a2J5ZmJqYmxpYm1pdHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MjgyNzIsImV4cCI6MjA2NjIwNDI3Mn0.c9TjrqBpOgzlvir32wk6qOL4abxGgfvDKxNNlgQIlEM
```

### 2. Database Setup

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: https://supabase.com/dashboard/project/yhpjxkbyfbjblibmituf
3. Go to the **SQL Editor** tab
4. Copy and paste the entire content from `database_schema.sql`
5. Click **Run** to execute the schema

### 3. Install Dependencies and Run

```bash
# Install all dependencies
npm run install:all

# Start the development server
npm run dev
```

### 4. Access the Application

- **Platform Admin Dashboard**: http://localhost:3000/platform-admin/login
- **Test Login**: Use any email/password (authentication is set up but not enforced yet)

## Database Schema Overview

The system uses three main tables:

### 🏛️ **universities**
- `id` (UUID, Primary Key)
- `name` (University name)
- `domain` (University domain, unique)
- `created_at`, `updated_at` (Timestamps)

### 👤 **admin_users**  
- `id` (UUID, Primary Key)
- `university_id` (Foreign Key to universities)
- `email` (Admin email, unique)
- `role` (Admin role, default: 'university_admin')
- `created_at`, `updated_at` (Timestamps)

### 📢 **announcements**
- `id` (UUID, Primary Key)
- `university_id` (Foreign Key to universities)
- `title` (Announcement title)
- `content` (Announcement content)
- `status` (draft/published/archived)
- `created_at`, `updated_at` (Timestamps)

## Features Available

### ✅ **Current Features**
- Platform admin dashboard with navigation
- University registration and management interface
- Clean Material-UI design
- Responsive layout
- Basic CRUD operations (using mock data)
- Search and filtering capabilities

### 🔄 **Database Integration Status**
- ✅ Database schema created
- ✅ RLS policies implemented
- ✅ Sample data inserted
- 🔲 Frontend connected to Supabase (next step)

## Next Steps

1. **Connect Frontend to Database**: Replace mock data with Supabase queries
2. **Authentication Integration**: Implement proper Supabase Auth
3. **University Admin Portal**: Create university-specific dashboards
4. **Real-time Features**: Add live announcement updates

## Troubleshooting

### Environment Variables Not Working
- Ensure the `.env` file is in the `frontend/` directory
- Restart the development server after creating the file
- Check that there are no extra spaces in the environment variables

### Database Connection Issues
- Verify the SQL schema was executed successfully in Supabase
- Check the Supabase project URL is correct
- Ensure RLS policies are enabled

### Development Server Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules frontend/node_modules
npm run install:all

# Start development server
npm run dev
```

## Sample Data Included

The database comes with:
- **Universities**: Harvard University, Stanford University
- **Admin Users**: admin@harvard.edu, admin@stanford.edu  
- **Announcements**: Welcome messages and updates for each university

## Security Notes

- **RLS Policies**: Currently set to allow all operations for development
- **Authentication**: Basic setup, needs proper role-based restrictions
- **Production**: Will need stricter policies and proper user management

---

Your multi-tenant announcement system is now ready for development! 🎉 