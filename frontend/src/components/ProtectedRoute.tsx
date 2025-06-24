import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  userType: 'platform_admin' | 'university_admin' | 'university_user'
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType }) => {
  const { user, userType: currentUserType } = useAuth()

  if (!user) {
    // Redirect to appropriate login page based on expected user type
    if (userType === 'platform_admin') {
      return <Navigate to="/platform/login" replace />
    } else if (userType === 'university_user') {
      return <Navigate to="/university/login" replace />
    } else {
      return <Navigate to="/platform/login" replace />
    }
  }

  if (currentUserType !== userType) {
    // User is logged in but with wrong type - redirect to their appropriate dashboard
    if (currentUserType === 'platform_admin') {
      return <Navigate to="/platform/dashboard" replace />
    } else if (currentUserType === 'university_user') {
      return <Navigate to="/university/dashboard" replace />
    } else {
      return <Navigate to="/platform/login" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute 