import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { universityService, UniversityWithStats } from './universityService'

// Query Keys
export const queryKeys = {
  universities: ['universities'] as const,
  universitiesWithStats: ['universities', 'with-stats'] as const,
  platformStats: ['platform', 'stats'] as const,
  recentActivity: ['platform', 'recent-activity'] as const,
}

// Universities with stats query
export const useUniversitiesWithStats = () => {
  return useQuery({
    queryKey: queryKeys.universitiesWithStats,
    queryFn: universityService.getUniversitiesWithStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Platform stats query
export const usePlatformStats = () => {
  return useQuery({
    queryKey: queryKeys.platformStats,
    queryFn: universityService.getPlatformStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Recent activity query
export const useRecentActivity = () => {
  return useQuery({
    queryKey: queryKeys.recentActivity,
    queryFn: universityService.getRecentActivity,
    staleTime: 1000 * 60 * 3, // 3 minutes
  })
}

// Create university mutation
export const useCreateUniversity = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: universityService.createUniversity,
    onSuccess: () => {
      // Invalidate and refetch universities data
      queryClient.invalidateQueries({ queryKey: queryKeys.universitiesWithStats })
      queryClient.invalidateQueries({ queryKey: queryKeys.platformStats })
      queryClient.invalidateQueries({ queryKey: queryKeys.recentActivity })
      toast.success('University created successfully!')
    },
    onError: (error: any) => {
      console.error('Error creating university:', error)
      toast.error('Failed to create university. Please try again.')
    },
  })
}

// Update university mutation
export const useUpdateUniversity = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; domain: string; admin_email: string } }) =>
      universityService.updateUniversity(id, data),
    onSuccess: (updatedUniversity) => {
      // Update the cache with the new data
      queryClient.setQueryData<UniversityWithStats[]>(
        queryKeys.universitiesWithStats,
        (oldData) => {
          if (!oldData) return []
          return oldData.map((uni) =>
            uni.id === updatedUniversity.id ? { ...uni, ...updatedUniversity } : uni
          )
        }
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.platformStats })
      toast.success('University updated successfully!')
    },
    onError: (error: any) => {
      console.error('Error updating university:', error)
      toast.error('Failed to update university. Please try again.')
    },
  })
}

// Delete university mutation
export const useDeleteUniversity = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: universityService.deleteUniversity,
    onSuccess: (_, deletedId) => {
      // Remove the deleted university from cache
      queryClient.setQueryData<UniversityWithStats[]>(
        queryKeys.universitiesWithStats,
        (oldData) => {
          if (!oldData) return []
          return oldData.filter((uni) => uni.id !== deletedId)
        }
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.platformStats })
      queryClient.invalidateQueries({ queryKey: queryKeys.recentActivity })
      toast.success('University deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Error deleting university:', error)
      toast.error('Failed to delete university. Please try again.')
    },
  })
} 