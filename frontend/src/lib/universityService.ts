import { supabase } from './supabase'

export interface University {
  id: string
  name: string
  domain: string
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  university_id: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  university_id: string
  title: string
  content: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface UniversityWithStats extends University {
  announcements_count: number
  admin_email?: string
}

// University CRUD operations
export const universityService = {
  // Get all universities with statistics
  async getUniversitiesWithStats(): Promise<UniversityWithStats[]> {
    try {
      const { data: universities, error: universitiesError } = await supabase
        .from('universities')
        .select('*')
        .order('created_at', { ascending: false })

      if (universitiesError) throw universitiesError

      // Get announcement counts for each university
      const universitiesWithStats = await Promise.all(
        universities.map(async (university) => {
          // Get announcement count
          const { count: announcementCount } = await supabase
            .from('announcements')
            .select('*', { count: 'exact', head: true })
            .eq('university_id', university.id)

          // Get admin email
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('email')
            .eq('university_id', university.id)
            .single()

          return {
            ...university,
            announcements_count: announcementCount || 0,
            admin_email: adminUser?.email || 'N/A'
          }
        })
      )

      return universitiesWithStats
    } catch (error) {
      console.error('Error fetching universities:', error)
      throw error
    }
  },

  // Create a new university
  async createUniversity(universityData: {
    name: string
    domain: string
    admin_email: string
    admin_password: string
  }): Promise<University> {
    try {
      // First create the university
      const { data: university, error: universityError } = await supabase
        .from('universities')
        .insert({
          name: universityData.name,
          domain: universityData.domain
        })
        .select()
        .single()

      if (universityError) throw universityError

      // Then create the admin user
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          university_id: university.id,
          email: universityData.admin_email,
          role: 'university_admin'
        })

      if (adminError) {
        // If admin creation fails, delete the university
        await supabase.from('universities').delete().eq('id', university.id)
        throw adminError
      }

      return university
    } catch (error) {
      console.error('Error creating university:', error)
      throw error
    }
  },

  // Update a university
  async updateUniversity(id: string, universityData: {
    name: string
    domain: string
    admin_email: string
  }): Promise<University> {
    try {
      // Update university
      const { data: university, error: universityError } = await supabase
        .from('universities')
        .update({
          name: universityData.name,
          domain: universityData.domain
        })
        .eq('id', id)
        .select()
        .single()

      if (universityError) throw universityError

      // Update admin email
      const { error: adminError } = await supabase
        .from('admin_users')
        .update({ email: universityData.admin_email })
        .eq('university_id', id)

      if (adminError) throw adminError

      return university
    } catch (error) {
      console.error('Error updating university:', error)
      throw error
    }
  },

  // Delete a university
  async deleteUniversity(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('universities')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting university:', error)
      throw error
    }
  },

  // Get platform statistics
  async getPlatformStats() {
    try {
      // Get university count
      const { count: universityCount } = await supabase
        .from('universities')
        .select('*', { count: 'exact', head: true })

      // Get total announcements count
      const { count: announcementCount } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })

      // Get university users count
      const { count: universityUserCount } = await supabase
        .from('university_users')
        .select('*', { count: 'exact', head: true })

      // Get universities for calculating growth
      const { data: universities } = await supabase
        .from('universities')
        .select('created_at')
        .order('created_at', { ascending: false })

      // Calculate growth (universities created this month vs last month)
      const now = new Date()
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

      const thisMonthCount = universities?.filter(u => 
        new Date(u.created_at) >= startOfThisMonth
      ).length || 0

      const lastMonthCount = universities?.filter(u => {
        const createdDate = new Date(u.created_at)
        return createdDate >= startOfLastMonth && createdDate < startOfThisMonth
      }).length || 0

      const growthPercentage = lastMonthCount > 0 
        ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
        : 0

      return {
        universityCount: universityCount || 0,
        announcementCount: announcementCount || 0,
        totalStudents: universityUserCount || 0,
        growthPercentage
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error)
      throw error
    }
  },

  // Get recent activity
  async getRecentActivity() {
    try {
      const { data: recentUniversities } = await supabase
        .from('universities')
        .select('name, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentAnnouncements } = await supabase
        .from('announcements')
        .select(`
          title,
          created_at,
          universities(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      return {
        recentUniversities: recentUniversities || [],
        recentAnnouncements: recentAnnouncements || []
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      throw error
    }
  }
} 